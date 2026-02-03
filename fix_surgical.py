#!/usr/bin/env python3

# Fix CompleteProfile.tsx - just remove the specific checkbox lines
print("Fixing CompleteProfile.tsx...")
with open('src/pages/onboarding/CompleteProfile.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Skip only lines 1440-1441 (the checkbox with allowFeeWaiver)
    if i == 1439 or i == 1440:  # 0-indexed, so 1439=line 1440, 1440=line 1441
        if "checked={allowFeeWaiver}" in line or "setAllowFeeWaiver" in line:
            continue
    new_lines.append(line)

with open('src/pages/onboarding/CompleteProfile.tsx', 'w') as f:
    f.writelines(new_lines)
print("✓ CompleteProfile.tsx - removed lines 1440-1441")

# Fix EditProfile.tsx - remove line 176 and lines 1283-1284
print("\nFixing EditProfile.tsx...")
with open('src/pages/EditProfile.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Skip line 176 (0-indexed = 175)
    if i == 175 and "setAllowFeeWaiver" in line:
        continue
    # Skip lines 1283-1284 (0-indexed = 1282-1283)
    if (i == 1282 or i == 1283) and ("allowFeeWaiver" in line or "setAllowFeeWaiver" in line):
        continue
    new_lines.append(line)

with open('src/pages/EditProfile.tsx', 'w') as f:
    f.writelines(new_lines)
print("✓ EditProfile.tsx - removed lines 176, 1283-1284")

print("\n✅ Surgical fixes complete!")
