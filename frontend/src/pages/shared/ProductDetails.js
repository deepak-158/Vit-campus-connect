import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import { formatDate } from '../../utils/dateUtils';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import { 
  ArrowLeftIcon, 
  CurrencyRupeeIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Load product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details');
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();  }, [id]);
  
  // Start a chat with the seller
  const contactSeller = () => {
    navigate(`/chat/${product.seller.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load product</h3>
        <p className="mt-1 text-sm text-gray-500">{error || 'Product not found'}</p>
        <div className="mt-6">
          <Link to="/hosteller/marketplace">
            <Button variant="primary">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }
  // Check if current user is the seller of this product
  const isSeller = user?.id === product?.sellerId || user?.id === product?.seller?.id;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/hosteller/marketplace" className="mr-3">
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Product Details</h3>
        </div>
        {!isSeller && (
          <Button
            size="sm"
            onClick={() => setShowContactModal(true)}
            className="flex items-center"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
            Contact Seller
          </Button>
        )}
      </div>
      
      {/* Product Details */}
      <div className="px-4 py-5 sm:p-6">        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">              {product.images && product.images.length > 0 ? (                <img
                  src={getImageUrl(product.images[currentImageIndex])}
                  alt={product.name}
                  className="w-full h-auto object-contain max-h-72"
                  onError={handleImageError}
                />
              ) : (
                <div className="text-center p-8">
                  <TagIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">No image available</p>
                </div>
              )}
            </div>
            
            {/* Image thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index 
                        ? 'border-primary-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
            
            <div className="flex items-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                {product.price}
              </span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                Posted on {formatDate(product.createdAt)}
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Seller Information</h3>              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {product.seller?.avatar ? (
                    <img
                      src={product.seller.avatar}
                      alt={product.seller.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {product.seller?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {product.seller?.name || 'Unknown'} {isSeller && '(You)'}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Member since {formatDate(product.seller?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
              {/* Categories and Condition */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                <p className="text-gray-900 capitalize">{product.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Condition</h4>
                <p className="text-gray-900 capitalize">{product.condition}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Quantity</h4>
                <p className="text-gray-900">{product.quantity}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Price</h4>
                <p className="text-gray-900">
                  {product.isNegotiable ? 'Negotiable' : 'Fixed'}
                </p>
              </div>
            </div>
              {/* Action Button for Seller */}
            {isSeller && user?.role === 'hosteller' && (
              <div className="mt-6">
                <Link to={`/hosteller/edit-product/${product.id}`}>
                  <Button>Edit Product</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                    <UserIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Contact {product.seller.name}
                    </h3>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You're about to start a conversation with the seller. 
                        Would you like to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={contactSeller}
                  variant="primary"
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Start Chat
                </Button>
                <Button
                  onClick={() => setShowContactModal(false)}
                  variant="secondary"
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
