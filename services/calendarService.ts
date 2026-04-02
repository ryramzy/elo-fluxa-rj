/**
 * Browser-side Google Calendar helpers using the Calendar REST API + OAuth access token.
 *
 * Note: `googleapis` is a Node SDK and is not imported here (Vite/browser bundle).
 * listAvailableSlots uses FreeBusy against the instructor calendar — the signed-in Google
 * account must have at least “See free/busy” access to that calendar (share from mramsao).
 *
 * bookLesson creates the event on the student’s `primary` calendar and adds the instructor
 * as an attendee so both receive invites (client cannot write to another user’s calendar).
 */

export type CalendarSlot = {
  start: string;
  end: string;
  summary: string;
};

const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3';

/** Scopes for FreeBusy read + creating events on the user’s primary calendar */
export const CALENDAR_OAUTH_SCOPES =
  'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';

function getClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
}

/** Instructor Google account email (calendar ID for primary calendar is usually this email) */
export function getInstructorCalendarId(): string {
  const id = import.meta.env.VITE_INSTRUCTOR_CALENDAR_ID?.trim();
  if (id) return id;
  const email = import.meta.env.VITE_INSTRUCTOR_EMAIL?.trim();
  if (email) return email;
  return '';
}

export function getInstructorEmail(): string {
  return import.meta.env.VITE_INSTRUCTOR_EMAIL?.trim() ?? getInstructorCalendarId();
}

const RIO_TZ = 'America/Sao_Paulo';
const SLOT_MS = 60 * 60 * 1000;
const START_HOUR = 9;
/** Last slot starts at 17:00 (1h lesson ends 18:00) */
const LAST_START_HOUR = 17;

function formatToParts(date: Date, timeZone: string) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = f.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }
  return map;
}

function isWeekendInTz(date: Date, timeZone: string): boolean {
  const w = formatToParts(date, timeZone).weekday;
  return w === 'Sat' || w === 'Sun';
}

function hourInTz(date: Date, timeZone: string): number {
  const h = formatToParts(date, timeZone).hour;
  return h ? parseInt(h, 10) : 0;
}

function mergeBusy(
  busy: { start: string; end: string }[]
): { start: Date; end: Date }[] {
  if (!busy.length) return [];
  const sorted = [...busy].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  const out: { start: Date; end: Date }[] = [];
  for (const b of sorted) {
    const s = new Date(b.start);
    const e = new Date(b.end);
    const last = out[out.length - 1];
    if (!last || s.getTime() >= last.end.getTime()) {
      out.push({ start: s, end: e });
    } else {
      last.end = new Date(Math.max(last.end.getTime(), e.getTime()));
    }
  }
  return out;
}

function overlaps(aStart: Date, aEnd: Date, busy: { start: Date; end: Date }[]): boolean {
  for (const b of busy) {
    if (aStart < b.end && aEnd > b.start) return true;
  }
  return false;
}

function formatSlotSummary(start: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: RIO_TZ,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(start);
}

async function calendarFetch(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${CALENDAR_BASE}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string>),
    },
  });
}

/**
 * Free/busy for the instructor calendar, then derive 1h free slots (weekdays 09:00–18:00 Rio).
 */
export async function listAvailableSlots(accessToken: string): Promise<CalendarSlot[]> {
  const calendarId = getInstructorCalendarId();
  if (!calendarId) {
    throw new Error('Configure VITE_INSTRUCTOR_CALENDAR_ID or VITE_INSTRUCTOR_EMAIL');
  }

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const res = await calendarFetch(accessToken, '/freeBusy', {
    method: 'POST',
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `FreeBusy failed (${res.status}): ${text || res.statusText}. If this is 403, share the instructor calendar (free/busy) with this Google account.`
    );
  }

  const data = (await res.json()) as {
    calendars?: Record<string, { busy?: { start: string; end: string }[] }>;
  };
  const calMap = data.calendars ?? {};
  let rawBusy = calMap[calendarId]?.busy ?? [];
  if (!rawBusy.length && Object.keys(calMap).length === 1) {
    const only = Object.values(calMap)[0];
    rawBusy = only?.busy ?? [];
  }
  const merged = mergeBusy(rawBusy);

  const slots: CalendarSlot[] = [];
  let t = new Date(now.getTime());
  // align to next full hour
  t.setUTCMinutes(0, 0, 0);
  if (t <= now) t = new Date(t.getTime() + SLOT_MS);

  const endWindow = new Date(timeMax);

  while (t.getTime() + SLOT_MS <= endWindow.getTime()) {
    if (isWeekendInTz(t, RIO_TZ)) {
      t = new Date(t.getTime() + SLOT_MS);
      continue;
    }
    const h = hourInTz(t, RIO_TZ);
    if (h >= START_HOUR && h <= LAST_START_HOUR) {
      const slotEnd = new Date(t.getTime() + SLOT_MS);
      if (!overlaps(t, slotEnd, merged)) {
        slots.push({
          start: t.toISOString(),
          end: slotEnd.toISOString(),
          summary: formatSlotSummary(t),
        });
      }
    }
    t = new Date(t.getTime() + SLOT_MS);
  }

  return slots;
}

/**
 * Creates event on the authenticated user’s primary calendar with instructor + student as attendees.
 */
export async function bookLesson(
  accessToken: string,
  slot: CalendarSlot,
  studentEmail: string,
  studentName: string
): Promise<{ htmlLink?: string; id?: string }> {
  const instructorEmail = getInstructorEmail();
  if (!instructorEmail) {
    throw new Error('Configure VITE_INSTRUCTOR_EMAIL');
  }
  if (!studentEmail?.trim()) {
    throw new Error('Student email is required');
  }

  const title = `Elo Matt Lesson — ${studentName || studentEmail}`;

  const body = {
    summary: title,
    start: {
      dateTime: slot.start,
      timeZone: RIO_TZ,
    },
    end: {
      dateTime: slot.end,
      timeZone: RIO_TZ,
    },
    attendees: [
      { email: instructorEmail },
      { email: studentEmail.trim() },
    ],
  };

  const q = new URLSearchParams({ sendUpdates: 'all' });
  const res = await calendarFetch(
    accessToken,
    `/calendars/primary/events?${q.toString()}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create event failed (${res.status}): ${text || res.statusText}`);
  }

  return (await res.json()) as { htmlLink?: string; id?: string };
}

export { getClientId };
