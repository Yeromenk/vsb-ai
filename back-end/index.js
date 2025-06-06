import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import chatsAi from './routes/chats.js';
import translateRoutes from './routes/translate.js';
import fileRoutes from './routes/file.js';
import emailAssistantRoutes from './routes/email-assistant.js';
import summarizeRoutes from './routes/format.js';
import customRoutes from './routes/custom.js';
import emailRoutes from './routes/email.js';
import editMessageRoutes from './routes/edit-message.js';
import searchChats from './routes/search.js';
import accountRoutes from './routes/account.js';
import shareRoutes from './routes/shareChat.js';
import aiModelRoutes from './routes/aiModels.js';
import apiKeyRoutes from './routes/apiKey.js';
import adminRoutes from './routes/admin.js';
import verifyToken from './controllers/auth.js';
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
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// 3. Configure passport session handlers
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// 4. Routes
app.use('/auth', authRoutes);
app.use('/ai', chatsAi);
app.use('/ai', translateRoutes);
app.use('/ai', fileRoutes);
app.use('/ai', emailAssistantRoutes);
app.use('/ai', summarizeRoutes);
app.use('/ai', customRoutes);
app.use('/ai', emailRoutes);
app.use('/ai', editMessageRoutes);
app.use('/ai', searchChats);
app.use('/ai', shareRoutes);
app.use('/account', accountRoutes);
app.use('/ai', aiModelRoutes);
app.use('/ai', apiKeyRoutes);
app.use('/admin', verifyToken, adminRoutes);

connectToDatabase();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
