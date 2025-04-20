import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import formatAI from './routes/chats.js';
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

connectToDatabase();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});