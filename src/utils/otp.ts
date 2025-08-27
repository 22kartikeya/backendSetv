import nodemailer from 'nodemailer';
import { MAIL, MAIL_PASS, MAIL_SENDER } from '../config';
export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: MAIL,
            pass: MAIL_PASS
        }
    });
    
    await transporter.sendMail({
        from: `${MAIL_SENDER} <${MAIL}>`,
        to: email,
        subject: "Your verification OTP",
        html: `<div style="font-family:sans-serif; line-height:1.5; color:#333;">
            <h2>Gene-o-mere verification OTP 🔑</h2>
            <p>Hello,</p>
            <p>Your OTP is ${otp}.</p>
            <p><strong>Note:</strong> This OTP will expire in 3 minutes.</p>
            <p>If you did not request this, ignore this email.</p>
            <p>— Gene-o-mere Team</p>
        </div>`
    })
}