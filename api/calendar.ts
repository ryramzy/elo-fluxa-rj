import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

interface CalendarEventRequest {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail: string;
  attendeeName: string;
  tutorCalendarId?: string;
}

/**
 * Shared helper: parse service account JSON from environment variables.
 * Handles single-quote wrapping and escaped newlines in private_key.
 */
function parseServiceAccountCredentials(): any | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    let json = raw.trim();
    if (json.startsWith("'") && json.endsWith("'")) {
      json = json.slice(1, -1);
    }
    const credentials = JSON.parse(json);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
    return credentials;
  } catch (e) {
    console.error('Failed to parse service account credentials:', e);
    return null;
  }
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

    const credentials = parseServiceAccountCredentials();
    const calendarId = tutorCalendarId || process.env.GOOGLE_CALENDAR_ID || process.env.MATT_EMAIL || 'matt@eloingle.com.br';

    if (!credentials) {
      console.log('Returning fallback calendar event (No service account key configured)');
      const fallbackMeetingId = `elo-class-${attendeeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
      const mockResponse = {
        eventId: `fallback_event_${Date.now()}`,
        meetLink: `https://eloingles.com.br/classroom`,
        zoomLink: `https://eloingles.com.br/classroom`,
        htmlLink: `https://meet.jit.si/${fallbackMeetingId}`,
        isFallback: true
      };
      return res.status(200).json(mockResponse);
    }

    try {
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
        meetLink: createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.[0]?.uri || `https://eloingles.com.br/classroom`,
        zoomLink: `https://eloingles.com.br/classroom`,
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

    const credentials = parseServiceAccountCredentials();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || process.env.MATT_EMAIL || 'matt@eloingle.com.br';

    if (!credentials) {
      console.log('Mock calendar event cancellation (no service account):', eventId);
      return res.status(200).json({ success: true });
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

    const credentials = parseServiceAccountCredentials();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || process.env.MATT_EMAIL || 'matt@eloingle.com.br';

    if (!credentials) {
      console.log('Returning mock calendar events (no service account)');
      return res.status(200).json({ events: [] });
    }
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const fromDate = new Date(from as string);
    if (isNaN(fromDate.getTime())) {
      return res.status(400).json({ error: 'Invalid from date format' });
    }
    const timeMin = fromDate.toISOString();
    const toDate = to ? new Date(to as string) : new Date(fromDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (isNaN(toDate.getTime())) {
      return res.status(400).json({ error: 'Invalid to date format' });
    }
    const timeMax = toDate.toISOString();

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
