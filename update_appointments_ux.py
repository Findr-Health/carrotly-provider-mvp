#!/usr/bin/env python3

# Update AppointmentsPage to show calendar integration status
with open('src/pages/appointments/AppointmentsPage.tsx', 'r') as f:
    content = f.read()

# Add calendar integration indicator after the tabs
addition = '''          
          {/* Calendar Integration Notice */}
          {metadata?.calendarIntegrated && pendingCount === 0 && activeTab === 'pending' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Calendar Integration Active</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Bookings are automatically confirmed based on your calendar availability. 
                    You won't see pending requests here.
                  </p>
                </div>
              </div>
            </div>
          )}'''

# Insert after the tab content div opening
content = content.replace(
    '          {/* Tab Content */}\n          <div className="p-6">',
    '          {/* Tab Content */}\n          <div className="p-6">' + addition
)

with open('src/pages/appointments/AppointmentsPage.tsx', 'w') as f:
    f.write(content)

print('✅ Added calendar integration notice to appointments page')
