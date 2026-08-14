import React, { useState, useEffect } from 'react';
import { LuMonitor, LuDownload, LuX, LuCheck, LuApple, LuLaptop } from 'react-icons/lu';

interface DesktopDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopDownloadModal: React.FC<DesktopDownloadModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar o ELO! no seu computador:\n\nChrome/Edge: Clique no ícone de computador na barra de endereço ou em "Instalar ELO!".\nSafari Mac: Arquivo -> Adicionar ao Dock.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <LuX size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400">
            <LuMonitor size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">ELO! Desktop para Tutores</h3>
            <p className="text-xs text-blue-400 font-semibold">Aplicativo Nativo para Windows & macOS</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Acesse o deck de apresentação, controle de agendamentos e salas do Zoom em uma janela independente de alta performance, sem barras de navegador.
        </p>

        {/* Installation Cards */}
        <div className="space-y-3 mb-6">
          {/* Windows / Chrome PWA */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LuLaptop className="text-blue-400 shrink-0" size={24} />
              <div>
                <h4 className="text-xs font-bold text-white">Windows & Linux</h4>
                <p className="text-[10px] text-slate-400">Instalação direta via Chrome / Edge</p>
              </div>
            </div>
            <button
              onClick={handleInstallPWA}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <LuDownload size={14} /> Instalar
            </button>
          </div>

          {/* macOS Card */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LuApple className="text-slate-300 shrink-0" size={24} />
              <div>
                <h4 className="text-xs font-bold text-white">macOS (Safari)</h4>
                <p className="text-[10px] text-slate-400">Arquivo ➔ Adicionar ao Dock</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              Nativo Safari
            </span>
          </div>
        </div>

        {/* Status indicator */}
        {isInstalled && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mb-4">
            <LuCheck size={16} /> Aplicativo Desktop já instalado neste dispositivo!
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
