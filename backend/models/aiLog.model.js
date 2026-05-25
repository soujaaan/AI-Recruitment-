import mongoose from "mongoose";

const aiLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
        applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
        module: {
            type: String,
            enum: [
                "resume_scoring",
                "recommendation",
                "interview_generation",
                "candidate_ranking",
                "chatbot",
                "screening",
            ],
            required: true,
            index: true,
        },
        input: { type: mongoose.Schema.Types.Mixed, default: {} },
        output: { type: mongoose.Schema.Types.Mixed, default: {} },
        score: { type: Number, min: 0, max: 100 },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

aiLogSchema.index({ module: 1, createdAt: -1 });

export const AILog = mongoose.model("AILog", aiLogSchema);
