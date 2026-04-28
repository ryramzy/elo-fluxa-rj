import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      attendeeName, attendeeEmail,
      date, time, durationMinutes, meetLink, notes
    } = req.body;

    const formattedDate = new Date(date + 'T00:00:00')
      .toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long'
      });

    const { error } = await resend.emails.send({
      from: 'Elo! <noreply@elospeak.com.br>',
      replyTo: 'matt@elospeak.com.br',
      to: attendeeEmail,
      subject: `Sua aula está confirmada - ${formattedDate}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb;margin-bottom:8px">Elo!</h2>
          <p style="margin:0 0 24px 0;font-size:16px">
            Olá, <strong>${attendeeName}</strong>!
          </p>
          <p style="margin:0 0 20px 0">
            Sua aula de inglês americano está confirmada.
          </p>
          
          <div style="background:#f0fdf4;border-left:4px solid #22c55e;
                      padding:16px;border-radius:4px;margin:20px 0">
            <p style="margin:0;font-size:15px;line-height:1.5">
              <strong>${formattedDate}</strong> às ${time}<br/>
              Duração: ${durationMinutes} minutos<br/>
              Professor: Matt
            </p>
            ${notes ? `<p style="margin:8px 0 0 0;font-size:14px;color:#64748b">
              <strong>Notas:</strong> ${notes}
            </p>` : ''}
          </div>

          ${meetLink ? `
          <a href="${meetLink}" 
             style="display:inline-block;background:#22c55e;color:white;
                    padding:12px 24px;border-radius:6px;
                    text-decoration:none;font-weight:bold;margin:16px 0">
            Entrar no Google Meet
          </a>
          <p style="font-size:13px;color:#64748b;margin:8px 0">
            Link também será enviado 1 hora antes da aula
          </p>` : `
          <div style="background:#fef3c7;border:1px solid #f59e0b;
                      padding:12px;border-radius:4px;margin:16px 0">
            <p style="margin:0;font-size:14px;color:#92400e">
              Link do Google Meet será enviado em breve
            </p>
          </div>`}

          <div style="background:#f8fafc;border:1px solid #e2e8f0;
                      padding:16px;border-radius:4px;margin:20px 0">
            <h4 style="margin:0 0 8px 0;color:#475569;font-size:14px">
              IMPORTANTE
            </h4>
            <ul style="margin:0;padding-left:16px;font-size:13px;color:#64748b">
              <li>Chegue 5 minutos antes</li>
              <li>Teste microfone e câmera</li>
              <li>Conexão internet estável</li>
              <li>Cancele com 2h de antecedência</li>
            </ul>
          </div>

          <p style="color:#64748b;font-size:13px;margin-top:24px">
            Precisa remarcar? 
            <a href="mailto:matt@elospeak.com.br" style="color:#2563eb">
              Responda este email
            </a> ou 
            <a href="https://wa.me/5521999999999" style="color:#2563eb">
              fale com Matt pelo WhatsApp
            </a>.
          </p>

          <p style="color:#94a3b8;font-size:12px;margin-top:32px;
                    padding-top:16px;border-top:1px solid #e2e8f0">
            <strong>Elo!</strong><br/>
            Inglês americano sem pressão<br/>
            elospeak.com.br · matt@elospeak.com.br
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Email error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
