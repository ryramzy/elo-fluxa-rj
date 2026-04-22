export interface TimeSlot {
  id: string;
  date: string;           // ISO string: "2026-04-21"
  time: string;           // "14:00"
  duration: number;       // minutes: 30 or 60
  available: boolean;
  bookedBy?: string;      // user uid
  bookedByName?: string;
  googleEventId?: string; // Google Calendar hook point
  meetLink?: string;      // Google Meet link
  status: 'available' | 'booked' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  slotId: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  googleEventId?: string; // placeholder for tonight
  meetLink?: string;      // placeholder for tonight
  notes?: string;
  createdAt: Date;
}
