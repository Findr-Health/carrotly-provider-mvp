import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProviderData } from '../hooks/useProviderData';
import { Eye, Calendar, Star, DollarSign, Bell, User, Edit, Plus, MessageSquare, Settings, TrendingUp, LogOut, RefreshCw, BarChart3 } from 'lucide-react';
import FindrLogo from '../components/branding/FindrLogo';

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  change?: string;
  subtitle?: string;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, change, subtitle, color = 'teal' }) => {
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <span className="text-green-600 text-sm font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { provider, loading, refreshProvider, clearProvider } = useProviderData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProvider();
    setRefreshing(false);
  };

  const handleLogout = () => {
    clearProvider();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!provider || !provider.practiceName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FindrLogo size="md" showText={true} />
          <h2 className="text-2xl font-bold mb-4 mt-6">Welcome to Findr Health!</h2>
          <p className="text-gray-600 mb-6">Get started by completing your provider profile or sign in to your existing account.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/onboarding')}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600"
            >
              Start Onboarding →
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full py-3 border-2 border-teal-500 text-teal-600 rounded-lg font-semibold hover:bg-teal-50"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const servicesCount = provider.services?.length || 0;
  const photosCount = provider.photos?.length || 0;
  const teamCount = provider.teamMembers?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FindrLogo size="sm" showText={true} />
              <div className="ml-4 pl-4 border-l border-gray-200">
                <h1 className="text-lg font-bold text-gray-900">Provider Portal</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold">
                    {provider.practiceName?.charAt(0) || 'P'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{provider.practiceName}</p>
                  <p className="text-xs text-gray-600">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      provider.status === 'approved' ? 'bg-green-100 text-green-800' :
                      provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {provider.status || 'pending'}
                    </span>
                  </p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {provider.practiceName}!
          </h2>
          <p className="text-teal-100">
            {provider.status === 'approved' 
              ? 'Your profile is live and visible to patients.'
              : provider.status === 'pending'
              ? 'Your profile is under review. We\'ll notify you once approved.'
              : 'Complete your profile to get started.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Eye}
            label="Services Listed"
            value={servicesCount}
            subtitle="Active services"
            color="teal"
          />
          <StatsCard
            icon={Calendar}
            label="Photos"
            value={photosCount}
            subtitle="Profile photos"
            color="green"
          />
          <StatsCard
            icon={Star}
            label="Team Members"
            value={teamCount}
            subtitle="Staff profiles"
            color="purple"
          />
          <StatsCard
            icon={DollarSign}
            label="Status"
            value={provider.status === 'approved' ? 'Live' : 'Pending'}
            subtitle={provider.status === 'approved' ? 'Visible to patients' : 'Under review'}
            color="blue"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Summary */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Profile Summary</h3>
              <button 
                onClick={() => navigate('/preview')}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                Preview Profile →
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="text-gray-900">{provider.contactInfo?.email || provider.email || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="text-gray-900">{provider.contactInfo?.phone || provider.phone || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                <p className="text-sm text-gray-900">
                  {provider.address ? 
                    `${provider.address.street || ''} ${provider.address.suite ? ', ' + provider.address.suite : ''}, ${provider.address.city || ''}, ${provider.address.state || ''} ${provider.address.zip || ''}`.trim()
                    : 'Not set'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Provider Types</h4>
                <div className="flex flex-wrap gap-2">
                  {(provider.providerTypes || []).map((type: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                      {type}
                    </span>
                  ))}
                  {(!provider.providerTypes || provider.providerTypes.length === 0) && (
                    <span className="text-gray-500 text-sm">No types selected</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Services ({servicesCount})</h4>
                <div className="space-y-2">
                  {(provider.services || []).slice(0, 3).map((service: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-900">{service.name}</span>
                      <span className="text-gray-600">${service.price} • {service.duration} min</span>
                    </div>
                  ))}
                  {servicesCount > 3 && (
                    <p className="text-teal-600 text-sm">+{servicesCount - 3} more services</p>
                  )}
                  {servicesCount === 0 && (
                    <span className="text-gray-500 text-sm">No services added</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/preview')}
                className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                  <Eye className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">View Profile</p>
                  <p className="text-xs text-gray-600">See patient view</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/edit-profile')}
                className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Edit className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Edit Profile</p>
                  <p className="text-xs text-gray-600">Update information</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/analytics')}
                className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-xs text-gray-600">View performance</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/edit-profile')}
                className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Add Service</p>
                  <p className="text-xs text-gray-600">New service offering</p>
                </div>
              </button>

              <button onClick={() => navigate("/reviews")} className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Reviews</p>
                  <p className="text-xs text-gray-600">Ratings & feedback</p>
                </div>
              </button>

              <button onClick={() => navigate("/settings")} className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Settings</p>
                  <p className="text-xs text-gray-600">Account settings</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
          <h3 className="font-bold text-teal-900 mb-2">Need Help?</h3>
          <p className="text-teal-700 text-sm mb-4">
            Our team is here to help you get the most out of Findr Health.
          </p>
          <a 
            href="mailto:support@findrhealth.com"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium text-sm"
          >
            Contact Support →
          </a>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
