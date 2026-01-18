import { Router } from 'express';
import { getKnowledgeGraph } from '../controllers/knowledgeController';

const router = Router();

// GET /api/knowledge/graph?userId=...
router.get('/graph', getKnowledgeGraph);

export default router;
