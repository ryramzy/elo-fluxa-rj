import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import { app } from '../lib/firebase';

let analyticsInstance: any = null;

// Safely initialize analytics in browser environment
isSupported().then((supported) => {
  if (supported) {
    try {
      analyticsInstance = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
    } catch (err) {
      console.warn('Firebase Analytics initialization failed:', err);
    }
  } else {
    console.log('Firebase Analytics is not supported in this environment');
  }
}).catch((err) => {
  console.warn('Error checking Firebase Analytics support:', err);
});

/**
 * Track user events safely in the application
 * @param eventName Name of the event to track
 * @param params Optional key-value pairs of metadata for the event
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, params);
    }

    // Forward to third-party analytics stubs if loaded in the window
    if ((window as any).mixpanel) {
      (window as any).mixpanel.track(eventName, params);
    }
    if ((window as any).posthog) {
      (window as any).posthog.capture(eventName, params);
    }
    
    // Always print to console in development mode
    if (import.meta.env.DEV) {
      console.log(`📊 [Analytics Event] ${eventName}:`, params);
    }
  } catch (err) {
    console.error('Error tracking event:', eventName, err);
  }
};
