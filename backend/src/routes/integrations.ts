import { Router } from 'express';
import { connectIntegration, listIntegrations } from '../controllers/integrationsController';

const router = Router();

// GET /api/integrations?userId=...
router.get('/', listIntegrations);

// POST /api/integrations/connect
router.post('/connect', connectIntegration);

export default router;
