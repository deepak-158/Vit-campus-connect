import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import vitLogo from '../../assets/vit-logo.js';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src={vitLogo} alt="VIT Bhopal Logo" className="h-16 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          VIT CampusConnect
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connecting hostellers and day scholars at VIT Bhopal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-primary-600 hover:text-primary-500">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
