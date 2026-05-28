import express from "express";
import {
  analyzeResume,
  getResumeAnalysis,
  postChat,
  generateInterviewQuestions,
  getInterviewQuestionLogs,
} from "../controllers/ai.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/resume-analysis", upload.single("resume"), analyzeResume);
router.get("/resume-analysis", protectRoute, getResumeAnalysis);
router.post("/chat", protectRoute, postChat);

// AI Interview Preparation & Question Generator (no timers, no grading)
router.post("/interview-questions/generate", protectRoute, generateInterviewQuestions);
router.post("/interview-questions", protectRoute, generateInterviewQuestions);
router.get(
  "/interview-questions/logs",
  protectRoute,
  authorizeRoles("recruiter", "admin"),
  getInterviewQuestionLogs
);




export default router;

