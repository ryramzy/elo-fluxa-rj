import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

interface CalendarEventRequest {
  summary: string;
  description: string;
  startDateTime: string;   // ISO: "2026-04-21T14:00:00-03:00"
  endDateTime: string;
  attendeeEmail: string;
  attendeeName: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { summary, description, startDateTime, endDateTime, attendeeEmail, attendeeName }: CalendarEventRequest = req.body;

    // Validate required fields
    if (!summary || !startDateTime || !endDateTime || !attendeeEmail || !attendeeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For local development, return mock response
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!serviceAccountJson || !calendarId) {
      console.log('Returning mock calendar event for local development');
      const mockResponse = {
        eventId: `mock_event_${Date.now()}`,
        meetLink: `https://meet.google.com/mock-${Date.now()}`,
        htmlLink: `https://calendar.google.com/calendar/event?eid=${Date.now()}`
      };
      return res.status(200).json(mockResponse);
    }

    // Initialize Google Calendar API with service account
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Create calendar event with Google Meet
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
      resource: event,
      conferenceDataVersion: 1,
    });

    const createdEvent = eventResponse.data;

    if (!createdEvent.id) {
      throw new Error('Failed to create calendar event');
    }

    const response = {
      eventId: createdEvent.id,
      meetLink: createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.[0]?.uri,
      htmlLink: createdEvent.htmlLink,
    };

    console.log('Calendar event created successfully:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ 
      error: 'Failed to create calendar event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
