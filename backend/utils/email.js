const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create email transport with fallback configurations
const createTransporter = () => {
  // Check if manual SMTP configuration is provided
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      logger: true,
      debug: process.env.NODE_ENV === 'development'
    });
  }
  
  // Default Gmail service configuration
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Add these options for better Gmail compatibility
    secure: true,
    port: 465,
    logger: true,
    debug: process.env.NODE_ENV === 'development'
  });
};

const transporter = createTransporter();

// Test email connection
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return false;
  }
};

// Generate verification token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'VIT CampusConnect - Email Verification',
    html: `
      <h1>Email Verification</h1>
      <p>Hello ${user.name},</p>
      <p>Please verify your email by clicking on the link below:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not sign up for VIT CampusConnect, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send OTP verification email
const sendOTPVerificationEmail = async (user, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'VIT CampusConnect - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">VIT CampusConnect</h1>
        <h2>Email Verification OTP</h2>
        <p>Hello ${user.name},</p>
        <p>Your OTP for email verification is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #4f46e5; letter-spacing: 5px; margin: 0;">${otp}</h2>
        </div>
        <p><strong>This OTP will expire in 10 minutes.</strong></p>
        <p>If you did not sign up for VIT CampusConnect, please ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">VIT CampusConnect - Connecting Hostellers and Day Scholars</p>
      </div>
    `
  };

  try {
    console.log(`📧 Attempting to send OTP email to: ${user.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP verification email:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'VIT CampusConnect - Password Reset',
    html: `
      <h1>Password Reset</h1>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Please click on the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send SMS OTP (simulated for development)
const sendPhoneOTP = async (phoneNumber, otp) => {
  // In production, you would integrate with SMS service like Twilio
  // For now, we'll simulate it with console logs
  console.log(`Sending OTP ${otp} to phone number ${phoneNumber}`);
  
  // Return true to simulate successful sending
  return true;
};

module.exports = {
  generateToken,
  generateOTP,
  sendVerificationEmail,
  sendOTPVerificationEmail,
  sendPasswordResetEmail,
  sendPhoneOTP,
  testEmailConnection
};
