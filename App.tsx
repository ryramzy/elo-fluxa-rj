import React, { useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './src/components/Navbar.tsx';
import Footer from './src/components/Footer';
import ProtectedRoute from './src/components/Auth/ProtectedRoute';
import { ToastContainer } from './src/components/Toast';
import { useToast } from './src/hooks/useToast';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { BottomNav } from './src/components/navigation/BottomNav';
import { useAuth } from './src/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import { GuestBanner } from './src/components/GuestBanner';
import { GlobalErrorBoundary } from './src/components/GlobalErrorBoundary';

// Lazy-loaded page components — each becomes its own chunk
const Dashboard = React.lazy(() => import('./src/pages/Dashboard'));
const CoursePage = React.lazy(() => import('./src/pages/CoursePage'));
const CoursesPage = React.lazy(() => import('./src/pages/CoursesPage'));
const LessonPage = React.lazy(() => import('./src/pages/LessonPage'));
const AgendaPage = React.lazy(() => import('./src/pages/AgendaPage'));
const ProfilePage = React.lazy(() => import('./src/pages/ProfilePage'));
const VideoCallPage = React.lazy(() => import('./src/pages/VideoCallPage'));
const NotFound = React.lazy(() => import('./src/pages/NotFound'));

// Landing page components — also lazy since most users go straight to /dashboard
const Hero = React.lazy(() => import('./src/components/Hero.tsx'));
const About = React.lazy(() => import('./src/components/About.tsx'));
const Testimonials = React.lazy(() => import('./src/components/Testimonials.tsx'));
const Login = React.lazy(() => import('./src/components/Auth/Login'));
const Signup = React.lazy(() => import('./src/components/Auth/Signup'));
const Sobre = React.lazy(() => import('./src/pages/Sobre'));
const Dicas = React.lazy(() => import('./src/pages/Dicas'));
const ApplyTutor = React.lazy(() => import('./src/pages/ApplyTutor'));
const Admin = React.lazy(() => import('./src/pages/Admin'));
const PrivacyPolicy = React.lazy(() => import('./src/pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./src/pages/TermsOfService'));
import { PwaInstallPrompt } from './src/components/navigation/PwaInstallPrompt';



function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, removeToast } = useToast();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Only auto-redirect non-guest authenticated users away from auth/landing pages
      if (user && !user.isGuest && (location.pathname === '/login' || location.pathname === '/signup')) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  useEffect(() => {
    // Scroll to top or specific area on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    // Clear orphaned AI Coach focus mode and Gemini API key variables from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('elo-ai-coach-focus-mode');
      localStorage.removeItem('elo_gemini_api_key');
    }
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    if (targetId === 'agenda') {
      const isAdmin = user?.uid.trim() === import.meta.env.VITE_ADMIN_UID?.trim() || 
                      user?.email?.endsWith('@elospeak.com.br') || 
                      user?.email?.endsWith('@elospeak.com') ||
                      user?.email === 'mramsay0@gmail.com' ||
                      user?.email === 'mramsayo@gmail.com' ||
                      user?.email === 'erneleducation@gmail.com';
      if (isAdmin) {
        navigate('/agenda');
      } else {
        navigate('/dashboard', { state: { tab: 'booking' } });
      }
    } else if (targetId === 'dashboard') {
      navigate('/dashboard', { state: { tab: 'overview' } });
    } else {
      const tabMap: Record<string, string> = {
        'courses': '/courses',
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

  
  const isFullscreenPage = location.pathname.startsWith('/video-call/') || location.pathname.includes('/lessons/');

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-900 font-sans text-[#1A1A1A] dark:text-slate-100 overflow-x-hidden">
        {!isFullscreenPage && <Navbar onNavClick={handleNavClick} />}

        <main
          id="content-area"
          className={isFullscreenPage 
            ? "pt-0 pb-0 px-0 w-full min-h-screen" 
            : "pt-20 pb-20 px-0 max-w-[1800px] mx-auto min-h-[calc(100vh-200px)]"}
        >
          {user?.isGuest && (
            <div className="px-4 sm:px-6 md:px-0">
              <GuestBanner />
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Suspense fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }>
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
              <Route path="/seja-tutor" element={<ApplyTutor />} />
              <Route path="/apply" element={<ApplyTutor />} />

              {/* Auth-required routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
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
              <Route path="/video-call/:roomId" element={
                <ProtectedRoute>
                  <VideoCallPage />
                </ProtectedRoute>
              } />

              {/* Compliance & Legal Pages */}
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/termos" element={<TermsOfService />} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

      {!user && <Footer />}
      
      <BottomNav />
      <PwaInstallPrompt />

      {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AppShell />
    </GlobalErrorBoundary>
  );
}