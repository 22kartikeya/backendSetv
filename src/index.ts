import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { userRouter } from './routes/userRoutes';

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

app.use(cookieParser());
app.use('/api/v1', userRouter);

const startServer = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/setv-db");
        console.log("✅ MongoDB connected!");
        app.listen(3000, () => {
            console.log('App is listening on port 3000');
        });
    } catch (e) {
        console.log("❌ Failed to connect to MongoDB:", e);
        process.exit(1);
    }
};

startServer();