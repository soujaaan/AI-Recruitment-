import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { companyLogoUpload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.route("/register").post(isAuthenticated, authorizeRoles("recruiter", "admin"), companyLogoUpload, registerCompany);
router.route("/get").get(isAuthenticated, authorizeRoles("recruiter", "admin"), getCompany);
router.route("/get/:id").get(isAuthenticated, authorizeRoles("recruiter", "admin"), getCompanyById);
router.route("/update/:id").put(isAuthenticated, authorizeRoles("recruiter", "admin"), companyLogoUpload, updateCompany);

export default router;
