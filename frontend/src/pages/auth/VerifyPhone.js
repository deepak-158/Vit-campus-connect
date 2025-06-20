import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';
import api from '../../api';

const VerifyPhone = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resendEnabled, setResendEnabled] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Get userId and phoneNumber from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const phoneNumber = urlParams.get('phone');

  useEffect(() => {
    // Redirect if no userId or phoneNumber
    if (!userId || !phoneNumber) {
      toast.error('Invalid verification link');
      navigate('/login');
    }

    // Start countdown for resend
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userId, phoneNumber, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/verify-phone-otp', { 
        userId, 
        otp 
      });

      toast.success(response.data.message);
      
      // If verification is successful and returns token and user
      if (response.data.token && response.data.user) {
        login(response.data.token, response.data.user);
        
        // Redirect based on user role
        if (response.data.user.role === 'hosteller') {
          navigate('/hosteller/dashboard');
        } else if (response.data.user.role === 'dayscholar') {
          navigate('/dayscholar/dashboard');
        }
      } else {
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message ||
        'Failed to verify phone number. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    
    try {
      const response = await api.post('/auth/send-phone-otp', { 
        userId,
        phoneNumber
      });
      
      toast.success(response.data.message);
      
      // Reset countdown
      setCountdown(60);
      setResendEnabled(false);
      
      // Start countdown again
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message ||
        'Failed to resend OTP. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Verify Your Phone Number
      </h2>
      
      <p className="text-gray-600 mb-6 text-center">
        We've sent a verification code to {phoneNumber}
      </p>
      
      <form onSubmit={handleVerify}>
        <div className="mb-6">
          <Input
            label="Enter OTP"
            type="text"
            id="otp"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            required
          />
        </div>
        
        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Verify Phone Number
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Didn't receive the code?{' '}
          {resendEnabled ? (
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-blue-600 hover:underline"
              disabled={loading}
            >
              Resend OTP
            </button>
          ) : (
            <span>Resend in {countdown} seconds</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default VerifyPhone;
