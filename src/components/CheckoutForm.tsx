import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { LuCheck, LuCopy, LuTriangleAlert, LuQrCode, LuCreditCard } from 'react-icons/lu';

interface CheckoutFormProps {
  plan: 'starter' | 'pro' | 'elite';
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
  
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixPayload, setPixPayload] = useState<{ qrCodeUrl: string; copyPasteKey: string; expirationTime: string } | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  // Pre-fill user information if logged in
  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Real-time Firestore payment listener
  useEffect(() => {
    if (!user || !pixPayload) return;

    // Listen to users/{uid} document to detect when plan changes to purchased plan
    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.plan === plan) {
          setPaymentComplete(true);
          showToast('Pagamento confirmado! Sua assinatura foi liberada.', 'success');
          if (onSuccess) onSuccess();
        }
      }
    });

    return () => unsubscribe();
  }, [user, pixPayload, plan, onSuccess, showToast]);

  // Expiration countdown timer
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

  const handleCopyKey = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload.copyPasteKey);
      showToast('Chave Pix copiada para a área de transferência!', 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      console.log('[Checkout] Creating checkout transaction with idempotency:', idempotencyKey);
      
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao processar checkout Pix.');
      }

      const data = await res.json();
      setPixPayload({
        qrCodeUrl: data.qrCodeUrl,
        copyPasteKey: data.copyPasteKey,
        expirationTime: data.expirationTime
      });
      setIsExpired(false);
      showToast('Pix gerado com sucesso! Aguardando pagamento.', 'success');

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
        <h3 className="text-xl font-bold text-white mb-2">Assinatura Ativada!</h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Obrigado! Seu pagamento foi verificado instantaneamente. Todas as trilhas do plano <span className="text-sky-400 font-bold capitalize">{plan}</span> foram liberadas na sua conta.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
        >
          Voltar ao Painel
        </button>
      </div>
    );
  }

  if (pixPayload) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-md mx-auto backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
          <LuQrCode className="text-blue-400" /> Pague com Pix Copia e Cola
        </h3>
        
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
            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto mb-6 flex items-center justify-center border border-slate-750">
              <img src={pixPayload.qrCodeUrl} alt="Pix QR Code" className="w-full h-full object-contain" />
            </div>

            <p className="text-[10px] text-slate-400 text-center mb-6 leading-relaxed">
              Abra o aplicativo do seu banco, escolha a opção "Pagar com Pix Copia e Cola" ou aponte a câmera para o QR Code acima.
            </p>

            {/* Copy paste input container */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                readOnly
                value={pixPayload.copyPasteKey}
                className="flex-1 bg-slate-950/80 border border-slate-800 text-slate-400 text-xs px-3 py-2.5 rounded-xl outline-none select-all truncate"
              />
              <button
                onClick={handleCopyKey}
                className="px-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-white rounded-xl transition-all flex items-center justify-center"
                title="Copiar Código"
              >
                <LuCopy size={14} />
              </button>
            </div>

            {/* Countdown timer display */}
            <div className="text-center text-xs text-slate-400 mb-4 bg-slate-950/40 py-2.5 rounded-xl border border-slate-850">
              Código expira em: <span className="font-mono font-bold text-blue-400">{formatTime(secondsLeft)}</span>
            </div>

            {/* Waiting indicators */}
            <div className="flex items-center justify-center gap-2 text-xs text-blue-400 animate-pulse bg-blue-500/5 border border-blue-500/10 py-2.5 rounded-xl">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
              Aguardando confirmação do pagamento...
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-3xl max-w-md mx-auto backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <LuCreditCard className="text-blue-400" />
        <h3 className="text-lg font-bold text-white">Pagamento Pix Seguro</h3>
      </div>
      <p className="text-slate-400 text-xs mb-6">
        Insira seus dados para gerar o código Pix de pagamento do plano <span className="text-sky-400 font-bold capitalize">{plan}</span> (R${price}/mês).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider mb-1.5">Nome Completo</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome impresso no documento"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-4 py-3 rounded-xl outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider mb-1.5">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contato@exemplo.com"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-4 py-3 rounded-xl outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider mb-1.5">CPF (Dono da conta)</label>
          <input
            type="text"
            required
            value={cpf}
            onChange={handleCpfChange}
            placeholder="000.000.000-00"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-4 py-3 rounded-xl outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Gerar Pix'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
