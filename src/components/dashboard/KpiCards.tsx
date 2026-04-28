import React from 'react';
import { getLevelName } from '../../utils/xpUtils';
import type { Booking } from '../../types';

interface KpiCardsProps {
  bookings: Booking[];
  enrollments: any[];
  profile: any;
  weeklyBookingsCount: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ 
  bookings, 
  enrollments, 
  profile, 
  weeklyBookingsCount 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Weekly Bookings Card */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700 mb-1">Aulas esta semana</p>
            <p className="text-2xl font-bold text-blue-800">{weeklyBookingsCount}</p>
            <p className="text-xs text-blue-600 mt-1">R$ {weeklyBookingsCount * 100} estimado</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold">📅</span>
          </div>
        </div>
      </div>

      {/* Active Courses Card */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 mb-1">Alunos ativos</p>
            <p className="text-2xl font-bold text-green-800">{enrollments.length}</p>
            <p className="text-xs text-green-600 mt-1">cursos em andamento</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 font-bold">👥</span>
          </div>
        </div>
      </div>

      {/* Next Class Card */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-700 mb-1">Próxima aula</p>
            <p className="text-2xl font-bold text-purple-800">Nenhuma</p>
            <button className="text-xs text-purple-600 hover:text-purple-700 mt-1">
              Agendar agora →
            </button>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-bold">⏰</span>
          </div>
        </div>
      </div>

      {/* Level Card */}
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-700 mb-1">Meu nível</p>
            <p className="text-2xl font-bold text-amber-800">{getLevelName(profile?.level || 1)}</p>
            <p className="text-xs text-amber-600 mt-1">{profile?.xp || 0} XP total</p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-amber-600 font-bold">⭐</span>
          </div>
        </div>
      </div>
    </div>
  );
};
