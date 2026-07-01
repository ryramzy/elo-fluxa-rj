/**
 * Safely parses date and time strings by manually splitting components
 * to bypass Safari's RangeError / Invalid Date engine crashes.
 * 
 * @param dateStr Date string in "YYYY-MM-DD" format
 * @param timeStr Time string in "HH:MM" format
 * @returns A standard JavaScript Date object set to local browser timezone coordinates
 */
export const parseLocalDate = (dateStr: string, timeStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0);
};

/**
 * Normalizes any Date object or date-time coordinates strictly to Rio de Janeiro local time strings (America/Sao_Paulo)
 * 
 * @param dateObj Date object to convert
 * @returns An object with normalized date and time components in Brazil/Rio timezone
 */
export const getRioDateTimeParts = (dateObj: Date): { date: string; time: string } => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(dateObj);

  const partMap: Record<string, string> = {};
  parts.forEach(p => {
    partMap[p.type] = p.value;
  });

  const formattedDate = `${partMap.year}-${partMap.month}-${partMap.day}`;
  const formattedTime = `${partMap.hour}:${partMap.minute}`;

  return { date: formattedDate, time: formattedTime };
};
