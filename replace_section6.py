#!/usr/bin/env python3

with open('src/pages/onboarding/CompleteProfile.tsx', 'r') as f:
    lines = f.readlines()

# Replace lines 1357-1378 (0-indexed: 1356-1377)
new_section = '''            {/* SECTION 6: CANCELLATION POLICY - READ ONLY */}
            <div className="border-t border-gray-200 pt-8 pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">6. Cancellation Policy</h2>
              
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-5 mb-4">
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
              
              <p className="text-sm text-gray-600">
                You retain the right to waive cancellation fees on a case-by-case basis for exceptional circumstances. 
                When you cancel a booking, the patient always receives a full refund.
              </p>
            </div>
'''

# Replace lines 1356-1377 (22 lines) with new section
new_lines = lines[:1356] + [new_section] + lines[1378:]

with open('src/pages/onboarding/CompleteProfile.tsx', 'w') as f:
    f.writelines(new_lines)

print("✅ Section 6 replaced with read-only policy display")
