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
    const { plan, price, email, name, cpf, idempotencyKey, userId } = req.body;

    if (!plan || !price || !email || !name || !cpf || !idempotencyKey) {
      return res.status(400).json({ error: 'Missing required checkout fields.' });
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (!validateCPF(cleanCpf)) {
      return res.status(400).json({ error: 'CPF inválido de acordo com a validação do servidor.' });
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      console.warn('[Checkout] MERCADO_PAGO_ACCESS_TOKEN is not configured. Falling back to sandbox mock creation.');
      // Return a simulated Pix payload with a 30-minute expiry
      const expirationDate = new Date(Date.now() + 30 * 60 * 1000);
      return res.status(201).json({
        success: true,
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021226830014br.gov.bcb.pix2561api.mercadopago.com/v1/payments/mock123/pix",
        copyPasteKey: "00020101021226830014br.gov.bcb.pix2561api.mercadopago.com/v1/payments/mock123/pix",
        expirationTime: expirationDate.toISOString()
      });
    }

    // Split first and last name
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Nome';
    const lastName = nameParts.slice(1).join(' ') || 'Sobrenome';

    // 30-minute expiration time
    const expirationDate = new Date(Date.now() + 30 * 60 * 1000);
    const dateOfExpiration = expirationDate.toISOString();

    // Construct notification URL dynamically based on host
    const host = req.headers.host;
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const notificationUrl = host 
      ? `${protocol}://${host}/api/webhooks/mercado-pago` 
      : 'https://elo-fluxa-rj.vercel.app/api/webhooks/mercado-pago';

    const mpBody = {
      transaction_amount: Number(price),
      description: `Assinatura Elo! - Plano ${plan.toUpperCase()}`,
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
      metadata: {
        plan_type: plan,
        user_id: userId || '',
        payer_email: email
      }
    };

    console.log('[Checkout] Dispatching payment creation to Mercado Pago:', {
      email,
      plan,
      price,
      notificationUrl,
      idempotencyKey
    });

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
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

    // Capture the QR code from transaction data
    const copyPasteKey = transactionData.qr_code;
    
    // We can use the Base64 image payload if present, otherwise fallback to the qrserver API
    const qrCodeUrl = transactionData.qr_code_base64
      ? `data:image/png;base64,${transactionData.qr_code_base64}`
      : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(copyPasteKey)}`;

    return res.status(201).json({
      success: true,
      paymentId: paymentData.id,
      qrCodeUrl,
      copyPasteKey,
      expirationTime: dateOfExpiration
    });

  } catch (error: any) {
    console.error('[Checkout API Error]:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no processamento do checkout.' });
  }
}
