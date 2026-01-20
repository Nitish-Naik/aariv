/**
 * Request tracing middleware for correlation IDs
 * Enables tracking requests across services
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface TracedRequest extends Request {
  id: string;
  startTime: number;
}

/**
 * Generate or extract correlation ID
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: Function) => {
  const tracedReq = req as TracedRequest;
  
  // Try to get correlation ID from header, otherwise generate new one
  tracedReq.id = (req.headers['x-correlation-id'] as string) || uuidv4();
  tracedReq.startTime = Date.now();
  
  // Add to response headers
  res.setHeader('x-correlation-id', tracedReq.id);
  
  // Add to request context for logging
  res.on('finish', () => {
    const duration = Date.now() - tracedReq.startTime;
    console.log(`[${tracedReq.id}] ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

/**
 * Get current correlation ID from request
 */
export const getCorrelationId = (req: Request): string => {
  return (req as TracedRequest).id || 'unknown';
};

/**
 * Context for passing correlation ID through async operations
 */
let currentCorrelationId: string = '';

export const setCorrelationId = (id: string) => {
  currentCorrelationId = id;
};

export const getCurrentCorrelationId = (): string => {
  return currentCorrelationId;
};
