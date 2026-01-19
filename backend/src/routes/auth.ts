import { Router } from "express";
import { deleteUser, googleLogin } from "../controllers/authController";

const router = Router();

// Route: POST /api/auth/google
router.post("/google", googleLogin);

// Route: DELETE /api/auth/delete
router.delete("/delete", deleteUser);

export default router;
