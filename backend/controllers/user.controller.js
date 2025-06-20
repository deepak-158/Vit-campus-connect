const { User } = require('../models');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
  }
}).single('avatar');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpiry', 'resetPasswordToken', 'resetPasswordTokenExpiry'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'phoneNumber', 'hostelBlock', 'roomNumber', 'points', 'avatar', 'averageRating', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, hostelBlock, roomNumber } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    user.name = name || user.name;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    
    // Update hostel info if user is a hosteller
    if (user.role === 'hosteller') {
      user.hostelBlock = hostelBlock || user.hostelBlock;
      user.roomNumber = roomNumber || user.roomNumber;
    }
    
    await user.save();

    res.status(200).json({ 
      message: 'Profile updated successfully', 
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
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete profile after Google sign-in
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

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image file' });
      }

      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete previous avatar if exists
      if (user.avatar) {
        const previousPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(previousPath)) {
          fs.unlinkSync(previousPath);
        }
      }

      // Save avatar path
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      user.avatar = avatarPath;
      await user.save();

      res.status(200).json({ message: 'Avatar uploaded successfully', avatar: avatarPath });
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get top users by points (leaderboard)
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'role', 'points', 'avatar', 'averageRating'],
      order: [['points', 'DESC']],
      limit: 10
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
