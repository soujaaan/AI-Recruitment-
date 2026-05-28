import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
    Eye,
    EyeOff,
    ArrowRight,
    User,
    Building2,
    UserPlus
} from 'lucide-react'

import { apiClient } from '@/lib/api'

const Signup = () => {

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "candidate",
        file: ""
    });

    const [isSending, setIsSending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isOtpOpen, setIsOtpOpen] = useState(false);

    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    };

    const changeFileHandler = (e) => {
        setInput({
            ...input,
            file: e.target.files?.[0]
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);

        if (input.file) {
            formData.append("profilePhoto", input.file);
        }

        setIsSending(true);

        try {

            await apiClient.post("/api/auth/send-otp", formData);

            toast.success(`OTP sent to ${input.email}`);
            navigate("/verify-otp", {
                state: {
                    email: input.email,
                    role: input.role,
                },
            });

        } catch (error) {

            toast.error(
                error.response?.data?.message || "Failed to send OTP"
            );

        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-[#0a0a0a] min-h-screen">

            <Navbar />

            <section className="py-20 px-6">

                <div className="max-w-lg mx-auto">

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="
                            relative
                            overflow-hidden
                            rounded-3xl
                            border border-accent/30
                            bg-[#0d0d0d]/90
                            backdrop-blur-xl
                            p-8 md:p-10
                            shadow-[0_0_45px_rgba(0,255,140,0.15)]
                            transition-all duration-500
                            hover:shadow-[0_0_70px_rgba(0,255,140,0.25)]
                        "
                    >

                        {/* Ambient Glow */}
                        <div className="absolute inset-0 bg-accent/5 blur-3xl opacity-20 pointer-events-none"></div>

                        {/* Header */}
                        <div className="relative text-center mb-8">

                            <div className="
                                w-16 h-16
                                mx-auto mb-5
                                rounded-2xl
                                bg-accent/10
                                border border-accent/20
                                flex items-center justify-center
                            ">
                                <UserPlus className="w-7 h-7 text-accent" />
                            </div>

                            <p className="section-label mb-2">
                                Authentication
                            </p>

                            <h1 className="font-display font-bold text-4xl text-foreground">
                                Create Account
                            </h1>

                            <p className="text-muted-foreground mt-3 text-sm">
                                Join the AI-powered recruitment platform
                            </p>

                        </div>

                        {/* Form */}
                        <form
                            onSubmit={submitHandler}
                            className="relative space-y-5"
                        >

                            {/* Full Name */}
                            <div className="space-y-2">

                                <Label className="text-sm font-medium text-foreground">
                                    Full Name
                                </Label>

                                <Input
                                    type="text"
                                    name="fullname"
                                    value={input.fullname}
                                    onChange={changeEventHandler}
                                    placeholder="John Doe"
                                    required
                                    className="
                                        h-12
                                        bg-surface/70
                                        border-border
                                        focus:border-accent
                                        focus:ring-2
                                        focus:ring-accent/30
                                        transition-all
                                    "
                                />

                            </div>

                            {/* Email */}
                            <div className="space-y-2">

                                <Label className="text-sm font-medium text-foreground">
                                    Email
                                </Label>

                                <Input
                                    type="email"
                                    name="email"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    placeholder="you@example.com"
                                    required
                                    className="
                                        h-12
                                        bg-surface/70
                                        border-border
                                        focus:border-accent
                                        focus:ring-2
                                        focus:ring-accent/30
                                        transition-all
                                    "
                                />

                            </div>

                            {/* Phone */}
                            <div className="space-y-2">

                                <Label className="text-sm font-medium text-foreground">
                                    Phone Number
                                </Label>

                                <Input
                                    type="text"
                                    name="phoneNumber"
                                    value={input.phoneNumber}
                                    onChange={changeEventHandler}
                                    placeholder="+1 234 567 890"
                                    className="
                                        h-12
                                        bg-surface/70
                                        border-border
                                        focus:border-accent
                                        focus:ring-2
                                        focus:ring-accent/30
                                        transition-all
                                    "
                                />

                            </div>

                            {/* Password */}
                            <div className="space-y-2">

                                <Label className="text-sm font-medium text-foreground">
                                    Password
                                </Label>

                                <div className="relative">

                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={input.password}
                                        onChange={changeEventHandler}
                                        placeholder="Create a password"
                                        required
                                        className="
                                            h-12
                                            pr-12
                                            bg-surface/70
                                            border-border
                                            focus:border-accent
                                            focus:ring-2
                                            focus:ring-accent/30
                                            transition-all
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            -translate-y-1/2
                                            text-muted-foreground
                                            hover:text-accent
                                            transition-colors
                                        "
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* Role */}
                            <div className="space-y-2">

                                <Label className="text-sm font-medium text-foreground">
                                    Role
                                </Label>

                                <div className="grid grid-cols-2 gap-3">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setInput({
                                                ...input,
                                                role: "candidate"
                                            })
                                        }
                                        className={`
                                            flex items-center justify-center gap-2
                                            rounded-xl border px-4 py-3
                                            text-sm font-medium transition-all
                                            ${
                                                input.role === "candidate"
                                                    ? "border-accent bg-accent/10 text-accent shadow-[0_0_20px_rgba(0,255,140,0.15)]"
                                                    : "border-border bg-surface text-muted-foreground hover:border-accent/30"
                                            }
                                        `}
                                    >
                                        <User className="w-4 h-4" />
                                        Candidate
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setInput({
                                                ...input,
                                                role: "recruiter"
                                            })
                                        }
                                        className={`
                                            flex items-center justify-center gap-2
                                            rounded-xl border px-4 py-3
                                            text-sm font-medium transition-all
                                            ${
                                                input.role === "recruiter"
                                                    ? "border-accent bg-accent/10 text-accent shadow-[0_0_20px_rgba(0,255,140,0.15)]"
                                                    : "border-border bg-surface text-muted-foreground hover:border-accent/30"
                                            }
                                        `}
                                    >
                                        <Building2 className="w-4 h-4" />
                                        Recruiter
                                    </button>

                                </div>

                            </div>

                            {/* Upload */}
                            <div className="space-y-2">

                                <Label className="text-sm font-medium text-foreground">
                                    Profile Photo (Optional)
                                </Label>

                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={changeFileHandler}
                                    className="
                                        h-12
                                        bg-surface/70
                                        border-border
                                        focus:border-accent
                                        focus:ring-2
                                        focus:ring-accent/30
                                        file:border-0
                                        file:bg-accent/10
                                        file:text-accent
                                        file:rounded-lg
                                        transition-all
                                    "
                                />

                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={isSending}
                                className="
                                    w-full
                                    h-12
                                    mt-2
                                    rounded-xl
                                    bg-accent
                                    text-black
                                    font-semibold
                                    hover:brightness-110
                                    transition-all duration-300
                                    shadow-[0_0_30px_rgba(0,255,140,0.25)]
                                "
                            >

                                {isSending
                                    ? "Sending OTP..."
                                    : "Create Account"
                                }

                                <ArrowRight className="ml-2 w-4 h-4" />

                            </Button>

                        </form>

                        {/* Footer */}
                        <div className="relative mt-6 text-center text-sm text-muted-foreground">

                            Already have an account?{" "}

                            <Link
                                to="/login"
                                className="text-accent hover:underline font-medium"
                            >
                                Sign in
                            </Link>

                        </div>

                    </motion.div>

                </div>

            </section>



        </div>
    )
}

export default Signup