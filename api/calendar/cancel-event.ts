import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    // For local development, return mock response
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!serviceAccountJson || !calendarId) {
      console.log('Mock calendar event cancellation for local development:', eventId);
      return res.status(200).json({ success: true });
    }

    // Initialize Google Calendar API with service account
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Cancel the event (set status to cancelled)
    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: {
        status: 'cancelled',
        summary: 'CANCELLED - Aula Elo Matt',
      },
    });

    console.log('Calendar event cancelled successfully:', eventId);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error cancelling calendar event:', error);
    res.status(500).json({ 
      error: 'Failed to cancel calendar event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
