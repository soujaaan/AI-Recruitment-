import mongoose from "mongoose";

const questionBankSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        category: { type: String, default: "", index: true },
        description: { type: String, default: "" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);
