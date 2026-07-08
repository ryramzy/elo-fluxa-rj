import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firestore';

export function useAdminGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const checkRole = async () => {
      try {
        const adminUid = import.meta.env.VITE_ADMIN_UID;
        const userEmail = user.email?.toLowerCase().trim() || '';
        const isAuthorizedEmail = 
          userEmail === 'mramsayo@gmail.com' ||
          userEmail === 'mramsay0@gmail.com' ||
          userEmail === 'erneleducation@gmail.com' ||
          userEmail.endsWith('@elospeak.com.br') ||
          userEmail.endsWith('@elospeak.com');
        
        // Immediate fallback check by UID or authorized email
        if (isAuthorizedEmail || (adminUid && user.uid.trim() === adminUid.trim())) {
          // Proactively ensure /users/{uid} document has role: 'admin' in Firestore (fire-and-forget)
          const userRef = doc(db, 'users', user.uid);
          setDoc(userRef, {
            displayName: user.displayName || 'Matthew Ramsay',
            email: user.email || userEmail,
            role: 'admin',
            createdAt: new Date()
          }, { merge: true }).catch(writeErr => {
            console.error('Error auto-healing admin profile document:', writeErr);
          });
          
          setIsAdmin(true);
          setAdminLoading(false);
          return;
        }

        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.role === 'tutor' || data?.role === 'admin') {
            setIsAdmin(true);
            setAdminLoading(false);
            return;
          }
        }
        
        // Unauthorized
        setAdminLoading(false);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error checking admin permissions:', err);
        setAdminLoading(false);
        navigate('/dashboard');
      }
    };

    checkRole();
  }, [user, loading, navigate]);

  return { isAdmin, loading: adminLoading };
}
