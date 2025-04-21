import express from 'express';
import verifyToken, { register, login, logout, githubCallback, googleCallback } from '../controllers/auth.js';
import passport from 'passport';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), githubCallback);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallback);

router.get('/validate-session', verifyToken, (req, res) => {
  try {
    res.status(200).json({ valid: true });
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

export default router;
