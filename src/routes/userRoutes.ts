import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { secret } from "../config";
import {z} from 'zod';
import { userModel } from "../models/userModel";

const router = Router();
const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    maxAge: 7 * 60 * 60 * 1000
}

const signupSchema = z.object({
    email: z.email(),
    password: z.string().min(4).max(128)
})

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(4).max(128)
});

router.post('/signup', async (req, res) => {
    const parsedData = signupSchema.safeParse(req.body);
    if(!parsedData.success) return res.status(400).json({error: parsedData.error.issues.map((issue) => issue.message) });
    try{
        const {email, password} = parsedData.data;
        const existingUser = await userModel.findOne({email});
        if(existingUser) return res.status(403).json({message: "email already exist"});
        const hashPass = await bcrypt.hash(password, 12);
        await userModel.create({
            email, password: hashPass
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

export const userRouter = router;