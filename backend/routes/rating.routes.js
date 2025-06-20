const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const auth = require('../middleware/auth');

// Create a new rating for a request
router.post('/request', auth, ratingController.rateRequest);

// Create a new rating for a product transaction
router.post('/product', auth, ratingController.rateProduct);

// Get ratings for a user
router.get('/user/:userId', auth, ratingController.getUserRatings);

module.exports = router;
