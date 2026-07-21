import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { updateUserProfile } from '../lib/firestore';
import { FaUser, FaFire, FaTrophy, FaCalendarPlus, FaEdit, FaSave, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';
import { useToast } from '../hooks/useToast';
import { TutorProfileModal } from '../components/profile/TutorProfileModal';
import { courses } from '../data/courses';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile(user?.uid || '');
  const { showToast } = useToast();
  
  useDocumentTitle('Meu Perfil - Elo');

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
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setTargetGoal(profile.targetGoal || '');
      setPhone(profile.phone || '');
      setHometown(profile.hometown || '');
      setCurrentLocation(profile.currentLocation || '');
    }
  }, [profile]);

  const detectLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      showToast({ type: 'error', message: 'Geolocalização não suportada no seu navegador.' });
      return;
    }

    setDetecting(true);

    // Save location consent cookie (valid for 1 year)
    document.cookie = "elo_location_consent=true; max-age=31536000; path=/";
    setLocationConsent(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // OpenStreetMap Nominatim Reverse API with app User-Agent header (required for compliant traffic identification)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: {
              'User-Agent': 'ELO-App/1.0 (elospeak.com.br)'
            }
          });

          if (!res.ok) {
            throw new Error(`Nominatim query returned status: ${res.status}`);
          }

          const data = await res.json();
          const address = data.address || {};
          const city = address.city || address.town || address.village || address.state || '';
          const country = address.country || '';

          if (city || country) {
            const formatted = [city, country].filter(Boolean).join(', ');
            setCurrentLocation(formatted);
            showToast({ type: 'success', message: `Localização detectada: ${formatted}` });
          } else {
            showToast({ type: 'error', message: 'Não foi possível identificar a cidade.' });
          }
        } catch (err: any) {
          console.error('[Profile Geolocation] Fetch error:', err);
          showToast({ type: 'error', message: 'Falha ao conectar com o serviço de geolocalização.' });
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.error('[Profile Geolocation] Permission error:', error);
        showToast({ type: 'error', message: 'Acesso à localização negado pelo navegador.' });
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

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
        hometown,
        currentLocation
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

          {/* Hometown / Cidade Natal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Cidade Natal / Hometown
            </label>
            {isEditing ? (
              <input
                type="text"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                placeholder="Ex: São Paulo, SP"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            ) : (
              <p className="text-slate-800 dark:text-slate-200 font-medium py-1">{hometown || <em className="text-slate-400">Não configurado</em>}</p>
            )}
          </div>

          {/* Current Location / Localização Atual */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Localização Atual
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-250">
                  {currentLocation || <em className="text-slate-400 dark:text-slate-500">Não detectada</em>}
                </span>
                {isEditing && (
                  <button
                    type="button"
                    disabled={detecting}
                    onClick={detectLocation}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 disabled:opacity-50 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-600"
                  >
                    <FaMapMarkerAlt /> {detecting ? 'Detectando...' : 'Detectar Localização'}
                  </button>
                )}
              </div>
              {isEditing && (
                <p className="text-[10px] text-slate-500 leading-normal max-w-lg mt-1 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                  💡 <strong>Nota sobre LGPD:</strong> Ao clicar em "Detectar Localização", você autoriza o ELO! a processar temporariamente sua geolocalização no navegador para identificar sua cidade/país. As informações só serão salvas no banco de dados quando você clicar em "Salvar".
                </p>
              )}
            </div>
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

      {/* Badges and Achievements Display */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-md rounded-3xl p-6 sm:p-8 mt-8">
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          Conquistas & Emblemas 🏆
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
          {courses.map(course => {
            const hasBadge = profile?.badgesEarned?.includes(course.id);
            return (
              <div 
                key={course.id} 
                className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 ${
                  hasBadge 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-850 dark:text-slate-200' 
                    : 'bg-slate-50/50 border-slate-100 dark:bg-slate-900/10 dark:border-slate-800 text-slate-400 opacity-60'
                }`}
                title={course.title}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 relative shadow-inner ${
                  hasBadge 
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-500/35 animate-in fade-in zoom-in duration-500' 
                    : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                }`}>
                  <span>{course.emoji}</span>
                  {!hasBadge && (
                    <span className="absolute -bottom-1 -right-1 bg-slate-700 text-white rounded-full p-1 border border-white dark:border-slate-800 text-[8px]">
                      🔒
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-black tracking-tight line-clamp-2 uppercase">
                  {course.titlePt || course.title}
                </span>
                <span className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  {hasBadge ? 'Concluído' : 'Bloqueado'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meet your Tutor Section */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950/20 border border-slate-800/80 shadow-lg rounded-3xl p-6 sm:p-8 mt-8 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cover bg-center border border-white/10" style={{ backgroundImage: `url('/bobby.jpg')` }} />
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-white font-serif">Seu Professor Particular</h3>
              <p className="text-xs text-slate-400 mt-0.5">Matthew Ramsay (Boston, MA) • TEFL Certified</p>
            </div>
          </div>
          <button
            onClick={() => setTutorModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 shadow-md shadow-blue-900/10"
          >
            Ver Perfil do Tutor
          </button>
        </div>
      </div>

      <TutorProfileModal
        isOpen={tutorModalOpen}
        onClose={() => setTutorModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
