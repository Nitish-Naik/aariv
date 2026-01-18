import { OpenAIToolSet } from "composio-core";
import { Request, Response } from "express";
import OpenAI from "openai";
import { config } from "../config/env";

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

const toolset = new OpenAIToolSet({
  apiKey: config.composioApiKey,
});

export const getInbox = async (req: Request, res: Response) => {
  try {
    const { userId, filter } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId query parameter" });
    }

    const userIdStr = String(userId);
    const entity = await toolset.client.getEntity(userIdStr);

    // 1. Check connections
    const connections = await entity.getConnections();
    const activeAppNames = connections
      .filter((c: any) => c.status === "ACTIVE" || c.status === "CONNECTED")
      .map((c: any) => c.appName);

    if (
      !activeAppNames.some(
        (app) => app.includes("gmail") || app.includes("mail"),
      )
    ) {
      // Fallback for demo if no email connected
      return res.json({ messages: [] });
    }

    const tools = await toolset.getTools({ apps: activeAppNames });

    // 2. Prompt for Inbox Fetching
    const filterPrompt =
      filter === "high_priority"
        ? 'Use query "is:unread is:important category:primary" to filter.'
        : 'Use query "is:unread category:primary" to filter.';

    const systemPrompt = `
        You are an AI Email Assistant.
        Current User: ${userIdStr}
        Goal: Fetch the user's latest emails using the Gmail toolkit and format them for a mobile inbox view.

        Strategy:
        1. Use 'GMAIL_FETCH_EMAILS' (or 'GMAIL_LIST_MESSAGES' if fetch is unavailable) to get the last 10-15 threads. ${filterPrompt}
        2. Analyze the snippets provided by the tool.
        3. For each email, identify:
           - Sender Name (clean, from headers if available)
           - Subject
           - A short 1-sentence TL;DR summary (use the snippet).
           - "Priority" status (High if from a real person/boss/urgent, Low if automated/newsletter).
           - "Actionable" status (Is a reply needed? e.g. "Do you have time?", "Please review").

        OUTPUT JSON:
        {
            "messages": [
                {
                    "id": "message_id",
                    "threadId": "thread_id",
                    "sender": "John Doe",
                    "subject": "Project Update",
                    "snippet": "Meeting confirmed for 2pm...",
                    "time": "10:30 AM", // ISO string preferred if avail, else readable
                    "unread": true,
                    "priority": "high",
                    "actionRequired": true,
                    "suggestedAction": "Reply confirming attendance"
                }
            ]
        }
        
        CRITICAL: 
        - DO NOT invent emails. Only use real data from the tools.
        - If the tool returns no emails, return empty array.
        `;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Get my inbox." },
    ];

    let finalResponse = null;

    // Execution Loop
    for (let i = 0; i < 5; i++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        tools,
        tool_choice: "auto",
      });

      const msg = response.choices[0].message;
      messages.push(msg);

      if (msg.tool_calls) {
        const toolOutputs = await toolset.handleToolCall(response, entity.id);
        for (let k = 0; k < msg.tool_calls.length; k++) {
          const toolCall = msg.tool_calls[k];
          const output = toolOutputs[k];

          // Truncate large email bodies
          let contentStr =
            output !== undefined && output !== null
              ? typeof output === "string"
                ? output
                : JSON.stringify(output)
              : "{}";
          if (contentStr.length > 20000) {
            contentStr = contentStr.substring(0, 20000) + "... [Truncated]";
          }

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: contentStr,
          });
        }
      } else {
        finalResponse = msg.content;
        break;
      }
    }

    // Parse JSON
    let jsonRes = { messages: [] };
    try {
      let jsonStr = finalResponse || "";
      const start = jsonStr.indexOf("{");
      const end = jsonStr.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        jsonStr = jsonStr.substring(start, end + 1);
      }
      jsonRes = JSON.parse(jsonStr || '{"messages": []}');
    } catch (e) {
      console.error("Inbox Parse Error", e);
    }

    res.json(jsonRes);
  } catch (error: any) {
    console.error("Inbox Error:", error);
    res.status(500).json({ error: error.message });
  }
};
