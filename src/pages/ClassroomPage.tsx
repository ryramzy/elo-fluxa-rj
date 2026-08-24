import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getClassroomSettings, db } from '@/lib/firestore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FaVideo, FaChalkboardTeacher, FaCalendarAlt, FaWhatsapp, FaArrowRight, FaBookOpen } from 'react-icons/fa';
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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Sala de Aula ao Vivo
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {classroomSettings.title}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mb-8">
          Acesso direto e instantâneo à sua aula particular de inglês com o professor nativo. Sem necessidade de senha.
        </p>

        {/* Next Scheduled Booking Alert */}
        {nextBooking ? (
          <div className="bg-slate-950/60 border border-blue-500/30 rounded-2xl p-4 mb-6 text-left flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <FaCalendarAlt size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Sua Próxima Aula</p>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  {nextBooking.date.split('-').reverse().join('/')} às {nextBooking.time}
                </h4>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-2.5 py-1 rounded-full">
              Confirmada ✅
            </span>
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 mb-6 text-left flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <FaChalkboardTeacher size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plantão de Dúvidas & Aulas</p>
                <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                  Professor Matt Online
                </h4>
              </div>
            </div>
          </div>
        )}

        {/* Primary 1-Click CTA */}
        <button
          onClick={handleEnterClassroom}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-3 mb-4 -webkit-tap-highlight-color-transparent select-none min-h-[52px]"
        >
          <FaVideo size={18} />
          <span>Entrar na Sala do {classroomSettings.provider === 'google_meet' ? 'Google Meet' : 'Zoom'}</span>
          <FaArrowRight size={14} className="opacity-70" />
        </button>

        {/* Secondary Action Shortcuts */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <a
            href="/courses"
            className="py-3 px-4 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-800 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <FaBookOpen size={14} />
            <span>Materiais de Aula</span>
          </a>
          <a
            href={getWhatsAppLink('general', { studentName: profile?.displayName || user?.displayName || 'Estudante' })}
            target="_blank"
            rel="noreferrer"
            className="py-3 px-4 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-800/40 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <FaWhatsapp size={14} />
            <span>Ajuda WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
