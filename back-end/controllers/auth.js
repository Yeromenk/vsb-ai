import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    req.body.username = req.body.username.trim();
    req.body.email = req.body.email.trim();
    req.body.password = req.body.password.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: req.body.email }, { username: req.body.username }],
      },
    });

    if (req.body.username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (req.body.password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // TODO Add later to project !!!
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    // if (!passwordRegex.test(req.body.password)) {
    //     return res.status(400).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
    // }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
      },
    });
    if (!newUser) {
      return res.json({ message: 'Error creating user' });
    }

    const token = jwt.sign({ id: newUser.id }, 'jwtkey');
    const { password, ...other } = newUser;

    res
      .cookie('access_token', token, {
        httpOnly: true,
      })
      .status(201)
      .json({
        ...other,
        message: 'Registration successful',
      });
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
};

export const login = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: req.body.email }, { username: req.body.username }],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, 'jwtkey');
    const { password, ...other } = user;

    res
      .cookie('access_token', token, {
        httpOnly: true,
      })
      .status(200)
      .json(other);
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
};

export const logout = (req, res) => {
  try {
    res
      .clearCookie('access_token', {
        sameSite: 'None',
        secure: true,
      })
      .status(200)
      .json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.cookies['access_token'];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    req.user = jwt.verify(token, 'jwtkey');
    next();
  } catch (error) {
    res.status(403).json({ message: 'Forbidden' });
  }
};

// Configure GitHub OAuth strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Check if a user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: profile.emails?.[0]?.value },
            { githubId: profile.id }
          ]
        }
      });

      // If a user doesn't exist, create a new one
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value || `github-${profile.id}@example.com`,
            username: profile.username || profile.displayName,
            password: bcrypt.hashSync(Math.random().toString(36).slice(-8), 10), // Random password
            githubId: profile.id
          }
        });
      }
      // If a user exists but doesn't have githubId, update it
      else if (!user.githubId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { githubId: profile.id }
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Add the GitHub callback handler
export const githubCallback = async (req, res) => {
  try {
    const token = jwt.sign({ id: req.user.id }, 'jwtkey');

    res.cookie('access_token', token, {
      httpOnly: true,
    });

    res.cookie('user_data', JSON.stringify({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    }), {
      httpOnly: false
    })

    // Redirect to home page after successful login
    res.redirect('http://localhost:3001/home');
  } catch (error) {
    res.redirect('http://localhost:3001/login?error=github-auth-failed');
  }
};

// Add this to your existing auth.js file alongside the GitHub strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    scope: ['profile', 'email']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Check if a user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: profile.emails?.[0]?.value },
            { googleId: profile.id }
          ]
        }
      });

      // If a user doesn't exist, create a new one
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value || `google-${profile.id}@example.com`,
            username: profile.displayName || `user-${profile.id}`,
            password: bcrypt.hashSync(Math.random().toString(36).slice(-8), 10), // Random password
            googleId: profile.id
          }
        });
      }
      // If a user exists but doesn't have googleId, update it
      else if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id }
        });
      }

      return done(null, user);
    } catch (err) {
      console.log("Google auth error:", err);
      return done(err);
    }
  }
));

// Add Google callback handler
export const googleCallback = async (req, res) => {
  try {
    const token = jwt.sign({ id: req.user.id }, 'jwtkey');

    res.cookie('access_token', token, {
      httpOnly: true,
    });

    res.cookie('user_data', JSON.stringify({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    }), {
      httpOnly: false
    });

    // Redirect to home page after successful login
    res.redirect('http://localhost:3001/home');
  } catch (error) {
    res.redirect('http://localhost:3001/login?error=google-auth-failed');
  }
};

export default verifyToken;
