import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
    // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    hostelBlock: user?.hostelBlock || '',
    roomNumber: user?.roomNumber || '',
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    // Clear errors when user types
    if (profileErrors[name]) {
      setProfileErrors({ ...profileErrors, [name]: '' });
    }
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    // Clear errors when user types
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: '' });
    }
  };

  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
      if (!profileData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await updateProfile(profileData);
      
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditMode(false);
      } else {
        toast.error(result.message);
        setProfileErrors({ general: result.message });
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setProfileErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        toast.success('Password changed successfully');
        setIsPasswordMode(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.message);
        setPasswordErrors({ general: result.message });
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setPasswordErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setProfileData({
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      hostelBlock: user?.hostelBlock || '',
      roomNumber: user?.roomNumber || '',
    });
    setProfileErrors({});
  };

  // Cancel password mode
  const handleCancelPassword = () => {
    setIsPasswordMode(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordErrors({});
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Your personal information and settings
        </p>
      </div>
      
      {/* Profile View Mode */}
      {!isEditMode && !isPasswordMode && (
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>            <div>
              <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.phoneNumber || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</dd>
            </div>
            {user?.role === 'hosteller' && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hostel Block</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.hostelBlock || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Room Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.roomNumber || 'Not provided'}</dd>
                </div>
              </>
            )}
          </dl>
          
          <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
            <Button onClick={() => setIsEditMode(true)}>
              Edit Profile
            </Button>
            <Button variant="secondary" onClick={() => setIsPasswordMode(true)}>
              Change Password
            </Button>
          </div>
        </div>
      )}
      
      {/* Profile Edit Mode */}
      {isEditMode && (
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleProfileUpdate}>
            {profileErrors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {profileErrors.general}
              </div>
            )}
            
            <Input
              label="Full Name"
              id="name"
              name="name"
              type="text"
              value={profileData.name}
              onChange={handleProfileChange}
              error={profileErrors.name}
              required
            />
            
            <div className="mb-4">
              <label className="form-label">Email Address</label>
              <div className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded-md">
                {user?.email} <span className="text-gray-500">(Cannot be changed)</span>
              </div>
            </div>
              <Input
              label="Phone Number"
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={profileData.phoneNumber}
              onChange={handleProfileChange}
              error={profileErrors.phoneNumber}
              required
            />
            
            {user?.role === 'hosteller' && (
              <>
                <Input
                  label="Hostel Block"
                  id="hostelBlock"
                  name="hostelBlock"
                  type="text"
                  value={profileData.hostelBlock}
                  onChange={handleProfileChange}
                  error={profileErrors.hostelBlock}
                  placeholder="e.g., A Block, B Block"
                />
                
                <Input
                  label="Room Number"
                  id="roomNumber"
                  name="roomNumber"
                  type="text"
                  value={profileData.roomNumber}
                  onChange={handleProfileChange}
                  error={profileErrors.roomNumber}
                  placeholder="e.g., 101, A-202"
                />
              </>
            )}
            
            <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <Button 
                type="submit" 
                isLoading={isSubmitting} 
                disabled={isSubmitting}
              >
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {/* Change Password Mode */}
      {isPasswordMode && (
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handlePasswordUpdate}>
            {passwordErrors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {passwordErrors.general}
              </div>
            )}
            
            <Input
              label="Current Password"
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.currentPassword}
              required
            />
            
            <Input
              label="New Password"
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.newPassword}
              required
            />
            
            <Input
              label="Confirm New Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmPassword}
              required
            />
            
            <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <Button 
                type="submit" 
                isLoading={isSubmitting} 
                disabled={isSubmitting}
              >
                Change Password
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleCancelPassword}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
