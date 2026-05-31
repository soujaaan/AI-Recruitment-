import { notificationService } from "../services/notification.service.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";

export const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { category, isRead } = req.query;

    const result = await notificationService.getUserNotifications(
        userId,
        { category, isRead },
        { page, limit }
    );

    return sendSuccess(res, 200, result, "Notifications fetched successfully");
});

export const getUnreadNotificationsCount = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const count = await notificationService.getUnreadCount(userId);

    return sendSuccess(res, 200, { count }, "Unread notification count fetched successfully");
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const notificationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Invalid Notification ID format");
    }

    const notification = await notificationService.markAsRead(notificationId, userId);

    return sendSuccess(res, 200, { notification }, "Notification marked as read successfully");
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    await notificationService.markAllAsRead(userId);

    return sendSuccess(res, 200, {}, "All notifications marked as read successfully");
});

export const deleteNotification = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const notificationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new ApiError(400, "Invalid Notification ID format");
    }

    await notificationService.deleteNotification(notificationId, userId);

    return sendSuccess(res, 200, {}, "Notification deleted successfully");
});

export const createSystemAnnouncement = asyncHandler(async (req, res) => {
    const { title, message } = req.body;

    if (!title || !message) {
        throw new ApiError(400, "Title and message are required for announcements");
    }

    // Find all active users on the platform
    const users = await User.find({ isActive: { $ne: false } }).select("_id").lean();

    if (!users || users.length === 0) {
        return sendSuccess(res, 201, { count: 0 }, "No active users found for announcement");
    }

    // Create notifications in background so request returns immediately
    (async () => {
        try {
            for (const user of users) {
                await notificationService.createNotification({
                    recipient: user._id,
                    type: "SYSTEM_ANNOUNCEMENT",
                    title,
                    message,
                    entityType: "System",
                    priority: "high",
                    metadata: {
                        isAnnouncement: true,
                        sentAt: new Date().toISOString()
                    }
                });
            }
        } catch (err) {
            console.error("Failed to broadcast system announcement", err);
        }
    })();

    return sendSuccess(
        res,
        201,
        { count: users.length },
        "System announcement broadcast started successfully"
    );
});
