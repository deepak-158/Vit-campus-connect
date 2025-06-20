const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const passport = require('../utils/passport');

// Register
router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('email', 'Email must be a VIT Bhopal email').matches(/@vitbhopal\.ac\.in$/),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('role', 'Role must be either hosteller or dayscholar').isIn(['hosteller', 'dayscholar'])
  ],
  authController.register
);

// Verify email
router.post('/verify-email', authController.verifyEmail);

// Send OTP
router.post('/send-otp', authController.sendOTP);

// Verify OTP
router.post('/verify-otp', authController.verifyOTP);

// Login
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  authController.login
);

// Request password reset
router.post('/forgot-password', authController.requestPasswordReset);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

// Google OAuth Routes - only add if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    authController.googleCallback
  );
} else {
  // Fallback routes for when Google credentials aren't configured
  router.get('/google', (req, res) => {
    console.error('Google OAuth credentials not configured');
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_not_configured`);
  });
  
  router.get('/google/callback', (req, res) => {
    console.error('Google OAuth credentials not configured');
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_not_configured`);
  });
}

module.exports = router;
