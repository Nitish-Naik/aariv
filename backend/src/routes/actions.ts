import { Router } from 'express';
import { executeAction } from '../controllers/actionController';

const router = Router();

// POST /api/actions/execute
router.post('/execute', executeAction);

export default router;
