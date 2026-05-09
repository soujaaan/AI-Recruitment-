import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '@/hooks/useAuthMutations'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const loginMutation = useLoginMutation();

    const changeEventHandler = (e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            const result = await loginMutation.mutateAsync(input);

            if (result.success) {
                toast.success(result.message);

                const user = result?.user || result?.data?.user;

                if (user?.role === 'candidate') {
                    navigate("/jobs");
                } else {
                    navigate("/admin/dashboard");
                }
            }
        } catch (error) {
            const msg = error.message.toLowerCase();

            if (msg.includes('verify') || msg.includes('email')) {
                toast.error('Please verify your email first. Check your inbox for OTP.');
            } else {
                toast.error(error.message);
            }
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
                                <ArrowRight className="w-7 h-7 text-accent" />
                            </div>

                            <p className="section-label mb-2">
                                Authentication
                            </p>

                            <h1 className="font-display font-bold text-4xl text-foreground">
                                Welcome Back
                            </h1>

                            <p className="text-muted-foreground mt-3 text-sm">
                                Sign in to your account to continue
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={submitHandler} className="relative space-y-5">

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
                                        placeholder="Enter your password"
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

                            {/* Button */}
                            <Button
                                type="submit"
                                disabled={loginMutation.isPending}
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
                                {loginMutation.isPending ? "Signing in..." : "Sign In"}

                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>

                        </form>

                        {/* Footer */}
                        <div className="relative mt-6 text-center text-sm text-muted-foreground">

                            Don't have an account?{" "}

                            <Link
                                to="/signup"
                                className="text-accent hover:underline font-medium"
                            >
                                Sign up
                            </Link>

                        </div>

                    </motion.div>

                </div>
            </section>
        </div>
    )
}

export default Login