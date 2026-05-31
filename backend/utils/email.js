import dotenv from "dotenv";
dotenv.config();
import brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export const sendOTPEmail = async (to, otp) => {
  try {
    console.log("[BREVO SEND ATTEMPT]", to);

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL,
    };

    sendSmtpEmail.to = [{ email: to }];

    sendSmtpEmail.subject = "HireSense OTP Verification";

    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>HireSense Email Verification</h2>

        <p>Your verification OTP is:</p>

        <h1 style="
          letter-spacing: 6px;
          font-size: 36px;
          color: #00ff95;
        ">
          ${otp}
        </h1>

        <p>This OTP expires in 5 minutes.</p>

        <p>Please do not share this OTP.</p>
      </div>
    `;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("[BREVO SUCCESS]", to);

    return response;
  } catch (error) {
    console.error(
      "[BREVO FAILURE]",
      error?.response?.body || error.message
    );

    throw new Error("Failed to send OTP email");
  }
};

export const sendPasswordResetEmail = async (to, resetUrl) => {
  try {
    console.log("[BREVO PASSWORD RESET SEND ATTEMPT]", to);

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL,
    };

    sendSmtpEmail.to = [{ email: to }];

    sendSmtpEmail.subject = "HireSense Password Reset Link";

    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
        <h2 style="color: #00ff88; text-align: center;">HireSense Password Reset Request</h2>
        <p style="font-size: 16px; color: #333333; line-height: 1.5;">You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p style="font-size: 16px; color: #333333; line-height: 1.5; text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="
            display: inline-block;
            background-color: #00ff88;
            color: #0a0a0a;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
          ">
            Reset Password
          </a>
        </p>
        <p style="font-size: 14px; color: #666666; line-height: 1.5;">This reset link will expire in <strong>15 minutes</strong>.</p>
        <p style="font-size: 14px; color: #666666; line-height: 1.5;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999999; text-align: center;">This is an automated email from HireSense AI Recruitment Platform.</p>
      </div>
    `;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("[BREVO PASSWORD RESET SUCCESS]", to);

    return response;
  } catch (error) {
    console.error(
      "[BREVO PASSWORD RESET FAILURE]",
      error?.response?.body || error.message
    );

    throw new Error("Failed to send password reset email");
  }
};

export const sendResetOtpEmail = async (to, otp) => {
  try {
    console.log("[BREVO SEND ATTEMPT]", to);

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL,
    };

    sendSmtpEmail.to = [{ email: to }];

    sendSmtpEmail.subject = "HireSense Password Reset OTP";

    sendSmtpEmail.htmlContent = `
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
    `;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("[BREVO SUCCESS]", to);

    return response;
  } catch (error) {
    console.error(
      "[BREVO FAILURE]",
      error?.response?.body || error.message
    );

    throw new Error("Failed to send OTP email");
  }
};


