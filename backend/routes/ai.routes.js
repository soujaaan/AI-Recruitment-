import express from "express";
import { getResumeAnalysis } from "../controllers/ai.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/resume-analysis", protectRoute, getResumeAnalysis);

export default router;
