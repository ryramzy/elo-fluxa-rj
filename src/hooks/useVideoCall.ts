import { useState, useCallback } from 'react';
import type { Booking } from '../types';

export const useVideoCall = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [currentCall, setCurrentCall] = useState<Booking | null>(null);

  const startCall = useCallback((booking: Booking) => {
    // Generate a unique room ID for the call
    const roomId = `elo-fluxa-${booking.id}-${Date.now()}`;
    
    setCurrentCall({
      ...booking,
      meetLink: `https://meet.jit.si/${roomId}`
    });
    setIsInCall(true);
  }, []);

  const endCall = useCallback(() => {
    setIsInCall(false);
    setCurrentCall(null);
  }, []);

  const generateRoomId = (bookingId: string) => {
    return `elo-fluxa-${bookingId}-${Date.now()}`;
  };

  return {
    isInCall,
    currentCall,
    startCall,
    endCall,
    generateRoomId,
  };
};
