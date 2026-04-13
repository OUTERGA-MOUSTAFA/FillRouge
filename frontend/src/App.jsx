import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Pages
import Home from '../pages/Home';
import Listings from '../pages/Listings';
import ListingDetail from '../pages/ListingDetail';
import UserProfile from '../pages/UserProfile';
import Notifications from '../pages/Notifications';

// Auth Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import VerifyEmail from '../pages/Auth/VerifyEmail';
import VerifyPhone from '../pages/Auth/VerifyPhone';
import TwoFactor from '../pages/Auth/TwoFactor';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';

// Protected Pages
import Profile from '../pages/Profile';
import Messages from '../pages/Messages';
import Conversation from '../pages/Conversation';
import Matches from '../pages/Matches';
import EditProfile from '../pages/EditProfile';
import CreateListing from '../pages/CreateListing';

// Subscription Pages
import SubscriptionPlans from '../pages/Subscription/Plans';
import SubscriptionCheckout from '../pages/Subscription/Checkout';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminUsers from '../pages/Admin/Users';
import AdminUserDetail from '../pages/Admin/UserDetail';
import AdminListings from '../pages/Admin/Listings';
import AdminReports from '../pages/Admin/Reports';
import AdminIncomeVerifications from '../pages/Admin/IncomeVerifications';
import Onboarding from '../pages/Onboarding';


function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/users/:id" element={<UserProfile />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/2fa" element={<TwoFactor />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:userId" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/listings/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

          {/* Subscription */}
          <Route path="/subscription/plans" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />
          <Route path="/subscription/checkout" element={<ProtectedRoute><SubscriptionCheckout /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
          <Route path="/admin/listings" element={<AdminRoute><AdminListings /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/income-verifications" element={<AdminRoute><AdminIncomeVerifications /></AdminRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;