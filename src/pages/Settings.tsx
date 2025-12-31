import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Clock, CreditCard, Link2, HelpCircle, AlertTriangle, Check, ChevronRight } from 'lucide-react';
import { useProviderData } from '../hooks/useProviderData';

export default function Settings() {
  const navigate = useNavigate();
  const { provider, clearProvider } = useProviderData();
  const [activeSection, setActiveSection] = useState('account');
  const [successMessage, setSuccessMessage] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const API_URL = 'https://fearless-achievement-production.up.railway.app/api';

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailInquiries: true,
    emailBookings: true,
    emailReviews: true,
    emailMarketing: false,
    smsBookings: true,
    smsReminders: true,
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: true,
    allowMessages: true,
  });

  // Business hours state
  const [hours, setHours] = useState({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '14:00', closed: false },
    sunday: { open: '', close: '', closed: true },
  });

  const handleSave = () => {
    setSuccessMessage('Settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLogout = () => {
    clearProvider();
    navigate('/login');
  };

  const handleDeactivate = () => {
    if (confirm('Are you sure you want to deactivate your account? This will hide your profile from patients.')) {
      alert('Account deactivated (demo mode)');
    }
  };

  const handleChangePassword = async () => {
  setPasswordError('');
  setPasswordSuccess('');
  
  if (!currentPassword) {
    setPasswordError('Current password is required');
    return;
  }
  if (!newPassword || newPassword.length < 8) {
    setPasswordError('New password must be at least 8 characters');
    return;
  }
  if (newPassword !== confirmNewPassword) {
    setPasswordError('New passwords do not match');
    return;
  }
  
  setChangingPassword(true);
  try {
    const response = await fetch(`${API_URL}/providers/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: provider?._id,
        currentPassword,
        password: newPassword
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to change password');
    }
    
    setPasswordSuccess('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  } catch (err: any) {
    setPasswordError(err.message || 'Failed to change password');
  } finally {
    setChangingPassword(false);
  }
};

  if (!provider) {
    navigate('/login');
    return null;
  }

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-600">Manage your account and preferences</p>
              </div>
            </div>
            {successMessage && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <Check className="w-4 h-4" />
                {successMessage}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm overflow-hidden">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${section.id === 'danger' ? 'text-red-600 hover:bg-red-50' : ''}`}
                >
                  <section.icon className={`w-5 h-5 ${section.id === 'danger' ? 'text-red-500' : ''}`} />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Account Section */}
            {activeSection === 'account' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Practice Name</label>
                    <input
                      type="text"
                      defaultValue={provider.practiceName}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Contact support to change your practice name</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue={provider.contactInfo?.email || provider.email}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue={provider.contactInfo?.phone || provider.phone}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="border-t border-gray-200 pt-6 mt-6">
  <h3 className="text-md font-semibold text-gray-900 mb-4">Change Password</h3>
  
  {passwordError && (
    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
      {passwordError}
    </div>
  )}
  
  {passwordSuccess && (
    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
      {passwordSuccess}
    </div>
  )}

  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        placeholder="Enter current password"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        placeholder="Minimum 8 characters"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
      <input
        type="password"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        placeholder="Re-enter new password"
      />
    </div>
    <button
      onClick={handleChangePassword}
      disabled={changingPassword}
      className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
    >
      {changingPassword ? 'Changing...' : 'Update Password'}
    </button>
  </div>
</div>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'emailInquiries', label: 'New patient inquiries' },
                        { key: 'emailBookings', label: 'Booking confirmations' },
                        { key: 'emailReviews', label: 'New reviews' },
                        { key: 'emailMarketing', label: 'Marketing and updates' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                          <span className="text-gray-700">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">SMS Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'smsBookings', label: 'Booking alerts' },
                        { key: 'smsReminders', label: 'Appointment reminders' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                          <span className="text-gray-700">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  {[
                    { key: 'profileVisible', label: 'Profile visible to patients', description: 'When enabled, patients can find and view your profile' },
                    { key: 'showEmail', label: 'Show email address', description: 'Display your email on your public profile' },
                    { key: 'showPhone', label: 'Show phone number', description: 'Display your phone number on your public profile' },
                    { key: 'allowMessages', label: 'Allow patient messages', description: 'Let patients send you messages through Findr Health' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacy[item.key as keyof typeof privacy]}
                        onChange={(e) => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 mt-4"
                  >
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            )}

            {/* Business Hours Section */}
            {activeSection === 'hours' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Business Hours</h2>
                <div className="space-y-4">
                  {Object.entries(hours).map(([day, schedule]) => (
                    <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className="w-24 font-medium text-gray-900 capitalize">{day}</span>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!schedule.closed}
                          onChange={(e) => setHours({ ...hours, [day]: { ...schedule, closed: !e.target.checked } })}
                          className="w-4 h-4 text-teal-600 rounded"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </label>
                      {!schedule.closed && (
                        <>
                          <input
                            type="time"
                            value={schedule.open}
                            onChange={(e) => setHours({ ...hours, [day]: { ...schedule, open: e.target.value } })}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={schedule.close}
                            onChange={(e) => setHours({ ...hours, [day]: { ...schedule, close: e.target.value } })}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                        </>
                      )}
                      {schedule.closed && <span className="text-gray-500 italic">Closed</span>}
                    </div>
                  ))}
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 mt-4"
                  >
                    Save Hours
                  </button>
                </div>
              </div>
            )}

            {/* Billing Section */}
            {activeSection === 'billing' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing & Payments</h2>
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Free During Beta</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Findr Health is currently free while in beta. We'll notify you before introducing any paid features.
                  </p>
                </div>
              </div>
            )}

            {/* Integrations Section */}
            {activeSection === 'integrations' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Integrations</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Google Calendar', description: 'Sync appointments with your Google Calendar', connected: false },
                    { name: 'Outlook Calendar', description: 'Sync appointments with Outlook', connected: false },
                    { name: 'Stripe', description: 'Accept online payments', connected: false },
                    { name: 'Zoom', description: 'Enable video consultations', connected: false },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{integration.name}</p>
                        <p className="text-sm text-gray-500">{integration.description}</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                        Connect
                      </button>
                    </div>
                  ))}
                  <p className="text-sm text-gray-500 mt-4">More integrations coming soon!</p>
                </div>
              </div>
            )}

            {/* Support Section */}
            {activeSection === 'support' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Help & Support</h2>
                <div className="space-y-4">
                  <a href="#" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Help Center</p>
                      <p className="text-sm text-gray-500">Browse FAQs and guides</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </a>
                  <a href="mailto:support@findrhealth.com" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Contact Support</p>
                      <p className="text-sm text-gray-500">support@findrhealth.com</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </a>
                  <a href="#" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Request a Feature</p>
                      <p className="text-sm text-gray-500">Tell us what you'd like to see</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </a>
                </div>
              </div>
            )}

            {/* Danger Zone Section */}
            {activeSection === 'danger' && (
              <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
                <h2 className="text-lg font-semibold text-red-600 mb-6">Danger Zone</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Sign Out</p>
                        <p className="text-sm text-gray-500">Sign out of your account on this device</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Deactivate Account</p>
                        <p className="text-sm text-gray-500">Hide your profile from patients temporarily</p>
                      </div>
                      <button
                        onClick={handleDeactivate}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-600">Delete Account</p>
                        <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
