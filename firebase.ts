import { auth, app } from './src/lib/firebase';
import { GoogleAuthProvider } from 'firebase/auth';

export const googleProvider = new GoogleAuthProvider();
export { auth, app };
