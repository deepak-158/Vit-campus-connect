import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import GoogleSignInButton from '../../components/ui/GoogleSignInButton';
import { toast } from 'react-toastify';
import api from '../../api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'hosteller', // Default role
    hostelBlock: '',
    roomNumber: ''
  });  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // We're not using the register function from AuthContext as we're making API calls directly
  // const { register } = useAuth();
  const navigate = useNavigate();

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
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@vitbhopal.ac.in')) {
      newErrors.email = 'Only VIT Bhopal email addresses are allowed';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Hosteller specific validations
    if (formData.role === 'hosteller') {
      if (!formData.hostelBlock) {
        newErrors.hostelBlock = 'Hostel block is required for hostellers';
      }
      if (!formData.roomNumber) {
        newErrors.roomNumber = 'Room number is required for hostellers';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {      // Make API call to register
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phone,
        hostelBlock: formData.role === 'hosteller' ? formData.hostelBlock : null,
        roomNumber: formData.role === 'hosteller' ? formData.roomNumber : null      });
        toast.success('Registration successful! Please check your email for the OTP.');
      
      // Redirect to verification page after successful registration
      navigate('/verify-email', { 
        state: { 
          email: formData.email, 
          userId: response.data.userId 
        } 
      });} catch (error) {
      console.error('Registration error:', error);
      
      // Handle validation errors from the server
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.param] = err.msg;
        });
        setErrors({ ...errors, ...serverErrors });
        toast.error('Please fix the errors in the form');
      } else {
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-medium text-gray-900 mb-6">Create your account</h3>
      
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {errors.general}
          </div>
        )}
        
        <Input
          label="Full Name"
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          error={errors.name}
          required
          autoComplete="name"
        />
        
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.name@vitbhopal.ac.in"
          error={errors.email}
          required
          autoComplete="email"
        />
        
        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          autoComplete="new-password"
        />
        
        <Input
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />
          <Input
          label="Phone Number"
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="1234567890"
          error={errors.phone}
          required
          autoComplete="tel"
        />
        
        <div className="mb-4">
          <label className="form-label">
            I am a <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input
                id="hosteller"
                name="role"
                type="radio"
                value="hosteller"
                checked={formData.role === 'hosteller'}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <label htmlFor="hosteller" className="ml-2 block text-sm text-gray-700">
                Hosteller
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="dayscholar"
                name="role"
                type="radio"
                value="dayscholar"
                checked={formData.role === 'dayscholar'}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <label htmlFor="dayscholar" className="ml-2 block text-sm text-gray-700">
                Day Scholar
              </label>
            </div>
          </div>
        </div>
        
        {/* Conditionally show hostel details for hostellers */}
        {formData.role === 'hosteller' && (
          <>
            <Input
              label="Hostel Block"
              id="hostelBlock"
              name="hostelBlock"
              type="text"
              value={formData.hostelBlock}
              onChange={handleChange}
              placeholder="e.g., Block A"
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
              placeholder="e.g., 123"
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
            Sign up          </Button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6">
          <GoogleSignInButton />
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
