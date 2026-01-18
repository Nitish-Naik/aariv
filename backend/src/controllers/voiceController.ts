import { OpenAIToolSet } from 'composio-core';
import { Request, Response } from 'express';
import fs from 'fs';
import OpenAI from 'openai';
import { config } from '../config/env';

const openai = new OpenAI({
    apiKey: config.openaiApiKey,
});

const toolset = new OpenAIToolSet({
    apiKey: config.composioApiKey,
});

// Helper to delete temp file
const cleanupFile = (filePath: string) => {
    try {
        fs.unlinkSync(filePath);
    } catch (e) {
        console.error("Failed to delete temp file", e);
    }
};

export const handleVoiceChat = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioFilePath = req.file.path;
    const { userId } = req.body;

    try {
        // 1. Transcribe Audio (STT)
        // whisper-1 is highly accurate
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioFilePath),
            model: "whisper-1",
        });

        const userText = transcription.text;
        console.log(`[Voice] User said: ${userText}`);

        // 2. Process Intent (Agentic)
        // We reuse the toolset context if userId allows
        const userIdStr = String(userId || 'default');

        // Simple chat completion for now, but could be tool-enabled
        // Let's give it basic tools like Dashboard Briefing or Calendar to make it "Smart"
        let responseText = "I heard you, but I'm not connected to tools yet.";

        // Use tools if we have a user
        if (userId) {
            const entity = await toolset.client.getEntity(userIdStr);
            const tools = await toolset.getTools({ apps: ['google_calendar', 'gmail'] }); // Add common voice apps

            const messages: any[] = [
                {
                    role: 'system',
                    content: `You are Aariv, a helpful voice assistant. Keep answers concise (spoken output). 
                     If the user asks to do something, use tools. 
                     Current Date: ${new Date().toISOString()}`
                },
                { role: 'user', content: userText }
            ];

            const runner = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages,
                tools,
                tool_choice: 'auto'
            });

            const msg = runner.choices[0].message;

            if (msg.tool_calls) {
                const toolOutputs = await toolset.handleToolCall(runner, entity.id);
                // We don't loop here for voice speed, just single turn + summary often suffices, 
                // but let's do one follow-up for the final text.
                messages.push(msg);
                for (let i = 0; i < msg.tool_calls.length; i++) {
                    const toolCall = msg.tool_calls[i];
                    const output = toolOutputs[i];
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: output !== undefined && output !== null ? (typeof output === 'string' ? output : JSON.stringify(output)) : "{}"
                    });
                }

                const finalRes = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages
                });
                responseText = finalRes.choices[0].message.content || "Done.";
            } else {
                responseText = msg.content || "I didn't catch that.";
            }
        } else {
            // Fallback no-user/no-tools
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: "You are Aariv. Respond concisely." },
                    { role: 'user', content: userText }
                ]
            });
            responseText = completion.choices[0].message.content || "";
        }

        // 3. Generate Audio (TTS)
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: responseText,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        const audioBase64 = buffer.toString('base64');

        // Cleanup
        cleanupFile(audioFilePath);

        res.json({
            transcript: userText,
            replyText: responseText,
            audioBase64
        });

    } catch (error: any) {
        cleanupFile(audioFilePath);
        console.error("Voice processing failed", error);
        res.status(500).json({ error: error.message });
    }
};
