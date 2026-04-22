import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email } = req.body;

    const { error } = await resend.emails.send({
      from: 'Elo Matt <noreply@elospeak.com.br>',
      replyTo: 'matt@elospeak.com.br',
      to: email,
      subject: `Bem-vindo ao Elo Matt, ${name}!`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb;margin-bottom:8px">Elo Matt</h2>
          <p style="margin:0 0 24px 0;font-size:16px">
            Olá, <strong>${name}</strong>!
          </p>
          <p style="margin:0 0 20px 0">
            Seja bem-vindo(a) ao Elo Matt! Estou muito feliz em ter você aqui.
          </p>
          
          <div style="background:#f0f9ff;border-left:4px solid #2563eb;
                      padding:16px;border-radius:4px;margin:20px 0">
            <h3 style="margin:0 0 8px 0;color:#1e40af;font-size:16px">
              Nosso método é diferente:
            </h3>
            <ul style="margin:8px 0 0 0;padding-left:16px;color:#1e40af">
              <li>Aulas 100% em inglês americano</li>
              <li>Foco em conversação real</li>
              <li>Sem pressa, sem vergonha</li>
              <li>Horários que cabem na sua rotina</li>
            </ul>
          </div>

          <div style="background:#f0fdf4;border:1px solid #22c55e;
                      padding:16px;border-radius:4px;margin:20px 0">
            <h4 style="margin:0 0 8px 0;color:#166534;font-size:15px">
              Próximos passos:
            </h4>
            <ol style="margin:8px 0 0 0;padding-left:16px;color:#166534;font-size:14px">
              <li>Explore seu dashboard</li>
              <li>Agende sua primeira aula experimental</li>
              <li>Prepare suas dúvidas e objetivos</li>
              <li>Relaxe e vamos conversar!</li>
            </ol>
          </div>

          <div style="text-align:center;margin:32px 0">
            <a href="https://elospeak.com.br/dashboard" 
               style="display:inline-block;background:#2563eb;color:white;
                      padding:14px 28px;border-radius:6px;
                      text-decoration:none;font-weight:bold;
                      font-size:16px">
              Acessar Meu Dashboard
            </a>
          </div>

          <div style="background:#fafafa;border:1px solid #e5e5e5;
                      padding:16px;border-radius:4px;margin:20px 0">
            <h4 style="margin:0 0 8px 0;color:#666;font-size:14px">
              Dúvidas? Estou aqui para ajudar:
            </h4>
            <ul style="margin:8px 0 0 0;padding-left:16px;font-size:13px;color:#666">
              <li>WhatsApp: 
                <a href="https://wa.me/5521999999999" style="color:#2563eb">
                  (21) 99999-9999
                </a>
              </li>
              <li>Email: 
                <a href="mailto:matt@elospeak.com.br" style="color:#2563eb">
                  matt@elospeak.com.br
                </a>
              </li>
            </ul>
          </div>

          <p style="color:#64748b;font-size:13px;margin-top:24px;font-style:italic">
            "Comece sem pressão. Evolua no seu ritmo."
          </p>

          <p style="color:#94a3b8;font-size:12px;margin-top:32px;
                    padding-top:16px;border-top:1px solid #e2e8f0">
            <strong>Elo Matt</strong><br/>
            Seu professor de inglês americano<br/>
            elospeak.com.br · matt@elospeak.com.br
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Welcome email error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
