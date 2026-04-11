/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import ProductGrid from './components/ProductGrid.tsx';
import About from './components/About.tsx';
import VideoGrid from './components/VideoGrid.tsx';
import Booking from './components/Booking.tsx';
import Footer from './components/Footer.tsx';
import ProductDetail from './components/ProductDetail.tsx';
import Journal from './components/Journal.tsx';
import JournalDetail from './components/JournalDetail.tsx';
import Testimonials from './components/Testimonials.tsx';
import ProtectedRoute from './components/Auth/ProtectedRoute.tsx';
import { ToastContainer } from './src/components/Toast';
import { useToast } from './src/hooks/useToast';

// Import Dashboard and Admin components
import Dashboard from './src/pages/Dashboard';
import Admin from './src/pages/Admin';
import CoursePage from './src/pages/CoursePage';
import LessonPage from './src/pages/LessonPage';
import AdminStudentProfile from './src/pages/AdminStudentProfile';
import Sobre from './src/pages/Sobre';
import NotFound from './src/pages/NotFound';

const ProductDetailWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  if (!product) {
    navigate(-1);
    return null;
  }
  return <ProductDetail product={product} onBack={() => navigate(-1)} />;
};

const JournalDetailWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const article = location.state?.article;
  if (!article) {
    navigate(-1);
    return null;
  }
  return <JournalDetail article={article} onBack={() => navigate(-1)} />;
};

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
      'journal': '/journal',
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

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A]">
      <Navbar onNavClick={handleNavClick} />

      <main
        id="content-area"
        className="pt-24 pb-20 px-6 md:px-12 max-w-[1800px] mx-auto min-h-[calc(100vh-200px)] animate-fade-in-up"
      >
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<About />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/courses" element={<ProductGrid onProductClick={(p) => navigate('/product', { state: { product: p } })} />} />
          <Route path="/product" element={<ProductDetailWrapper />} />
          <Route path="/reviews" element={<Testimonials />} />
          <Route path="/video" element={<VideoGrid />} />
          <Route path="/journal" element={<Journal onArticleClick={(a) => navigate('/journal/article', { state: { article: a } })} />} />
          <Route path="/journal/article" element={<JournalDetailWrapper />} />
          <Route path="/dicas" element={
            <div className="max-w-4xl mx-auto p-6">
              <h1 className="text-2xl font-bold mb-4">Dicas de Inglês</h1>
              <p className="text-slate-600">Em breve - dicas e conteúdo para melhorar seu inglês!</p>
              <a
                href="https://wa.me/5521999999999?text=Ol%C3%A1!%20Tenho%20d%C3%BAvidas%20sobre%20as%20aulas%20de%20ingl%C3%AAs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Falar com Matt no WhatsApp
              </a>
            </div>
          } />

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
          <Route path="/agenda" element={<Booking />} />
          <Route path="/lessons" element={
            <ProtectedRoute>
              <Booking />
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

      <Footer onLinkClick={handleNavClick} />
      
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