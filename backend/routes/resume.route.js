import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { parseResume } from "../controllers/resume.controller.js";
import { getProfile, saveProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.route("/parse").post(isAuthenticated, parseResume);
router.route("/me").get(isAuthenticated, getProfile);
router.route("/save").post(isAuthenticated, saveProfile);

export default router;
