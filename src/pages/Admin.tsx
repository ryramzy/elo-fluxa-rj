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
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Erro ao carregar candidaturas' });
    } finally {
      setLoading(false);
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
      </div>
    </div>
  );
}
