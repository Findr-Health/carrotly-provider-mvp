cat > src/pages/Complete.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, Shield, CheckCheck, Rocket, LayoutDashboard, AlertTriangle, FileText } from 'lucide-react';

export default function Complete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signLater = searchParams.get('signLater') === 'true';
  const [providerName, setProviderName] = useState('');

  // Store provider data from session if available
  useEffect(() => {
    const submittedProvider = sessionStorage.getItem('submittedProvider');
    if (submittedProvider) {
      const provider = JSON.parse(submittedProvider);
      localStorage.setItem('providerId', provider._id || provider.providerId);
      localStorage.setItem('providerData', submittedProvider);
      setProviderName(provider.practiceName || '');
    }
  }, []);

  // Sign Later version
  if (signLater) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-500 rounded-full mb-6">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile Saved!</h1>
            <p className="text-xl text-gray-600">One more step: Sign the Provider Agreement to complete your application.</p>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-800 text-lg mb-2">Agreement Signature Required</h3>
                <p className="text-amber-700">
                  Your profile has been saved, but <strong>your application won't be reviewed</strong> until you sign the Provider Participation Agreement.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What happens next:</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-lg">1</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-gray-900">Sign the Agreement</h3>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Action Required</span>
                  </div>
                  <p className="text-gray-600">Go to your Dashboard and sign the Provider Participation Agreement</p>
                </div>
              </div>

              <div className="flex gap-4 opacity-50">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 font-bold text-lg">2</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h3 className="font-bold text-gray-500">Profile Review</h3>
                  </div>
                  <p className="text-gray-400">Our team will review your profile within 24-48 hours</p>
                </div>
              </div>

              <div className="flex gap-4 opacity-50">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 font-bold text-lg">3</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <h3 className="font-bold text-gray-500">Verification</h3>
                  </div>
                  <p className="text-gray-400">We'll verify your credentials and contact information</p>
                </div>
              </div>

              <div className="flex gap-4 opacity-50">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 font-bold text-lg">4</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Rocket className="w-5 h-5 text-gray-400" />
                    <h3 className="font-bold text-gray-500">Go Live!</h3>
                  </div>
                  <p className="text-gray-400">Your profile will go live and start receiving bookings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Go to Dashboard & Sign Agreement
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-2">Your profile is saved and waiting for your signature</p>
            <button
              onClick={() => window.location.href = 'mailto:support@findrhealth.com'}
              className="text-amber-600 font-medium hover:text-amber-700 hover:underline"
            >
              Questions? Contact our support team
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal completion (with signature)
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile Complete!</h1>
          <p className="text-xl text-gray-600">Your provider profile has been submitted for review.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What happens next:</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-bold text-lg">1</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-gray-900">Profile Review</h3>
                </div>
                <p className="text-gray-600">Our team will review your profile within <strong>24-48 hours</strong></p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-bold text-lg">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-gray-900">Verification</h3>
                </div>
                <p className="text-gray-600">We'll verify your credentials and contact information</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-bold text-lg">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCheck className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-gray-900">Approval Notification</h3>
                </div>
                <p className="text-gray-600">Once approved, you'll receive an email confirmation</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">4</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900">Go Live!</h3>
                </div>
                <p className="text-gray-600">Your profile will go live and start receiving bookings from patients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-5 h-5" />
            Go to My Dashboard
          </button>
          <button
            onClick={() => navigate('/preview')}
            className="flex-1 py-4 border-2 border-teal-500 text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
          >
            Preview My Profile
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-2">You can update your profile anytime from your dashboard</p>
          <button
            onClick={() => window.location.href = 'mailto:support@findrhealth.com'}
            className="text-teal-600 font-medium hover:text-teal-700 hover:underline"
          >
            Questions? Contact our support team
          </button>
        </div>
      </div>
    </div>
  );
}
EOF