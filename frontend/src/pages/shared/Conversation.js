import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

const Conversation = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket, isUserOnline, sendMessage, startTyping, stopTyping } = useSocket();
  
  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  // Load chat history and recipient data
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        const [messagesResponse, userResponse] = await Promise.all([
          api.get(`/chat/conversation/${userId}`),
          api.get(`/users/${userId}`)
        ]);        
        setMessages(messagesResponse.data.messages);
        setRecipient(userResponse.data.user);
      } catch (error) {
        console.error('Error fetching conversation:', error);
        setError('Failed to load conversation');
        toast.error('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversation();
  }, [userId]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;
      // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.senderId === userId || data.receiverId === userId) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    };
    
    // Listen for typing indicators
    const handleTypingStart = (data) => {
      if (data.senderId === userId) {
        setIsTyping(true);
      }
    };
    
    const handleTypingStop = (data) => {
      if (data.senderId === userId) {
        setIsTyping(false);
      }
    };
    
    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, userId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {      // Optimistically add message to UI
      const tempMessage = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: user.id,
        receiverId: userId,
        sentAt: new Date().toISOString(),
        isRead: false,
        isOptimistic: true, // Flag to identify optimistic messages
      };
      
      setMessages((prevMessages) => [...prevMessages, tempMessage]);
      setNewMessage('');
      
      // Send message via socket
      sendMessage(userId, newMessage);
      
      // Send message via API (fallback)
      await api.post('/chat', {
        receiverId: userId,
        content: newMessage,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Remove optimistic message on error
      setMessages((prevMessages) => 
        prevMessages.filter(msg => !msg.isOptimistic)
      );
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicator
    if (socket) {
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Send typing start event
      startTyping(userId);
      
      // Set timeout to stop typing indicator after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        stopTyping(userId);
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  };

  // Format timestamp for messages
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
      messages.forEach(message => {
      const date = new Date(message.sentAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load conversation</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <Link to="/chat">
            <Button variant="primary">Back to Messages</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">User not found</h3>
        <p className="mt-1 text-sm text-gray-500">The user you are trying to chat with does not exist.</p>
        <div className="mt-6">
          <Link to="/chat">
            <Button variant="primary">Back to Messages</Button>
          </Link>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-[calc(100vh-13rem)]">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center">
        <Link to="/chat" className="mr-2">
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="relative flex-shrink-0">
          {recipient.avatar ? (
            <img
              src={recipient.avatar}
              alt={recipient.name}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {recipient.name.charAt(0)}
              </span>
            </div>
          )}
          <span
            className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
              isUserOnline(recipient.id) ? 'bg-green-400' : 'bg-gray-300'
            }`}
          />
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
          <p className="text-xs text-gray-500">
            {isUserOnline(recipient.id) ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 text-xs bg-gray-100 rounded-full text-gray-500">
                {new Date(group.date).toLocaleDateString([], {
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            {group.messages.map((message, index) => {
              const isSender = message.senderId === user.id;
              return (
                <div
                  key={message.id || index}
                  className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      isSender
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 text-right ${
                        isSender ? 'text-primary-200' : 'text-gray-500'
                      }`}
                    >
                      {formatMessageTime(message.sentAt)}
                      {isSender && (
                        <span className="ml-1">
                          {message.isRead ? '• Read' : message.isOptimistic ? '• Sending...' : '• Sent'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex mb-4 justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            className="flex-1 border-gray-300 focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md sm:text-sm border-gray-300"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="ml-3"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Conversation;
