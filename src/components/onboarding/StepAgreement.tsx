import React, { useState } from 'react';
import { Button } from '../common';
import { CheckCircle, Circle, FileText, AlertCircle } from 'lucide-react';

interface StepAgreementProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

interface AgreementSection {
  id: number;
  title: string;
  content: string;
}

export const StepAgreement: React.FC<StepAgreementProps> = ({ data, onNext, onBack }) => {
  const [initials, setInitials] = useState<Record<number, string>>(data.agreement?.initials || {});
  const [signature, setSignature] = useState(data.agreement?.signature || '');
  const [title, setTitle] = useState(data.agreement?.title || '');
  const [showErrors, setShowErrors] = useState(false);

  const agreementSections: AgreementSection[] = [
    {
      id: 1,
      title: "Purpose & Relationship",
      content: "I acknowledge independent-contractor status and no medical advice/referrals by Findr Health."
    },
    {
      id: 2,
      title: "Provider Obligations",
      content: "I confirm required credentials, insurance ($1M/$3M), and compliance with HIPAA/FTC/state law."
    },
    {
      id: 3,
      title: "Listings, Pricing & Subscriptions",
      content: "I agree to accurate listings, clear fees, and ROSCA/FTC compliance for recurring offers."
    },
    {
      id: 4,
      title: "Payments & Settlement",
      content: "I appoint Findr Health as limited payment collection agent (agent-of-payee)."
    },
    {
      id: 5,
      title: "Payments & Settlement (Reserves/Refunds)",
      content: "I authorize delayed release, reserves, and set-offs for refunds/chargebacks."
    },
    {
      id: 6,
      title: "Cancellations & Refunds",
      content: "I acknowledge refund transparency and Findr Health refund authority; state-law overrides apply."
    },
    {
      id: 7,
      title: "Data Protection & HIPAA",
      content: "I will protect PHI; BAA applies if PHI is exchanged; breach notice within 10 business days."
    },
    {
      id: 8,
      title: "Marketing & Conduct",
      content: "I agree to TCPA/CAN-SPAM consent and professional conduct and confidentiality."
    },
    {
      id: 9,
      title: "Reviews & Ratings",
      content: "I will not block/buy/manipulate reviews; CRFA + FTC Fake Reviews Rule apply."
    },
    {
      id: 10,
      title: "Insurance & Indemnification",
      content: "I accept required insurance limits and indemnification duties."
    },
    {
      id: 11,
      title: "Intellectual Property",
      content: "I grant display license for my content; acknowledge Findr Health IP; unlawful content may be removed."
    },
    {
      id: 12,
      title: "Term & Termination",
      content: "30-day termination; immediate suspension for fraud/violation; refunds for unserved bookings."
    },
    {
      id: 13,
      title: "Limitation of Liability",
      content: "I accept liability cap equal to fees retained by Findr Health in prior 12 months (exceptions apply)."
    },
    {
      id: 14,
      title: "Dispute Resolution",
      content: "AAA arbitration with small-claims carve-out and 30-day opt-out; mass-claims staged."
    },
    {
      id: 15,
      title: "Confidentiality & Accessibility",
      content: "I agree to confidentiality and ADA/WCAG cooperation."
    },
    {
      id: 16,
      title: "Amendments & Notices",
      content: "30-day prospective updates via email/dashboard; right to terminate before effective date."
    }
  ];

  const handleInitial = (sectionId: number) => {
    const userInitials = prompt('Please enter your initials (2-3 characters):');
    if (userInitials && userInitials.trim().length >= 2 && userInitials.trim().length <= 4) {
      setInitials(prev => ({
        ...prev,
        [sectionId]: userInitials.trim().toUpperCase()
      }));
      setShowErrors(false);
    } else if (userInitials !== null) {
      alert('Please enter valid initials (2-3 characters)');
    }
  };

  const allSectionsInitialed = agreementSections.every(section => initials[section.id]);
  const initialsCount = Object.keys(initials).length;
  const progress = (initialsCount / agreementSections.length) * 100;

  const handleSubmit = () => {
    if (!allSectionsInitialed) {
      setShowErrors(true);
      alert('Please initial all sections before proceeding.');
      return;
    }

    if (!signature.trim()) {
      setShowErrors(true);
      alert('Please provide your signature (full legal name).');
      return;
    }

    if (signature.trim().length < 3) {
      alert('Please enter your full legal name as signature.');
      return;
    }

    // Save agreement data
    const agreementData = {
      agreement: {
        initials,
        signature: signature.trim(),
        title: title.trim(),
        agreedDate: new Date().toISOString(),
        ipAddress: 'captured-on-backend', // Would be captured server-side
        version: '2025',
      }
    };

    onNext(agreementData);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Provider Participation Agreement</h2>
        <p className="text-gray-600">
          Please review and initial each section of the agreement. This is required to join the Findr Health platform.
        </p>
      </div>

      {/* Provider Information Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-teal-500 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Agreement Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600">Provider Name</p>
            <p className="font-medium text-gray-900">{data.practiceName}</p>
          </div>
          <div>
            <p className="text-gray-600">Authorized Representative</p>
            <p className="font-medium text-gray-900">{data.authorizedRep || 'To be signed'}</p>
          </div>
          <div>
            <p className="text-gray-600">Contact Email</p>
            <p className="font-medium text-gray-900">{data.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Effective Date</p>
            <p className="font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700 font-medium">Agreement Progress</span>
          <span className={`font-semibold ${allSectionsInitialed ? 'text-green-600' : 'text-primary-600'}`}>
            {initialsCount} / {agreementSections.length} sections initialed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-300 ${
              allSectionsInitialed ? 'bg-green-500' : 'bg-primary-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {!allSectionsInitialed && showErrors && (
          <div className="mt-2 flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            Please initial all {agreementSections.length - initialsCount} remaining sections
          </div>
        )}
      </div>

      {/* Agreement Sections */}
      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
        {agreementSections.map((section) => {
          const isInitialed = initials[section.id];
          return (
            <div 
              key={section.id}
              className={`border rounded-lg p-4 transition-all ${
                isInitialed 
                  ? 'border-green-300 bg-green-50' 
                  : showErrors && !isInitialed
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {isInitialed ? (
                      <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle size={18} className={`flex-shrink-0 ${showErrors ? 'text-red-400' : 'text-gray-400'}`} />
                    )}
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {section.id}. {section.title}
                    </h4>
                  </div>
                  <p className="text-gray-700 text-sm ml-6 leading-relaxed">{section.content}</p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isInitialed ? (
                    <div className="text-right">
                      <div className="px-3 py-1.5 bg-green-100 text-green-800 rounded font-mono text-sm font-bold min-w-[60px] text-center">
                        {initials[section.id]}
                      </div>
                      <button
                        onClick={() => handleInitial(section.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 mt-1 underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleInitial(section.id)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Initial
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Signature Section */}
      {allSectionsInitialed && (
        <div className="mt-6 pt-6 border-t-2 border-gray-300">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg mb-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">All Sections Initialed!</h3>
                <p className="text-sm text-green-800">
                  Now please provide your signature below to complete the agreement.
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-3">Final Acknowledgment & Signature</h3>
          <p className="text-sm text-gray-700 mb-4">
            By signing, you confirm all required sections are initialed and you agree to the Findr Health Provider Participation Agreement (Version 2025).
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authorized Representative Signature (Type Full Legal Name) *
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-serif text-lg ${
                  showErrors && !signature.trim() ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Smith"
              />
              {showErrors && !signature.trim() && (
                <p className="text-red-600 text-xs mt-1">Signature is required</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Owner, Director, etc."
              />
            </div>
          </div>

          {signature && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Preview:</p>
              <p className="text-2xl font-serif text-gray-900 mb-1">{signature}</p>
              {title && <p className="text-sm text-gray-600">Title: {title}</p>}
              <p className="text-sm text-gray-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
            </div>
          )}
        </div>
      )}

      {/* Download Agreement Link */}
      <div className="mt-6 p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <div className="flex items-center text-sm">
          <FileText className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
          <p className="text-primary-900">
            <a 
              href="/Findr Health_Provider_Agreement_Fast_Sign_Fillable.pdf" 
              target="_blank" 
              className="font-medium hover:underline"
            >
              View full agreement (PDF)
            </a>
            {' '}for your records
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={onBack}>
          ← Back to Review
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          size="lg" 
          className={`px-8 ${allSectionsInitialed && signature.trim() ? '' : 'opacity-50 cursor-not-allowed'}`}
        >
          <FileText className="w-5 h-5 mr-2" />
          Sign and Submit →
        </Button>
      </div>

      {/* Help Text */}
      {!allSectionsInitialed && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Click "Initial" next to each section to proceed with signing
        </p>
      )}
    </div>
  );
};
export default StepAgreement;
