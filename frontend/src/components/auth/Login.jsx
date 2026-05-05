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
    const [input, setInput] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const loginMutation = useLoginMutation();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

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
    }

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-8 md:p-10"
                    >
                        <div className="text-center mb-8">
                            <p className="section-label mb-2">Authentication</p>
                            <h1 className="font-display font-bold text-3xl text-foreground">Welcome Back</h1>
                            <p className="text-muted-foreground mt-2 text-sm">Sign in to your account to continue</p>
                        </div>

                        <form onSubmit={submitHandler} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Email</Label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    placeholder="you@example.com"
                                    className="bg-surface border-border focus:border-accent focus:ring-accent/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={input.password}
                                        onChange={changeEventHandler}
                                        placeholder="Enter your password"
                                        className="bg-surface border-border focus:border-accent focus:ring-accent/20 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full btn-neon"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? "Signing in..." : "Sign In"}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-accent hover:underline font-medium">
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

