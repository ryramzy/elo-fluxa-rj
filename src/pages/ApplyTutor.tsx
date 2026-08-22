import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { db } from '../lib/firestore';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { FaGraduationCap, FaVideo, FaCheckCircle } from 'react-icons/fa';

export default function ApplyTutor() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    accent: 'American',
    experience: '',
    availability: '',
    videoLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (profile?.role === 'tutor_pending' || submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-3xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <FaCheckCircle />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Candidatura Recebida!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Sua candidatura está em análise pela nossa equipe. Você será notificado por email em breve.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold rounded-xl transition-colors">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (profile?.role === 'tutor' || profile?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Você já é um professor aprovado!</h2>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Ir para Dashboard</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      await setDoc(doc(db, 'tutor_applications', user.uid), {
        ...formData,
        userId: user.uid,
        email: user.email,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', user.uid), {
        role: 'tutor_pending'
      });

      // Trigger Resend email notification to applicant and Matt
      fetch('/api/email/tutor-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: formData.displayName,
          email: user.email,
          accent: formData.accent,
          experience: formData.experience,
          videoLink: formData.videoLink
        })
      }).catch(err => console.warn('Email trigger error:', err));

      setSubmitted(true);
      showToast({ type: 'success', message: 'Candidatura enviada com sucesso!' });
    } catch (error: any) {
      console.error(error);
      showToast({ type: 'error', message: 'Erro ao enviar: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <h1 className="text-3xl font-black mb-2">Seja um Professor</h1>
          <p className="text-blue-100">Junte-se à nossa equipe de nativos e transforme vidas.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Nome de Exibição</label>
              <input required type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: John Doe" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sotaque / Origem</label>
              <select value={formData.accent} onChange={e => setFormData({...formData, accent: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="American">Americano (EUA)</option>
                <option value="British">Britânico (UK)</option>
                <option value="Canadian">Canadense</option>
                <option value="Australian">Australiano</option>
                <option value="Other">Outro Nativo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sua Bio (Curta)</label>
            <textarea required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" placeholder="Conte um pouco sobre você, de onde é e sua experiência..." />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Experiência com Ensino</label>
            <textarea required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]" placeholder="Ex: 2 anos no Cambly, certificado TEFL..." />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Disponibilidade Geral</label>
            <input required type="text" value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Seg a Sex, das 18h às 22h (BRT)" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Link do Vídeo de Apresentação</label>
            <div className="relative">
              <FaVideo className="absolute left-4 top-3.5 text-slate-400" />
              <input required type="url" value={formData.videoLink} onChange={e => setFormData({...formData, videoLink: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="YouTube, Loom ou Google Drive" />
            </div>
            <p className="text-xs text-slate-400 mt-2">Grave um vídeo de 1-2 minutos em inglês se apresentando.</p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50">
            {loading ? 'Enviando...' : 'Enviar Candidatura'}
          </button>
        </form>
      </div>
    </div>
  );
}
