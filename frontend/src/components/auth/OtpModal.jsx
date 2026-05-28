import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, ArrowRight, Loader2, RefreshCw, KeyRound, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { authService } from '@/services/auth.service';
import { useDispatch } from 'react-redux';
import { setAuthState } from '@/redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { getDashboardPath } from '@/utils/authRedirect';

const OtpModal = ({ isOpen, onClose, email, role, onSuccess }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60); // start with 60s cooldown
    const [expiryTime, setExpiryTime] = useState(300); // 5 minutes (300 seconds)
    const otpRefs = useRef([]);

    // Reset states when modal is opened
    useEffect(() => {
        if (isOpen) {
            setOtpDigits(Array(6).fill(""));
            setResendCooldown(60);
            setExpiryTime(300);
            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Resend Cooldown Timer
    useEffect(() => {
        if (!isOpen || resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, resendCooldown]);

    // Expiry Timer
    useEffect(() => {
        if (!isOpen || expiryTime <= 0) return;
        const timer = setInterval(() => {
            setExpiryTime((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen, expiryTime]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpDigits];
        newOtp[index] = value.slice(-1);
        setOtpDigits(newOtp);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
        if (!pastedData) return;
        const newOtp = [...otpDigits];
        pastedData.split('').forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtpDigits(newOtp);
        const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
        otpRefs.current[focusIndex]?.focus();
    };

    const verifyHandler = async (e) => {
        if (e) e.preventDefault();
        
        if (expiryTime <= 0) {
            toast.error("OTP has expired. Please request a new one.");
            return;
        }

        const otpStr = otpDigits.join("");
        if (otpStr.length < 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setIsVerifying(true);
        try {
            const result = await authService.verifyOtp({ email, otp: otpStr });
            const user = result?.user || result?.data?.user || null;
            const token = result?.token || result?.data?.token || "";

            dispatch(setAuthState({ user, token }));
            if (token) {
                localStorage.setItem("token", token);
            }
            toast.success(result?.message || "Account verified successfully!");
            
            if (onSuccess) {
                onSuccess(user);
            } else {
                const dashboardPath = getDashboardPath(user?.role || role);
                navigate(dashboardPath, { replace: true });
            }
            onClose();
        } catch (error) {
            toast.error(error.message || "Invalid OTP");
        } finally {
            setIsVerifying(false);
        }
    };

    const resendHandler = async () => {
        if (resendCooldown > 0) return;
        setIsResending(true);
        try {
            const result = await authService.resendOtp({ email });
            toast.success(result?.message || "OTP resent to your email");
            setResendCooldown(60);
            setExpiryTime(300); // reset expiry to 5 minutes
            setOtpDigits(Array(6).fill(""));
            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 100);
        } catch (error) {
            toast.error(error.message || "Failed to resend OTP");
        } finally {
            setIsResending(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Dark glass backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#020202]/85 backdrop-blur-md"
                    />

                    {/* Premium Glassmorphism Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="
                            relative
                            w-full
                            max-w-md
                            overflow-hidden
                            rounded-3xl
                            border border-accent/20
                            bg-[#0a0a0af5]/90
                            backdrop-blur-2xl
                            p-8
                            shadow-[0_0_50px_rgba(0,255,140,0.18)]
                        "
                    >
                        {/* Ambient glow effect */}
                        <div className="absolute -top-16 -left-16 w-32 h-32 bg-accent/10 blur-[50px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-accent/10 blur-[50px] rounded-full pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="
                                absolute
                                top-4
                                right-4
                                text-muted-foreground
                                hover:text-white
                                transition-colors
                                w-8 h-8
                                flex items-center justify-center
                                rounded-full
                                hover:bg-white/5
                            "
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Title and Icon */}
                        <div className="text-center mb-6">
                            <div className="
                                w-14 h-14
                                mx-auto mb-4
                                rounded-2xl
                                bg-accent/10
                                border border-accent/25
                                flex items-center justify-center
                                shadow-[0_0_15px_rgba(0,255,140,0.1)]
                            ">
                                <KeyRound className="w-6 h-6 text-accent" />
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
                                Email Verification
                            </span>
                            <h2 className="text-2xl font-display font-bold text-white mt-1">
                                Enter Verification Code
                            </h2>
                            <p className="text-xs text-muted-foreground mt-2 px-2">
                                We sent a 6-digit verification code to <br />
                                <span className="font-semibold text-white break-all">{email}</span>
                            </p>
                        </div>

                        {/* Expiry Timer or Alert */}
                        <div className="flex justify-center mb-6">
                            {expiryTime > 0 ? (
                                <div className="text-xs bg-[#0d0d0d] border border-border/80 rounded-full px-4 py-1.5 text-muted-foreground flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                    </span>
                                    Code expires in: <span className="font-mono text-accent font-semibold">{formatTime(expiryTime)}</span>
                                </div>
                            ) : (
                                <div className="text-xs bg-red-950/20 border border-red-500/30 rounded-full px-4 py-1.5 text-red-400 flex items-center gap-1.5">
                                    <ShieldAlert className="w-4 h-4" />
                                    <span>Code has expired. Please resend.</span>
                                </div>
                            )}
                        </div>

                        {/* OTP Inputs */}
                        <form onSubmit={verifyHandler} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground block text-center mb-1">
                                    6-Digit Verification Code
                                </Label>
                                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                                    {otpDigits.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => { otpRefs.current[idx] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            className="
                                                w-11 h-14
                                                text-center
                                                text-xl
                                                font-bold
                                                bg-surface/50
                                                border border-border
                                                focus:border-accent
                                                focus:ring-2
                                                focus:ring-accent/15
                                                rounded-xl
                                                text-white
                                                outline-none
                                                transition-all
                                            "
                                            maxLength={1}
                                            required
                                            disabled={expiryTime <= 0 || isVerifying}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Verify Button */}
                            <Button
                                type="submit"
                                disabled={isVerifying || expiryTime <= 0}
                                className="
                                    w-full
                                    h-11
                                    rounded-xl
                                    bg-accent
                                    text-black
                                    font-bold
                                    text-sm
                                    hover:brightness-110
                                    transition-all
                                    duration-200
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    shadow-[0_0_20px_rgba(0,255,140,0.15)]
                                    disabled:opacity-50
                                "
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin animate-infinite shrink-0" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify & Create Account
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>

                            {/* Resend Cooldown Option */}
                            <div className="text-center text-xs text-muted-foreground pt-2">
                                Didn&apos;t receive the code?{" "}
                                <button
                                    type="button"
                                    onClick={resendHandler}
                                    disabled={isResending || resendCooldown > 0}
                                    className="
                                        text-accent
                                        hover:underline
                                        font-semibold
                                        disabled:opacity-50
                                        disabled:hover:no-underline
                                        inline-flex
                                        items-center
                                        gap-1
                                    "
                                >
                                    {isResending ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : resendCooldown > 0 ? (
                                        `Resend in ${resendCooldown}s`
                                    ) : (
                                        "Resend OTP"
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OtpModal;
