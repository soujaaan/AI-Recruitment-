import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        atsScore: { type: Number, min: 0, max: 100, default: 0 },
        aiScore: { type: Number, min: 0, max: 100, default: 0 },
        predictedRole: { type: String, default: "" },
        skills: [{ type: String }],
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        recommendations: [{ type: String }],
        missingSkills: [{ type: String }],
        analyzedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

resumeAnalysisSchema.pre("save", function (next) {
    if (this.userId && !this.candidateId) this.candidateId = this.userId;
    if (this.candidateId && !this.userId) this.userId = this.candidateId;
    if (this.atsScore && !this.aiScore) this.aiScore = this.atsScore;
    next();
});

resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });
resumeAnalysisSchema.index({ candidateId: 1, createdAt: -1 });

export const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
export default ResumeAnalysis;
