import { Router } from 'express';
import { getCalendarEvents } from '../controllers/calendarController';

const router = Router();

// GET /api/calendar
router.get('/', getCalendarEvents);

export default router;
