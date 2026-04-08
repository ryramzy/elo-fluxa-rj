import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentName, studentEmail, slot, meetLink } = req.body;

    // Format the slot time for Brazil timezone
    const slotDate = new Date(slot);
    const formattedDate = slotDate.toLocaleString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Aula Confirmada! </h1>
          <p style="color: #6b7280; font-size: 16px;">Sua aula particular de inglês foi agendada com sucesso</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-bottom: 15px;">Detalhes da Aula</h2>
          <div style="space-y: 10px;">
            <p style="margin: 8px 0;"><strong>Aluno:</strong> ${studentName}</p>
            <p style="margin: 8px 0;"><strong>Data e Horário:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0;"><strong>Duração:</strong> 30 minutos</p>
            <p style="margin: 8px 0;"><strong>Fuso Horário:</strong> Horário de São Paulo</p>
          </div>
        </div>

        ${meetLink ? `
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #10b981;">
          <h2 style="color: #065f46; margin-bottom: 15px;">Link da Aula (Google Meet)</h2>
          <p style="margin: 8px 0;">Clique no link abaixo para acessar sua aula online:</p>
          <a href="${meetLink}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Entrar na Aula
          </a>
        </div>
        ` : ''}

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f59e0b;">
          <h3 style="color: #92400e; margin-bottom: 10px;">Importante</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Chegue 5 minutos antes da aula</li>
            <li>Teste seu microfone e câmera</li>
            <li>Tenha uma conexão de internet estável</li>
            <li>Se precisar cancelar, avise com pelo menos 2 horas de antecedência</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Qualquer dúvida, entre em contato pelo WhatsApp</p>
          <a href="https://wa.me/5521999999999" style="color: #2563eb; text-decoration: none;">Falar com WhatsApp</a>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Elo Matt <contato@elomatt.com>',
      to: [studentEmail],
      subject: 'Sua aula foi confirmada - Elo Matt',
      html: emailContent,
    });

    if (error) {
      console.error('Email error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
