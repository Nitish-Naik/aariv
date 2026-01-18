import express from 'express';
import multer from 'multer';
import { handleVoiceChat } from '../controllers/voiceController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/voice/chat - Upload audio, get audio response
// Cast middleware to 'any' to avoid TypeScript conflicts between root/backend node_modules
router.post('/chat', upload.single('audio') as any, handleVoiceChat);

export default router;