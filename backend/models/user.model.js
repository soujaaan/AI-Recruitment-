import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password:{
        type:String,
        required:true,
    },
    role: {
        type: String,
        enum: [ROLES.CANDIDATE, ROLES.RECRUITER, ROLES.ADMIN],
        required: true,
        index: true,
        lowercase: true,
    },
    profile: {
        type: mongoose.Schema.Types.Mixed,
        ref: "CandidateProfile",
        index: true
    },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true },
    profilePhoto: { type: String, default: "" },
    isActive:{
        type:Boolean,
        default:true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    lastLoginAt: {
        type: Date
    }
}, { timestamps: true });

userSchema.pre("validate", function(next) {
    if (this.role) this.role = String(this.role).toLowerCase();
    
    // If a non-candidate attempts to set profile as an object, extract top-level fields and clear profile
    if (this.role !== "candidate" && this.profile && typeof this.profile === "object" && !mongoose.Types.ObjectId.isValid(this.profile)) {
        const p = this.profile;
        if (p.company) this.company = p.company;
        if (p.companyId) this.companyId = p.companyId;
        if (p.profilePhoto) this.profilePhoto = p.profilePhoto;
        this.profile = undefined;
    }
    
    if (this.company && !this.companyId) {
        this.companyId = this.company;
    }
    next();
});

userSchema.pre("save", function (next) {
    if (this.role) this.role = String(this.role).toLowerCase();
    if (this.company && !this.companyId) {
        this.companyId = this.company;
    }
    next();
});

const handleUserUpdate = function(next) {
    const update = this.getUpdate();
    if (update && update.$set) {
        if (update.$set["profile.company"]) {
            update.$set.company = update.$set["profile.company"];
            delete update.$set["profile.company"];
        }
        if (update.$set["profile.companyId"]) {
            update.$set.companyId = update.$set["profile.companyId"];
            delete update.$set["profile.companyId"];
        }
        if (update.$set["profile.profilePhoto"]) {
            update.$set.profilePhoto = update.$set["profile.profilePhoto"];
            delete update.$set["profile.profilePhoto"];
        }
        if (update.$set.profile && typeof update.$set.profile === "object" && !mongoose.Types.ObjectId.isValid(update.$set.profile)) {
            const p = update.$set.profile;
            if (p.company) update.$set.company = p.company;
            if (p.companyId) update.$set.companyId = p.companyId;
            if (p.profilePhoto) update.$set.profilePhoto = p.profilePhoto;
            update.$set.profile = null;
        }
    }
    next();
};

userSchema.pre("updateOne", handleUserUpdate);
userSchema.pre("updateMany", handleUserUpdate);
userSchema.pre("findOneAndUpdate", handleUserUpdate);

const safeProfileTransform = function (doc, ret) {
    if (!ret.profile || typeof ret.profile !== "object") {
        const profileId = ret.profile;
        ret.profile = {
            _id: profileId || null,
            bio: "",
            skills: [],
            resume: "",
            resumeOriginalName: "",
            company: ret.company || null,
            companyId: ret.companyId || null,
            profilePhoto: ret.profilePhoto || "",
            education: [],
            experience: [],
            atsScore: 0,
            aiMatchScore: 0,
            preferredRoles: [],
            location: "",
            github: "",
            linkedin: ""
        };
    } else {
        // profile is populated (object). Ensure fallback fields
        ret.profile.bio = ret.profile.bio || ret.profile.summary || "";
        ret.profile.skills = ret.profile.skills || [];
        ret.profile.resume = ret.profile.resume || ret.profile.resumePdfUrl || "";
        ret.profile.profilePhoto = ret.profile.profilePhoto || ret.profilePhoto || "";
        ret.profile.company = ret.profile.company || ret.company || null;
        ret.profile.companyId = ret.profile.companyId || ret.companyId || null;
        ret.profile.education = ret.profile.education || [];
        ret.profile.experience = ret.profile.experience || [];
        ret.profile.atsScore = ret.profile.atsScore || ret.profile.aiScore || 0;
        ret.profile.aiMatchScore = ret.profile.aiMatchScore || ret.profile.aiScore || 0;
    }
    return ret;
};

userSchema.set("toJSON", { transform: safeProfileTransform, virtuals: true });
userSchema.set("toObject", { transform: safeProfileTransform, virtuals: true });

userSchema.index({ fullname: "text", email: "text" });
userSchema.index({ role: 1, isActive: 1 });

export const User = mongoose.model("User", userSchema);
