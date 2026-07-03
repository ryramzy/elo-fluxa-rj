// Firebase Initialization - Single Point of Entry
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase app once
const app = initializeApp(firebaseConfig);

// Export initialized instances
export const auth = getAuth(app);
// Initialize Firestore with offline persistence only in browser environments
export const db = (typeof window !== 'undefined')
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    })
  : getFirestore(app);
export { app };

// Debug logging for deployment verification
console.log("Firebase Initialization:", {
  projectId: firebaseConfig.projectId,
  hasConfig: !!firebaseConfig.apiKey,
  authInitialized: !!auth,
  dbInitialized: !!db,
});
