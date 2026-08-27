import React, { useState } from 'react';
import { 
  FaTimes, 
  FaGraduationCap, 
  FaMapMarkerAlt, 
  FaMicrophone, 
  FaGlobeAmericas, 
  FaLaptopCode, 
  FaBriefcase, 
  FaLightbulb, 
  FaCalendarAlt,
  FaAward,
  FaBookReader,
  FaCheckCircle,
  FaHeart,
  FaChartLine
} from 'react-icons/fa';

interface TutorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorProfileModal: React.FC<TutorProfileModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'methodology' | 'background'>('about');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Card wrapper */}
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Backgrounds */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors z-20"
          aria-label="Fechar"
        >
          <FaTimes size={16} />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-slate-800 shrink-0 bg-slate-900/90 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            <div 
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-cover bg-center border-2 border-blue-500 shadow-xl shrink-0" 
              style={{ backgroundImage: `url('/matt-profile.jpg')` }} 
            />
            <div className="text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                  Fundador & Tutor Nativo
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <FaMicrophone size={9} /> Nativo EUA (Boston, MA)
                </span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Professor Matt</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Especialista em Conversação Natural, Inglês para Carreira & Tecnologia e Redução de Sotaque
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-850 rounded-xl mt-5">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FaGlobeAmericas size={12} /> Sobre Mim
            </button>
            <button
              onClick={() => setActiveTab('methodology')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'methodology'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FaLightbulb size={12} /> Metodologia
            </button>
            <button
              onClick={() => setActiveTab('background')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'background'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FaGraduationCap size={12} /> Formação & Carreira
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs leading-relaxed text-slate-300">
          
          {/* TAB 1: SOBRE MIM & APRESENTAÇÃO */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Introduction */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>👋</span> Boas-vindas! É um grande prazer te conhecer
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Seja seu objetivo conversar com <strong className="text-white">fluência natural</strong>, aprimorar sua gramática ou falar com total segurança sobre <strong className="text-sky-300">tecnologia, negócios e ideias globais</strong>, estou aqui para te conduzir nessa jornada.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Minhas aulas são 100% práticas, envolventes e moldadas para a vida real — para que você termine cada sessão sentindo-se mais confiante e muito mais claro na sua pronúncia e articulação. Vamos tornar o aprendizado eficaz, relevante e prazeroso! 🚀
                </p>
              </div>

              {/* Bio Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🌍</span> Mente Curiosa & Perspectiva Global
                </h4>
                <p className="leading-relaxed">
                  Já viajei por mais de <strong className="text-white">13 países</strong>, morei em três e explorei diversas regiões dos EUA. Ao longo dessa trajetória, desenvolvi uma profunda apreciação por cultura, comunicação e como as ideias cruzam fronteiras.
                </p>
                <p className="leading-relaxed">
                  Profissional e pessoalmente, sou apaixonado por:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5">
                    <FaLaptopCode className="text-blue-400 mt-0.5 shrink-0" size={14} />
                    <span><strong className="text-white block">Tecnologia & Inovação</strong> IA Generativa, Agentes de IA, Nuvem AWS & GCP</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5">
                    <FaBookReader className="text-emerald-400 mt-0.5 shrink-0" size={14} />
                    <span><strong className="text-white block">Educação & Comunicação</strong> Fonética prática, ritmo e clareza de fala</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5">
                    <FaLightbulb className="text-amber-400 mt-0.5 shrink-0" size={14} />
                    <span><strong className="text-white block">Filosofia & Pensamento Crítico</strong> Estoicismo, ética e pensamento sistêmico</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5">
                    <FaBriefcase className="text-purple-400 mt-0.5 shrink-0" size={14} />
                    <span><strong className="text-white block">Negócios & Sociedade</strong> Políticas públicas, liderança e economia global</span>
                  </div>
                </div>
              </div>

              {/* Outside Classroom & Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FaGlobeAmericas className="text-blue-400" /> Idiomas
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    <li className="flex items-center justify-between">
                      <span>🇺🇸 Inglês</span>
                      <strong className="text-emerald-400">Nativo (Sotaque EUA)</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>🇧🇷 Português</span>
                      <strong className="text-sky-400">Fluente</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>🇪🇸 Espanhol</span>
                      <span className="text-slate-400">Básico</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FaHeart className="text-rose-400" /> Fora da Sala de Aula
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Mantenho uma rotina ativa 💪 (academia, artes marciais/boxe, trilhas e dias de praia no Rio 🏖️). Acredito que o aprendizado deve ser dinâmico e humano, nunca robótico.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: METODOLOGIA & ESPECIALIDADES */}
          {activeTab === 'methodology' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Teaching Style */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🎯</span> Estilo de Ensino & Metodologia 1:1
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Em aula, meu foco é no <strong className="text-white">aprendizado guiado</strong>, nas bases práticas da língua e em conexões contextuais para você absorver como o inglês funciona em conversas reais entre nativos.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Nossas sessões são essencialmente baseadas em <strong className="text-sky-300">conversação ativa</strong>, com flexibilidade total para calibrar correções de pronúncia, vocabulário corporativo ou temas específicos que você deseja destravar.
                </p>
              </div>

              {/* Preferred Levels */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Níveis de Alunos Atendidos
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Iniciante', level: 'Beginner', desc: 'Bases & Segurança' },
                    { label: 'Intermediário', level: 'Intermediate', desc: 'Destravar a fala' },
                    { label: 'Interm. Avançado', level: 'Upper Intermediate', desc: 'Fluência contínua' },
                    { label: 'Avançado', level: 'Advanced', desc: 'Negócios & Nuances' }
                  ].map((lvl, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-center">
                      <span className="text-[10px] font-bold text-blue-400 block uppercase">{lvl.level}</span>
                      <strong className="text-xs text-white block mt-0.5">{lvl.label}</strong>
                      <span className="text-[9px] text-slate-400 block mt-1">{lvl.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Habilidades & Focos de Treinamento
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    'Prática de Conversação Fluida',
                    'Redução de Sotaque & Fonética',
                    'Inglês para Negócios & Carreira',
                    'Inglês para Tecnologia & IA',
                    'Preparação para Entrevistas / Vagas',
                    'Preparação para IELTS / Vistos'
                  ].map((skill, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 flex items-center gap-2">
                      <FaCheckCircle className="text-emerald-400 shrink-0" size={13} />
                      <span className="text-slate-200 font-semibold">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industry Familiarity */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Familiaridade com Setores de Mercado
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    '💼 Negócios & Liderança',
                    '💻 Tecnologia & Desenvolvimento',
                    '💰 Finanças & Investimentos',
                    '🔧 Engenharia',
                    '📢 Setor Público & Políticas',
                    '⚖️ Direito & Governança',
                    '🏫 Educação & Pesquisa',
                    '🌱 Sustentabilidade & Meio Ambiente'
                  ].map((ind, idx) => (
                    <span key={idx} className="bg-slate-900 border border-slate-750 px-2.5 py-1 rounded-lg text-slate-300 font-medium">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FORMAÇÃO & CARREIRA */}
          {activeTab === 'background' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Certifications & Education */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FaGraduationCap className="text-blue-400" /> Formação Acadêmica & Certificações
                </h4>

                <div className="space-y-3">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-xs">Bachelor of Arts (BA) — Direito, Governança & Pesquisa</strong>
                      <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md">Graduação</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      Focado em governança, políticas públicas, relações internacionais e análise crítica, com forte ênfase em escrita acadêmica, pesquisa e compreensão de sistemas globais.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-xs">Pós-Graduação em Economia — University of Sydney</strong>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">Pós-Graduação (Austrália)</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      Estudos avançados em teoria econômica, desenvolvimento sustentável e mercados globais de capitais, com perspectiva internacional vivenciada no exterior.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-xs">Google Cloud Certified Professional Cloud Architect</strong>
                      <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md">Google Cloud</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      Especialização em arquitetura de nuvem, design de infraestrutura distribuída, escalabilidade, segurança e tecnologias modernas de dados.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-xs">Certificação Internacional TESOL / TEFL</strong>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">Ensino de Inglês</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      Metodologia pedagógica especializada para ensino de inglês como segundo idioma para estudantes adultos e profissionais executivos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FaBriefcase className="text-emerald-400" /> Experiência Profissional Multidisciplinar
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <strong className="text-white block">Programação & Engenharia de Software</strong>
                    <span className="text-[10px] text-blue-400 font-semibold block">Tecnologia • IT • DevOps</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Ampla experiência em desenvolvimento front-end, back-end, arquiteturas de microsserviços e soluções digitais modernas.
                    </p>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <strong className="text-white block">Planejador de Sustentabilidade</strong>
                    <span className="text-[10px] text-emerald-400 font-semibold block">ECO Action (Atlanta, GA) • Consultoria</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Análise, desenho e implementação de soluções sustentáveis e iniciativas energéticas renováveis.
                    </p>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <strong className="text-white block">Pesquisador Associado</strong>
                    <span className="text-[10px] text-amber-400 font-semibold block">Políticas Públicas & Governança</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Pesquisa com jurisprudência e estudos de caso para aprimorar políticas governamentais de inclusão sob o Americans With Disabilities Act.
                    </p>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <strong className="text-white block">Gestão Financeira & Mercado</strong>
                    <span className="text-[10px] text-purple-400 font-semibold block">Finanças • Câmbio & Criptoativos</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Experiência em operações de mercado de capitais, Forex, Bitcoin e ecossistemas financeiros internacionais.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row gap-2.5 items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            Fechar
          </button>

          <a
            href="/agenda"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 text-center"
          >
            <FaCalendarAlt size={13} /> Agendar Aula com Professor Matt
          </a>
        </div>
      </div>
    </div>
  );
};
