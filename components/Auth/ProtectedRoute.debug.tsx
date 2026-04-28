import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRouteDebug = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRouteDebug - user:', user);
  console.log('ProtectedRouteDebug - loading:', loading);
  console.log('ProtectedRouteDebug - location:', location.pathname);

  if (loading) {
    console.log('ProtectedRouteDebug - showing loading spinner');
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRouteDebug - no user, redirecting to home');
    // Redirect to home with state to open auth modal
    return <Navigate to="/" state={{ openAuthModal: true, from: location.pathname }} replace />;
  }

  console.log('ProtectedRouteDebug - user authenticated, rendering children');
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRouteDebug;
