const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Request = sequelize.define('Request', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    requesterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    delivererId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    expectedPrice: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    deliveryLocation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deliveryTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isUrgent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    category: {
      type: DataTypes.ENUM('groceries', 'medicines', 'stationery', 'food', 'other'),
      defaultValue: 'other'
    },    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return Request;
};
