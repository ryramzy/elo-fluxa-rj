import React, { useState, useEffect } from 'react';
import { getTutors, saveTutor } from '../../lib/firestore';
import { useToast } from '../../hooks/useToast';
import { LuPlus, LuVideo, LuCheck, LuUser, LuMail } from 'react-icons/lu';

interface TutorItem {
  id: string;
  name: string;
  email: string;
  zoomUrl: string;
  bio?: string;
  active: boolean;
}

export const TutorManagementPanel: React.FC = () => {
  const { showToast } = useToast();
  const [tutors, setTutors] = useState<TutorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [editingTutorId, setEditingTutorId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [zoomUrl, setZoomUrl] = useState('');
  const [bio, setBio] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadRoster();
  }, []);

  const loadRoster = async () => {
    setLoading(true);
    try {
      const list = await getTutors();
      setTutors(list);
    } catch (err: any) {
      console.error('Error loading tutors roster:', err);
      showToast({ type: 'error', message: 'Erro ao carregar lista de tutores.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tutor: TutorItem) => {
    setEditingTutorId(tutor.id);
    setName(tutor.name);
    setEmail(tutor.email);
    setZoomUrl(tutor.zoomUrl || 'https://zoom.us/j/mramsay0');
    setBio(tutor.bio || '');
    setActive(tutor.active !== false);
  };

  const handleResetForm = () => {
    setEditingTutorId(null);
    setName('');
    setEmail('');
    setZoomUrl('https://zoom.us/j/mramsay0');
    setBio('');
    setActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !zoomUrl) {
      showToast({ type: 'error', message: 'Preencha nome, e-mail e URL do Zoom!' });
      return;
    }

    setSaving(true);
    try {
      await saveTutor({
        id: editingTutorId || undefined,
        name,
        email,
        zoomUrl,
        bio,
        active
      });
      showToast({ type: 'success', message: `Tutor ${name} salvo com sucesso!` });
      handleResetForm();
      await loadRoster();
    } catch (err: any) {
      console.error('Error saving tutor:', err);
      showToast({ type: 'error', message: err.message || 'Erro ao salvar tutor.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            <LuVideo className="w-4 h-4 text-blue-400" />
            <span>GCP Multi-Tutor Zoom Architecture</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gestão de Tutores & Links do Zoom</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Cadastre e gerencie a equipe de professores. Cada tutor possui seu próprio link de sala do Zoom e disponibilidade na plataforma ELO!.
          </p>
        </div>
        <button
          onClick={handleResetForm}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <LuPlus className="w-4 h-4" /> Novo Tutor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
          <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-slate-800">
            {editingTutorId ? 'Editar Tutor' : 'Cadastrar Novo Tutor'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nome Completo do Tutor
              </label>
              <div className="relative">
                <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Matthew Ramsay"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                E-mail de Contato / GCP Auth
              </label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mramsay0@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Link da Sala Pessoal do Zoom
              </label>
              <div className="relative">
                <LuVideo className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="url"
                  value={zoomUrl}
                  onChange={(e) => setZoomUrl(e.target.value)}
                  placeholder="https://zoom.us/j/mramsay0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Link fornecido aos alunos no agendamento e nas notificações por e-mail.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Biografia / Sotaque / Especialidade
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Professor nativo americano. Especialista em Business English e TI..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="activeTutor"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="activeTutor" className="text-xs font-semibold text-slate-300">
                Tutor Ativo na Plataforma (Recebe Agendamentos)
              </label>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <LuCheck className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Tutor'}
              </button>
              {editingTutorId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tutors List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Equipe de Tutores Cadastrados</span>
              <span className="text-xs font-semibold text-slate-500">{tutors.length} tutor(es)</span>
            </h3>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Carregando tutores...
              </div>
            ) : tutors.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Nenhum tutor cadastrado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{tutor.name}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          tutor.active !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {tutor.active !== false ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{tutor.email}</p>
                      <a
                        href={tutor.zoomUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <LuVideo className="w-3.5 h-3.5" /> {tutor.zoomUrl}
                      </a>
                      {tutor.bio && (
                        <p className="text-xs text-slate-500 mt-1 italic">"{tutor.bio}"</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleEdit(tutor)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700/60 shrink-0 self-start sm:self-auto"
                    >
                      Editar Dados
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
