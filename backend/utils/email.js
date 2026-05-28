import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP VERIFY ERROR:", error);
    } else {
        console.log("SMTP READY");
    }
});

export const verifyEmailTransport = async () => {
    // Keep this function so backend/index.js can call it without crashing
    // The actual verification is already happening asynchronously above.
    return true;
};

export const sendOTP = async (email, otp) => {
    console.log(`[SMTP] Attempting to send OTP email to ${email}`);

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

    // Timeout-safe handler: reject after 15 seconds
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SMTP connection timed out (15s limit reached)")), 15000)
    );

    try {
        const info = await Promise.race([emailPromise, timeoutPromise]);
        console.log(`[SMTP] OTP email successfully sent to ${email}. Message ID: ${info?.messageId}`);
        return info;
    } catch (error) {
        console.error(`[SMTP] OTP email send failed for ${email}:`, error);
        throw new Error("Failed to send OTP email: " + error.message);
    }
};

