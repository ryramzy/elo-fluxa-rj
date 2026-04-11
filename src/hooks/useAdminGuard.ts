import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function useAdminGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    const adminUid = import.meta.env.VITE_ADMIN_UID;
    
    if (!adminUid) {
      console.error('VITE_ADMIN_UID environment variable not set');
      navigate('/dashboard');
      return;
    }

    if (!user) {
      navigate('/');
      return;
    }

    if (user.uid.trim() !== adminUid?.trim()) {
      navigate('/dashboard');
      return;
    }

    setIsAdmin(true);
    setAdminLoading(false);
  }, [user, loading, navigate]);

  return { isAdmin, loading: adminLoading };
}
