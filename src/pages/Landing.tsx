import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, LogIn, Building2, Shield, TrendingUp, Users } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          {/* Logo only - made larger */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/findr-logo.svg" 
              alt="Findr Health" 
              className="h-16 md:h-20"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Provider Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of healthcare providers connecting with patients in their community
          </p>
        </div>

        {/* Two Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {/* New Provider Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">New Provider</h2>
            <p className="text-gray-600 mb-6">
              Join Findr Health and list your practice. Get discovered by patients searching for providers in your area.
            </p>
            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">✓</span>
                Free to join during beta
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">✓</span>
                Create your profile in minutes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">✓</span>
                Reach new patients instantly
              </li>
            </ul>
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>

          {/* Existing Provider Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center mb-6">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Existing Provider</h2>
            <p className="text-gray-600 mb-6">
              Already registered? Sign in to manage your profile, view analytics, and connect with patients.
            </p>
            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">✓</span>
                Update your profile anytime
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">✓</span>
                View analytics & insights
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">✓</span>
                Manage reviews & bookings
              </li>
            </ul>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Why providers choose Findr Health
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Reach More Patients</h4>
              <p className="text-sm text-gray-600">Connect with patients actively searching for your services</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-cyan-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Showcase Your Practice</h4>
              <p className="text-sm text-gray-600">Beautiful profiles with photos, services, and team info</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Track Performance</h4>
              <p className="text-sm text-gray-600">Analytics dashboard to monitor views and inquiries</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Verified Profiles</h4>
              <p className="text-sm text-gray-600">Build trust with credential verification badges</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>© 2025 Findr Health. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
