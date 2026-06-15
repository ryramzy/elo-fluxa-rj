import React, { useState, useEffect } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { useToast } from '../hooks/useToast';
import { FaTimes, FaSave } from 'react-icons/fa';

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
    submittedAt: any;
  };
}

interface BookingFeedbackModalProps {
  booking: Booking;
  onClose: () => void;
}

export const BookingFeedbackModal: React.FC<BookingFeedbackModalProps> = ({ booking, onClose }) => {
  const { showToast } = useToast();
  const [pronunciation, setPronunciation] = useState('');
  const [vocabulary, setVocabulary] = useState('');
  const [homework, setHomework] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (booking.tutorNotes) {
      setPronunciation(booking.tutorNotes.pronunciation || '');
      setVocabulary(booking.tutorNotes.vocabulary || '');
      setHomework(booking.tutorNotes.homework || '');
    } else {
      setPronunciation('');
      setVocabulary('');
      setHomework('');
    }
  }, [booking]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        tutorNotes: {
          pronunciation,
          vocabulary,
          homework,
          submittedAt: Timestamp.now()
        }
      });
      showToast({ type: 'success', message: 'Feedback salvo com sucesso!' });
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
          {/* Pronunciation Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Pronúncia & Articulação 🗣️
            </label>
            <textarea
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
              rows={3}
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
              rows={3}
              placeholder="Adicione termos ou expressões importantes aprendidos hoje..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
            />
          </div>

          {/* Homework Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Tarefa & Próximos Passos 📝
            </label>
            <textarea
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              rows={3}
              placeholder="Descreva o dever de casa ou próximos tópicos de estudo..."
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
