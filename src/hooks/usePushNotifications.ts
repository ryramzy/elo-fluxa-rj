import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firestore';

export type PushPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications(userId?: string) {
  const [permission, setPermission] = useState<PushPermissionStatus>('unsupported');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission as PushPermissionStatus);
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return false;
    }

    try {
      setIsRequesting(true);
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionStatus);

      if (result === 'granted') {
        // Save preference in Firestore if user is authenticated
        if (userId && userId !== 'guest_user') {
          try {
            await updateDoc(doc(db, 'users', userId), {
              pushNotificationsEnabled: true,
              notificationsUpdatedAt: new Date()
            });
          } catch (e) {
            console.warn('Could not save push notification preference in Firestore:', e);
          }
        }

        // Show welcome notification
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready.catch(() => null);
          if (registration && registration.showNotification) {
            registration.showNotification('ELO! Notificações Ativadas 🎉', {
              body: 'Você receberá lembretes das suas aulas agendadas e avisos importantes!',
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-192x192.png',
              tag: 'elo_welcome'
            });
          } else {
            new Notification('ELO! Notificações Ativadas 🎉', {
              body: 'Você receberá lembretes das suas aulas agendadas e avisos importantes!',
              icon: '/icons/icon-192x192.png'
            });
          }
        }

        return true;
      }

      return false;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    } finally {
      setIsRequesting(false);
    }
  };

  return {
    permission,
    isRequesting,
    requestPermission,
    isSupported: permission !== 'unsupported',
    isGranted: permission === 'granted'
  };
}
