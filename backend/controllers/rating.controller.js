const { Rating, User, Request, Product, Notification } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

// Create a new rating for a request
exports.rateRequest = async (req, res) => {
  try {
    const { requestId, rating, comment } = req.body;
    
    // Validate request
    const request = await Request.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if the request is completed
    if (request.status !== 'delivered' || !request.isCompleted) {
      return res.status(400).json({ message: 'You can only rate completed requests' });
    }
    
    // Check if user is associated with the request
    if (request.requesterId !== req.user.id && request.delivererId !== req.user.id) {
      return res.status(403).json({ message: 'You are not associated with this request' });
    }
    
    // Determine who is being rated
    const raterIsRequester = req.user.id === request.requesterId;
    const ratedUserId = raterIsRequester ? request.delivererId : request.requesterId;
    
    // Check if user has already rated this request
    const existingRating = await Rating.findOne({
      where: {
        raterId: req.user.id,
        ratedUserId,
        requestId,
        transactionType: 'request'
      }
    });
    
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this request' });
    }
    
    // Create rating
    const newRating = await Rating.create({
      raterId: req.user.id,
      ratedUserId,
      requestId,
      rating,
      comment,
      transactionType: 'request',
      createdAt: new Date()
    });
    
    // Create notification for rated user
    await Notification.create({
      userId: ratedUserId,
      title: 'New Rating',
      message: `You have received a new rating for a request.`,
      type: 'request',
      relatedId: requestId
    });
    
    // Update user's average rating
    await updateUserRating(ratedUserId);
    
    // Add points to the rater
    const rater = await User.findByPk(req.user.id);
    rater.points += 2; // 2 points for rating someone
    await rater.save();
    
    res.status(201).json({ 
      message: 'Rating submitted successfully', 
      rating: newRating 
    });
  } catch (error) {
    console.error('Rate request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new rating for a product transaction
exports.rateProduct = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Validate product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if the product is sold
    if (product.status !== 'sold') {
      return res.status(400).json({ message: 'You can only rate sold products' });
    }
    
    // Check if user is the seller or a buyer (assumption: only hostellers can buy)
    const isSeller = product.sellerId === req.user.id;
    
    if (!isSeller && req.user.role !== 'hosteller') {
      return res.status(403).json({ message: 'You are not associated with this product' });
    }
    
    // Determine who is being rated
    const ratedUserId = isSeller ? req.body.buyerId : product.sellerId;
    
    // Validate buyer ID if seller is rating
    if (isSeller && !req.body.buyerId) {
      return res.status(400).json({ message: 'Buyer ID is required' });
    }
    
    // Check if user has already rated this transaction
    const existingRating = await Rating.findOne({
      where: {
        raterId: req.user.id,
        ratedUserId,
        productId,
        transactionType: 'product'
      }
    });
    
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this transaction' });
    }
    
    // Create rating
    const newRating = await Rating.create({
      raterId: req.user.id,
      ratedUserId,
      productId,
      rating,
      comment,
      transactionType: 'product',
      createdAt: new Date()
    });
    
    // Create notification for rated user
    await Notification.create({
      userId: ratedUserId,
      title: 'New Rating',
      message: `You have received a new rating for a product transaction.`,
      type: 'product',
      relatedId: productId
    });
    
    // Update user's average rating
    await updateUserRating(ratedUserId);
    
    // Add points to the rater
    const rater = await User.findByPk(req.user.id);
    rater.points += 2; // 2 points for rating someone
    await rater.save();
    
    res.status(201).json({ 
      message: 'Rating submitted successfully', 
      rating: newRating 
    });
  } catch (error) {
    console.error('Rate product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get ratings for a user
exports.getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const ratings = await Rating.findAll({
      where: { ratedUserId: userId },
      include: [
        {
          model: User,
          as: 'rater',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: Request,
          as: 'request',
          attributes: ['id', 'itemName', 'status'],
          required: false
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'status'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ ratings });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to update a user's average rating
const updateUserRating = async (userId) => {
  try {
    const result = await Rating.findOne({
      where: { ratedUserId: userId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ]
    });
    
    const averageRating = result.getDataValue('averageRating') || 0;
    
    await User.update(
      { averageRating: parseFloat(averageRating).toFixed(1) },
      { where: { id: userId } }
    );
  } catch (error) {
    console.error('Update user rating error:', error);
    throw error;
  }
};
