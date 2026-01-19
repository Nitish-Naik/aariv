import cors from "cors";
import express, { Request, Response } from "express";
import { config } from "./config/env";
import actionRoutes from "./routes/actions";
import authRoutes from "./routes/auth";
import calendarRoutes from "./routes/calendar";
import chatRoutes from "./routes/chat";
import dashboardRoutes from "./routes/dashboard";
import inboxRoutes from "./routes/inbox";
import integrationRoutes from "./routes/integrations";
import knowledgeRoutes from "./routes/knowledge";
import voiceRoutes from "./routes/voice";
import webhookRoutes from "./routes/webhooks";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/chat", chatRoutes);
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
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "aariv-backend",
  });
});

// Start Server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
