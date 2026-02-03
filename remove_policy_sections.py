#!/usr/bin/env python3

# Fix CompleteProfile.tsx - remove the entire policy selection section
print("Fixing CompleteProfile.tsx...")
with open('src/pages/onboarding/CompleteProfile.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip_mode = False
skip_count = 0

for i, line in enumerate(lines):
    # Start skipping from the Standard Policy radio button (around line 1360)
    if i > 1350 and '{/* Standard Policy */' in line:
        skip_mode = True
        continue
    
    # Stop skipping when we hit the Info Box after Moderate Policy
    if skip_mode and '{/* Info Box */' in line:
        skip_mode = False
        new_lines.append(line)
        continue
    
    if skip_mode:
        continue
    
    new_lines.append(line)

with open('src/pages/onboarding/CompleteProfile.tsx', 'w') as f:
    f.writelines(new_lines)
print("✓ CompleteProfile.tsx - removed policy radio buttons")

# Fix EditProfile.tsx - remove the policy selection section
print("\nFixing EditProfile.tsx...")
with open('src/pages/EditProfile.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip_mode = False

for i, line in enumerate(lines):
    # Remove line 170 with const policy = provider.cancellationPolicy
    if i == 169 and "const policy = provider.cancellationPolicy" in line:
        continue
    
    # Start skipping from Standard Policy radio (around line 1190)
    if i > 1180 and '{/* Standard Policy */' in line:
        skip_mode = True
        continue
    
    # Stop skipping at Info Box
    if skip_mode and '{/* Info Box */' in line:
        skip_mode = False
        new_lines.append(line)
        continue
    
    if skip_mode:
        continue
    
    new_lines.append(line)

with open('src/pages/EditProfile.tsx', 'w') as f:
    f.writelines(new_lines)
print("✓ EditProfile.tsx - removed policy radio buttons")

print("\n✅ Policy selection sections removed!")
