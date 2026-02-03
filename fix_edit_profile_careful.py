#!/usr/bin/env python3

# Restore from backup
with open('src/pages/EditProfile.tsx.backup', 'r') as f:
    lines = f.readlines()

# Find and remove only the specific state variable lines
new_lines = []
skip_next = False
for i, line in enumerate(lines):
    # Skip the cancellation policy state variables (around line 50-60)
    if "const [cancellationTier, setCancellationTier]" in line:
        continue
    if "const [allowFeeWaiver, setAllowFeeWaiver]" in line:
        continue
    
    # Skip the cancellation policy loading block (more careful approach)
    # Just skip lines 150-157 based on backup content
    if i >= 149 and i <= 156:  # 0-indexed, so 149-156 is lines 150-157
        line_content = line.strip()
        if ("Cancellation Policy" in line_content or 
            "const policy = provider.cancellationPolicy" in line_content or
            "if (typeof policy ===" in line_content or
            "setCancellationTier" in line_content or
            "setAllowFeeWaiver" in line_content):
            continue
    
    # Skip cancellationPolicy from save (around line 200)
    if "cancellationPolicy: cancellationTier" in line:
        continue
    
    new_lines.append(line)

# Write back
with open('src/pages/EditProfile.tsx', 'w') as f:
    f.writelines(new_lines)

print("✓ State variables removed")

# Now add the policies tab section
with open('src/pages/EditProfile.tsx', 'r') as f:
    content = f.read()

# Find where to insert (after security tab closes)
insert_marker = "        )}\n      </main>"
insert_pos = content.find(insert_marker)

if insert_pos > 0:
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
    content = content[:insert_pos] + policies_section + content[insert_pos:]
    
    with open('src/pages/EditProfile.tsx', 'w') as f:
        f.write(content)
    
    print("✓ Policies tab added")
else:
    print("❌ Could not find insertion point")

print("\n✅ Done! Run 'npm run build' to test.")
