import { VercelRequest, VercelResponse } from '@vercel/node';

// Backend CPF validation guard
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { mode, plan, price, email, name, cpf, idempotencyKey, userId } = req.body;

    if (!plan || !price) {
      return res.status(400).json({ error: 'Missing required checkout fields (plan, price).' });
    }

    // Validate plan and price strictly
    const expectedPrices: Record<string, number> = {
      weekly: 400,
      biweekly: 700
    };

    if (!expectedPrices[plan] || Number(price) !== expectedPrices[plan]) {
      return res.status(400).json({ 
        error: `Plano ou valor inválido. Planos válidos: weekly (R$ 400) ou biweekly (R$ 700).` 
      });
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      console.error('[Checkout API] MERCADO_PAGO_ACCESS_TOKEN is not configured on the server.');
      return res.status(503).json({
        error: 'O checkout integrado via Mercado Pago está temporariamente indisponível. Por favor, utilize a Chave Pix direta ou tente novamente em instantes.'
      });
    }

    const host = req.headers.host;
    const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');
    const baseUrl = isLocal 
      ? `http://${host}` 
      : (process.env.VITE_APP_URL || 'https://eloingles.com.br');
    const notificationUrl = `${baseUrl}/api/webhooks/mercado-pago`;
    const planTitle = plan === 'biweekly' ? 'Plano 2x por Semana' : 'Plano 1x por Semana';

    // 1. Checkout Pro (Preference) Mode: Returns Mercado Pago hosted link (Pix, Cartão até 12x, Boleto, Saldo MP)
    if (mode === 'preference') {
      const preferenceBody = {
        items: [
          {
            id: plan,
            title: `ELO! Inglês - ${planTitle}`,
            description: 'Aulas particulares 1:1 de Inglês no Zoom com o Professor Matt + Acesso total à plataforma',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: Number(price)
          }
        ],
        payer: {
          email: email || undefined,
          name: name || undefined
        },
        back_urls: {
          success: `${baseUrl}/dashboard?payment=success`,
          failure: `${baseUrl}/dashboard?payment=failure`,
          pending: `${baseUrl}/dashboard?payment=pending`
        },
        auto_return: 'approved',
        notification_url: notificationUrl,
        external_reference: `elo_${userId || 'guest'}_${plan}_${Date.now().toString().slice(-6)}`,
        metadata: {
          plan_type: plan,
          user_id: userId || '',
          payer_email: email || '',
          plan_price: Number(price)
        },
        payment_methods: {
          installments: 12
        }
      };

      console.log('[Checkout] Creating Mercado Pago Checkout Pro preference for:', { plan, price, email, userId });

      const prefRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceBody)
      });

      if (!prefRes.ok) {
        const errorText = await prefRes.text();
        throw new Error(`Erro ao gerar Checkout Pro Mercado Pago: ${errorText}`);
      }

      const prefData = await prefRes.json();
      return res.status(200).json({
        success: true,
        initPoint: prefData.init_point,
        sandboxInitPoint: prefData.sandbox_init_point,
        preferenceId: prefData.id
      });
    }

    // 2. Direct Dynamic Pix Mode
    if (!email || !name || !cpf || !idempotencyKey) {
      return res.status(400).json({ error: 'Missing required fields for dynamic Pix (email, name, cpf).' });
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (!validateCPF(cleanCpf)) {
      return res.status(400).json({ error: 'CPF inválido de acordo com a validação do servidor.' });
    }

    // Split first and last name
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Nome';
    const lastName = nameParts.slice(1).join(' ') || 'Sobrenome';

    // 30-minute expiration time
    const expirationDate = new Date(Date.now() + 30 * 60 * 1000);
    const dateOfExpiration = expirationDate.toISOString();

    const safeIdempotencyKey = String(idempotencyKey || Date.now());
    const externalReference = `elo_${userId || 'guest'}_${plan}_${safeIdempotencyKey.slice(0, 8)}`;

    const mpBody = {
      transaction_amount: Number(price),
      description: `ELO! - Plano ${planTitle}`,
      payment_method_id: 'pix',
      payer: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: 'CPF',
          number: cleanCpf
        }
      },
      date_of_expiration: dateOfExpiration,
      notification_url: notificationUrl,
      external_reference: externalReference,
      metadata: {
        plan_type: plan,
        user_id: userId || '',
        payer_email: email,
        plan_price: Number(price)
      }
    };

    console.log('[Checkout] Dispatching payment creation to Mercado Pago:', {
      email,
      plan,
      price,
      externalReference,
      idempotencyKey: safeIdempotencyKey
    });

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': safeIdempotencyKey
      },
      body: JSON.stringify(mpBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mercado Pago Payment creation failed: ${errorText}`);
    }

    const paymentData = await response.json();
    const transactionData = paymentData.point_of_interaction?.transaction_data;
    
    if (!transactionData) {
      throw new Error('Mercado Pago response did not return transaction details.');
    }

    // Capture the QR code and Copia e Cola from Mercado Pago's dynamic transaction
    const copyPasteKey = transactionData.qr_code;
    const qrCodeUrl = transactionData.qr_code_base64
      ? `data:image/png;base64,${transactionData.qr_code_base64}`
      : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(copyPasteKey)}`;

    return res.status(201).json({
      success: true,
      paymentId: paymentData.id,
      qrCodeUrl,
      copyPasteKey,
      ticketUrl: transactionData.ticket_url || null,
      expirationTime: dateOfExpiration
    });

  } catch (error: any) {
    console.error('[Checkout API Error]:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no processamento do checkout.' });
  }
}
