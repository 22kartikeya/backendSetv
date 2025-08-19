import dotenv from 'dotenv';
dotenv.config();

export const secret = process.env.SECRET || "";
export const frontend_url = process.env.FRONTEND_URL || "";
export const mongo_url = process.env.MONGO_URI || "";