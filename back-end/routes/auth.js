import express from 'express';
import verifyToken, {
  githubCallback,
  googleCallback,
  login,
  logout,
  register,
  vsbCallback,
} from '../controllers/auth.js';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  githubCallback
);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

router.get('/validate-session', verifyToken, (req, res) => {
  try {
    res.status(200).json({ valid: true });
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// VSB login
router.post('/vsb/login', (req, res, next) => {
  passport.authenticate('vsb', (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error during authentication' });
    }

    if (!user) {
      return res.status(401).json({
        message: 'Invalid VSB credentials',
      });
    }

    // Authentication successful, proceed with login
    req.login(user, err => {
      if (err) {
        return res.status(500).json({ message: 'Session error' });
      }
      return vsbCallback(req, res);
    });
  })(req, res, next);
});

// profile info
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        isEmailVerified: true,
        githubId: true,
        googleId: true,
        vsbId: true,
        apiKey: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
});

// account deletion
router.delete('/delete-account', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all user's chats and related data
    await prisma.chat.deleteMany({
      where: { userId },
    });

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
