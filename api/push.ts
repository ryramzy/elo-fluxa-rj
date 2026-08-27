import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || 'BBItwOdVjqMMfgkAb0vXcYuEoIoQlkGdxwlzfbu5hQy9BOKlmI56Szq9DNjUBKb3Yj1DsVM_ESWUBjJCK0JwBs4';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'aXsF2EMKkPZjKJUAm9r-VTQPXUCNvCEJifRBa_WXhKk';

try {
  webpush.setVapidDetails(
    'mailto:contato@eloingles.com.br',
    vapidPublicKey,
    vapidPrivateKey
  );
} catch (e) {
  console.warn('[push] VAPID initialization notice:', e);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscription, title, body, actionUrl } = req.body || {};

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Missing or invalid subscription object' });
  }

  try {
    const payload = JSON.stringify({
      title: title || 'ELO! English',
      body: body || 'Atualização na sua conta ELO!',
      actionUrl: actionUrl || '/dashboard',
      url: actionUrl || '/dashboard'
    });

    await webpush.sendNotification(subscription, payload);
    console.log('[push] Notification sent successfully to', subscription.endpoint);
    return res.status(200).json({ sent: true });
  } catch (error: any) {
    console.error('[push] Web push delivery error:', error);
    // 410 Gone / 404 Not Found = subscription expired or revoked by user/browser
    if (error.statusCode === 410 || error.statusCode === 404) {
      return res.status(410).json({ expired: true, message: 'Push subscription expired or unsubscribed' });
    }
    return res.status(500).json({ error: error.message || 'Push delivery failed' });
  }
}
