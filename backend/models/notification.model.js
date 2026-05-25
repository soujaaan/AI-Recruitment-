import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: {
            type: String,
            enum: ["application", "interview", "message", "recommendation", "system"],
            default: "system",
        },
        title: { type: String, required: true, trim: true },
        message: { type: String, default: "" },
        link: { type: String, default: "" },
        isRead: { type: Boolean, default: false, index: true },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
