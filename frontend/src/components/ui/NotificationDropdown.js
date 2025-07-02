import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api';
import { toast } from 'react-toastify';
import { Transition, Menu } from '@headlessui/react';
import {
  BellIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  ShoppingBagIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      socket.on('notification', (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for new notification
        toast.info(newNotification.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
      
      // Clean up on unmount
      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.notifications.filter(notif => !notif.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };
  
  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Format date to relative time (e.g. "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_accepted':
      case 'request_completed':
      case 'request_cancelled':
        return ClipboardDocumentListIcon;
      case 'message':
        return ChatBubbleLeftRightIcon;
      case 'delivery':
        return TruckIcon;
      case 'product':
        return ShoppingBagIcon;
      default:
        return BellIcon;
    }
  };
  
  // Get notification action link based on type and data
  const getNotificationLink = (notification) => {
    const { type, data } = notification;
    
    switch (type) {
      case 'request_accepted':
      case 'request_completed':
      case 'request_cancelled':
        return `/requests/${data.requestId}`;
      case 'message':
        return `/chat/${data.senderId}`;
      case 'product':
        return `/products/${data.productId}`;
      default:
        return '#';
    }
  };
  
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="relative bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Menu.Button>
      </div>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="px-4 py-6 text-center">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-500 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">{error}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <BellIcon className="h-6 w-6 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notification => {
                  const Icon = getNotificationIcon(notification.type);
                  const link = getNotificationLink(notification);
                  
                  return (
                    <Menu.Item key={notification.id}>
                      {({ active }) => (                        <Link
                          to={link}
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } block px-4 py-3 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                          onClick={() => !notification.isRead && markAsRead(notification.id)}
                        >
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">                              <div className={`h-8 w-8 rounded-full ${!notification.isRead ? 'bg-primary-100' : 'bg-gray-100'} flex items-center justify-center`}>
                                <Icon className={`h-5 w-5 ${!notification.isRead ? 'text-primary-600' : 'text-gray-500'}`} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">                              <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatRelativeTime(notification.createdAt)}
                              </p>
                            </div>                            {!notification.isRead && (
                              <div className="flex-shrink-0 ml-3 self-center">
                                <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                              </div>
                            )}
                          </div>
                        </Link>
                      )}
                    </Menu.Item>
                  );
                })
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-2">
                <button
                  onClick={fetchNotifications}
                  className="w-full text-center text-xs text-gray-700 hover:text-gray-900"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationDropdown;
