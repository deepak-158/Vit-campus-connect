const { User, Request, Product } = require('../models');
const { Op } = require('sequelize');

// Get hosteller dashboard stats
exports.getHostellerStats = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    // For testing without auth
    if (!userId) {
      return res.status(200).json({
        stats: {
          pendingRequests: 0,
          completedRequests: 0,
          activeProducts: 0,
          soldProducts: 0
        }
      });
    }

    // Default empty stats
    const stats = {
      pendingRequests: 0,
      completedRequests: 0,
      activeProducts: 0,
      soldProducts: 0
    };

    try {      // Get counts for various metrics
      const pendingRequests = await Request.count({ 
        where: { 
          requesterId: userId, 
          status: { [Op.in]: ['pending', 'accepted'] } 
        } 
      });
        const completedRequests = await Request.count({ 
        where: { 
          requesterId: userId, 
          status: 'completed'
        } 
      });

      const activeProducts = await Product.count({ 
        where: { 
          sellerId: userId, 
          status: 'available' 
        } 
      });

      const soldProducts = await Product.count({ 
        where: { 
          sellerId: userId, 
          status: 'sold' 
        } 
      });

      stats.pendingRequests = pendingRequests || 0;
      stats.completedRequests = completedRequests || 0;      stats.activeProducts = activeProducts || 0;
      stats.soldProducts = soldProducts || 0;
    } catch (dbError) {
      console.error('Database error in hosteller stats:', dbError);
    }

    // Return stats
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error getting hosteller stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recent requests for hosteller
exports.getRecentRequests = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    // For testing without auth
    if (!userId) {
      return res.status(200).json({ requests: [] });
    }
    
    // Get recent requests
    const requests = await Request.findAll({
      where: { requesterId: userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        { 
          model: User, 
          as: 'deliverer',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'averageRating'] 
        }
      ]
    });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error('Error getting recent requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recent products for hosteller
exports.getRecentProducts = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    // For testing without auth
    if (!userId) {
      return res.status(200).json({ products: [] });
    }

    // Get recent products
    const products = await Product.findAll({
      where: { sellerId: userId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error getting recent products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get dayscholar dashboard stats
exports.getDayscholarStats = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    // For testing without auth
    if (!userId) {
      return res.status(200).json({
        stats: {
          pendingDeliveries: 0,
          completedDeliveries: 0,
          totalEarnings: 0,
          availableRequests: 0
        }
      });
    }
    
    // Default empty stats
    const stats = {
      pendingDeliveries: 0,
      completedDeliveries: 0,
      totalEarnings: 0,
      availableRequests: 0
    };

    try {      // Get counts for various metrics
      const pendingDeliveries = await Request.count({ 
        where: { 
          delivererId: userId, 
          status: { [Op.in]: ['accepted'] }
        } 
      });
        const completedDeliveries = await Request.count({ 
        where: { 
          delivererId: userId, 
          status: 'completed'
        } 
      });

      const availableRequests = await Request.count({ 
        where: { 
          status: 'pending',
          delivererId: null
        } 
      });      // Calculate total earnings (completed deliveries)
      const completedDeliveriesData = await Request.findAll({
        where: { 
          delivererId: userId, 
          status: 'completed'
        },
        attributes: ['expectedPrice']
      });

      const totalEarnings = completedDeliveriesData.reduce((sum, item) => sum + (item.expectedPrice || 0), 0);

      stats.pendingDeliveries = pendingDeliveries || 0;
      stats.completedDeliveries = completedDeliveries || 0;
      stats.totalEarnings = totalEarnings || 0;
      stats.availableRequests = availableRequests || 0;
    } catch (dbError) {
      console.error('Database error in dayscholar stats:', dbError);    }

    // Return stats
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error getting dayscholar stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get active deliveries for dayscholar
exports.getActiveDeliveries = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    
    // For testing without auth
    if (!userId) {
      return res.status(200).json({ deliveries: [] });
    }    // Get active deliveries
    const deliveries = await Request.findAll({
      where: { 
        delivererId: userId, 
        status: 'accepted'
      },
      order: [['createdAt', 'DESC']],
      include: [
        { 
          model: User, 
          as: 'requester',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'hostelBlock', 'roomNumber', 'averageRating'] 
        }
      ]
    });

    res.status(200).json({ deliveries });
  } catch (error) {
    console.error('Error getting active deliveries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available requests for dayscholar
exports.getAvailableRequests = async (req, res) => {
  try {
    // Get available requests
    const requests = await Request.findAll({
      where: { 
        status: 'pending',
        delivererId: null
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [
        { 
          model: User, 
          as: 'requester',
          attributes: ['id', 'name', 'email', 'avatar', 'hostelBlock', 'roomNumber', 'averageRating'] 
        }
      ]
    });
    
    res.status(200).json({ requests });
  } catch (error) {
    console.error('Error getting available requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
