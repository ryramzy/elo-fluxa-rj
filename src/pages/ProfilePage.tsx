import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { updateUserProfile, db } from '../lib/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { FaUser, FaFire, FaTrophy, FaCalendarPlus, FaEdit, FaSave, FaGlobe, FaMapMarkerAlt, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useToast } from '../hooks/useToast';
import { useBookings } from '../hooks/useBookings';
import { TutorProfileModal } from '../components/profile/TutorProfileModal';
import { courses } from '../data/courses';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading } = useUserProfile(user?.uid || '');
  const { bookings, loading: bookingsLoading } = useBookings(user?.uid || '');
  const { showToast } = useToast();
  
  useDocumentTitle('Meu Perfil - ELO!');

  // While profile loads from Firestore, show skeleton (max 3 seconds)
  const [loadTimeout, setLoadTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoadTimeout(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [phone, setPhone] = useState('');
  const [hometown, setHometown] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);
  const [tutorModalOpen, setTutorModalOpen] = useState(false);
  
  // Account Deletion State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const consentCookie = document.cookie.split('; ').find(row => row.startsWith('elo_location_consent='));
      if (consentCookie) {
        setLocationConsent(true);
      }
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setBio(profile.bio || '');
      setTargetGoal(profile.targetGoal || '');
      setPhone(profile.phone || '');
      setHometown(profile.hometown || '');
      setCurrentLocation(profile.currentLocation || '');
    } else if (user) {
      setDisplayName(user.displayName || 'Estudante');
    }
  }, [profile, user]);

  const detectLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      showToast({ type: 'error', message: 'Geolocalização não suportada no seu navegador.' });
      return;
    }

    setDetecting(true);
    document.cookie = "elo_location_consent=true; max-age=31536000; path=/";
    setLocationConsent(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: { 'User-Agent': 'ELO-App/1.0 (eloingles.com.br)' }
          });
          const data = await res.json();
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.municipality || data.address.state_district || '';
            const state = data.address.state || '';
            const country = data.address.country || '';
            const locationStr = [city, state, country].filter(Boolean).join(', ');
            setCurrentLocation(locationStr);
            showToast({ type: 'success', message: `Localização detectada: ${locationStr}` });
          }
        } catch (err) {
          console.error(err);
          showToast({ type: 'error', message: 'Não foi possível identificar a cidade automaticamente.' });
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        setDetecting(false);
        showToast({ type: 'error', message: 'Permissão de localização negada ou indisponível.' });
      },
      { timeout: 10000 }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName,
        bio,
        targetGoal,
        phone,
        hometown,
        currentLocation
      });
      setIsEditing(false);
      showToast({ type: 'success', message: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      console.error(err);
      showToast({ type: 'error', message: 'Erro ao salvar perfil: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || confirmText.toUpperCase() !== 'EXCLUIR') return;
    setDeletingAccount(true);
    try {
      // 1. Delete Firestore user document
      await deleteDoc(doc(db, 'users', user.uid));

      // 2. Delete Auth user account
      const authUser = user as any;
      if (typeof authUser.delete === 'function') {
        await deleteUser(authUser);
      }

      showToast({ type: 'success', message: 'Sua conta e dados foram excluídos com sucesso.' });
      await signOut();
      navigate('/');
    } catch (err: any) {
      console.error('Delete account error:', err);
      if (err.code === 'auth/requires-recent-login') {
        showToast({ 
          type: 'error', 
          message: 'Por segurança, faça login novamente antes de excluir sua conta.' 
        });
      } else {
        showToast({ type: 'error', message: 'Erro ao excluir conta: ' + err.message });
      }
    } finally {
      setDeletingAccount(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading && !loadTimeout) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-3 w-full text-center sm:text-left">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-48 mx-auto sm:mx-0" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-64 mx-auto sm:mx-0" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-32 mx-auto sm:mx-0" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
          <div className="h-28 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
          <div className="h-28 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
        </div>
      </div>
    );
  }

  const effectiveProfile = profile || {
    displayName: user?.displayName || 'Estudante',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
    xp: 0,
    level: 1,
    levelName: 'Iniciante',
    streakDays: 0,
    badgesEarned: [],
    role: 'student',
    plan: 'free',
    bio: '',
    targetGoal: '',
    currentLocation: '',
  };

  const POPULAR_GOALS = [
    'Conversação e fluência',
    'Inglês para Carreira & Tech 💻',
    'Entrevistas / Vaga Internacional 🇺🇸',
    'Pronúncia & Sotaque Americano 🗣️',
    'Viagens & Morar Fora ✈️',
    'Negócios & Apresentações 💼'
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    } else if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    } else if (raw.length > 0) {
      formatted = `(${raw}`;
    }
    setPhone(formatted);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setBio(profile.bio || '');
      setTargetGoal(profile.targetGoal || '');
      setPhone(profile.phone || '');
      setHometown(profile.hometown || '');
      setCurrentLocation(profile.currentLocation || '');
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-md rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            {effectiveProfile.photoURL ? (
              <img
                src={effectiveProfile.photoURL}
                alt={effectiveProfile.displayName}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                {effectiveProfile.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {effectiveProfile.displayName || 'Estudante'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{effectiveProfile.email}</p>
                {effectiveProfile.currentLocation && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <FaMapMarkerAlt /> {effectiveProfile.currentLocation}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <FaEdit /> Editar Perfil
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                    >
                      <FaSave /> {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Fields Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-md rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Informações Pessoais & Metas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personalize seus objetivos de aprendizado e dados de contato.
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FaEdit /> Editar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30"
              >
                <FaSave /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Nome de Exibição
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome completo"
                  maxLength={80}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              ) : (
                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium py-1">
                  {displayName || 'Não informado'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                WhatsApp / Telefone
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(21) 99999-9999"
                    maxLength={16}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Usado para receber lembretes e avisos das suas aulas no WhatsApp</span>
                </div>
              ) : (
                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium py-1">
                  {phone || <em className="text-slate-400">Não informado (usado para lembretes de aula)</em>}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Principal Objetivo com Inglês
              </label>
              {isEditing ? (
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(e.target.value)}
                    placeholder="Ex: Destravar fala para reuniões internacionais"
                    maxLength={120}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {POPULAR_GOALS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setTargetGoal(goal)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                          targetGoal === goal
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium py-1">
                  {targetGoal || 'Conversação e fluência'}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Localização / Cidade
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="Ex: Rio de Janeiro, RJ"
                    maxLength={100}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    disabled={detecting}
                    onClick={detectLocation}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex-shrink-0 flex items-center gap-1"
                    title="Detectar cidade automaticamente via GPS"
                  >
                    <FaMapMarkerAlt /> {detecting ? 'Buscando...' : 'GPS'}
                  </button>
                </div>
              ) : (
                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium py-1">
                  {currentLocation || 'Não informada'}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sobre Mim (Biografia)
              </label>
              {isEditing && (
                <span className="text-[10px] text-slate-400">{bio.length}/500</span>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm resize-none"
                placeholder="Fale um pouco sobre você e seus interesses para os professores..."
              />
            ) : (
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed py-1">
                {bio || <em className="text-slate-400">Nenhuma biografia adicionada.</em>}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-600/30"
              >
                <FaSave /> {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Badges Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-md rounded-3xl p-6 sm:p-8 mt-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          Conquistas & Emblemas 🏆
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {courses.map(course => {
            const hasBadge = profile?.badgesEarned?.includes(course.id);
            return (
              <div 
                key={course.id} 
                className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
                  hasBadge 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-850 dark:text-slate-200' 
                    : 'bg-slate-50/50 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 relative ${
                  hasBadge 
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-500/35' 
                    : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                }`}>
                  <span>{course.emoji}</span>
                </div>
                <span className="text-[10px] font-black tracking-tight line-clamp-2 uppercase">
                  {course.titlePt || course.title}
                </span>
                <span className="text-[8px] font-bold text-slate-500 mt-1 uppercase">
                  {hasBadge ? 'Concluído' : 'Bloqueado'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teacher Feedback & Class Notes (3rd Core Pillar) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-md rounded-3xl p-6 sm:p-8 mt-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📝</span> Notas de Aula & Feedback do Professor Matt
            </h2>
            <p className="text-xs text-slate-500 mt-1">Acompanhe seu progresso de conversação, correções de pronúncia e tarefas práticas.</p>
          </div>
          <a
            href="/agenda"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            <span>🗓️</span> Agendar Próxima Aula
          </a>
        </div>

        {bookings.filter(b => b.status === 'confirmed' || (b as any).tutorNotes).length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/60">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum feedback de aula registrado ainda.</p>
            <p className="text-xs text-slate-500 mt-1">Após sua aula ao vivo no Zoom com o Professor Matt, você receberá aqui suas anotações personalizadas.</p>
            <a
              href="/agenda"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              <span>🗓️</span> Agendar Minha Primeira Aula
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings
              .filter(b => b.status === 'confirmed' || (b as any).tutorNotes)
              .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
              .slice(0, 10)
              .map((b) => {
                const notes = (b as any).tutorNotes;
                return (
                  <div 
                    key={b.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 hover:border-blue-500/40 transition-all shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${notes ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></span>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Aula de {b.date.split('-').reverse().join('/')} às {b.time}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                          {b.tutorName || 'Professor Matt'}
                        </span>
                        {notes?.attendance && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            notes.attendance === 'present' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}>
                            {notes.attendance === 'present' ? '✓ Presente' : 'Ausente'}
                          </span>
                        )}
                        {notes?.studentRating && (
                          <span className="text-[10px] text-amber-400 font-bold">
                            {'★'.repeat(notes.studentRating)}{'☆'.repeat(5 - notes.studentRating)}
                          </span>
                        )}
                      </div>
                      <a
                        href="/classroom"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>📹</span> Sala de Aula →
                      </a>
                    </div>

                    {notes ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        {notes.pronunciation && (
                          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
                            <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">🗣️ Pronúncia & Connected Speech:</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{notes.pronunciation}</p>
                          </div>
                        )}
                        {notes.vocabulary && (
                          <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5">
                            <span className="font-bold text-blue-800 dark:text-blue-300 block mb-1">📚 Vocabulário & Expressões:</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{notes.vocabulary}</p>
                          </div>
                        )}
                        {notes.homework && (
                          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 md:col-span-2">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">📝 Tarefa / Prática Recomendada:</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{notes.homework}</p>
                          </div>
                        )}
                        {notes.summary && (
                          <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 rounded-xl p-3.5 md:col-span-2">
                            <span className="font-bold text-purple-800 dark:text-purple-300 block mb-1">💡 Resumo da Conversação:</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{notes.summary}</p>
                          </div>
                        )}
                        {notes.nextGoal && (
                          <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 md:col-span-2">
                            <span className="font-bold text-indigo-800 dark:text-indigo-300 block mb-1">🎯 Objetivo da Próxima Sessão:</span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{notes.nextGoal}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                        <p className="text-slate-500 italic">
                          Aula agendada. As notas e correções do professor estarão visíveis aqui após o término da sessão.
                        </p>
                        <a
                          href="/classroom"
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all shrink-0 ml-2"
                        >
                          Entrar
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Flagship Teacher Section */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950/20 border border-slate-800/80 shadow-lg rounded-3xl p-6 sm:p-8 mt-8 relative overflow-hidden text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img 
              src="/matt-profile.jpg" 
              alt="Professor Matt" 
              className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow-md"
            />
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-white font-serif">Seu Professor Principal</h3>
              <p className="text-xs text-slate-400 mt-0.5">Professor Matt • Nativo EUA • Rio de Janeiro</p>
            </div>
          </div>
          <button
            onClick={() => setTutorModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 shadow-md shadow-blue-900/10"
          >
            Ver Perfil do Professor
          </button>
        </div>
      </div>

      {/* Danger Zone: Account Deletion (Apple App Store Mandatory) */}
      <div className="border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl p-6 sm:p-8 mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <FaExclamationTriangle /> Zona de Perigo — Exclusão de Conta
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Ao excluir sua conta, todos os seus dados de progresso, XP e histórico de aulas serão apagados permanentemente conforme as normas da LGPD.
            </p>
          </div>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center gap-2 flex-shrink-0"
          >
            <FaTrashAlt /> Excluir Conta
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center text-xl mx-auto">
              <FaTrashAlt />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-black text-white">Tem certeza absoluta?</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Esta ação é irreversível. Seu histórico, XP e dados serão permanentemente excluídos.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Digite <strong>EXCLUIR</strong> para confirmar:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="EXCLUIR"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-rose-500 uppercase tracking-widest text-center font-bold"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirmText.toUpperCase() !== 'EXCLUIR' || deletingAccount}
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30"
              >
                {deletingAccount ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TutorProfileModal
        isOpen={tutorModalOpen}
        onClose={() => setTutorModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
