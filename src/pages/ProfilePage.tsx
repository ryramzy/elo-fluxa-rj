import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { updateUserProfile } from '../lib/firestore';
import { FaUser, FaFire, FaTrophy, FaCalendarPlus, FaEdit, FaSave } from 'react-icons/fa';
import { useToast } from '../hooks/useToast';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile(user?.uid || '');
  const { showToast } = useToast();
  
  useDocumentTitle('Meu Perfil - Elo');

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setTargetGoal(profile.targetGoal || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Nenhum perfil de usuário encontrado.</div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName,
        bio,
        targetGoal,
        phone,
      });
      setIsEditing(false);
      showToast({ type: 'success', message: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      console.error('Error saving profile:', err);
      showToast({ type: 'error', message: 'Falha ao atualizar o perfil.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Profile Info Card */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-8 mb-8 text-white">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Avatar container */}
          <div className="relative group">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt="Avatar"
                className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-serif font-bold shadow-lg border-4 border-blue-500">
                {displayName.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-2 text-xs shadow-md border border-slate-900">
              <span className="font-bold uppercase tracking-wider px-1 text-[9px]">{profile.role}</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold font-serif mb-2 tracking-tight">
              {profile.displayName || 'Estudante Elo'}
            </h1>
            <p className="text-slate-400 text-sm mb-4 font-light">{profile.email}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-blue-400 font-semibold tracking-wider uppercase">
                Nível {profile.level}: {profile.levelName}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-emerald-400 font-semibold tracking-wider uppercase">
                Plano: {profile.plan || 'Free'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Streak Days */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-md rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="p-4 rounded-xl bg-orange-100 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400">
            <FaFire className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Ofensiva</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-serif">{profile.streakDays || 0} dias</p>
          </div>
        </div>

        {/* Total XP */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-md rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <FaTrophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Total XP</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-serif">{profile.xp || 0} XP</p>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-md rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
            <FaCalendarPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Conquistas</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white font-serif">{profile.badgesEarned?.length || 0} Emblemas</p>
          </div>
        </div>
      </div>

      {/* Profile Editing Form */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-md rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Detalhes do Perfil</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <FaEdit /> Editar
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
              >
                <FaSave /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Nome de Exibição
            </label>
            {isEditing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            ) : (
              <p className="text-slate-800 dark:text-slate-200 font-medium py-1">{displayName || <em className="text-slate-400">Não configurado</em>}</p>
            )}
          </div>

          {/* WhatsApp / Telefone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              WhatsApp / Telefone
            </label>
            {isEditing ? (
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(21) 99999-9999"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            ) : (
              <p className="text-slate-800 dark:text-slate-200 font-medium py-1">{phone || <em className="text-slate-400">Não configurado</em>}</p>
            )}
          </div>

          {/* Goal target */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Objetivo no Inglês
            </label>
            {isEditing ? (
              <select
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="">Selecione um objetivo</option>
                <option value="Conversação Fluente">Conversação Fluente</option>
                <option value="Inglês para Negócios">Inglês para Negócios</option>
                <option value="Preparação para Viagem">Preparação para Viagem</option>
                <option value="Cultura Americana">Aprender sobre Cultura Americana</option>
                <option value="Entrevista de Emprego">Preparação para Entrevistas</option>
              </select>
            ) : (
              <p className="text-slate-800 dark:text-slate-200 font-medium py-1">{targetGoal || <em className="text-slate-400">Não selecionado</em>}</p>
            )}
          </div>

          {/* Biography */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Biografia / Sobre mim
            </label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                placeholder="Fale um pouco sobre você e seus interesses no aprendizado..."
              />
            ) : (
              <p className="text-slate-800 dark:text-slate-200 font-light leading-relaxed whitespace-pre-wrap py-1">
                {bio || <em className="text-slate-400">Escreva uma breve biografia para que seu tutor possa conhecê-lo melhor.</em>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
