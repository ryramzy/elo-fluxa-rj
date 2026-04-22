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

// TODO tonight: implement with Google Calendar API
export async function createCalendarEvent(
  event: CalendarEvent
): Promise<{ eventId: string; meetLink: string }> {
  // Will call: POST /api/calendar/create-event
  throw new Error('Google Calendar not configured yet');
}

export async function cancelCalendarEvent(
  eventId: string
): Promise<void> {
  // Will call: POST /api/calendar/cancel-event
  throw new Error('Google Calendar not configured yet');
}

// Vercel API route stub - create /api/calendar/create-event.ts tonight
// It will use googleapis with service account credentials
// and create a Google Meet link automatically
