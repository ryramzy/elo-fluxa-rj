/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { BRAND_NAME, WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../constants.ts';
import { SupportedLanguage } from '../types.ts';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  activeTab?: string;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

interface LangOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

export default function Navbar({ 
  onNavClick, 
  currentLanguage, 
  onLanguageChange 
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>, targetId: string) {
    setMobileMenuOpen(false);
    onNavClick(e, targetId);
  }

  function handleWhatsApp(e: React.MouseEvent) {
    e.preventDefault();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  }

  const textColorClass = (scrolled || mobileMenuOpen) ? 'text-slate-900' : 'text-white';
  const logoColorClass = (scrolled || mobileMenuOpen) ? 'text-blue-600' : 'text-blue-400';

  const languages: LangOption[] = [
    { code: 'pt', label: 'PT', flag: '🇧🇷' },
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'tr', label: 'TR', flag: '🇹🇷' },
    { code: 'ar', label: 'AR', flag: '🇸🇦' },
    { code: 'jp', label: 'JP', flag: '🇯🇵' },
    { code: 'zh', label: 'ZH', flag: '🇨🇳' }
  ];

  return (
    <>
      {/* Language Bar - Positioned at the very top */}
      <div className={`fixed top-0 left-0 right-0 z-[60] py-1.5 transition-all duration-500 border-b border-white/10 ${
        scrolled || mobileMenuOpen ? 'bg-slate-950/90 backdrop-blur-sm' : 'bg-black/20'
      }`}>
        <div className="max-w-[1800px] mx-auto px-8 flex justify-end gap-5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all hover:scale-105 ${
                currentLanguage === lang.code ? 'text-blue-400' : 'text-white/50 hover:text-white'
              }`}
            >
              <span className="text-[12px] grayscale-[0.5]">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      <nav 
        className={`fixed top-[29px] left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-7'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
          <a 
            href="#" 
            onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onNavClick(e, 'about');
            }}
            className="text-2xl md:text-3xl font-serif font-bold tracking-tight z-50 relative transition-colors duration-500 flex items-center gap-2"
          >
            <span className={logoColorClass}>{BRAND_NAME}</span>
          </a>
          
          <div className={`hidden md:flex items-center gap-10 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${textColorClass}`}>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:text-blue-500 transition-colors">
              {currentLanguage === 'pt' ? 'Sobre' : 'About'}
            </a>
            <a href="#products" onClick={(e) => handleLinkClick(e, 'products')} className="hover:text-blue-500 transition-colors">
              {currentLanguage === 'pt' ? 'Cursos' : 'Courses'}
            </a>
            <a href="#agenda" onClick={(e) => handleLinkClick(e, 'agenda')} className="hover:text-blue-500 transition-colors">
              {currentLanguage === 'pt' ? 'Agenda' : 'Calendar'}
            </a>
          </div>

          <div className={`flex items-center gap-6 z-50 relative transition-colors duration-500 ${textColorClass}`}>
            <button 
              onClick={handleWhatsApp}
              className={`text-[10px] font-bold uppercase tracking-widest px-6 py-2 border transition-all hidden sm:block ${
                scrolled || mobileMenuOpen ? 'border-slate-900 hover:bg-slate-900 hover:text-white' : 'border-white hover:bg-white hover:text-slate-900'
              }`}
            >
              WhatsApp
            </button>
            
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

      <div className={`fixed inset-0 bg-white z-40 flex flex-col justify-center items-center transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}>
          <div className="flex flex-col items-center space-y-10 text-2xl font-serif font-bold text-slate-900">
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:text-blue-600 transition-colors">
              {currentLanguage === 'pt' ? 'Sobre' : 'About'}
            </a>
            <a href="#products" onClick={(e) => handleLinkClick(e, 'products')} className="hover:text-blue-600 transition-colors">
              {currentLanguage === 'pt' ? 'Cursos' : 'Courses'}
            </a>
            <a href="#agenda" onClick={(e) => handleLinkClick(e, 'agenda')} className="hover:text-blue-600 transition-colors">
              {currentLanguage === 'pt' ? 'Agenda' : 'Calendar'}
            </a>
            <button 
                onClick={handleWhatsApp} 
                className="bg-blue-600 text-white px-8 py-4 text-sm uppercase tracking-widest font-sans font-bold mt-4"
            >
                {currentLanguage === 'pt' ? 'Falar no WhatsApp' : 'Talk on WhatsApp'}
            </button>
          </div>
      </div>
    </>
  );
}