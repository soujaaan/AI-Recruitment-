import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import axios from 'axios'

const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
    const [isVerifying, setIsVerifying] = useState(false);
    const otpRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            toast.error("No email found. Please register again.");
            navigate('/signup');
        }
    }, [email, navigate]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpDigits];
        newOtp[index] = value;
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
        pastedData.split('').forEach((char, i) => newOtp[i] = char);
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
        setIsVerifying(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-otp`, { email, otp: otpStr });
            toast.success("Account created successfully!");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setIsVerifying(false);
        }
    };

    if (!email) return null;

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
                            <h1 className="font-display font-bold text-3xl text-foreground">Verify your email</h1>
                            <p className="text-muted-foreground mt-2 text-sm">
                                OTP sent to <span className="font-medium text-foreground">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={verifyHandler} className="space-y-6">
                            <div className="space-y-2 text-center">
                                <Label className="text-sm font-medium text-foreground">Enter 6-digit code</Label>
                                <div className="flex justify-center gap-2 mt-4" onPaste={handleOtpPaste}>
                                    {otpDigits.map((digit, idx) => (
                                        <Input
                                            key={idx}
                                            ref={el => otpRefs.current[idx] = el}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            className="w-12 h-14 text-center text-xl font-bold bg-surface border-border focus:border-accent focus:ring-accent/20 rounded-lg"
                                            maxLength={1}
                                            required
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full btn-neon"
                                disabled={isVerifying}
                            >
                                {isVerifying ? "Verifying..." : "Verify OTP"}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

export default VerifyOTP;
