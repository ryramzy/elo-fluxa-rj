import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized successfully via credentials.');
    } catch (parseErr) {
      console.error('❌ Failed to parse Google Service Account key:', parseErr);
      admin.initializeApp(); // Fallback
    }
  } else {
    console.warn('⚠️ GOOGLE_SERVICE_ACCOUNT_KEY not found in environment, falling back to default app credentials.');
    admin.initializeApp();
  }
}

const db = admin.firestore();
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Respond immediately to GET tests or options requests
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'active', message: 'Mercado Pago Webhook endpoint is active and listening.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Received Mercado Pago Webhook Payload:', JSON.stringify(req.body));

    // Extract transaction properties from body or query variables
    const paymentId = req.body?.data?.id || req.query?.['data.id'] || req.query?.id;
    const action = req.body?.action || req.body?.type || req.query?.type;

    // Check if it is a payment event
    if (!paymentId || (action && action !== 'payment.created' && action !== 'payment.updated' && action !== 'payment')) {
      console.log(`ℹ️ Event skipped. Action: ${action}, Payment ID: ${paymentId}`);
      return res.status(200).json({ received: true, message: 'Event ignored.' });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('❌ MERCADO_PAGO_ACCESS_TOKEN is missing in environment variables.');
      // Return 200 to prevent Mercado Pago from repeatedly retrying with server errors
      return res.status(200).json({ error: 'Gateway token not configured.' });
    }

    // 1. Fetch payment details from Mercado Pago API using native fetch
    console.log(`🔍 Fetching details for Payment ID: ${paymentId}`);
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error(`❌ Failed to fetch payment details from Mercado Pago API: ${mpResponse.status} - ${errText}`);
      return res.status(200).json({ error: 'Failed to retrieve payment details.' });
    }

    const paymentData = await mpResponse.json();
    console.log('✅ Retained payment payload details:', JSON.stringify(paymentData));

    const status = paymentData.status;
    const externalReference = paymentData.external_reference; // Contains student uid
    const transactionAmount = paymentData.transaction_amount;
    const payerEmail = paymentData.payer?.email;
    const description = paymentData.description || '';

    // Only process approved transactions
    if (status !== 'approved') {
      console.log(`ℹ️ Payment status is not approved: ${status}. Skipping upgrade.`);
      return res.status(200).json({ received: true, status });
    }

    // 2. Identify the target student uid
    let targetUid = externalReference;
    if (!targetUid && payerEmail) {
      console.log(`⚠️ external_reference was missing. Searching user profiles by payer email: ${payerEmail}`);
      const usersSnapshot = await db.collection('users')
        .where('email', '==', payerEmail)
        .limit(1)
        .get();
        
      if (!usersSnapshot.empty) {
        targetUid = usersSnapshot.docs[0].id;
        console.log(`🎯 Matched student uid by email query: ${targetUid}`);
      }
    }

    if (!targetUid) {
      console.error('❌ Could not associate payment with any user. external_reference and email match both failed.');
      return res.status(200).json({ error: 'User mapping failed.' });
    }

    // 3. Determine the plan type ('pro' vs 'elite') from description keywords
    let planName: 'pro' | 'elite' = 'pro';
    const isElite = description.toLowerCase().includes('elite') || description.toLowerCase().includes('imersão') || description.toLowerCase().includes('imersao') || description.toLowerCase().includes('197');
    if (isElite) {
      planName = 'elite';
    }

    console.log(`🚀 Upgrading student UID: ${targetUid} to plan: ${planName.toUpperCase()}`);

    // 4. Update the user document in Firestore securely bypassing security rules
    const userRef = db.collection('users').doc(targetUid);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      console.error(`❌ User document with UID ${targetUid} does not exist in Firestore.`);
      return res.status(200).json({ error: 'User document not found.' });
    }

    const userData = userSnap.data() || {};
    const studentName = userData.displayName || payerEmail?.split('@')[0] || 'Estudante';
    const studentEmail = userData.email || payerEmail || '';

    await userRef.update({
      plan: planName,
      planActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      planUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      bookingLimit: planName === 'pro' ? 4 : 999
    });

    console.log('✅ Updated user plan settings in Firestore.');

    // 5. Create transaction enrollment receipt log
    const enrollmentRef = await db.collection('enrollments').add({
      userId: targetUid,
      userName: studentName,
      userEmail: studentEmail,
      courseId: `plan-${planName}`,
      pricePaid: transactionAmount || (planName === 'pro' ? 97 : 197),
      paymentMethod: 'pix',
      paymentId: String(paymentId),
      enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      emailSent: true
    });

    console.log(`🧾 Enrollment receipt generated in Firestore: ${enrollmentRef.id}`);

    // 6. Send transactional Resend email confirmation
    if (studentEmail) {
      try {
        await resend.emails.send({
          from: 'Elo! English <noreply@elospeak.com.br>',
          replyTo: 'matt@elospeak.com.br',
          to: [studentEmail],
          subject: 'Seu acesso Premium foi ativado! 🚀 - Elo! English',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #2563eb; margin-top: 0;">Parabéns, ${studentName}!</h2>
              <p>Detectamos seu pagamento via Pix e sua assinatura do plano <strong>${planName === 'pro' ? 'Fluente (Pro)' : 'Imersão Total (Elite)'}</strong> já está ativa na sua conta!</p>
              <p>O que foi desbloqueado:</p>
              <ul>
                <li>Todas as trilhas de conversação e gramática 100% livres</li>
                <li>Sessões ao vivo com o Professor Matt</li>
                <li>Simulador de conversação IA ilimitado</li>
              </ul>
              <p style="margin-top: 24px;">
                <a href="https://elospeak.com.br/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Entrar na Plataforma
                </a>
              </p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 11px; color: #64748b; text-align: center;">© 2026 Elo! English · Cancelamentos podem ser feitos a qualquer momento pelo perfil.</p>
            </div>
          `
        });
        console.log(`📧 Confirmation email successfully sent to ${studentEmail}`);
      } catch (emailErr) {
        console.error('❌ Failed to dispatch email via Resend:', emailErr);
      }
    }

    return res.status(200).json({ received: true, status: 'success', upgraded: targetUid });

  } catch (error) {
    console.error('❌ Webhook processor general crash error:', error);
    return res.status(500).json({ 
      error: 'Internal Webhook Server Error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
