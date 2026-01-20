import { Request, Response } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting (e.g., express-rate-limit with Redis store)
 */
export const createRateLimiter = (options: {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyGenerator?: (req: Request) => string; // Function to generate rate limit key
}) => {
  const { windowMs, max, keyGenerator = (req) => req.ip || "unknown" } = options;

  return (req: Request, res: Response, next: Function) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or reset if window expired
    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment request count
    store[key].count++;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - store[key].count));
    res.setHeader(
      "X-RateLimit-Reset",
      new Date(store[key].resetTime).toISOString(),
    );

    // Check if limit exceeded
    if (store[key].count > max) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Try again in ${Math.ceil((store[key].resetTime - now) / 1000)} seconds.`,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }

    next();
  };
};

// Predefined rate limiters for different endpoints
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
});

export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 login attempts per hour
});

export const chatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 chat messages per minute
  keyGenerator: (req) => {
    // Rate limit by userId for authenticated endpoints
    const userId = req.body.userId || req.query.userId || req.ip;
    return String(userId);
  },
});

export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 webhook events per minute
});
