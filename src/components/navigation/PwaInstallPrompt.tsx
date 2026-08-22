import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaShareSquare, FaPlusSquare } from 'react-icons/fa';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if user already dismissed recently
    const dismissedTime = localStorage.getItem('elo_pwa_dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Check if already in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for Android / Chrome install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show prompt after 3 seconds
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('elo_pwa_dismissed', Date.now().toString());
    setShowPrompt(false);
    setShowIosGuide(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Floating Bottom Card */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-blue-900/40 text-white relative flex items-center gap-3.5">
          {/* App Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg shadow-blue-600/30">
            E!
          </div>

          <div className="flex-1 pr-6">
            <h4 className="font-black text-sm text-white leading-tight">Instalar o App ELO!</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Adicione à sua tela de início para acesso rápido e lembretes.
            </p>
          </div>

          {/* Close button */}
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
            aria-label="Fechar"
          >
            <FaTimes size={12} />
          </button>

          {/* Action Button */}
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            Instalar
          </button>
        </div>
      </div>

      {/* iOS Step-by-step Guide Modal */}
      {showIosGuide && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowIosGuide(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-white space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center text-xl mx-auto">
              <FaDownload />
            </div>
            <h3 className="text-lg font-black">Como instalar no iPhone / iPad:</h3>
            <div className="text-xs text-slate-300 space-y-3 text-left bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">1</span>
                <span>Toque no botão de <strong>Compartilhar</strong> <FaShareSquare className="inline text-blue-400 ml-1" /> na barra inferior do Safari.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">2</span>
                <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> <FaPlusSquare className="inline text-emerald-400 ml-1" />.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">3</span>
                <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
              </div>
            </div>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
