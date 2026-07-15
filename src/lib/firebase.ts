// Firebase Initialization - Single Point of Entry
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import * as firestoreExports from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase app once
const app = initializeApp(firebaseConfig);

// Export initialized instances
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with offline persistence only in browser environments
let dbInstance;

if (typeof window !== 'undefined') {
  const plc = (firestoreExports as any).persistentLocalCache;
  const pmtm = (firestoreExports as any).persistentMultipleTabManager;
  if (plc && pmtm) {
    dbInstance = initializeFirestore(app, {
      localCache: plc({ tabManager: pmtm() })
    });
  } else {
    dbInstance = getFirestore(app);
  }
} else {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export { app };

// Debug logging for deployment verification
console.log("Firebase Initialization:", {
  projectId: firebaseConfig.projectId,
  hasConfig: !!firebaseConfig.apiKey,
  authInitialized: !!auth,
  dbInitialized: !!db,
});
