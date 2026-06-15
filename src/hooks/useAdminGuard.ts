import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDoc, doc } from 'firebase/firestore';
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
        
        // Immediate fallback check
        if (adminUid && user.uid.trim() === adminUid.trim()) {
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
        navigate('/dashboard');
      } catch (err) {
        console.error('Error checking admin permissions:', err);
        navigate('/dashboard');
      }
    };

    checkRole();
  }, [user, loading, navigate]);

  return { isAdmin, loading: adminLoading };
}
