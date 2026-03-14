#!/usr/bin/env python3

with open('src/pages/onboarding/CompleteProfile.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip_until = None

for i, line in enumerate(lines):
    # Skip state variables
    if "const [cancellationPolicy, setCancellationPolicy]" in line:
        continue
    if "const [allowFeeWaiver, setAllowFeeWaiver]" in line:
        continue
    
    # Skip from profileData in form submission
    if "cancellationPolicy: {" in line:
        skip_until = "},"
        continue
    
    if skip_until and skip_until in line:
        skip_until = None
        continue
    
    if skip_until:
        continue
    
    # Replace the cancellation policy section in the render
    if "Cancellation Policy" in line and "<h3" in line and i < 600:
        # Found the section header, replace entire section until next major section
        # Skip until we find the next section or closing div
        skip_until = "POLICY_SECTION_END"
        new_lines.append('              {/* Cancellation Policy - Read Only */}\n')
        new_lines.append('              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">\n')
        new_lines.append('                <div className="flex items-start">\n')
        new_lines.append('                  <div className="flex-shrink-0">\n')
        new_lines.append('                    <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">\n')
        new_lines.append('                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />\n')
        new_lines.append('                    </svg>\n')
        new_lines.append('                  </div>\n')
        new_lines.append('                  <div className="ml-4 flex-1">\n')
        new_lines.append('                    <h3 className="text-lg font-semibold text-gray-900 mb-2">\n')
        new_lines.append('                      Cancellation Policy\n')
        new_lines.append('                    </h3>\n')
        new_lines.append('                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-3">\n')
        new_lines.append('                      <p className="text-sm font-medium text-teal-900 mb-2">\n')
        new_lines.append('                        Standard 24-Hour Policy (All Providers)\n')
        new_lines.append('                      </p>\n')
        new_lines.append('                      <p className="text-sm text-teal-700 mb-3">\n')
        new_lines.append('                        All providers on Findr Health use our standard cancellation policy to ensure consistency for patients.\n')
        new_lines.append('                      </p>\n')
        new_lines.append('                      <ul className="space-y-1.5 text-sm text-gray-700">\n')
        new_lines.append('                        <li className="flex items-center">\n')
        new_lines.append('                          <span className="mr-2">✓</span>\n')
        new_lines.append('                          <span>24+ hours before: <strong className="text-green-600">Full refund</strong></span>\n')
        new_lines.append('                        </li>\n')
        new_lines.append('                        <li className="flex items-center">\n')
        new_lines.append('                          <span className="mr-2">✓</span>\n')
        new_lines.append('                          <span>12-24 hours before: <strong className="text-yellow-600">75% refund</strong> (25% fee)</span>\n')
        new_lines.append('                        </li>\n')
        new_lines.append('                        <li className="flex items-center">\n')
        new_lines.append('                          <span className="mr-2">✓</span>\n')
        new_lines.append('                          <span>Less than 12 hours: <strong className="text-orange-600">50% refund</strong> (50% fee)</span>\n')
        new_lines.append('                        </li>\n')
        new_lines.append('                        <li className="flex items-center">\n')
        new_lines.append('                          <span className="mr-2">✓</span>\n')
        new_lines.append('                          <span>No-show: <strong className="text-red-600">Full charge</strong></span>\n')
        new_lines.append('                        </li>\n')
        new_lines.append('                      </ul>\n')
        new_lines.append('                    </div>\n')
        new_lines.append('                    <p className="text-xs text-gray-500">\n')
        new_lines.append('                      You retain the right to waive cancellation fees on a case-by-case basis for exceptional circumstances.\n')
        new_lines.append('                    </p>\n')
        new_lines.append('                  </div>\n')
        new_lines.append('                </div>\n')
        new_lines.append('              </div>\n')
        continue
    
    # End of policy section when we hit Fee Waiver or next section
    if skip_until == "POLICY_SECTION_END":
        if ("Fee Waiver" in line or 
            "Step 9" in line or 
            "Agreement" in line or
            ("className=\"bg-white" in line and "</div>" not in lines[i-1])):
            skip_until = None
            new_lines.append(line)
        continue
    
    new_lines.append(line)

with open('src/pages/onboarding/CompleteProfile.tsx', 'w') as f:
    f.writelines(new_lines)

print("✅ CompleteProfile.tsx fixed")
