const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        isVITEmail(value) {
          if (!value.endsWith('@vitbhopal.ac.in')) {
            throw new Error('Email must be a VIT Bhopal email address');
          }
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('hosteller', 'dayscholar', 'admin'),
      allowNull: false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verificationTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true
    },    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true  // Auto-verify phone numbers
    },    provider: {
      type: DataTypes.ENUM('local', 'google'),
      defaultValue: 'local'
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isProfileComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hostelBlock: {
      type: DataTypes.STRING,
      allowNull: true
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    }
  });

  return User;
};
