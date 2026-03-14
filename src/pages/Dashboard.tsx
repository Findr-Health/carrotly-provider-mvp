import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProviderData } from '../hooks/useProviderData';
import { Eye, Calendar, Star, DollarSign, Bell, Edit, Plus, Settings, TrendingUp, LogOut, RefreshCw, BarChart3, FileText, AlertTriangle, X, Download, Zap, Shield, Clock, ArrowRight } from 'lucide-react';
import FindrLogo from '../components/branding/FindrLogo';
import { AIBriefingPanel } from '../components/ai/AIBriefingPanel';

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

const API_URL = import.meta.env.VITE_API_URL || 'https://fearless-achievement-production.up.railway.app/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { provider, loading, refreshProvider, clearProvider } = useProviderData();
  const [refreshing, setRefreshing] = useState(false);
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [signature, setSignature] = useState('');
  const [signerTitle, setSignerTitle] = useState('');
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState('');

  const needsAgreement = provider?.status === 'pending_agreement';

  const handleSignAgreement = async () => {
    if (!signature.trim() || signature.trim().length < 3) {
      setSignError('Please enter your full legal name');
      return;
    }
    setSigning(true);
    setSignError('');
    try {
      const response = await fetch(`${API_URL}/providers/${provider._id}/sign-agreement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signature.trim(), title: signerTitle.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to sign agreement');
      await refreshProvider();
      setShowSigningModal(false);
      setSignature('');
      setSignerTitle('');
      alert('Agreement signed successfully! Your application is now under review.');
    } catch (error: any) {
      setSignError(error.message || 'Failed to sign agreement. Please try again.');
    } finally {
      setSigning(false);
    }
  };

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
            <button onClick={() => navigate('/onboarding')} className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600">
              Start Onboarding →
            </button>
            <button onClick={() => navigate('/login')} className="w-full py-3 border-2 border-teal-500 text-teal-600 rounded-lg font-semibold hover:bg-teal-50">
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
              <button onClick={handleRefresh} disabled={refreshing} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg" title="Refresh data">
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold">{provider.practiceName?.charAt(0) || 'P'}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{provider.practiceName}</p>
                  <p className="text-xs text-gray-600">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      provider.status === 'approved' ? 'bg-green-100 text-green-800' :
                      provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      provider.status === 'pending_agreement' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {provider.status === 'pending_agreement' ? 'Needs Signature' : provider.status || 'pending'}
                    </span>
                  </p>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Sign out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Calendar Connection Banner */}
        {provider && !provider.calendarConnected && provider.status !== 'approved' && (
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-teal-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4 flex-1 min-w-[300px]">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Connect Your Calendar for 3x More Bookings</h3>
                  <p className="text-sm text-gray-700 mb-3">Enable instant booking by syncing your calendar. Takes 30 seconds.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg text-xs font-medium text-gray-700 border border-gray-200"><Zap className="w-4 h-4 text-yellow-500" />Instant bookings</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg text-xs font-medium text-gray-700 border border-gray-200"><Shield className="w-4 h-4 text-green-500" />No double-bookings</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg text-xs font-medium text-gray-700 border border-gray-200"><Clock className="w-4 h-4 text-blue-500" />Zero manual work</span>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/calendar')} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap">
                Connect Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Agreement Required Banner */}
        {needsAgreement && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-full"><AlertTriangle className="w-8 h-8" /></div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Action Required: Sign Provider Agreement</h2>
                <p className="text-amber-100 mb-4">Your profile has been saved, but your application won't be reviewed until you sign the Provider Participation Agreement.</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setShowSigningModal(true)} className="px-6 py-2 bg-white text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center gap-2">
                    <FileText className="w-5 h-5" />Sign Agreement Now
                  </button>
                  <a href="/legal/Findr_Health_Provider_Participation_Agreement.pdf" download className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center gap-2 border border-amber-400">
                    <Download className="w-5 h-5" />Download PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Morning Briefing — PRIMARY ELEMENT */}
        <AIBriefingPanel
          providerId={provider._id}
          providerName={provider.practiceName || 'Nich Pertuit'}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard icon={Eye} label="Services Listed" value={servicesCount} subtitle="Active services" color="teal" />
          <StatsCard icon={Calendar} label="Photos" value={photosCount} subtitle="Profile photos" color="green" />
          <StatsCard icon={Star} label="Team Members" value={teamCount} subtitle="Staff profiles" color="purple" />
          <StatsCard icon={DollarSign} label="Status" value={provider.status === 'approved' ? 'Live' : 'Pending'} subtitle={provider.status === 'approved' ? 'Visible to patients' : 'Under review'} color="blue" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Summary */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Profile Summary</h3>
              <button onClick={() => navigate('/preview')} className="text-teal-600 hover:text-teal-700 text-sm font-medium">Preview Profile →</button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Email:</span><p className="text-gray-900">{provider.contactInfo?.email || provider.email || 'Not set'}</p></div>
                  <div><span className="text-gray-500">Phone:</span><p className="text-gray-900">{provider.contactInfo?.phone || provider.phone || 'Not set'}</p></div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                <p className="text-sm text-gray-900">
                  {provider.address ? `${provider.address.street || ''}, ${provider.address.city || ''}, ${provider.address.state || ''} ${provider.address.zip || ''}`.trim() : 'Not set'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Services ({servicesCount})</h4>
                <div className="space-y-2">
                  {(provider.services || []).slice(0, 3).map((service: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-900">{service.name}</span>
                      <span className="text-gray-600">${service.price} · {service.duration} min</span>
                    </div>
                  ))}
                  {servicesCount === 0 && <span className="text-gray-500 text-sm">No services added</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: Eye, label: 'View Profile', sub: 'See patient view', route: '/preview', bg: 'bg-teal-100', color: 'text-teal-600' },
                { icon: Edit, label: 'Edit Profile', sub: 'Update information', route: '/edit-profile', bg: 'bg-green-100', color: 'text-green-600' },
                { icon: BarChart3, label: 'Analytics', sub: 'View performance', route: '/analytics', bg: 'bg-purple-100', color: 'text-purple-600' },
                { icon: Plus, label: 'Add Service', sub: 'New service offering', route: '/edit-profile', bg: 'bg-blue-100', color: 'text-blue-600' },
                { icon: Star, label: 'Reviews', sub: 'Ratings & feedback', route: '/reviews', bg: 'bg-cyan-100', color: 'text-cyan-600' },
                { icon: DollarSign, label: 'Payments', sub: 'Stripe setup', route: '/payments', bg: 'bg-emerald-100', color: 'text-emerald-600' },
                { icon: Calendar, label: 'Calendar', sub: 'Sync availability', route: '/calendar', bg: 'bg-blue-100', color: 'text-blue-600' },
                { icon: Settings, label: 'Settings', sub: 'Account settings', route: '/settings', bg: 'bg-gray-100', color: 'text-gray-600' },
              ].map(({ icon: Icon, label, sub, route, bg, color }) => (
                <button key={label} onClick={() => navigate(route)} className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mr-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-600">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
          <h3 className="font-bold text-teal-900 mb-2">Need Help?</h3>
          <p className="text-teal-700 text-sm mb-4">Our team is here to help you get the most out of Findr Health.</p>
          <a href="mailto:support@findrhealth.com" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium text-sm">Contact Support →</a>
        </div>

        {/* Agreement Signing Modal */}
        {showSigningModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Sign Provider Agreement</h2>
                <button onClick={() => setShowSigningModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type Your Full Legal Name to Sign *</label>
                    <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-serif text-lg" placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title (Optional)</label>
                    <input type="text" value={signerTitle} onChange={(e) => setSignerTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="Owner, Director, etc." />
                  </div>
                  {signature && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Signature Preview:</p>
                      <p className="text-2xl font-serif text-gray-900">{signature}</p>
                      <p className="text-sm text-gray-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  )}
                  {signError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{signError}</div>}
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                <button onClick={() => setShowSigningModal(false)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all">Cancel</button>
                <button onClick={handleSignAgreement} disabled={signing || !signature.trim()} className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {signing ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Signing...</> : <><FileText className="w-5 h-5" />Sign Agreement</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
