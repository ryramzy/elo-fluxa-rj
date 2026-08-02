// Firebase Initialization - Single Point of Entry
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase app once
const app = initializeApp(firebaseConfig);

// Export initialized instances
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with offline persistence only in browser environments
let dbInstance;

if (typeof window !== 'undefined') {
  try {
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch {
    // Fallback if persistent cache is not supported or already initialized
    dbInstance = getFirestore(app);
  }
} else {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export { app };
