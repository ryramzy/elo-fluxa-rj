import { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getFirestoreAccessToken } from './utils/googleAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.split('?')[0] ?? '';

  if ((path.endsWith('/admin/force-create-slots') || path === '/api/admin/force-create-slots' || path.endsWith('/force-create-slots') || path === '/api/force-create-slots')) {
    return handleForceCreateSlots(req, res);
  }
  if ((path.endsWith('/admin/b2b-report') || path === '/api/admin/b2b-report' || path.endsWith('/cron/b2b-report') || path === '/api/cron/b2b-report')) {
    return handleB2BReport(req, res);
  }
  if ((path.endsWith('/admin/mercado-pago') || path === '/api/admin/mercado-pago' || path.endsWith('/webhooks/mercado-pago') || path === '/api/webhooks/mercado-pago') && req.method === 'POST') {
    return handleMercadoPagoWebhook(req, res);
  }

  return res.status(404).json({ error: `Not found: ${path}` });
}

async function handleForceCreateSlots(req: VercelRequest, res: VercelResponse) {
  try {
    const token = await getFirestoreAccessToken();
    const projectId = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!).project_id;
    const baseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (req.method === 'POST') {
      console.log('🔥 FORCE CREATING SLOTS - Direct REST API Approach');
      
      const queryUrl = `${baseRestUrl}:runQuery`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: 'slots' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'date' },
              op: 'EQUAL',
              value: { stringValue: todayStr }
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
      
      if (Array.isArray(queryResults)) {
        const deletePromises = queryResults
          .filter((item: any) => item.document)
          .map((item: any) => {
            const docName = item.document.name;
            const deleteUrl = `https://firestore.googleapis.com/v1/${docName}`;
            return fetch(deleteUrl, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
          });
        await Promise.all(deletePromises);
        console.log(`🗑️ Deleted slots for today`);
      }

      const createdSlots = [];
      const createUrl = `${baseRestUrl}/slots`;

      for (let hour = 8; hour <= 21; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const slotBody = {
          fields: {
            date: { stringValue: todayStr },
            time: { stringValue: timeString },
            duration: { integerValue: '60' },
            available: { booleanValue: true },
            status: { stringValue: 'available' },
            createdAt: { timestampValue: new Date().toISOString() },
            updatedAt: { timestampValue: new Date().toISOString() }
          }
        };

        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(slotBody)
        });

        if (createResponse.ok) {
          const slotData = await createResponse.json();
          createdSlots.push(slotData);
          console.log(`✅ Created slot: ${todayStr} ${timeString}`);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Created ${createdSlots.length} slots for ${todayStr}`,
        date: todayStr,
        totalSlots: createdSlots.length
      });
    }

    if (req.method === 'GET') {
      console.log('🔍 CHECKING CURRENT SLOTS STATUS');
      
      const queryUrl = `${baseRestUrl}:runQuery`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: 'slots' }],
          where: {
            compositeFilter: {
              op: 'AND',
              filters: [
                {
                  fieldFilter: {
                    field: { fieldPath: 'date' },
                    op: 'EQUAL',
                    value: { stringValue: todayStr }
                  }
                },
                {
                  fieldFilter: {
                    field: { fieldPath: 'available' },
                    op: 'EQUAL',
                    value: { booleanValue: true }
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
      const existingSlots = Array.isArray(queryResults)
        ? queryResults
            .filter((item: any) => item.document)
            .map((item: any) => {
              const doc = item.document;
              const fields = doc.fields;
              const parts = doc.name.split('/');
              const id = parts[parts.length - 1];
              return {
                id,
                date: fields.date?.stringValue,
                time: fields.time?.stringValue,
                available: fields.available?.booleanValue,
                status: fields.status?.stringValue
              };
            })
        : [];

      return res.status(200).json({
        success: true,
        date: todayStr,
        existingSlots,
        totalSlots: existingSlots.length,
        message: `Found ${existingSlots.length} slots for ${todayStr}`
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('❌ Error in force-create-slots handler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
}

async function handleB2BReport(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'organizationId' },
            op: 'GREATER_THAN_OR_EQUAL',
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
    
    const activeB2BUsers = Array.isArray(rawMetrics)
      ? rawMetrics
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
          })
      : [];

    if (activeB2BUsers.length === 0) {
      console.log('[B2B Cron] No active corporate accounts detected.');
      return res.status(200).json({ message: 'No corporate accounts to report.' });
    }

    const orgGroups: Record<string, typeof activeB2BUsers> = {};
    activeB2BUsers.forEach(user => {
      if (!orgGroups[user.org]) orgGroups[user.org] = [];
      orgGroups[user.org].push(user);
    });

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

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Elo! Corporate Reports <noreply@elospeak.com.br>',
      replyTo: 'matt@elospeak.com.br',
      to: ['mramsay0@gmail.com', 'erneleducation@gmail.com', 'mramsayo@gmail.com'],
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

async function handleMercadoPagoWebhook(req: VercelRequest, res: VercelResponse) {
  try {
    const { action, data } = req.body;

    if (action !== 'payment.updated' && action !== 'payment.created') {
      return res.status(200).json({ received: true, msg: 'Ignored action' });
    }

    const paymentId = data?.id;
    if (!paymentId) return res.status(400).json({ error: 'Missing object identifier' });

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` }
    });
    
    if (!mpRes.ok) throw new Error('Failed validation sync against Mercado Pago API');
    const paymentData = await mpRes.json();

    if (paymentData.status !== 'approved') {
      return res.status(200).json({ msg: 'Payment processing pending approval' });
    }

    const payerEmail = paymentData.payer?.email;
    const planType = paymentData.metadata?.plan_type || 'pro';
    const userId = paymentData.metadata?.user_id;
    const bookingLimit = planType === 'elite' ? 12 : 4;

    const token = await getFirestoreAccessToken();
    const projectId = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!).project_id;
    const baseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    let patchUrl = '';

    if (userId) {
      console.log(`[Webhook] Upgrading plan using metadata user_id: ${userId}`);
      patchUrl = `${baseRestUrl}/users/${userId}?updateMask.fieldPaths=plan&updateMask.fieldPaths=bookingLimit`;
    } else {
      console.log(`[Webhook] No user_id in metadata. Querying by email: ${payerEmail}`);
      const queryUrl = `${baseRestUrl}:runQuery`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: 'users' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'email' },
              op: 'EQUAL',
              value: { stringValue: payerEmail }
            }
          },
          limit: 1
        }
      };

      const queryResponse = await fetch(queryUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      });

      const queryResults = await queryResponse.json();
      const documentData = queryResults[0]?.document;
      
      if (!documentData) {
        throw new Error(`Zero registered database documents matched email: ${payerEmail}`);
      }
      patchUrl = `${documentData.name}?updateMask.fieldPaths=plan&updateMask.fieldPaths=bookingLimit`;
    }

    const patchBody = {
      fields: {
        plan: { stringValue: planType },
        bookingLimit: { integerValue: String(bookingLimit) }
      }
    };

    const patchResponse = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody)
    });

    if (!patchResponse.ok) {
      const patchError = await patchResponse.text();
      throw new Error(`Failed to update user plan: ${patchError}`);
    }

    const enrollmentUrl = `${baseRestUrl}/enrollments`;
    const enrollmentBody = {
      fields: {
        payerEmail: { stringValue: payerEmail },
        paymentId: { stringValue: String(paymentId) },
        amount: { doubleValue: paymentData.transaction_amount },
        timestamp: { timestampValue: new Date().toISOString() }
      }
    };

    await fetch(enrollmentUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(enrollmentBody)
    });

    return res.status(200).json({ success: true, upgraded: payerEmail });
  } catch (error: any) {
    console.error('Serverless REST processing error:', error);
    return res.status(500).json({ error: error.message });
  }
}
