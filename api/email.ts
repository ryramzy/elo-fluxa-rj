import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getFirestoreAccessToken } from './utils/googleAuth.js';

const resend = new Resend(process.env.RESEND_API_KEY || 're_temp_key');
const FROM_EMAIL = process.env.EMAIL_FROM || 'ELO! <contato@eloingles.com.br>';
const FALLBACK_FROM_EMAIL = 'ELO! <onboarding@resend.dev>';
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || 'mramsay0@gmail.com';
const ADMIN_EMAILS = ['mramsay0@gmail.com', 'erneleducation@gmail.com'];
const APP_URL = process.env.VITE_APP_URL || 'https://eloingles.com.br';

if (!process.env.RESEND_API_KEY) {
  console.error('[email] MISSING: RESEND_API_KEY not configured in environment');
}

/**
 * Robust Email Dispatcher with Fallback & Diagnostics
 */
async function sendEmailWithFallback(payload: {
  from?: string;
  replyTo?: string;
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ success: boolean; data?: any; error?: any; fallbackUsed?: boolean }> {
  const primaryFrom = payload.from || FROM_EMAIL;
  const replyTo = payload.replyTo || REPLY_TO_EMAIL;

  console.log(`[Email] Dispatching to ${JSON.stringify(payload.to)} with subject: "${payload.subject}"`);

  if (!process.env.RESEND_API_KEY) {
    console.error('[Email] Cannot send: RESEND_API_KEY is not configured.');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    // 1. Attempt primary dispatch
    const res = await resend.emails.send({
      from: primaryFrom,
      replyTo,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (!res.error) {
      console.log(`[Email] Successfully delivered via primary sender (${primaryFrom}). ID:`, res.data?.id);
      return { success: true, data: res.data };
    }

    console.warn(`[Email] Primary sender error:`, res.error);

    // 2. If domain verification or permission error, automatically retry with fallback sender
    const isDomainError =
      res.error.name === 'validation_error' ||
      res.error.message?.includes('not verified') ||
      res.error.message?.includes('domain') ||
      res.error.message?.includes('forbidden');

    if (isDomainError) {
      console.log(`[Email] Retrying with fallback sender: ${FALLBACK_FROM_EMAIL}`);
      const fallbackRes = await resend.emails.send({
        from: FALLBACK_FROM_EMAIL,
        replyTo,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      if (!fallbackRes.error) {
        console.log(`[Email] Successfully delivered via fallback (${FALLBACK_FROM_EMAIL}). ID:`, fallbackRes.data?.id);
        return { success: true, data: fallbackRes.data, fallbackUsed: true };
      }

      console.error(`[Email] Fallback sender also failed:`, fallbackRes.error);
      return { success: false, error: fallbackRes.error };
    }

    return { success: false, error: res.error };
  } catch (err: any) {
    console.error(`[Email] Exception during email send:`, err);
    return { success: false, error: err.message || err };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.split('?')[0] ?? '';

  // 1. Health & Test endpoints
  if ((path.endsWith('/email/health') || path === '/api/email/health')) {
    return handleHealthCheck(req, res);
  }
  if ((path.endsWith('/email/test') || path === '/api/email/test')) {
    return handleTestEmail(req, res);
  }

  // 2. Transactional email events
  if ((path.endsWith('/email/booking-confirmation') || path === '/api/email/booking-confirmation') && req.method === 'POST') {
    return handleBookingConfirmation(req, res);
  }
  if ((path.endsWith('/email/booking-request') || path === '/api/email/booking-request') && req.method === 'POST') {
    return handleBookingRequest(req, res);
  }
  if ((path.endsWith('/email/booking-cancellation') || path === '/api/email/booking-cancellation' || path.endsWith('/email/cancel') || path === '/api/email/cancel') && req.method === 'POST') {
    return handleBookingCancellation(req, res);
  }
  if ((path.endsWith('/email/enrollment-confirmation') || path === '/api/email/enrollment-confirmation') && req.method === 'POST') {
    return handleEnrollmentConfirmation(req, res);
  }
  if ((path.endsWith('/email/welcome') || path === '/api/email/welcome') && req.method === 'POST') {
    return handleWelcome(req, res);
  }
  if ((path.endsWith('/email/tutor-application') || path === '/api/email/tutor-application') && req.method === 'POST') {
    return handleTutorApplicationReceived(req, res);
  }
  if ((path.endsWith('/email/tutor-decision') || path === '/api/email/tutor-decision') && req.method === 'POST') {
    return handleTutorDecision(req, res);
  }
  if ((path.endsWith('/email/app-invite') || path === '/api/email/app-invite') && req.method === 'POST') {
    return handleAppDownloadInvite(req, res);
  }
  if ((path.endsWith('/email/lesson-reminder') || path === '/api/email/lesson-reminder') && (req.method === 'POST' || req.method === 'GET')) {
    return handleLessonReminder(req, res);
  }

  return res.status(404).json({ error: `Not found: ${path}` });
}

async function handleHealthCheck(_req: VercelRequest, res: VercelResponse) {
  const hasKey = !!process.env.RESEND_API_KEY;
  const keyPrefix = hasKey ? process.env.RESEND_API_KEY!.slice(0, 7) + '...' : 'NONE';
  
  return res.status(200).json({
    status: hasKey ? 'configured' : 'missing_api_key',
    provider: 'resend',
    apiKeyPrefix: keyPrefix,
    primarySender: FROM_EMAIL,
    fallbackSender: FALLBACK_FROM_EMAIL,
    replyTo: REPLY_TO_EMAIL,
    timestamp: new Date().toISOString(),
  });
}

async function handleTestEmail(req: VercelRequest, res: VercelResponse) {
  const to = (req.query.to as string) || req.body?.to || 'mramsay0@gmail.com';
  
  console.log(`[Email Test] Sending test verification email to: ${to}`);

  const result = await sendEmailWithFallback({
    to,
    subject: '🧪 ELO! Email Gateway Verification Test',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;padding:24px;border:1px solid #e2e8f0;rounded:12px">
        <h2 style="color:#2563eb;margin-top:0">ELO! — Teste de Gateway de Email</h2>
        <p>Olá! Este é um email de teste automático do sistema transacional do <strong>ELO! (eloingles.com.br)</strong>.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px;margin:16px 0;border-radius:4px">
          <p style="margin:0;color:#166534;font-weight:bold">✓ Conexão com Resend / Email Gateway operacional!</p>
          <p style="margin:4px 0 0 0;font-size:12px;color:#166534">Disparado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} BRT</p>
        </div>
        <p style="font-size:13px;color:#64748b">
          Se você recebeu este email, seu pipeline de confirmação de agendamentos, matrículas e lembretes está funcionando.
        </p>
      </div>
    `,
  });

  if (result.success) {
    return res.status(200).json({
      success: true,
      message: `Email de teste enviado com sucesso para ${to}!`,
      details: result,
    });
  }

  return res.status(500).json({
    success: false,
    error: result.error,
    message: 'Falha ao enviar email de teste. Verifique a chave RESEND_API_KEY ou configuração de DNS em resend.com/domains.',
  });
}

async function handleBookingRequest(req: VercelRequest, res: VercelResponse) {
  try {
    const {
      attendeeName, attendeeEmail,
      date, time, durationMinutes, notes,
      tutorName, tutorEmail
    } = req.body;

    const formattedDate = new Date(date + 'T00:00:00')
      .toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long'
      });

    // 1. Send notice to Tutor & Admins
    const tutorEmails = [tutorEmail, ...ADMIN_EMAILS].filter(Boolean);
    const tutorTo = Array.from(new Set(tutorEmails));
    await sendEmailWithFallback({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: tutorTo,
      subject: `Nova solicitação de aula de ${attendeeName} - ${formattedDate}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb;margin-bottom:8px">ELO! Agenda</h2>
          <p style="margin:0 0 24px 0;font-size:16px">
            Olá, <strong>${tutorName || 'Professor'}</strong>!
          </p>
          <p style="margin:0 0 20px 0">
            Você recebeu uma nova solicitação de aula. Acesse seu painel para confirmar ou recusar.
          </p>
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:4px;margin:20px 0">
            <p style="margin:0;font-size:15px;line-height:1.5">
              <strong>Estudante:</strong> ${attendeeName} (${attendeeEmail})<br/>
              <strong>Data:</strong> ${formattedDate} às ${time}<br/>
              <strong>Duração:</strong> ${durationMinutes || 60} minutos
            </p>
            ${notes ? `<p style="margin:8px 0 0 0;font-size:14px;color:#92400e"><strong>Tema:</strong> ${notes}</p>` : ''}
          </div>
          <a href="${APP_URL}/agenda" 
             style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">
            Ver solicitações na Agenda
          </a>
        </div>
      `
    });

    // 2. Send notice to Student
    await sendEmailWithFallback({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: attendeeEmail,
      subject: `Solicitação de aula enviada - ${formattedDate}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb;margin-bottom:8px">ELO!</h2>
          <p style="margin:0 0 24px 0;font-size:16px">
            Olá, <strong>${attendeeName}</strong>!
          </p>
          <p style="margin:0 0 20px 0">
            Sua solicitação de aula com <strong>${tutorName || 'Matt'}</strong> foi enviada e está aguardando confirmação.
          </p>
          <div style="background:#f8fafc;border-left:4px solid #94a3b8;padding:16px;border-radius:4px;margin:20px 0">
            <p style="margin:0;font-size:15px;line-height:1.5">
              <strong>Data/Hora sugerida:</strong> ${formattedDate} às ${time}<br/>
              <strong>Duração:</strong> ${durationMinutes || 60} minutos
            </p>
          </div>
          <p style="font-size:13px;color:#64748b;margin:16px 0">
            Você receberá um email de confirmação com o link de acesso ao Zoom assim que o professor confirmar.
          </p>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Error handling booking request:', err);
    return res.status(500).json({ error: err.message || err });
  }
}

async function handleBookingConfirmation(req: VercelRequest, res: VercelResponse) {
  try {
    const {
      attendeeName, attendeeEmail,
      date, time, durationMinutes, meetLink, notes,
      tutorName, tutorEmail
    } = req.body;

    const formattedDate = new Date(date + 'T00:00:00')
      .toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long'
      });

    const toEmails = Array.from(new Set([attendeeEmail, tutorEmail, ...ADMIN_EMAILS])).filter(Boolean);
    const result = await sendEmailWithFallback({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: toEmails,
      subject: `Sua aula está confirmada - ${formattedDate}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb;margin-bottom:8px">ELO!</h2>
          <p style="margin:0 0 24px 0;font-size:16px">
            Olá, <strong>${attendeeName}</strong>!
          </p>
          <p style="margin:0 0 20px 0">
            Sua aula particular de inglês americano está confirmada!
          </p>
          
          <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;border-radius:4px;margin:20px 0">
            <p style="margin:0;font-size:15px;line-height:1.5">
              <strong>${formattedDate}</strong> às ${time}<br/>
              Duração: ${durationMinutes || 60} minutos<br/>
              Professor: ${tutorName || 'Professor Matt'}
            </p>
            ${notes ? `<p style="margin:8px 0 0 0;font-size:14px;color:#64748b">
              <strong>Notas:</strong> ${notes}
            </p>` : ''}
          </div>

          <div style="margin:24px 0;text-align:center">
            <a href="${meetLink || `${APP_URL}/classroom`}" 
               style="display:inline-block;background:#2563eb;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;margin-bottom:10px">
              📹 Entrar na Sala de Aula ao Vivo
            </a>
          </div>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:4px;margin:20px 0">
            <h4 style="margin:0 0 8px 0;color:#475569;font-size:14px">
              RECOMENDAÇÕES:
            </h4>
            <ul style="margin:0;padding-left:16px;font-size:13px;color:#64748b">
              <li>Entre 5 minutos antes para testar microfone</li>
              <li>Use fones de ouvido para melhor clareza sonora</li>
              <li>Avise com pelo menos 24h de antecedência se precisar remarcar</li>
            </ul>
          </div>

          <p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">
            <strong>ELO!</strong><br/>
            Inglês americano com nativos no Rio de Janeiro<br/>
            eloingles.com.br · ${REPLY_TO_EMAIL}
          </p>
        </div>
      `,
    });

    if (!result.success) {
      console.error('Email send result failed:', result.error);
    }

    res.status(200).json({ success: result.success, details: result });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleEnrollmentConfirmation(req: VercelRequest, res: VercelResponse) {
  try {
    const { studentName, studentEmail, courseName, courseLink } = req.body;

    const formattedDate = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const result = await sendEmailWithFallback({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: studentEmail,
      subject: `Você foi matriculado no curso ${courseName}!`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb;margin-bottom:8px">ELO!</h2>
          <p style="margin:0 0 24px 0;font-size:16px">
            Olá <strong>${studentName}</strong>!
          </p>
          <p style="margin:0 0 20px 0">
            Sua matrícula no módulo <strong>${courseName}</strong> foi confirmada e você já pode começar a praticar.
          </p>
          
          <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;border-radius:4px;margin:20px 0">
            <p style="margin:0;font-size:15px;line-height:1.5">
              <strong>Data de Início:</strong> ${formattedDate}<br/>
              <strong>Conta:</strong> ${studentEmail}<br/>
            </p>
          </div>

          <a href="${courseLink || `${APP_URL}/courses`}" 
             style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">
            Começar a Praticar Agora
          </a>

          <p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">
            <strong>ELO!</strong><br/>
            eloingles.com.br · ${REPLY_TO_EMAIL}
          </p>
        </div>
      `,
    });

    res.status(200).json({ success: result.success, details: result });
  } catch (error) {
    console.error('Enrollment confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleWelcome(req: VercelRequest, res: VercelResponse) {
  try {
    const { name, email } = req.body;

    const result = await sendEmailWithFallback({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: email,
      subject: `Bem-vindo ao ELO!, ${name}! 🚀`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb;margin-bottom:8px">ELO!</h2>
          <p style="margin:0 0 24px 0;font-size:16px">
            Olá, <strong>${name}</strong>!
          </p>
          <p style="margin:0 0 20px 0">
            Seja muito bem-vindo(a) ao ELO! Estou super animado para te ajudar a destravar sua fala em inglês americano.
          </p>
          
          <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;border-radius:4px;margin:20px 0">
            <h3 style="margin:0 0 8px 0;color:#1e40af;font-size:16px">
              O que você encontra no ELO!:
            </h3>
            <ul style="margin:8px 0 0 0;padding-left:16px;color:#1e40af;font-size:14px">
              <li>Aulas 1:1 ao vivo no Zoom com foco em conversação real</li>
              <li>Decks de slides interativos para praticar connected speech</li>
              <li>Ambiente descontraído, sem pressão e sem gramática decorada</li>
              <li>Flexibilidade de horários na sua semana</li>
            </ul>
          </div>

          <div style="text-align:center;margin:32px 0">
            <a href="${APP_URL}/dashboard" 
               style="display:inline-block;background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
              Acessar Meu Painel
            </a>
          </div>

          <p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">
            <strong>ELO!</strong><br/>
            Seu professor de inglês americano no Rio<br/>
            eloingles.com.br · ${REPLY_TO_EMAIL}
          </p>
        </div>
      `,
    });

    res.status(200).json({ success: result.success, details: result });
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleTutorApplicationReceived(req: VercelRequest, res: VercelResponse) {
  try {
    const { displayName, email, accent, experience, videoLink } = req.body;

    // 1. Confirm to Applicant
    await sendEmailWithFallback({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: email,
      subject: `Candidatura Recebida - Equipe ELO!`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb;margin-bottom:8px">ELO! Native Tutors</h2>
          <p style="margin:0 0 24px 0;font-size:16px">
            Hi <strong>${displayName}</strong>,
          </p>
          <p style="margin:0 0 20px 0">
            Thank you for applying to teach with ELO! We have received your application and video intro.
          </p>
          <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:16px;border-radius:4px;margin:20px 0">
            <p style="margin:0;font-size:14px;color:#475569">
              Our team reviews applications within 24-48 hours. Once approved, you will be able to set your availability and host 1:1 Zoom sessions with Brazilian students.
            </p>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">
            ELO! Language Platform · eloingles.com.br
          </p>
        </div>
      `
    });

    // 2. Alert Admin
    await sendEmailWithFallback({
      from: FROM_EMAIL,
      replyTo: email,
      to: ADMIN_EMAILS,
      subject: `[NOVO TUTOR] Nova Candidatura de ${displayName}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb">Nova Candidatura de Tutor</h2>
          <p><strong>Nome:</strong> ${displayName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Sotaque:</strong> ${accent}</p>
          <p><strong>Experiência:</strong> ${experience}</p>
          <p><strong>Vídeo:</strong> <a href="${videoLink}">${videoLink}</a></p>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Error handling tutor application email:', err);
    return res.status(500).json({ error: err.message || err });
  }
}

async function handleTutorDecision(req: VercelRequest, res: VercelResponse) {
  try {
    const { displayName, email, decision } = req.body;

    const isApproved = decision === 'approved';
    const subject = isApproved 
      ? `Parabéns! Sua candidatura como Tutor no ELO! foi aprovada 🎉`
      : `Atualização sobre sua candidatura no ELO!`;

    const htmlContent = isApproved ? `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#22c55e">Parabéns e Bem-vindo à equipe ELO!</h2>
        <p>Olá, <strong>${displayName}</strong>!</p>
        <p>Sua candidatura para se tornar um professor no ELO! foi <strong>aprovada</strong> com sucesso.</p>
        <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px;border-radius:4px;margin:20px 0">
          <p style="margin:0;font-size:14px">Você já pode acessar a plataforma, abrir seus horários na agenda e começar a dar aulas 1:1 para nossos alunos.</p>
        </div>
        <a href="${APP_URL}/agenda" style="display:inline-block;background:#22c55e;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
          Acessar Minha Agenda de Tutor
        </a>
      </div>
    ` : `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#475569">Atualização de Candidatura - ELO!</h2>
        <p>Olá, <strong>${displayName}</strong>.</p>
        <p>Agradecemos muito pelo seu interesse em ensinar no ELO! No momento, decidimos não avançar com sua candidatura para o nosso quadro atual de vagas.</p>
        <p>Manteremos seus dados em nosso banco para futuras oportunidades.</p>
      </div>
    `;

    const result = await sendEmailWithFallback({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: email,
      subject,
      html: htmlContent
    });

    return res.status(200).json({ success: result.success });
  } catch (err: any) {
    console.error('Error sending tutor decision email:', err);
    return res.status(500).json({ error: err.message || err });
  }
}

async function handleAppDownloadInvite(req: VercelRequest, res: VercelResponse) {
  try {
    const { name, email } = req.body;

    const result = await sendEmailWithFallback({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: email,
      subject: `Baixe o App ELO! no seu celular 📱`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#2563eb">Tenha o ELO! sempre no seu bolso</h2>
          <p>Olá, <strong>${name || 'Aluno'}</strong>!</p>
          <p>Você pode instalar o app do ELO! diretamente no seu celular para receber lembretes de aulas e praticar onde estiver.</p>
          
          <div style="margin:24px 0;text-align:center">
            <a href="${APP_URL}" style="display:inline-block;background:#2563eb;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold">
              Instalar / Abrir App Web
            </a>
          </div>

          <p style="color:#64748b;font-size:13px">
            No Chrome ou Safari, clique em <strong>Compartilhar</strong> e selecione <strong>"Adicionar à Tela de Início"</strong>.
          </p>
        </div>
      `
    });

    return res.status(200).json({ success: result.success });
  } catch (err: any) {
    console.error('Error sending app invite email:', err);
    return res.status(500).json({ error: err.message || err });
  }
}

async function handleBookingCancellation(req: VercelRequest, res: VercelResponse) {
  try {
    const {
      attendeeName, attendeeEmail,
      date, time, deservesRefund, cancellationType
    } = req.body;

    const formattedDate = new Date(date + 'T00:00:00')
      .toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long'
      });

    const isTutorCancel = cancellationType === 'tutor';

    const refundText = deservesRefund
      ? 'Seu crédito/aula foi reembolsado e está disponível para novo agendamento.'
      : 'Atenção: Cancelamentos com menos de 24 horas de antecedência não geram reembolso de créditos.';

    const emailSubject = isTutorCancel
      ? `Aula Cancelada pelo Professor - ${formattedDate}`
      : `Confirmação de Cancelamento de Aula - ${formattedDate}`;

    const htmlContent = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#dc2626;margin-bottom:8px">ELO!</h2>
        <p style="margin:0 0 24px 0;font-size:16px">
          Olá, <strong>${attendeeName}</strong>!
        </p>
        <p style="margin:0 0 20px 0">
          ${isTutorCancel 
            ? 'Infelizmente, o professor precisou cancelar a aula agendada abaixo. Pedimos desculpas pelo inconveniente.' 
            : 'Confirmamos o cancelamento da sua aula abaixo conforme solicitado.'}
        </p>
        
        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:4px;margin:20px 0">
          <p style="margin:0;font-size:15px;line-height:1.5;color:#991b1b">
            <strong>${formattedDate}</strong> às ${time}<br/>
            Duração: 60 minutos<br/>
            Status: <strong>Cancelado</strong>
          </p>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:4px;margin:20px 0">
          <p style="margin:0;font-size:13px;color:#475569;line-height:1.5">
            <strong>Política de Reembolso:</strong><br/>
            ${isTutorCancel ? 'Seu crédito foi totalmente reembolsado para sua conta.' : refundText}
          </p>
        </div>

        <p style="color:#64748b;font-size:13px;margin-top:24px">
          Quer agendar um novo horário? 
          <a href="${APP_URL}/dashboard" style="color:#2563eb;font-weight:bold">
            Acesse seu dashboard
          </a>.
        </p>

        <p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">
          <strong>ELO!</strong><br/>
          Inglês americano sem pressão<br/>
          eloingles.com.br · ${REPLY_TO_EMAIL}
        </p>
      </div>
    `;

    const toEmails = [attendeeEmail, ...ADMIN_EMAILS].filter(Boolean);
    const result = await sendEmailWithFallback({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to: toEmails,
      subject: emailSubject,
      html: htmlContent,
    });

    res.status(200).json({ success: result.success });
  } catch (error) {
    console.error('Booking cancellation email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleLessonReminder(req: VercelRequest, res: VercelResponse) {
  try {
    const token = await getFirestoreAccessToken();
    const projectId = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!).project_id;
    const baseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const queryUrl = `${baseRestUrl}:runQuery`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'bookings' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: 'status' },
                  op: 'EQUAL',
                  value: { stringValue: 'confirmed' }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'date' },
                  op: 'GREATER_THAN_OR_EQUAL',
                  value: { stringValue: todayStr }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'date' },
                  op: 'LESS_THAN_OR_EQUAL',
                  value: { stringValue: tomorrowStr }
                }
              }
            ]
          }
        }
      }
    };

    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });

    const queryResults = await queryResponse.json();
    const bookings = Array.isArray(queryResults)
      ? queryResults
          .filter((item: any) => item.document)
          .map((item: any) => {
            const fields = item.document.fields;
            return {
              id: item.document.name.split('/').pop(),
              userId: fields.userId?.stringValue || fields.uid?.stringValue,
              userName: fields.userName?.stringValue || fields.studentName?.stringValue || 'Estudante',
              userEmail: fields.userEmail?.stringValue || fields.studentEmail?.stringValue,
              date: fields.date?.stringValue,
              time: fields.time?.stringValue,
              duration: parseInt(fields.duration?.integerValue || '60', 10),
              meetLink: fields.meetLink?.stringValue || null,
              notes: fields.notes?.stringValue || null
            };
          })
      : [];

    if (bookings.length === 0) {
      return res.status(200).json({ message: 'No lessons to remind' });
    }

    const results = await Promise.allSettled(
      bookings.map(async (booking: any) => {
        const { userName, userEmail, date, time, duration, notes } = booking;
        if (!userEmail) return { skipped: true, reason: 'No email address' };

        const lessonDateTime = new Date(`${date}T${time}:00-03:00`);
        const hoursUntilLesson = (lessonDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilLesson <= 24 && hoursUntilLesson > 0.5) {
          const formattedDate = new Date(date + 'T00:00:00')
            .toLocaleDateString('pt-BR', {
              weekday: 'long', day: 'numeric', month: 'long'
            });

          const sendResult = await sendEmailWithFallback({
            from: FROM_EMAIL,
            replyTo: REPLY_TO_EMAIL,
            to: userEmail,
            subject: `Lembrete: Sua aula é amanhã - ${formattedDate}`,
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
                <h2 style="color:#2563eb;margin-bottom:8px">ELO!</h2>
                <p style="margin:0 0 24px 0;font-size:16px">
                  Olá, <strong>${userName}</strong>!
                </p>
                
                <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:4px;margin:20px 0">
                  <h3 style="margin:0 0 8px 0;color:#92400e;font-size:16px">
                    Lembrete de Aula
                  </h3>
                  <p style="margin:0;font-size:15px;line-height:1.5">
                    <strong>${formattedDate}</strong> às ${time}<br/>
                    Duração: ${duration} minutos<br/>
                    Professor: Professor Matt
                  </p>
                  ${notes ? `<p style="margin:8px 0 0 0;font-size:14px;color:#92400e">
                    <strong>Seu tema:</strong> ${notes}
                  </p>` : ''}
                </div>

                <div style="margin:20px 0;text-align:center">
                  <a href="${booking.meetLink || `${APP_URL}/classroom`}" 
                     style="display:inline-block;background:#2563eb;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;margin-bottom:10px">
                    📹 Entrar na Sala de Aula ao Vivo
                  </a>
                </div>

                <p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">
                  <strong>ELO!</strong><br/>
                  eloingles.com.br · ${REPLY_TO_EMAIL}
                </p>
              </div>
            `,
          });

          return { bookingId: booking.id, success: sendResult.success, result: sendResult };
        }
        
        return { bookingId: booking.id, skipped: true, reason: 'Outside reminder window' };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && !(r.value as any).skipped && (r.value as any).success).length;

    res.status(200).json({ 
      message: 'Lesson reminders processed',
      total: bookings.length,
      successful
    });

  } catch (error: any) {
    console.error('Lesson reminder error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
