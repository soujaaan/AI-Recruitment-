import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { getProfile, saveProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.route("/me").get(isAuthenticated, getProfile);
router.route("/save").post(isAuthenticated, saveProfile);
router.route("/update").put(isAuthenticated, saveProfile); // Mapping put to saveProfile as well since it uses findOneAndUpdate

export default router;
