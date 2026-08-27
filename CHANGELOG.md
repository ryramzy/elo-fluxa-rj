# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Unified 3-tier Notification System:
  - Layer 1: Resend transactional emails across all 5 booking lifecycle events with non-blocking error logging.
  - Layer 2: Real-time In-App Notifications in `/users/{uid}/notifications` with bell indicator, unread badge, and `actionUrl` navigation.
  - Layer 3: Web Push Notifications via `api/push.ts` with VAPID authentication, Service Worker push/click listeners, and PWA standalone detection.
- 1-click "Copiar Link da Sala de Aula" in `ClassroomPage.tsx` with clipboard and `execCommand` fallbacks.

### Fixed
- Fixed Profile Navigation redirect loop in `ProfilePage.tsx` where premature Firestore checks caused mobile users to bounce `/profile` $\rightarrow$ `/login` $\rightarrow$ `/dashboard`. Added a bounded 3-second loading skeleton and auth profile fallback.
- Fixed Android / Motorola classroom launch in `ClassroomPage.tsx` and `Dashboard.tsx` by replacing popup-blocked `window.open` calls with native `<a>` tags for direct Google Meet / Zoom Android Intent launch.
- Slot blocking engine with `blockedSlots` Firestore collection, `blockSlot`/`unblockSlot` helpers, and 1-tap blocking UI in `TutorAgendaView.tsx`.
- Persistent live classroom hub (`ClassroomPage.tsx`) at `/classroom` and `/sala` reading dynamic zero-downtime meeting URLs from `/settings/classroom`.
- Tutor settings configuration panel in `Admin.tsx` allowing direct editing of notification email and live meeting links in `/settings/tutor`.
- Resend DNS setup guide in `docs/RESEND_DNS_SETUP.md` and cold-start health logging in `api/email.ts`.
- One-time migration script at `scripts/migrate-tutor-id.ts` for legacy `'matthew'` $\rightarrow$ `'matt'` tutor ID transition.

### Fixed
- Standardized canonical tutor ID to `'matt'` across all frontend components, database queries, and WhatsApp notifications.
- Aligned legal Terms of Service at `/termos` and email cancellation reminders to the strict 24-hour window enforced in `cancelBooking()`.
- Elevated `ClassroomPage.tsx` text contrast ratios to >11:1 for flawless outdoor sunlight legibility on mid-range Android displays (WCAG AA+).
- Fixed mobile calendar week selector overflow and clipping in `VisualSlotPicker.tsx`.
- Redesigned `AgendaPage.tsx` into a modern, role-aware Scheduling Dashboard (Tutor control panel with sidebar controls, JS mini-month calendar, reactive status filters, inline pending requests accept/decline actions, template editor, booking URLs copy actions, and chronological timeline stream; Student schedule list with upcoming confirmed slots and interactive Visual Slot Picker booking overlay).
- Real-time Firestore presence status listeners (`/settings/tutor_presence`) enabling instant Jitsi Meet calling hooks.
- Student geolocation coordinates lookups with Nominatim reverse geocoding API integration, browser cookie trackers, and Brazilian LGPD consent gating checks.
- TTS abstraction layer (`src/utils/tts.ts`) prioritizing natural-sounding system voices (e.g., 'Samantha', 'Google US English').
- Dark mode toggle functionality in navbar with sun/moon icons
- Dark mode context provider with localStorage persistence
- Comprehensive dark mode CSS styling for all components

### Fixed
- Optimized spacing, paddings, and margins across Dashboard, VisualSlotPicker, and TutorAgendaView on mobile viewports to let layouts float naturally.
- Decoupled admin CRM page loading hooks `loadUsers()` and `loadEnrollments()` from active scheduling calendar week shifts to prevent redundant database queries.
- Added default plan fallback safeguards (`(user.plan || 'free').toUpperCase()`) to prevent admin CRM page crashes on newly registered user accounts without assigned plans.
- Re-architected tutor agenda and student scheduling slot queries to query by `tutorId` directly in Firestore and date-slice documents in memory, avoiding composite index dependencies and resolving calendar loading lag.
- Switched Vercel serverless TypeScript compilation settings to `"module": "ESNext"` and added explicit `.js` extensions to relative api imports, aligning local compilation with Node.js ES Modules serverless runtime to prevent `ReferenceError: exports is not defined` and `ERR_MODULE_NOT_FOUND` deployment crashes.
- Mobile `SlideViewer` safe area padding (`env(safe-area-inset)`) to prevent notch cut-offs.
- `Swiper` sensitivity in `SlideViewer` (added `threshold` and `resistanceRatio`) to prevent accidental slide changes.
- **CRITICAL**: Dark mode conflict between Context API and useDarkMode hook - standardized on hook approach, removed Context implementation
- Fixed Navbar.tsx useDarkMode import path (../src/hooks -> ../src/hooks)
- Added FOUC prevention script to index.html
- Added dark: Tailwind variants to all Navbar elements
- Confirmed tailwind.config.js uses darkMode: 'class'
- Dark mode toggle now visible on mobile
- **CRITICAL**: Course card image loading issue for Hip Hop and Law Enforcement courses
- Root cause: Unsplash URLs returning binary data instead of valid images
- Solution: Replaced with self-contained base64 SVG data URIs
- Added onLoad/onError handlers for image debugging
- Fixed z-index layering so images are visible under colored overlays

### Changed
- Refined all English lesson dialogue (`beginner`, `intermediate`, `advanced-business`, `specialty`) to remove excessive hype and exclamation marks, ensuring a calm, supportive coaching tone.
- Hip Hop course card: Purple SVG background with "Hip Hop" text (was broken mic emoji)
- Law Enforcement course card: Green SVG background with "Law Enforcement" text (was broken car emoji)
- Both cards maintain "New" badges and proper styling consistency

## [2026-04-14] - Version 1.2.0

### Added
- Dark mode toggle functionality
- Dark mode context and state management
- CSS dark mode support with proper color schemes

### Fixed
- Course card image loading failures
- Hero section copy and UI polish
- Button styling and mobile responsiveness

### Changed
- Updated hero subtext to "Comece sem pressão. Evolua no seu ritmo."
- Improved WhatsApp button styling with brand green #22C55E
- Enhanced mobile button spacing (12px minimum gap)

## [Earlier] - Version 1.1.0

### Added
- Course showcase section with multiple course cards
- Interactive enrollment system
- Authentication with Google OAuth
- Toast notification system
- Protected routes for authenticated content

### Fixed
- Initial setup and routing issues
- Authentication flow problems

---

## Technical Notes

### Course Card Image Fix (2026-04-14)
**Issue**: Hip Hop and Law Enforcement course cards showed emoji placeholders instead of images
**Root Cause**: Unsplash URLs returning binary data, not valid image content
**Solution**: 
- Replaced external URLs with self-contained base64 SVG data URIs
- Hip Hop: `data:image/svg+xml;base64,...` with purple background (#8B5CF6)
- Law Enforcement: `data:image/svg+xml;base64,...` with green background (#059669)
- Added debugging with onLoad/onError handlers
- Fixed CSS z-index layering for proper image visibility

**Benefits**:
- No external dependency on image services
- Guaranteed image loading regardless of network conditions
- Consistent visual appearance across all devices
- Faster loading (no external HTTP requests)
- Better fallback handling

### Dark Mode Implementation (2026-04-14)
**Features**:
- Navbar toggle with sun/moon icons
- System preference detection
- localStorage persistence
- Comprehensive CSS dark mode support
- Smooth transitions between themes

**Technical Details**:
- React Context API for state management
- CSS custom properties for theme switching
- Responsive design maintained in dark mode
- Proper contrast ratios for accessibility
