import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import GoogleCallback from './pages/auth/GoogleCallback';
import CompleteGoogleProfile from './pages/auth/CompleteGoogleProfile';

// Hosteller Pages
import HostellerDashboard from './pages/hosteller/Dashboard';
import MyRequests from './pages/hosteller/MyRequests';
import CreateRequest from './pages/hosteller/CreateRequest';
import SellProduct from './pages/hosteller/SellProduct';
import EditProduct from './pages/hosteller/EditProduct';
import Marketplace from './pages/hosteller/Marketplace';

// Day Scholar Pages
import DayScholarDashboard from './pages/dayscholar/Dashboard';
import BrowseRequests from './pages/dayscholar/BrowseRequests';
import MyDeliveries from './pages/dayscholar/MyDeliveries';

// Shared Pages
import Profile from './pages/shared/Profile';
import Chat from './pages/shared/Chat';
import Conversation from './pages/shared/Conversation';
import ProductDetails from './pages/shared/ProductDetails';
import RequestDetails from './pages/shared/RequestDetails';
import NotFound from './pages/shared/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
    // Check if profile is complete (for Google users or incomplete profiles)
  if (user && user.isProfileComplete === false && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect based on role
    if (user?.role === 'hosteller') {
      return <Navigate to="/hosteller/dashboard" />;
    } else if (user?.role === 'dayscholar') {
      return <Navigate to="/dayscholar/dashboard" />;
    } else {
      return <Navigate to="/login" />;
    }
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          isAuthenticated ? 
            (user?.role === 'hosteller' ? 
              <Navigate to="/hosteller/dashboard" /> : 
              <Navigate to="/dayscholar/dashboard" />
            ) : 
            <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? 
            (user?.role === 'hosteller' ? 
              <Navigate to="/hosteller/dashboard" /> : 
              <Navigate to="/dayscholar/dashboard" />
            ) : 
            <Register />
        } />        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/google-callback" element={<GoogleCallback />} />
        <Route path="/complete-profile" element={
          <ProtectedRoute>
            <CompleteGoogleProfile />
          </ProtectedRoute>
        } />
      </Route>

      {/* Hosteller Routes */}
      <Route element={<MainLayout />}>
        <Route path="/hosteller/dashboard" element={
          <ProtectedRoute allowedRoles={['hosteller']}>
            <HostellerDashboard />
          </ProtectedRoute>
        } />        <Route path="/hosteller/my-requests" element={
          <ProtectedRoute allowedRoles={['hosteller']}>
            <MyRequests />
          </ProtectedRoute>
        } />
        <Route path="/hosteller/my-requests/new" element={
          <ProtectedRoute allowedRoles={['hosteller']}>
            <CreateRequest />
          </ProtectedRoute>
        } />        <Route path="/hosteller/sell-product" element={
          <ProtectedRoute allowedRoles={['hosteller']}>
            <SellProduct />
          </ProtectedRoute>
        } />
        <Route path="/hosteller/edit-product/:id" element={
          <ProtectedRoute allowedRoles={['hosteller']}>
            <EditProduct />
          </ProtectedRoute>
        } />
        <Route path="/hosteller/marketplace" element={
          <ProtectedRoute allowedRoles={['hosteller']}>
            <Marketplace />
          </ProtectedRoute>
        } />
      </Route>

      {/* Day Scholar Routes */}
      <Route element={<MainLayout />}>
        <Route path="/dayscholar/dashboard" element={
          <ProtectedRoute allowedRoles={['dayscholar']}>
            <DayScholarDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dayscholar/browse-requests" element={
          <ProtectedRoute allowedRoles={['dayscholar']}>
            <BrowseRequests />
          </ProtectedRoute>
        } />
        <Route path="/dayscholar/my-deliveries" element={
          <ProtectedRoute allowedRoles={['dayscholar']}>
            <MyDeliveries />
          </ProtectedRoute>
        } />
      </Route>

      {/* Shared Routes */}
      <Route element={<MainLayout />}>
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/chat/:userId" element={
          <ProtectedRoute>
            <Conversation />
          </ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute allowedRoles={['hosteller']}>
            <ProductDetails />
          </ProtectedRoute>
        } />
        <Route path="/requests/:id" element={
          <ProtectedRoute>
            <RequestDetails />
          </ProtectedRoute>
        } />
      </Route>

      {/* Redirect root to appropriate dashboard or login */}
      <Route path="/" element={
        isAuthenticated ? 
          (user?.role === 'hosteller' ? 
            <Navigate to="/hosteller/dashboard" /> : 
            <Navigate to="/dayscholar/dashboard" />
          ) : 
          <Navigate to="/login" />
      } />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
