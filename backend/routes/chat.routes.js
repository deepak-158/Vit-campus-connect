const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const auth = require('../middleware/auth');

// Send a new message
router.post('/', auth, chatController.sendMessage);

// Get conversation between two users
router.get('/conversation/:userId', auth, chatController.getConversation);

// Get all conversations for current user
router.get('/conversations', auth, chatController.getAllConversations);

// Get all messages related to a request
router.get('/request/:requestId', auth, chatController.getRequestMessages);

// Get all messages related to a product
router.get('/product/:productId', auth, chatController.getProductMessages);

module.exports = router;
