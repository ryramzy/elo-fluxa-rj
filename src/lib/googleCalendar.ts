// src/lib/googleCalendar.ts
// Client-side Google Calendar API integration via Vercel serverless endpoints

export interface CalendarEvent {
  summary: string;
  description: string;
  startDateTime: string;   // ISO: "2026-04-21T14:00:00-03:00"
  endDateTime: string;
  attendeeEmail: string;
  attendeeName: string;
  tutorCalendarId?: string;
}

/**
 * Safe response parser — handles both JSON and non-JSON error responses
 * (e.g., Vercel 502 HTML error pages, CORS errors, etc.)
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      return json.error || json.message || `HTTP ${response.status}`;
    } catch {
      return `HTTP ${response.status}: ${text.slice(0, 200)}`;
    }
  } catch {
    return `HTTP ${response.status}`;
  }
}

// Google Calendar API — create event with 10s timeout
export async function createCalendarEvent(
  event: CalendarEvent
): Promise<{ eventId: string; meetLink: string; htmlLink: string }> {
  const response = await fetch('/api/calendar/create-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorMsg = await parseErrorResponse(response);
    throw new Error(errorMsg);
  }

  return response.json();
}

// Google Calendar API — cancel event with 10s timeout
export async function cancelCalendarEvent(
  eventId: string
): Promise<void> {
  const response = await fetch('/api/calendar/cancel-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorMsg = await parseErrorResponse(response);
    throw new Error(errorMsg);
  }
}
