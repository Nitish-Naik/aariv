import { Router } from "express";
import { handleWebhook } from "../controllers/triggersController";

const router = Router();

// POST /api/triggers/webhook - Composio webhook receiver
router.post("/webhook", handleWebhook);

export default router;
