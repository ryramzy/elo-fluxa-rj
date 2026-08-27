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

export async function requestPushPermission(userId: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return false;
  }

  // Only prompt in standalone PWA mode
  if (!isPWAStandalone()) return false;
  
  // Don't re-prompt if already decided
  const existing = localStorage.getItem('elo_push_permission');
  if (existing && existing !== 'default') return existing === 'granted';

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    localStorage.setItem('elo_push_permission', permission);
    
    if (permission !== 'granted') return false;

    // Subscribe to push
    const registration = await navigator.serviceWorker.ready;
    if (!registration.pushManager) return false;

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BBItwOdVjqMMfgkAb0vXcYuEoIoQlkGdxwlzfbu5hQy9BOKlmI56Szq9DNjUBKb3Yj1DsVM_ESWUBjJCK0JwBs4';
    
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    if (subscription && userId && userId !== 'guest_user') {
      // Save subscription to Firestore
      await savePushSubscription(userId, subscription.toJSON());
    }

    return true;
  } catch (err) {
    console.warn('[push] Permission or subscription error:', err);
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
