import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { currentAdmin, adminData, loading } = useAdminAuth();

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

  // Not logged in or not an admin
  if (!currentAdmin || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
