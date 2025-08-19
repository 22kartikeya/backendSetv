import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
}) 

export const userModel = mongoose.model('user', userSchema);