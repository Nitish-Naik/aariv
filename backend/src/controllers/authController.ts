import { OpenAIToolSet } from 'composio-core';
import { Request, Response } from 'express';
import { config } from '../config/env';

const toolset = new OpenAIToolSet({
    apiKey: config.composioApiKey,
});

export const syncUser = async (req: Request, res: Response) => {
  try {
    const { userId, email, name } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing userId or email' });
    }

    // 1. Ensure User exists in our DB (Optional if using Supabase Auth mainly)
    // Here we can update metadata or last login logic
    console.log(`Syncing user: ${email} (${userId})`);

    // 2. Initialize Composio Entity
    // We use the Supabase User ID as the Composio Entity ID for consistency
    const entity = await toolset.client.getEntity(userId);
    
    // We can also upsert the connection or check status, 
    // but getEntity creates it if it doesn't exist usually.
    
    // 3. Return success
    res.json({ 
      status: 'success', 
      user: { userId, email }, 
      composioEntityId: entity.id 
    });

  } catch (error: any) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
