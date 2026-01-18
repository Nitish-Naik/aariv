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

export const getInbox = async (req: Request, res: Response) => {
    try {
        const { userId, filter } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId query parameter' });
        }

        const userIdStr = String(userId);
        const entity = await toolset.client.getEntity(userIdStr);
        
        // 1. Check connections
        const connections = await entity.getConnections();
        const activeAppNames = connections
            .filter((c: any) => c.status === 'ACTIVE' || c.status === 'CONNECTED')
            .map((c: any) => c.appName);

        if (!activeAppNames.some(app => app.includes('gmail') || app.includes('mail'))) {
             // Fallback for demo if no email connected
             return res.json({ messages: [] });
        }

        const tools = await toolset.getTools({ apps: activeAppNames });

        // 2. Prompt for Inbox Fetching
        const filterPrompt = filter === 'high_priority' 
            ? 'Focus strictly on "Important" or "Category:Primary" emails. Ignore promotions.' 
            : 'Fetch latest emails.';

        const systemPrompt = `
        You are an AI Email Assistant.
        Current User: ${userIdStr}
        Goal: Fetch the user's latest emails and format them for a mobile inbox view.

        Strategy:
        1. List emails from Gmail (last 15). ${filterPrompt}
        2. For each email, identify:
           - Sender Name (clean)
           - Subject
           - A short 1-sentence TL;DR summary of the content (read snippet).
           - "Priority" status (High if from a human/boss/urgent, Low if newsletter).
           - "Actionable" status (Is a reply needed?).

        OUTPUT JSON:
        {
            "messages": [
                {
                    "id": "message_id",
                    "threadId": "thread_id",
                    "sender": "John Doe",
                    "subject": "Project Update",
                    "snippet": "Meeting confirmed for 2pm...",
                    "time": "10:30 AM",
                    "unread": true,
                    "priority": "high",
                    "actionRequired": true,
                    "suggestedAction": "Reply confirming attendance"
                }
            ]
        }
        `;

        const messages: any[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: "Get my inbox." }
        ];

        let finalResponse = null;

        // Execution Loop
        for (let i = 0; i < 5; i++) {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages,
                tools,
                tool_choice: 'auto'
            });

            const msg = response.choices[0].message;
            messages.push(msg);

            if (msg.tool_calls) {
                const toolOutputs = await toolset.handleToolCall(response, entity.id);
                for (let k = 0; k < msg.tool_calls.length; k++) {
                    const toolCall = msg.tool_calls[k];
                    const output = toolOutputs[k];
                    
                    // Truncate large email bodies
                    let contentStr = output !== undefined && output !== null ? (typeof output === 'string' ? output : JSON.stringify(output)) : "{}";
                    if (contentStr.length > 20000) {
                        contentStr = contentStr.substring(0, 20000) + "... [Truncated]";
                    }

                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: contentStr
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
            let jsonStr = finalResponse || '';
            const start = jsonStr.indexOf('{');
            const end = jsonStr.lastIndexOf('}');
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
