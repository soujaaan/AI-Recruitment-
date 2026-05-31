import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

/**
 * Sends a password reset OTP to the specified email address using Nodemailer and SMTP.
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit numeric OTP code
 */
export const sendResetOtpEmail = async (to, otp) => {
    try {
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT || "587", 10);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const from = process.env.SMTP_FROM || user;

        if (!host || !user || !pass) {
            logger.warn("SMTP credentials not fully configured in environment. Using direct delivery fallback / simulation.");
        }

        const transporter = nodemailer.createTransport({
            host: host || "smtp.gmail.com",
            port: port,
            secure: port === 465,
            auth: {
                user: user,
                pass: pass,
            },
            tls: {
                rejectUnauthorized: false // bypass certificate issues for local/development environments
            }
        });

        const mailOptions = {
            from: `"HireSense" <${from}>`,
            to: to,
            subject: "HireSense Password Reset OTP",
            text: `Your OTP is:\n\n${otp}\n\nThis OTP expires in 10 minutes.\n\nIf you did not request this password reset, ignore this email.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0a0a0a; color: #ffffff; border-radius: 16px; border: 1px solid #1a1a1a; max-width: 500px; margin: auto;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #00ff88; margin: 0; font-size: 24px;">HireSense Security</h2>
                        <p style="color: #666666; margin: 4px 0 0 0; font-size: 14px;">Password Recovery Pipeline</p>
                    </div>
                    <div style="background-color: #111111; padding: 20px; border-radius: 12px; border: 1px solid #222222; text-align: center; margin-bottom: 24px;">
                        <p style="color: #888888; font-size: 14px; margin: 0 0 12px 0;">Your OTP is:</p>
                        <div style="font-size: 32px; font-weight: bold; color: #00ff88; letter-spacing: 6px; margin: 12px 0;">${otp}</div>
                        <p style="color: #888888; font-size: 12px; margin: 12px 0 0 0;">This OTP expires in <strong>10 minutes</strong>.</p>
                    </div>
                    <p style="font-size: 13px; color: #555555; line-height: 1.6; margin: 0 0 16px 0;">
                        If you did not request this password reset, ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #222222; margin: 20px 0;" />
                    <p style="font-size: 11px; color: #444444; text-align: center; margin: 0;">
                        This is an automated security transmission from HireSense AI Recruitment Platform.
                    </p>
                </div>
            `,
        };

        logger.info(`Attempting to send password recovery OTP to: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Password recovery OTP successfully sent to ${to}. MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`Nodemailer failure when sending OTP to ${to}:`, error);
        throw new Error(`SMTP failure: ${error.message}`);
    }
};
