// Complete profile after Google sign-in
const { User } = require('../models');

exports.completeGoogleProfile = async (req, res) => {
  try {
    const { role, phoneNumber, hostelBlock, roomNumber } = req.body;
    
    // Validate required fields
    if (!role || !phoneNumber) {
      return res.status(400).json({ message: 'Role and phone number are required' });
    }
    
    // Validate role
    if (!['hosteller', 'dayscholar'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either hosteller or dayscholar' });
    }
    
    // Validate hostel info if role is hosteller
    if (role === 'hosteller' && (!hostelBlock || !roomNumber)) {
      return res.status(400).json({ message: 'Hostel block and room number are required for hostellers' });
    }
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    user.role = role;
    user.phoneNumber = phoneNumber;
    user.isPhoneVerified = true; // Auto-verify phone for Google users
    
    if (role === 'hosteller') {
      user.hostelBlock = hostelBlock;
      user.roomNumber = roomNumber;
    }
    
    // Mark profile as complete
    user.isProfileComplete = true;
    
    await user.save();
    
    res.status(200).json({
      message: 'Profile completed successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phoneNumber: user.phoneNumber,
        hostelBlock: user.hostelBlock,
        roomNumber: user.roomNumber,
        points: user.points,
        avatar: user.avatar,
        averageRating: user.averageRating,
        isProfileComplete: true
      }
    });
  } catch (error) {
    console.error('Complete Google profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
