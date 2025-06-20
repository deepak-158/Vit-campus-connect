import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { googleAuthSuccess } = useAuth();
    useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get token from URL
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const completeProfile = queryParams.get('complete_profile') === 'true';
        
        if (!token) {
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }
        
        // Handle successful Google auth
        const result = await googleAuthSuccess(token);
        
        if (result.success) {
          if (completeProfile) {
            // If profile needs to be completed, redirect to the profile completion page
            toast.info('Please complete your profile to continue.');
            navigate('/complete-profile');
          } else {
            toast.success('Google sign-in successful!');
            // Navigate based on user role (handled by AuthContext)
            const redirectPath = result.user.role === 'hosteller' ? '/hosteller/dashboard' : '/dayscholar/dashboard';
            navigate(redirectPath);
          }
        } else {
          toast.error(result.message || 'Authentication failed. Please try again.');
          navigate('/login');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };
    
    handleGoogleCallback();
  }, [location, navigate, googleAuthSuccess]);
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Processing your Google sign-in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default GoogleCallback;
