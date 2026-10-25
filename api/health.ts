import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestoreAccessToken } from './utils/googleAuth.js';

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

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
    const projectId = credentials.project_id;
    const appProjectId = process.env.VITE_FIREBASE_PROJECT_ID;
    if (typeof projectId !== 'string' || !projectId || (appProjectId && projectId !== appProjectId)) {
      return res.status(500).json({ status: 'unhealthy', error: 'Service account does not match the app Firebase project.' });
    }

    // A valid token is not proof that the app's database exists or is accessible.
    // Read database metadata only; do not inspect student data during a health check.
    const database = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!database.ok) {
      return res.status(500).json({
        status: 'unhealthy', authGateway: 'active', firestore: 'unavailable',
        error: 'The default Firestore database is missing or inaccessible.',
      });
    }
    
    return res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      authGateway: 'active',
      firestore: 'active'
    });
  } catch (error: any) {
    console.error('[Health Check] Auth gateway failure:', error);
    return res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message || 'Unknown error during OAuth JWT token exchange'
    });
  }
}
