
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Inquiries from "./pages/Inquiries";
import InquiryDetail from "./pages/InquiryDetail";
import CreateInquiry from "./pages/CreateInquiry";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import CreateOrder from "./pages/CreateOrder";
import CrafterSearchPage from "./pages/CrafterSearchPage";
import CrafterProfile from "./pages/CrafterProfile";
import Chat from "./pages/Chat";
import RateOrder from "./pages/RateOrder";
import Subscription from "./pages/Subscription";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BottomNavigation from "./components/BottomNavigation";
import AuthForm from "./components/AuthForm";
import { InquiryProvider } from "./contexts/InquiryContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FirebaseOrderProvider } from "./contexts/FirebaseOrderContext";
import { AdminProvider } from "./contexts/AdminContext";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { currentUser, loading } = useAuth();

  console.log('AppContent rendered - loading:', loading, 'currentUser:', currentUser ? 'exists' : 'null');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthForm />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Routes>
          {/* Regular App Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/inquiries" element={<Inquiries />} />
          <Route path="/inquiry/:id" element={<InquiryDetail />} />
          <Route path="/create" element={<CreateInquiry />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/search-crafters" element={<CrafterSearchPage />} />
          <Route path="/crafter-profile" element={<CrafterProfile />} />
          <Route path="/chat/:orderId" element={<Chat />} />
          <Route path="/rate-order/:id" element={<RateOrder />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation />
      </div>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AdminProvider>
          <InquiryProvider>
            <FirebaseOrderProvider>
              <AppContent />
            </FirebaseOrderProvider>
          </InquiryProvider>
        </AdminProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
