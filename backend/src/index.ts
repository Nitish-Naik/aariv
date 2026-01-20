import cors from "cors";
import express, { Request, Response } from "express";
import { config } from "./config/env";
import { logger } from "./utils/logger";
import { registerJobHandlers } from "./utils/queue";
import { apiRateLimiter, authRateLimiter, chatRateLimiter, webhookRateLimiter } from "./middleware/rateLimiter";
import actionRoutes from "./routes/actions";
import authRoutes from "./routes/auth";
import calendarRoutes from "./routes/calendar";
import chatRoutes from "./routes/chat";
import dashboardRoutes from "./routes/dashboard";
import inboxRoutes from "./routes/inbox";
import integrationRoutes from "./routes/integrations";
import knowledgeRoutes from "./routes/knowledge";
import toolkitsRoutes from "./routes/toolkits";
import triggersRoutes from "./routes/triggers";
import voiceRoutes from "./routes/voice";
import webhookRoutes from "./routes/webhooks";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req.method, req.path, res.statusCode, duration);
  });
  next();
});

// Apply rate limiting to all API routes
app.use("/api", apiRateLimiter);

// Register background job handlers
registerJobHandlers();

// Routes
app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/toolkits", toolkitsRoutes);
app.use("/api/chat", chatRateLimiter, chatRoutes);
app.use("/api/triggers", webhookRateLimiter, triggersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inbox", inboxRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/actions", actionRoutes);

app.use("/api/voice", voiceRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/webhooks", webhookRoutes);

// Callback Route for Composio/OAuth
app.get("/api/callback", (req: Request, res: Response) => {
  const { status, connectedAccountId } = req.query;

  // Redirect back to the app with the status and ID
  // This allows the app to know the integration was successful
  const deepLink = `aariv://?status=${status}&connectedAccountId=${connectedAccountId}`;

  console.log(`Redirecting to: ${deepLink}`);
  res.redirect(deepLink);
});

// Health Check Route
app.get("/api/health", (req: Request, res: Response) => {
  const healthcheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "aariv-backend",
    version: "1.0.0",
    uptime: process.uptime(),
    environment: config.nodeEnv,
    checks: {
      openai: !!config.openaiApiKey,
      composio: !!config.composioApiKey,
      supabase: !!config.supabaseUrl,
    },
  };
  
  res.status(200).json(healthcheck);
});

// Start Server
const PORT = config.port;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📦 Environment: ${config.nodeEnv}`);
  logger.info(`🔑 OpenAI: ${config.openaiApiKey ? '✓' : '✗'}`);
  logger.info(`🔑 Composio: ${config.composioApiKey ? '✓' : '✗'}`);
  logger.info(`💾 Supabase: ${config.supabaseUrl ? '✓' : '✗'}`);
  logger.info(`📚 API Docs: http://localhost:${PORT}/api/docs`);
});

// Export app for testing
export default app;

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
