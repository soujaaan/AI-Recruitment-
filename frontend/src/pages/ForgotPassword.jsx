import React, { useState } from 'react'
import Navbar from '@/components/shared/Navbar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useForgotPasswordMutation } from '@/hooks/useAuthMutations'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { KeyRound, ArrowLeft } from 'lucide-react'

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const forgotPasswordMutation = useForgotPasswordMutation();

    const submitHandler = async (e) => {
        e.preventDefault();
        
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            toast.error("Please enter your email address");
            return;
        }

        try {
            const result = await forgotPasswordMutation.mutateAsync({ email: normalizedEmail });
            if (result.success) {
                toast.success(result.message || "OTP sent successfully!");
                navigate("/verify-reset-otp", { state: { email: normalizedEmail } });
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />

            <section className="py-20 px-6">
                <div className="max-w-md mx-auto">
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
                            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                <KeyRound className="w-7 h-7 text-accent" />
                            </div>

                            <p className="section-label mb-2">
                                Recovery
                            </p>

                            <h1 className="font-display font-bold text-4xl text-foreground">
                                Forgot Password
                            </h1>

                            <p className="text-muted-foreground mt-3 text-sm">
                                Enter your registered email to receive a 6-digit OTP
                            </p>
                        </div>

                        {/* Request Form */}
                        <form onSubmit={submitHandler} className="relative space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">
                                    Email Address
                                </Label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="
                                        h-12
                                        bg-surface/70
                                        border-border
                                        focus:border-accent
                                        focus:ring-2
                                        focus:ring-accent/30
                                        transition-all
                                    "
                                    disabled={forgotPasswordMutation.isPending}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={forgotPasswordMutation.isPending}
                                className="
                                    w-full
                                    h-12
                                    mt-2
                                    rounded-xl
                                    bg-accent
                                    text-black
                                    font-semibold
                                    hover:brightness-110
                                    transition-all
                                    duration-300
                                    shadow-[0_0_30px_rgba(0,255,140,0.25)]
                                "
                            >
                                {forgotPasswordMutation.isPending ? "Sending OTP..." : "Send OTP"}
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="relative mt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-accent transition-colors font-medium group"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                                Back to Login
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default ForgotPassword
