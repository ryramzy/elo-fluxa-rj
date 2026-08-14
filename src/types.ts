import { Timestamp } from 'firebase/firestore';

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
  datetime?: Timestamp;   // UTC Timestamp for timezone sync
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
  tutorId?: string;
  tutorName?: string;
  uid?: string;
  organizationId?: string;
  googleEventId?: string; // placeholder for tonight
  meetLink?: string;      // placeholder for tonight
  notes?: string;
  createdAt: Date;
  tutorNotes?: {
    pronunciation: string;
    vocabulary: string;
    homework: string;
    summary?: string;
    studentRating?: number;
    nextGoal?: string;
    attendance?: 'present' | 'absent';
    submittedAt: any;
  };
  datetime?: Timestamp;   // UTC Timestamp for timezone sync
  zoomLink?: string;
}

export interface Tutor {
  id: string;
  name: string;
  email: string;
  zoomUrl: string;
  photoURL?: string;
  bio?: string;
  specialties?: string[];
  active: boolean;
  createdAt?: any;
}
