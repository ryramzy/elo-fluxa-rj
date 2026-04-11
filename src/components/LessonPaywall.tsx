import React from 'react';
import { courses } from '../data/courses';
import { getWhatsAppLink } from '../../constants';

interface LessonPaywallProps {
  courseId: string;
  lessonTitle: string;
  onPlanSelect: () => void;
}

const LessonPaywall: React.FC<LessonPaywallProps> = ({ courseId, lessonTitle, onPlanSelect }) => {
  const course = courses.find(c => c.id === courseId);
  
  if (!course) return null;

  const remainingLessons = course.lessons.filter(l => !l.free).length;
  const totalXP = course.lessons.filter(l => !l.free).reduce((sum, lesson) => sum + lesson.xpReward, 0);
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">
          Você terminou sua aula grátis! ?
        </h2>
        
        <p className="text-lg opacity-90 mb-4">
          Tem mais <span className="font-bold">{remainingLessons}</span> aulas neste curso esperando por você.
        </p>
        
        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <p className="text-sm opacity-80 mb-1">Desbloqueie este curso e ganhe até</p>
          <p className="text-2xl font-bold">+{totalXP} XP</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={getWhatsAppLink('lessonPaywall')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
          </svg>
          Falar com Matt no WhatsApp
        </a>
        
        <button
          onClick={onPlanSelect}
          className="flex-1 px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition-colors"
        >
          Ver planos
        </button>
      </div>

      <p className="text-sm opacity-80 mt-6">
        Responda em segundos - Matt está online agora
      </p>
    </div>
  );
};

export default LessonPaywall;
