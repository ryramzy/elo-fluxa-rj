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

// Dashboard component
const Dashboard = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">My Lessons</h2>
          <p className="text-gray-600">View and manage your scheduled lessons.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Progress</h2>
          <p className="text-gray-600">Track your learning progress.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <p className="text-gray-600">Manage your account settings.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Support</h2>
          <p className="text-gray-600">Get help and contact support.</p>
        </div>
      </div>
    </div>
  );
};

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
          <Route path="/" element={<About />} />
          <Route path="/courses" element={<ProductGrid onProductClick={(p) => navigate('/product', { state: { product: p } })} />} />
          <Route path="/product" element={<ProductDetailWrapper />} />
          <Route path="/reviews" element={<Testimonials />} />
          <Route path="/video" element={<VideoGrid />} />
          <Route path="/journal" element={<Journal onArticleClick={(a) => navigate('/journal/article', { state: { article: a } })} />} />
          <Route path="/journal/article" element={<JournalDetailWrapper />} />
                    <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
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
        </Routes>
      </main>

      <Footer onLinkClick={handleNavClick} />
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