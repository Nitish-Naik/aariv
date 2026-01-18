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

export const executeAction = async (req: Request, res: Response) => {
  try {
    const { userId, actionType, actionData } = req.body;

    if (!userId || !actionType || !actionData) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const userIdStr = String(userId);

    // ---------------------------------------------------------
    // PAYWALL LOGIC (MOCK)
    // ---------------------------------------------------------
    const isPro = userIdStr.endsWith("-pro");
    if (!isPro && actionType === "DRAFT_REPLY") {
      const errorMsg = "AI Auto-Drafting is a Pro feature.";
      // We return a specific error code so the frontend knows to show the paywall
      return res.status(403).json({
        error: errorMsg,
        code: "PAYWALL_FEATURE",
        message: errorMsg,
      });
    }
    // ---------------------------------------------------------

    const entity = await toolset.client.getEntity(userIdStr);

    // Get relevant tools
    const tools = await toolset.getTools({
      apps: ["gmail", "google_calendar"],
    });

    let systemPrompt = "";
    let initialUserMessage = "";

    if (actionType === "DRAFT_REPLY") {
      // AI Agent to generate and save a draft
      systemPrompt = `
            You are an efficient executive assistant. 
            Your task: Create a DRAFT reply to the provided email thread.
            Context: The user swiped "Approve" on an action item to reply.
            
            Thread ID: ${actionData.threadId}
            Proposed Intent: ${actionData.description || "Polite acknowledgement"}
            
            EXECUTION STEPS:
            1. Use 'GMAIL_LIST_THREADS' or 'GMAIL_GET_THREAD' (if needed) to understand the conversation context.
            2. Compose a professional reply based on the intent.
            3. Use 'GMAIL_CREATE_DRAFT' to save it. 
               - IMPORTANT: Include 'threadId' to ensure it appears in the correct conversation.
               - Set 'to' recipients based on the original thread.
            4. Return a simple success message like "Draft created for [Subject]".
         `;
      initialUserMessage = "Draft this reply.";
    } else if (actionType === "SAVE_DRAFT") {
      // User manually edited the action/draft in the UI and wants to save it to Gmail
      systemPrompt = `
            You are an AI Assistant.
            Task: Create/Update a draft in Gmail.
            
            Thread ID: ${actionData.threadId}
            Recipients: ${actionData.to || "Recover from thread"}
            Subject: ${actionData.title}
            Body Content: "${actionData.description}"
            
            Instructions:
            1. Use 'GMAIL_CREATE_DRAFT'.
            2. Pass the 'threadId' to keep it threaded.
            3. Use constraints: Body="${actionData.description}".
            4. Return success.
         `;
      initialUserMessage = "Save this draft.";
    } else if (actionType === "SEND_EMAIL") {
      // Direct send (if enabled)
      systemPrompt = `
            You are an AI Assistant.
            Task: Send an email immediately.
            
            Thread ID: ${actionData.threadId}
            Body: "${actionData.description}"
            
            Instructions:
            1. Use 'GMAIL_SEND_EMAIL' (or 'GMAIL_REPLY_TO_THREAD').
            2. Ensure correct recipients.
            3. Return success.
         `;
      initialUserMessage = "Send this email.";
    } else if (actionType === "CALENDAR_ACTION") {
      systemPrompt = `
            You are an efficient executive assistant.
            Your task: Manage my calendar based on the user's approval.
            
            Action Data: ${JSON.stringify(actionData)}
            
            1. If the action is to 'Accept' or 'Decline' a meeting, use the appropriate Google Calendar tool.
            2. If the action is to 'Create' an event, use the create event tool.
            3. Verify the details before execution.
         `;
      initialUserMessage = "Execute this calendar action.";
    } else if (actionType === "GENERAL_ACTION") {
      // General purpose tool execution
      systemPrompt = `
            You are a comprehensive Personal Assistant.
            Task: Execute the user's request using ANY available tool.
            
            User Request: "${actionData.description}"
            Context: ${JSON.stringify(actionData.metadata || {})}
            
            Instructions:
            1. Analyze the request.
            2. Choose the best tool from the provided toolset (Gmail, Calendar, etc.).
            3. Execute the action.
            4. Return a summary of what was done.
         `;
      initialUserMessage = "Do this for me.";
    } else {
      return res.status(400).json({ error: "Unknown action type" });
    }

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: initialUserMessage },
    ];

    // Multi-turn execution loop
    let currentMessages = [...messages];
    let finalResult = null;

    for (let i = 0; i < 5; i++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: currentMessages,
        tools,
        tool_choice: "auto",
      });

      const msg = response.choices[0].message;
      currentMessages.push(msg);

      if (msg.tool_calls) {
        const toolOutputs = await toolset.handleToolCall(response, entity.id);

        // Append tool outputs to conversation
        // We map outputs back to the original tool calls
        for (let k = 0; k < msg.tool_calls.length; k++) {
          const toolCall = msg.tool_calls[k];
          // handleToolCall returns the results in the same order
          const outputValue = toolOutputs[k];

          currentMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content:
              typeof outputValue === "string"
                ? outputValue
                : JSON.stringify(outputValue),
          });
        }

        // Continue loop to let the model confirm or do next step
      } else {
        // No more tools, we are done
        finalResult = msg.content;
        break;
      }
    }

    res.json({ status: "success", message: finalResult });
  } catch (error: any) {
    console.error("Action execution failed:", error);
    res.status(500).json({ error: error.message });
  }
};
