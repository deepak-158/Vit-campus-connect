import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const MyDeliveries = () => {
  const { user } = useAuth();
  
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // active, completed, cancelled
  
  useEffect(() => {
    fetchDeliveries();
  }, [activeTab]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      // Fetch all deliveries, we'll filter them client-side
      const response = await api.get('/requests/my-deliveries');
      console.log('Fetched deliveries:', response.data.deliveries);
      setDeliveries(response.data.deliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setError('Failed to load your deliveries');
      toast.error('Failed to load your deliveries');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get status badge
  const getStatusBadge = (status) => {
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

  // Filter deliveries based on active tab
  const filteredDeliveries = deliveries.filter(delivery => {
    if (activeTab === 'active') {
      return ['pending', 'accepted'].includes(delivery.status);
    } else if (activeTab === 'completed') {
      return delivery.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return delivery.status === 'cancelled';
    }
    return true;
  });

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
        <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load deliveries</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <Button onClick={fetchDeliveries} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Deliveries</h1>
        <Button 
          variant="secondary" 
          onClick={fetchDeliveries}
          className="flex items-center"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`${
              activeTab === 'active'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <TruckIcon className={`${
              activeTab === 'active' ? 'text-primary-500' : 'text-gray-400'
            } flex-shrink-0 -ml-1 mr-2 h-5 w-5`} />
            Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${
              activeTab === 'completed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <CheckCircleIcon className={`${
              activeTab === 'completed' ? 'text-primary-500' : 'text-gray-400'
            } flex-shrink-0 -ml-1 mr-2 h-5 w-5`} />
            Completed
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`${
              activeTab === 'cancelled'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <XCircleIcon className={`${
              activeTab === 'cancelled' ? 'text-primary-500' : 'text-gray-400'
            } flex-shrink-0 -ml-1 mr-2 h-5 w-5`} />
            Cancelled
          </button>
        </nav>
      </div>

      {/* Deliveries List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {activeTab === 'active' && 'Active Deliveries'}
            {activeTab === 'completed' && 'Completed Deliveries'}
            {activeTab === 'cancelled' && 'Cancelled Deliveries'}
            {' '}({filteredDeliveries.length})
          </h2>
        </div>

        {filteredDeliveries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {activeTab === 'active' && "You don't have any active deliveries."}
            {activeTab === 'completed' && "You don't have any completed deliveries yet."}
            {activeTab === 'cancelled' && "You don't have any cancelled deliveries."}
            {activeTab === 'active' && (
              <div className="mt-2">
                <Link to="/dayscholar/browse-requests" className="text-primary-600 hover:text-primary-500">
                  Browse available requests
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDeliveries.map(delivery => (
              <Link
                key={delivery.id}
                to={`/requests/${delivery.id}`}
                className="block hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                <div className="px-4 py-4 sm:px-6">                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {delivery.itemName}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      {getStatusBadge(delivery.status)}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {delivery.description}
                    </p>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {delivery.deliveryLocation}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {formatDate(delivery.createdAt)}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ₹{delivery.expectedPrice}
                      </p>
                    </div>                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
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
                  
                  {/* Additional info for completed deliveries */}
                  {delivery.status === 'completed' && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="flex items-center text-sm text-gray-500">
                        <CheckCircleIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-green-500" />
                        Completed on {formatDate(delivery.completedAt || delivery.deliveryTime)}
                      </p>
                      {delivery.deliveryNotes && (
                        <p className="mt-1 text-sm text-gray-500 italic">
                          "{delivery.deliveryNotes}"
                        </p>
                      )}
                    </div>
                  )}
                  
                  {delivery.status === 'cancelled' && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="flex items-center text-sm text-gray-500">
                        <XCircleIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-red-500" />
                        Cancelled on {formatDate(delivery.cancelledAt)}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDeliveries;
