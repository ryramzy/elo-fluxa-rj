// Firebase Initialization - Single Point of Entry
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase app once
const app = initializeApp(firebaseConfig);

// Export initialized instances
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { app };
