import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { getCandidateProfile } from "../controllers/candidate.controller.js";

const router = express.Router();

router.route("/:candidateId").get(
    isAuthenticated, 
    authorizeRoles("recruiter", "admin"), 
    getCandidateProfile
);

export default router;
