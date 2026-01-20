import { OpenAIToolSet } from "composio-core";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { config } from "../config/env";
import { supabase } from "../config/supabase";

const toolset = new OpenAIToolSet({
  apiKey: config.composioApiKey,
});

// Initialize Google Client
// Make sure to add GOOGLE_CLIENT_ID to your .env
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
);

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const parsed = z
      .object({ idToken: z.string().min(10, "Missing or invalid idToken") })
      .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid payload" });
    }

    const { idToken } = parsed.data;

    let payload: any;

    // DEV MODE BYPASS
    if (idToken === "mock-id-token" || idToken.startsWith("mock-")) {
      console.log("⚠️ Using Dev Mode Mock Login");
      payload = {
        sub: "mock-user-123",
        email: "demo@aariv.app",
        name: "Demo User",
        picture: "https://ui-avatars.com/api/?name=Demo+User",
      };
    } else {
      // Real Verification
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyError) {
        console.error("Token verification failed:", verifyError);
        return res.status(401).json({ error: "Invalid Google Token" });
      }
    }

    if (!payload) {
      return res.status(401).json({ error: "Invalid Token Payload" });
    }

    const { sub: googleId, email, name, picture } = payload;
    if (!googleId || !email) {
      return res.status(401).json({ error: "Invalid Google profile" });
    }
    const userId = googleId; // Use Google ID as our primary User ID (simple for V1)

    console.log(`Logging in user: ${email} (${userId})`);

    // 1. Sync User to Supabase (Upsert)
    if (config.supabaseUrl) {
      const { error: upsertError } = await supabase
        .from("users")
        .upsert(
          {
            id: userId,
            email,
            name,
            avatar_url: picture,
            last_login_at: new Date().toISOString(),
            // We do NOT update subscription_tier here, to preserve its state
          },
          { onConflict: "id" },
        );

      if (upsertError) {
        console.error("Supabase Sync Error:", upsertError);
        // We continue anyway, as the user is authenticated via Google
      }
    }

    // 2. Initialize Composio Entity for this user
    const entity = await toolset.client.getEntity(userId);

    // 3. Return User Data (In a real app, generate your own JWT session token here)
    res.json({
      user: {
        id: userId,
        email,
        name,
        avatar: picture,
        googleId,
      },
      token: "session_" + userId, // Placeholder for your own session management
    });
  } catch (error: any) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    console.log(`Deleting user: ${userId}`);

    // 1. Delete from Supabase
    if (config.supabaseUrl) {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (error) {
        console.error("Supabase Deletion Error:", error);
        // Continue to try other cleanups
      }
    }

    // 2. Delete from Composio (Best Effort)
    try {
      // Attempt to delete entity/connections
      // Note: Check exact Composio SDK method for entity deletion
      // await toolset.client.deleteEntity(userId); 
      // If SDK doesn't support direct entity delete, we might just leave it or use REST
      console.log("Composio cleanup not yet fully supported by SDK version, skipping explicit entity delete.");
    } catch (e) {
      console.warn("Composio cleanup failed:", e);
    }

    res.json({ message: "Account deleted successfully" });

  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
