import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContextFirebase';
import EmailVerificationPrompt from '@/components/EmailVerificationPrompt';

interface StaffRouteProps {
  children: React.ReactNode;
}

const StaffRoute: React.FC<StaffRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated or not a staff member, redirect to login
  // Note: Admins are also allowed to see staff pages if needed, but usually we restrict strictly
  if (!isAuthenticated || (user?.role !== 'staff' && user?.role !== 'admin')) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated but email is not verified, show verification prompt
  if (user && !user.emailVerified) {
    return <EmailVerificationPrompt email={user.email} />
  }

  return <>{children}</>;
};

export default StaffRoute;
