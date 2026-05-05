import nodemailer from "nodemailer";

export const sendOTP = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

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

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new Error("Failed to send OTP email: " + error.message);
    }
};
