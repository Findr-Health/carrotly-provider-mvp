#!/usr/bin/env python3
import re

# Fix Dashboard.tsx - just delete line 267
print("Fixing Dashboard.tsx...")
with open('src/pages/Dashboard.tsx', 'r') as f:
    lines = f.readlines()

# Remove line 267 (index 266)
if 266 < len(lines):
    del lines[266]

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.writelines(lines)
print("✓ Dashboard.tsx fixed")

# Fix EditProfile.tsx - restore from backup and do clean edit
print("Fixing EditProfile.tsx...")
with open('src/pages/EditProfile.tsx.backup', 'r') as f:
    content = f.read()

# Remove the state variables for cancellation policy
content = re.sub(
    r"const \[cancellationTier, setCancellationTier\] = useState<'standard' \| 'moderate'>.*?\n",
    "",
    content
)
content = re.sub(
    r"const \[allowFeeWaiver, setAllowFeeWaiver\] = useState.*?\n",
    "",
    content
)

# Remove the loading of cancellation policy from provider data (multi-line)
content = re.sub(
    r"// Cancellation Policy.*?setAllowFeeWaiver\(typeof policy === 'object' \? \(policy\?\.allowFeeWaiver \?\? true\) : true\);",
    "",
    content,
    flags=re.DOTALL
)

# Remove cancellationPolicy from save function
content = re.sub(
    r",\s*cancellationPolicy: cancellationTier",
    "",
    content
)

# Add policies tab with read-only policy after security tab
security_tab_end = content.find("        )}\n      </main>")
if security_tab_end > 0:
    policies_section = """
        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cancellation Policy
                </h3>
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
                  You retain the right to waive cancellation fees on a case-by-case basis for exceptional circumstances.
                </p>
              </div>
            </div>
          </div>
        )}
"""
    content = content[:security_tab_end] + policies_section + content[security_tab_end:]

with open('src/pages/EditProfile.tsx', 'w') as f:
    f.write(content)
print("✓ EditProfile.tsx fixed")

print("\n✅ All files fixed! Run 'npm run build' to test.")
