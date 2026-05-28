import nodemailer from "nodemailer";

let transporter = null;
let smtpVerified = false;

const getTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("EMAIL_USER and EMAIL_PASS must be configured");
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    return transporter;
};

export const verifyEmailTransport = async () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("SMTP not configured: EMAIL_USER and EMAIL_PASS are required");
        return false;
    }

    try {
        await getTransporter().verify();
        smtpVerified = true;
        console.log("SMTP READY");
        return true;
    } catch (error) {
        console.error("SMTP verification failed:", error);
        return false;
    }
};

export const sendOTP = async (email, otp) => {
    const transport = getTransporter();

    if (!smtpVerified) {
        await transport.verify();
        smtpVerified = true;
        console.log("SMTP READY");
    }

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
        const info = await transport.sendMail(mailOptions);
        console.log("OTP SENT", { to: email, messageId: info?.messageId });
        return info;
    } catch (error) {
        console.error("OTP email send failed:", error);
        throw new Error("Failed to send OTP email: " + error.message);
    }
};
