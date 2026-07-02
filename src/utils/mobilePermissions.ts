import { Capacitor } from '@capacitor/core';

export async function requestMicrophonePermission(): Promise<boolean> {
  // Scenario A: Running within the Native App Wrapper (iOS / Android)
  if (Capacitor.isNativePlatform()) {
    try {
      // Direct hardware-level permission check via internal Webview navigator mapping
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      if (permissionStatus.state === 'granted') {
        return true;
      }
      
      // If prompt or denied, force browser interface evaluation context
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Immediately release hardware lock
      return true;
    } catch (error) {
      console.error('Native hardware microphone request failed:', error);
      return false;
    }
  }

  // Scenario B: Standard Responsive Mobile Browsers (Safari / Chrome)
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.warn('Browser microphone access rejected by user.');
      return false;
    }
  }

  return false;
}
