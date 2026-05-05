import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    parsedData: {
        type: Object,
        default: null
    }
}, { timestamps: true });

export const Resume = mongoose.model("Resume", resumeSchema);
