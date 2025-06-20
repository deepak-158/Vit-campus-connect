const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

// Import models
const User = require('./user.model')(sequelize);
const Request = require('./request.model')(sequelize);
const Product = require('./product.model')(sequelize);
const Message = require('./message.model')(sequelize);
const Rating = require('./rating.model')(sequelize);
const Notification = require('./notification.model')(sequelize);

// Define associations
User.hasMany(Request, { foreignKey: 'requesterId', as: 'requestsCreated' });
User.hasMany(Request, { foreignKey: 'delivererId', as: 'requestsDelivered' });
Request.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
Request.belongsTo(User, { foreignKey: 'delivererId', as: 'deliverer' });

User.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'messagesSent' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'messagesReceived' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Request.hasMany(Message, { foreignKey: 'requestId', as: 'messages' });
Message.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });
Product.hasMany(Message, { foreignKey: 'productId', as: 'messages' });
Message.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Rating, { foreignKey: 'raterId', as: 'ratingsGiven' });
User.hasMany(Rating, { foreignKey: 'ratedUserId', as: 'ratingsReceived' });
Rating.belongsTo(User, { foreignKey: 'raterId', as: 'rater' });
Rating.belongsTo(User, { foreignKey: 'ratedUserId', as: 'ratedUser' });
Request.hasMany(Rating, { foreignKey: 'requestId', as: 'ratings' });
Rating.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });
Product.hasMany(Rating, { foreignKey: 'productId', as: 'ratings' });
Rating.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Sync models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database & tables synchronized');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Request,
  Product,
  Message,
  Rating,
  Notification,
  syncDatabase
};
