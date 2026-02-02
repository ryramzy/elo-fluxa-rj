/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Utility to log conversion events for business intelligence.
 * In production, this would send data to Firestore or Google Analytics.
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  const timestamp = new Date().toISOString();
  const eventData = {
    event: eventName,
    timestamp,
    ...params,
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // Log to console for development
  console.log(`[BI Tracking]: ${eventName}`, eventData);

  // Example: If using Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, params);
  }

  // Placeholder for Firestore log
  // db.collection('events').add(eventData);
};
