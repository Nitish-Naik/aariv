import { OpenAIToolSet } from "composio-core";
import { Request, Response } from "express";
import { config } from "../config/env";

const toolset = new OpenAIToolSet({
  apiKey: config.composioApiKey,
});

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log(
      "[Webhook] Received Composio event:",
      JSON.stringify(payload, null, 2),
    );

    // Basic verification (verify x-composio-signature if possible, but keeping it simple for prototype)

    // Handle specific event types
    // Example payload structure: { "trigger_name": "GMAIL_NEW_MESSAGE", "payload": { ... } }

    const triggerName = payload.trigger_name;

    if (triggerName === "GMAIL_NEW_MESSAGE") {
      const messageId = payload.payload?.id;
      console.log(`[Trigger] New Email detected! ID: ${messageId}`);

      // TODO: Trigger an AI analysis of this new email
      // await internalQueue.add('analyze_email', { messageId });
    }

    res.json({ status: "received" });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: error.message });
  }
};
