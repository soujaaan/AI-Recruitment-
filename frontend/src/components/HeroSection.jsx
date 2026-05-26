import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Search, ArrowRight, Eye, EyeOff, User, Building2, Sparkles, FileText, TrendingUp, Star, Lock, Mail } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, inlineSignupSchema } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { setAuthState } from '@/redux/authSlice';
import { toast } from 'sonner';

const HeroSection = () => {
    // Search Bar logic
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    // Embedded Auth Card logic
    const [activeTab, setActiveTab] = useState("login");
    const [showPassword, setShowPassword] = useState({ login: false, signup: false });
    const [selectedRole, setSelectedRole] = useState("candidate");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loginForm = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const signupForm = useForm({
        resolver: zodResolver(inlineSignupSchema),
        defaultValues: { fullname: "", email: "", phoneNumber: "1234567890", password: "", role: "candidate" },
    });

    const onLogin = async (data) => {
        setIsSubmitting(true);
        try {
            const result = await authService.login(data);
            const user = result?.user || result?.data?.user || null;
            const token = result?.token || result?.data?.token || "";
            
            // Dispatch and set Auth
            dispatch(setAuthState({ user, token }));
            
            // Set cookie if needed (token check)
            if (token) {
                localStorage.setItem("token", token);
            }

            toast.success(result?.message || "Welcome back!");
            
            // Role checking for redirection
            if (user?.role === "recruiter" || user?.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/jobs");
            }
        } catch (error) {
            const msg = error.message.toLowerCase();
            if (msg.includes('verify') || msg.includes('email')) {
                toast.error('Please verify your email first. Check your inbox for OTP.');
            } else {
                toast.error(error.message || "Login failed");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSignup = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, role: selectedRole };
            await authService.registerJson(payload);
            toast.success("OTP sent to your email!");
            
            // Redirect to verify OTP page with email state
            navigate("/verify-otp", { state: { email: data.email } });
        } catch (error) {
            toast.error(error.message || "Signup failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden py-12 lg:py-20">

            {/* Background Glow Effects */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ff88]/[0.03] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#00ff88]/5 to-emerald-500/5 rounded-full blur-[100px] animate-blob pointer-events-none" />
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-teal-500/5 to-[#00ff88]/5 rounded-full blur-[90px] animate-blob animation-delay-2000 pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
                    
                    {/* LEFT SIDE: Hero Info, Search Bar, Stats Cards */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left relative">
                        
                        {/* Subtle Floating background AI UI cards */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-12 -left-12 hidden xl:flex items-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-md border border-accent/15 rounded-2xl p-4 shadow-[0_0_35px_rgba(0,255,140,0.06)] z-20 pointer-events-none"
                        >
                            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Resume Score</p>
                                <p className="text-sm font-bold text-white">89/100 <span className="text-accent text-xs font-normal">(Excellent)</span></p>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute top-1/2 -right-8 hidden xl:flex items-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-md border border-accent/15 rounded-2xl p-4 shadow-[0_0_35px_rgba(0,255,140,0.06)] z-20 pointer-events-none"
                        >
                            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shrink-0">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">AI Match Score</p>
                                <p className="text-sm font-bold text-white">96% Match</p>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute -bottom-10 left-1/4 hidden xl:flex items-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-md border border-accent/15 rounded-2xl p-4 shadow-[0_0_35px_rgba(0,255,140,0.06)] z-20 pointer-events-none"
                        >
                            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shrink-0">
                                <Star className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Top Match</p>
                                <p className="text-xs font-bold text-white">Google — Sr. Engineer</p>
                            </div>
                        </motion.div>

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                px-5 py-2.5
                                rounded-full
                                border border-accent/20
                                bg-accent/5
                                text-accent
                                text-sm
                                font-medium
                                mb-6
                            "
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                            </span>
                            AI-Powered Recruitment Platform
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="
                                font-display
                                font-bold
                                text-4xl
                                sm:text-5xl
                                md:text-6xl
                                lg:text-7xl
                                tracking-tight
                                leading-[1.1]
                                text-white
                            "
                        >
                            Find Your <br />
                            <span className="gradient-text">
                                Dream Career
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="
                                mt-6
                                text-base
                                sm:text-lg
                                text-muted-foreground
                                max-w-xl
                                leading-relaxed
                            "
                        >
                            Intelligent job matching, AI resume analysis,
                            and interview preparation — all in one
                            powerful platform.
                        </motion.p>

                        {/* Search Bar - POSITIONED ABOVE STATS CARDS */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="
                                mt-8
                                flex
                                flex-col
                                sm:flex-row
                                w-full
                                max-w-xl
                                gap-3
                                z-10
                            "
                        >
                            {/* Input */}
                            <div className="
                                flex-1
                                flex
                                items-center
                                bg-surface
                                border border-border
                                rounded-2xl
                                px-5 py-3.5
                                focus-within:border-accent
                                focus-within:ring-2
                                focus-within:ring-accent/20
                                transition-all duration-300
                            ">
                                <Search className="
                                    w-5 h-5
                                    text-muted-foreground
                                    mr-3 shrink-0
                                " />
                                <input
                                    type="text"
                                    placeholder='Search roles, companies, skills...'
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && searchJobHandler()}
                                    className="
                                        outline-none
                                        border-none
                                        flex-1
                                        text-foreground
                                        bg-transparent
                                        placeholder:text-muted-foreground/60
                                        text-base
                                    "
                                />
                            </div>

                            {/* Search Button */}
                            <Button
                                onClick={searchJobHandler}
                                className="
                                    btn-neon
                                    rounded-2xl
                                    h-[54px]
                                    px-6
                                    text-base
                                    whitespace-nowrap
                                "
                            >
                                Search
                                <ArrowRight className='ml-2 h-5 w-5' />
                            </Button>
                        </motion.div>

                        {/* Stats Cards - MOVED BELOW SEARCH BAR IN A 2x2 GRID */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="
                                mt-10
                                grid
                                grid-cols-2
                                gap-4
                                w-full
                                max-w-xl
                            "
                        >
                            {[
                                { value: "10K+", label: "Job Openings" },
                                { value: "500+", label: "Companies" },
                                { value: "1M+", label: "Applications" },
                                { value: "98%", label: "Match Accuracy" },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="
                                        glass-card
                                        p-5
                                        text-center
                                        transition-all duration-300
                                        hover:border-accent/20
                                        hover:shadow-[0_0_30px_rgba(0,255,140,0.08)]
                                    "
                                >
                                    <span className="
                                        block
                                        font-display
                                        font-bold
                                        text-2xl
                                        text-accent
                                    ">
                                        {stat.value}
                                    </span>
                                    <span className="
                                        text-[10px]
                                        text-muted-foreground
                                        uppercase
                                        tracking-wider
                                        mt-1
                                        block
                                    ">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </motion.div>

                    </div>

                    {/* RIGHT SIDE: Sleek Glassmorphism Authentication Card */}
                    <div className="lg:col-span-5 w-full flex justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="w-full max-w-md"
                        >
                            <div className="
                                relative
                                overflow-hidden
                                rounded-3xl
                                border border-accent/20
                                bg-[#0d0d0d]/80
                                backdrop-blur-xl
                                p-7 md:p-8
                                shadow-[0_0_50px_rgba(0,255,140,0.05)]
                                transition-all duration-500
                                hover:shadow-[0_0_60px_rgba(0,255,140,0.1)]
                                hover:border-accent/30
                            ">
                                {/* Ambient radial glow inside card */}
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent blur-3xl pointer-events-none" />

                                {/* Tab Switcher */}
                                <div className="flex p-1 bg-surface/50 border border-border/50 rounded-2xl mb-6 relative z-10">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("login")}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                            activeTab === "login"
                                                ? "bg-accent text-black shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Log In
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("signup")}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                            activeTab === "signup"
                                                ? "bg-accent text-black shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        Sign Up
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {activeTab === "login" ? (
                                        <motion.div
                                            key="login"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="relative z-10"
                                        >
                                            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                                                
                                                {/* Email */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-foreground">Email</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
                                                        <Input
                                                            type="email"
                                                            placeholder="you@example.com"
                                                            {...loginForm.register("email")}
                                                            className="h-12 bg-surface/60 border-border focus:border-accent focus:ring-accent/20 pl-11 rounded-xl text-foreground placeholder:text-muted-foreground/40 transition-all duration-300"
                                                        />
                                                    </div>
                                                    {loginForm.formState.errors.email && (
                                                        <p className="text-xs text-red-400 mt-1">{loginForm.formState.errors.email.message}</p>
                                                    )}
                                                </div>

                                                {/* Password */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-foreground">Password</Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
                                                        <Input
                                                            type={showPassword.login ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            {...loginForm.register("password")}
                                                            className="h-12 bg-surface/60 border-border focus:border-accent focus:ring-accent/20 pl-11 pr-10 rounded-xl text-foreground placeholder:text-muted-foreground/40 transition-all duration-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(p => ({ ...p, login: !p.login }))}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            {showPassword.login ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {loginForm.formState.errors.password && (
                                                        <p className="text-xs text-red-400 mt-1">{loginForm.formState.errors.password.message}</p>
                                                    )}
                                                </div>

                                                {/* Keep Signed In & Forgot Password */}
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-muted-foreground">Keep me signed in</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toast.info("Password reset instructions have been sent to your email (Demo mode).")}
                                                        className="text-accent hover:underline font-medium transition-colors"
                                                    >
                                                        Forgot password?
                                                    </button>
                                                </div>

                                                {/* Submit Button */}
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="
                                                        w-full
                                                        h-12
                                                        rounded-xl
                                                        bg-accent
                                                        text-black
                                                        font-semibold
                                                        hover:brightness-110
                                                        transition-all
                                                        duration-300
                                                        shadow-[0_0_20px_rgba(0,255,140,0.15)]
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                    "
                                                >
                                                    {isSubmitting ? "Signing in..." : "Sign In"}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="signup"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="relative z-10"
                                        >
                                            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                                                
                                                {/* Full Name */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm font-medium text-foreground">Full Name</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
                                                        <Input
                                                            type="text"
                                                            placeholder="Abhishek Banerjee"
                                                            {...signupForm.register("fullname")}
                                                            className="h-11 bg-surface/60 border-border focus:border-accent focus:ring-accent/20 pl-11 rounded-xl text-foreground placeholder:text-muted-foreground/40 transition-all duration-300"
                                                        />
                                                    </div>
                                                    {signupForm.formState.errors.fullname && (
                                                        <p className="text-xs text-red-400 mt-0.5">{signupForm.formState.errors.fullname.message}</p>
                                                    )}
                                                </div>

                                                {/* Email */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm font-medium text-foreground">Email</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
                                                        <Input
                                                            type="email"
                                                            placeholder="you@example.com"
                                                            {...signupForm.register("email")}
                                                            className="h-11 bg-surface/60 border-border focus:border-accent focus:ring-accent/20 pl-11 rounded-xl text-foreground placeholder:text-muted-foreground/40 transition-all duration-300"
                                                        />
                                                    </div>
                                                    {signupForm.formState.errors.email && (
                                                        <p className="text-xs text-red-400 mt-0.5">{signupForm.formState.errors.email.message}</p>
                                                    )}
                                                </div>

                                                {/* Password */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm font-medium text-foreground">Password</Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
                                                        <Input
                                                            type={showPassword.signup ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            {...signupForm.register("password")}
                                                            className="h-11 bg-surface/60 border-border focus:border-accent focus:ring-accent/20 pl-11 pr-10 rounded-xl text-foreground placeholder:text-muted-foreground/40 transition-all duration-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(p => ({ ...p, signup: !p.signup }))}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            {showPassword.signup ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {signupForm.formState.errors.password && (
                                                        <p className="text-xs text-red-400 mt-0.5">{signupForm.formState.errors.password.message}</p>
                                                    )}
                                                </div>

                                                {/* Role Selection */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-foreground">I am a...</Label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedRole("candidate");
                                                                signupForm.setValue("role", "candidate");
                                                            }}
                                                            className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                                                                selectedRole === "candidate"
                                                                    ? "border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(0,255,136,0.1)]"
                                                                    : "border-border bg-surface text-muted-foreground hover:border-accent/30"
                                                            }`}
                                                        >
                                                            <User className="w-4 h-4" />
                                                            Candidate
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedRole("recruiter");
                                                                signupForm.setValue("role", "recruiter");
                                                            }}
                                                            className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                                                                selectedRole === "recruiter"
                                                                    ? "border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(0,255,136,0.1)]"
                                                                    : "border-border bg-surface text-muted-foreground hover:border-accent/30"
                                                            }`}
                                                        >
                                                            <Building2 className="w-4 h-4" />
                                                            Recruiter
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Submit Button */}
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="
                                                        w-full
                                                        h-11
                                                        rounded-xl
                                                        bg-accent
                                                        text-black
                                                        font-semibold
                                                        hover:brightness-110
                                                        transition-all
                                                        duration-300
                                                        shadow-[0_0_20px_rgba(0,255,140,0.15)]
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        mt-4
                                                    "
                                                >
                                                    {isSubmitting ? "Creating account..." : "Create Account"}
                                                    <UserPlus className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

        </section>
    )
}

export default HeroSection