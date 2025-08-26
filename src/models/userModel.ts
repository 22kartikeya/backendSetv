import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    resetToken: { type: String },
    resetTokenExpires: { type: Date }  
});

export const userModel = mongoose.model('user', userSchema);