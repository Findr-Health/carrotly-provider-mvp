import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from "./pages/Landing";
import SearchBusiness from './pages/onboarding/SearchBusiness';
import SearchResults from './pages/onboarding/SearchResults';
import VerifyOwnership from './pages/onboarding/VerifyOwnership';
import CompleteProfile from './pages/onboarding/CompleteProfile';
import ContactAdmin from './pages/onboarding/ContactAdmin';
import Complete from './pages/Complete';
import { Dashboard } from './pages/Dashboard';
import { ProfilePreview } from './pages/ProfilePreview';
import EditProfile from "./pages/EditProfile";
import Analytics from "./pages/Analytics";
import Reviews from "./pages/Reviews";
import Settings from "./pages/Settings";
import ProviderLogin from './pages/ProviderLogin';
import Payments from './pages/Payments';
import CalendarSettings from './pages/Calendar';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        
        {/* Onboarding flow */}
        <Route path="/onboarding" element={<SearchBusiness />} />
        <Route path="/onboarding/search-results" element={<SearchResults />} />
        <Route path="/onboarding/verify" element={<VerifyOwnership />} />
        <Route path="/onboarding/complete-profile" element={<CompleteProfile />} />
        <Route path="/onboarding/contact-admin" element={<ContactAdmin />} />
        <Route path="/complete" element={<Complete />} />
        
        {/* Provider portal */}
        <Route path="/login" element={<ProviderLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/calendar" element={<CalendarSettings />} />
        <Route path="/preview" element={<ProfilePreview />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
