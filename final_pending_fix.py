with open('src/pages/appointments/AppointmentsPage.tsx', 'r') as f:
    content = f.read()

# Find where pending bookings are displayed
old = '''          {activeTab === 'pending' && (
            loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : error ? (
              <AlertBanner type="error" message={error} />
            ) : bookings.length === 0 ? ('''

new = '''          {activeTab === 'pending' && (
            loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : error ? (
              <AlertBanner type="error" message={error} />
            ) : (bookings.length === 0 || pendingCount === 0) ? ('''

content = content.replace(old, new)

with open('src/pages/appointments/AppointmentsPage.tsx', 'w') as f:
    f.write(content)
print('✅ Fixed pending display logic')
