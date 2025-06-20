const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { generateToken, generateOTP, sendVerificationEmail, sendOTPVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// Register new user
exports.register = async (req, res) => {
  try {
    const { validationResult } = require('express-validator');
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, password, role, phoneNumber, hostelBlock, roomNumber } = req.body;

    // Check if email is VIT Bhopal email
    if (!email.endsWith('@vitbhopal.ac.in')) {
      return res.status(400).json({ message: 'Only VIT Bhopal email addresses are allowed' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate OTP instead of token
    const otp = generateOTP();
    const verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      hostelBlock: role === 'hosteller' ? hostelBlock : null,
      roomNumber: role === 'hosteller' ? roomNumber : null,
      verificationToken: otp,
      verificationTokenExpiry
    });

    // Send OTP verification email
    const emailSent = await sendOTPVerificationEmail(user, otp);    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending verification email' });
    }

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email for the OTP.', 
      userId: user.id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;    // Find user with token
    const { Op } = require('sequelize');
    const user = await User.findOne({ 
      where: { 
        verificationToken: token,
        verificationTokenExpiry: { 
          [Op.gt]: new Date() 
        }
      } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send OTP for verification
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP as verification token
    user.verificationToken = otp;
    user.verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPVerificationEmail(user, otp);

    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending OTP email' });
    }

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }    // Check OTP
    if (user.verificationToken !== otp || user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update user
    user.isVerified = true;
    user.isProfileComplete = true; // Profile is complete after email verification for regular registration
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in',
        isVerified: false,
        userId: user.id
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isProfileComplete: user.isProfileComplete,
        phoneNumber: user.phoneNumber,
        hostelBlock: user.hostelBlock,
        roomNumber: user.roomNumber,
        points: user.points,
        avatar: user.avatar,
        averageRating: user.averageRating
      }
    });
  } catch (error) {    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Google OAuth callback handler
exports.googleCallback = (req, res) => {
  try {
    // User is already authenticated by Passport
    const user = req.user;
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Check if profile is complete
    if (!user.isProfileComplete) {
      // Redirect to frontend with token and complete_profile flag
      return res.redirect(`${process.env.CLIENT_URL}/auth/google-callback?token=${token}&complete_profile=true`);
    }

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/google-callback?token=${token}`);
  } catch (error) {
    console.error('Google auth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    const emailSent = await sendPasswordResetEmail(user, resetToken);

    if (!emailSent) {
      return res.status(500).json({ message: 'Error sending password reset email' });
    }

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user with token
    const user = await User.findOne({ 
      where: { 
        resetPasswordToken: token,
        resetPasswordTokenExpiry: { $gt: new Date() }
      } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpiry', 'resetPasswordToken', 'resetPasswordTokenExpiry'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send Phone OTP
exports.sendPhoneOTP = async (req, res) => {
  try {
    const { userId, phoneNumber } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update phone number if provided
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      user.phoneNumber = phoneNumber;
      user.isPhoneVerified = false;
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP
    user.phoneOTP = otp;
    user.phoneOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP via SMS
    const { sendPhoneOTP } = require('../utils/email');
    const smsSent = await sendPhoneOTP(user.phoneNumber, otp);

    if (!smsSent) {
      return res.status(500).json({ message: 'Error sending phone OTP' });
    }

    res.status(200).json({ 
      message: 'OTP sent to your phone number',
      userId: user.id,
      phoneNumber: user.phoneNumber
    });
  } catch (error) {
    console.error('Send Phone OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify Phone OTP
exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check OTP
    if (user.phoneOTP !== otp || user.phoneOTPExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update user
    user.isPhoneVerified = true;
    user.phoneOTP = null;
    user.phoneOTPExpiry = null;
    await user.save();

    // Generate token for authenticated access
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      message: 'Phone number verified successfully', 
      isPhoneVerified: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (error) {
    console.error('Verify Phone OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
