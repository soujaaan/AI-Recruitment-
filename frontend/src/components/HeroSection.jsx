import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Search, ArrowRight, Eye, EyeOff, User, UserPlus, Building2, Lock, Mail, Phone, Upload } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/services/auth.service';
import { setAuthState } from '@/redux/authSlice';
import { toast } from 'sonner';

const HERO_STATS = [
    { value: "10K+", label: "Jobs" },
    { value: "500+", label: "Companies" },
    { value: "1M+", label: "Applications" },
    { value: "98%", label: "Accuracy" },
];

const HeroSection = () => {
    // Search Bar logic
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    // Embedded Auth Onboarding logic
    const [activeTab, setActiveTab] = useState("signup");
    const [showPassword, setShowPassword] = useState({ login: false, signup: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Controlled Signup Inputs
    const [signupInput, setSignupInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "candidate",
        file: ""
    });

    // Controlled Login Inputs
    const [loginInput, setLoginInput] = useState({
        email: "",
        password: ""
    });

    const handleSignupChange = (e) => {
        setSignupInput({
            ...signupInput,
            [e.target.name]: e.target.value
        });
    };

    const handleSignupFileChange = (e) => {
        setSignupInput({
            ...signupInput,
            file: e.target.files?.[0]
        });
    };

    const handleLoginChange = (e) => {
        setLoginInput({
            ...loginInput,
            [e.target.name]: e.target.value
        });
    };

    const onLoginSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await authService.login(loginInput);
            const user = result?.user || result?.data?.user || null;
            const token = result?.token || result?.data?.token || "";
            
            dispatch(setAuthState({ user, token }));
            if (token) {
                localStorage.setItem("token", token);
            }
            toast.success(result?.message || "Welcome back!");
            
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

    const onSignupSubmit = async (e) => {
        e.preventDefault();
        
        if (!signupInput.fullname || !signupInput.email || !signupInput.phoneNumber || !signupInput.password) {
            toast.error("All fields except profile photo are required");
            return;
        }

        const formData = new FormData();
        formData.append("fullname", signupInput.fullname);
        formData.append("email", signupInput.email);
        formData.append("phoneNumber", signupInput.phoneNumber);
        formData.append("password", signupInput.password);
        formData.append("role", signupInput.role);

        if (signupInput.file) {
            formData.append("profilePhoto", signupInput.file);
        }

        setIsSubmitting(true);
        try {
            await authService.register(formData);
            toast.success(`OTP sent to ${signupInput.email}`);
            navigate("/verify-otp", { state: { email: signupInput.email } });
        } catch (error) {
            toast.error(error.message || "Signup failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden py-8 lg:py-12 bg-[#0a0a0a]">

            {/* Evenly Spread Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[350px] bg-[#00ff88]/[0.015] blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6">
                
                {/* Visual alignment grid using items-start to perfectly level left heading and right card top boundary */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
                    
                    {/* LEFT SIDE: Dense, structured active visual rhythm */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left max-w-[720px] pt-1.5 lg:pt-2">
                        
                        {/* Compact Badge */}
                        <div className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3 py-1
                            rounded-full
                            border border-accent/20
                            bg-accent/5
                            text-accent
                            text-[11px]
                            font-medium
                            mb-4
                        ">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                            </span>
                            AI-Powered Platform
                        </div>

                        {/* Heading - Levelled vertically with the signup header */}
                        <h1 className="
                            font-display
                            font-bold
                            text-4xl
                            sm:text-5xl
                            lg:text-6.5xl
                            tracking-tight
                            leading-[1.05]
                            text-white
                        ">
                            Find Your <br />
                            <span className="gradient-text">
                                Dream Career
                            </span>
                        </h1>

                        {/* Subtitle & Helper Line with stable vertical rhythm spacing */}
                        <p className="
                            mt-3
                            text-sm
                            text-muted-foreground
                            leading-relaxed
                            max-w-[580px]
                         font-medium
                        ">
                            Intelligent job matching, AI resume analysis,
                            and interview preparation — all in one
                            powerful platform.
                        </p>
                        <p className="
                            mt-2
                            text-xs
                            text-[#00ff88]/90
                            font-semibold
                            max-w-[580px]
                        ">
                            AI-powered hiring platform helping candidates connect with recruiters faster.
                        </p>

                        {/* Search Bar - Unified visual height and proportions */}
                        <div className="
                            mt-6
                            flex
                            flex-col
                            sm:flex-row
                            w-full
                            max-w-[540px]
                            gap-2
                            z-10
                        ">
                            {/* Input Container */}
                            <div className="
                                flex-grow
                                flex
                                items-center
                                bg-surface
                                border border-border
                                rounded-lg
                                px-3.5
                                h-[46px]
                                focus-within:border-accent
                                focus-within:ring-1
                                focus-within:ring-accent/15
                                transition-all duration-200
                            ">
                                <Search className="
                                    w-4 h-4
                                    text-muted-foreground
                                    mr-2 shrink-0
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
                                        placeholder:text-muted-foreground/45
                                        text-xs
                                    "
                                />
                            </div>

                            {/* Search Button */}
                            <Button
                                onClick={searchJobHandler}
                                className="
                                    btn-neon
                                    rounded-lg
                                    h-[46px]
                                    px-5
                                    text-xs
                                    font-bold
                                    whitespace-nowrap
                                    sm:w-[110px]
                                    shrink-0
                                "
                            >
                                Search
                                <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                            </Button>
                        </div>

                        {/* Compact premium stat cards */}
                        <div className="mt-7 w-full max-w-[540px]">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {HERO_STATS.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="
                                            rounded-lg
                                            border border-border/50
                                            bg-[#0d0d0d]/50
                                            backdrop-blur-md
                                            px-2.5 py-2
                                            text-center
                                            shadow-[0_0_14px_rgba(0,255,136,0.07)]
                                            transition-colors
                                            hover:border-accent/25
                                        "
                                    >
                                        <p className="text-base sm:text-lg font-bold text-accent leading-tight">
                                            {stat.value}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-muted-foreground font-medium">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT SIDE: Expanded, aligned, and highly readable Signup form */}
                    <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
                        <div className="w-full max-w-[420px] relative z-10">
                            
                            {/* Flat onboarding panel with expanded breathing room (p-5 md:p-6) */}
                            <div className="w-full bg-[#0d0d0d]/30 rounded-xl p-5 md:p-6 border border-border/40 relative shadow-none">
                                
                                <div className="mb-4">
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-accent">
                                        Authentication
                                    </span>
                                    <h2 className="text-xl font-display font-bold text-white mt-0.5">
                                        {activeTab === "signup" ? "Create Account" : "Sign In"}
                                    </h2>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {activeTab === "signup" 
                                            ? "Join the AI-powered recruitment platform" 
                                            : "Sign in to your account to continue"}
                                    </p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {activeTab === "signup" ? (
                                        <motion.form 
                                            key="signupForm"
                                            onSubmit={onSignupSubmit} 
                                            initial={{ opacity: 0, y: 3 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -3 }}
                                            transition={{ duration: 0.1 }}
                                            className="space-y-3.5"
                                        >
                                            {/* Full Name - Icon spacing fixed (pl-10, icon w-4 h-4, left-3) */}
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-foreground">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                                    <Input
                                                        type="text"
                                                        name="fullname"
                                                        placeholder="Abhishek Banerjee"
                                                        value={signupInput.fullname}
                                                        onChange={handleSignupChange}
                                                        required
                                                        className="h-9.5 bg-surface/30 border-border/70 focus:border-accent pl-10 rounded-md text-xs text-foreground placeholder:text-muted-foreground/35 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-foreground">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                                    <Input
                                                        type="email"
                                                        name="email"
                                                        placeholder="you@example.com"
                                                        value={signupInput.email}
                                                        onChange={handleSignupChange}
                                                        required
                                                        className="h-9.5 bg-surface/30 border-border/70 focus:border-accent pl-10 rounded-md text-xs text-foreground placeholder:text-muted-foreground/35 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone Number */}
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-foreground">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                                    <Input
                                                        type="text"
                                                        name="phoneNumber"
                                                        placeholder="9876543210"
                                                        value={signupInput.phoneNumber}
                                                        onChange={handleSignupChange}
                                                        required
                                                        className="h-9.5 bg-surface/30 border-border/70 focus:border-accent pl-10 rounded-md text-xs text-foreground placeholder:text-muted-foreground/35 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-foreground">Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                                    <Input
                                                        type={showPassword.signup ? "text" : "password"}
                                                        name="password"
                                                        placeholder="••••••••"
                                                        value={signupInput.password}
                                                        onChange={handleSignupChange}
                                                        required
                                                        className="h-9.5 bg-surface/30 border-border/70 focus:border-accent pl-10 pr-10 rounded-md text-xs text-foreground placeholder:text-muted-foreground/35 transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(p => ({ ...p, signup: !p.signup }))}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword.signup ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Role Selector */}
                                            <div className="space-y-1.5 pt-0.5">
                                                <Label className="text-xs font-semibold text-foreground">I am a...</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSignupInput({ ...signupInput, role: "candidate" })}
                                                        className={`flex items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-semibold h-9 transition-all ${
                                                            signupInput.role === "candidate"
                                                                ? "border-accent bg-accent/10 text-accent shadow-[0_0_8px_rgba(0,255,136,0.1)]"
                                                                : "border-border/70 bg-transparent text-muted-foreground hover:border-accent/20"
                                                        }`}
                                                    >
                                                        <User className="w-3.5 h-3.5" />
                                                        Candidate
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSignupInput({ ...signupInput, role: "recruiter" })}
                                                        className={`flex items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-semibold h-9 transition-all ${
                                                            signupInput.role === "recruiter"
                                                                ? "border-accent bg-accent/10 text-accent shadow-[0_0_8px_rgba(0,255,136,0.1)]"
                                                                : "border-border/70 bg-transparent text-muted-foreground hover:border-accent/20"
                                                        }`}
                                                    >
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        Recruiter
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Profile Photo Upload - Styled cleanly to align with other inputs */}
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-foreground">Profile Photo (Optional)</Label>
                                                <div className="relative">
                                                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleSignupFileChange}
                                                        className="h-9.5 bg-surface/30 border-border/70 focus:border-accent pl-10 rounded-md text-xs file:border-0 file:bg-accent/10 file:text-accent file:rounded-md file:text-[9px] file:px-2 file:py-0.5 file:h-5 file:mt-1 file:font-semibold"
                                                    />
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="
                                                    w-full
                                                    h-9.5
                                                    mt-2
                                                    rounded-md
                                                    bg-accent
                                                    text-black
                                                    font-bold
                                                    text-xs
                                                    hover:brightness-110
                                                    transition-all
                                                    duration-200
                                                    flex
                                                    items-center
                                                    justify-center
                                                    gap-1.5
                                                "
                                            >
                                                {isSubmitting ? "Creating account..." : "Create Account"}
                                                <UserPlus className="w-4 h-4" />
                                            </Button>

                                            <div className="text-center text-xs text-muted-foreground pt-1.5">
                                                Already have an account?{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab("login")}
                                                    className="text-accent hover:underline font-semibold"
                                                >
                                                    Sign in
                                                </button>
                                            </div>

                                        </motion.form>
                                    ) : (
                                        <motion.form 
                                            key="loginForm"
                                            onSubmit={onLoginSubmit} 
                                            initial={{ opacity: 0, y: 3 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -3 }}
                                            transition={{ duration: 0.1 }}
                                            className="space-y-4"
                                        >
                                            {/* Email */}
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-foreground">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                                    <Input
                                                        type="email"
                                                        name="email"
                                                        placeholder="you@example.com"
                                                        value={loginInput.email}
                                                        onChange={handleLoginChange}
                                                        required
                                                        className="h-9.5 bg-surface/30 border-border/70 focus:border-accent pl-10 rounded-md text-xs text-foreground placeholder:text-muted-foreground/35 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-foreground">Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                                    <Input
                                                        type={showPassword.login ? "text" : "password"}
                                                        name="password"
                                                        placeholder="••••••••"
                                                        value={loginInput.password}
                                                        onChange={handleLoginChange}
                                                        required
                                                        className="h-9.5 bg-surface/30 border-border/70 focus:border-accent pl-10 pr-10 rounded-md text-xs text-foreground placeholder:text-muted-foreground/35 transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(p => ({ ...p, login: !p.login }))}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword.login ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                                <span>Keep me signed in</span>
                                                <button
                                                    type="button"
                                                    onClick={() => toast.info("Password reset instructions sent (Demo mode).")}
                                                    className="text-accent hover:underline font-semibold"
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
                                                    h-9.5
                                                    rounded-md
                                                    bg-accent
                                                    text-black
                                                    font-bold
                                                    text-xs
                                                    hover:brightness-110
                                                    transition-all
                                                    duration-200
                                                    flex
                                                    items-center
                                                    justify-center
                                                    gap-1.5
                                                "
                                            >
                                                {isSubmitting ? "Signing in..." : "Sign In"}
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>

                                            <div className="text-center text-xs text-muted-foreground pt-1.5">
                                                Don't have an account?{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab("signup")}
                                                    className="text-accent hover:underline font-semibold"
                                                >
                                                    Sign up
                                                </button>
                                            </div>

                                        </motion.form>
                                    )}
                                </AnimatePresence>

                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </section>
    )
}

export default HeroSection