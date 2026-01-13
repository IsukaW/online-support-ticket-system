import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiSave } from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // profile, password
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!profileData.name) newErrors.name = 'Name is required';
    if (!profileData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profileData.email)) newErrors.email = 'Email is invalid';
    return newErrors;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateProfile();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.updateProfile(profileData);
      updateUser(response.data.data || response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validatePassword();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account information</p>
      </div>

      {/* User Info Card */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <FiUser className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className="capitalize">{user?.role}</Badge>
              <span className="text-sm text-gray-500">{user?.email}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`${
              activeTab === 'password'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Change Password
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              error={errors.name}
              icon={FiUser}
              required
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              error={errors.email}
              icon={FiMail}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              icon={FiPhone}
            />
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button type="submit" variant="primary" loading={loading}>
                <FiSave className="mr-2 h-5 w-5" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <Card>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              error={errors.currentPassword}
              icon={FiLock}
              required
            />
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={errors.newPassword}
              icon={FiLock}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={errors.confirmPassword}
              icon={FiLock}
              required
            />
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button type="submit" variant="primary" loading={loading}>
                <FiLock className="mr-2 h-5 w-5" />
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Profile;
