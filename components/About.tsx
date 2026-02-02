/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

const About: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      {/* Introduction Card */}
      <div className="bg-white p-8 md:p-16 rounded-xl shadow-lg border border-gray-100 flex flex-col lg:flex-row gap-12 items-center mb-16">
        <div className="lg:w-1/3 flex-shrink-0">
          <div className="relative group">
            <div className="w-64 h-80 md:w-80 md:h-[450px] overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" 
                alt="Matthew - Native English Coach" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white px-6 py-4 rounded-lg z-20 shadow-xl">
              <span className="block text-xs uppercase tracking-widest font-bold mb-1">Native Accent</span>
              <span className="text-xl font-serif">USA (American)</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">👋</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">Welcome! It’s great to meet you</h2>
          </div>
          <p className="text-xl text-slate-600 font-light leading-relaxed mb-8 italic">
            "Whether your goal is fluent conversation, sharper grammar, or speaking confidently about technology, work, and ideas, I’m here to help."
          </p>
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            My lessons are practical, engaging, and tailored to real life—so you leave each session feeling more confident and clearer in how you express yourself. Let’s make learning effective, relevant, and enjoyable 🚀
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
             <div>
                <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Languages</h4>
                <p className="text-sm font-semibold text-slate-900">English (Native)</p>
                <p className="text-sm font-semibold text-slate-900">Portuguese (Fluent)</p>
                <p className="text-sm font-semibold text-slate-900">Spanish (Basic)</p>
             </div>
             <div>
                <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Specialties</h4>
                <p className="text-sm font-semibold text-slate-900">💼 Business English</p>
                <p className="text-sm font-semibold text-slate-900">💻 Tech & AI</p>
                <p className="text-sm font-semibold text-slate-900">💰 Finance</p>
             </div>
             <div>
                <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Location</h4>
                <p className="text-sm font-semibold text-slate-900">Rio de Janeiro, BR</p>
                <p className="text-sm font-semibold text-slate-900">Global Perspective</p>
             </div>
          </div>
        </div>
      </div>

      {/* Detailed Bio Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-16">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-3">
               <span className="text-blue-600">🌍</span> About Me
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Curious mind. Global perspective. I’ve traveled to 13 countries, lived in three, and explored diverse regions of the U.S. Along the way, I’ve developed a deep appreciation for culture, communication, and how ideas move across borders.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Professionally and personally, I’m passionate about: <strong>Technology & innovation</strong> (Generative AI, AI agents, cloud architecture, AWS), <strong>Education & communication</strong>, <strong>Philosophy</strong> (Stoicism, ethics, systems thinking), and <strong>Public policy</strong>. I enjoy helping students talk comfortably about modern topics while improving pronunciation and clarity.
            </p>
          </section>

          <section className="bg-slate-900 text-white p-10 rounded-xl">
             <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3">
               <span className="text-blue-400">✒️</span> Teaching Style
             </h3>
             <p className="text-slate-300 leading-relaxed text-lg">
                In class, I focus on guided learning, practical language foundations, and light dictation to help you understand how English works in real contexts. Our sessions are mostly conversation-based, with flexibility to focus on specific areas you want to improve.
             </p>
          </section>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">Interests & Hobbies</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {['Technology', 'Philosophy', 'Stoicism', 'Fitness', 'Boxing', 'Hiking', 'Beach', 'History', 'AI', 'Global Markets'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-full">{tag}</span>
            ))}
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-4">
               <span className="text-2xl">💪</span>
               <span className="text-sm text-slate-600">Active at the gym & hiking</span>
             </div>
             <div className="flex items-center gap-4">
               <span className="text-2xl">🏖️</span>
               <span className="text-sm text-slate-600">Love beach days in Rio</span>
             </div>
             <div className="flex items-center gap-4">
               <span className="text-2xl">🥋</span>
               <span className="text-sm text-slate-600">Boxing and Martial Arts</span>
             </div>
          </div>
        </div>
      </div>

      {/* Education & Experience Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
         {/* Experience */}
         <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 border-b pb-2">Professional Experience</h3>
            
            <div className="relative pl-8 border-l-2 border-slate-100 space-y-12">
               <div className="relative">
                  <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></div>
                  <h4 className="font-bold text-slate-900">Software Programmer</h4>
                  <p className="text-xs text-blue-600 uppercase font-bold tracking-widest mb-2">Technology & Engineering</p>
                  <p className="text-sm text-slate-600">Versatile programmer with experience in front-end, back-end, and DevOps. Crafting innovative digital solutions.</p>
               </div>
               
               <div className="relative">
                  <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white"></div>
                  <h4 className="font-bold text-slate-900">Sustainability Planner</h4>
                  <p className="text-xs text-blue-600 uppercase font-bold tracking-widest mb-2">Government & Architecture</p>
                  <p className="text-sm text-slate-600">Driving environmental initiatives at ECO Action in Atlanta, GA, designing sustainable solutions.</p>
               </div>

               <div className="relative">
                  <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white"></div>
                  <h4 className="font-bold text-slate-900">Financial Manager</h4>
                  <p className="text-xs text-blue-600 uppercase font-bold tracking-widest mb-2">Finance & Markets</p>
                  <p className="text-sm text-slate-600">Expertise in Stock, Forex, and Crypto (BTC & Ethereum) markets.</p>
               </div>
            </div>
         </div>

         {/* Education */}
         <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 border-b pb-2">Education & Certificates</h3>
            
            <div className="grid grid-cols-1 gap-4">
               <div className="p-5 bg-white border border-slate-100 rounded-lg flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">🎓</div>
                  <div>
                     <h4 className="font-bold text-slate-900">Google Cloud Architect</h4>
                     <p className="text-sm text-slate-500">Infrastructure design, scalability, and security.</p>
                  </div>
               </div>

               <div className="p-5 bg-white border border-slate-100 rounded-lg flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">🎓</div>
                  <div>
                     <h4 className="font-bold text-slate-900">Graduate Studies in Economics</h4>
                     <p className="text-sm text-slate-500">University of Sydney - Finance and Banking.</p>
                  </div>
               </div>

               <div className="p-5 bg-white border border-slate-100 rounded-lg flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">🎓</div>
                  <div>
                     <h4 className="font-bold text-slate-900">Bachelor of Arts (BA)</h4>
                     <p className="text-sm text-slate-500">Law & Government - Focus on public policy.</p>
                  </div>
               </div>

               <div className="p-5 bg-blue-600 text-white rounded-lg flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">📜</div>
                  <div>
                     <h4 className="font-bold">TESOL Certified</h4>
                     <p className="text-sm opacity-80">Teaching English to Speakers of Other Languages.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Final CTA */}
      <div className="text-center py-16 border-t border-slate-200">
         <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Let’s level up your English.</h3>
         <p className="text-slate-500 mb-8">Book a lesson and let’s build skills that actually matter 🌍✨</p>
         <button 
           onClick={() => {
             const agendaTab = document.querySelector('[data-tab="agenda"]') as HTMLButtonElement;
             if (agendaTab) agendaTab.click();
             window.scrollTo({ top: document.getElementById('tabs-section')?.offsetTop ?? 0 - 100, behavior: 'smooth' });
           }}
           className="bg-blue-600 text-white px-12 py-5 font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl"
         >
           Agendar Aula
         </button>
      </div>
    </div>
  );
};

export default About;