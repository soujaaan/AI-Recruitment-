import React, { useState, useEffect } from 'react'
import Navbar from '@/components/shared/Navbar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { useResetPasswordMutation } from '@/hooks/useAuthMutations'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const resetPasswordMutation = useResetPasswordMutation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            toast.error("Please verify your OTP code first before resetting your password.");
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const [input, setInput] = useState({
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const changeEventHandler = (e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!input.password) {
            toast.error("Please enter a new password");
            return;
        }

        if (input.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        if (input.password !== input.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const result = await resetPasswordMutation.mutateAsync({
                email,
                password: input.password,
                confirmPassword: input.confirmPassword
            });

            if (result.success) {
                toast.success(result.message || "Password updated successfully");
                setTimeout(() => {
                    navigate("/login");
                }, 2000); // 2 seconds redirect buffer
            }
        } catch (error) {
            toast.error(error.message || "Failed to reset password. Please try again.");
        }
    };

    if (!email) return null;

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
                                <ShieldCheck className="w-7 h-7 text-accent" />
                            </div>

                            <p className="section-label mb-2">
                                Security
                            </p>

                            <h1 className="font-display font-bold text-4xl text-foreground">
                                Reset Password
                            </h1>

                            <p className="text-muted-foreground mt-3 text-sm">
                                Enter your new secure password for <br />
                                <span className="font-medium text-accent">{email}</span>
                            </p>
                        </div>

                        {/* Reset Form */}
                        <form onSubmit={submitHandler} className="relative space-y-5">
                            {/* New Password */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={input.password}
                                        onChange={changeEventHandler}
                                        placeholder="Min 8 characters"
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
                                        disabled={resetPasswordMutation.isPending}
                                        required
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

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={input.confirmPassword}
                                        onChange={changeEventHandler}
                                        placeholder="Repeat new password"
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
                                        disabled={resetPasswordMutation.isPending}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Button */}
                            <Button
                                type="submit"
                                disabled={resetPasswordMutation.isPending}
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
                                {resetPasswordMutation.isPending ? "Updating Password..." : "Update Password"}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default ResetPassword
