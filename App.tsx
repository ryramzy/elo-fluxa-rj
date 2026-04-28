/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import About from './components/About.tsx';
import VideoGrid from './components/VideoGrid.tsx';
import Footer from './components/Footer';
import Testimonials from './components/Testimonials.tsx';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import { ToastContainer } from './src/components/Toast';
import { useToast } from './src/hooks/useToast';

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
import Videos from './src/pages/Videos';
import NotFound from './src/pages/NotFound';



function AppShell() {
  const [hasEntered, setHasEntered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    // Scroll to top or specific area on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    const tabMap: Record<string, string> = {
      'products': '/courses',
      'about': '/',
      'reviews': '/reviews',
      'agenda': '/agenda',
      'video': '/video'
    };

    const targetRoute = tabMap[targetId] || '/';
    navigate(targetRoute);

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

  if (!hasEntered && location.pathname === '/') {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-[#1A1A1A] animate-fade-in-up">
        <Hero onEnter={() => setHasEntered(true)} />
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-900 font-sans text-[#1A1A1A] dark:text-slate-100">
      <Navbar onNavClick={handleNavClick} />

      <main
        id="content-area"
        className="pt-20 pb-20 px-6 md:px-12 max-w-[1800px] mx-auto min-h-[calc(100vh-200px)] animate-fade-in-up"
      >
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Public routes */}
          <Route path="/" element={<About />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/courses" element={<CoursesPage />} />
                    <Route path="/reviews" element={<Testimonials />} />
          <Route path="/video" element={<VideoGrid />} />
          <Route path="/dicas" element={<Dicas />} />
          <Route path="/videos" element={<Videos />} />

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
              <Dashboard />
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
      </main>

      <Footer />
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
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