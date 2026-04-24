/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { BRAND_NAME, WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../constants.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useDarkMode } from '../src/hooks/useDarkMode';
import LoginModal from './LoginModal.tsx';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export default function Navbar({ onNavClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signInWithGoogle, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Check for returnTo state from auth gate
  useEffect(() => {
    if (user && location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    }
  }, [user, location.state, navigate]);

  // Check for openAuthModal state from protected route redirects
  useEffect(() => {
    if (location.state?.openAuthModal && !user) {
      setLoginModalOpen(true);
    }
  }, [location.state, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownOpen && !(event.target as Element).closest('.user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

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

  const textColorClass = 'text-slate-900 dark:text-slate-100';
  const logoColorClass = 'text-blue-600 dark:text-blue-400';

  const linkBaseClasses =
    'hover:text-blue-500 transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300';

  const getLinkClasses = (id: typeof activeSection) =>
    `${linkBaseClasses} ${
      activeSection === id ? 'font-extrabold after:w-full' : 'after:w-0'
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-4 shadow-sm dark:border-b dark:border-white/10">
        <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
          <a href="#" onClick={(e) => handleLinkClick(e, 'about')} className="text-2xl md:text-3xl font-serif font-bold tracking-tight z-50 relative transition-colors duration-500 flex items-center gap-2">
            <span className={logoColorClass}>{BRAND_NAME}</span>
          </a>
          
          {user && (
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
            </div>
          )}

          <div className={`flex items-center gap-4 z-50 relative transition-colors duration-500 ${textColorClass}`}>
            {/* Dark Mode Toggle Button */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:scale-110 transition-all duration-200 block rounded-full hover:shadow-lg hover:shadow-slate-500/25"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* WhatsApp Icon Button */}
            <button 
              onClick={handleWhatsApp}
              className="p-2 text-[#25D366] hover:text-[#128C7E] hover:scale-110 transition-all duration-200 hidden sm:block rounded-full hover:shadow-lg hover:shadow-green-500/25"
              aria-label="WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
              </svg>
            </button>
            
            {!user ? (
              /* Login Button */
              <button 
                onClick={handleLoginModalOpen}
                data-login-trigger="true"
                className="text-[10px] font-bold uppercase tracking-widest px-6 py-2 border border-current text-current hover:bg-current hover:text-white transition-all hidden sm:block rounded-sm"
              >
                Entrar
              </button>
            ) : (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 text-[10px] font-medium hidden sm:block hover:text-blue-600 transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:block">
                    {user.displayName || user.email}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <a
                      href="/dashboard"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Meu painel
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                )}
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

      <div className={`fixed inset-0 bg-white dark:bg-slate-900 z-40 flex flex-col justify-center items-center transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}>
          <div className="flex flex-col items-center space-y-10 text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {user && (
              <>
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
              </>
            )}
            <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-4 rounded-lg hover:bg-[#128C7E] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                </svg>
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
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-blue-600 text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-2 hover:bg-blue-700 transition-colors rounded-lg"
                  style={{ width: '100%', maxWidth: '300px' }}
                >
                  Meu painel
                </button>
                <button 
                  onClick={handleSignOut} 
                  className="bg-slate-800 text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-2 hover:bg-slate-700 transition-colors rounded-lg"
                  style={{ width: '100%', maxWidth: '300px' }}
                >
                   Sair
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