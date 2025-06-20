import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import api from '../../api';

const CompleteGoogleProfile = () => {
  const [formData, setFormData] = useState({
    role: 'hosteller', // Default role
    phoneNumber: '',
    hostelBlock: '',
    roomNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();
  
  // If user profile is already complete, redirect
  useEffect(() => {
    if (user && user.isProfileComplete) {
      const redirectPath = user.role === 'hosteller' ? '/hosteller/dashboard' : '/dayscholar/dashboard';
      navigate(redirectPath);
    }
  }, [user, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Phone number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    // Hostel info validation for hostellers
    if (formData.role === 'hosteller') {
      if (!formData.hostelBlock) {
        newErrors.hostelBlock = 'Hostel block is required';
      }
      
      if (!formData.roomNumber) {
        newErrors.roomNumber = 'Room number is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
      try {
      const response = await api.put('/users/complete-google-profile', formData);
      
      if (response.data.user) {
        // Update user data in context
        updateUserData(response.data.user);
        
        toast.success('Profile completed successfully!');
        
        // Redirect based on role
        if (response.data.user.role === 'hosteller') {
          navigate('/hosteller/dashboard');
        } else {
          navigate('/dayscholar/dashboard');
        }
      }
    } catch (error) {
      console.error('Complete profile error:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
      setErrors({ general: error.response?.data?.message || 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Complete Your Profile</h3>
      <p className="text-gray-600 mb-6">
        Please provide the following information to complete your profile.
      </p>
      
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {errors.general}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            I am a:
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-primary-600"
                name="role"
                value="hosteller"
                checked={formData.role === 'hosteller'}
                onChange={handleChange}
              />
              <span className="ml-2 text-gray-700">Hosteller</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-primary-600"
                name="role"
                value="dayscholar"
                checked={formData.role === 'dayscholar'}
                onChange={handleChange}
              />
              <span className="ml-2 text-gray-700">Day Scholar</span>
            </label>
          </div>
        </div>
        
        <Input
          label="Phone Number"
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="10-digit phone number"
          error={errors.phoneNumber}
          required
        />
        
        {formData.role === 'hosteller' && (
          <>
            <Input
              label="Hostel Block"
              id="hostelBlock"
              name="hostelBlock"
              type="text"
              value={formData.hostelBlock}
              onChange={handleChange}
              placeholder="e.g., A Block"
              error={errors.hostelBlock}
              required
            />
            
            <Input
              label="Room Number"
              id="roomNumber"
              name="roomNumber"
              type="text"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="e.g., A-101"
              error={errors.roomNumber}
              required
            />
          </>
        )}
        
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Complete Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompleteGoogleProfile;
