import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import { formatShortDate } from '../../utils/dateUtils';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  
  // Categories for filtering
  const categories = [
    'All Categories',
    'Books & Study Materials',
    'Electronics & Gadgets',
    'Furniture',
    'Clothing & Accessories',
    'Sports Equipment',
    'Musical Instruments',
    'Decor & Appliances',
    'Other'
  ];

  // Conditions for filtering
  const conditions = [
    'All Conditions',
    'new',
    'like-new',
    'used'
  ];

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  // Filter products based on search term, category, and condition
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All Categories' || 
                           product.category === selectedCategory;
    
    const matchesCondition = selectedCondition === '' || selectedCondition === 'All Conditions' || 
                            product.condition === selectedCondition;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'recent':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Marketplace</h1>
        <Link to="/hosteller/sell-product">
          <Button className="flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" />
            Sell Product
          </Button>
        </Link>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          {/* Search */}
          <div className="flex w-full mb-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="block w-full py-2 pl-3 pr-10 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                id="condition"
                className="block w-full py-2 pl-3 pr-10 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
              >
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition === 'All Conditions' 
                      ? 'All Conditions' 
                      : condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sortBy"
                className="block w-full py-2 pl-3 pr-10 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center border-b border-gray-200">
          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            {searchTerm || selectedCategory !== '' && selectedCategory !== 'All Categories' || selectedCondition !== '' && selectedCondition !== 'All Conditions'
              ? `Search Results (${sortedProducts.length})`
              : 'All Products'}
          </h2>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-2 text-sm text-red-500">{error}</p>
            <Button onClick={fetchProducts} className="mt-4" variant="secondary">
              Try Again
            </Button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== '' && selectedCategory !== 'All Categories' || selectedCondition !== '' && selectedCondition !== 'All Conditions'
                ? 'Try adjusting your search or filters'
                : 'There are no products available in the marketplace yet'}
            </p>
            <div className="mt-6">
              <Link to="/hosteller/sell-product">
                <Button>
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Sell a Product
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {sortedProducts.map((product) => (
              <Link 
                key={product.id} 
                to={`/products/${product.id}`}
                className="block group"
              >
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 overflow-hidden">                    {product.images && product.images.length > 0 ? (                      <img 
                        src={getImageUrl(product.images[0])} 
                        alt={product.name} 
                        className="w-full h-48 object-cover object-center group-hover:opacity-90 transition-opacity"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                        <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {product.category}
                      </div>                      <div className="text-xs text-gray-500">
                        {formatShortDate(product.createdAt)}
                      </div>
                    </div>                    <h3 className="mt-2 text-sm font-medium text-gray-900 group-hover:text-primary-600 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-primary-600 font-bold">₹{product.price}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {product.condition === 'new' 
                          ? 'New' 
                          : product.condition === 'like-new' 
                            ? 'Like New' 
                            : 'Used'}
                      </span>                      <div className="flex items-center text-sm text-gray-500">
                        <div className="flex-shrink-0 h-5 w-5 relative">
                          {product.seller?.avatar ? (
                            <img
                              className="h-5 w-5 rounded-full"
                              src={product.seller.avatar}
                              alt=""
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {product.seller?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="ml-1 truncate">
                          {product.seller?.name || 'Unknown'}
                        </p>
                      </div>
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

export default Marketplace;
