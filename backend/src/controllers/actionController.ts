import { OpenAIToolSet } from 'composio-core';
import { Request, Response } from 'express';
import OpenAI from 'openai';
import { config } from '../config/env';

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
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const userIdStr = String(userId);
    const entity = await toolset.client.getEntity(userIdStr);

    // Get relevant tools
    const tools = await toolset.getTools({ apps: ['gmail', 'google_calendar'] });

    let systemPrompt = "";
    let initialUserMessage = "";

    if (actionType === 'DRAFT_REPLY') {
        // AI Agent to generate and save a draft
         systemPrompt = `
            You are an efficient executive assistant. 
            Your task: specificially create a DRAFT reply to the email provided relative to the thread.
            Context: The user swiped "Approve" on an action item to reply.
            
            Thread ID: ${actionData.threadId}
            
            1. Analyze the context (you might need to fetch the thread first if you don't have enough info, but for this tool call, just Draft a polite, professional, concise acknowledgement or reply).
            2. Use the 'GMAIL_CREATE_EMAIL_DRAFT' tool.
            3. Return a success message.
         `;
         initialUserMessage = "Draft a reply for me.";

    } else if (actionType === 'SAVE_DRAFT') {
        // User manually edited the action/draft
         systemPrompt = `
            You are an AI Assistant.
            Task: Create a draft reply in Gmail using EXACTLY the text provided by the user. Do not change the meaning.
            
            Message ID: ${actionData.id}
            Subject: ${actionData.title}
            Body Content: "${actionData.description}"
            
            Instructions:
            - Create a draft reply to message ${actionData.id}.
            - Set the body to the provided Body Content.
            - Return success.
         `;
         initialUserMessage = "Save this draft.";

    } else if (actionType === 'CALENDAR_ACTION') {
         systemPrompt = `
            You are an efficient executive assistant.
            Your task: Manage my calendar based on the user's approval.
            
            Action Data: ${JSON.stringify(actionData)}
            
            1. If the action is to 'Accept' or 'Decline' a meeting, use the appropriate Google Calendar tool.
            2. If the action is to 'Create' an event, use the create event tool.
            3. Verify the details before execution.
         `;
         initialUserMessage = "Execute this calendar action.";
    } else {
        return res.status(400).json({ error: 'Unknown action type' });
    }

    const messages: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: initialUserMessage }
    ];

    // Multi-turn execution loop
         let currentMessages = [...messages];
         let finalResult = null;

         for (let i = 0; i < 5; i++) {
             const response = await openai.chat.completions.create({
                 model: 'gpt-4o',
                 messages: currentMessages,
                 tools,
                 tool_choice: 'auto'
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
                         role: 'tool',
                         tool_call_id: toolCall.id,
                         content: typeof outputValue === 'string' ? outputValue : JSON.stringify(outputValue)
                     });
                 }

                 // Continue loop to let the model confirm or do next step
             } else {
                 // No more tools, we are done
                 finalResult = msg.content;
                 break;
             }
         }
         
         res.json({ status: 'success', message: finalResult });


  } catch (error: any) {
    console.error('Action execution failed:', error);
    res.status(500).json({ error: error.message });
  }
};