import React, { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/shared/Navbar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react'
import { useVerifyResetOtpMutation } from '@/hooks/useAuthMutations'

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const verifyResetOtpMutation = useVerifyResetOtpMutation();
    const email = location.state?.email;

    const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
    const otpRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            toast.error("Please enter your email address to recover your password");
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpDigits];
        newOtp[index] = value.slice(-1);
        setOtpDigits(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
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
        pastedData.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtpDigits(newOtp);
        const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
        otpRefs.current[focusIndex]?.focus();
    };

    const verifyHandler = async (e) => {
        e.preventDefault();
        const otpStr = otpDigits.join("");
        if (otpStr.length < 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            const result = await verifyResetOtpMutation.mutateAsync({ email, otp: otpStr });
            if (result.success) {
                toast.success(result.message || "OTP verified successfully!");
                navigate('/reset-password', { state: { email } });
            }
        } catch (error) {
            toast.error(error.message || "Invalid or expired OTP");
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
                                <ShieldAlert className="w-7 h-7 text-accent" />
                            </div>

                            <p className="section-label mb-2">Verification</p>
                            <h1 className="font-display font-bold text-4xl text-foreground">Verify OTP</h1>
                            <p className="text-muted-foreground mt-3 text-sm">
                                Enter the 6-digit code sent to <br />
                                <span className="font-medium text-accent">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={verifyHandler} className="relative space-y-6">
                            <div className="space-y-2 text-center">
                                <Label className="text-sm font-medium text-foreground">Enter 6-Digit Code</Label>
                                <div className="flex justify-center gap-2 mt-4" onPaste={handleOtpPaste}>
                                    {otpDigits.map((digit, idx) => (
                                        <Input
                                            key={idx}
                                            ref={el => { otpRefs.current[idx] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            className="
                                                w-12 h-14 
                                                text-center text-xl font-bold 
                                                bg-surface border-border 
                                                focus:border-accent focus:ring-accent/20 
                                                rounded-lg
                                            "
                                            maxLength={1}
                                            required
                                            disabled={verifyResetOtpMutation.isPending}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
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
                                    flex items-center justify-center
                                "
                                disabled={verifyResetOtpMutation.isPending}
                            >
                                {verifyResetOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="relative mt-6 text-center">
                            <Link
                                to="/forgot-password"
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-accent transition-colors font-medium group"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                                Back to Forgot Password
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

export default VerifyOtp;
