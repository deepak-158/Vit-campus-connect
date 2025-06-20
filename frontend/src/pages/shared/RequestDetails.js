import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import RatingModal from '../../components/ui/RatingModal';
import UserRating from '../../components/ui/UserRating';
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyRupeeIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const RequestDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userToRate, setUserToRate] = useState(null);
  
  // Load request details
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/requests/${id}`);
        setRequest(response.data.request);
      } catch (error) {
        console.error('Error fetching request details:', error);
        setError('Failed to load request details');
        toast.error('Failed to load request details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestDetails();
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };  // Get request status badge
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

  // Handle request actions
  const handleRequestAction = async (action) => {
    try {
      setActionLoading(true);
      
      let response;
      
      switch (action) {
        case 'accept':
          response = await api.put(`/requests/${id}/accept`);
          toast.success('Request accepted successfully');
          break;        case 'complete':
          // Day scholar marking as delivered/completed
          response = await api.put(`/requests/${id}/deliver`, { deliveryNotes });
          toast.success('Request completed successfully');
          break;case 'cancel':
          if (user.id === request.requesterId) {
            response = await api.put(`/requests/${id}/cancel`);
          } else {
            response = await api.put(`/requests/${id}/cancel-delivery`);
          }
          toast.success('Request cancelled successfully');
          break;
        default:
          throw new Error('Invalid action');
      }
      
      setRequest(response.data.request);
      setShowConfirmModal(false);
      
    } catch (error) {
      console.error(`Error ${action} request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmModal = (action) => {
    setModalAction(action);
    setShowConfirmModal(true);
  };
  // Start a chat with the other user
  const startChat = () => {
    const chatUserId = user.role === 'hosteller' ? request.deliverer?.id : request.requester.id;
    if (chatUserId) {
      navigate(`/chat/${chatUserId}`);
    }
  };

  // Open rating modal
  const openRatingModal = (user) => {
    setUserToRate(user);
    setShowRatingModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load request</h3>
        <p className="mt-1 text-sm text-gray-500">{error || 'Request not found'}</p>
        <div className="mt-6">
          <Link to="/">
            <Button variant="primary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }
  const isHosteller = user.role === 'hosteller';
  const isDayScholar = user.role === 'dayscholar';
  const isRequester = user.id === request.requesterId;
  const isDeliverer = request.deliverer && user.id === request.deliverer.id;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <Link to={isHosteller ? '/hosteller/my-requests' : '/dayscholar/browse-requests'} className="mr-3">
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Request Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Request #{request.id} • {getStatusBadge(request.status)}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={startChat}
          className="flex items-center"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
          Chat
        </Button>
      </div>
      
      {/* Request Details */}
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{request.itemName}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Request Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3 text-sm">
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">{formatDate(request.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3 text-sm">
                  <p className="text-gray-500">Delivery Location</p>
                  <p className="font-medium text-gray-900">{request.deliveryLocation}</p>
                </div>
              </div>
              
              <div className="flex items-start">                <div className="flex-shrink-0">
                  <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3 text-sm">
                  <p className="text-gray-500">Expected Price</p>
                  <p className="font-medium text-gray-900">₹{request.expectedPrice}</p>
                </div>
              </div>              {request.status === 'completed' && request.completedAt && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 text-sm">
                    <p className="text-gray-500">Completed</p>
                    <p className="font-medium text-gray-900">{formatDate(request.completedAt)}</p>
                  </div>
                </div>
              )}
              
              {request.status === 'cancelled' && request.cancelledAt && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 text-sm">
                    <p className="text-gray-500">Cancelled</p>
                    <p className="font-medium text-gray-900">{formatDate(request.cancelledAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Users</h3>
              <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {request.requester.avatar ? (
                    <img
                      src={request.requester.avatar}
                      alt={request.requester.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {request.requester.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {request.requester.name} {isRequester && '(You)'}
                  </p>
                  <div className="flex items-center">
                    <p className="text-xs text-gray-500 mr-2">Requester (Hosteller)</p>
                    <UserRating userId={request.requester.id} size="sm" />
                  </div>
                </div>
              </div>
              
              {request.deliverer ? (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {request.deliverer.avatar ? (
                      <img
                        src={request.deliverer.avatar}
                        alt={request.deliverer.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {request.deliverer.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {request.deliverer.name} {isDeliverer && '(You)'}
                    </p>
                    <div className="flex items-center">
                      <p className="text-xs text-gray-500 mr-2">Deliverer (Day Scholar)</p>
                      <UserRating userId={request.deliverer.id} size="sm" />
                    </div>
                  </div>
                </div>
              ) : (
                request.status === 'pending' && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <UserIcon className="h-10 w-10 p-2 bg-gray-100 rounded-full text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Not yet assigned</p>
                      <p className="text-xs text-gray-500">Waiting for a day scholar to accept</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-line">{request.description}</p>
        </div>
        
        {request.deliveryNotes && (
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">Delivery Notes</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700 whitespace-pre-line">{request.deliveryNotes}</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex flex-wrap justify-end gap-3">
            {/* Day Scholar - Accept Request */}
            {isDayScholar && request.status === 'pending' && (
              <Button onClick={() => openConfirmModal('accept')}>
                Accept Request
              </Button>
            )}            {/* Day Scholar - Mark as Delivered/Completed */}
            {isDeliverer && request.status === 'accepted' && (
              <Button onClick={() => openConfirmModal('complete')}>
                Mark as Completed
              </Button>
            )}
            
            {/* Hosteller - Cancel Request */}
            {isRequester && ['pending', 'accepted'].includes(request.status) && (
              <Button variant="danger" onClick={() => openConfirmModal('cancel')}>
                Cancel Request
              </Button>
            )}
            
            {/* Day Scholar - Cancel Delivery */}
            {isDeliverer && request.status === 'accepted' && (
              <Button variant="danger" onClick={() => openConfirmModal('cancel')}>
                Cancel Delivery
              </Button>
            )}            {/* Rate User Button - Only visible when completed and not yet rated */}
            {request.status === 'completed' && (
              <>
                {isDayScholar && request.requester && (
                  <Button 
                    variant="secondary" 
                    onClick={() => openRatingModal(request.requester)}
                    className="flex items-center"
                  >
                    <StarIcon className="h-5 w-5 mr-2" />
                    Rate Hosteller
                  </Button>
                )}
                
                {isHosteller && request.deliverer && (
                  <Button 
                    variant="secondary" 
                    onClick={() => openRatingModal(request.deliverer)}
                    className="flex items-center"
                  >
                    <StarIcon className="h-5 w-5 mr-2" />
                    Rate Day Scholar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
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
                    {modalAction === 'cancel' ? (
                      <XCircleIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                    ) : modalAction === 'complete' ? (
                      <CheckCircleIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                    ) : (
                      <UserIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                    )}
                  </div>
                  
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalAction === 'accept' && 'Accept Request'}
                      {modalAction === 'complete' && 'Complete Request'}
                      {modalAction === 'cancel' && 'Cancel Request'}
                    </h3>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {modalAction === 'accept' && 'Are you sure you want to accept this request? You will be responsible for delivering the requested items.'}
                        {modalAction === 'complete' && 'Are you sure you want to mark this request as completed? This indicates that you have delivered the items.'}
                        {modalAction === 'cancel' && 'Are you sure you want to cancel this request? This action cannot be undone.'}
                      </p>
                        {modalAction === 'complete' && (
                        <div className="mt-4">
                          <label htmlFor="deliveryNotes" className="block text-sm font-medium text-gray-700">
                            Delivery Notes (Optional)
                          </label>
                          <textarea
                            id="deliveryNotes"
                            name="deliveryNotes"
                            rows={3}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Add any notes about the delivery..."
                            value={deliveryNotes}
                            onChange={(e) => setDeliveryNotes(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={() => handleRequestAction(modalAction)}
                  variant={modalAction === 'cancel' ? 'danger' : 'primary'}
                  isLoading={actionLoading}
                  disabled={actionLoading}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Confirm
                </Button>
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  variant="secondary"
                  disabled={actionLoading}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        targetUser={userToRate}
        requestId={id}
        ratingType={user.role === 'hosteller' ? 'hosteller_to_dayscholar' : 'dayscholar_to_hosteller'}
      />
    </div>
  );
};

export default RequestDetails;
