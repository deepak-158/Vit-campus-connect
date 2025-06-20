import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api';
import { toast } from 'react-toastify';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Chat = () => {
  const { user } = useAuth();
  const { isUserOnline, checkOnlineStatus } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  // Load user conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/conversations');
      setConversations(response.data.conversations);
      
      // Check online status for all users in conversations
      if (response.data.conversations.length > 0) {
        const userIds = response.data.conversations.map(conv => conv.user.id);
        checkOnlineStatus(userIds);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Get formatted date or time
  const getFormattedTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If message is from today, show time, otherwise show date
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // If this year, show day and month, otherwise show date with year
      if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Messages</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Your conversations with other users
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Conversation List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading conversations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchConversations}
              className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Try again
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            {searchTerm ? (
              <p className="text-gray-500">No conversations found matching "{searchTerm}"</p>
            ) : (
              <p className="text-gray-500">You have no conversations yet</p>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <Link
              key={conversation.user.id}
              to={`/chat/${conversation.user.id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-6 py-4 flex items-center">
                {/* User Avatar */}
                <div className="relative flex-shrink-0">
                  {conversation.user.avatar ? (
                    <img
                      src={conversation.user.avatar}
                      alt={conversation.user.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {conversation.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  {/* Online status indicator */}
                  <span
                    className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                      isUserOnline(conversation.user.id) ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                  />
                </div>
                
                <div className="min-w-0 flex-1 ml-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.user.name}
                    </p>                    <p className="text-xs text-gray-500">
                      {conversation.latestMessage?.sentAt 
                        ? getFormattedTime(conversation.latestMessage.sentAt) 
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.latestMessage 
                        ? conversation.latestMessage.senderId === user.id 
                          ? `You: ${conversation.latestMessage.content}` 
                          : conversation.latestMessage.content
                        : 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-600">
                        <span className="text-xs font-medium text-white leading-none">
                          {conversation.unreadCount}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Chat;
