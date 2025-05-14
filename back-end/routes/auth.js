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

export default router;
