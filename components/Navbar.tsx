/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { BRAND_NAME, WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../constants';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavClick, cartCount, onOpenCart }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setMobileMenuOpen(false);
    onNavClick(e, targetId);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  }

  const textColorClass = (scrolled || mobileMenuOpen) ? 'text-slate-900' : 'text-white';
  const logoColorClass = (scrolled || mobileMenuOpen) ? 'text-blue-600' : 'text-blue-400';

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#" 
            onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onNavClick(e, '');
            }}
            className={`text-3xl font-serif font-bold tracking-tight z-50 relative transition-colors duration-500 flex items-center gap-2`}
          >
            <span className={logoColorClass}>{BRAND_NAME}</span>
          </a>
          
          {/* Center Links - Desktop */}
          <div className={`hidden md:flex items-center gap-12 text-sm font-semibold tracking-widest uppercase transition-colors duration-500 ${textColorClass}`}>
            <a href="#products" onClick={(e) => handleLinkClick(e, 'products')} className="hover:text-blue-500 transition-colors">Cursos</a>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:text-blue-500 transition-colors">Sobre</a>
            <a href="#journal" onClick={(e) => handleLinkClick(e, 'journal')} className="hover:text-blue-500 transition-colors">Dicas</a>
          </div>

          {/* Right Actions */}
          <div className={`flex items-center gap-6 z-50 relative transition-colors duration-500 ${textColorClass}`}>
            <button 
              onClick={handleWhatsApp}
              className={`text-sm font-bold uppercase tracking-widest px-6 py-2 border transition-all hidden sm:block ${
                scrolled || mobileMenuOpen ? 'border-slate-900 hover:bg-slate-900 hover:text-white' : 'border-white hover:bg-white hover:text-slate-900'
              }`}
            >
              WhatsApp
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className={`block md:hidden focus:outline-none transition-colors duration-500 ${textColorClass}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
               {mobileMenuOpen ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                 </svg>
               )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-40 flex flex-col justify-center items-center transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}>
          <div className="flex flex-col items-center space-y-10 text-2xl font-serif font-bold text-slate-900">
            <a href="#products" onClick={(e) => handleLinkClick(e, 'products')} className="hover:text-blue-600 transition-colors">Cursos</a>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:text-blue-600 transition-colors">Sobre</a>
            <a href="#journal" onClick={(e) => handleLinkClick(e, 'journal')} className="hover:text-blue-600 transition-colors">Dicas</a>
            <button 
                onClick={handleWhatsApp} 
                className="bg-blue-600 text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-4"
            >
                Falar no WhatsApp
            </button>
          </div>
      </div>
    </>
  );
};

export default Navbar;