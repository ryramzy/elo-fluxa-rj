import { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

interface AvailableSlot {
  start: string;
  end: string;
  label: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For local development, return mock data if environment variables are not set
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!serviceAccountJson || !calendarId) {
      // Return mock data for local development
      const mockSlots = generateMockSlots();
      console.log('Returning mock slots for local development:', mockSlots.length);
      return res.status(200).json(mockSlots);
    }

    // Initialize Google Calendar API with service account
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Calculate date range (next 14 days from now)
    const now = new Date();
    const timeMin = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString(); // Convert to UTC
    const timeMax = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000).toISOString();

    // Fetch existing events from the calendar
    const eventsResponse = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsResponse.data.items || [];

    // Generate available slots
    const availableSlots = generateAvailableSlots(events, now, 14);

    res.status(200).json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available slots',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateMockSlots(): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const now = new Date();
  const timeZone = 'America/Sao_Paulo';

  // Generate mock slots for the next few days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() + dayOffset);
    
    // Skip weekends
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    // Generate a few slots per day for testing
    for (let hour = 9; hour <= 17; hour += 2) {
      const slotStart = new Date(currentDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      // Skip past slots
      if (slotStart <= now) {
        continue;
      }

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
  
  // Convert events to Date objects for easier comparison
  const busyTimes = events.map(event => {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    return { start, end };
  });

  // Generate slots for each day
  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayOffset);
    
    // Always skip weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    // Generate 30-minute slots from 09:00 to 20:00
    for (let hour = 9; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(hour, minute + 30, 0, 0);

        // Skip slots in the past
        const now = new Date();
        if (slotStart <= now) {
          continue;
        }

        // Check if slot overlaps with any existing event
        const isOverlapping = busyTimes.some(busy => {
          return (slotStart < busy.end && slotEnd > busy.start);
        });

        // Show slot if not overlapping with any event
        if (!isOverlapping) {
          // Format the slot for Brazil timezone
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

  // Capitalize first letter of weekday
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  
  return `${capitalizedWeekday}, ${hour}:${minute} (Rio)`;
}
