import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { secret } from "../config";
import {z} from 'zod';
import { userModel } from "../models/userModel";
import { JwtPayload, User } from "../types";
import { sendResetEmail } from "../utils/email";

const router = Router();
const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    maxAge: 7 * 60 * 60 * 1000
}

const signupSchema = z.object({
    name: z.string().min(2).max(100).regex(/^[A-Za-z. ]+$/),
    email: z.email(),
    password: z.string().min(8).max(128)
})

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(128)
});

router.post('/signup', async (req, res) => {
    const parsedData = signupSchema.safeParse(req.body);
    if(!parsedData.success) return res.status(400).json({error: parsedData.error.issues.map((issue) => issue.message) });
    try{
        const {name, email, password} = parsedData.data;
        const existingUser = await userModel.findOne({email});
        if(existingUser) return res.status(403).json({message: "email already exist"});
        const hashPass = await bcrypt.hash(password, 12);
        await userModel.create({
            name, email, password: hashPass
        });
        const token = jwt.sign({
            email
        }, secret, {expiresIn: '7h'});
        res.cookie("token", token, cookieOptions);
        return res.status(201).json({message: "Signup Successfull", token })
    }catch(e){
        console.error("Signup Error: ", e);
        return res.status(500).json({message: "Internal Server Error"});
    }
})

router.post('/login', async (req, res) => {
    const parsedData = loginSchema.safeParse(req.body);
    if(!parsedData.success) return res.status(400).json({error: parsedData.error.issues.map((issue) => issue.message)});
    try{
        const {email ,password} = parsedData.data;
        const existingUser = await userModel.findOne({email});
        if(!existingUser) return res.status(404).json({message: "User not found"});
        const passMatch = await bcrypt.compare(password, existingUser.password);
        if(!passMatch) return res.status(403).json({message: "Incorrect Password"});
        const token = jwt.sign({
            email
        }, secret, {expiresIn: '7h'});
        res.cookie("token", token, cookieOptions);
        return res.status(200).json({message: "Login Successfull", token});
    }catch(e){
        console.error("Login Error: ", e);
        return res.status(500).json({message: "Internal Server Error"});
    }
})

router.post('/logout', (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({message: "Logout Successfully"});
})

router.get('/me', async (req, res) => {
    try{
        const token = req.cookies?.token;
        if(!token) return res.status(401).json({message: "Unauthorized"});
        const decodeToken = jwt.verify(token, secret) as JwtPayload;
        const user: User | null = await userModel.findOne({email: decodeToken.email}).lean();
        if(!user) return res.status(404).json({message: "User not found"});
        return res.status(200).json({name: user.name, email: user.email})
    }catch(e){
        console.error("Login Error: ", e);
        return res.status(500).json({message: "Internal Server Error"});
    }
})

router.post('/reset-password', async (req, res) => {
    try{
        const { email } = req.body;
        if(!email) return res.status(400).json({message: "Email Required"});
        const user = await userModel.findOne({email});
        if (!user) return res.status(404).json({ message: "Email does not exist" });
        const resetToken = jwt.sign(
            { email: user.email, id: user._id }, secret, { expiresIn: '10min' }                   
        );
        user.resetToken = resetToken;
        user.resetTokenExpires = new Date(Date.now() + 10*60*1000);
        await user.save();
        await sendResetEmail(user.email, resetToken);
        return res.status(200).json({ message: "Reset link has been sent." });
    }catch(e){
        console.error("Rest password Error: ", e);
        return res.status(500).json({message: "Internal Server Error"});
    }
});

router.post('/reset-password/confirm', async(req, res) => {
    try{
        const {token, password} = req.body;
        if(!token || !password) return res.status(400).json({message: "Token and new password are required"});
        let decoded: any;
        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        const user = await userModel.findById(decoded.id);
        if(!user) return res.status(404).json({message: "User not found"});
        if (user.resetToken !== token || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        const hashPass = await bcrypt.hash(password, 12);
        user.password = hashPass;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();
        return res.status(200).json({message: "Password has been reset successfully"});
    }catch(e){
        console.error("Reset Password error: ", e);
        return res.status(500).json({message: "Internal Server Error"})
    }
})

export const userRouter = router;