import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import authRoutes from './routes/auth.js';
import formatAI from './routes/openAI.js';
import {connectToDatabase} from "./prisma/db.js";


const app = express();
const port = 3000;

app.use(cors( {
    origin: 'http://localhost:3001',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);
app.use('/ai', formatAI)

connectToDatabase();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});