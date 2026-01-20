import { Router } from "express";
import { getToolkitBundles, listToolkits } from "../controllers/toolkitsController";

const router = Router();

// GET /api/toolkits?userId=...
router.get("/", listToolkits);

// GET /api/toolkits/bundles
router.get("/bundles", getToolkitBundles);

export default router;
