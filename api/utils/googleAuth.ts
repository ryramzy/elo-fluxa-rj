import * as crypto from 'crypto';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export async function getFirestoreAccessToken(): Promise<string> {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentialsJson) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY environment variable.');
  }

  const credentials = JSON.parse(credentialsJson);
  const clientEmail = credentials.client_email;
  const privateKey = credentials.private_key;

  const header = { alg: 'RS256', typ: 'JWT' };
  
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // Token valid for 1 hour
  
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat,
    exp,
    scope: 'https://www.googleapis.com/auth/datastore',
  };

  const base64UrlEncode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const assertion = `${signatureInput}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google OAuth2 token exchange failed: ${errorText}`);
  }

  const data = (await response.json()) as GoogleTokenResponse;
  return data.access_token;
}
