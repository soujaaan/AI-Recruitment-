import mongoose from "mongoose";

const APPLICATION_STATUSES = [
    "applied",
    "under review",
    "shortlisted",
    "interview scheduled",
    "interview completed",
    "rejected",
    "hired",
];

const timelineEntrySchema = new mongoose.Schema(
    {
        stage: { type: String, required: true },
        timestamp: { type: Date, required: true },
        note: { type: String, default: "" },
    },
    { _id: false }
);

const applicationSnapshotSchema = new mongoose.Schema(
    {
        fullName: { type: String, default: "" },
        title: { type: String, default: "" },
        skills: [{ type: String, trim: true }],
        experience: { type: mongoose.Schema.Types.Mixed, default: [] },
        education: { type: mongoose.Schema.Types.Mixed, default: null },
        certifications: { type: mongoose.Schema.Types.Mixed, default: [] },
        projects: { type: mongoose.Schema.Types.Mixed, default: [] },
        resumeUrl: { type: String, default: "" },
    },
    { _id: false }
);

const interviewStageSchema = new mongoose.Schema(
    {
        stage: { type: String, required: true },
        status: { type: String, default: "pending" },
        scheduledAt: { type: Date },
        notes: { type: String, default: "" },
    },
    { _id: false }
);

const applicationSchema = new mongoose.Schema(
    {
        // Canonical relational fields
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true },
        
        // Clean relational ref target fields
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        candidateProfile: { type: mongoose.Schema.Types.ObjectId, ref: "CandidateProfile", index: true },
        resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", index: true },
        recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        
        applicationStatus: {
            type: String,
            enum: APPLICATION_STATUSES,
            default: "applied",
            index: true,
        },

        // Legacy fields (backward compatible)
        job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
        applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        status: {
            type: String,
            enum: APPLICATION_STATUSES,
            default: "applied",
        },

        resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
        atsScore: { type: Number, default: 0, min: 0, max: 100 },
        matchScore: { type: Number, default: 0, min: 0, max: 100 },
        aiMatchScore: { type: Number, default: 0, min: 0, max: 100 },
        matchedSkills: [{ type: String, trim: true }],
        missingSkills: [{ type: String, trim: true }],
        aiRanking: {
            type: String,
            enum: ["Highly Recommended", "Recommended", "Average Fit", "Weak Match"],
            default: "Average Fit",
        },
        aiEvaluationSummary: { type: String, default: "" },
        interviewStages: { type: [interviewStageSchema], default: [] },
        timeline: { type: [timelineEntrySchema], default: [] },
        snapshot: { type: applicationSnapshotSchema, default: null },
        recruiterNotes: { type: String, default: "" },
        appliedAt: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

const syncApplicationFields = (doc) => {
    if (doc.job && !doc.jobId) doc.jobId = doc.job;
    if (doc.jobId && !doc.job) doc.job = doc.jobId;
    if (doc.applicant && !doc.candidateId) doc.candidateId = doc.applicant;
    if (doc.candidateId && !doc.applicant) doc.applicant = doc.candidateId;
    if (doc.candidate && !doc.candidateId) doc.candidateId = doc.candidate;
    if (doc.candidateId && !doc.candidate) doc.candidate = doc.candidateId;
    if (doc.applicant && !doc.candidate) doc.candidate = doc.applicant;
    if (doc.candidate && !doc.applicant) doc.applicant = doc.candidate;
    if (doc.status && !doc.applicationStatus) doc.applicationStatus = doc.status;
    if (doc.applicationStatus && !doc.status) doc.status = doc.applicationStatus;
    if (doc.recruiterId && !doc.recruiter) doc.recruiter = doc.recruiterId;
    if (doc.recruiter && !doc.recruiterId) doc.recruiterId = doc.recruiter;
    if (doc.resumeId && !doc.resume) doc.resume = doc.resumeId;
    if (doc.resume && !doc.resumeId) doc.resumeId = doc.resume;
    if (doc.matchScore !== undefined && doc.aiMatchScore === 0) doc.aiMatchScore = doc.matchScore;
    if (doc.aiMatchScore !== undefined && doc.matchScore === 0) doc.matchScore = doc.aiMatchScore;
    if (doc.createdAt && !doc.appliedAt) doc.appliedAt = doc.createdAt;
};

applicationSchema.pre("save", function (next) {
    syncApplicationFields(this);
    next();
});

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true, sparse: true });
applicationSchema.index({ candidateId: 1, createdAt: -1 });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, createdAt: -1 });
applicationSchema.index({ recruiterId: 1, applicationStatus: 1 });

export const Application = mongoose.model("Application", applicationSchema);
