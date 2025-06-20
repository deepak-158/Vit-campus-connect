const { Message, User, Request, Product, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, requestId, productId } = req.body;
    
    // Validate receiver
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // If related to a request, validate request
    if (requestId) {
      const request = await Request.findByPk(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
      
      // Validate that sender is either requester or deliverer
      if (request.requesterId !== req.user.id && request.delivererId !== req.user.id) {
        return res.status(403).json({ message: 'You are not associated with this request' });
      }
      
      // Validate that receiver is either requester or deliverer
      if (request.requesterId !== receiverId && request.delivererId !== receiverId) {
        return res.status(403).json({ message: 'Receiver is not associated with this request' });
      }
    }

    // If related to a product, validate product
    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Validate that sender is either seller or a hosteller
      if (product.sellerId !== req.user.id && req.user.role !== 'hosteller') {
        return res.status(403).json({ message: 'You cannot send messages about this product' });
      }
      
      // Validate that receiver is either seller or a hosteller
      if (product.sellerId !== receiverId && receiver.role !== 'hosteller') {
        return res.status(403).json({ message: 'Receiver cannot receive messages about this product' });
      }
    }

    // Create message
    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content,
      requestId,
      productId,
      sentAt: new Date()
    });

    // Create notification for receiver
    await Notification.create({
      userId: receiverId,
      title: 'New Message',
      message: `You have a new message from ${req.user.name}.`,
      type: 'message',
      relatedId: message.id
    });

    res.status(201).json({ 
      message: 'Message sent successfully', 
      data: message 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { requestId, productId } = req.query;
    
    // Validate other user
    const otherUser = await User.findByPk(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const whereClause = {
      [Op.or]: [
        {
          senderId: req.user.id,
          receiverId: userId
        },
        {
          senderId: userId,
          receiverId: req.user.id
        }
      ]
    };

    // If related to a request, filter by requestId
    if (requestId) {
      whereClause.requestId = requestId;
    }

    // If related to a product, filter by productId
    if (productId) {
      whereClause.productId = productId;
    }

    const messages = await Message.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ],
      order: [['sentAt', 'ASC']]
    });

    // Mark unread messages as read
    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: userId,
          receiverId: req.user.id,
          isRead: false
        }
      }
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all conversations for current user
exports.getAllConversations = async (req, res) => {
  try {
    // Get all messages involving the current user
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatar', 'role']
        }
      ],
      order: [['sentAt', 'DESC']]
    });

    // Group messages by other user
    const conversationMap = new Map();
    
    for (const message of messages) {
      const otherUserId = message.senderId === req.user.id ? message.receiverId : message.senderId;
      const otherUser = message.senderId === req.user.id ? message.receiver : message.sender;
      
      if (!conversationMap.has(otherUserId)) {
        // Count unread messages from this user
        const unreadCount = await Message.count({
          where: {
            senderId: otherUserId,
            receiverId: req.user.id,
            isRead: false
          }
        });
        
        conversationMap.set(otherUserId, {
          user: otherUser,
          latestMessage: message,
          unreadCount
        });
      }
    }
    
    // Convert map to array and sort by latest message time
    const conversationDetails = Array.from(conversationMap.values());
    conversationDetails.sort((a, b) => {
      return new Date(b.latestMessage.sentAt) - new Date(a.latestMessage.sentAt);
    });

    res.status(200).json({ conversations: conversationDetails });
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all messages related to a request
exports.getRequestMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Validate request
    const request = await Request.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if user is associated with the request
    if (request.requesterId !== req.user.id && request.delivererId !== req.user.id) {
      return res.status(403).json({ message: 'You are not associated with this request' });
    }

    const messages = await Message.findAll({
      where: { requestId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ],
      order: [['sentAt', 'ASC']]
    });

    // Mark unread messages as read
    await Message.update(
      { isRead: true },
      {
        where: {
          requestId,
          receiverId: req.user.id,
          isRead: false
        }
      }
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get request messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all messages related to a product
exports.getProductMessages = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the seller
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the seller of this product' });
    }

    const messages = await Message.findAll({
      where: { productId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ],
      order: [['sentAt', 'ASC']]
    });

    // Mark unread messages as read
    await Message.update(
      { isRead: true },
      {
        where: {
          productId,
          receiverId: req.user.id,
          isRead: false
        }
      }
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get product messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
