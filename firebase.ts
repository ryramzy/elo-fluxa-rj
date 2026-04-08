import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './src/config/firebase';

console.log("Firebase Init Check:", { 
  projectId: firebaseConfig.projectId, 
  hasApiKey: !!firebaseConfig.apiKey 
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
