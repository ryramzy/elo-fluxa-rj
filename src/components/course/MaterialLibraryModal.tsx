import React, { useState } from 'react';
import { LuX, LuFileText, LuDownload, LuExternalLink, LuSearch, LuBookOpen } from 'react-icons/lu';

interface LibraryResource {
  id: string;
  title: string;
  category: 'Gramática' | 'Vocabulário' | 'Exercícios' | 'PDF Open English' | 'Guia de Conversação';
  description: string;
  fileUrl: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos';
}

const DEFAULT_RESOURCES: LibraryResource[] = [
  {
    id: '1',
    title: 'Guia Definitivo de Verbos Irregulares em Inglês',
    category: 'Gramática',
    description: 'Tabela completa dos 100 verbos mais usados com pronúncia e exemplos de frases no passado.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    level: 'Todos'
  },
  {
    id: '2',
    title: 'Open English Lesson Pack - Business Presentations & Meetings',
    category: 'PDF Open English',
    description: 'Material complementar de apresentações corporativas, vocabulário de reuniões e negociação.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    level: 'Intermediário'
  },
  {
    id: '3',
    title: 'Phrasal Verbs Mais Usados no Dia a Dia Americano',
    category: 'Vocabulário',
    description: '50 phrasal verbs essenciais explicados em português com frases do cotidiano nos EUA.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    level: 'Iniciante'
  },
  {
    id: '4',
    title: 'Open English Slide Deck - Pronunciation & Reduction Patterns',
    category: 'PDF Open English',
    description: 'Slides de redução fonética e conectividade ("wonna", "gonna", "coulda") para destravar a fala.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    level: 'Todos'
  },
  {
    id: '5',
    title: 'Cheat Sheet: Small Talk & Networking em Inglês',
    category: 'Guia de Conversação',
    description: 'Frases prontas para iniciar e manter conversas em eventos profissionais e viagens.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    level: 'Intermediário'
  }
];

interface MaterialLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaterialLibraryModal: React.FC<MaterialLibraryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activePdf, setActivePdf] = useState<LibraryResource | null>(null);

  if (!isOpen) return null;

  const categories = ['Todos', 'PDF Open English', 'Gramática', 'Vocabulário', 'Guia de Conversação'];

  const filteredResources = DEFAULT_RESOURCES.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 pb-[env(safe-area-inset-bottom)]">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <LuBookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Biblioteca de Materiais & PDFs</h3>
              <p className="text-xs text-slate-400">Acesse apostilas, materiais da Open English e guias durante as aulas ao vivo.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 sm:p-6 border-b border-slate-800/60 bg-slate-950/40 space-y-3">
          <div className="relative">
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar materiais, tópicos ou PDFs da Open English..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all shrink-0 border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content View: PDF Reader or Resource List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activePdf ? (
            <div className="h-full flex flex-col space-y-4">
              <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-xs font-bold">📄 {activePdf.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={activePdf.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <LuExternalLink size={12} /> Abrir em Nova Aba
                  </a>
                  <button
                    onClick={() => setActivePdf(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Voltar à Lista
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-[400px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative">
                <iframe
                  src={activePdf.fileUrl}
                  className="w-full h-full min-h-[420px]"
                  title={activePdf.title}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredResources.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-500 text-xs font-medium">
                  Nenhum material encontrado para esta busca.
                </div>
              ) : (
                filteredResources.map(resource => (
                  <div
                    key={resource.id}
                    className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {resource.category}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Nível: {resource.level}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2">
                        {resource.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                        {resource.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-850">
                      <button
                        onClick={() => setActivePdf(resource)}
                        className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <LuFileText size={14} /> Visualizar
                      </button>
                      <a
                        href={resource.fileUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/50 transition-all"
                        title="Baixar PDF"
                      >
                        <LuDownload size={14} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
