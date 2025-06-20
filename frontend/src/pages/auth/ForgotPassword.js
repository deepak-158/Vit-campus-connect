import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const { forgotPassword } = useAuth();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    
    if (!email.endsWith('@vitbhopal.ac.in')) {
      setError('Only VIT Bhopal email addresses are allowed');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        toast.success('Password reset instructions sent to your email');
        setIsSubmitted(true);
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

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-4">Check your email</h3>
        <p className="text-sm text-gray-600 mb-6">
          We've sent password reset instructions to <span className="font-medium">{email}</span>.
          Please check your email and follow the instructions to reset your password.
        </p>
        <p className="mt-4 text-sm text-gray-600">
          Didn't receive an email?{' '}
          <button
            type="button"
            onClick={handleSubmit}
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Click here to resend
          </button>
        </p>
        <div className="mt-6">
          <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-medium text-gray-900 mb-4">Reset your password</h3>
      <p className="text-sm text-gray-600 mb-6">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="your.name@vitbhopal.ac.in"
          error={error}
          required
          autoComplete="email"
        />
        
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Send reset instructions
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
