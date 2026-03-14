#!/usr/bin/env python3

with open('src/pages/onboarding/CompleteProfile.tsx', 'r') as f:
    content = f.read()

# Find and replace the entire Step 6 section
old_section = '''              {/* Step 6: Cancellation Policy */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                      6
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                    <p className="text-gray-600 mb-6">Choose the policy that applies to all bookings at your practice.</p>
                    
                    <div className="space-y-4">

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex">
                      <div className="ml-3 text-sm text-blue-700">
                        <p className="font-medium">Important</p>
                        <p className="mt-1">
                          When you cancel a booking, the patient always receives a full refund. You can change your cancellation policy at any time from your dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                </div>
              </div>'''

new_section = '''              {/* Step 6: Cancellation Policy - Read Only */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                      6
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                    
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium text-teal-900 mb-2">
                        Standard 24-Hour Policy (All Providers)
                      </p>
                      <p className="text-sm text-teal-700 mb-3">
                        All providers on Findr Health use our standard cancellation policy to ensure consistency for patients.
                      </p>
                      <ul className="space-y-1.5 text-sm text-gray-700">
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>24+ hours before: <strong className="text-green-600">Full refund</strong></span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>12-24 hours before: <strong className="text-yellow-600">75% refund</strong> (25% fee)</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>Less than 12 hours: <strong className="text-orange-600">50% refund</strong> (50% fee)</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>
                          <span>No-show: <strong className="text-red-600">Full charge</strong></span>
                        </li>
                      </ul>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      You retain the right to waive cancellation fees on a case-by-case basis for exceptional circumstances. When you cancel a booking, the patient always receives a full refund.
                    </p>
                  </div>
                </div>
              </div>'''

content = content.replace(old_section, new_section)

with open('src/pages/onboarding/CompleteProfile.tsx', 'w') as f:
    f.write(content)

print("✅ Replaced Step 6 with read-only policy display")
