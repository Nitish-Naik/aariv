import { OpenAIToolSet } from "composio-core";
import { Request, Response } from "express";
import { z } from "zod";
import { config } from "../config/env";

const toolset = new OpenAIToolSet({
  apiKey: config.composioApiKey,
});

export const listToolkits = async (req: Request, res: Response) => {
  try {
    const parsed = z
      .object({ userId: z.string().min(3, "Missing userId") })
      .safeParse({ userId: req.query.userId });

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }

    const { userId } = parsed.data;
    const entity = await toolset.client.getEntity(userId);

    // Fetch connected apps
    const connections = await entity.getConnections();
    const connectedApps = connections
      .filter((c: any) => c.status === "ACTIVE" || c.status === "CONNECTED")
      .map((c: any) => c.appName.toLowerCase());

    // Return curated toolkit list with connection status
    const toolkits = [
      {
        id: "1",
        name: "Notion",
        description: "Access pages, databases, and notes.",
        category: "Productivity",
        icon: "document-text",
        connected: connectedApps.some((a) => a.includes("notion")),
        scopes: ["read_content", "write_content"],
      },
      {
        id: "2",
        name: "Google Workspace",
        description: "Gmail, Calendar, Drive sync.",
        category: "Productivity",
        icon: "logo-google",
        connected: connectedApps.some(
          (a) => a.includes("gmail") || a.includes("calendar"),
        ),
        scopes: ["read_profile", "read_content", "write_content"],
      },
      {
        id: "3",
        name: "Linear",
        description: "Issue tracking and project management.",
        category: "Productivity",
        icon: "list-circle",
        isPremium: true,
        connected: connectedApps.some((a) => a.includes("linear")),
        scopes: ["read_content", "write_content"],
      },
      {
        id: "6",
        name: "GitHub",
        description: "Repositories, PRs, and Issues.",
        category: "Development",
        icon: "logo-github",
        connected: connectedApps.some((a) => a.includes("github")),
        scopes: ["read_content", "write_content"],
      },
      {
        id: "11",
        name: "Slack",
        description: "Channel messages and DMs.",
        category: "Communication",
        icon: "logo-slack",
        connected: connectedApps.some((a) => a.includes("slack")),
        scopes: ["read_content", "write_content"],
      },
    ];

    res.json({ toolkits });
  } catch (error: any) {
    console.error("Error listing toolkits:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const getToolkitBundles = async (req: Request, res: Response) => {
  try {
    // Bundles are static for now, but could be personalized based on user tier
    const bundles = [
      {
        id: "bundle_startup",
        title: "Founder Stack",
        description: "Essential tools for running a modern startup.",
        toolkitIds: ["1", "2", "11"],
        savings: "Setup in 1 click",
        icon: "rocket",
      },
      {
        id: "bundle_dev",
        title: "Code & Ship",
        description: "Full development lifecycle automation.",
        toolkitIds: ["6", "3"],
        savings: "Automate CI/CD",
        icon: "code-slash",
      },
    ];

    res.json({ bundles });
  } catch (error: any) {
    console.error("Error fetching bundles:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
