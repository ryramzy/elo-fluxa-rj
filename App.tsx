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
import Footer from './components/Footer.tsx';
import ProductDetail from './components/ProductDetail.tsx';
import Journal from './components/Journal.tsx';
import JournalDetail from './components/JournalDetail.tsx';
import LeadAssessment from './components/LeadAssessment.tsx';
import Testimonials from './components/Testimonials.tsx';
import { ViewState } from './types.ts';

export type TabID = 'sobre' | 'courses' | 'agenda' | 'video' | 'reviews' | 'journal';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [activeTab, setActiveTab] = useState<TabID>('sobre');

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    const tabMap: Record<string, TabID> = {
      'products': 'courses',
      'about': 'sobre',
      'reviews': 'reviews',
      'journal': 'journal',
      'agenda': 'agenda',
      'video': 'video'
    };

    const tabToSet = tabMap[targetId] || 'sobre';

    if (view.type !== 'home') setView({ type: 'home' });
    setActiveTab(tabToSet);

    // Smooth scroll to the main content area so tab changes feel like
    // navigating between primary views rather than jumping around the page.
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

  if (!hasEntered) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-[#1A1A1A] animate-fade-in-up">
        <Hero onEnter={() => setHasEntered(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A]">
      <Navbar onNavClick={handleNavClick} />

      <main
        id="content-area"
        className="pt-24 pb-20 px-6 md:px-12 max-w-[1800px] mx-auto min-h-[calc(100vh-200px)] animate-fade-in-up"
      >
        {view.type === 'home' && (
          <div className="animate-fade-in-up">
            {activeTab === 'sobre' && <About />}
            {activeTab === 'courses' && <ProductGrid onProductClick={(p) => setView({ type: 'product', product: p })} />}
            {activeTab === 'reviews' && <Testimonials />}
            {activeTab === 'agenda' && <Booking />}
            {activeTab === 'video' && <VideoGrid />}
            {activeTab === 'journal' && <Journal onArticleClick={(article) => setView({ type: 'journal', article })} />}
          </div>
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
    </div>
  );
}