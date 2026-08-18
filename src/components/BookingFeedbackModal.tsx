import React, { useState, useEffect } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { useToast } from '../hooks/useToast';
import { FaTimes, FaSave, FaStar } from 'react-icons/fa';

interface Booking {
  id: string;
  userId: string;
  userName: string;
  date: string;
  time: string;
  tutorNotes?: {
    pronunciation: string;
    vocabulary: string;
    homework: string;
    summary?: string;
    studentRating?: number;
    nextGoal?: string;
    attendance?: 'present' | 'absent';
    submittedAt: any;
  };
}

interface BookingFeedbackModalProps {
  booking: Booking;
  onClose: () => void;
}

export const BookingFeedbackModal: React.FC<BookingFeedbackModalProps> = ({ booking, onClose }) => {
  const { showToast } = useToast();
  const [summary, setSummary] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [vocabulary, setVocabulary] = useState('');
  const [homework, setHomework] = useState('');
  const [nextGoal, setNextGoal] = useState('');
  const [studentRating, setStudentRating] = useState(5);
  const [attendance, setAttendance] = useState<'present' | 'absent'>('present');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (booking.tutorNotes) {
      setSummary(booking.tutorNotes.summary || '');
      setPronunciation(booking.tutorNotes.pronunciation || '');
      setVocabulary(booking.tutorNotes.vocabulary || '');
      setHomework(booking.tutorNotes.homework || '');
      setNextGoal(booking.tutorNotes.nextGoal || '');
      setStudentRating(booking.tutorNotes.studentRating || 5);
      setAttendance(booking.tutorNotes.attendance || 'present');
    } else {
      setSummary('');
      setPronunciation('');
      setVocabulary('');
      setHomework('');
      setNextGoal('');
      setStudentRating(5);
      setAttendance('present');
    }
  }, [booking]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        tutorNotes: {
          summary,
          pronunciation,
          vocabulary,
          homework,
          nextGoal,
          studentRating,
          attendance,
          submittedAt: Timestamp.now()
        }
      });
      showToast({ type: 'success', message: 'Feedback salvo no Firestore!' });

      // Automatically construct WhatsApp Feedback summary for o professor to send to student with 1 tap
      const waText = `Oi ${booking.userName}! Segue o feedback da nossa aula de hoje no ELO! (eloingles.com.br):\n\n` +
        `🗣️ Pronúncia: ${pronunciation || 'Muito boa!'}\n` +
        `📚 Novo Vocabulário: ${vocabulary || 'Praticamos expressões nativas'}\n` +
        `📝 Tarefa/Homework: ${homework || 'Praticar conversação'}\n\n` +
        `Nos vemos na próxima aula! 🚀`;
      
      const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
      onClose();
    } catch (error: any) {
      console.error('Error saving class feedback:', error);
      showToast({ type: 'error', message: 'Erro ao salvar o feedback: ' + (error.message || error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <FaTimes size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold font-serif text-slate-950 dark:text-white">
            Feedback de Aula
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Estudante: <strong className="text-slate-900 dark:text-slate-200">{booking.userName}</strong>
          </p>
          <p className="text-xs text-slate-400">
            Data/Hora: {booking.date} às {booking.time}
          </p>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Attendance & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Presença 📅
              </label>
              <select
                value={attendance}
                onChange={(e) => setAttendance(e.target.value as 'present' | 'absent')}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-semibold"
              >
                <option value="present">Presente</option>
                <option value="absent">Ausente (No-show)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Desempenho ⭐️
              </label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStudentRating(star)}
                    className="text-xl focus:outline-none transition-colors"
                  >
                    <FaStar 
                      className={star <= studentRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'} 
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Class Summary */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Resumo da Aula (Desempenho Geral) 📝
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Descreva brevemente o foco da aula e o desempenho do aluno..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
              required
            />
          </div>

          {/* Pronunciation Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Pronúncia & Articulação 🗣️
            </label>
            <textarea
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              rows={2}
              placeholder="Descreva pontos de fonética ou pronúncia para melhorar..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
            />
          </div>

          {/* Vocabulary Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Novos Vocabulários 🧠
            </label>
            <textarea
              value={vocabulary}
              onChange={(e) => setVocabulary(e.target.value)}
              rows={2}
              placeholder="Adicione termos ou expressões importantes aprendidos hoje..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
            />
          </div>

          {/* Homework Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Tarefa de Casa 🏠
            </label>
            <textarea
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              rows={2}
              placeholder="Descreva a atividade ou dever de casa..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
            />
          </div>

          {/* Next Goal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Objetivo para Próxima Aula 🎯
            </label>
            <textarea
              value={nextGoal}
              onChange={(e) => setNextGoal(e.target.value)}
              rows={2}
              placeholder="Defina qual o próximo marco/foco de conversação..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl disabled:opacity-50 transition-colors shadow-md text-sm font-bold"
            >
              <FaSave size={14} />
              {saving ? 'Salvando...' : 'Salvar Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
