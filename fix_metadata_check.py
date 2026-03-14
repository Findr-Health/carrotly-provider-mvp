#!/usr/bin/env python3

with open('src/pages/appointments/AppointmentsPage.tsx', 'r') as f:
    content = f.read()

# Remove the metadata check since it's not in the store yet
# Just check if calendar integration exists and pending is 0
old_addition = '''          
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

new_addition = '''          
          {/* Calendar Integration Notice */}
          {pendingCount === 0 && activeTab === 'pending' && !loading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">No Pending Requests</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Bookings with calendar integration are automatically confirmed. 
                    Manual confirmation requests will appear here.
                  </p>
                </div>
              </div>
            </div>
          )}'''

content = content.replace(old_addition, new_addition)

with open('src/pages/appointments/AppointmentsPage.tsx', 'w') as f:
    f.write(content)

print('✅ Fixed metadata reference')
