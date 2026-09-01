import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { 
  requestPushPermission as requestPushPermissionUtil, 
  sendTestNotification as sendTestNotificationUtil,
  canRequestPush,
  isIOSDevice,
  isPWAStandalone
} from '../utils/pushNotifications';

export type PushPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications(userId?: string) {
  const [permission, setPermission] = useState<PushPermissionStatus>('unsupported');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsIOS(isIOSDevice());
    setIsStandalone(isPWAStandalone());

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
      const granted = await requestPushPermissionUtil(userId);
      setPermission((Notification.permission || (granted ? 'granted' : 'denied')) as PushPermissionStatus);

      if (granted && userId && userId !== 'guest_user') {
        try {
          await updateDoc(doc(db, 'users', userId), {
            pushNotificationsEnabled: true,
            notificationsUpdatedAt: new Date()
          });
        } catch (e) {
          console.warn('Could not save push notification preference in Firestore:', e);
        }
      }

      return granted;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    } finally {
      setIsRequesting(false);
    }
  };

  const testNotification = async (title?: string, body?: string) => {
    return sendTestNotificationUtil(title, body);
  };

  const requiresPWA = isIOS && !isStandalone;

  return {
    permission,
    isRequesting,
    requestPermission,
    testNotification,
    isSupported: permission !== 'unsupported',
    isGranted: permission === 'granted',
    isIOS,
    isStandalone,
    requiresPWA
  };
}
