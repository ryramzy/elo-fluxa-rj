import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { db } from '../lib/firestore';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { FaUsers, FaPlus, FaTrophy, FaCalendarCheck, FaChartLine } from 'react-icons/fa';

export default function OrgAdminDashboard() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid || '');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [orgEmployees, setOrgEmployees] = useState<any[]>([]);
  const [teamBookings, setTeamBookings] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [initialCredits, setInitialCredits] = useState(10);
  const [registering, setRegistering] = useState(false);

  // Credit editor states
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [creditAdjustment, setCreditAdjustment] = useState(0);
  const [updatingCredits, setUpdatingCredits] = useState(false);

  const userOrgId = profile?.organizationId || '';
  const isOrgAdmin = profile?.role === 'org_admin';

  useEffect(() => {
    if (!profileLoading) {
      if (!user || !isOrgAdmin || !userOrgId) {
        showToast({ type: 'error', message: 'Acesso negado. Apenas administradores corporativos.' });
        navigate('/dashboard');
      }
    }
  }, [user, profileLoading, isOrgAdmin, userOrgId, navigate, showToast]);

  const loadOrgData = async () => {
    if (!userOrgId) return;
    setLoadingStats(true);
    try {
      // 1. Query all users belonging to this organization
      const usersQuery = query(collection(db, 'users'), where('organizationId', '==', userOrgId));
      const usersSnap = await getDocs(usersQuery);
      const employeesList = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      setOrgEmployees(employeesList);

      // 2. Query all bookings made by these employees
      const employeeUids = employeesList.map(e => e.uid);
      if (employeeUids.length > 0) {
        // Query all bookings (since Firestore in-queries are limited to 10 elements, we can fetch bookings and filter locally or chunk)
        const bookingsSnap = await getDocs(collection(db, 'bookings'));
        const allBookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const teamList = allBookings.filter(b => employeeUids.includes((b as any).userId));
        setTeamBookings(teamList);
      } else {
        setTeamBookings([]);
      }
    } catch (err) {
      console.error('Error loading corporate stats:', err);
      showToast({ type: 'error', message: 'Falha ao buscar estatísticas da organização.' });
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (userOrgId && isOrgAdmin) {
      loadOrgData();
    }
  }, [userOrgId, isOrgAdmin]);

  const handleRegisterEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !userOrgId) return;
    setRegistering(true);

    try {
      // Clean email
      const targetEmail = newEmail.trim().toLowerCase();

      // Check if user already exists in Firestore by email
      const userQuery = query(collection(db, 'users'), where('email', '==', targetEmail));
      const querySnap = await getDocs(userQuery);

      if (!querySnap.empty) {
        // User exists: update their profile to belong to this organization
        const matchedUserDoc = querySnap.docs[0];
        const userRef = doc(db, 'users', matchedUserDoc.id);

        await updateDoc(userRef, {
          organizationId: userOrgId,
          plan: 'corporate',
          corporateCredits: initialCredits
        });
        showToast({ type: 'success', message: `Colaborador ${targetEmail} vinculado com sucesso!` });
      } else {
        // User does not exist yet: create a placeholder registration document under /users
        // When they sign up using this email, their profile will already have these B2B credits!
        const newUserId = `b2b_placeholder_${Date.now()}`;
        const placeholderRef = doc(db, 'users', newUserId);
        
        await setDoc(placeholderRef, {
          email: targetEmail,
          displayName: 'Colaborador Convidado',
          photoURL: '',
          organizationId: userOrgId,
          plan: 'corporate',
          corporateCredits: initialCredits,
          xp: 0,
          level: 1,
          streakDays: 0,
          role: 'student',
          createdAt: new Date()
        });
        showToast({ type: 'success', message: `Convite enviado! O plano estará ativo quando ${targetEmail} se cadastrar.` });
      }

      setNewEmail('');
      loadOrgData();
    } catch (err: any) {
      console.error('Failed to register employee:', err);
      showToast({ type: 'error', message: err.message || 'Falha ao convidar colaborador.' });
    } finally {
      setRegistering(false);
    }
  };

  const handleUpdateCredits = async () => {
    if (!editingEmployee || !userOrgId) return;
    setUpdatingCredits(true);

    try {
      const currentCredits = typeof editingEmployee.corporateCredits === 'number' ? editingEmployee.corporateCredits : 0;
      const targetCredits = Math.max(0, currentCredits + creditAdjustment);

      const userRef = doc(db, 'users', editingEmployee.uid);
      await updateDoc(userRef, {
        corporateCredits: targetCredits
      });

      showToast({ type: 'success', message: 'Créditos atualizados com sucesso!' });
      setEditingEmployee(null);
      setCreditAdjustment(0);
      loadOrgData();
    } catch (err: any) {
      console.error('Failed to adjust credits:', err);
      showToast({ type: 'error', message: 'Erro ao ajustar créditos do colaborador.' });
    } finally {
      setUpdatingCredits(false);
    }
  };

  if (profileLoading || loadingStats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Carregando Painel B2B...</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalEmployees = orgEmployees.length;
  const activeCredits = orgEmployees.reduce((sum, emp) => sum + (emp.corporateCredits || 0), 0);
  const completedLessons = teamBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
  const totalXp = orgEmployees.reduce((sum, emp) => sum + (emp.xp || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-blue-800/30">
            Painel Corporativo 🏢
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2">
            Organização: {userOrgId.toUpperCase()}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Monitore o engajamento, uso de créditos, e progresso de inglês da sua equipe.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-all active:scale-95"
        >
          Voltar ao Meu Painel
        </button>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider">Colaboradores</span>
            <span className="text-3xl font-black text-white mt-1 block">{totalEmployees}</span>
          </div>
          <div className="w-12 h-12 bg-blue-950 text-blue-400 rounded-xl flex items-center justify-center">
            <FaUsers size={20} />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider">Créditos Disponíveis</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">{activeCredits}</span>
          </div>
          <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-xl flex items-center justify-center">
            <FaChartLine size={20} />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider">Aulas Concluídas</span>
            <span className="text-3xl font-black text-purple-400 mt-1 block">{completedLessons}</span>
          </div>
          <div className="w-12 h-12 bg-purple-950 text-purple-400 rounded-xl flex items-center justify-center">
            <FaCalendarCheck size={20} />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider">XP Total Acumulado</span>
            <span className="text-3xl font-black text-amber-400 mt-1 block">{totalXp}</span>
          </div>
          <div className="w-12 h-12 bg-amber-950 text-amber-400 rounded-xl flex items-center justify-center">
            <FaTrophy size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid: Management Form & Employee Roster */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roster Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6 pb-2 border-b border-slate-800/80">
              Relação de Colaboradores
            </h3>
            
            {orgEmployees.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Nenhum colaborador vinculado a sua empresa ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800/60 font-bold uppercase text-[9px] tracking-wider">
                      <th className="pb-3">Nome</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3 text-center">Créditos</th>
                      <th className="pb-3 text-center">Nível</th>
                      <th className="pb-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {orgEmployees.map(emp => (
                      <tr key={emp.uid} className="text-slate-350 hover:bg-slate-850/20">
                        <td className="py-4 font-bold text-white">{emp.displayName || 'Convidado'}</td>
                        <td className="py-4">{emp.email}</td>
                        <td className="py-4 text-center font-extrabold text-emerald-400">{emp.corporateCredits || 0}</td>
                        <td className="py-4 text-center font-medium">Lvl {emp.level || 1} ({emp.xp || 0} XP)</td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => setEditingEmployee(emp)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                          >
                            Ajustar Créditos
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

        {/* Add Employee Form */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6 pb-2 border-b border-slate-800/80">
              Vincular Novo Colaborador
            </h3>
            
            <form onSubmit={handleRegisterEmployee} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@empresa.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Créditos de Aula Iniciais</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={initialCredits}
                  onChange={(e) => setInitialCredits(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <FaPlus size={10} />
                {registering ? 'Processando...' : 'Adicionar Colaborador'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Credit adjustment Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">
              Ajustar Créditos do Colaborador
            </h3>
            <p className="text-xs text-slate-450 mb-6">
              Colaborador: <strong>{editingEmployee.displayName || editingEmployee.email}</strong><br />
              Créditos atuais: <strong className="text-emerald-400">{editingEmployee.corporateCredits || 0}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Ajuste de Créditos (+/-)</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCreditAdjustment(prev => prev - 1)}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg text-lg font-bold flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-black min-w-[40px] text-center">
                    {creditAdjustment > 0 ? `+${creditAdjustment}` : creditAdjustment}
                  </span>
                  <button
                    onClick={() => setCreditAdjustment(prev => prev + 1)}
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg text-lg font-bold flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setEditingEmployee(null);
                    setCreditAdjustment(0);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateCredits}
                  disabled={updatingCredits}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {updatingCredits ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
