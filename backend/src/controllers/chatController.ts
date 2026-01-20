import { OpenAIToolSet } from 'composio-core';
import { Request, Response } from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../config/env';

const openai = new OpenAI({
    apiKey: config.openaiApiKey,
});

const toolset = new OpenAIToolSet({
    apiKey: config.composioApiKey,
});

export const handleChat = async (req: Request, res: Response) => {
  try {
        const parsed = z.object({
                userId: z.string().min(3, 'Missing userId'),
                message: z.string().min(1, 'Missing message')
        }).safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid payload' });
        }

        const { userId, message } = parsed.data;

    console.log(`Processing chat for user: ${userId}`);

    // 1. Get User Entity
    const entity = await toolset.client.getEntity(userId);

    // 2. Fetch User's Connected Apps (to filter 500+ tools down to just what they use)
    const connections = await entity.getConnections();
    const activeAppNames = connections
        .filter((c: any) => c.status === 'ACTIVE' || c.status === 'CONNECTED') // Verify exact status enum in docs, usually 'ACTIVE'
        .map((c: any) => c.appName); // e.g., ['gmail', 'google-calendar']

    // Optional: Default tools that are always available (like web search if enabled, or math)
    // activeAppNames.push('math'); 

    let tools: any[] = [];
    
    if (activeAppNames.length > 0) {
        // 3. Get Tools only for connected apps
        // Note: activeAppNames might need to be cast to the specific App enum types if using TypeScript strictly 
        // with the SDK's enums, but strings usually work or we fallback to 'gmail', etc.
        tools = await toolset.getTools({ apps: activeAppNames });
    }

    // 4. Call OpenAI with the prompt and tools
    // We start a conversation loop to handle multiple tool calls if needed
    const messages: any[] = [{ role: 'user', content: message }];

    const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo', // or 'gpt-4o' or 'gpt-3.5-turbo'
        messages: messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
    });

    // The handleToolCall method expects the entity ID as a string, not the entity object.
    const result = await toolset.handleToolCall(response, userId);

    // If handleToolCall returns a new response (meaning it executed code/tools and got a result),
    // we might need to send that back to OpenAI to generate the final "human" answer.
    // However, usually toolset.handleToolCall does the execution loop or returns the output.
    // For a simple single-turn implementation:
    
    // In many Composio patterns, we might need a loop if the agent wants to do multi-step actions.
    // For now, let's implement the basic return.

    // If the model wanted to call a tool, `result` typically contains the updated messages history 
    // including the tool output. We should ideally check if we need another completion.
    
    /* 
       Refined pattern:
       1. Get response from OpenAI.
       2. If tool_calls, execute them (via toolset).
       3. Send tool outputs back to OpenAI.
       4. Get final text.
    */
    
    // Let's rely on the raw OpenAI response handling pattern for better control:
    let currentResponse = response;
    let finalContent = currentResponse.choices[0].message.content;
    let responseType = 'text';
    let responseData = null;

    if (currentResponse.choices[0].message.tool_calls) {
         // Execute tool calls
         await toolset.handleToolCall(currentResponse, userId);
         
         // Get details of the primary action to show a card
         const toolCall = currentResponse.choices[0].message.tool_calls[0];
         const functionName = toolCall.function.name;
         const args = JSON.parse(toolCall.function.arguments);

         responseType = 'action_review';
         
         // Map tool to UI Card format
         let icon = 'checkbox'; 
         let title = 'Action Completed';
         
         if (functionName.includes('calendar')) {
             icon = 'calendar';
             title = 'Calendar Event';
         } else if (functionName.includes('gmail') || functionName.includes('mail')) {
             icon = 'mail';
             title = 'Email Action';
         } else if (functionName.includes('slack')) {
             icon = 'logo-slack';
             title = 'Slack Message';
         } else if (functionName.includes('github')) {
             icon = 'logo-github';
             title = 'GitHub Action';
         }

         responseData = {
             status: 'pending', // Pending user acknowledgement
             action: {
                 type: functionName,
                 icon: icon,
                 title: title,
                 details: args 
             }
         };
         
         finalContent = finalContent || "I've successfully executed that action for you.";
    }

    res.json({ 
        role: 'assistant',
        content: finalContent,
        type: responseType,
        data: responseData
    });

  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
