const { User } = require('./models');

module.exports = (io) => {
  // Store online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user login
    socket.on('user:login', async (userId) => {
      try {
        // Validate user
        const user = await User.findByPk(userId);
        if (!user) {
          return socket.emit('error', { message: 'User not found' });
        }        // Add user to online users
        onlineUsers.set(userId, socket.id);
        
        // Join user to their room
        socket.join(userId);
        
        // Broadcast user online status
        io.emit('user:online', userId);
        
        console.log(`User ${userId} logged in`);
      } catch (error) {
        console.error('Socket login error:', error);
        socket.emit('error', { message: 'Server error' });
      }
    });

    // Handle user logout
    socket.on('user:logout', (userId) => {
      if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        socket.leave(userId);
        io.emit('user:offline', userId);
        console.log(`User ${userId} logged out`);
      }
    });

    // Handle private message
    socket.on('message:send', async (data) => {
      try {
        const { receiverId, message } = data;
        
        // Check if receiver is online
        const receiverSocketId = onlineUsers.get(receiverId);
        
        // Send message to receiver if online
        if (receiverSocketId) {
          io.to(receiverId).emit('message:receive', message);
        }
        
        // Always send back to sender for confirmation
        socket.emit('message:sent', message);
      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('error', { message: 'Server error' });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { senderId, receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverId).emit('typing:start', senderId);
      }
    });

    socket.on('typing:stop', (data) => {
      const { senderId, receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverId).emit('typing:stop', senderId);
      }
    });    // Handle online status check
    socket.on('user:check', (userIds) => {
      const onlineStatuses = {};
      
      userIds.forEach(userId => {
        onlineStatuses[userId] = onlineUsers.has(userId);
      });
      
      socket.emit('user:status', onlineStatuses);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Find and remove disconnected user
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('user:offline', userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });
};
