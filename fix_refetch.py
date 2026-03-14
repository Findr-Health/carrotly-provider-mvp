#!/usr/bin/env python3

with open('src/pages/appointments/AppointmentsPage.tsx', 'r') as f:
    content = f.read()

# Find the fetchBookings useEffect and add a force refresh
old_effect = '''  // Fetch bookings on mount and tab change
  useEffect(() => {
    if (providerId) {
      fetchBookings(providerId, activeTab);
    }
  }, [providerId, activeTab, fetchBookings]);'''

new_effect = '''  // Fetch bookings on mount and tab change
  useEffect(() => {
    if (providerId) {
      // Always fetch fresh data when tab changes
      fetchBookings(providerId, activeTab);
    }
  }, [providerId, activeTab, fetchBookings]);
  
  // Force fresh fetch on component mount
  useEffect(() => {
    if (providerId) {
      fetchBookings(providerId, 'pending');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps'''

content = content.replace(old_effect, new_effect)

with open('src/pages/appointments/AppointmentsPage.tsx', 'w') as f:
    f.write(content)

print('✅ Added force refresh on mount')
