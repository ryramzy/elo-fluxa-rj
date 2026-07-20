import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { getFirestore, collection, addDoc, serverTimestamp, writeBatch, doc, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase config for seed-slots
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

interface CalendarEventRequest {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail: string;
  attendeeName: string;
  tutorCalendarId?: string;
}

interface AvailableSlot {
  start: string;
  end: string;
  label: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.split('?')[0] ?? '';

  if ((path.endsWith('/calendar/create-event') || path === '/api/calendar/create-event') && req.method === 'POST') {
    return handleCreateEvent(req, res);
  }
  if ((path.endsWith('/calendar/cancel-event') || path === '/api/calendar/cancel-event') && req.method === 'POST') {
    return handleCancelEvent(req, res);
  }
  if ((path.endsWith('/calendar/get-events') || path === '/api/calendar/get-events') && req.method === 'GET') {
    return handleGetEvents(req, res);
  }
  if ((path.endsWith('/calendar/seed-slots') || path === '/api/calendar/seed-slots') && req.method === 'POST') {
    return handleSeedSlots(req, res);
  }
  if ((path.endsWith('/available-slots') || path === '/api/available-slots' || path.endsWith('/calendar/slots')) && req.method === 'GET') {
    return handleAvailableSlots(req, res);
  }

  return res.status(404).json({ error: `Not found: ${path}` });
}

async function handleCreateEvent(req: VercelRequest, res: VercelResponse) {
  try {
    const { summary, description, startDateTime, endDateTime, attendeeEmail, attendeeName, tutorCalendarId }: CalendarEventRequest = req.body;

    if (!summary || !startDateTime || !endDateTime || !attendeeEmail || !attendeeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = tutorCalendarId || process.env.GOOGLE_CALENDAR_ID;

    if (!serviceAccountJson || !calendarId) {
      console.log('Returning mock calendar event for local development');
      const mockResponse = {
        eventId: `mock_event_${Date.now()}`,
        meetLink: `https://meet.google.com/mock-${Date.now()}`,
        htmlLink: `https://calendar.google.com/calendar/event?eid=${Date.now()}`
      };
      return res.status(200).json(mockResponse);
    }

    try {
      const credentials = JSON.parse(serviceAccountJson);
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      const calendar = google.calendar({ version: 'v3', auth });

      const event = {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'America/Sao_Paulo',
        },
        attendees: [
          { email: attendeeEmail, displayName: attendeeName },
        ],
        conferenceData: {
          createRequest: {
            requestId: `elo_matt_${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 * 24 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const eventResponse = await calendar.events.insert({
        calendarId,
        requestBody: event,
        conferenceDataVersion: 1,
      });

      const createdEvent = eventResponse.data;

      if (!createdEvent.id) {
        throw new Error('Failed to create calendar event');
      }

      const response = {
        eventId: createdEvent.id,
        meetLink: createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.[0]?.uri || `https://meet.google.com/elo-${Date.now()}`,
        htmlLink: createdEvent.htmlLink || `https://calendar.google.com`,
      };

      console.log('Calendar event created successfully:', response);
      res.status(200).json(response);
    } catch (apiError: any) {
      console.error('Google Calendar integration failed. Falling back to Jitsi Meet:', apiError);
      
      const sanitizedAttendeeName = attendeeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fallbackMeetingId = `elo-class-${sanitizedAttendeeName}-${Date.now().toString().slice(-4)}`;
      
      const response = {
        eventId: `fallback_event_${Date.now()}`,
        meetLink: `https://meet.jit.si/${fallbackMeetingId}`,
        htmlLink: `https://meet.jit.si/${fallbackMeetingId}`,
        isFallback: true
      };
      
      console.log('Calendar fallback event returned successfully:', response);
      res.status(200).json(response);
    }

  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ 
      error: 'Failed to create calendar event',
      details: error.message || 'Unknown error'
    });
  }
}

async function handleCancelEvent(req: VercelRequest, res: VercelResponse) {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!serviceAccountJson || !calendarId) {
      console.log('Mock calendar event cancellation for local development:', eventId);
      return res.status(200).json({ success: true });
    }

    const credentials = JSON.parse(serviceAccountJson);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: {
        status: 'cancelled',
        summary: 'CANCELLED - Aula Elo!',
      },
    });

    console.log('Calendar event cancelled successfully:', eventId);
    res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Error cancelling calendar event:', error);
    res.status(500).json({ 
      error: 'Failed to cancel calendar event',
      details: error.message || 'Unknown error'
    });
  }
}

async function handleGetEvents(req: VercelRequest, res: VercelResponse) {
  try {
    const { from, to } = req.query;

    if (!from) {
      return res.status(400).json({ error: 'from date is required' });
    }

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!serviceAccountJson || !calendarId) {
      console.log('Returning mock calendar events for local development');
      const mockEvents = [
        {
          id: 'mock_event_1',
          summary: 'Aula de Inglês - João Silva',
          start: { dateTime: '2026-04-28T14:00:00-03:00' },
          end: { dateTime: '2026-04-28T15:00:00-03:00' },
          attendees: [{ email: 'joao@example.com', displayName: 'João Silva' }],
          hangoutLink: 'https://meet.google.com/mock-1'
        },
        {
          id: 'mock_event_2',
          summary: 'Aula de Inglês - Maria Santos',
          start: { dateTime: '2026-04-29T16:00:00-03:00' },
          end: { dateTime: '2026-04-29T17:00:00-03:00' },
          attendees: [{ email: 'maria@example.com', displayName: 'Maria Santos' }],
          hangoutLink: 'https://meet.google.com/mock-2'
        }
      ];
      return res.status(200).json({ events: mockEvents });
    }

    const credentials = JSON.parse(serviceAccountJson);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const timeMin = new Date(from as string).toISOString();
    const timeMax = to ? new Date(to as string).toISOString() : 
      new Date(new Date(from as string).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const eventsResponse = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      q: 'Aula de Inglês',
    });

    const events = eventsResponse.data.items || [];
    console.log(`Found ${events.length} calendar events`);

    res.status(200).json({ events });

  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch calendar events',
      details: error.message || 'Unknown error'
    });
  }
}

async function handleSeedSlots(req: VercelRequest, res: VercelResponse) {
  try {
    const { weekOffset = 0 } = req.body;

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const slots = [];
    const today = new Date();
    
    for (let week = 0; week < 2; week++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (week * 7) - today.getDay() + 1);
      
      for (let day = 0; day < 5; day++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + day);
        
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const times = [
          '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
        ];
        
        for (const time of times) {
          slots.push({
            date: dateStr,
            time,
            duration: 60,
            available: true,
            status: 'available',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    const slotsCollection = collection(db, 'slots');
    const existingSlots = await getDocs(slotsCollection);
    
    if (!existingSlots.empty) {
      const batch = writeBatch(db);
      existingSlots.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Cleared ${existingSlots.size} existing slots`);
    }

    const batch = writeBatch(db);
    slots.forEach(slot => {
      const docRef = doc(slotsCollection);
      batch.set(docRef, slot);
    });
    
    await batch.commit();
    console.log(`Created ${slots.length} time slots`);

    res.status(200).json({ 
      success: true, 
      slotsCreated: slots.length,
      dateRange: {
        from: slots[0]?.date,
        to: slots[slots.length - 1]?.date
      }
    });

  } catch (error: any) {
    console.error('Error seeding slots:', error);
    res.status(500).json({ 
      error: 'Failed to seed slots',
      details: error.message || 'Unknown error'
    });
  }
}

async function handleAvailableSlots(req: VercelRequest, res: VercelResponse) {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!serviceAccountJson || !calendarId) {
      const mockSlots = generateMockSlots();
      console.log('Returning mock slots for local development:', mockSlots.length);
      return res.status(200).json(mockSlots);
    }

    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const now = new Date();
    const timeMin = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    const timeMax = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000).toISOString();

    const eventsResponse = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsResponse.data.items || [];
    const availableSlots = generateAvailableSlots(events, now, 14);

    res.status(200).json(availableSlots);
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available slots',
      details: error.message || 'Unknown error'
    });
  }
}

function generateMockSlots(): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const now = new Date();
  const timeZone = 'America/Sao_Paulo';

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() + dayOffset);
    
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (let hour = 9; hour <= 17; hour += 2) {
      const slotStart = new Date(currentDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      if (slotStart <= now) continue;

      const slotEnd = new Date(currentDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      const label = formatSlotLabel(slotStart, timeZone);
      
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        label
      });
    }
  }

  return slots;
}

function generateAvailableSlots(events: any[], startDate: Date, daysAhead: number): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const timeZone = 'America/Sao_Paulo';
  
  const busyTimes = events.map(event => {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    return { start, end };
  });

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayOffset);
    
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (let hour = 9; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(hour, minute + 30, 0, 0);

        const now = new Date();
        if (slotStart <= now) continue;

        const isOverlapping = busyTimes.some(busy => {
          return (slotStart < busy.end && slotEnd > busy.start);
        });

        if (!isOverlapping) {
          const label = formatSlotLabel(slotStart, timeZone);
          
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            label
          });
        }
      }
    }
  }

  return slots;
}

function formatSlotLabel(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timeZone
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const hour = parts.find(p => p.type === 'hour')?.value || '';
  const minute = parts.find(p => p.type === 'minute')?.value || '';

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday}, ${hour}:${minute} (Rio)`;
}
