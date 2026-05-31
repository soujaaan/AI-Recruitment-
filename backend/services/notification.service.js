import { Notification } from "../models/notification.model.js";
import { getIo } from "../socket/chat.socket.js";
import { logger } from "../utils/logger.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";

export const notificationService = {
    /**
     * Create a new notification and optionally push via Socket.io
     * @param {Object} data - Notification fields
     * @returns {Promise<Object>} The created notification
     */
    async createNotification(data) {
        const { recipient, type, title, message, entityType, entityId, priority, metadata } = data;

        if (!recipient) {
            throw new ApiError(400, "Recipient is required for creating a notification");
        }
        if (!mongoose.Types.ObjectId.isValid(recipient)) {
            throw new ApiError(400, "Invalid Recipient ID");
        }

        const notification = await Notification.create({
            recipient,
            type,
            title,
            message,
            entityType,
            entityId,
            priority: priority || "medium",
            metadata: metadata || {},
        });

        // Try sending live update via socket.io
        try {
            const io = getIo();
            if (io) {
                logger.info(`Emitting real-time notification to user room: ${recipient}`);
                io.to(recipient.toString()).emit("new_notification", notification);
            }
        } catch (socketError) {
            logger.warn("Failed to emit socket notification", { error: socketError?.message });
        }

        return notification;
    },

    /**
     * Fetch all notifications for a specific user with filters, sorting, and pagination
     * @param {string} userId - ID of the user
     * @param {Object} filters - Filter criteria
     * @param {Object} pagination - Page & limit specifications
     * @returns {Promise<Object>} Notifications list and metadata
     */
    async getUserNotifications(userId, filters = {}, pagination = {}) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const query = { recipient: userId };

        // Handle Read/Unread filters
        if (filters.isRead !== undefined) {
            query.isRead = filters.isRead === true || filters.isRead === "true";
        }

        // Handle Type filters
        if (filters.category) {
            const category = String(filters.category).toLowerCase();
            if (category === "unread") {
                query.isRead = false;
            } else if (category === "interview") {
                query.type = { $in: ["INTERVIEW_SCHEDULED", "INTERVIEW_UPDATED", "INTERVIEW_CANCELLED"] };
            } else if (category === "applications") {
                query.type = { $in: ["NEW_APPLICATION", "APPLICATION_SHORTLISTED", "APPLICATION_REJECTED"] };
            } else if (category === "system") {
                query.type = { $in: ["SYSTEM_ANNOUNCEMENT", "ADMIN_ALERT"] };
            }
        }

        const totalNotifications = await Notification.countDocuments(query);
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return {
            notifications,
            pagination: {
                total: totalNotifications,
                page,
                limit,
                pages: Math.ceil(totalNotifications / limit),
            },
        };
    },

    /**
     * Count unread notifications for a user
     * @param {string} userId - User identifier
     * @returns {Promise<number>} Number of unread notifications
     */
    async getUnreadCount(userId) {
        return await Notification.countDocuments({ recipient: userId, isRead: false });
    },

    /**
     * Mark a specific notification as read
     * @param {string} notificationId - ID of the notification
     * @param {string} userId - Recipient validation ID
     * @returns {Promise<Object>} Updated notification document
     */
    async markAsRead(notificationId, userId) {
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            throw new ApiError(400, "Invalid Notification ID");
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { $set: { isRead: true, readAt: new Date() } },
            { new: true }
        );

        if (!notification) {
            throw new ApiError(404, "Notification not found or unauthorized");
        }

        return notification;
    },

    /**
     * Mark all unread notifications of a user as read
     * @param {string} userId - User identifier
     * @returns {Promise<Object>} MongoDB update results
     */
    async markAllAsRead(userId) {
        return await Notification.updateMany(
            { recipient: userId, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );
    },

    /**
     * Delete a notification
     * @param {string} notificationId - ID of the notification
     * @param {string} userId - Recipient validation ID
     * @returns {Promise<Object>} MongoDB delete result
     */
    async deleteNotification(notificationId, userId) {
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            throw new ApiError(400, "Invalid Notification ID");
        }

        const notification = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
        if (!notification) {
            throw new ApiError(404, "Notification not found or unauthorized");
        }

        return notification;
    },
};

export default notificationService;
