import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';

const GoogleSignInButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    try {
      setIsLoading(true);
      // Redirect to backend Google auth route
      window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to initiate Google sign-in. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="animate-spin h-5 w-5 border-b-2 border-gray-800 rounded-full"></div>
      ) : (
        <FcGoogle className="h-5 w-5" />
      )}
      <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
    </button>
  );
};

export default GoogleSignInButton;
