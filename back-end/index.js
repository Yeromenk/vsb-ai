import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import formatAI from './routes/chats.js';
import translateRoutes from './routes/translate.js';
import fileRoutes from './routes/file.js';
import summarizeRoutes from './routes/format.js';
import customRoutes from './routes/custom.js';
import emailRoutes from './routes/email.js';
import { connectToDatabase, prisma } from './prisma/db.js';

const app = express();
const port = 3000;

// 1. CORS and basic middleware
app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 2. Session and passport middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 3. Configure passport session handlers
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// 4. Routes
app.use('/auth', authRoutes);
app.use('/ai', formatAI);
app.use('/ai', translateRoutes)
app.use('/ai', fileRoutes)
app.use('/ai', summarizeRoutes)
app.use('/ai', customRoutes)
app.use('/ai', emailRoutes)

connectToDatabase();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});