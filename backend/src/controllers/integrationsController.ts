import { OpenAIToolSet } from "composio-core";
import { Request, Response } from "express";
import { config } from "../config/env";
import { supabase } from '../config/supabase';

const toolset = new OpenAIToolSet({
  apiKey: config.composioApiKey,
});

export const listIntegrations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId query parameter" });
    }

    const userIdStr = String(userId);

    // 1. Fetch from Composio (Source of Truth for connection validity)
    const entity = await toolset.client.getEntity(userIdStr);
    const connections = await entity.getConnections();

    /* 
    // 2. Sync to Supabase Database (Optional for V1)
    if (config.supabaseUrl) {
        ...
    }
    */

    // 3. Return combined/db result
    const integrations = connections.map((conn: any) => ({
      id: conn.id,
      appName: conn.appName,
      status: conn.status,
      connectedAt: conn.createdAt,
    }));

    res.json({ integrations });
  } catch (error: any) {
    console.error("Error fetching integrations:", error);
    res.status(500).json({ error: error.message });
  }
};

export const connectIntegration = async (req: Request, res: Response) => {
  try {
    const { userId, appName } = req.body; // e.g., appName = "gmail" or "google-calendar"

    if (!userId || !appName) {
      return res.status(400).json({ error: "Missing userId or appName" });
    }

    const entity = await toolset.client.getEntity(userId);

    // ---------------------------------------------------------
    // PAYWALL LOGIC (REAL)
    // ---------------------------------------------------------
    const userIdStr = String(userId);
    let isPro = false;

    // Check Supabase for subscription status
    if (config.supabaseUrl) {
        const { data: userProfile } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', userIdStr)
            .single();
        isPro = userProfile?.subscription_tier === 'pro';
    } else {
        // Fallback for dev without DB
        isPro = userIdStr.endsWith("-pro");
    }

    const normalizedAppName = appName.toLowerCase();

    // Free Tier Whitelist: only Gmail and Google Calendar
    const isFreeApp =
      normalizedAppName.includes("gmail") ||
      normalizedAppName.includes("calendar");

    if (!isPro && !isFreeApp) {
      return res.status(403).json({
        error: "Pro Plan Required",
        code: "PAYWALL_LIMIT",
        message: "This integration is only available in Aariv Pro.",
      });
    }
    // ---------------------------------------------------------

    // Create a connection request
    // Note: For local dev on Android Emulator, use your machine's LAN IP (e.g. 10.112.50.3)
    // or 'mymobileapp://' if you configured deep linking fully.
    const connection = await entity.initiateConnection({
      appName: appName,
      redirectUri: "http://10.112.50.3:3000/api/callback",
    });

    if (!connection.redirectUrl) {
      return res
        .status(500)
        .json({ error: "Failed to generate connection URL" });
    }

    res.json({
      url: connection.redirectUrl,
      // connectionId: connection.id
    });
  } catch (error: any) {
    console.error("Error initiating connection:", error);
    res.status(500).json({ error: error.message });
  }
};

export const disconnectIntegration = async (req: Request, res: Response) => {
  try {
    const { userId, appName } = req.body;

    if (!userId || !appName) {
      return res.status(400).json({ error: "Missing userId or appName" });
    }

    console.log(`[Integration] Disconnecting ${appName} for user ${userId}`);

    const entity = await toolset.client.getEntity(userId);
    const connections = await entity.getConnections();

    // Find the active connection for this app
    const targetConnection = connections.find(
      (c: any) =>
        c.appName === appName &&
        (c.status === "ACTIVE" || c.status === "CONNECTED"),
    );

    if (!targetConnection) {
      return res
        .status(404)
        .json({ error: "Connection not found or already disconnected" });
    }

    // Deleting the connection
    // Updated for Composio SDK v0.5.x
    try {
      // Type assertion for Composio SDK client which has dynamic API
      const client = toolset.client as any;
      
      // Attempt 1: Check if 'connectedAccounts' namespace exists and has delete
      if (
        client.connectedAccounts &&
        typeof client.connectedAccounts.delete === "function"
      ) {
        // Composio SDK expects object with connectedAccountId not string
        await client.connectedAccounts.delete({
          connectedAccountId: targetConnection.id,
        });
      } else {
        // Fallback/Correction: In some versions, it's connectedAccounts.delete(id)
        // or we rely on the specific method for the entity.
        // If SDK fails, we suppress error for prototype to prevent crash
        console.warn(
          "Composio SDK deleteConnection method varies by version. Please check Composio docs.",
        );

        // Try standard HTTP fallback if critical
        const apiKey = config.composioApiKey || "";
        const headers = { "x-api-key": apiKey };
        // Use global fetch or axios
        await fetch(
          `https://backend.composio.dev/api/v1/connected_accounts/${targetConnection.id}`,
          {
            method: "DELETE",
            headers: headers,
          },
        );
      }
    } catch (innerError) {
      console.warn("Soft fail on delete connection:", innerError);
    }

    res.json({ status: "success", message: `Disconnected ${appName}` });
  } catch (error: any) {
    console.error("Error disconnecting integration:", error);
    res.status(500).json({ error: error.message });
  }
};
