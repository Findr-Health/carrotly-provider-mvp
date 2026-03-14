#!/usr/bin/env python3

# Fix CompleteProfile.tsx
print("Fixing CompleteProfile.tsx...")
with open('src/pages/onboarding/CompleteProfile.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip_until = None

for i, line in enumerate(lines):
    # Skip the Fee Waiver checkbox section (lines around 1420-1450)
    if "Fee Waiver Option" in line or "Allow fee waivers" in line:
        skip_until = "END_FEE_WAIVER"
        continue
    
    if skip_until == "END_FEE_WAIVER":
        # Skip until we find the next section or closing div
        if ("Info Box" in line or "Important" in line or 
            (i > 1440 and "</div>" in line and "border-t" not in lines[i-5:i])):
            skip_until = None
            new_lines.append(line)
        continue
    
    new_lines.append(line)

with open('src/pages/onboarding/CompleteProfile.tsx', 'w') as f:
    f.writelines(new_lines)
print("✓ CompleteProfile.tsx fixed")

# Fix EditProfile.tsx - remove the loading line and checkbox section
print("\nFixing EditProfile.tsx...")
with open('src/pages/EditProfile.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip_until = None

for i, line in enumerate(lines):
    # Skip line 176 (setAllowFeeWaiver in useEffect)
    if i == 175 and "setAllowFeeWaiver" in line:
        continue
    
    # Skip the Fee Waiver checkbox section (lines around 1265-1295)
    if i > 1260 and ("Fee Waiver Option" in line or "Allow fee waivers" in line):
        skip_until = "END_FEE_WAIVER"
        continue
    
    if skip_until == "END_FEE_WAIVER":
        if ("Info Box" in line or "Important" in line or 
            (i > 1280 and "</div>" in line and "space-y-4" in lines[i+1] if i+1 < len(lines) else False)):
            skip_until = None
            new_lines.append(line)
        continue
    
    new_lines.append(line)

with open('src/pages/EditProfile.tsx', 'w') as f:
    f.writelines(new_lines)
print("✓ EditProfile.tsx fixed")

print("\n✅ All references removed!")
