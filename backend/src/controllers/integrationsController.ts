import { OpenAIToolSet } from 'composio-core';
import { Request, Response } from 'express';
import { config } from '../config/env';
import { supabase } from '../config/supabase';

const toolset = new OpenAIToolSet({
    apiKey: config.composioApiKey,
});

export const listIntegrations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    const userIdStr = String(userId);

    // 1. Fetch from Composio (Source of Truth for connection validity)
    const entity = await toolset.client.getEntity(userIdStr);
    const connections = await entity.getConnections();

    // 2. Sync to Supabase Database
    const upsertPromises = connections.map((conn: any) => {
        // Composio returns specific appNames (e.g. 'google-calendar', 'gmail')
        // We map these to our table structure
        return supabase.from('user_integrations').upsert({
            user_id: userIdStr,
            platform: conn.appName,
            status: conn.status,
            connected_at: conn.createdAt ? new Date(conn.createdAt).toISOString() : new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, platform' });
    });

    await Promise.all(upsertPromises);

    // 3. Return combined/db result
    // We can just return the Composio result as it's fresh, 
    // or fetch from DB to be 100% sure what's persisted. 
    // For now, mapping the live Composio data is fastest and accurate.
    const integrations = connections.map((conn: any) => ({
      id: conn.id,
      appName: conn.appName,
      status: conn.status, 
      connectedAt: conn.createdAt,
    }));

    res.json({ integrations });

  } catch (error: any) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: error.message });
  }
};

export const connectIntegration = async (req: Request, res: Response) => {
  try {
    const { userId, appName } = req.body; // e.g., appName = "gmail" or "google-calendar"

    if (!userId || !appName) {
      return res.status(400).json({ error: 'Missing userId or appName' });
    }

    const entity = await toolset.client.getEntity(userId);
    
    // Create a connection request
    // Note: For local dev on Android Emulator, use your machine's LAN IP (e.g. 10.112.50.3)
    // or 'mymobileapp://' if you configured deep linking fully.
    const connection = await entity.initiateConnection({
        appName: appName,
        redirectUri: "http://10.112.50.3:3000/api/callback", 
    });

    if (!connection.redirectUrl) {
         return res.status(500).json({ error: 'Failed to generate connection URL' });
    }

    res.json({ 
        url: connection.redirectUrl,
        // connectionId: connection.id 
    });

  } catch (error: any) {
    console.error('Error initiating connection:', error);
    res.status(500).json({ error: error.message });
  }
};
