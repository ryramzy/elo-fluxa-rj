import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestoreAccessToken } from '../utils/googleAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    console.error('[Mercado Pago Webhook] Access token is not configured.');
    return res.status(500).json({ error: 'Mercado Pago webhook credentials not set.' });
  }

  try {
    const paymentId = req.body?.data?.id || req.body?.id || req.query?.id;
    const topic = req.body?.type || req.query?.topic;

    if (!paymentId || (topic && topic !== 'payment')) {
      console.log('[Mercado Pago Webhook] Ignoring non-payment topic or missing ID:', topic);
      return res.status(200).json({ received: true });
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!mpRes.ok) {
      throw new Error(`Failed to fetch payment details: ${await mpRes.text()}`);
    }

    const paymentData = await mpRes.json();
    const { status, metadata, transaction_amount } = paymentData;

    if (status === 'approved' && metadata) {
      const userId = metadata.user_id;
      const planType = metadata.plan_type || 'pro';
      const payerEmail = metadata.payer_email;

      if (!userId) {
        console.warn('[Mercado Pago Webhook] Missing user_id in payment metadata.');
        return res.status(200).json({ received: true, warning: 'No userId in metadata' });
      }

      let bookingLimit = 4;
      if (planType === 'elite') {
        bookingLimit = 12;
      }

      const googleAuthToken = await getFirestoreAccessToken();
      const projectId = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!).project_id;
      const baseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
      
      // Fetch user profile to verify referredBy details
      const userRes = await fetch(`${baseRestUrl}/users/${userId}`, {
        headers: { Authorization: `Bearer ${googleAuthToken}` }
      });
      
      let referredBy: string | null = null;
      let hasReferredRewardBeenPaid = false;
      
      if (userRes.ok) {
        const userData = await userRes.json();
        referredBy = userData.fields?.referredBy?.stringValue || null;
        hasReferredRewardBeenPaid = userData.fields?.hasReferredRewardBeenPaid?.booleanValue || false;
      }

      // Configure plan activation variables
      let patchUrl = `${baseRestUrl}/users/${userId}?updateMask.fieldPaths=plan&updateMask.fieldPaths=bookingLimit&updateMask.fieldPaths=bookingsThisMonth&updateMask.fieldPaths=paymentPastDue`;
      const fieldsToPatch: any = {
        plan: { stringValue: planType },
        bookingLimit: { integerValue: String(bookingLimit) },
        bookingsThisMonth: { integerValue: '0' },
        paymentPastDue: { booleanValue: false }
      };

      // Process referral reward if referrer is present and reward not paid yet
      if (referredBy && !hasReferredRewardBeenPaid) {
        fieldsToPatch.hasReferredRewardBeenPaid = { booleanValue: true };
        patchUrl += '&updateMask.fieldPaths=hasReferredRewardBeenPaid';

        // 1. Fetch referrer profile
        const refRes = await fetch(`${baseRestUrl}/users/${referredBy}`, {
          headers: { Authorization: `Bearer ${googleAuthToken}` }
        });
        
        if (refRes.ok) {
          const refData = await refRes.json();
          const currentCredits = Number(refData.fields?.corporateCredits?.integerValue || 
                                       refData.fields?.corporateCredits?.doubleValue || 0);
          const newCredits = currentCredits + 1;
          
          // 2. Patch referrer credits (+1 credit)
          await fetch(`${baseRestUrl}/users/${referredBy}?updateMask.fieldPaths=corporateCredits`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${googleAuthToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: {
                corporateCredits: { integerValue: String(newCredits) }
              }
            })
          });

          // Log referral credit audit log
          await fetch(`${baseRestUrl}/audit_logs`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${googleAuthToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: {
                action: { stringValue: 'referral_reward_processed' },
                userId: { stringValue: referredBy },
                timestamp: { timestampValue: new Date().toISOString() },
                details: {
                  mapValue: {
                    fields: {
                      referredUserId: { stringValue: userId },
                      creditIncrement: { integerValue: '1' }
                    }
                  }
                }
              }
            })
          });
          console.log(`[Mercado Pago Webhook] Credited +1 referral lesson to referrer ${referredBy} for user ${userId}`);
        }
      }

      // Activate plan in Firestore
      const patchResponse = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${googleAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: fieldsToPatch })
      });

      if (!patchResponse.ok) {
        throw new Error(`Failed to update user plan: ${await patchResponse.text()}`);
      }

      console.log(`[Mercado Pago Webhook] Activated plan ${planType} for user ${userId}`);

      // Log transaction audit log
      const auditBody = {
        fields: {
          action: { stringValue: 'mercado_pago_payment_received' },
          userId: { stringValue: userId },
          timestamp: { timestampValue: new Date().toISOString() },
          details: {
            mapValue: {
              fields: {
                paymentId: { stringValue: String(paymentId) },
                plan: { stringValue: planType },
                amount: { doubleValue: Number(transaction_amount || 0) },
                email: { stringValue: payerEmail || '' }
              }
            }
          }
        }
      };

      await fetch(`${baseRestUrl}/audit_logs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(auditBody)
      });
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[Mercado Pago Webhook Error]:', error);
    return res.status(500).json({ error: error.message || 'Internal server error in webhook handler.' });
  }
}
