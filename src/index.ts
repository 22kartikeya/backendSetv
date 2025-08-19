import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { frontend_url, mongo_url } from './config';
import mongoose from 'mongoose';
import { userRouter } from './routes/userRoutes';

const app = express();

app.use(express.json());
app.use(cors({
  origin: frontend_url,
  credentials: true,
}));

app.use(cookieParser());

app.use('/api/v1', userRouter);
const startServer = async () => {
    try{
        await mongoose.connect(mongo_url);
        console.log("mongodb connected!");
        app.listen(3000, () => {
            console.log('app is listening on port 3000');
        })
    }catch(e){
        console.log("failed to connect mongodb: ", e);
        process.exit(1);
    }
}

startServer();