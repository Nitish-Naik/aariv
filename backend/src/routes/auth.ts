import { Router } from 'express';
import { syncUser } from '../controllers/authController';

const router = Router();

// Route: POST /api/auth/sync
router.post('/sync', syncUser);

export default router;
