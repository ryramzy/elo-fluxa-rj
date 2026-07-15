import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { TutorAgendaView } from '@/components/booking/TutorAgendaView';
import { Navigate } from 'react-router-dom';

export default function AgendaPage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid || '');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsAdmin(profile.role === 'admin' || profile.role === 'tutor');
    }
  }, [profile]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-semibold">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" state={{ tab: 'booking' }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <TutorAgendaView />
    </div>
  );
}
