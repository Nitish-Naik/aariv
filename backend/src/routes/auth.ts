import { Router } from "express";
import { googleLogin } from "../controllers/authController";

const router = Router();

// Route: POST /api/auth/google
router.post("/google", googleLogin);

export default router;
