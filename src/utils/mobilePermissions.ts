/**
 * Utility for handling microphone and camera permissions dynamically across Web and Mobile.
 */

export interface PermissionStatus {
  camera: 'granted' | 'denied' | 'prompt';
  microphone: 'granted' | 'denied' | 'prompt';
}

export const isNativePlatform = (): boolean => {
  return typeof window !== 'undefined' && window.hasOwnProperty('Capacitor');
};

/**
 * Check active permissions for camera and microphone
 */
export const checkPermissions = async (): Promise<PermissionStatus> => {
  if (isNativePlatform()) {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const camRes = await navigator.permissions.query({ name: 'camera' as PermissionName });
        const micRes = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return {
          camera: camRes.state as 'granted' | 'denied' | 'prompt',
          microphone: micRes.state as 'granted' | 'denied' | 'prompt'
        };
      }
    } catch (e) {
      console.warn('Native check permissions query failed:', e);
    }
  }

  // Web Fallback / Web standard
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const camRes = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const micRes = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return {
        camera: camRes.state as 'granted' | 'denied' | 'prompt',
        microphone: micRes.state as 'granted' | 'denied' | 'prompt'
      };
    }
  } catch (err) {
    console.warn('Browser permissions query not supported, defaulting to prompt:', err);
  }

  return { camera: 'prompt', microphone: 'prompt' };
};

/**
 * Request access to camera and microphone
 */
export const requestPermissions = async (audio = true, video = true): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
    // Immediately release the tracks to prevent keeping camera active
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (err) {
    console.error('Error requesting camera/microphone permissions:', err);
    return false;
  }
};
