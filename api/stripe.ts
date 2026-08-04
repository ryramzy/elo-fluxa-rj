import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getFirestoreAccessToken } from './utils/googleAuth';
import { Readable } from 'stream';

// Disable default Vercel body parsing to allow raw signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable: Readable): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url?.split('?')[0] ?? '';

  if (path.endsWith('/stripe/checkout') || path === '/api/stripe/checkout') {
    return handleCheckout(req, res);
  }
  if (path.endsWith('/stripe/webhook') || path === '/api/stripe/webhook' || path.endsWith('/webhooks/stripe') || path === '/api/webhooks/stripe') {
    return handleWebhook(req, res);
  }

  return res.status(404).json({ error: `Not found: ${path}` });
}

async function handleCheckout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const rawBody = await getRawBody(req);
    const { priceId, email, userId } = JSON.parse(rawBody.toString('utf8'));

    if (!priceId || !email || !userId) {
      return res.status(400).json({ error: 'Missing required fields: priceId, email, userId' });
    }

    const token = process.env.STRIPE_SECRET_KEY;
    if (!token) {
      console.warn('[Stripe] STRIPE_SECRET_KEY is not configured. Falling back to sandbox mock redirect.');
      
      // Auto-upgrade user profile in sandbox if Firestore credentials exist
      try {
        if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
          const googleAuthToken = await getFirestoreAccessToken();
          const projectId = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY).project_id;
          const baseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
          const patchUrl = `${baseRestUrl}/users/${userId}?updateMask.fieldPaths=plan&updateMask.fieldPaths=bookingLimit&updateMask.fieldPaths=bookingsThisMonth&updateMask.fieldPaths=paymentPastDue`;

          let planType = 'pro';
          let bookingLimit = 4;
          // Match generic IDs or environment variables
          if (
            priceId === process.env.STRIPE_PRICE_IMERSAO || 
            String(priceId).toLowerCase().includes('imersao') || 
            String(priceId).toLowerCase().includes('elite') ||
            String(priceId).toLowerCase().includes('immersao')
          ) {
            planType = 'elite';
            bookingLimit = 12;
          }

          const fieldsToPatch: any = {
            plan: { stringValue: planType },
            bookingLimit: { integerValue: String(bookingLimit) },
            bookingsThisMonth: { integerValue: '0' },
            paymentPastDue: { booleanValue: false }
          };

          const patchResponse = await fetch(patchUrl, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${googleAuthToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: fieldsToPatch })
          });
          
          if (patchResponse.ok) {
            console.log(`[Stripe Sandbox] Automatically upgraded user ${userId} to plan ${planType}`);
          } else {
            console.error(`[Stripe Sandbox] Failed to upgrade user: ${await patchResponse.text()}`);
          }
        } else {
          console.warn('[Stripe Sandbox] GOOGLE_SERVICE_ACCOUNT_KEY missing. Skipping auto-upgrade.');
        }
      } catch (err: any) {
        console.error('[Stripe Sandbox Upgrade Error]:', err);
      }

      const host = req.headers.host;
      const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');
      const baseUrl = isLocal 
        ? `http://${host}` 
        : (process.env.VITE_APP_URL || 'https://elo-fluxa-rj.vercel.app');
      return res.status(200).json({ url: `${baseUrl}/dashboard?stripe_payment=success` });
    }

    const stripe = new Stripe(token, {
      apiVersion: '2023-10-16' as any
    });

    const host = req.headers.host;
    const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');
    const baseUrl = isLocal 
      ? `http://${host}` 
      : (process.env.VITE_APP_URL || 'https://elo-fluxa-rj.vercel.app');

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?stripe_payment=success`,
      cancel_url: `${baseUrl}/dashboard?stripe_payment=cancel`,
      customer_email: email,
      client_reference_id: userId,
      // Save metadata on the Customer / Session creation to link the profile
      subscription_data: {
        metadata: {
          firebaseUid: userId
        }
      },
      metadata: {
        firebaseUid: userId
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout API Error]:', error);
    return res.status(500).json({ error: error.message || 'Erro no processamento do checkout Stripe.' });
  }
}

async function handleWebhook(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const token = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!token || !webhookSecret) {
    console.error('[Stripe Webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.');
    return res.status(500).json({ error: 'Stripe webhook configuration error.' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    const rawBody = await getRawBody(req);
    const stripe = new Stripe(token, {
      apiVersion: '2023-10-16' as any
    });

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    console.log(`[Stripe Webhook] Verified event: ${event.type}`);

    const sessionObj = event.data.object as any;
    const customerId = sessionObj.customer;
    let firebaseUid = sessionObj.client_reference_id || sessionObj.metadata?.firebaseUid;

    // Retrieve the customer from Stripe to fetch their associated Firebase UID metadata
    if (!firebaseUid && customerId && typeof customerId === 'string') {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted) {
        firebaseUid = customer.metadata?.firebaseUid;
      }
    }

    if (!firebaseUid) {
      console.warn(`[Stripe Webhook] Could not resolve Firebase UID metadata for Stripe customer: ${customerId}`);
      return res.status(200).json({ received: true, warning: 'Firebase UID mapping not found' });
    }

    const googleAuthToken = await getFirestoreAccessToken();
    const projectId = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!).project_id;
    const baseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    const patchUrl = `${baseRestUrl}/users/${firebaseUid}?updateMask.fieldPaths=plan&updateMask.fieldPaths=bookingLimit&updateMask.fieldPaths=paymentPastDue`;

    // Process event types
    switch (event.type) {
      case 'invoice.paid': {
        const lineItemPriceId = sessionObj.lines?.data[0]?.price?.id;
        let planType = 'pro';
        let bookingLimit = 4;

        if (lineItemPriceId) {
          if (lineItemPriceId === process.env.STRIPE_PRICE_IMERSAO) {
            planType = 'elite';
            bookingLimit = 12;
          } else if (lineItemPriceId === process.env.STRIPE_PRICE_FLUENTE) {
            planType = 'pro';
            bookingLimit = 4;
          } else {
            console.warn(`[Stripe Webhook] Unrecognized Price ID: ${lineItemPriceId}. Defaulting to Pro.`);
          }
        }

        // Fetch user profile to check referredBy details
        const userRes = await fetch(`${baseRestUrl}/users/${firebaseUid}`, {
          headers: { Authorization: `Bearer ${googleAuthToken}` }
        });
        
        let referredBy: string | null = null;
        let hasReferredRewardBeenPaid = false;
        
        if (userRes.ok) {
          const userData = await userRes.json();
          referredBy = userData.fields?.referredBy?.stringValue || null;
          hasReferredRewardBeenPaid = userData.fields?.hasReferredRewardBeenPaid?.booleanValue || false;
        }

        let paidPatchUrl = `${baseRestUrl}/users/${firebaseUid}?updateMask.fieldPaths=plan&updateMask.fieldPaths=bookingLimit&updateMask.fieldPaths=bookingsThisMonth&updateMask.fieldPaths=paymentPastDue`;
        const fieldsToPatch: any = {
          plan: { stringValue: planType },
          bookingLimit: { integerValue: String(bookingLimit) },
          bookingsThisMonth: { integerValue: '0' },
          paymentPastDue: { booleanValue: false }
        };

        // Process referral reward if referrer is present and reward not paid yet
        if (referredBy && !hasReferredRewardBeenPaid) {
          fieldsToPatch.hasReferredRewardBeenPaid = { booleanValue: true };
          paidPatchUrl += '&updateMask.fieldPaths=hasReferredRewardBeenPaid';

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
                        referredUserId: { stringValue: firebaseUid },
                        creditIncrement: { integerValue: '1' }
                      }
                    }
                  }
                }
              })
            });
            console.log(`[Stripe Webhook] Credited +1 referral lesson to referrer ${referredBy} for user ${firebaseUid}`);
          }
        }

        const patchResponse = await fetch(paidPatchUrl, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${googleAuthToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: fieldsToPatch })
        });

        if (!patchResponse.ok) {
          throw new Error(`Failed to activate/renew plan in Firestore: ${await patchResponse.text()}`);
        }

        console.log(`[Stripe Webhook] Activated/Renewed plan ${planType} for user ${firebaseUid}`);

        // Write audit log entry
        const auditBody = {
          fields: {
            action: { stringValue: 'stripe_payment_received' },
            userId: { stringValue: firebaseUid },
            timestamp: { timestampValue: new Date().toISOString() },
            details: {
              mapValue: {
                fields: {
                  invoiceId: { stringValue: sessionObj.id || '' },
                  plan: { stringValue: planType },
                  amount: { doubleValue: Number((sessionObj.amount_paid || 0) / 100) }
                }
              }
            }
          }
        };

        const auditResponse = await fetch(`${baseRestUrl}/audit_logs`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${googleAuthToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(auditBody)
        });

        if (!auditResponse.ok) {
          console.error(`[Stripe Webhook] Failed to write audit log: ${await auditResponse.text()}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Flag profile as past due (grace period before suspension)
        const partialPatchUrl = `${baseRestUrl}/users/${firebaseUid}?updateMask.fieldPaths=paymentPastDue`;
        const patchBody = {
          fields: {
            paymentPastDue: { booleanValue: true }
          }
        };

        const patchResponse = await fetch(partialPatchUrl, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${googleAuthToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(patchBody)
        });

        if (!patchResponse.ok) {
          throw new Error(`Failed to flag profile as paymentPastDue: ${await patchResponse.text()}`);
        }

        // Send warning notification in app
        await fetch(`${baseRestUrl}/users/${firebaseUid}/notifications`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${googleAuthToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              title: { stringValue: 'Pagamento Atrasado ⚠️' },
              message: { stringValue: 'O pagamento da sua assinatura mensal falhou. Atualize seus dados de cartão de crédito no painel para evitar interrupções de acesso.' },
              read: { booleanValue: false },
              createdAt: { timestampValue: new Date().toISOString() }
            }
          })
        });

        console.log(`[Stripe Webhook] Flagged user ${firebaseUid} as paymentPastDue (waiting for deleted trigger)`);
        break;
      }

      case 'customer.subscription.deleted': {
        // Suspend user access
        const patchBody = {
          fields: {
            plan: { stringValue: 'free' },
            bookingLimit: { integerValue: '0' },
            paymentPastDue: { booleanValue: false }
          }
        };

        const patchResponse = await fetch(patchUrl, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${googleAuthToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(patchBody)
        });

        if (!patchResponse.ok) {
          throw new Error(`Failed to downgrade user plan: ${await patchResponse.text()}`);
        }

        console.log(`[Stripe Webhook] Downgraded user ${firebaseUid} subscription to free`);
        break;
      }

      case 'customer.subscription.updated': {
        // Sync upgrade / downgrade modifications
        const subscriptionPriceId = sessionObj.items?.data[0]?.price?.id;
        if (subscriptionPriceId) {
          let planType = 'free';
          let bookingLimit = 0;

          if (subscriptionPriceId === process.env.STRIPE_PRICE_IMERSAO) {
            planType = 'elite';
            bookingLimit = 12;
          } else if (subscriptionPriceId === process.env.STRIPE_PRICE_FLUENTE) {
            planType = 'pro';
            bookingLimit = 4;
          }

          const patchBody = {
            fields: {
              plan: { stringValue: planType },
              bookingLimit: { integerValue: String(bookingLimit) },
              paymentPastDue: { booleanValue: false }
            }
          };

          const patchResponse = await fetch(patchUrl, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${googleAuthToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(patchBody)
          });

          if (!patchResponse.ok) {
            throw new Error(`Failed to sync updated plan in Firestore: ${await patchResponse.text()}`);
          }
          console.log(`[Stripe Webhook] Synced upgraded/downgraded plan ${planType} for user ${firebaseUid}`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Event ignored: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook error]:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
