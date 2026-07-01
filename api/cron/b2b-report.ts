import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '../../src/lib/firebase';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET/POST for Vercel Cron executions
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Vercel Cron security authorization header in production
  const authHeader = req.headers.authorization;
  if (process.env.NODE_ENV === 'production') {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.warn('[B2B Cron] CRON_SECRET is not configured on server.');
    } else if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized cron execution' });
    }
  }

  try {
    console.log('[B2B Cron] Running B2B aggregate audit report...');
    
    // Fetch all users to consolidate corporate logs
    const usersQuery = query(collection(db, 'users'));
    const snapshot = await getDocs(usersQuery);
    
    const corporateUsers: any[] = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.organizationId) {
        corporateUsers.push({
          id: doc.id,
          name: data.displayName || data.email?.split('@')[0] || 'Student',
          email: data.email || 'N/A',
          org: data.organizationId,
          xp: data.xp || 0,
          streak: data.streakDays || 0,
          credits: data.corporateCredits ?? 0
        });
      }
    });

    if (corporateUsers.length === 0) {
      console.log('[B2B Cron] No active corporate accounts detected.');
      return res.status(200).json({ message: 'No corporate accounts to report.' });
    }

    // Group metrics by organization
    const orgGroups: Record<string, typeof corporateUsers> = {};
    corporateUsers.forEach(user => {
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
            <td style="padding: 8px 0;"><strong>${u.name}</strong><br/><span style="color: #94a3b8; font-size: 10px;">${u.email}</span></td>
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

    // Dispatch aggregate report email via Resend to admin list
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
    return res.status(200).json({ message: 'B2B report sent successfully.', emailId: data?.id });

  } catch (error) {
    console.error('[B2B Cron] Error generating B2B report:', error);
    return res.status(500).json({ 
      error: 'Failed to process B2B cron report',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
