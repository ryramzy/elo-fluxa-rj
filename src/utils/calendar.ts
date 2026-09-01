/**
 * Calendar export utilities for ELO! English
 * Supports Apple Calendar (.ics with 15-min reminder alarm), Google Agenda, and Microsoft Outlook.
 */

export interface CalendarBookingDetails {
  id?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  tutorName?: string;
  meetLink?: string;
}

/**
 * Detects if the current user agent is an Apple device (iOS, iPhone, iPad, Mac)
 */
export const isAppleDevice = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const userAgent = window.navigator.userAgent || window.navigator.vendor || '';
  return /iPad|iPhone|iPod|Macintosh|Mac OS X/i.test(userAgent);
};

/**
 * Converts booking date & time to UTC Date objects
 */
export const getBookingDateRange = (booking: CalendarBookingDetails): { start: Date; end: Date } => {
  const [year, mMonth, mDay] = booking.date.split('-').map(Number);
  const [mHour, mMinute] = booking.time.split(':').map(Number);
  
  // Brazil standard timezone offset: UTC-3 (add 3 hours for UTC)
  const startDate = new Date(Date.UTC(year, mMonth - 1, mDay, mHour + 3, mMinute, 0));
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 60-minute duration

  return { start: startDate, end: endDate };
};

const formatUtcIso = (d: Date): string => {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generates pre-filled Google Calendar event URL
 */
export const getGoogleCalendarUrl = (booking: CalendarBookingDetails): string => {
  const { start, end } = getBookingDateRange(booking);
  const dates = `${formatUtcIso(start)}/${formatUtcIso(end)}`;
  const title = encodeURIComponent(`Aula de Inglês ELO! com ${booking.tutorName || 'Professor Matt'}`);
  const details = encodeURIComponent(
    `Sua aula particular de conversação no ELO!\nLink da sala ao vivo: ${booking.meetLink || 'https://eloingles.com.br/classroom'}`
  );
  const location = encodeURIComponent(booking.meetLink || 'https://eloingles.com.br/classroom');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
};

/**
 * Generates pre-filled Microsoft Outlook / Live event URL
 */
export const getOutlookCalendarUrl = (booking: CalendarBookingDetails): string => {
  const { start, end } = getBookingDateRange(booking);
  const title = encodeURIComponent(`Aula de Inglês ELO! com ${booking.tutorName || 'Professor Matt'}`);
  const details = encodeURIComponent(
    `Sua aula particular de conversação no ELO!\nLink da sala ao vivo: ${booking.meetLink || 'https://eloingles.com.br/classroom'}`
  );
  const location = encodeURIComponent(booking.meetLink || 'https://eloingles.com.br/classroom');

  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${details}&location=${location}`;
};

/**
 * Generates RFC 5545 compliant .ics (iCalendar) content with 15-minute prior reminder alert
 */
export const generateIcsContent = (booking: CalendarBookingDetails): string => {
  const { start, end } = getBookingDateRange(booking);
  const now = new Date();
  const uid = `elo-booking-${booking.id || Date.now()}-${Math.random().toString(36).substring(2, 8)}@eloingles.com.br`;
  const tutor = booking.tutorName || 'Professor Matt';
  const meetLink = booking.meetLink || 'https://eloingles.com.br/classroom';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ELO! Inglês//eloingles.com.br//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatUtcIso(now)}`,
    `DTSTART:${formatUtcIso(start)}`,
    `DTEND:${formatUtcIso(end)}`,
    `SUMMARY:Aula de Inglês ELO! com ${tutor}`,
    `DESCRIPTION:Sua aula particular de conversação no ELO!\\nLink da sala: ${meetLink}`,
    `LOCATION:${meetLink}`,
    `URL:${meetLink}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete: Aula de Inglês no ELO! em 15 minutos',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

/**
 * Triggers native .ics file download/import.
 * On iOS Safari / Chrome, this directly opens the native Apple Calendar event sheet.
 */
export const downloadIcsFile = (booking: CalendarBookingDetails, filename = 'aula-elo-ingles.ics'): void => {
  const icsData = generateIcsContent(booking);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });

  // For iOS/Android & standard browsers
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
};
