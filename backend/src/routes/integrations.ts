import { Router } from "express";
import {
    connectIntegration,
    disconnectIntegration,
    listIntegrations,
} from "../controllers/integrationsController";

const router = Router();

// GET /api/integrations?userId=...
router.get("/", listIntegrations);

// POST /api/integrations/connect
router.post("/connect", connectIntegration);

// POST /api/integrations/disconnect
router.post("/disconnect", disconnectIntegration);

export default router;
