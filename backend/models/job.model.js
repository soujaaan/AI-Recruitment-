import mongoose from "mongoose";

const salaryRangeSchema = new mongoose.Schema(
    {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: "USD" },
        display: { type: String, default: "" },
    },
    { _id: false }
);

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },

        // Canonical relational fields
        recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true },
        requiredSkills: [{ type: String, trim: true }],
        skillsRequired: [{ type: String, trim: true }],
        salaryRange: { type: salaryRangeSchema, default: () => ({}) },
        employmentType: { type: String, trim: true, index: true },
        experienceLevel: { type: String, required: true },
        location: { type: String, required: true, trim: true, index: true },
        openings: { type: Number, default: 1, min: 0 },
        experienceRequired: { type: String, trim: true },
        status: {
            type: String,
            enum: ["open", "closed", "draft", "expired"],
            default: "open",
            index: true,
        },
        expiresAt: { type: Date, index: true },
        aiMetadata: {
            category: { type: String, default: "" },
            skillWeights: { type: mongoose.Schema.Types.Mixed, default: {} },
            embeddings: { type: [Number], default: [] },
        },
        applicantsCount: { type: Number, default: 0, min: 0 },

        // Legacy fields (kept for backward compatibility)
        requirements: [{ type: String, trim: true }],
        salary: { type: String, required: true },
        jobType: { type: String, required: true, trim: true },
        position: { type: Number, required: true },
        company: {
            name: { type: String, required: true, trim: true },
            website: { type: String, trim: true, default: "" },
            location: { type: String, trim: true, default: "" },
            logo: { type: String, default: "" },
        },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        applications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }],
        isActive: { type: Boolean, default: true },
        isFlagged: { type: Boolean, default: false },
        aiScreeningEnabled: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const syncJobFields = (doc) => {
    if (doc.created_by && !doc.recruiterId) doc.recruiterId = doc.created_by;
    if (doc.recruiterId && !doc.created_by) doc.created_by = doc.recruiterId;
    if (doc.recruiterId && !doc.recruiter) doc.recruiter = doc.recruiterId;
    if (doc.recruiter && !doc.recruiterId) doc.recruiterId = doc.recruiter;
    if (doc.requirements?.length && (!doc.requiredSkills || doc.requiredSkills.length === 0)) {
        doc.requiredSkills = doc.requirements;
    }
    if (doc.requiredSkills?.length && (!doc.requirements || doc.requirements.length === 0)) {
        doc.requirements = doc.requiredSkills;
    }
    if (doc.requiredSkills?.length && (!doc.skillsRequired || doc.skillsRequired.length === 0)) {
        doc.skillsRequired = doc.requiredSkills;
    }
    if (doc.skillsRequired?.length && (!doc.requiredSkills || doc.requiredSkills.length === 0)) {
        doc.requiredSkills = doc.skillsRequired;
    }
    if (doc.jobType && !doc.employmentType) doc.employmentType = doc.jobType;
    if (doc.employmentType && !doc.jobType) doc.jobType = doc.employmentType;
    if (doc.salary && !doc.salaryRange?.display) {
        doc.salaryRange = { ...(doc.salaryRange || {}), display: doc.salary };
    }
};

jobSchema.pre("save", function (next) {
    syncJobFields(this);
    next();
});

jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ recruiterId: 1, createdAt: -1 });
jobSchema.index({ companyId: 1, createdAt: -1 });
jobSchema.index({ created_by: 1, createdAt: -1 });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ isActive: 1 });

export const Job = mongoose.model("Job", jobSchema);
