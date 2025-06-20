import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-toastify';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CreateRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    quantity: 1,
    expectedPrice: '',
    deadline: '',
    deliveryLocation: '',
    isUrgent: false,
    category: 'other'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.itemName) {
      toast.error('Please enter an item name');
      return;
    }
    
    if (!formData.expectedPrice) {
      toast.error('Please enter an expected price');
      return;
    }
    
    if (!formData.deadline) {
      toast.error('Please enter a deadline');
      return;
    }
    
    if (!formData.deliveryLocation) {
      toast.error('Please enter a delivery location');
      return;
    }
      try {
      setLoading(true);
      
      const response = await api.post('/requests', formData);
      
      toast.success('Request created successfully!');
      navigate('/hosteller/my-requests');
    } catch (error) {
      console.error('Error creating request:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/hosteller/my-requests')}
          className="flex items-center text-gray-600 hover:text-primary-600"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to My Requests
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mt-4">Create New Request</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Name */}
            <div className="col-span-2">
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <Input
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="What do you need?"
                required
              />
            </div>
            
            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Provide more details about what you need"
              />
            </div>
            
            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Expected Price */}
            <div>
              <label htmlFor="expectedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Expected Price (₹) *
              </label>
              <Input
                id="expectedPrice"
                name="expectedPrice"
                type="number"
                min={1}
                value={formData.expectedPrice}
                onChange={handleChange}
                placeholder="100"
                required
              />
            </div>
            
            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline *
              </label>
              <Input
                id="deadline"
                name="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Delivery Location */}
            <div>
              <label htmlFor="deliveryLocation" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location *
              </label>
              <Input
                id="deliveryLocation"
                name="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={handleChange}
                placeholder="Hostel Block and Room Number"
                required
              />
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="groceries">Groceries</option>
                <option value="medicines">Medicines</option>
                <option value="stationery">Stationery</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Is Urgent */}
            <div>
              <div className="flex items-center h-full">
                <input
                  id="isUrgent"
                  name="isUrgent"
                  type="checkbox"
                  checked={formData.isUrgent}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isUrgent" className="ml-2 block text-sm text-gray-700">
                  Mark as Urgent
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="button" 
              variant="secondary" 
              className="mr-3"
              onClick={() => navigate('/hosteller/my-requests')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
