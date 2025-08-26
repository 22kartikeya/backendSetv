import nodemailer from "nodemailer";
import { frontend_url, MAIL, MAIL_PASS, MAIL_SENDER } from "../config";


export const sendResetEmail = async (email: string, token: string) => {
  try {
    const resetLink = `${frontend_url}/reset-password?token=${token}`
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: MAIL,      // kartikeyaved29@gmail.com
        pass: MAIL_PASS, // app password
      },
    });

  const info = await transporter.sendMail({
    from: `"${MAIL_SENDER}" <${MAIL}>`,
    to: email,
    subject: "Reset Your Gene-o-mere Password",
    html: `<div style="font-family:sans-serif; line-height:1.5; color:#333;">
      <h2>Gene-o-mere Password Reset 🔑</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the link below:</p>
      <a href="${resetLink}" style="display:inline-block; margin:10px 0; padding:10px 20px; background-color:#4f46e5; color:white; text-decoration:none; border-radius:5px;">
        Reset Password
      </a>
      <p><strong>Note:</strong> This link will expire in 10 minutes.</p>
      <p>If you did not request this, ignore this email.</p>
      <p>— Gene-o-mere Team</p>
    </div>`,
});

    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};