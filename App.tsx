/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import About from './components/About';
import VideoGrid from './components/VideoGrid';
import Booking from './components/Booking';
import Assistant from './components/Assistant';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import JournalDetail from './components/JournalDetail';
import { Product, ViewState, SupportedLanguage } from './types';

export type TabID = 'sobre' | 'agenda' | 'courses' | 'video' | 'journal';

const TABS: Array<TabID> = ['sobre', 'agenda', 'courses', 'video'];

export default function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [activeTab, setActiveTab] = useState<TabID>('sobre');
  const [language, setLanguage] = useState<SupportedLanguage>('pt');

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    let tabToSet: TabID = 'sobre';
    if (targetId === 'products') tabToSet = 'courses';
    if (targetId === 'about') tabToSet = 'sobre';
    if (targetId === 'journal') tabToSet = 'journal';
    if (targetId === 'agenda') tabToSet = 'agenda';

    if (view.type !== 'home') {
      setView({ type: 'home' });
    }
    
    setActiveTab(tabToSet);
    
    setTimeout(() => {
      const element = document.getElementById('content-area');
      if (element) {
        const headerOffset = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A]">
      <Navbar 
          onNavClick={handleNavClick} 
          cartCount={0}
          onOpenCart={() => {}}
          activeTab={activeTab}
          currentLanguage={language}
          onLanguageChange={setLanguage}
      />
      
      <main>
        {view.type === 'home' && (
          <>
            <Hero 
              lang={language}
              onScheduleClick={() => {
                setActiveTab('agenda');
                const element = document.getElementById('content-area');
                element?.scrollIntoView({ behavior: 'smooth' });
              }} 
            />
            
            <div id="content-area" className="py-20 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
              <div className="flex justify-center mb-16 border-b border-slate-200 overflow-x-auto no-scrollbar whitespace-nowrap">
                {TABS.map((tab) => (
                  <button 
                    key={tab}
                    data-tab={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all border-b-2 ${
                      activeTab === tab 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab === 'sobre' && (language === 'pt' ? 'Sobre Matthew' : 'About Matthew')}
                    {tab === 'agenda' && (language === 'pt' ? 'Agendar Aula' : 'Schedule Lesson')}
                    {tab === 'courses' && (language === 'pt' ? 'Cursos' : 'Courses')}
                    {tab === 'video' && (language === 'pt' ? 'Aulas Gravadas' : 'Video Classes')}
                  </button>
                ))}
              </div>

              <div className="animate-fade-in-up">
                {activeTab === 'sobre' && <About lang={language} />}
                {activeTab === 'agenda' && <Booking />}
                {activeTab === 'courses' && <ProductGrid onProductClick={(p) => setView({ type: 'product', product: p })} />}
                {activeTab === 'video' && <VideoGrid />}
              </div>
            </div>
          </>
        )}

        {view.type === 'product' && (
          <ProductDetail 
            product={view.product} 
            onBack={() => setView({ type: 'home' })}
            onAddToCart={() => {}}
          />
        )}

        {view.type === 'journal' && (
          <JournalDetail 
            article={view.article} 
            onBack={() => setView({ type: 'home' })}
          />
        )}
      </main>

      <Footer onLinkClick={handleNavClick} />
      <Assistant />
    </div>
  );
}
