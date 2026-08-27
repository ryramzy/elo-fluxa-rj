/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../../constants.ts';
import { trackEvent } from '@/utils/analytics';

interface FooterProps {
  onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick = () => {} }) => {
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email) return;
    trackEvent('newsletter_subscribe', { email });
    setSubscribeStatus('loading');
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
    }, 1500);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent('footer_whatsapp_click');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  }

  return (
    <footer className="bg-slate-950 pt-24 pb-12 px-6 text-slate-500">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        
        <div className="md:col-span-4">
          <h4 className="text-2xl font-serif text-white mb-6">Elo!</h4>
          <p className="max-w-xs font-light leading-relaxed mb-6 text-sm">
            Aprenda inglês com Professor, americano nativo e coach. 
            Do Business English para Oil & Gas à sobrevivência no Rio, destrave sua fala com confiança.
          </p>
          <button 
            onClick={handleWhatsApp}
            className="text-green-500 font-bold uppercase tracking-widest text-[10px] hover:text-green-400 transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Fale conosco via WhatsApp
          </button>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-white mb-6 tracking-wide text-xs uppercase">Trilhas LMS</h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
            <li><Link to="/courses" className="hover:text-blue-400 transition-colors">Developers 💻</Link></li>
            <li><Link to="/courses" className="hover:text-blue-400 transition-colors">Vaga / Visto 🇺🇸</Link></li>
            <li><Link to="/courses" className="hover:text-blue-400 transition-colors">Survival English 🎒</Link></li>
          </ul>
        </div>
        
        <div className="md:col-span-2">
          <h4 className="font-bold text-white mb-6 tracking-wide text-xs uppercase">Plataforma</h4>
          <ul className="space-y-3 text-xs font-bold uppercase tracking-widest">
            <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors py-1.5 inline-block min-h-[36px]">Painel Geral 📊</Link></li>
            <li><Link to="/sobre" className="hover:text-blue-400 transition-colors py-1.5 inline-block min-h-[36px]">Sobre Nós</Link></li>
            <li><Link to="/privacidade" className="hover:text-blue-400 transition-colors py-1.5 inline-block min-h-[36px]">Privacidade (LGPD)</Link></li>
            <li><Link to="/termos" className="hover:text-blue-400 transition-colors py-1.5 inline-block min-h-[36px]">Termos de Uso</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="font-bold text-white mb-6 tracking-wide text-xs uppercase">Dicas Semanais</h4>
          <div className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-b border-slate-800 py-2.5 text-base outline-none focus:border-blue-400 transition-colors placeholder-slate-700 text-white min-h-[44px]" 
            />
            <button 
              onClick={handleSubscribe}
              className="self-start text-xs font-bold uppercase tracking-widest mt-2 py-2 px-3 text-blue-400 hover:text-blue-300 transition-opacity min-h-[36px] flex items-center"
            >
              {subscribeStatus === 'idle' && 'Inscrever'}
              {subscribeStatus === 'loading' && 'Processando...'}
              {subscribeStatus === 'success' && 'Bem-vinda!'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto mt-20 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-[0.2em] font-bold opacity-50 gap-3">
        <p>© 2026 ELO! — Inglês com Professores Nativos no Rio de Janeiro</p>
        <p className="flex items-center gap-4">
          <Link to="/privacidade" className="hover:text-white py-1.5 inline-block min-h-[36px]">Privacidade</Link>
          <span>•</span>
          <Link to="/termos" className="hover:text-white py-1.5 inline-block min-h-[36px]">Termos</Link>
          <span>•</span>
          <span>Rio de Janeiro, Brasil</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;