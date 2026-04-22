# BUGS.md

## RESOLVED
- [FIXED] Agenda page rebuilt with proper booking flow
- [FIXED] Booking data model updated with googleEventId/meetLink fields
- [FIXED] useBookings hook wired to real Firestore functions
- [FIXED] Created missing useAuth hook for authentication
- [FIXED] Fixed import conflicts between Booking interfaces

## MEDIUM - PENDING TONIGHT
- [OPEN] Google Calendar API integration - stubs ready in 
  src/lib/googleCalendar.ts | googleCalendar.ts + /api/ | HIGH
- [OPEN] Auto-generate Google Meet links on booking confirmation

## LOW - BACKLOG
- [OPEN] Add booking cancellation UI in AgendaPage
- [OPEN] Add booking reminders/notifications
- [OPEN] Add timezone handling for international users
