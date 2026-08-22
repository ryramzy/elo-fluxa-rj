import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { FaFileContract, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { DOMAIN_NAME } from '../../constants';

export default function TermsOfService() {
  useDocumentTitle('Termos de Uso — ELO!');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-xs uppercase tracking-wider mb-8 transition-colors"
        >
          <FaArrowLeft /> Voltar para o início
        </Link>

        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="flex items-center gap-4 border-b border-slate-700 pb-6">
            <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl">
              <FaFileContract />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Termos de Uso</h1>
              <p className="text-xs text-slate-400 mt-1">Última atualização: Agosto de 2026</p>
            </div>
          </div>

          <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-xl font-bold text-white">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma <strong>ELO!</strong> ({DOMAIN_NAME}), você concorda integralmente com estes Termos de Uso. Caso não concorde com alguma disposição, recomendamos não utilizar os nossos serviços.
            </p>
          </section>

          <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-xl font-bold text-white">2. Serviços e Aulas ao Vivo</h2>
            <p>
              A ELO! oferece uma plataforma de aprendizado de inglês americano com cursos interativos e aulas particulares ao vivo 1:1 via Zoom com professores nativos.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Agendamento:</strong> O aluno pode selecionar horários disponíveis na agenda online.</li>
              <li><strong>Cancelamento e Remarcação:</strong> Para não perder créditos de aula, cancelamentos ou remarcações devem ser feitos com no mínimo 2 horas de antecedência.</li>
              <li><strong>Pontualidade:</strong> O professor aguardará até 10 minutos após o início do horário agendado.</li>
            </ul>
          </section>

          <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-xl font-bold text-white">3. Assinaturas e Pagamentos</h2>
            <p>
              Os planos de assinatura (Mensal e Trimestral) são cobrados de forma recorrente e renovados automaticamente até que o usuário solicite o cancelamento. O cancelamento pode ser feito a qualquer momento sem cobrança de multas para ciclos futuros.
            </p>
          </section>

          <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-xl font-bold text-white">4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo didático, decks de slides, métodos pedagógicos, marcas e logotipos pertencem exclusivamente à ELO! e são protegidos pelas leis de direitos autorais.
            </p>
          </section>

          <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-xl font-bold text-white">5. Contato e Suporte</h2>
            <p>
              Em caso de dúvidas sobre nossos termos ou serviços:
            </p>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center gap-3 text-indigo-300">
              <FaEnvelope />
              <span>suporte@{DOMAIN_NAME}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
