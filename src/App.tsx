
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import BestCrafters from "./pages/BestCrafters";
import CrafterProfile from "./pages/CrafterProfile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BottomNavigation from "./components/BottomNavigation";
import AuthForm from "./components/AuthForm";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminFeaturedCrafters from "./pages/admin/AdminFeaturedCrafters";
import AdminFeaturedRequests from "./pages/admin/AdminFeaturedRequests";
import AdminMembershipPlans from "./pages/admin/AdminMembershipPlans";
import CrafterMembership from "./pages/CrafterMembership";

const AppContent = () => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthForm />;
  }

  // Separate rendering for admin vs regular users
  const isAdmin = userProfile?.userType === 'admin';

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Admin Routes - Only for admins */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="membership-plans" element={<AdminMembershipPlans />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="featured-crafters" element={<AdminFeaturedCrafters />} />
            <Route path="featured-requests" element={<AdminFeaturedRequests />} />
          </Route>

          {/* User Routes - Only for clients and crafters */}
          <Route path="/" element={
            <ProtectedRoute userOnly>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/best-crafters" element={
            <ProtectedRoute userOnly>
              <BestCrafters />
            </ProtectedRoute>
          } />
          <Route path="/crafter/:crafterId" element={
            <ProtectedRoute userOnly>
              <CrafterProfile />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute userOnly>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute userOnly>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute userOnly>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/crafter-membership" element={
            <ProtectedRoute userOnly>
              <CrafterMembership />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Show bottom navigation only for regular users, not for admins */}
        {!isAdmin && <BottomNavigation />}
      </div>
    </BrowserRouter>
  );
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <AuthProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </AuthProvider>
  </TooltipProvider>
);

export default App;
