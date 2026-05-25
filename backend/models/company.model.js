import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, default: "" },
        website: { type: String, default: "" },
        location: { type: String, default: "" },
        logo: { type: String, default: "" },
        industry: { type: String, default: "" },
        companySize: { type: String, default: "" },
        hiringMaturity: {
            type: String,
            enum: ["early", "growth", "mature", "enterprise"],
            default: "growth",
        },
        techStack: [{ type: String, trim: true }],
        headquarters: { type: String, default: "" },
        remoteCapability: {
            type: String,
            enum: ["remote", "hybrid", "onsite", "flexible"],
            default: "hybrid",
        },
        employeeCount: { type: Number },
        foundedYear: { type: Number },
        recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

companySchema.pre("save", function (next) {
    if (this.userId && !this.recruiterId) this.recruiterId = this.userId;
    if (this.recruiterId && !this.userId) this.userId = this.recruiterId;
    next();
});

companySchema.index({ recruiterId: 1 });

export const Company = mongoose.model("Company", companySchema);
