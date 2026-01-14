import { Router } from 'express';
import { getBriefing } from '../controllers/dashboardController';

const router = Router();

// GET /api/dashboard/briefing?userId=...
router.get('/briefing', getBriefing);

export default router;
