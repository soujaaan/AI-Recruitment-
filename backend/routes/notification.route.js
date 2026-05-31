import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import {
    getNotifications,
    getUnreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createSystemAnnouncement,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Fetch unread count first so it is not caught by /:id param matcher
router.get("/unread-count", isAuthenticated, getUnreadNotificationsCount);

// Fetch all notifications (with filter and pagination options)
router.get("/", isAuthenticated, getNotifications);

// Mark single notification as read
router.patch("/:id/read", isAuthenticated, markNotificationAsRead);

// Mark all notifications as read
router.patch("/read-all", isAuthenticated, markAllNotificationsAsRead);

// Delete single notification
router.delete("/:id", isAuthenticated, deleteNotification);

// Create system wide announcements (Admin only)
router.post(
    "/system-announcement",
    isAuthenticated,
    authorizeRoles("admin"),
    createSystemAnnouncement
);

export default router;
