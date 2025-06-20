const { Request, User, Notification } = require('../models');
const { Op } = require('sequelize');

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const { itemName, description, quantity, expectedPrice, deadline, deliveryLocation, isUrgent, category } = req.body;
    
    // Only hostellers can create requests
    if (req.user.role !== 'hosteller') {
      return res.status(403).json({ message: 'Only hostellers can create item requests' });
    }

    const request = await Request.create({
      requesterId: req.user.id,
      itemName,
      description,
      quantity,
      expectedPrice,
      deadline,
      deliveryLocation,
      isUrgent: isUrgent || false,
      category: category || 'other'
    });

    // Find day scholars to notify
    const dayScholars = await User.findAll({
      where: { role: 'dayscholar', isVerified: true }
    });

    // Create notifications for day scholars
    for (const dayScholar of dayScholars) {
      await Notification.create({
        userId: dayScholar.id,
        title: 'New Item Request',
        message: `A new request for ${itemName} has been posted.`,
        type: 'request',
        relatedId: request.id
      });
    }

    res.status(201).json({ 
      message: 'Request created successfully', 
      request 
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all requests (with filters)
exports.getAllRequests = async (req, res) => {
  try {
    const { status, category, isUrgent, search } = req.query;
    
    // Only day scholars can view all requests
    if (req.user.role !== 'dayscholar' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const whereClause = {};
    
    // Filter by status
    if (status) whereClause.status = status;
    
    // Filter by category
    if (category) whereClause.category = category;
    
    // Filter by urgency
    if (isUrgent === 'true') whereClause.isUrgent = true;
    
    // Filter by search term
    if (search) {
      whereClause[Op.or] = [
        { itemName: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Exclude completed and cancelled requests
    whereClause.status = { [Op.notIn]: ['completed', 'cancelled'] };
    
    const requests = await Request.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'hostelBlock', 'roomNumber', 'averageRating']
        }
      ],
      order: [
        ['isUrgent', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my requests (as hosteller)
exports.getMyRequests = async (req, res) => {
  try {
    console.log('Getting my requests for user:', req.user ? req.user.id : 'No user');
    
    // Only hostellers can view their requests
    if (req.user.role !== 'hosteller') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build where clause
    const whereClause = { requesterId: req.user.id };
    
    // Add status filter if provided
    if (req.query.status && req.query.status !== 'all') {
      whereClause.status = req.query.status;
    }
    
    console.log('Finding requests with where clause:', whereClause);

    const requests = await Request.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'deliverer',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'averageRating']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${requests.length} requests`);
    res.status(200).json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my deliveries (as dayscholar)
exports.getMyDeliveries = async (req, res) => {
  try {
    // Only day scholars can view their deliveries
    if (req.user.role !== 'dayscholar') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Optionally filter by status
    const whereClause = { delivererId: req.user.id };
    if (req.query.status && req.query.status !== 'all') {
      whereClause.status = req.query.status;
    }

    const deliveries = await Request.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'hostelBlock', 'roomNumber', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ deliveries });
  } catch (error) {
    console.error('Get my deliveries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get request by ID
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findByPk(id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'hostelBlock', 'roomNumber', 'averageRating']
        },
        {
          model: User,
          as: 'deliverer',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'averageRating']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user has permission to view this request
    if (req.user.role === 'hosteller' && request.requesterId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ request });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept a request (as dayscholar)
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only day scholars can accept requests
    if (req.user.role !== 'dayscholar') {
      return res.status(403).json({ message: 'Only day scholars can accept delivery requests' });
    }

    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been accepted or completed' });
    }

    // Update request
    request.delivererId = req.user.id;
    request.status = 'accepted';
    await request.save();

    // Fetch the updated request with associations
    const updatedRequest = await Request.findByPk(request.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'hostelBlock', 'roomNumber', 'averageRating', 'avatar']
        },
        {
          model: User,
          as: 'deliverer',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'averageRating', 'avatar']
        }
      ]
    });

    // Create notification for requester
    await Notification.create({
      userId: request.requesterId,
      title: 'Request Accepted',
      message: `Your request for ${request.itemName} has been accepted by a day scholar.`,
      type: 'request',
      relatedId: request.id
    });

    // Give points to day scholar
    const dayScholar = await User.findByPk(req.user.id);
    dayScholar.points += 5; // 5 points for accepting a request
    await dayScholar.save();

    res.status(200).json({ 
      message: 'Request accepted successfully', 
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark request as delivered (as dayscholar)
exports.markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.delivererId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the deliverer of this request' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'This request cannot be marked as delivered' });
    }

    // Update request
    request.status = 'completed'; // Directly mark as completed when delivered
    request.isCompleted = true;
    request.completedAt = new Date();
    request.deliveryTime = new Date();
    await request.save();

    // Fetch the updated request with associations
    const updatedRequest = await Request.findByPk(request.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'hostelBlock', 'roomNumber', 'averageRating', 'avatar']
        },
        {
          model: User,
          as: 'deliverer',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'averageRating', 'avatar']
        }
      ]
    });

    // Create notification for requester
    await Notification.create({
      userId: request.requesterId,
      title: 'Request Completed',
      message: `Your request for ${request.itemName} has been completed.`,
      type: 'request',
      relatedId: request.id
    });

    // Give points to day scholar
    const dayScholar = await User.findByPk(req.user.id);
    dayScholar.points += 10; // 10 points for completing a delivery
    await dayScholar.save();

    res.status(200).json({ 
      message: 'Request completed successfully', 
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Confirm delivery (as hosteller)
exports.confirmDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.requesterId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the requester of this request' });
    }

    if (request.status !== 'delivered') {
      return res.status(400).json({ message: 'This request is not in delivered status' });
    }

    // Update request
    request.isCompleted = true;
    request.status = 'completed'; // Update the status field as well
    request.completedAt = new Date(); // Set the completion timestamp
    await request.save();

    // Fetch the updated request with associations
    const updatedRequest = await Request.findByPk(request.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'hostelBlock', 'roomNumber', 'averageRating', 'avatar']
        },
        {
          model: User,
          as: 'deliverer',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'averageRating', 'avatar']
        }
      ]
    });

    // Create notification for deliverer
    await Notification.create({
      userId: request.delivererId,
      title: 'Delivery Confirmed',
      message: `The delivery for ${request.itemName} has been confirmed by the requester.`,
      type: 'request',
      relatedId: request.id
    });

    res.status(200).json({ 
      message: 'Delivery confirmed successfully', 
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel request (as hosteller)
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.requesterId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the requester of this request' });
    }

    if (request.status === 'delivered' || request.isCompleted) {
      return res.status(400).json({ message: 'This request cannot be cancelled' });
    }

    // Update request
    request.status = 'cancelled';
    request.cancelledAt = new Date();
    await request.save();

    // Fetch the updated request with associations
    const updatedRequest = await Request.findByPk(request.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'hostelBlock', 'roomNumber', 'averageRating', 'avatar']
        },
        {
          model: User,
          as: 'deliverer',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'averageRating', 'avatar']
        }
      ]
    });

    // Create notification for deliverer if there is one
    if (request.delivererId) {
      await Notification.create({
        userId: request.delivererId,
        title: 'Request Cancelled',
        message: `The request for ${request.itemName} has been cancelled by the requester.`,
        type: 'request',
        relatedId: request.id
      });
    }

    res.status(200).json({ 
      message: 'Request cancelled successfully', 
      request: updatedRequest 
    });  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel delivery (day scholars only)
exports.cancelDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.delivererId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the deliverer of this request' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'This delivery cannot be cancelled' });
    }

    // Store the delivery information before cancellation
    const dayScholarId = request.delivererId;

    // Update request - mark as cancelled
    request.status = 'cancelled';
    request.cancelledAt = new Date();
    await request.save();

    // Fetch the updated request with associations
    const updatedRequest = await Request.findByPk(request.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'hostelBlock', 'roomNumber', 'averageRating', 'avatar']
        },
        {
          model: User,
          as: 'deliverer',
          attributes: ['id', 'name', 'email', 'phoneNumber', 'averageRating', 'avatar']
        }
      ]
    });

    // Create notification for requester
    await Notification.create({
      userId: request.requesterId,
      title: 'Delivery Cancelled',
      message: `The delivery for your request "${request.itemName}" has been cancelled by the day scholar. Your request has been cancelled.`,
      type: 'request',
      relatedId: request.id
    });

    res.status(200).json({ 
      message: 'Delivery cancelled successfully', 
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Cancel delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
