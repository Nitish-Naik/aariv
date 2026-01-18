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

export const getKnowledgeGraph = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId query parameter' });
        }

        const userIdStr = String(userId);
        const entity = await toolset.client.getEntity(userIdStr);

        // 1. Check connections to decide what to scan
        const connections = await entity.getConnections();
        const activeAppNames = connections
            .filter((c: any) => c.status === 'ACTIVE' || c.status === 'CONNECTED')
            .map((c: any) => c.appName);

        // Default fake nodes if no apps connected
        if (activeAppNames.length === 0) {
            return res.json({
                nodes: [
                    {
                        id: '0',
                        type: 'preference',
                        label: 'Connect Apps',
                        description: 'Connect Gmail or Calendar to generate a real knowledge graph.',
                        createdAt: new Date().toISOString(),
                        connections: []
                    }
                ]
            });
        }

        // 2. Agentic Extraction
        // We ask the LLM to peek at recent history and extract a graph
        const systemPrompt = `
    You are a "Context Engine". Your goal is to analyze the user's digital footprint and extract a "Knowledge Graph" of their work life.
    
    Current User Identity: ${userIdStr}
    Connected Apps: ${activeAppNames.join(', ')}

    REQUIRED ACTIONS:
    1. Fetch the last 3-5 emails and next 3-5 calendar events to get a sample of behavior.
       - Prefer fetching 'headers' or 'snippets' over full body if the tool allows, to save bandwidth.
    2. Analyze them for:
       - **Patterns**: e.g., "Deep Work from 9-11am", "Replies to emails immediately"
       - **Preferences**: e.g., "Declines meetings on Fridays", "Prefers Zoom over Meet"

       - **Rituals**: e.g., "Weekly Sync on Mondays", "Monthly Review"
    
    OUTPUT FORMAT (JSON ONLY):
    {
       "nodes": [
           {
               "id": "unique_id",
               "type": "pattern" | "preference" | "ritual",
               "label": "Short Title",
               "description": "Evidence-based description.",
               "connections": ["id_of_related_node"] 
           }
       ]
    }
    
    CRITICAL: 
    - Privacy first. Generalize the patterns.
    - Return at least 3-5 interesting nodes.
    `;

        const tools = await toolset.getTools({ apps: activeAppNames });

        const messages: any[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: "Build my knowledge graph." }
        ];

        let finalResponse = null;

        // Multi-turn loop to allow fetching then analyzing
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
                for (let i = 0; i < msg.tool_calls.length; i++) {
                    const toolCall = msg.tool_calls[i];
                    const output = toolOutputs[i];
                    
                    // Truncate output to prevent context window explosion (keep ~15k chars / ~4k tokens)
                    let contentStr = output !== undefined && output !== null ? (typeof output === 'string' ? output : JSON.stringify(output)) : "{}";
                    if (contentStr.length > 15000) {
                        console.log(`[KnowledgeGraph] Truncating tool output from ${contentStr.length} to 15000 chars.`);
                        contentStr = contentStr.substring(0, 15000) + "... [Output Truncated by System]";
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
        try {
            // Robust JSON extraction: Find first '{' and last '}'
            let jsonStr = finalResponse || '';
            const start = jsonStr.indexOf('{');
            const end = jsonStr.lastIndexOf('}');
            
            if (start !== -1 && end !== -1 && end > start) {
                jsonStr = jsonStr.substring(start, end + 1);
            }

            const graphData = JSON.parse(jsonStr || '{}');
            
            // Add timestamps if missing
            const nodes = (graphData.nodes || []).map((n: any) => ({
                ...n,
                createdAt: n.createdAt || new Date().toISOString(),
                expiresAt: n.expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // +90 days
            }));

            res.json({ nodes });

        } catch (e) {
            console.error("Failed to parse knowledge graph JSON", e);
            // Fallback
            res.json({ nodes: [] });
        }

    } catch (error: any) {
        console.error('Knowledge Graph generation failed:', error);
        res.status(500).json({ error: error.message });
    }
};
