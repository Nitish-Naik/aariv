import { Router } from 'express';
import { getInbox } from '../controllers/inboxController';

const router = Router();

// GET /api/inbox
router.get('/', getInbox);

export default router;
