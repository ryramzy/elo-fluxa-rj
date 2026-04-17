// Firebase Initialization - Single Point of Entry
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, Timestamp } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase app once
const app = initializeApp(firebaseConfig);

// Export initialized instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };

// Debug logging for deployment verification
console.log("Firebase Initialization:", {
  projectId: firebaseConfig.projectId,
  hasConfig: !!firebaseConfig.apiKey,
  authInitialized: !!auth,
  dbInitialized: !!db,
});
