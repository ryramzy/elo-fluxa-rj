/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState } from 'react';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../constants';

interface FooterProps {
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick }) => {
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email) return;
    setSubscribeStatus('loading');
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
    }, 1500);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  }

  return (
    <footer className="bg-slate-900 pt-24 pb-12 px-6 text-slate-400">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        
        <div className="md:col-span-4">
          <h4 className="text-2xl font-serif text-white mb-6">Elo Matt!</h4>
          <p className="max-w-xs font-light leading-relaxed mb-6">
            Aprenda inglês com Matthew, americano nativo e coach. 
            Do Business English à sobrevivência no Rio, destrave sua fala com confiança.
          </p>
          <button 
            onClick={handleWhatsApp}
            className="text-blue-400 font-bold uppercase tracking-widest text-xs hover:text-blue-300 transition-colors"
          >
            Fale conosco via WhatsApp
          </button>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-white mb-6 tracking-wide text-sm uppercase">Aulas</h4>
          <ul className="space-y-4 font-light">
            <li><a href="#products" onClick={(e) => onLinkClick(e, 'products')} className="hover:text-blue-400 transition-colors">Business English</a></li>
            <li><a href="#products" onClick={(e) => onLinkClick(e, 'products')} className="hover:text-blue-400 transition-colors">Fluency Coaching</a></li>
            <li><a href="#products" onClick={(e) => onLinkClick(e, 'products')} className="hover:text-blue-400 transition-colors">Carioca Survival</a></li>
          </ul>
        </div>
        
        <div className="md:col-span-2">
          <h4 className="font-bold text-white mb-6 tracking-wide text-sm uppercase">Matthew</h4>
          <ul className="space-y-4 font-light">
            <li><a href="#about" onClick={(e) => onLinkClick(e, 'about')} className="hover:text-blue-400 transition-colors">Nossa História</a></li>
            <li><a href="#about" onClick={(e) => onLinkClick(e, 'about')} className="hover:text-blue-400 transition-colors">Filosofia Taoísta</a></li>
            <li><a href="#journal" onClick={(e) => onLinkClick(e, 'journal')} className="hover:text-blue-400 transition-colors">Dicas de Inglês</a></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="font-bold text-white mb-6 tracking-wide text-sm uppercase">Newsletter de Dicas</h4>
          <div className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
              className="bg-transparent border-b border-slate-700 py-2 text-lg outline-none focus:border-blue-400 transition-colors placeholder-slate-600 text-white disabled:opacity-50" 
            />
            <button 
              onClick={handleSubscribe}
              disabled={subscribeStatus !== 'idle' || !email}
              className="self-start text-sm font-bold uppercase tracking-widest mt-2 text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-opacity"
            >
              {subscribeStatus === 'idle' && 'Inscrever'}
              {subscribeStatus === 'loading' && 'Inscrita...'}
              {subscribeStatus === 'success' && 'Bem-vinda!'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs uppercase tracking-widest opacity-60">
        <p>© 2025 Elo Matt! - Inglês com americano nativo</p>
        <p>Rio de Janeiro, Brasil</p>
      </div>
    </footer>
  );
};

export default Footer;