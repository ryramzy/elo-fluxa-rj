# BUGS.md

## RESOLVED
- [FIXED] Standardized canonical tutor ID from legacy 'matthew' to 'matt' across all collections and queries
- [FIXED] Slot blocking engine and days-off management for Matt via blockedSlots collection and TutorAgendaView
- [FIXED] Terms of Service (/termos) 2h vs 24h cancellation window mismatch aligned to 24 hours
- [FIXED] Zoom "Invalid meeting ID (3,000)" error eliminated via dynamic /classroom hub and /settings/classroom
- [FIXED] Classroom page text contrast boosted to >11:1 for outdoor Android legibility (WCAG AA+)
- [FIXED] Mobile calendar week selector clipping under sticky navbar fixed in VisualSlotPicker
- [FIXED] Centralized tutor notification email and meeting room URL in Firestore /settings/tutor with Admin UI
- [FIXED] React hooks order violation crash on Dashboard loading after profile completes
- [FIXED] Profile-not-found lockout/redirection blocks via auto-profile initialization on login
- [FIXED] Guest mode database protections and in-memory sessionStorage fallbacks
- [FIXED] Booking reminders/notifications (integrated hourly Vercel cron and Navbar notification bell)
- [FIXED] Google Calendar insert API errors fallback gracefully to Jitsi Meet links
- [FIXED] Agenda page rebuilt with proper booking flow
- [FIXED] Booking data model updated with googleEventId/meetLink fields
- [FIXED] useBookings hook wired to real Firestore functions
- [FIXED] Created missing useAuth hook for authentication
- [FIXED] Fixed import conflicts between Booking interfaces
- [FIXED] Google Calendar API integration complete with /api/calendar/create-event
- [FIXED] Google Meet link generation working on booking confirmation
- [FIXED] Booking cancellation with Calendar event cleanup
- [FIXED] AgendaPage UI with cancel buttons and confirmation dialogs
- [FIXED] Robotic TTS voice mitigated via abstraction layer prioritizing natural OS voices
- [FIXED] Mobile SlideViewer safe-area cutoffs and hyper-sensitive swiping
- [FIXED] Vercel Hobby Plan 12-function limit (consolidated all api/ routes to <= 5 consolidated files using background rewrites)
- [FIXED] Added booking analytics dashboard for Matt
- [FIXED] Add timezone handling for international users (Sprint 12)

## LOW - BACKLOG
- None outstanding!
