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

  return res.status(404).json({ error: `Not found: ${path}` });
}

async function handleCreateEvent(req: VercelRequest, res: VercelResponse) {
  try {
    const { summary, description, startDateTime, endDateTime, attendeeEmail, attendeeName, tutorCalendarId }: CalendarEventRequest = req.body;

    if (!summary || !startDateTime || !endDateTime || !attendeeEmail || !attendeeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const calendarId = tutorCalendarId || process.env.GOOGLE_CALENDAR_ID || process.env.MATT_EMAIL || 'matt@elospeak.com.br';

    if (!serviceAccountJson) {
      console.log('Returning fallback calendar event (No service account key configured)');
      const fallbackMeetingId = `elo-class-${attendeeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
      const mockResponse = {
        eventId: `fallback_event_${Date.now()}`,
        meetLink: `https://meet.jit.si/${fallbackMeetingId}`,
        htmlLink: `https://meet.jit.si/${fallbackMeetingId}`,
        isFallback: true
      };
      return res.status(200).json(mockResponse);
    }

    try {
      let rawJson = serviceAccountJson.trim();
      if (rawJson.startsWith("'") && rawJson.endsWith("'")) {
        rawJson = rawJson.slice(1, -1);
      }
      const credentials = JSON.parse(rawJson);
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
