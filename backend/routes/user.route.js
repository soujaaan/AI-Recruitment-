import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { profilePhotoUpload } from "../middlewares/upload.middleware.js";
import {
    deleteUser,
    getCurrentUser,
    getUsers,
    login,
    logout,
    register,
    updateProfile,
    updateUserRole,
} from "../controllers/user.controller.js";
import {
    validateLogin,
    validateRegistration,
    validateRoleUpdate,
    validateObjectIdParam,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

router.route("/register").post(profilePhotoUpload, validateRegistration, register);
router.route("/login").post(validateLogin, login);
router.route("/logout").post(isAuthenticated, logout);
router.route("/profile/update").post(isAuthenticated, profilePhotoUpload, updateProfile);
router.route("/me").get(isAuthenticated, getCurrentUser);

router.route("/admin/users").get(isAuthenticated, authorizeRoles("admin"), getUsers);
router.route("/admin/users/:id/role").patch(isAuthenticated, authorizeRoles("admin"), validateObjectIdParam("id"), validateRoleUpdate, updateUserRole);
router.route("/admin/users/:id").delete(isAuthenticated, authorizeRoles("admin"), validateObjectIdParam("id"), deleteUser);

export default router;

