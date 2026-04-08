/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { BRAND_NAME, WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../constants.ts';
import { useAuth } from '../hooks/useAuth.ts';
import LoginModal from './LoginModal.tsx';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export default function Navbar({ onNavClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signInWithGoogle, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setLoginModalOpen(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLoginModalOpen = () => {
    setLoginModalOpen(true);
  };

  const handleLoginModalClose = () => {
    setLoginModalOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getActiveSection = () => {
    if (location.pathname.startsWith('/courses') || location.pathname.startsWith('/product')) return 'products';
    if (location.pathname.startsWith('/agenda')) return 'agenda';
    if (location.pathname.startsWith('/video')) return 'video';
    if (location.pathname.startsWith('/journal')) return 'journal';
    return 'about';
  };
  const activeSection = getActiveSection();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setMobileMenuOpen(false);
    onNavClick(e, targetId);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`, '_blank');
  };

  const textColorClass = scrolled || mobileMenuOpen ? 'text-slate-900' : 'text-white';
  const logoColorClass = scrolled || mobileMenuOpen ? 'text-blue-600' : 'text-blue-400';

  const linkBaseClasses =
    'hover:text-blue-500 transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300';

  const getLinkClasses = (id: typeof activeSection) =>
    `${linkBaseClasses} ${
      activeSection === id ? 'font-extrabold after:w-full' : 'after:w-0'
    }`;

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-[60] py-1.5 transition-all duration-500 border-b border-white/10 ${
        scrolled || mobileMenuOpen ? 'bg-slate-950/90 backdrop-blur-sm' : 'bg-black/20'
      }`}>
        <div className="max-w-[1800px] mx-auto px-8 flex justify-end gap-5">
          {/* Top bar can be empty or used later */}
        </div>
      </div>

      <nav className={`fixed top-[29px] left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-7'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
          <a href="#" onClick={(e) => handleLinkClick(e, 'about')} className="text-2xl md:text-3xl font-serif font-bold tracking-tight z-50 relative transition-colors duration-500 flex items-center gap-2">
            <span className={logoColorClass}>{BRAND_NAME}</span>
          </a>
          
          <div className={`hidden md:flex items-center gap-10 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${textColorClass}`}>
            <a
              href="#about"
              onClick={(e) => handleLinkClick(e, 'about')}
              className={getLinkClasses('about')}
            >
              Sobre
            </a>
            <a
              href="#products"
              onClick={(e) => handleLinkClick(e, 'products')}
              className={getLinkClasses('products')}
            >
              Cursos
            </a>
            <a
              href="#agenda"
              onClick={(e) => handleLinkClick(e, 'agenda')}
              className={getLinkClasses('agenda')}
            >
              Agenda
            </a>
            <a
              href="#video"
              onClick={(e) => handleLinkClick(e, 'video')}
              className={getLinkClasses('video')}
            >
              Vídeos
            </a>
            <a
              href="#journal"
              onClick={(e) => handleLinkClick(e, 'journal')}
              className={getLinkClasses('journal')}
            >
              Dicas
            </a>
          </div>

          <div className={`flex items-center gap-4 z-50 relative transition-colors duration-500 ${textColorClass}`}>
            {/* WhatsApp Icon Button */}
            <button 
              onClick={handleWhatsApp}
              className="p-2 text-[#25D366] hover:text-[#128C7E] hover:scale-110 transition-all duration-200 hidden sm:block rounded-full hover:shadow-lg hover:shadow-green-500/25"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="w-5 h-5" />
            </button>
            
            {!user ? (
              /* Login Button */
              <button 
                onClick={handleLoginModalOpen}
                className="text-[10px] font-bold uppercase tracking-widest px-6 py-2 border border-current text-current hover:bg-current hover:text-white transition-all hidden sm:block rounded-sm"
              >
                Entrar
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-medium hidden sm:block">
                  {user.displayName || user.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="text-[10px] font-bold uppercase tracking-widest px-6 py-2 bg-slate-800 text-white hover:bg-slate-700 transition-all hidden sm:block rounded-sm"
                >
                  Sign Out
                </button>
              </div>
            )}
            
            <button className={`block md:hidden focus:outline-none transition-colors duration-500 ${textColorClass}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
               {mobileMenuOpen ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
               )}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-white z-40 flex flex-col justify-center items-center transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}>
          <div className="flex flex-col items-center space-y-10 text-2xl font-serif font-bold text-slate-900">
            <a
              href="#about"
              onClick={(e) => handleLinkClick(e, 'about')}
              className={activeSection === 'about' ? 'text-blue-600' : 'hover:text-blue-600 transition-colors'}
            >
              Sobre
            </a>
            <a
              href="#products"
              onClick={(e) => handleLinkClick(e, 'products')}
              className={activeSection === 'products' ? 'text-blue-600' : 'hover:text-blue-600 transition-colors'}
            >
              Cursos
            </a>
            <a
              href="#agenda"
              onClick={(e) => handleLinkClick(e, 'agenda')}
              className={activeSection === 'agenda' ? 'text-blue-600' : 'hover:text-blue-600 transition-colors'}
            >
              Agenda
            </a>
            <a
              href="#video"
              onClick={(e) => handleLinkClick(e, 'video')}
              className={activeSection === 'video' ? 'text-blue-600' : 'hover:text-blue-600 transition-colors'}
            >
              Vídeos
            </a>
            <a
              href="#journal"
              onClick={(e) => handleLinkClick(e, 'journal')}
              className={activeSection === 'journal' ? 'text-blue-600' : 'hover:text-blue-600 transition-colors'}
            >
              Dicas
            </a>
            <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-4 rounded-lg hover:bg-[#128C7E] transition-colors">
                <FaWhatsapp className="w-5 h-5" />
                Falar no WhatsApp
            </button>
            {!user ? (
              <button 
                onClick={handleLoginModalOpen}
                className="border border-slate-800 text-slate-800 px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-2 hover:bg-slate-800 hover:text-white transition-colors rounded-lg"
                style={{ width: '100%', maxWidth: '300px' }}
              >
                Entrar
              </button>
            ) : (
              <>
                <div className="text-center text-slate-600 mb-2">
                  {user.displayName || user.email}
                </div>
                <button 
                  onClick={handleSignOut} 
                  className="bg-slate-800 text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-2 hover:bg-slate-700 transition-colors"
                  style={{ width: '100%', maxWidth: '300px' }}
                >
                   Sign Out
                </button>
              </>
            )}
          </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={handleLoginModalClose}
        onSignIn={handleSignIn}
      />
    </>
  );
}