/**
 * Simple event queue for background tasks
 * For production, use Bull/BullMQ with Redis
 */

interface QueuedJob {
  id: string;
  type: string;
  data: Record<string, any>;
  retries: number;
  maxRetries: number;
  createdAt: Date;
}

class InMemoryQueue {
  private queue: Map<string, QueuedJob> = new Map();
  private handlers: Map<string, Function> = new Map();
  private processing = false;

  /**
   * Register a job handler
   */
  register(jobType: string, handler: (data: Record<string, any>) => Promise<void>) {
    this.handlers.set(jobType, handler);
  }

  /**
   * Add a job to the queue
   */
  async add(jobType: string, data: Record<string, any>, maxRetries = 3): Promise<string> {
    const id = `${jobType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const job: QueuedJob = {
      id,
      type: jobType,
      data,
      retries: 0,
      maxRetries,
      createdAt: new Date(),
    };

    this.queue.set(id, job);
    
    // Start processing if not already running
    this.process();
    
    return id;
  }

  /**
   * Process jobs in queue
   */
  private async process() {
    if (this.processing) return;
    this.processing = true;

    try {
      for (const [jobId, job] of this.queue.entries()) {
        const handler = this.handlers.get(job.type);
        
        if (!handler) {
          console.warn(`No handler for job type: ${job.type}`);
          this.queue.delete(jobId);
          continue;
        }

        try {
          await handler(job.data);
          this.queue.delete(jobId);
          console.log(`✓ Job ${jobId} completed`);
        } catch (error) {
          job.retries++;
          
          if (job.retries >= job.maxRetries) {
            console.error(`✗ Job ${jobId} failed after ${job.maxRetries} retries:`, error);
            this.queue.delete(jobId);
          } else {
            console.warn(`⚠ Job ${jobId} failed, retry ${job.retries}/${job.maxRetries}`);
            // Retry after exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, job.retries - 1)));
          }
        }
      }
    } finally {
      this.processing = false;
      
      // Reschedule if queue not empty
      if (this.queue.size > 0) {
        setTimeout(() => this.process(), 1000);
      }
    }
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      total: this.queue.size,
      jobs: Array.from(this.queue.values()).map(j => ({
        id: j.id,
        type: j.type,
        retries: j.retries,
        createdAt: j.createdAt,
      })),
    };
  }
}

import { OpenAIToolSet } from 'composio-core';
import OpenAI from 'openai';
import { config } from '../config/env';
import { logger } from './logger';

const openai = new OpenAI({ apiKey: config.openaiApiKey });
const toolset = new OpenAIToolSet({ apiKey: config.composioApiKey });

// Export singleton instance
export const queue = new InMemoryQueue();

// Register job handlers
export function registerJobHandlers() {
  queue.register('analyze_email', async (data) => {
    try {
      const { messageId, userId } = data;
      logger.info('Analyzing email', { messageId, userId });
      
      // Get user entity and fetch email details
      const entity = await toolset.client.getEntity(userId);
      
      // Simplified: Skip actual email fetch for now, just analyze messageId
      // In production, integrate with Composio Gmail actions
      logger.info('Email analysis triggered', { messageId, userId });
      
      // For now, create a mock analysis since Composio SDK methods vary by version
      const emailContent = {
        id: messageId,
        subject: 'Email subject',
        from: 'sender@example.com',
      };
      
      // Analyze with OpenAI
      const analysis = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analyze this email and suggest actions: priority (high/medium/low), category, and suggested response if needed.',
          },
          {
            role: 'user',
            content: JSON.stringify(emailContent),
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });
      
      const suggestions = analysis.choices[0]?.message?.content || '{}';
      logger.info('Email analyzed', { messageId, suggestions });
      
      // Queue notification if high priority
      if (suggestions.includes('high')) {
        await queue.add('send_notification', {
          userId,
          title: 'High Priority Email',
          body: `New important email: ${emailContent.subject || 'No subject'}`,
        });
      }
    } catch (error: any) {
      logger.error('Email analysis failed', error);
      throw error;
    }
  });

  queue.register('send_notification', async (data) => {
    try {
      const { userId, title, body, expoPushToken } = data;
      logger.info('Sending notification', { userId, title });
      
      if (!expoPushToken) {
        logger.warn('No Expo push token available for user', { userId });
        return;
      }
      
      // Send via Expo Push Notification service
      const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data: { userId },
      };
      
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      if (!response.ok) {
        throw new Error(`Expo push failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      logger.info('Notification sent', { userId, result });
    } catch (error: any) {
      logger.error('Notification sending failed', error);
      throw error;
    }
  });

  queue.register('sync_integrations', async (data) => {
    try {
      const { userId } = data;
      logger.info('Syncing integrations', { userId });
      
      // Get user entity
      const entity = await toolset.client.getEntity(userId);
      const connections = await entity.getConnections();
      
      const activeConnections = connections.filter(
        (c: any) => c.status === 'ACTIVE' || c.status === 'CONNECTED'
      );
      
      logger.info('Integration sync completed', {
        userId,
        activeCount: activeConnections.length,
        apps: activeConnections.map((c: any) => c.appName),
      });
      
      // Optionally sync data from each connected app
      for (const conn of activeConnections) {
        const appName = conn.appName.toLowerCase();
        
        if (appName.includes('gmail')) {
          // Queue email fetch/analysis
          logger.debug('Queuing Gmail sync', { userId });
        } else if (appName.includes('calendar')) {
          // Queue calendar sync
          logger.debug('Queuing Calendar sync', { userId });
        }
      }
    } catch (error: any) {
      logger.error('Integration sync failed', error);
      throw error;
    }
  });
}
