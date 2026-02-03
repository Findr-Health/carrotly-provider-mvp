#!/usr/bin/env python3

with open('src/store/bookingsStore.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
skip_next = False

for i, line in enumerate(lines):
    if skip_next:
        skip_next = False
        continue
    
    # Check if this line has x-provider-id and next line is duplicate
    if "'x-provider-id': providerId" in line:
        if i + 1 < len(lines) and "'x-provider-id': providerId" in lines[i + 1]:
            # Keep current line, skip next
            new_lines.append(line)
            skip_next = True
            continue
    
    new_lines.append(line)

# Also add status mapping in fetchBookings
content = ''.join(new_lines)

old_fetch = '''fetchBookings: async (providerId, status = 'pending', limit = 20, offset = 0) => {
        set({ loading: true, error: null });
        
        try {'''

new_fetch = '''fetchBookings: async (providerId, status = 'pending', limit = 20, offset = 0) => {
        set({ loading: true, error: null });
        
        // Map frontend status to backend status
        const statusMap: Record<string, string> = {
          'pending': 'pending_confirmation',
          'upcoming': 'upcoming',
          'past': 'past'
        };
        const backendStatus = statusMap[status] || status;
        
        try {'''

content = content.replace(old_fetch, new_fetch)
content = content.replace('?status=${status}&', '?status=${backendStatus}&')

with open('src/store/bookingsStore.ts', 'w') as f:
    f.write(content)

print('✅ Fixed all duplicates and added status mapping')
