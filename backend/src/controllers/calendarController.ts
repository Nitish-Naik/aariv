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

export const getCalendarEvents = async (req: Request, res: Response) => {
    try {
        const { userId, timeMin, timeMax } = req.query;

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

        if (!activeAppNames.some(app => app.includes('calendar'))) {
             // Fallback/Empty if no calendar connected
             return res.json({ events: [] });
        }

        const tools = await toolset.getTools({ apps: activeAppNames });

        // Default to today if no range provided
        const start = timeMin ? String(timeMin) : new Date().toISOString();
        const end = timeMax ? String(timeMax) : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // 2. Prompt for Calendar Fetching
        const systemPrompt = `
        You are an AI Calendar Assistant.
        Current User: ${userIdStr}
        Goal: Fetch the user's calendar events for the specified time range.

        Time Range:
        Start: ${start}
        End: ${end}

        Strategy:
        1. List events from Google Calendar (or connected calendar) for this range.
        2. Format them into a clean JSON list.

        OUTPUT JSON:
        {
            "events": [
                {
                    "id": "event_id",
                    "title": "Meeting with Team",
                    "description": "Discuss project updates",
                    "startTime": "ISO_TIMESTAMP",
                    "endTime": "ISO_TIMESTAMP",
                    "location": "Zoom",
                    "attendees": ["email@example.com"],
                    "color": "#4285F4"
                }
            ]
        }
        `;

        const messages: any[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: "Get my calendar events." }
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
                    
                    let contentStr = output !== undefined && output !== null ? (typeof output === 'string' ? output : JSON.stringify(output)) : "{}";
                    // Truncate to avoid context limit issues
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
        let jsonRes = { events: [] };
        try {
            let jsonStr = finalResponse || '';
            const startIdx = jsonStr.indexOf('{');
            const endIdx = jsonStr.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                jsonStr = jsonStr.substring(startIdx, endIdx + 1);
            }
            jsonRes = JSON.parse(jsonStr || '{"events": []}');
        } catch (e) {
            console.error("Calendar Parse Error", e);
        }

        res.json(jsonRes);

    } catch (error: any) {
        console.error("Calendar Error:", error);
        res.status(500).json({ error: error.message });
    }
};
