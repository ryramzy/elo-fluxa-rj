import { useEffect, useRef, useState } from 'react';

interface UseJitsiProps {
  roomId: string;
  displayName: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onEnd?: () => void;
}

export function useJitsi({ roomId, displayName, containerRef, onEnd }: UseJitsiProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    // Check if script is already present
    if ((window as any).JitsiMeetExternalAPI) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setError('Failed to load video service script');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current) return;

    try {
      const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;
      if (!JitsiMeetExternalAPI) {
        throw new Error('Jitsi External API is not available on window');
      }

      const domain = 'meet.jit.si';
      const options = {
        roomName: roomId,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        userInfo: {
          displayName: displayName
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false, // Skips Jitsi pre-join for seamless startup
          disableThirdPartyRequests: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'tileview', 'mute-everyone', 'security'
          ]
        }
      };

      const api = new JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;

      // Event bindings
      api.addEventListener('videoConferenceLeft', () => {
        if (onEnd) onEnd();
      });

      api.addEventListener('readyToClose', () => {
        if (onEnd) onEnd();
      });

    } catch (err: any) {
      console.error('Error instantiating Jitsi API:', err);
      setError(err.message || 'Error starting Jitsi Meet call');
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [scriptLoaded, roomId, displayName, containerRef, onEnd]);

  return { loading: !scriptLoaded && !error, error };
}
