/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import ProductGrid from './components/ProductGrid.tsx';
import About from './components/About.tsx';
import VideoGrid from './components/VideoGrid.tsx';
import Booking from './components/Booking.tsx';
import Assistant from './components/Assistant.tsx';
import Footer from './components/Footer.tsx';
import ProductDetail from './components/ProductDetail.tsx';
import Journal from './components/Journal.tsx';
import JournalDetail from './components/JournalDetail.tsx';
import LeadAssessment from './components/LeadAssessment.tsx';
import Testimonials from './components/Testimonials.tsx';
import { ViewState, SupportedLanguage } from './types.ts';

export type TabID = 'sobre' | 'courses' | 'agenda' | 'video' | 'reviews' | 'journal';

const TABS: TabID[] = ['sobre', 'courses', 'agenda', 'video', 'journal', 'reviews'];

export default function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [activeTab, setActiveTab] = useState<TabID>('sobre');
  const [language, setLanguage] = useState<SupportedLanguage>('pt');

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    const tabMap: Record<string, TabID> = {
      'products': 'courses',
      'about': 'sobre',
      'reviews': 'reviews',
      'journal': 'journal',
      'agenda': 'agenda'
    };

    const tabToSet = tabMap[targetId] || 'sobre';

    if (view.type !== 'home') setView({ type: 'home' });
    setActiveTab(tabToSet);
    
    setTimeout(() => {
      const element = document.getElementById('content-area');
      if (element) {
        const headerOffset = 120;
        const offsetPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A]">
      <Navbar 
          onNavClick={handleNavClick} 
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
                document.getElementById('content-area')?.scrollIntoView({ behavior: 'smooth' });
              }} 
            />
            
            <div id="content-area" className="py-20 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
              <div className="flex justify-center mb-16 border-b border-slate-200 overflow-x-auto no-scrollbar whitespace-nowrap">
                {TABS.map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-all border-b-2 ${
                      activeTab === tab 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab === 'sobre' && (language === 'pt' ? 'Sobre Matthew' : 'About Matthew')}
                    {tab === 'courses' && (language === 'pt' ? 'Cursos' : 'Courses')}
                    {tab === 'agenda' && (language === 'pt' ? 'Agendar' : 'Schedule')}
                    {tab === 'video' && (language === 'pt' ? 'Vídeos' : 'Videos')}
                    {tab === 'journal' && (language === 'pt' ? 'Dicas' : 'Journal')}
                    {tab === 'reviews' && (language === 'pt' ? 'Depoimentos' : 'Reviews')}
                  </button>
                ))}
              </div>

              <div className="animate-fade-in-up">
                {activeTab === 'sobre' && <About lang={language} />}
                {activeTab === 'courses' && <ProductGrid onProductClick={(p) => setView({ type: 'product', product: p })} />}
                {activeTab === 'reviews' && <Testimonials lang={language} />}
                {activeTab === 'agenda' && <Booking />}
                {activeTab === 'video' && <VideoGrid />}
                {activeTab === 'journal' && <Journal onArticleClick={(article) => setView({ type: 'journal', article })} />}
              </div>
            </div>

            <LeadAssessment />
          </>
        )}

        {view.type === 'product' && (
          <ProductDetail 
            product={view.product} 
            onBack={() => setView({ type: 'home' })}
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