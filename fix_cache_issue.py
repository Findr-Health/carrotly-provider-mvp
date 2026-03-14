#!/usr/bin/env python3

with open('src/store/bookingsStore.ts', 'r') as f:
    content = f.read()

# Find the fetchBookings function and add a cache clear at the start
old = '''  fetchBookings: async (providerId, status = 'pending', limit = 20, offset = 0) => {
        set({ loading: true, error: null });'''

new = '''  fetchBookings: async (providerId, status = 'pending', limit = 20, offset = 0) => {
        // Clear existing bookings to force fresh data
        set({ bookings: [], loading: true, error: null });'''

content = content.replace(old, new)

with open('src/store/bookingsStore.ts', 'w') as f:
    f.write(content)

print('✅ Added cache clear to fetchBookings')
