import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { LuCheck, LuCopy, LuTriangleAlert, LuQrCode, LuCreditCard, LuKey, LuZap } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import { PUBLIC_PIX_KEY, PUBLIC_PIX_RECEIVER, PUBLIC_PIX_BANK, getPixReceiptWhatsAppLink, getWhatsAppLink } from '../../constants';

interface CheckoutFormProps {
  plan: 'starter' | 'weekly' | 'biweekly' | 'pro' | 'elite' | string;
  price: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  
  // Reject identical digits (e.g. 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validation digit 1
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validation digit 2
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function CheckoutForm({ plan, price, onSuccess, onCancel }: CheckoutFormProps) {
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [activeMode, setActiveMode] = useState<'dynamic' | 'static'>('dynamic');
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixPayload, setPixPayload] = useState<{ qrCodeUrl: string; copyPasteKey: string; expirationTime: string } | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [staticCopied, setStaticCopied] = useState(false);
  
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const planLabel = plan === 'biweekly' ? 'Plano 2x por Semana' : 'Plano 1x por Semana';

  // Pre-fill user information if logged in
  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Real-time Firestore payment listener
  useEffect(() => {
    if (!user) return;

    // Listen to users/{uid} document to detect when webhook activates the plan
    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.plan === plan && data.subscriptionStatus === 'active') {
          setPaymentComplete(true);
          showToast('Pagamento confirmado via Mercado Pago! Sua assinatura foi liberada.', 'success');
          if (onSuccess) onSuccess();
        }
      }
    });

    return () => unsubscribe();
  }, [user, plan, onSuccess, showToast]);

  // Expiration countdown timer for dynamic Pix
  useEffect(() => {
    if (!pixPayload || !pixPayload.expirationTime) return;

    const calculateSecondsRemaining = (expStr: string) => {
      const exp = new Date(expStr).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((exp - now) / 1000));
    };

    const initialSeconds = calculateSecondsRemaining(pixPayload.expirationTime);
    setSecondsLeft(initialSeconds);
    setIsExpired(initialSeconds <= 0);

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pixPayload]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 9) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
    } else if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3)}`;
    }
    setCpf(formatted);
  };

  const handleCopyDynamicKey = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload.copyPasteKey);
      showToast('Código Pix Copia e Cola copiado com sucesso!', 'info');
    }
  };

  const handleCopyStaticKey = () => {
    navigator.clipboard.writeText(PUBLIC_PIX_KEY);
    setStaticCopied(true);
    showToast('Chave Pix copiada para a área de transferência!', 'info');
    setTimeout(() => setStaticCopied(false), 3000);
  };

  const handleSubmitDynamic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !cpf) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'info');
      setLoading(false);
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    const isCpfValid = validateCPF(cleanCpf);

    if (!isCpfValid) {
      showToast('CPF inválido! Por favor verifique os dígitos digitados.', 'error');
      setLoading(false);
      return;
    }

    try {
      const idempotencyKey = generateUUID();
      console.log('[Checkout] Creating dynamic Pix with Mercado Pago:', idempotencyKey);
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan,
          price,
          email,
          name,
          cpf: cleanCpf,
          idempotencyKey,
          userId: user?.uid || ''
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar checkout Pix via Mercado Pago.');
      }

      setPixPayload({
        qrCodeUrl: data.qrCodeUrl,
        copyPasteKey: data.copyPasteKey,
        expirationTime: data.expirationTime
      });
      setIsExpired(false);
      showToast('Pix Mercado Pago gerado com sucesso!', 'success');

    } catch (err: any) {
      console.error('[Checkout Form Error]:', err);
      showToast(err.message || 'Erro ao processar transação Pix. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (paymentComplete) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl text-center max-w-md mx-auto backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <LuCheck size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Assinatura Ativada! 🎉</h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Seu pagamento via Mercado Pago foi confirmado com sucesso. Todas as aulas e trilhas do <span className="text-sky-400 font-bold">{planLabel}</span> já estão disponíveis na sua conta.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
        >
          Ir para o Painel
        </button>
      </div>
    );
  }

  // Dynamic Pix QR Code & Copia e Cola screen
  if (pixPayload) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-md mx-auto backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Checkout Mercado Pago</span>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <LuQrCode className="text-blue-400" /> {planLabel} (R$ {price})
            </h3>
          </div>
        </div>
        
        {isExpired ? (
          <div className="text-center p-6 bg-red-500/5 border border-red-500/10 rounded-2xl mb-6">
            <LuTriangleAlert className="text-red-400 mx-auto mb-2" size={24} />
            <h4 className="text-sm font-bold text-white mb-1">Código Pix Expirado</h4>
            <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
              O prazo de 30 minutos para pagamento deste Pix se esgotou. Por favor, gere um novo código.
            </p>
            <button
              onClick={() => setPixPayload(null)}
              className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Gerar Novo Pix
            </button>
          </div>
        ) : (
          <>
            {/* QR Code display */}
            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto mb-5 flex items-center justify-center border border-slate-750 shadow-inner">
              <img src={pixPayload.qrCodeUrl} alt="Pix QR Code Mercado Pago" className="w-full h-full object-contain" />
            </div>

            <p className="text-[11px] text-slate-300 text-center mb-5 leading-relaxed">
              Abra o app do seu banco ou Mercado Pago, escolha <strong className="text-white">"Pagar com Pix Copia e Cola"</strong> ou aponte a câmera para o QR Code acima.
            </p>

            {/* Copy paste input container */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={pixPayload.copyPasteKey}
                className="flex-1 bg-slate-950/80 border border-slate-800 text-slate-300 text-xs px-3 py-2.5 rounded-xl outline-none select-all truncate font-mono"
              />
              <button
                onClick={handleCopyDynamicKey}
                className="px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center justify-center gap-1 text-xs font-bold shrink-0"
                title="Copiar Código"
              >
                <LuCopy size={13} /> Copiar
              </button>
            </div>

            {/* Countdown timer display */}
            <div className="text-center text-xs text-slate-400 mb-4 bg-slate-950/40 py-2.5 rounded-xl border border-slate-850">
              Código expira em: <span className="font-mono font-bold text-blue-400">{formatTime(secondsLeft)}</span>
            </div>

            {/* Waiting indicators */}
            <div className="flex items-center justify-center gap-2 text-xs text-blue-400 bg-blue-500/5 border border-blue-500/10 py-2.5 rounded-xl mb-4 font-medium">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
              Aguardando confirmação automática do Mercado Pago...
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setPixPayload(null)}
                className="text-slate-400 hover:text-white text-[11px] transition-colors"
              >
                ← Voltar
              </button>

              <a
                href={getWhatsAppLink('subscription')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
              >
                <FaWhatsapp size={12} /> Ajuda no WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-5 sm:p-7 rounded-3xl max-w-md mx-auto backdrop-blur-md">
      {/* Header with Plan Info */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <LuCreditCard className="text-blue-400" size={18} />
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Pagamento Pix</h3>
            <p className="text-[11px] text-slate-400">{planLabel} • <strong className="text-sky-400">R$ {price}/mês</strong></p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md">
          Mercado Pago
        </span>
      </div>

      {/* Tabs: Dynamic Mercado Pago vs Direct Static Pix Key */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 border border-slate-850 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => setActiveMode('dynamic')}
          className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'dynamic'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LuZap size={13} /> Pix Automático
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('static')}
          className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'static'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LuKey size={13} /> Chave Pix Direta
        </button>
      </div>

      {activeMode === 'dynamic' ? (
        /* 1. Dynamic Checkout Form via Mercado Pago */
        <form onSubmit={handleSubmitDynamic} className="space-y-3.5">
          <p className="text-slate-400 text-xs leading-relaxed">
            Informe seus dados para gerar o QR Code dinâmico com <strong className="text-white">confirmação e liberação 100% automática</strong>.
          </p>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome impresso no documento"
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CPF (Dono da conta)</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              required
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors font-mono tracking-wider"
            />
          </div>

          <div className="flex gap-2 pt-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Voltar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Gerar Pix Mercado Pago'
              )}
            </button>
          </div>
        </form>
      ) : (
        /* 2. Direct Manual Pix Key Transfer Screen */
        <div className="space-y-4">
          <p className="text-slate-400 text-xs leading-relaxed">
            Transfira o valor de <strong className="text-sky-400">R$ {price}</strong> diretamente usando a chave Pix oficial do Mercado Pago:
          </p>

          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Chave Pix (EVP / Aleatória)</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={PUBLIC_PIX_KEY}
                  className="flex-1 bg-slate-900 border border-slate-800 text-sky-400 text-xs font-mono px-3 py-2 rounded-xl outline-none select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyStaticKey}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shrink-0"
                >
                  {staticCopied ? <LuCheck size={14} /> : <LuCopy size={14} />}
                  {staticCopied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-850">
              <div>
                <span className="text-[10px] text-slate-500 block">Beneficiário</span>
                <span className="font-semibold text-slate-300 text-xs">{PUBLIC_PIX_RECEIVER}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Banco</span>
                <span className="font-semibold text-slate-300 text-xs">{PUBLIC_PIX_BANK}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300/90 leading-relaxed">
            ⚠️ <strong>Importante:</strong> Após realizar a transferência manual no app do seu banco, envie o comprovante para nosso atendimento no WhatsApp para liberação imediata da sua conta.
          </div>

          <a
            href={getPixReceiptWhatsAppLink(name, plan, price)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
          >
            <FaWhatsapp size={16} /> Enviar Comprovante para Atendimento
          </a>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-slate-400 hover:text-white font-bold text-xs transition-colors text-center"
            >
              Voltar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
