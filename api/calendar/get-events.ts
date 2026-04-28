import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { from, to } = req.query;

    if (!from) {
      return res.status(400).json({ error: 'from date is required' });
    }

    // For local development, return mock events
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

    // Initialize Google Calendar API with service account
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Get calendar events
    const timeMin = new Date(from as string).toISOString();
    const timeMax = to ? new Date(to as string).toISOString() : 
      new Date(new Date(from as string).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const eventsResponse = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      q: 'Aula de Inglês', // Filter for class events
    });

    const events = eventsResponse.data.items || [];
    console.log(`Found ${events.length} calendar events`);

    res.status(200).json({ events });

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch calendar events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
