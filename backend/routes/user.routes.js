const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, userController.getProfile);

// Get user by ID
router.get('/:id', auth, userController.getUserById);

// Update user profile
router.put('/profile', auth, userController.updateProfile);

// Complete Google profile
router.put('/complete-google-profile', auth, userController.completeGoogleProfile);

// Change password
router.put('/change-password', auth, userController.changePassword);

// Upload avatar
router.post('/avatar', auth, userController.uploadAvatar);

// Get top users by points (leaderboard)
router.get('/leaderboard', auth, userController.getLeaderboard);

module.exports = router;
