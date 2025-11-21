import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  userOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly, userOnly }: ProtectedRouteProps) => {
  const { userProfile, loading } = useAuth();

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

  // Admin trying to access user routes
  if (userOnly && userProfile?.userType === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Non-admin trying to access admin routes
  if (adminOnly && userProfile?.userType !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
