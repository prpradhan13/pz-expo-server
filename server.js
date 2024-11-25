import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { clerkClient, clerkMiddleware } from '@clerk/express';
import expenseRoute from './routes/expense.route.js';
import trainingRoute from './routes/training.route.js';
import todoRoute from './routes/todo.route.js';
import connectDB from './config/db.js';

dotenv.config({
    path: './.env'
});

connectDB();

const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
};
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 100 // limit each IP to 100 requests per windowMs
})

app.use(cors(corsOptions));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(cookieParser());
app.use(helmet());
// app.use(limiter);
app.use(morgan('combined'));

app.use(clerkMiddleware());

app.use('/api/v1/expense', expenseRoute)
app.use('/api/v1/training', trainingRoute)
app.use('/api/v1/todo', todoRoute)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server Working fine! ${PORT}`);
})