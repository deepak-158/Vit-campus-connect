import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const BrowseRequests = () => {
  const { user } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minFee: '',
    maxFee: '',
    location: '',
    sortBy: 'newest'
  });
  
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dayscholar/requests/available');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching available requests:', error);
      setError('Failed to load available requests');
      toast.error('Failed to load available requests');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  // Filter and sort requests
  const filteredRequests = requests.filter(request => {
    // Apply search term filter
    if (searchTerm && !request.itemName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !request.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply min fee filter
    if (filters.minFee && request.expectedPrice < parseInt(filters.minFee)) {
      return false;
    }
    
    // Apply max fee filter
    if (filters.maxFee && request.expectedPrice > parseInt(filters.maxFee)) {
      return false;
    }
    
    // Apply location filter
    if (filters.location && !request.deliveryLocation.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Apply sorting
    if (filters.sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filters.sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);    } else if (filters.sortBy === 'highestFee') {
      return b.expectedPrice - a.expectedPrice;
    } else if (filters.sortBy === 'lowestFee') {
      return a.expectedPrice - b.expectedPrice;
    }
    return 0;
  });

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      minFee: '',
      maxFee: '',
      location: '',
      sortBy: 'newest'
    });
    setSearchTerm('');
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
        <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load requests</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <Button onClick={fetchRequests} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Browse Requests</h1>
        <Button 
          variant="secondary" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Search and filters */}
      <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
        <div className="p-4">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search requests by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label htmlFor="minFee" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Fee (₹)
                  </label>
                  <input
                    type="number"
                    id="minFee"
                    name="minFee"
                    value={filters.minFee}
                    onChange={handleFilterChange}
                    min="0"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="maxFee" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Fee (₹)
                  </label>
                  <input
                    type="number"
                    id="maxFee"
                    name="maxFee"
                    value={filters.maxFee}
                    onChange={handleFilterChange}
                    min="0"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="E.g. Main Gate, Canteen"
                  />
                </div>
                <div>
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    id="sortBy"
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highestFee">Highest Fee</option>
                    <option value="lowestFee">Lowest Fee</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Available Requests ({filteredRequests.length})
          </h2>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {requests.length === 0 ? (
              "There are no available requests at the moment."
            ) : (
              "No requests match your search criteria."
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map(request => (
              <Link
                key={request.id}
                to={`/requests/${request.id}`}
                className="block hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                <div className="px-4 py-4 sm:px-6">                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {request.itemName}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ₹{request.expectedPrice}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {request.description}
                    </p>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {request.deliveryLocation}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {formatDate(request.createdAt)}
                      </p>
                    </div>                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseRequests;
