const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sellerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    category: {
      type: DataTypes.ENUM('books', 'electronics', 'clothing', 'furniture', 'food', 'other'),
      defaultValue: 'other'
    },
    condition: {
      type: DataTypes.ENUM('new', 'like new', 'good', 'fair', 'poor'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('available', 'sold', 'reserved'),
      defaultValue: 'available'
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('images');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('images', JSON.stringify(value));
      }
    },
    isNegotiable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    postedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return Product;
};
