import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["technical", "hr", "project", "experience"],
      required: true,
    },
    category: { type: String, default: "" },
    question: { type: String, required: true },
  },
  { _id: false }
);

const aiInterviewLogSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewStyle: {
      type: String,
      enum: ["technical", "hr", "mixed"],
      default: "mixed",
    },
    questions: [interviewQuestionSchema],
    jobTitle: { type: String, default: "" },
    candidateName: { type: String, default: "" },
  },
  { timestamps: true }
);

aiInterviewLogSchema.index({ jobId: 1, candidateId: 1, createdAt: -1 });
aiInterviewLogSchema.index({ generatedBy: 1, createdAt: -1 });

export const AIInterviewLog = mongoose.model("AIInterviewLog", aiInterviewLogSchema);
