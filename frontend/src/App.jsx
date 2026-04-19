import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useAuthStore } from './store/authStore';
import CompleteProfile from '../pages/CompletProfile';
import EditListing from '../pages/EditListing';
import NoConversation from '../pages/NoConversation';

// Lazy loading des pages - réduction de la taille du bundle initial
const Home = lazy(() => import('../pages/Home'));
const Listings = lazy(() => import('../pages/Listings'));
const ListingDetail = lazy(() => import('../pages/ListingDetail'));
const UserProfile = lazy(() => import('../pages/UserProfile'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Profile = lazy(() => import('../pages/Profile'));
const EditProfile = lazy(() => import('../pages/EditProfile'));
const Messages = lazy(() => import('../pages/Messages'));
const Conversation = lazy(() => import('../pages/Conversation'));
const Matches = lazy(() => import('../pages/Matches'));
const MyListings = lazy(() => import('../pages/MyListings'));
const CreateListing = lazy(() => import('../pages/CreateListing'));
const Onboarding = lazy(() => import('../pages/Onboarding'));

// Auth Pages
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const VerifyEmail = lazy(() => import('../pages/Auth/VerifyEmail'));
const VerifyPhone = lazy(() => import('../pages/Auth/VerifyPhone'));
const TwoFactor = lazy(() => import('../pages/Auth/TwoFactor'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));

// Subscription Pages
const SubscriptionPlans = lazy(() => import('../pages/Subscription/Plans'));
const SubscriptionCheckout = lazy(() => import('../pages/Subscription/Checkout'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/Admin/AdminUsers'));
const AdminUserDetail = lazy(() => import('../pages/Admin/AdminUserDetail'));
const AdminListings = lazy(() => import('../pages/Admin/AdminListings'));
const AdminReports = lazy(() => import('../pages/Admin/AdminReports'));
const AdminIncomeVerifications = lazy(() => import('../pages/Admin/AdminIncomeVerifications'));
const Favorites = lazy(() => import('../pages/Favorites'));
const AdminSliders = lazy(() => import('../pages/Admin/AdminSliders'));
function App() {
  const { token, fetchUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public */}
            {/* <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />

            <Route path="/listings/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/users/:id" element={<UserProfile />} /> */}

            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />  {/* ← BEFORE :id */}
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/listings/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
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
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
            {/* <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} /> */}
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>}>
              <Route index element={<NoConversation />} />
              <Route path=":userId" element={<Conversation />} />
            </Route>

            <Route path="/messages/:userId" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/MyListings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />

            {/* Subscription */}
            <Route path="/subscription/plans" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />
            <Route path="/subscription/checkout" element={<ProtectedRoute><SubscriptionCheckout /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
            <Route path="/admin/listings" element={<AdminRoute><AdminListings /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
            <Route path="/admin/sliders" element={<AdminRoute><AdminSliders /></AdminRoute>} />
            <Route path="/admin/income-verifications" element={<AdminRoute><AdminIncomeVerifications /></AdminRoute>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;