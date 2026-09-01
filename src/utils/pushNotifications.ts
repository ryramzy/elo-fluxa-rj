import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firestore';

export const isPWAStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

export const isPushSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
};

export const canRequestPush = (): { allowed: boolean; reason?: 'ios_requires_pwa' | 'unsupported' } => {
  if (typeof window === 'undefined' || !isPushSupported()) {
    return { allowed: false, reason: 'unsupported' };
  }
  // iOS Safari requires standalone PWA installation for Web Push to function
  if (isIOSDevice() && !isPWAStandalone()) {
    return { allowed: false, reason: 'ios_requires_pwa' };
  }
  return { allowed: true };
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Requests browser notification permission and subscribes to push service
 * - Android & Desktop: Direct browser prompt
 * - iOS: Gated strictly to standalone PWA mode (home screen)
 */
export async function requestPushPermission(userId?: string): Promise<boolean> {
  const check = canRequestPush();
  if (!check.allowed) {
    if (check.reason === 'ios_requires_pwa') {
      console.warn('[push] On iOS, push notifications require adding the app to the Home Screen first.');
    } else {
      console.warn('[push] Notifications not supported on this device/browser.');
    }
    return false;
  }

  try {
    // Request native browser permission
    const permission = await Notification.requestPermission();
    localStorage.setItem('elo_push_permission', permission);
    
    if (permission !== 'granted') return false;

    // Send instant welcome notification
    sendTestNotification('Notificações Ativadas 🎉', 'Você receberá lembretes de aula 15 minutos antes da sua sessão com o Professor Matt!');

    // If Service Worker & PushManager are available, register push subscription
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.pushManager) {
          const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BBItwOdVjqMMfgkAb0vXcYuEoIoQlkGdxwlzfbu5hQy9BOKlmI56Szq9DNjUBKb3Yj1DsVM_ESWUBjJCK0JwBs4';
          
          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });
          }

          if (subscription && userId && userId !== 'guest_user') {
            await savePushSubscription(userId, subscription.toJSON());
          }
        }
      } catch (swErr) {
        console.warn('[push] PushManager subscription skipped or unsupported:', swErr);
      }
    }

    return true;
  } catch (err) {
    console.error('[push] Permission request error:', err);
    return false;
  }
}

/**
 * Triggers a local browser test notification
 */
export async function sendTestNotification(title = 'ELO! Inglês', body = 'Esta é uma notificação de teste de lembrete de aula!'): Promise<boolean> {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg && reg.showNotification) {
        await reg.showNotification(`ELO! — ${title}`, {
          body,
          icon: '/favicon-96x96.png',
          badge: '/favicon-32x32.png',
          tag: 'elo_test_' + Date.now(),
        });
        return true;
      }
    }

    new Notification(`ELO! — ${title}`, {
      body,
      icon: '/favicon-96x96.png',
    });
    return true;
  } catch (e) {
    console.warn('[push] Failed to show test notification:', e);
    return false;
  }
}

export async function savePushSubscription(userId: string, subscription: object): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', userId, 'pushSubscriptions', 'primary'),
      { subscription, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn('[push] Failed to save subscription to Firestore:', err);
  }
}
