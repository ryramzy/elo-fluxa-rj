/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import About from './components/About.tsx';
import Footer from './components/Footer';
import Testimonials from './components/Testimonials.tsx';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import { ToastContainer } from './src/components/Toast';
import { useToast } from './src/hooks/useToast';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { BottomNav } from './src/components/navigation/BottomNav';
import { useAuth } from './src/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';

// Import Dashboard and Admin components
import Dashboard from './src/pages/Dashboard';
import Admin from './src/pages/Admin';
import CoursePage from './src/pages/CoursePage';
import CoursesPage from './src/pages/CoursesPage';
import LessonPage from './src/pages/LessonPage';
import AdminStudentProfile from './src/pages/AdminStudentProfile';
import AgendaPage from './src/pages/AgendaPage';
import Sobre from './src/pages/Sobre';
import Dicas from './src/pages/Dicas';
import NotFound from './src/pages/NotFound';
import ProfilePage from './src/pages/ProfilePage';
import AiCoachPage from './src/pages/AiCoachPage';
import VideoCallPage from './src/pages/VideoCallPage';
import { GuestBanner } from './src/components/GuestBanner';



function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, removeToast } = useToast();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup')) {
        navigate('/dashboard', { replace: true });
      } else if (!user && location.pathname === '/') {
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  useEffect(() => {
    // Scroll to top or specific area on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    if (targetId === 'agenda') {
      navigate('/dashboard', { state: { tab: 'booking' } });
    } else if (targetId === 'dashboard') {
      navigate('/dashboard', { state: { tab: 'overview' } });
    } else {
      const tabMap: Record<string, string> = {
        'courses': '/courses',
        'ai-coach': '/ai-coach',
        'profile': '/profile'
      };

      const targetRoute = tabMap[targetId] || '/';
      navigate(targetRoute);
    }

    requestAnimationFrame(() => {
      const element = document.getElementById('content-area');
      if (element) {
        const headerOffset = 120;
        const offsetPosition =
          element.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-900 font-sans text-[#1A1A1A] dark:text-slate-100">
        <Navbar onNavClick={handleNavClick} />

        <main
          id="content-area"
          className="pt-20 pb-20 px-6 md:px-12 max-w-[1800px] mx-auto min-h-[calc(100vh-200px)]"
        >
          {user?.isGuest && <GuestBanner />}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Routes location={location}>
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Public routes */}
              <Route path="/" element={<About />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/reviews" element={<Testimonials />} />
              <Route path="/dicas" element={<Dicas />} />

              {/* Auth-required routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/courses/:courseId" element={
                <ProtectedRoute>
                  <CoursePage />
                </ProtectedRoute>
              } />
              <Route path="/courses/:courseId/lessons/:lessonId" element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              } />
              <Route path="/agenda" element={
                <ProtectedRoute>
                  <AgendaPage />
                </ProtectedRoute>
              } />
              <Route path="/lessons" element={
                <ProtectedRoute>
                  <AgendaPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/ai-coach" element={
                <ProtectedRoute>
                  <AiCoachPage />
                </ProtectedRoute>
              } />
              <Route path="/video-call/:roomId" element={
                <ProtectedRoute>
                  <VideoCallPage />
                </ProtectedRoute>
              } />

              {/* Admin-only routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/admin/students/:uid" element={
                <ProtectedRoute>
                  <AdminStudentProfile />
                </ProtectedRoute>
              } />
          <Route path="/admin/announcements" element={
            <ProtectedRoute>
              <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Announcements</h1>
                <p className="text-slate-600">Announcement management - coming soon</p>
              </div>
            </ProtectedRoute>
          } />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>

      {!user && <Footer />}
      
      <BottomNav />

      {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AppShell />
    </GoogleOAuthProvider>
  );
}