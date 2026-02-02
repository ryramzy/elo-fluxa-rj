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
import { Product, ViewState } from './types';

type TabID = 'sobre' | 'agenda' | 'courses' | 'video';

function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [activeTab, setActiveTab] = useState<TabID>('sobre');

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (view.type !== 'home') {
      setView({ type: 'home' });
      setTimeout(() => scrollToSection(targetId), 0);
    } else {
      scrollToSection(targetId);
    }
  };

  const scrollToSection = (targetId: string) => {
    if (!targetId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A]">
      <Navbar 
          onNavClick={handleNavClick} 
          cartCount={0}
          onOpenCart={() => {}}
      />
      
      <main>
        {view.type === 'home' && (
          <>
            <Hero onScheduleClick={() => {
              setActiveTab('agenda');
              scrollToSection('tabs-section');
            }} />
            
            <section id="tabs-section" className="py-20 px-6 md:px-12 max-w-[1800px] mx-auto">
              <div className="flex border-b border-gray-200 mb-12 overflow-x-auto no-scrollbar">
                {(['sobre', 'agenda', 'courses', 'video'] as TabID[]).map((tab) => (
                  <button 
                    key={tab}
                    data-tab={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 font-bold uppercase tracking-widest text-sm transition-all whitespace-nowrap border-b-2 ${
                      activeTab === tab 
                        ? 'border-blue-600 text-blue-800' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'sobre' && 'Sobre Matthew'}
                    {tab === 'agenda' && 'Agendar Aula'}
                    {tab === 'courses' && 'Courses'}
                    {tab === 'video' && 'Video Classes'}
                  </button>
                ))}
              </div>

              <div className="animate-fade-in-up">
                {activeTab === 'sobre' && <About />}
                {activeTab === 'agenda' && <Booking />}
                {activeTab === 'courses' && <ProductGrid onProductClick={(p) => setView({ type: 'product', product: p })} />}
                {activeTab === 'video' && <VideoGrid />}
              </div>
            </section>
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

export default App;