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

export const getBriefing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    const userIdStr = String(userId);
    const entity = await toolset.client.getEntity(userIdStr);
    
    // 1. Check connections to decide what to fetch
    const connections = await entity.getConnections();
    const activeAppNames = connections
        .filter((c: any) => c.status === 'ACTIVE' || c.status === 'CONNECTED')
        .map((c: any) => c.appName);

    if (activeAppNames.length === 0) {
        return res.json({
            greeting: "Welcome to Aariv",
            summary: "Connect your apps in the 'Connect' tab to get a personalized briefing.",
            counts: { meetings: 0, emails: 0 }
        });
    }

    // 2. Prepare Tools
    const tools = await toolset.getTools({ apps: activeAppNames });

    // 3. Agentic Fetch
    // We ask the LLM to fetch data and assume it will use the tools provided.
    // We force it to return a JSON structure at the end.
    const systemPrompt = `
    You are an intelligent executive assistant. Your goal is to generate a high-quality "Daily Briefing" and identifying actionable items.
    
    Current User Identity: ${userIdStr}

    REQUIRED ACTIONS:
    1. **Calendar**: Fetch events for the next 24 hours. (If specific app is needed, fallback to 'google_calendar')
    2. **Gmail**: Fetch unread emails from the last 24 hours. 
       - USE QUERY: "is:unread newer_than:1d category:primary"
       - FETCH LIMIT: Top 15 emails to ensure coverage.
       - Focus on "important" emails (from humans, not newsletters).

    OUTPUT FORMAT (JSON ONLY):
    {
       "greeting": "Good Morning",
       "summary": "You have [X] meetings today ... You have [Y] unread emails...",
       "counts": {
           "meetings": 0,
           "emails": 0
       },
       "highlights": [
          "Meeting: Project Sync at 10:00 AM",
          "Urgent: Invoice pending from Finance"
       ],
       "actions": [
           {
               "id": "unique_id",
               "title": "Action Title (e.g. Reply to John)",
               "subtitle": "Context (e.g. regarding Q3 report)",
               "type": "email", 
               "priority": "high",
               "data": {
                   "threadId": "gmail_thread_id",
                   "messageId": "gmail_message_id"
               }
           }
       ]
    }
    
    CRITICAL: 
    - Populate 'actions' with 3-5 most important emails that require a reply or action.
    - Preserve the 'threadId' from Gmail so we can reply later.
    `;

    const messages: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Generate my briefing." }
    ];

    // Simple loop for tool execution (max 5 turns to be safe)
    let finalResponse = null;

    for (let i = 0; i < 5; i++) {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // Fast and capable
            messages,
            tools,
            tool_choice: 'auto',
            response_format: { type: "json_object" } // Force JSON in the final answer if possible, but intermediate steps might be calls
        });

        const msg = response.choices[0].message;
        messages.push(msg);

        if (msg.tool_calls) {
            // Execute tools. we Pass the USER ID explicitly to handleToolCall to ensure it executes for the right user
            const toolOutputs = await toolset.handleToolCall(response, entity.id);
            
            // Append tool outputs to history
            // toolOutputs is an array of strings (the results), matching the order of tool_calls
            for (let i = 0; i < msg.tool_calls.length; i++) {
                const toolCall = msg.tool_calls[i];
                const output = toolOutputs[i];
                
                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: typeof output === 'string' ? output : JSON.stringify(output)
                });
            }
        } else {
            // No more tools, this is the final response
            finalResponse = msg.content;
            break;
        }
    }

    if (finalResponse) {
        try {
            const parsed = JSON.parse(finalResponse);
            res.json(parsed);
        } catch (e) {
            // Fallback if model didn't give strict JSON despite instructions
            res.json({
                greeting: "Hello",
                summary: finalResponse,
                counts: { meetings: 0, emails: 0 }
            });
        }
    } else {
        res.status(500).json({ error: "Failed to generate briefing" });
    }

  } catch (error: any) {
    console.error('Error generating briefing:', error);
    res.status(500).json({ error: error.message });
  }
};
