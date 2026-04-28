import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '@/hooks/useAuthMutations'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, User, Building2 } from 'lucide-react'

const Signup = () => {
    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "candidate",
        file: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const registerMutation = useRegisterMutation();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }

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

        try {
            const result = await registerMutation.mutateAsync(formData);
            if (result.success) {
                toast.success(result.message);
                navigate("/login");
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-lg mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-8 md:p-10"
                    >
                        <div className="text-center mb-8">
                            <p className="section-label mb-2">Authentication</p>
                            <h1 className="font-display font-bold text-3xl text-foreground">Create Account</h1>
                            <p className="text-muted-foreground mt-2 text-sm">Join the AI-powered recruitment platform</p>
                        </div>

                        <form onSubmit={submitHandler} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Full Name</Label>
                                <Input
                                    type="text"
                                    name="fullname"
                                    value={input.fullname}
                                    onChange={changeEventHandler}
                                    placeholder="John Doe"
                                    className="bg-surface border-border focus:border-accent focus:ring-accent/20"
                                />
                            </div>

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
                                <Label className="text-sm font-medium text-foreground">Phone Number</Label>
                                <Input
                                    type="text"
                                    name="phoneNumber"
                                    value={input.phoneNumber}
                                    onChange={changeEventHandler}
                                    placeholder="+1 234 567 890"
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
                                        placeholder="Create a password"
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

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Role</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setInput({ ...input, role: "candidate" })}
                                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                            input.role === "candidate"
                                                ? "border-accent bg-accent/10 text-accent"
                                                : "border-border bg-surface text-muted-foreground hover:border-accent/30"
                                        }`}
                                    >
                                        <User className="w-4 h-4" />
                                        Candidate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInput({ ...input, role: "recruiter" })}
                                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                                            input.role === "recruiter"
                                                ? "border-accent bg-accent/10 text-accent"
                                                : "border-border bg-surface text-muted-foreground hover:border-accent/30"
                                        }`}
                                    >
                                        <Building2 className="w-4 h-4" />
                                        Recruiter
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Profile Photo</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={changeFileHandler}
                                    className="bg-surface border-border focus:border-accent focus:ring-accent/20 file:bg-surface-elevated file:border-0 file:text-foreground file:rounded-lg"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full btn-neon"
                                disabled={registerMutation.isPending}
                            >
                                {registerMutation.isPending ? "Creating account..." : "Create Account"}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-accent hover:underline font-medium">
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

