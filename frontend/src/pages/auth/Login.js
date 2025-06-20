import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import GoogleSignInButton from '../../components/ui/GoogleSignInButton';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check for error query parameters (e.g., from Google auth)
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    
    if (error === 'google_auth_not_configured') {
      toast.error('Google sign-in is not available at this time. Please try the email/password login.');
    } else if (error === 'google_auth_failed') {
      toast.error('Google sign-in failed. Please try again or use email/password login.');
    }
  }, [location]);

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
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@vitbhopal.ac.in')) {
      newErrors.email = 'Only VIT Bhopal email addresses are allowed';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Login successful!');
        // Navigate based on user role (handled by App.js)
      } else {
        if (!result.isVerified && result.userId) {
          // If email not verified, prompt to verify
          toast.warning('Your email is not verified. Please verify your email.');
          navigate('/verify-email', { state: { email: formData.email, userId: result.userId } });
        } else {
          toast.error(result.message);
          setErrors({ general: result.message });
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-medium text-gray-900 mb-6">Sign in to your account</h3>
      
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {errors.general}
          </div>
        )}
        
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
          autoComplete="current-password"
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}          >
            Sign in
          </Button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>        </div>
        
        <div className="mt-6">
          <GoogleSignInButton />
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
