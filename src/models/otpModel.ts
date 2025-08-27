import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 180 } // Mongo auto-deletes after 180s
});

export const otpModel = mongoose.model('Otp', otpSchema);