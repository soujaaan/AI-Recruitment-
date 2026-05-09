import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import {
    startAssessment,
    submitAssessment,
    createQuestion,
    getQuestions,
    deleteQuestion
} from "../controllers/assessment.controller.js";

const router = express.Router();

// Candidate routes
router.route("/start/:jobId").post(isAuthenticated, authorizeRoles("candidate"), startAssessment);
router.route("/submit/:attemptId").post(isAuthenticated, authorizeRoles("candidate"), submitAssessment);

// Admin routes for Question Management
router.route("/questions").get(isAuthenticated, authorizeRoles("admin", "recruiter"), getQuestions);
router.route("/questions").post(isAuthenticated, authorizeRoles("admin", "recruiter"), createQuestion);
router.route("/questions/:id").delete(isAuthenticated, authorizeRoles("admin", "recruiter"), deleteQuestion);

export default router;
