import { Router } from "express";
import otpGenerator from "otp-generator";
import { otpModel } from "../models/otpModel"
import nodemailer from "nodemailer";
import { MAIL, MAIL_PASS, MAIL_SENDER } from "../config";
import bcrypt from 'bcrypt';

const router = Router();

router.post("/send-otp", async (req, res) =>{
    try{
        const { email }: { email: string } = req.body;
        if(!email) return res.status(400).json({message: "Email is required"});

        // rate-limit
        const lastOtp = await otpModel.findOne({email}).sort({createdAt: -1});
        if(lastOtp && Date.now() - lastOtp.createdAt.getTime() < 60 * 1000){
            return res.status(429).json({success: false, message: "Too many requests. Please wait before retrying."})
        }

        const otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false, 
            upperCaseAlphabets: false, 
            digits: true, 
            specialChars: false,
        });
        const hashedOtp = await bcrypt.hash(otp, 10);
        await otpModel.create({email, otp: hashedOtp});
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: MAIL,
                pass: MAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: `${MAIL_SENDER} <${MAIL}>`,
            to: email,
            subject: "Your verification OTP",
            text: `Your OTP is ${otp} (valid for 5 minutes).`
        });
    
        console.log("Message sent:", info.messageId);
        return res.status(200).json({ message: "Mail sent", id: info.messageId });
    }catch(e){
        console.log("error: ", e);
        return res.status(500).json({ success: false, error: "Mail not sent" });
    }
});

router.post('/verify-otp', async (req, res) => {
    try{
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });
        const record = await otpModel.findOne({ email });
        if (!record) return res.status(400).json({ message: "Invalid OTP" });

        const isValid = await bcrypt.compare(otp, record.otp);
        if(!isValid) return res.status(400).json({message: "OTP expired or not found"});
    
        await otpModel.deleteOne({ email });
        return res.json({ message: "OTP verified" });
    }catch(e){
        console.log("error: ", e);
        return res.status(500).json({message: "Internal server error"});
    }
});

export const otpRouter = router;