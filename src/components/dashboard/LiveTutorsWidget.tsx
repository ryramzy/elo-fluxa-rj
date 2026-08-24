import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaGlobeAmericas, FaDotCircle, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firestore';
import { trackEvent } from '../../utils/analytics';
import { useToast } from '../../hooks/useToast';
import { TutorProfileModal } from '../profile/TutorProfileModal';

interface LiveTutorsWidgetProps {
  onNavigateToAgenda: () => void;
}

export const LiveTutorsWidget: React.FC<LiveTutorsWidgetProps> = ({ onNavigateToAgenda }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [tutorOnline, setTutorOnline] = useState(false);
  const [loadingPresence, setLoadingPresence] = useState(true);
  const [tutorModalOpen, setTutorModalOpen] = useState(false);

  useEffect(() => {
    // Setup real-time presence subscription to Professor's online status
    const docRef = doc(db, 'settings', 'tutor_presence');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setTutorOnline(docSnap.data().isOnline || false);
      } else {
        setTutorOnline(false);
      }
      setLoadingPresence(false);
    }, (error) => {
      console.error('Error listening to tutor presence:', error);
      setLoadingPresence(false);
    });

    return () => unsubscribe();
  }, []);

  const handleConnectCall = () => {
    if (!tutorOnline) {
      showToast({ type: 'error', message: 'Professor está offline no momento. Agende uma aula abaixo!' });
      return;
    }

    setConnecting(true);
    trackEvent('live_call_connect_zoom', { tutorId: 'matt' });
    showToast({ type: 'success', message: 'Abrindo Sala de Aula ao Vivo...' });

    setTimeout(() => {
      window.location.href = '/classroom';
      setConnecting(false);
    }, 400);
  };

  return (
    <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/15 via-slate-900 to-slate-900">
      
      {/* Glow backdrop */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FaGlobeAmericas className="text-emerald-400" /> Plantão de Conversação 🇺🇸
          </h3>
          <p className="text-[10px] text-emerald-400 font-bold mt-0.5 uppercase tracking-wide">
            Fale com Professor ao vivo
          </p>
        </div>
        
        {loadingPresence ? (
          <span className="text-[9px] text-slate-500 uppercase font-semibold">Carregando...</span>
        ) : (
          <span className={`flex items-center gap-1 border px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            tutorOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 animate-pulse' 
              : 'bg-slate-950/80 text-slate-500 border-white/5'
          }`}>
            <FaDotCircle size={8} /> {tutorOnline ? 'Professor Online' : 'Professor Offline'}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-5 relative z-10">
        Pratique conversação real com seu professor particular em tempo real. Sem burocracias, direto ao ponto quando disponível.
      </p>

      {/* Professor Nativo Profile Widget card */}
      <div className="relative z-10 mb-4 bg-slate-950/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl bg-cover bg-center border border-white/10 relative"
              style={{ backgroundImage: `url('/bobby.jpg')` }}
            >
              {!loadingPresence && (
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                  tutorOnline ? 'bg-emerald-500' : 'bg-slate-500'
                }`}></span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-105">Professor Nativo</h4>
              <p className="text-[9px] text-slate-450 mt-0.5">Boston, MA • Sotaque Americano Nativo</p>
            </div>
          </div>

          <button
            onClick={() => setTutorModalOpen(true)}
            className="text-[9px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <FaUser size={9} /> Ver Bio
          </button>
        </div>

        {/* Buttons Section */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          {/* Entrar no Zoom Button */}
          <button
            disabled={connecting || loadingPresence || !tutorOnline}
            onClick={handleConnectCall}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:opacity-40 disabled:text-slate-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 shadow-blue-700/20"
          >
            <FaPhoneAlt size={10} className={tutorOnline ? "animate-bounce" : ""} />
            Entrar no Zoom
          </button>

          {/* Agendar Button */}
          <button
            onClick={onNavigateToAgenda}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <FaCalendarAlt size={10} />
            Agendar Aula
          </button>
        </div>
      </div>

      <div className="text-[9px] text-slate-550 text-center font-medium">
        * As aulas ao vivo são transmitidas via Zoom com o professor nativo Professor.
      </div>

      <TutorProfileModal
        isOpen={tutorModalOpen}
        onClose={() => setTutorModalOpen(false)}
      />
    </div>
  );
};
