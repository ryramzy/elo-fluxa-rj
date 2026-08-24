import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getClassroomSettings, db } from '@/lib/firestore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  FaVideo, 
  FaCalendarAlt, 
  FaWhatsapp, 
  FaArrowRight, 
  FaBookOpen, 
  FaMicrophone, 
  FaCheckCircle, 
  FaShieldAlt,
  FaHeadphones,
  FaSparkles
} from 'react-icons/fa';
import { getWhatsAppLink } from '../../constants';

export default function ClassroomPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');

  const [classroomSettings, setClassroomSettings] = useState({
    meetingUrl: 'https://meet.google.com/new',
    provider: 'zoom',
    title: 'Sala de Aula Virtual — Professor Matt'
  });
  const [loading, setLoading] = useState(true);
  const [nextBooking, setNextBooking] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch live classroom link
    getClassroomSettings().then(settings => {
      if (settings?.meetingUrl) {
        setClassroomSettings(settings);
      }
      setLoading(false);
    });

    // 2. Fetch user's next upcoming booking
    if (user?.uid && !user.isGuest) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const bQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(bQuery, (snapshot) => {
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter(b => b.date >= todayStr && b.status !== 'cancelled')
          .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

        if (list.length > 0) {
          setNextBooking(list[0]);
        } else {
          setNextBooking(null);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleEnterClassroom = () => {
    const url = classroomSettings.meetingUrl || 'https://meet.google.com/new';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center pt-24 pb-28 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Ambient background glowing orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] relative z-10 text-center">
        
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-550/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold uppercase tracking-widest mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          Sala de Aula Virtual Ativa
        </div>

        {/* Header Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
          {classroomSettings.title}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Pratique conversação intensiva 1:1 com o professor nativo americano. Conecte-se em 1 clique sem burocracia ou senha.
        </p>

        {/* Teacher Flagship Identity Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 text-left flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img 
                src="/matt-profile.jpg" 
                alt="Professor Matt" 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/30 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/bobby.jpg';
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-white">Professor Matt</h4>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Nativo USA 🇺🇸
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Especialista em Fluência & Pronúncia • Rio de Janeiro
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Scheduled Class Indicator (if available) */}
        {nextBooking && (
          <div className="bg-gradient-to-r from-blue-950/30 via-slate-950/60 to-indigo-950/30 border border-blue-500/40 rounded-2xl p-4 mb-6 text-left flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <FaCalendarAlt size={16} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">Sua Próxima Sessão</p>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  {nextBooking.date.split('-').reverse().join('/')} às {nextBooking.time}
                </h4>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Confirmada ✅
            </span>
          </div>
        )}

        {/* Primary 1-Click Join Button */}
        <button
          onClick={handleEnterClassroom}
          className="w-full py-4 sm:py-4.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 active:scale-[0.98] text-white rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 mb-6 -webkit-tap-highlight-color-transparent select-none min-h-[56px] border border-blue-400/30"
        >
          <FaVideo size={20} className="animate-pulse" />
          <span>Entrar na Sala do {classroomSettings.provider === 'google_meet' ? 'Google Meet' : 'Zoom'}</span>
          <FaArrowRight size={15} className="opacity-80" />
        </button>

        {/* Audio / Video Readiness Checklist */}
        <div className="grid grid-cols-3 gap-2 py-4 px-3 bg-slate-950/40 border border-slate-800/60 rounded-2xl mb-6 text-slate-400 text-[10px] sm:text-xs font-semibold">
          <div className="flex items-center justify-center gap-1.5">
            <FaMicrophone className="text-emerald-400 shrink-0" />
            <span>Microfone OK</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <FaHeadphones className="text-emerald-400 shrink-0" />
            <span>Áudio HD OK</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <FaShieldAlt className="text-emerald-400 shrink-0" />
            <span>100% Privado</span>
          </div>
        </div>

        {/* Secondary Shortcuts */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <a
            href="/courses"
            className="py-3 px-4 bg-slate-950 hover:bg-slate-850 active:scale-95 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-800 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <FaBookOpen size={14} className="text-blue-400" />
            <span>Materiais & Slides</span>
          </a>
          <a
            href={getWhatsAppLink('general', { studentName: profile?.displayName || user?.displayName || 'Estudante' })}
            target="_blank"
            rel="noreferrer"
            className="py-3 px-4 bg-emerald-950/30 hover:bg-emerald-900/40 active:scale-95 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-800/40 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <FaWhatsapp size={15} />
            <span>Ajuda ao Vivo</span>
          </a>
        </div>
      </div>
    </div>
  );
}
