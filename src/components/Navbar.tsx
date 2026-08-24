/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { BRAND_NAME, WHATSAPP_NUMBER, WHATSAPP_MESSAGE, getWhatsAppLink } from '../../constants.ts';
import { useAuth } from '../hooks/useAuth.ts';
import LoginModal from './LoginModal.tsx';
import { DesktopDownloadModal } from './profile/DesktopDownloadModal';
import { NotificationDropdown } from './navigation/NotificationDropdown';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export default function Navbar({ onNavClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [desktopModalOpen, setDesktopModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signInWithGoogle, signOut, signInAsGuest } = useAuth();

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAuthorizedEmail = 
    userEmail === 'mramsay0@gmail.com' ||
    userEmail === 'mramsayo@gmail.com' ||
    userEmail === 'erneleducation@gmail.com' ||
    userEmail.endsWith('@eloingles.com.br') ||
    userEmail.endsWith('@elospeak.com.br') ||
    userEmail.endsWith('@elospeak.com') ||
    (user?.uid && import.meta.env.VITE_ADMIN_UID && user.uid.trim() === import.meta.env.VITE_ADMIN_UID.trim());

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

  const handleSignIn = () => {
    setLoginModalOpen(false);
    navigate('/dashboard');
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
    if (location.pathname === '/dashboard') {
      if (location.state?.tab === 'booking') return 'agenda';
      return 'dashboard';
    }
    if (location.pathname.startsWith('/courses')) return 'courses';
    if (location.pathname === '/profile') return 'profile';
    return '';
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

  const logoColorClass = 'text-blue-400';
  const textColorClass = 'text-white';

  const linkBaseClasses =
    'hover:text-blue-500 transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-blue-500 after:transition-all after:duration-300';

  const getLinkClasses = (id: string) =>
    `${linkBaseClasses} ${
      activeSection === id ? 'font-extrabold after:w-full' : 'after:w-0'
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out bg-slate-900 backdrop-blur-md py-4 shadow-sm border-b border-slate-700" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 flex items-center justify-between">
          <a href="#" onClick={(e) => handleLinkClick(e, 'about')} className="text-2xl md:text-3xl font-serif font-bold tracking-tight z-50 relative transition-colors duration-500 flex items-center gap-2">
            <span className={logoColorClass}>{BRAND_NAME}</span>
          </a>
          
          <div className={`hidden md:flex items-center gap-10 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${textColorClass}`}>
            {user ? (
              <>
                <a
                  href="/dashboard"
                  onClick={(e) => handleLinkClick(e, 'dashboard')}
                  className={getLinkClasses('dashboard')}
                >
                  Painel
                </a>
                <a
                  href="/dashboard"
                  onClick={(e) => handleLinkClick(e, 'agenda')}
                  className={getLinkClasses('agenda')}
                >
                  Agenda & Aulas
                </a>
                <a
                  href={getWhatsAppLink('corporate')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={getLinkClasses('corporate')}
                >
                  Para Empresas 💼
                </a>
                {isAuthorizedEmail && (
                  <button
                    onClick={() => setDesktopModalOpen(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-bold flex items-center gap-1"
                  >
                    💻 App Desktop
                  </button>
                )}
                <a
                  href="/profile"
                  onClick={(e) => handleLinkClick(e, 'profile')}
                  className={getLinkClasses('profile')}
                >
                  Perfil
                </a>
              </>
            ) : (
              <>
                <a
                  href="/sobre"
                  onClick={(e) => { e.preventDefault(); navigate('/sobre'); }}
                  className={getLinkClasses('sobre')}
                >
                  Sobre
                </a>
                <a
                  href={getWhatsAppLink('corporate')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={getLinkClasses('corporate')}
                >
                  Para Empresas 💼
                </a>
                <a
                  href="/dicas"
                  onClick={(e) => { e.preventDefault(); navigate('/dicas'); }}
                  className={getLinkClasses('dicas')}
                >
                  Dicas
                </a>
              </>
            )}
          </div>

          <div className={`flex items-center gap-4 z-50 relative transition-colors duration-500 ${textColorClass}`}>
            {!user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    signInAsGuest();
                    navigate('/courses/basic-english-daily-life/lessons/be-dl-01');
                  }}
                  className="text-xs font-black uppercase tracking-wider px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all shadow-md hidden sm:block border border-blue-400/40"
                >
                  ⚡ Testar Aula Grátis
                </button>
                <button 
                  onClick={handleLoginModalOpen}
                  data-login-trigger="true"
                  className="text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-600 text-slate-200 hover:bg-slate-800 transition-all rounded-xl"
                >
                  Entrar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <NotificationDropdown />
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 text-[10px] font-medium hidden sm:block text-white hover:text-blue-400 transition-colors"
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
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-2 z-50 divide-y divide-slate-750">
                      {isAuthorizedEmail && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('/agenda');
                          }}
                          className="block w-full text-left px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-blue-400 hover:bg-slate-700 transition-colors"
                        >
                          📅 Minha Agenda
                        </button>
                      )}
                      <a
                        href="/dashboard"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="block px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                      >
                        Meu painel
                      </a>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button 
              className={`block md:hidden focus:outline-none p-2.5 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-500 ${textColorClass}`} 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir Menu"
            >
               {mobileMenuOpen ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
               )}
            </button>
          </div>
        </div>
      </nav>

      <div 
        className={`fixed inset-0 bg-slate-900 z-40 flex flex-col justify-start items-center overflow-y-auto transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
        style={{
          paddingTop: 'calc(5rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))'
        }}
      >
          <div className="flex flex-col items-center space-y-8 text-2xl font-serif font-bold text-white w-full max-w-sm px-6">
            {user ? (
              <>
                <a
                  href="/dashboard"
                  onClick={(e) => handleLinkClick(e, 'dashboard')}
                  className={activeSection === 'dashboard' ? 'text-blue-400 font-extrabold' : 'hover:text-blue-400 transition-colors font-medium'}
                >
                  Painel
                </a>
                <a
                  href="/courses"
                  onClick={(e) => handleLinkClick(e, 'courses')}
                  className={activeSection === 'courses' ? 'text-blue-400 font-extrabold' : 'hover:text-blue-400 transition-colors font-medium'}
                >
                  Cursos
                </a>
                <a
                  href="/dashboard"
                  onClick={(e) => handleLinkClick(e, 'agenda')}
                  className={activeSection === 'agenda' ? 'text-blue-400 font-extrabold' : 'hover:text-blue-400 transition-colors font-medium'}
                >
                  Agenda
                </a>
                <a
                  href={getWhatsAppLink('corporate')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors font-medium text-emerald-400"
                >
                  Para Empresas 💼
                </a>
                <a
                  href="/profile"
                  onClick={(e) => handleLinkClick(e, 'profile')}
                  className={activeSection === 'profile' ? 'text-blue-400 font-extrabold' : 'hover:text-blue-400 transition-colors font-medium'}
                >
                  Perfil
                </a>
              </>
            ) : (
              <>
                <a
                  href="/sobre"
                  onClick={(e) => { setMobileMenuOpen(false); navigate('/sobre'); }}
                  className="hover:text-blue-400 transition-colors font-medium"
                >
                  Sobre
                </a>
                <a
                  href="/courses"
                  onClick={(e) => { setMobileMenuOpen(false); navigate('/courses'); }}
                  className="hover:text-blue-400 transition-colors font-medium"
                >
                  Cursos
                </a>
                <a
                  href={getWhatsAppLink('corporate')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors font-medium text-emerald-400"
                >
                  Para Empresas 💼
                </a>
                <a
                  href="/dicas"
                  onClick={(e) => { setMobileMenuOpen(false); navigate('/dicas'); }}
                  className="hover:text-blue-400 transition-colors font-medium"
                >
                  Dicas
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
                className="border border-blue-500 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-2 transition-all rounded-xl shadow-md active:scale-95"
                style={{ width: '100%', maxWidth: '300px' }}
              >
                Entrar
              </button>
            ) : (
              <>
                <div className="text-center text-slate-600 mb-2">
                  {user.displayName || user.email}
                </div>
                {isAuthorizedEmail && (
                  <button 
                    onClick={() => {
                      navigate('/agenda');
                      setMobileMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400 text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-2 hover:from-blue-700 hover:to-indigo-700 transition-colors rounded-lg flex items-center justify-center gap-2"
                    style={{ width: '100%', maxWidth: '300px' }}
                  >
                    📅 Minha Agenda
                  </button>
                )}
                <button 
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-slate-800 text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-2 hover:bg-slate-700 transition-colors rounded-lg"
                  style={{ width: '100%', maxWidth: '300px' }}
                >
                  Meu painel
                </button>
                <button 
                  onClick={handleSignOut} 
                  className="bg-slate-900 border border-slate-700 text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-2 hover:bg-slate-800 transition-colors rounded-lg"
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

      {/* Tutor Desktop App Download Modal */}
      <DesktopDownloadModal
        isOpen={desktopModalOpen}
        onClose={() => setDesktopModalOpen(false)}
      />
    </>
  );
}