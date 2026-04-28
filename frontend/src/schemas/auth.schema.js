import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["candidate", "recruiter"]).optional(),
});

export const signupSchema = z.object({
    fullname: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    phoneNumber: z.string().regex(/^[0-9]{7,15}$/, "Enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["candidate", "recruiter"]),
});

export const inlineSignupSchema = z.object({
    fullname: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    phoneNumber: z.string().regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid phone number (10+ digits)"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["candidate", "recruiter"]),
});
