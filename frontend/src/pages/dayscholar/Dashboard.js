import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import {
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    pendingDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
    availableRequests: 0,
  });
  
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [loading, setLoading] = useState(true);  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const statsResponse = await api.get('/dayscholar/stats');
        setStats(statsResponse.data.stats);
          const deliveriesResponse = await api.get('/dayscholar/deliveries/active');
        setActiveDeliveries(deliveriesResponse.data.deliveries);
        
        const requestsResponse = await api.get('/dayscholar/requests/available');
        setAvailableRequests(requestsResponse.data.requests);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  // Get status badge for requests
  const getRequestStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
        <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load dashboard</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <Button onClick={() => window.location.reload()} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Welcome, {user.name}!</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TruckIcon className="h-10 w-10 text-blue-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Active Deliveries</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingDeliveries}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-10 w-10 text-green-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedDeliveries}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-10 w-10 text-yellow-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Available Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.availableRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.totalEarnings}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/dayscholar/browse-requests">
              <Button
                variant="primary"
                fullWidth
                className="flex items-center justify-center"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                Browse Requests
              </Button>
            </Link>
            
            <Link to="/dayscholar/my-deliveries">
              <Button
                variant="secondary"
                fullWidth
                className="flex items-center justify-center"
              >
                <TruckIcon className="h-5 w-5 mr-2" />
                My Deliveries
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-4">
            Having issues with your deliveries? Contact our support team for assistance.
          </p>
          <a href="mailto:support@vitcampusconnect.com">
            <Button variant="secondary">Contact Support</Button>
          </a>
        </div>
      </div>
      
      {/* Active Deliveries */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Active Deliveries</h2>
          <Link to="/dayscholar/my-deliveries" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            View All
          </Link>
        </div>
        
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {activeDeliveries.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              You don't have any active deliveries. 
              <Link to="/dayscholar/browse-requests" className="ml-1 text-primary-600 hover:text-primary-500">
                Browse available requests
              </Link>
            </div>
          ) : (
            activeDeliveries.map((delivery) => (
              <Link key={delivery.id} to={`/requests/${delivery.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {delivery.itemName}
                    </p>
                    <div className="ml-2 flex-shrink-0">
                      {getRequestStatusBadge(delivery.status)}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {formatDate(delivery.createdAt)}
                      </p>
                      <p className="mt-1 sm:mt-0 sm:ml-6 flex items-center text-sm text-gray-500">
                        <ClipboardDocumentListIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        Expected: ₹{delivery.expectedPrice}
                      </p>
                    </div><div className="text-sm text-gray-500 flex items-center">
                      <div className="flex-shrink-0 h-5 w-5 relative mr-1">
                        {delivery.requester?.avatar ? (
                          <img
                            className="h-5 w-5 rounded-full"
                            src={delivery.requester.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {delivery.requester?.name?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      {delivery.requester?.name}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      
      {/* Available Requests */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Available Requests</h2>
          <Link to="/dayscholar/browse-requests" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            View All
          </Link>
        </div>
        
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {availableRequests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              There are no available requests at the moment.
            </div>
          ) : (
            availableRequests.map((request) => (
              <Link key={request.id} to={`/requests/${request.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {request.itemName}
                    </p>
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ₹{request.expectedPrice}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {formatDate(request.createdAt)}
                      </p>
                      <p className="mt-1 sm:mt-0 sm:ml-6 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {request.deliveryLocation}
                      </p>
                    </div>                    <div className="text-sm text-gray-500 flex items-center">
                      <div className="flex-shrink-0 h-5 w-5 relative mr-1">
                        {request.requester?.avatar ? (
                          <img
                            className="h-5 w-5 rounded-full"
                            src={request.requester.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {request.requester?.name?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      {request.requester?.name}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
