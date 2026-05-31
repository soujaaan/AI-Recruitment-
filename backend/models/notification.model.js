import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: Object.values(NOTIFICATION_TYPES),
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        entityType: {
            type: String,
            enum: ["Application", "InterviewSchedule", "Job", "System"],
            required: false,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            refPath: "entityType",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
            default: null,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

// Compound indexes for optimized querying and sorting
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
