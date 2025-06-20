import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import {
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    pendingRequests: 0,
    completedRequests: 0,
    activeProducts: 0,
    soldProducts: 0,
  });
  
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const statsResponse = await api.get('/hosteller/stats');
        setStats(statsResponse.data.stats);
        
        const requestsResponse = await api.get('/hosteller/requests/recent');
        setRecentRequests(requestsResponse.data.requests);
        
        const productsResponse = await api.get('/hosteller/products/recent');
        setRecentProducts(productsResponse.data.products);
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
              <ClockIcon className="h-10 w-10 text-yellow-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-10 w-10 text-green-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Completed Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingBagIcon className="h-10 w-10 text-blue-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Active Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingBagIcon className="h-10 w-10 text-primary-500" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Sold Products</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.soldProducts}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/hosteller/my-requests/new">
              <Button
                variant="primary"
                fullWidth
                className="flex items-center justify-center"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                New Request
              </Button>
            </Link>
            
            <Link to="/hosteller/sell-product">
              <Button
                variant="secondary"
                fullWidth
                className="flex items-center justify-center"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                Sell Product
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-4">
            Having issues with your requests or products? Contact our support team for assistance.
          </p>
          <a href="mailto:support@vitcampusconnect.com">
            <Button variant="secondary">Contact Support</Button>
          </a>
        </div>
      </div>
      
      {/* Recent Requests */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
          <Link to="/hosteller/my-requests" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            View All
          </Link>
        </div>
        
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {recentRequests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              You don't have any requests yet. 
              <Link to="/hosteller/my-requests/new" className="ml-1 text-primary-600 hover:text-primary-500">
                Create your first request
              </Link>
            </div>
          ) : (
            recentRequests.map((request) => (
              <Link key={request.id} to={`/requests/${request.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {request.itemName}
                    </p>
                    <div className="ml-2 flex-shrink-0">
                      {getRequestStatusBadge(request.status)}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {formatDate(request.createdAt)}
                      </p>                      <p className="mt-1 sm:mt-0 sm:ml-6 flex items-center text-sm text-gray-500">
                        <ClipboardDocumentListIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        Expected Price: ₹{request.expectedPrice}
                      </p>
                    </div>                    <div className="text-sm text-gray-500">
                      {request.deliverer ? request.deliverer.name : 'No deliverer yet'}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      
      {/* Recent Products */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Your Products</h2>
          <Link to="/hosteller/marketplace" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            View All
          </Link>
        </div>
        
        <div className="border-t border-gray-200">
          {recentProducts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              You don't have any products listed yet. 
              <Link to="/hosteller/sell-product" className="ml-1 text-primary-600 hover:text-primary-500">
                Sell your first product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {recentProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="block">
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">                    <div className="h-48 bg-gray-200 overflow-hidden">                      {product.images && product.images.length > 0 ? (                        <img 
                          src={getImageUrl(product.images[0])} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-primary-600 font-medium">₹{product.price}</span>
                        <span className="text-xs text-gray-500">{formatDate(product.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
