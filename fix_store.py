#!/usr/bin/env python3

with open('src/store/bookingsStore.ts', 'r') as f:
    content = f.read()

# Fix 1: Add status mapping
old_fetch = '''fetchBookings: async (providerId, status = 'pending', limit = 20, offset = 0) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(
            `${API_URL}/bookings/provider/${providerId}?status=${status}&limit=${limit}&offset=${offset}`,'''

new_fetch = '''fetchBookings: async (providerId, status = 'pending', limit = 20, offset = 0) => {
        set({ loading: true, error: null });
        
        // Map frontend status to backend status
        const statusMap: Record<string, string> = {
          'pending': 'pending_confirmation',
          'upcoming': 'upcoming',
          'past': 'past'
        };
        const backendStatus = statusMap[status] || status;
        
        try {
          const response = await fetch(
            `${API_URL}/bookings/provider/${providerId}?status=${backendStatus}&limit=${limit}&offset=${offset}`,'''

content = content.replace(old_fetch, new_fetch)

# Fix 2: Remove duplicate x-provider-id headers (keep only one)
content = content.replace(
    '''headers: {
                'x-provider-id': providerId,
                'x-provider-id': providerId
              }''',
    '''headers: {
                'x-provider-id': providerId
              }'''
)

content = content.replace(
    '''headers: {
                  'Content-Type': 'application/json',
                  'x-provider-id': providerId,
                  'x-provider-id': providerId,''',
    '''headers: {
                  'Content-Type': 'application/json',
                  'x-provider-id': providerId,'''
)

content = content.replace(
    '''headers: {
                  'Content-Type': 'application/json',
                  'x-provider-id': providerId,
                  'x-provider-id': providerId
              },''',
    '''headers: {
                  'Content-Type': 'application/json',
                  'x-provider-id': providerId
              },'''
)

with open('src/store/bookingsStore.ts', 'w') as f:
    f.write(content)

print('✅ Fixed status mapping and duplicate headers')
