import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getFirestoreAccessToken } from '../utils/googleAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET/POST for Vercel Cron executions
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Verify Vercel Cron security authorization header in production
  const authHeader = req.headers.authorization;
  if (process.env.NODE_ENV === 'production') {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.warn('[B2B Cron] CRON_SECRET is not configured on server.');
    } else if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized cron access call' });
    }
  }

  try {
    const token = await getFirestoreAccessToken();
    const projectId = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!).project_id;
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

    // Query payload targeted at corporate organization matching
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'organizationId' },
            op: 'GREATER_THAN_OR_EQUAL', // Isolates records with valid string organizationIds
            value: { stringValue: '' }
          }
        }
      }
    };

    const restResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });

    const rawMetrics = await restResponse.json();
    
    // Clean, reduce, and parse standard REST structures into functional telemetry maps
    const activeB2BUsers = rawMetrics
      .filter((item: any) => item.document)
      .map((item: any) => {
        const fields = item.document.fields;
        return {
          email: fields.email?.stringValue || 'N/A',
          org: fields.organizationId?.stringValue || 'N/A',
          xp: parseInt(fields.xp?.integerValue || '0', 10),
          streak: parseInt(fields.streak?.integerValue || '0', 10),
          credits: parseInt(fields.corporateCredits?.integerValue || '0', 10)
        };
      });

    if (activeB2BUsers.length === 0) {
      console.log('[B2B Cron] No active corporate accounts detected.');
      return res.status(200).json({ message: 'No corporate accounts to report.' });
    }

    // Group metrics by organization
    const orgGroups: Record<string, typeof activeB2BUsers> = {};
    activeB2BUsers.forEach(user => {
      if (!orgGroups[user.org]) orgGroups[user.org] = [];
      orgGroups[user.org].push(user);
    });

    // Compile dynamic HTML report table rows
    let emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
        <h2 style="color: #2563eb; margin-top: 0; margin-bottom: 4px;">Elo! B2B Audit Report</h2>
        <p style="font-size: 13px; color: #64748b; margin-top: 0; margin-bottom: 24px;">Relatório consolidado de engajamento corporativo semanal.</p>
    `;

    for (const [orgId, users] of Object.entries(orgGroups)) {
      emailHtml += `
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #3b82f6; display: inline-block; padding-bottom: 2px;">
            Empresa: ${orgId.toUpperCase()}
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid #cbd5e1; color: #475569;">
                <th style="padding: 6px 0; font-weight: 600;">Estudante</th>
                <th style="padding: 6px 0; font-weight: 600; text-align: center;">XP</th>
                <th style="padding: 6px 0; font-weight: 600; text-align: center;">Ofensiva</th>
                <th style="padding: 6px 0; font-weight: 600; text-align: center;">Créditos</th>
              </tr>
            </thead>
            <tbody>
      `;

      users.forEach(u => {
        emailHtml += `
          <tr style="border-bottom: 1px solid #f1f5f9; color: #334155;">
            <td style="padding: 8px 0;"><strong>${u.email.split('@')[0]}</strong><br/><span style="color: #94a3b8; font-size: 10px;">${u.email}</span></td>
            <td style="padding: 8px 0; text-align: center;">${u.xp}</td>
            <td style="padding: 8px 0; text-align: center;">🔥 ${u.streak}d</td>
            <td style="padding: 8px 0; text-align: center;">${u.credits}</td>
          </tr>
        `;
      });

      emailHtml += `
            </tbody>
          </table>
        </div>
      `;
    }

    emailHtml += `
        <div style="text-align: center; font-size: 10px; color: #94a3b8; margin-top: 24px;">
          <p>© 2026 Elo! English · Relatório automatizado semanal</p>
        </div>
      </div>
    `;

    // Initialize Resend and dispatch email
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Elo! Corporate Reports <noreply@elospeak.com.br>',
      replyTo: 'matt@elospeak.com.br',
      to: ['mramsao@gmail.com'],
      subject: `Relatório de Performance B2B - Elo!`,
      html: emailHtml
    });

    if (error) {
      throw new Error(`Resend email error: ${JSON.stringify(error)}`);
    }

    console.log('[B2B Cron] Report sent successfully:', data?.id);
    return res.status(200).json({ success: true, processed: activeB2BUsers.length, emailId: data?.id });

  } catch (error: any) {
    console.error('[B2B Cron] Error generating B2B report:', error);
    return res.status(500).json({ error: error.message });
  }
}
