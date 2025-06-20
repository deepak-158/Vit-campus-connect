import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ChevronRightIcon,
  FunnelIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchRequests();
  }, [filter]);  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/requests/my-requests${filter !== 'all' ? `?status=${filter}` : ''}`);
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests');
      toast.error('Failed to load requests');
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

  // Filter requests
  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(request => request.status === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">My Requests</h1>
        <Link to="/hosteller/my-requests/new">
          <Button className="flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" />
            New Request
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center">
          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">Filter by Status</span>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-2">
          <Button 
            size="sm"
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            size="sm"
            variant={filter === 'pending' ? 'primary' : 'secondary'}
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button 
            size="sm"
            variant={filter === 'accepted' ? 'primary' : 'secondary'}
            onClick={() => setFilter('accepted')}
          >
            Accepted
          </Button>          <Button 
            size="sm"
            variant={filter === 'completed' ? 'primary' : 'secondary'}
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
          <Button 
            size="sm"
            variant={filter === 'cancelled' ? 'primary' : 'secondary'}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </Button>
        </div>
      </div>
      
      {/* Requests List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading requests...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-2 text-sm text-red-500">{error}</p>
            <Button onClick={fetchRequests} className="mt-4" variant="secondary">
              Try Again
            </Button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No requests found</h3>
            {filter !== 'all' ? (
              <p className="mt-1 text-sm text-gray-500">
                You don't have any {filter} requests. Try a different filter.
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                You haven't created any requests yet.
              </p>
            )}
            <div className="mt-6">
              <Link to="/hosteller/my-requests/new">
                <Button>
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Create Request
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <li key={request.id}>
                  <Link 
                    to={`/requests/${request.id}`}
                    className="block hover:bg-gray-50 transition duration-150"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">                        <div className="flex items-center">
                          <p className="text-sm font-medium text-primary-600 truncate max-w-md">
                            {request.itemName}
                          </p>
                          <div className="ml-2 flex-shrink-0">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500 mr-6">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {formatDate(request.createdAt)}
                          </p>
                          <p className="flex items-center text-sm text-gray-500 mt-2 sm:mt-0 mr-6">
                            <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {request.deliveryLocation}
                          </p>                          <p className="flex items-center text-sm text-gray-500 mt-2 sm:mt-0">
                            <CurrencyRupeeIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {request.expectedPrice}
                          </p>
                        </div>                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          {request.deliverer ? (
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-5 w-5 relative">
                                {request.deliverer.avatar ? (
                                  <img
                                    className="h-5 w-5 rounded-full"
                                    src={request.deliverer.avatar}
                                    alt=""
                                  />
                                ) : (
                                  <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      {request.deliverer.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="ml-1 truncate">
                                {request.deliverer.name}
                              </p>
                            </div>
                          ) : (
                            <p>No deliverer yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
