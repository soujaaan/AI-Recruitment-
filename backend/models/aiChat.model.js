import mongoose from "mongoose";

const aiChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ["resume", "interview", "ats", "career", "roadmap", "default"],
        default: "default"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const AIChat = mongoose.model("AIChat", aiChatSchema);
