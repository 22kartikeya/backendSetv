import dotenv from 'dotenv';
dotenv.config();

export const secret = process.env.SECRET || "";
export const frontend_url = process.env.FRONTEND_URL || "";
export const mongo_url = process.env.MONGO_URI || "";
export const MAIL = process.env.MAIL || "";
export const MAIL_PASS = process.env.MAIL_PASS || "";
export const MAIL_SENDER = process.env.MAIL_SENDER || "";