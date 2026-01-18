import { Router } from "express";
import { handleWebhook } from "../controllers/triggersController";

const router = Router();

// POST /api/webhooks/composio
router.post("/composio", handleWebhook);

export default router;
