#!/usr/bin/env python3

with open('src/components/appointments/UpcomingBookingCard.tsx', 'r') as f:
    content = f.read()

# Add imports at the top
content = content.replace(
    "import { Calendar, Clock, User, Mail, Phone, DollarSign } from 'lucide-react';",
    "import { useState } from 'react';\nimport { Calendar, Clock, User, Mail, Phone, DollarSign } from 'lucide-react';\nimport { useBookingsStore } from '../../store/bookingsStore';\nimport CancelModal from './CancelModal';"
)

# Add state and handler in the component
content = content.replace(
    'export default function UpcomingBookingCard({ booking, past = false }: UpcomingBookingCardProps) {\n  const timezone = booking.providerTimezone || \'America/Los_Angeles\';',
    '''export default function UpcomingBookingCard({ booking, past = false }: UpcomingBookingCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { cancelBooking } = useBookingsStore();
  const timezone = booking.providerTimezone || 'America/Los_Angeles';
  
  const handleCancel = async (reason: string) => {
    await cancelBooking(booking._id, reason);
    setShowCancelModal(false);
  };'''
)

# Replace the Cancel button with one that opens the modal
content = content.replace(
    '''          <button className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
            Cancel
          </button>''',
    '''          <button 
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Cancel
          </button>'''
)

# Add the modal at the end before closing div
content = content.replace(
    '      )}\n    </div>\n  );\n}',
    '''      )}
      
      {/* Cancel Modal */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        booking={booking}
      />
    </div>
  );
}'''
)

with open('src/components/appointments/UpcomingBookingCard.tsx', 'w') as f:
    f.write(content)

print('✅ Wired up cancel button to modal')
