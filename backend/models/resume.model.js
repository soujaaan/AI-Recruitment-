import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    originalName: {
        type: String,
        default: ""
    },
    fileUrl: {
        type: String,
        required: true
    },
    parsedText: {
        type: String,
        default: ""
    },
    extractedSkills: [{
        type: String,
        trim: true
    }],
    aiAnalysis: {
        type: Object,
        default: null
    },
    parsedData: {
        type: Object,
        default: null
    }
}, { timestamps: true });

resumeSchema.pre("save", function(next) {
    if (this.userId && !this.user) this.user = this.userId;
    if (this.user && !this.userId) this.userId = this.user;
    next();
});

export const Resume = mongoose.model("Resume", resumeSchema);
