const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findOne({ where: { id: decoded.id } });
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid - user not found' });
      }

      // Set user info on request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isVerified: user.isVerified,
        isProfileComplete: user.isProfileComplete
      };
      next();
    } catch (tokenError) {
      console.error('Auth middleware - token verification error:', tokenError);
      return res.status(401).json({ message: 'Token is not valid - verification failed' });
    }
  } catch (error) {
    console.error('Auth middleware - unexpected error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

module.exports = auth;
