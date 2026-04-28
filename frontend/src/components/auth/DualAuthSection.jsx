import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogIn, UserPlus, Eye, EyeOff, User, Building2, Sparkles, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, inlineSignupSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { setAuthState } from "@/redux/authSlice";

const cardVariants = {
  active: { scale: 1.02, opacity: 1, filter: "brightness(1)", transition: { duration: 0.4, ease: "easeOut" } },
  inactive: { scale: 0.98, opacity: 0.65, filter: "brightness(0.85)", transition: { duration: 0.4, ease: "easeOut" } },
};

const glowVariants = {
  active: { boxShadow: "0 0 40px rgba(0,255,136,0.15), inset 0 0 20px rgba(0,255,136,0.05)", borderColor: "rgba(0,255,136,0.4)", transition: { duration: 0.4 } },
  inactive: { boxShadow: "0 0 0px rgba(0,255,136,0)", borderColor: "rgba(34,34,34,1)", transition: { duration: 0.4 } },
};

const floatingShape = (delay) => ({
  y: [0, -15, 0], rotate: [0, 5, -5, 0], transition: { duration: 6, repeat: Infinity, delay, ease: "easeInOut" },
});

const DualAuthSection = () => {
  const [activeForm, setActiveForm] = useState("login");
  const [showPassword, setShowPassword] = useState({ login: false, signup: false });
  const [selectedRole, setSelectedRole] = useState("candidate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm({
    resolver: zodResolver(inlineSignupSchema),
    defaultValues: { fullname: "", email: "", phoneNumber: "", password: "", role: "candidate" },
  });

  const onLogin = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await authService.login(data);
      const user = result?.user || result?.data?.user || null;
      const token = result?.token || result?.data?.token || "";
      dispatch(setAuthState({ user, token }));
      toast.success(result?.message || "Welcome back!");
      if (user?.role === "recruiter" || user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, role: selectedRole };
      const result = await authService.registerJson(payload);
      const user = result?.user || result?.data?.user || null;
      const token = result?.token || result?.data?.token || "";
      dispatch(setAuthState({ user, token }));
      toast.success(result?.message || "Account created!");
      if (user?.role === "recruiter" || user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoginActive = activeForm === "login";
  const isSignupActive = activeForm === "signup";

  return (
    <section id="auth-section" className="relative py-24 px-6 overflow-hidden">
      {/* Floating ambient shapes */}
      <motion.div animate={floatingShape(0)} className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-[#00ff88]/[0.03] blur-[60px] pointer-events-none" />
      <motion.div animate={floatingShape(2)} className="absolute bottom-20 right-[10%] w-40 h-40 rounded-full bg-emerald-500/[0.03] blur-[70px] pointer-events-none" />
      <motion.div animate={floatingShape(4)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#00ff88]/[0.02] blur-[90px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Get Started
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white">
            Join <span className="gradient-text">HireSense</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Choose your path below. Login to your account or create a new one to start your journey.
          </p>
        </motion.div>

        {/* Dual Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* LOGIN CARD */}
          <motion.div
            variants={cardVariants}
            animate={isLoginActive ? "active" : "inactive"}
            onClick={() => setActiveForm("login")}
            className="relative cursor-pointer"
          >
            <motion.div
              variants={glowVariants}
              animate={isLoginActive ? "active" : "inactive"}
              className="rounded-2xl border bg-surface/80 backdrop-blur-md p-8 md:p-10 overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 rounded-xl transition-colors duration-300 ${isLoginActive ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                  <LogIn className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl text-foreground">Welcome Back</h3>
                  <p className="text-sm text-muted-foreground">Sign in to your account</p>
                </div>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...loginForm.register("email")}
                    className="bg-surface border-border focus:border-accent focus:ring-accent/20"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword.login ? "text" : "password"}
                      placeholder="Enter your password"
                      {...loginForm.register("password")}
                      className="bg-surface border-border focus:border-accent focus:ring-accent/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPassword((p) => ({ ...p, login: !p.login }));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword.login ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full btn-neon" disabled={isSubmitting} onClick={(e) => e.stopPropagation()}>
                  {isSubmitting && activeForm === "login" ? "Signing in..." : "Sign In"}
                  <LogIn className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </motion.div>
          </motion.div>

          {/* SIGNUP CARD */}
          <motion.div
            variants={cardVariants}
            animate={isSignupActive ? "active" : "inactive"}
            onClick={() => setActiveForm("signup")}
            className="relative cursor-pointer"
          >
            <motion.div
              variants={glowVariants}
              animate={isSignupActive ? "active" : "inactive"}
              className="rounded-2xl border bg-surface/80 backdrop-blur-md p-8 md:p-10 overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 rounded-xl transition-colors duration-300 ${isSignupActive ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl text-foreground">Create Account</h3>
                  <p className="text-sm text-muted-foreground">Join the AI-powered platform</p>
                </div>
              </div>

              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Full Name</Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    {...signupForm.register("fullname")}
                    className="bg-surface border-border focus:border-accent focus:ring-accent/20"
                  />
                  {signupForm.formState.errors.fullname && (
                    <p className="text-xs text-red-400">{signupForm.formState.errors.fullname.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...signupForm.register("email")}
                    className="bg-surface border-border focus:border-accent focus:ring-accent/20"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Phone Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+1 234 567 890"
                      {...signupForm.register("phoneNumber")}
                      className="bg-surface border-border focus:border-accent focus:ring-accent/20 pl-10"
                    />
                  </div>
                  {signupForm.formState.errors.phoneNumber && (
                    <p className="text-xs text-red-400">{signupForm.formState.errors.phoneNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword.signup ? "text" : "password"}
                      placeholder="Create a password"
                      {...signupForm.register("password")}
                      className="bg-surface border-border focus:border-accent focus:ring-accent/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPassword((p) => ({ ...p, signup: !p.signup }));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword.signup ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">I am a...</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRole("candidate");
                        signupForm.setValue("role", "candidate");
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRole("recruiter");
                        signupForm.setValue("role", "recruiter");
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                        selectedRole === "recruiter"
                          ? "border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(0,255,136,0.1)]"
                          : "border-border bg-surface text-muted-foreground hover:border-accent/30"
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Recruiter
                    </button>
                  </div>
                  {signupForm.formState.errors.role && (
                    <p className="text-xs text-red-400">{signupForm.formState.errors.role.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full btn-neon" disabled={isSubmitting} onClick={(e) => e.stopPropagation()}>
                  {isSubmitting && activeForm === "signup" ? "Creating account..." : "Create Account"}
                  <UserPlus className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DualAuthSection;

