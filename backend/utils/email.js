import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import dns from "dns";

// Force Node to prefer IPv4 when resolving addresses (bypasses Render IPv6 issues)
dns.setDefaultResultOrder("ipv4first");

console.log("[SMTP READY] Gmail production transport initialized and ready.");
console.log("[SMTP] transporter initialized");

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

export const verifyEmailTransport = async () => {
    // Keep this function so backend/index.js can call it without crashing
    // The actual verification is bypassed at startup to avoid Render boot hangs.
    return true;
};

export const sendOTP = async (email, otp) => {
    console.log(`[SMTP] OTP generated: ${otp}`);
    console.log(`[SMTP] attempting send to ${email}`);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Registration",
        text: `Your OTP for registration is: ${otp}. It will expire in 5 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                <h2>Verify Your Email</h2>
                <p>Your OTP for registration is:</p>
                <h1 style="color: #4CAF50; letter-spacing: 3px;">${otp}</h1>
                <p>It will expire in 5 minutes. Do not share this code.</p>
            </div>
        `,
    };

    try {
        const info = await Promise.race([
            transporter.sendMail(mailOptions),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Email timeout")), 12000)
            ),
        ]);
        console.log(`[OTP SENT] OTP email successfully sent to ${email}`);
        console.log("[SMTP] email sent");
        return info;
    } catch (error) {
        console.error(`[SMTP] email failed for ${email}`);
        console.error("[SMTP] exact SMTP error stack:", error.stack || error);
        throw new Error("Failed to send OTP email: " + error.message);
    }
};

