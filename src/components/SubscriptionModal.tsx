import React, { useState } from 'react';
import { LuCheck, LuX, LuSparkles, LuFlame, LuQrCode, LuCreditCard } from 'react-icons/lu';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import CheckoutForm from './CheckoutForm';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect: (plan: string) => void;
}

export default function SubscriptionModal({ isOpen, onClose, onPlanSelect }: SubscriptionModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<'starter' | 'weekly' | 'biweekly' | 'pro' | 'elite' | null>(null);
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(400);
  const [stripeLoading, setStripeLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlanClick = (plan: 'starter' | 'weekly' | 'biweekly', price: number) => {
    if (plan === 'starter') {
      onPlanSelect(plan);
      onClose();
    } else {
      setSelectedPlanForCheckout(plan);
      setSelectedPlanPrice(price);
    }
  };

  const handleStripeCheckout = async (plan: 'weekly' | 'biweekly', price: number) => {
    if (!user) {
      showToast('Por favor, faça login para assinar um plano.', 'info');
      return;
    }

    setStripeLoading(plan);
    try {
      console.log(`[Stripe Checkout] Requesting checkout url for plan: ${plan} (R$ ${price})`);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan,
          price,
          email: user.email || '',
          userId: user.uid
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao iniciar checkout Stripe.');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Nenhuma URL de checkout retornada.');
      }
    } catch (err: any) {
      console.error('[Stripe Checkout Error]:', err);
      showToast(err.message || 'Erro ao processar transação no cartão. Tente novamente.', 'error');
    } finally {
      setStripeLoading(null);
    }
  };

  const handleCheckoutSuccess = () => {
    if (selectedPlanForCheckout) {
      onPlanSelect(selectedPlanForCheckout);
    }
    setSelectedPlanForCheckout(null);
    onClose();
  };

  // Render Checkout Form inside Modal if a plan is chosen
  if (selectedPlanForCheckout) {
    return (
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl shadow-blue-500/5 max-w-md w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setSelectedPlanForCheckout(null)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all z-10"
            aria-label="Voltar para planos"
          >
            <LuX size={18} />
          </button>
          
          <CheckoutForm 
            plan={selectedPlanForCheckout} 
            price={selectedPlanPrice} 
            onSuccess={handleCheckoutSuccess}
            onCancel={() => setSelectedPlanForCheckout(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal content */}
        <div 
          className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl shadow-blue-500/5 max-w-5xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            aria-label="Close"
          >
            <LuX size={18} />
          </button>

          {/* Modal header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold mb-3">
              <LuSparkles size={12} /> Planos de Aprendizado
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
              Escolha seu Ritmo de Aulas
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              Aulas particulares 1:1 no Zoom com o Professor Matt + Acesso ilimitado a todos os cursos e materiais.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Starter Plan */}
            <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 hover:border-slate-800 transition-all flex flex-col justify-between">
              <div>
                <div className="text-center mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
                    Explorador
                  </span>
                  <div className="text-2xl font-extrabold text-white mt-4 mb-1">
                    Grátis <span className="text-xs font-normal text-slate-500">/ para sempre</span>
                  </div>
                  <p className="text-xs text-slate-400">Experimente o método sem compromisso</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-blue-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <span>Primeira aula de cada curso 100% aberta</span>
                  </li>
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-blue-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <span>Acesso a materiais e exercícios interativos</span>
                  </li>
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-blue-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <span>Sem necessidade de cartão de crédito</span>
                  </li>
                </ul>
              </div>
              
              <button
                onClick={() => handlePlanClick('starter', 0)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700"
              >
                Começar de graça
              </button>
            </div>

            {/* Weekly Plan (1x/week) */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="text-center mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded">
                    Plano Semanal
                  </span>
                  <div className="text-2xl font-extrabold text-white mt-4 mb-1">
                    R$ 400 <span className="text-xs font-normal text-slate-500">/ mês</span>
                  </div>
                  <p className="text-xs text-slate-400">1 Aula Particular por Semana (4 aulas/mês)</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-blue-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <strong>1 aula individual/semana (60 min)</strong> no Zoom
                  </li>
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-blue-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <span>Acesso ilimitado a todos os Cursos ELO!</span>
                  </li>
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-blue-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <span>Feedback detalhado de pronúncia por aula</span>
                  </li>
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-blue-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <span>Suporte contínuo via WhatsApp</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handlePlanClick('weekly', 400)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <LuQrCode size={14} /> Assinar com Pix
                </button>
                <button
                  onClick={() => handleStripeCheckout('weekly', 400)}
                  disabled={stripeLoading !== null}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {stripeLoading === 'weekly' ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <LuCreditCard size={14} /> Pagar com Cartão
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bi-Weekly Plan (2x/week) - Featured */}
            <div className="bg-slate-950/70 border-2 border-emerald-500 rounded-2xl p-6 relative hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all flex flex-col justify-between">
              {/* "Most Popular" badge */}
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-md flex items-center gap-1">
                  <LuFlame size={12} fill="currentColor" /> Mais Escolhido
                </span>
              </div>

              <div>
                <div className="text-center mb-6 mt-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                    Plano Bi-Semanal
                  </span>
                  <div className="text-2xl font-extrabold text-white mt-4 mb-1">
                    R$ 700 <span className="text-xs font-normal text-slate-500">/ mês</span>
                  </div>
                  <p className="text-xs text-slate-400">2 Aulas Particulares por Semana (8 aulas/mês)</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-emerald-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <strong>2 aulas individuais/semana (60 min cada)</strong>
                  </li>
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-emerald-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <span>Acesso ilimitado a todos os Cursos ELO!</span>
                  </li>
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-emerald-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <span>Acompanhamento intensivo de pronúncia e fluência</span>
                  </li>
                  <li className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <LuCheck className="text-emerald-400 mr-2 mt-0.5 shrink-0" size={14} />
                    <span>Prioridade de agendamento na grade semanal</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handlePlanClick('biweekly', 700)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <LuQrCode size={14} /> Assinar com Pix
                </button>
                <button
                  onClick={() => handleStripeCheckout('biweekly', 700)}
                  disabled={stripeLoading !== null}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  {stripeLoading === 'biweekly' ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <LuCreditCard size={14} /> Pagar com Cartão
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-slate-500 text-[10px] uppercase tracking-widest mt-4">
            <p>Cancele quando quiser · Sem taxa de fidelidade</p>
          </div>
        </div>
      </div>
    </>
  );
}
