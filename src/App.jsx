import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Toaster as Sonner } from 'sonner';
import SiteLayout from '@/components/layout/SiteLayout';
import Home from '@/pages/Home';
import Browse from '@/pages/Browse';
import Genres from '@/pages/Genres';
import Schedule from '@/pages/Schedule';
import AnimeDetail from '@/pages/AnimeDetail';
import Watch from '@/pages/Watch';
import MyList from '@/pages/MyList';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AdminRoute from '@/components/admin/AdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHome from '@/pages/admin/AdminHome';
import AdminAnime from '@/pages/admin/AdminAnime';
import AdminEpisodes from '@/pages/admin/AdminEpisodes';
import AdminServers from '@/pages/admin/AdminServers';
import WatchParty from '@/pages/WatchParty';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/my-list" element={<MyList />} />
        <Route path="/party" element={<WatchParty />} />
        <Route path="/anime/:slug" element={<AnimeDetail />} />
        <Route path="/anime/:slug/:ep" element={<Watch />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/anime" element={<AdminAnime />} />
          <Route path="/admin/episodes" element={<AdminEpisodes />} />
          <Route path="/admin/servers" element={<AdminServers />} />
        </Route>
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <Sonner theme="dark" position="bottom-center" toastOptions={{ className: 'glass !bg-card/90 !text-white !border-white/10' }} />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App