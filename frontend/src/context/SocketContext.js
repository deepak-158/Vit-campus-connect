import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (isAuthenticated && user) {
      const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      
      // Initialize socket connection
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      // Socket connection events
      newSocket.on('connect', () => {
        console.log('Connected to socket');
        // Notify server of user login
        newSocket.emit('user:login', user.id);
      });

      // Listen for online users
      newSocket.on('user:online', (userId) => {
        setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
      });

      newSocket.on('user:offline', (userId) => {
        setOnlineUsers((prev) => ({ ...prev, [userId]: false }));
      });

      newSocket.on('user:status', (statuses) => {
        setOnlineUsers((prev) => ({ ...prev, ...statuses }));
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket');
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Clean up on unmount
      return () => {
        newSocket.off('connect');
        newSocket.off('user:online');
        newSocket.off('user:offline');
        newSocket.off('user:status');
        newSocket.off('disconnect');
        newSocket.off('error');
        newSocket.close();
      };
    }

    return () => {};
  }, [isAuthenticated, user]);

  // Check if a user is online
  const isUserOnline = (userId) => {
    return !!onlineUsers[userId];
  };

  // Check online status for multiple users
  const checkOnlineStatus = (userIds) => {
    if (socket) {
      socket.emit('user:check', userIds);
    }
  };

  // Send a message
  const sendMessage = (receiverId, message) => {
    if (socket) {
      socket.emit('message:send', { receiverId, message });
    }
  };

  // Start typing indicator
  const startTyping = (receiverId) => {
    if (socket && user) {
      socket.emit('typing:start', { senderId: user.id, receiverId });
    }
  };

  // Stop typing indicator
  const stopTyping = (receiverId) => {
    if (socket && user) {
      socket.emit('typing:stop', { senderId: user.id, receiverId });
    }
  };

  const value = {
    socket,
    isUserOnline,
    checkOnlineStatus,
    sendMessage,
    startTyping,
    stopTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
