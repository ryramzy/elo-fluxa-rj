import { VercelRequest, VercelResponse } from '@vercel/node';

interface MessagePayload {
  phone: string;
  template: 'booking_created' | 'booking_cancelled' | 'feedback_ready';
  data: {
    studentName: string;
    date: string;
    time?: string;
    summary?: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { phone, template, data } = req.body as MessagePayload;

    if (!phone || !template || !data || !data.studentName || !data.date) {
      return res.status(400).json({ error: 'Missing required WhatsApp payload parameters (phone, template, data).' });
    }

    // Clean phone number (leave only digits)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Format message text based on template type
    let messageText = '';
    
    switch (template) {
      case 'booking_created':
        messageText = `Olá ${data.studentName}! 🗓️ Sua próxima aula de inglês com o Professor Matt foi agendada com sucesso para o dia *${data.date}* às *${data.time || ''}*.\n\nPrepare seus fones de ouvido e bons estudos! 🚀`;
        break;
      case 'booking_cancelled':
        messageText = `Olá ${data.studentName}! ⚠️ Sua aula agendada para o dia *${data.date}* às *${data.time || ''}* foi cancelada. Seus créditos de agendamento foram devolvidos ao seu perfil.\n\nQualquer dúvida, entre em contato com nosso suporte.`;
        break;
      case 'feedback_ready':
        messageText = `Olá ${data.studentName}! 📝 As notas do professor e a tarefa de casa para a sua aula do dia *${data.date}* já estão disponíveis no seu painel!\n\n*Resumo do Professor:* "${data.summary || 'Veja os detalhes no app.'}"\n\nAcesse o app e complete as atividades para ganhar mais XP! ⚡️`;
        break;
      default:
        return res.status(400).json({ error: `Invalid WhatsApp template type: ${template}` });
    }

    const gatewayUrl = process.env.WHATSAPP_API_URL;
    const gatewayToken = process.env.WHATSAPP_TOKEN;

    if (!gatewayUrl || !gatewayToken) {
      console.warn('[WhatsApp Mock Output] Credentials not set. Logging formatted message output:');
      console.log(`[TO]: ${cleanPhone}`);
      console.log(`[MESSAGE]:\n${messageText}`);
      
      return res.status(200).json({
        success: true,
        mock: true,
        message: 'WhatsApp credentials not set. Message logged to console.',
        loggedPayload: { phone: cleanPhone, text: messageText }
      });
    }

    // Example payload layout for common gateways (Z-API / Baileys / Evolution API)
    // Adjust key headers depending on selected service provider:
    console.log(`[WhatsApp API] Dispatching message to ${cleanPhone} via ${gatewayUrl}...`);

    const apiResponse = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gatewayToken}`,
        // Support custom gateway API token headers if needed
        'x-token': gatewayToken,
        'apikey': gatewayToken
      },
      body: JSON.stringify({
        // Common parameters for WhatsApp APIs
        number: cleanPhone,
        to: `${cleanPhone}@s.whatsapp.net`,
        phone: cleanPhone,
        message: messageText,
        text: messageText
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`WhatsApp API gateway returned failure status: ${errorText}`);
    }

    const responseData = await apiResponse.json();
    console.log('[WhatsApp API] Message dispatched successfully:', responseData);

    return res.status(200).json({
      success: true,
      message: 'WhatsApp notification dispatched.',
      gatewayResponse: responseData
    });

  } catch (error: any) {
    console.error('[WhatsApp API Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to dispatch WhatsApp message.' });
  }
}
