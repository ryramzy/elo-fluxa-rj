// src/lib/googleCalendar.ts
// GOOGLE CALENDAR INTEGRATION - wire up tonight

export interface CalendarEvent {
  summary: string;
  description: string;
  startDateTime: string;   // ISO: "2026-04-21T14:00:00-03:00"
  endDateTime: string;
  attendeeEmail: string;
  attendeeName: string;
}

// Google Calendar API integration
export async function createCalendarEvent(
  event: CalendarEvent
): Promise<{ eventId: string; meetLink: string; htmlLink: string }> {
  const response = await fetch('/api/calendar/create-event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create calendar event');
  }

  return response.json();
}

export async function cancelCalendarEvent(
  eventId: string
): Promise<void> {
  const response = await fetch('/api/calendar/cancel-event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ eventId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel calendar event');
  }
}

// Vercel API route stub - create /api/calendar/create-event.ts tonight
// It will use googleapis with service account credentials
// and create a Google Meet link automatically
