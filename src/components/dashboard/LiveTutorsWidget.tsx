import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaGlobeAmericas, FaDotCircle } from 'react-icons/fa';
import { trackEvent } from '../../utils/analytics';
import { useToast } from '../../hooks/useToast';

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  accent: string;
  online: boolean;
  specialty: string;
}

export const LiveTutorsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [connecting, setConnecting] = useState(false);

  // Mock list of down-to-earth native American tutors
  const tutors: Tutor[] = [
    {
      id: 'matt',
      name: 'Matt (Boston, MA)',
      avatar: '/bobby.jpg', // Reuse Bobby avatar for tutor visualization
      accent: 'New England Accent',
      online: true,
      specialty: 'Everyday idioms & small talk'
    },
    {
      id: 'sarah',
      name: 'Sarah (Los Angeles, CA)',
      avatar: '/chloe.jpg', // Reuse Chloe avatar for tutor visualization
      accent: 'West Coast Accent',
      online: true,
      specialty: 'Pronunciation & slang'
    }
  ];

  const handleConnectCall = (tutorId: string, tutorName: string) => {
    setConnecting(true);
    trackEvent('live_call_connect', { tutorId });
    showToast({ type: 'success', message: `Conectando chamada ao vivo com ${tutorName}...` });

    setTimeout(() => {
      const uniqueRoomId = `elo-live-call-${tutorId}-${Date.now().toString().slice(-4)}`;
      navigate(`/video-call/${uniqueRoomId}`);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/15 via-slate-900 to-slate-900">
      
      {/* Siri-like subtle glow backdrop */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FaGlobeAmericas className="text-emerald-400" /> Americans On Call 🇺🇸
          </h3>
          <p className="text-[10px] text-emerald-455 font-bold mt-0.5 uppercase tracking-wide">
            Conexão Instantânea Cambly-Style
          </p>
        </div>
        <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse">
          <FaDotCircle size={8} /> 2 Online
        </span>
      </div>

      <p className="text-xs text-slate-350 leading-relaxed mb-5 relative z-10">
        Precisa praticar conversação real? Converse com nativos americanos na hora! Sem agendamentos complexos, direto ao ponto.
      </p>

      {/* Tutors online grid */}
      <div className="space-y-4 mb-5 relative z-10">
        {tutors.map((tutor) => (
          <div 
            key={tutor.id} 
            className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-white/5 rounded-2xl hover:border-white/10 transition-all hover:bg-slate-950"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl bg-cover bg-center border border-white/10 relative"
                style={{ backgroundImage: `url(${tutor.avatar})` }}
              >
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">{tutor.name}</h4>
                <p className="text-[9px] text-slate-400 mt-0.5">{tutor.accent} • {tutor.specialty}</p>
              </div>
            </div>

            <button
              disabled={connecting}
              onClick={() => handleConnectCall(tutor.id, tutor.name)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 shadow-emerald-700/20"
            >
              <FaPhoneAlt size={10} className="animate-bounce" />
              Ligar
            </button>
          </div>
        ))}
      </div>

      <div className="text-[9px] text-slate-500 text-center font-medium">
        * As chamadas são gratuitas no plano ativo. Requer microfone e câmera autorizados.
      </div>
    </div>
  );
};
