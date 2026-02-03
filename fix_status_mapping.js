const fs = require('fs');

const file = 'src/store/bookingsStore.ts';
let content = fs.readFileSync(file, 'utf8');

// Fix the fetchBookings function to map frontend status to backend status
const oldFetch = `fetchBookings: async (providerId, status = 'pending', limit = 20, offset = 0) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(
            \`\${API_URL}/bookings/provider/\${providerId}?status=\${status}&limit=\${limit}&offset=\${offset}\`,`;

const newFetch = `fetchBookings: async (providerId, status = 'pending', limit = 20, offset = 0) => {
        set({ loading: true, error: null });
        
        // Map frontend status to backend status
        const statusMap = {
          'pending': 'pending_confirmation',
          'upcoming': 'upcoming',  // Backend handles this specially
          'past': 'past'            // Backend handles this specially
        };
        
        const backendStatus = statusMap[status] || status;
        
        try {
          const response = await fetch(
            \`\${API_URL}/bookings/provider/\${providerId}?status=\${backendStatus}&limit=\${limit}&offset=\${offset}\`,`;

content = content.replace(oldFetch, newFetch);

fs.writeFileSync(file, content);
console.log('✅ Fixed status mapping in bookingsStore.ts');
