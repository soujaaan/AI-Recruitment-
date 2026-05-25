import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
    {
        company: String,
        title: String,
        type: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        location: String,
        skills: [{ type: String }],
        responsibilities: String,
    },
    { _id: false }
);

const projectSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        skills: [{ type: String }],
        github: String,
        live: String,
        duration: String,
        teamSize: String,
    },
    { _id: false }
);

const certificationSchema = new mongoose.Schema(
    {
        name: String,
        issuer: String,
        year: String,
        url: String,
    },
    { _id: false }
);

const interviewHistorySchema = new mongoose.Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        scheduledAt: Date,
        status: String,
        feedback: String,
    },
    { _id: false }
);

const candidateProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", index: true },
        headline: { type: String, default: "" },
        bio: { type: String, default: "" },
        atsScore: { type: Number, default: 0, index: true },
        aiInsights: { type: Object, default: null },
        preferences: { type: Object, default: null },
        personalInfo: {
            fullName: String,
            email: String,
            phone: String,
            location: String,
            linkedin: String,
            github: String,
            portfolio: String,
        },
        summary: String,
        skills: [{ type: String, index: true }],
        experience: [experienceSchema],
        projects: [projectSchema],
        education: {
            secondary: { school: String, board: String, passingYear: String, score: String },
            higherSecondary: { school: String, board: String, stream: String, passingYear: String, score: String },
            graduation: {
                college: String,
                degree: String,
                specialization: String,
                university: String,
                startYear: String,
                endYear: String,
                cgpa: String,
            },
            postGraduation: {
                college: String,
                degree: String,
                specialization: String,
                university: String,
                startYear: String,
                endYear: String,
                cgpa: String,
            },
        },
        certifications: { type: [certificationSchema], default: [] },
        socialLinks: {
            github: String,
            linkedin: String,
            portfolio: String,
            twitter: String,
        },
        aiScore: { type: Number, min: 0, max: 100, default: 0, index: true },
        resumeStrength: { type: String, default: "" },
        missingSkills: [{ type: String, trim: true }],
        recommendationTags: [{ type: String, trim: true }],
        savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
        appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
        interviewHistory: { type: [interviewHistorySchema], default: [] },
        completionPercentage: { type: Number, default: 0 },
        resumePdfUrl: { type: String, default: "" },
    },
    { timestamps: true }
);

candidateProfileSchema.pre("save", function (next) {
    if (this.userId && !this.user) this.user = this.userId;
    if (this.user && !this.userId) this.userId = this.user;
    if (this.userId && !this.candidateId) this.candidateId = this.userId;
    if (this.candidateId && !this.userId) this.userId = this.candidateId;
    if (this.aiScore !== undefined && this.atsScore === 0) this.atsScore = this.aiScore;
    if (this.atsScore !== undefined && this.aiScore === 0) this.aiScore = this.atsScore;
    if (this.summary && !this.bio) this.bio = this.summary;
    if (this.bio && !this.summary) this.summary = this.bio;
    if (this.personalInfo?.github && !this.socialLinks?.github) {
        this.socialLinks = { ...(this.socialLinks || {}), github: this.personalInfo.github };
    }
    if (this.personalInfo?.linkedin && !this.socialLinks?.linkedin) {
        this.socialLinks = { ...(this.socialLinks || {}), linkedin: this.personalInfo.linkedin };
    }
    next();
});

export const CandidateProfile = mongoose.model("CandidateProfile", candidateProfileSchema);
