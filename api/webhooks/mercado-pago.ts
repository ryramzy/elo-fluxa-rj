import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestoreAccessToken } from '../utils/googleAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action, data } = req.body;

    // Only process finalized payment actions
    if (action !== 'payment.updated' && action !== 'payment.created') {
      return res.status(200).json({ received: true, msg: 'Ignored action' });
    }

    const paymentId = data?.id;
    if (!paymentId) return res.status(400).json({ error: 'Missing object identifier' });

    // 1. Fetch live payment payload directly from Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` }
    });
    
    if (!mpRes.ok) throw new Error('Failed validation sync against Mercado Pago API');
    const paymentData = await mpRes.json();

    if (paymentData.status !== 'approved') {
      return res.status(200).json({ msg: 'Payment processing pending approval' });
    }

    const payerEmail = paymentData.payer?.email;
    const planType = paymentData.metadata?.plan_type || 'pro'; // Default to fallback
    const bookingLimit = planType === 'elite' ? 12 : 4;

    const token = await getFirestoreAccessToken();
    const projectId = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!).project_id;
    const baseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    // 2. runQuery to reverse-lookup student UID by email attribute
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

    const docName = documentData.name; // Full path: projects/{id}/databases/(default)/documents/users/{uid}
    
    // 3. Document PATCH Request to upgrade plan variables using a fieldMask
    const patchUrl = `${docName}?updateMask.fieldPaths=plan&updateMask.fieldPaths=bookingLimit`;
    const patchBody = {
      fields: {
        plan: { stringValue: planType },
        bookingLimit: { integerValue: String(bookingLimit) }
      }
    };

    await fetch(patchUrl, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody)
    });

    // 4. Save structural record log inside root enrollments collection
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
