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
