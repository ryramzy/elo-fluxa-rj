import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRouteVisual = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Render debug info directly on screen
  if (location.pathname === '/dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Authentication Debug Info
        </h1>
        <div className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-lg">
          <div>
            <strong>Loading:</strong> {loading ? 'YES' : 'NO'}
          </div>
          <div>
            <strong>User:</strong> {user ? `YES - ${user.email}` : 'NO'}
          </div>
          <div>
            <strong>Location:</strong> {location.pathname}
          </div>
          <div>
            <strong>User UID:</strong> {user?.uid || 'None'}
          </div>
          <div>
            <strong>User Display Name:</strong> {user?.displayName || 'None'}
          </div>
        </div>
        
        {!loading && !user && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <p className="text-red-700 dark:text-red-300">
              ❌ No user detected - you will be redirected to home
            </p>
          </div>
        )}
        
        {!loading && user && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
            <p className="text-green-700 dark:text-green-300">
              ✅ User authenticated - you should see the dashboard
            </p>
          </div>
        )}
        
        {loading && (
          <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <p className="text-yellow-700 dark:text-yellow-300">
              ⏳ Loading authentication state...
            </p>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to home with state to open auth modal
    return <Navigate to="/" state={{ openAuthModal: true, from: location.pathname }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRouteVisual;
