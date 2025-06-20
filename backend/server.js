const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, syncDatabase } = require('./models');
const { testEmailConnection } = require('./utils/email');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const passport = require('./utils/passport');
const session = require('express-session');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const requestRoutes = require('./routes/request.routes');
const productRoutes = require('./routes/product.routes');
const chatRoutes = require('./routes/chat.routes');
const ratingRoutes = require('./routes/rating.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'campusconnect_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const productsDir = path.join(uploadsDir, 'products');
const avatarsDir = path.join(uploadsDir, 'avatars');

[uploadsDir, productsDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api', dashboardRoutes);

// Debug endpoint to check database
app.get('/api/debug/requests-status', async (req, res) => {
  try {
    const { Request } = require('./models');
    const statusCounts = await Request.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });
    res.json(statusCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to VIT CampusConnect API' });
});

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection
require('./socket')(io);

// Set port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Initialize database tables
    await syncDatabase();
    console.log('Database tables synchronized successfully.');
    
    // Test email service
    await testEmailConnection();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

module.exports = { app, server };
