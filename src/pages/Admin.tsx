import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid || '');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorSettings, setTutorSettings] = useState({
    notificationEmail: 'mramsay0@gmail.com',
    displayName: 'Professor Matt',
    meetingUrl: 'https://meet.google.com/new'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileLoading && profile?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [profile, profileLoading, navigate]);

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, 'tutor_applications'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(apps);

      // Load tutor settings
      const settingsSnap = await getDocs(collection(db, 'settings'));
      const tutorDoc = settingsSnap.docs.find(d => d.id === 'tutor');
      if (tutorDoc?.exists()) {
        setTutorSettings(tutorDoc.data() as any);
      }
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTutorSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
      await setDoc(doc(db, 'settings', 'tutor'), {
        ...tutorSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await setDoc(doc(db, 'settings', 'classroom'), {
        meetingUrl: tutorSettings.meetingUrl,
        title: `Sala de Aula Virtual — ${tutorSettings.displayName}`,
        updatedAt: serverTimestamp()
      }, { merge: true });

      showToast({ type: 'success', message: 'Configurações do Tutor salvas com sucesso no Firestore!' });
    } catch (err: any) {
      showToast({ type: 'error', message: 'Erro ao salvar: ' + err.message });
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchApplications();
    }
  }, [profile]);

  const handleAction = async (appId: string, userId: string, action: 'approve' | 'decline') => {
    try {
      const targetApp = applications.find(a => a.id === appId);

      await updateDoc(doc(db, 'tutor_applications', appId), {
        status: action === 'approve' ? 'approved' : 'declined',
        processedAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', userId), {
        role: action === 'approve' ? 'tutor' : 'student'
      });

      // Send decision email via Resend
      if (targetApp?.email) {
        fetch('/api/email/tutor-decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: targetApp.displayName || 'Tutor',
            email: targetApp.email,
            decision: action === 'approve' ? 'approved' : 'declined'
          })
        }).catch(err => console.warn('Decision email error:', err));
      }

      showToast({ 
        type: 'success', 
        message: action === 'approve' 
          ? 'Tutor aprovado com sucesso! Email de boas-vindas enviado.' 
          : 'Candidatura recusada. Email de notificação enviado.' 
      });
      setApplications(prev => prev.filter(app => app.id !== appId));
    } catch (err: any) {
      console.error(err);
      showToast({ type: 'error', message: 'Erro: ' + err.message });
    }
  };

  if (profileLoading || loading) return <div className="p-10 text-center"><FaSpinner className="animate-spin inline text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-8 text-slate-900 dark:text-white">Admin Dashboard</h1>
        
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-800 dark:text-white">Candidaturas Pendentes ({applications.length})</h2>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Nenhuma candidatura pendente no momento.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Nome & Email</th>
                    <th className="px-6 py-4">Sotaque</th>
                    <th className="px-6 py-4">Bio / Experiência</th>
                    <th className="px-6 py-4">Vídeo</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{app.displayName}</div>
                        <div className="text-xs text-slate-500">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{app.accent}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs">
                        <p className="line-clamp-2 mb-1"><strong>Bio:</strong> {app.bio}</p>
                        <p className="line-clamp-2"><strong>Exp:</strong> {app.experience}</p>
                      </td>
                      <td className="px-6 py-4">
                        <a href={app.videoLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm font-bold">Assistir</a>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleAction(app.id, app.userId, 'approve')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-bold text-xs inline-flex items-center gap-1">
                          <FaCheck /> Aprovar
                        </button>
                        <button onClick={() => handleAction(app.id, app.userId, 'decline')} className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg font-bold text-xs inline-flex items-center gap-1">
                          <FaTimes /> Recusar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tutor Contact & Live Classroom Configuration */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Configurações do Tutor (/settings/tutor)</h2>
            <p className="text-xs text-slate-500 mt-1">Configure o email de notificações de novas aulas e o link da sala de aula ao vivo com zero redeploys.</p>
          </div>

          <form onSubmit={handleSaveTutorSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Nome de Exibição do Professor
              </label>
              <input
                type="text"
                value={tutorSettings.displayName}
                onChange={(e) => setTutorSettings({ ...tutorSettings, displayName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="Ex: Professor Matt"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email de Notificação de Agendamento
              </label>
              <input
                type="email"
                value={tutorSettings.notificationEmail}
                onChange={(e) => setTutorSettings({ ...tutorSettings, notificationEmail: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="Ex: mramsay0@gmail.com ou contato@eloingles.com.br"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Link da Sala de Aula ao Vivo (Zoom PMI / Google Meet)
              </label>
              <input
                type="url"
                value={tutorSettings.meetingUrl}
                onChange={(e) => setTutorSettings({ ...tutorSettings, meetingUrl: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
                placeholder="https://zoom.us/j/123456789 ou https://meet.google.com/..."
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {savingSettings ? 'Salvando...' : 'Salvar Configurações do Tutor'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
