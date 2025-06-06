import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passportLdapauth from 'passport-ldapauth';
import crypto from 'crypto';
import { transporter } from '../config/email.js';

const LdapStrategy = passportLdapauth.Strategy;

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

    // check if password contains a required pattern
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
        isEmailVerified: false,
        verificationToken: verificationToken,
        verificationTokenExpiry: verificationTokenExpiry,
      },
    });

    if (!newUser) {
      return res.json({ message: 'error creating user' });
    }

    // Send verification email
    const verificationUrl = `http://localhost:3001/verify-email/${verificationToken}`;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3a5bc7;">Welcome to VSB AI Assistant!</h2>
            <p>Thank you for registering. Please verify your email by clicking the link below:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4b70e2; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
            <p>Or copy and paste this URL into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
             <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    This is an automated message from the VSB AI Assistant. Please do not reply to this email.
                </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('error sending verification email:', emailError);
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
        message: 'Registration successful. Please check your email to verify your account.',
        requiresVerification: true,
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

    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'jwtkey');
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

// logout
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

// verify token
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
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        // Check if a user exists
        let user = await prisma.user.findFirst({
          where: {
            OR: [{ email: profile.emails?.[0]?.value }, { githubId: profile.id }],
          },
        });

        // If a user doesn't exist, create a new one
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0]?.value || `github-${profile.id}@example.com`,
              username: profile.username || profile.displayName,
              password: bcrypt.hashSync(Math.random().toString(36).slice(-8), 10), // Random password
              githubId: profile.id,
              isEmailVerified: true,
            },
          });
        }
        // If a user exists but doesn't have githubId, update it
        else if (!user.githubId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              githubId: profile.id,
              isEmailVerified: true,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// GitHub login callback
export const githubCallback = async (req, res) => {
  try {
    const token = jwt.sign({ id: req.user.id }, 'jwtkey');

    res.cookie('access_token', token, {
      httpOnly: true,
    });

    res.cookie(
      'user_data',
      JSON.stringify({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
      }),
      {
        httpOnly: false,
      }
    );

    // Redirect to home page after successful login
    res.redirect('http://localhost:3001/home');
  } catch (error) {
    res.redirect('http://localhost:3001/login?error=github-auth-failed');
  }
};

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        // Check if a user exists
        let user = await prisma.user.findFirst({
          where: {
            OR: [{ email: profile.emails?.[0]?.value }, { googleId: profile.id }],
          },
        });

        // If a user doesn't exist, create a new one
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0]?.value || `google-${profile.id}@example.com`,
              username: profile.displayName || `user-${profile.id}`,
              password: bcrypt.hashSync(Math.random().toString(36).slice(-8), 10), // Random password
              googleId: profile.id,
              isEmailVerified: true,
            },
          });
        }
        // If a user exists but doesn't have googleId, update it
        else if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              isEmailVerified: true,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        console.log('Google auth error:', err);
        return done(err);
      }
    }
  )
);

// Google login callback
export const googleCallback = async (req, res) => {
  try {
    const token = jwt.sign({ id: req.user.id }, 'jwtkey');

    res.cookie('access_token', token, {
      httpOnly: true,
    });

    res.cookie(
      'user_data',
      JSON.stringify({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
      }),
      {
        httpOnly: false,
      }
    );

    // Redirect to home page after successful login
    res.redirect('http://localhost:3001/home');
  } catch (error) {
    res.redirect('http://localhost:3001/login?error=google-auth-failed');
  }
};

// LDAP config
const LDAP_OPTIONS = {
  server: {
    url: process.env.LDAP_URL,
    searchBase: 'ou=USERS,o=VSB',
    searchFilter: '(cn={{username}})',
    tlsOptions: { rejectUnauthorized: false },
  },
};

// register LDAP strategy
passport.use(
  'vsb',
  new LdapStrategy(LDAP_OPTIONS, async (ldapUser, done) => {
    try {
      // find or create a local user
      let user = await prisma.user.findUnique({ where: { vsbId: ldapUser.cn } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            username: ldapUser.cn,
            email: ldapUser.mail || `${ldapUser.cn}@vsb.cz`,
            password: bcrypt.hashSync(Math.random().toString(36), 10),
            vsbId: ldapUser.cn,
            isEmailVerified: true,
          },
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// VSB login callback
export const vsbCallback = (req, res) => {
  const token = jwt.sign({ id: req.user.id }, 'jwtkey');

  res.cookie('access_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  res.cookie(
    'user_data',
    JSON.stringify({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    }),
    { httpOnly: false }
  );

  res.status(200).json({ message: 'VSB login successful' });
};
export default verifyToken;
