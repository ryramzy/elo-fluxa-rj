import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { FaShieldAlt, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { DOMAIN_NAME } from '../../constants';

export default function PrivacyPolicy() {
  useDocumentTitle('Política de Privacidade — ELO!');

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
            <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center text-2xl">
              <FaShieldAlt />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Política de Privacidade</h1>
              <p className="text-xs text-slate-400 mt-1">Última atualização: Agosto de 2026 • Em conformidade com a LGPD (Lei 13.709/2018)</p>
            </div>
          </div>

          <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-xl font-bold text-white">1. Visão Geral</h2>
            <p>
              A <strong>ELO!</strong> ({DOMAIN_NAME}) está comprometida em proteger a sua privacidade e os seus dados pessoais. Esta Política de Privacidade explica como coletamos, utilizamos, armazenamos e compartilhamos suas informações ao utilizar nossa plataforma web e aplicativos móveis.
            </p>
          </section>

          <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-xl font-bold text-white">2. Dados Coletados</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dados de Cadastro:</strong> Nome, endereço de email e foto de perfil (fornecidos diretamente ou via autenticação Google).</li>
              <li><strong>Dados de Aprendizado:</strong> Progresso nas lições, pontuação de XP, objetivos de estudo, nível de proficiência e histórico de agendamento de aulas.</li>
              <li><strong>Dados de Pagamento:</strong> Processados de forma criptografada por parceiros certificados (Stripe e Mercado Pago). Não armazenamos números de cartão de crédito.</li>
            </ul>
          </section>

          <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-xl font-bold text-white">3. Finalidade do Tratamento de Dados</h2>
            <p>
              Utilizamos seus dados para:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Fornecer acesso aos cursos e gerenciar suas aulas particulares ao vivo no Zoom.</li>
              <li>Personalizar suas recomendações de estudo e registrar seu progresso de fluência.</li>
              <li>Enviar confirmações e lembretes de aulas por email e WhatsApp.</li>
              <li>Melhorar o desempenho técnico e a segurança da nossa plataforma.</li>
            </ul>
          </section>

          <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-xl font-bold text-white">4. Seus Direitos (LGPD) e Exclusão de Conta</h2>
            <p>
              Você tem total controle sobre seus dados pessoais. A qualquer momento, você pode:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Acessar, atualizar ou retificar suas informações no seu Painel de Perfil.</li>
              <li><strong>Excluir sua conta e dados:</strong> Diretamente na aba de Perfil ou entrando em contato conosco. Ao solicitar a exclusão, todos os seus dados pessoais, histórico de aulas e progresso serão permanentemente removidos.</li>
            </ul>
          </section>

          <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-xl font-bold text-white">5. Contato do Encarregado de Dados</h2>
            <p>
              Para dúvidas sobre privacidade ou solicitações de titulares de dados, envie um email para:
            </p>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center gap-3 text-blue-300">
              <FaEnvelope />
              <span>contato@{DOMAIN_NAME}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
