import mongoose from "mongoose";

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
    role:{
        type:String,
        enum:['Candidate','candidate','recruiter','admin'],
        required:true,
        index: true
    },
    profile:{
        bio:{type:String, trim: true, default: "" },
        skills:[{type:String, trim: true}],
        resume:{type:String},
        resumeOriginalName:{type:String},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, 
        profilePhoto:{
            type:String,
            default:""
        },
        education: [{type:String}],
        experience: [{type:String}],
        atsScore: {type:Number, default:0},
        aiMatchScore: {type:Number, default:0},
        preferredRoles: [{type:String}],
        location: {type:String},
        github: {type:String},
        linkedin: {type:String}
    },
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

userSchema.index({ fullname: "text", email: "text" });

export const User = mongoose.model('User', userSchema);
