import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  
  const { verifyOTP, sendOTP } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email from state or localStorage
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail');
  const userId = location.state?.userId || localStorage.getItem('pendingVerificationUserId');
  
  useEffect(() => {
    // Save email in localStorage if it exists in state
    if (location.state?.email) {
      localStorage.setItem('pendingVerificationEmail', location.state.email);
    }
    if (location.state?.userId) {
      localStorage.setItem('pendingVerificationUserId', location.state.userId);
    }
    
    // Redirect if no email is available
    if (!email) {
      navigate('/login');
      toast.error('Please login first');
    }
  }, [location, navigate, email]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setError('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await verifyOTP(email, otp);
      
      if (result.success) {
        toast.success('Email verified successfully!');
        // Clear saved email and userId
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('pendingVerificationUserId');
        navigate('/login');
      } else {
        toast.error(result.message);
        setError(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    try {
      const result = await sendOTP(email);
      
      if (result.success) {
        toast.success('OTP sent successfully');
        setCountdown(60); // Start 60 second countdown
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  if (!email) {
    return null; // Don't render anything if no email (will redirect in useEffect)
  }

  return (
    <div>
      <h3 className="text-xl font-medium text-gray-900 mb-4">Verify your email</h3>
      <p className="text-sm text-gray-600 mb-6">
        We've sent a verification code to <span className="font-medium">{email}</span>.
        Please enter the code below to verify your email address.
      </p>
      
      <form onSubmit={handleVerify}>
        <Input
          label="Verification Code"
          id="otp"
          name="otp"
          type="text"
          value={otp}
          onChange={handleOtpChange}
          placeholder="Enter OTP"
          error={error}
          required
          autoComplete="one-time-code"
        />
        
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Verify Email
          </Button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={countdown > 0}
          className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
