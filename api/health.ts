import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestoreAccessToken } from './utils/googleAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Dynamically test the Google Auth REST exchange to verify key configurations
    const token = await getFirestoreAccessToken();
    const isSuccess = !!token && token.length > 0;
    
    if (!isSuccess) {
      return res.status(500).json({ status: 'unhealthy', error: 'Exchanged token was empty.' });
    }
    
    return res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      authGateway: 'active'
    });
  } catch (error: any) {
    console.error('[Health Check] Auth gateway failure:', error);
    return res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message || 'Unknown error during OAuth JWT token exchange'
    });
  }
}
