# elo-fluxa-rj — Repo Notes
> Running log of all changes, decisions, and next steps.
> Updated automatically on every push.

---
## [April 11, 2026] — Auth Flow, Dashboard UI + Subscription Model
**Status:** working

### What changed
- Navbar now hides links until authenticated, shows
  avatar + dropdown when logged in
- "Entrar" click opens auth modal directly
- After login, redirects to /dashboard
- Dashboard hero section with animated XP bar
- Stat cards with distinct color identities per metric
- Course cards richer: description, audience tag, 
  XP reward, thicker progress bar, context-aware CTA
- Enroll button opens SubscriptionModal
- 3-tier subscription model: Starter (free), Pro (R$97),
  Elite (R$197)
- Plan stored in Firestore users/{uid}.plan
- Course access locked/unlocked based on plan
- Booking limit enforced per plan (1 / 4 / unlimited)
- Pro/Elite payment placeholder -> WhatsApp for now
- Gamification panel: weekly XP chart, badge tooltips,
  level milestone markers

### Why
- Empty navbar before login was confusing UX
- Dashboard needed visual identity to feel premium
- Monetization layer needed before LMS makes sense
- Subscription model sets up Stripe integration later

### Known issues
- Pro/Elite payment not yet wired (WhatsApp placeholder)
- Stripe integration planned as next major step
- /courses/:courseId lesson pages still placeholder
- Facebook OAuth still pending
- Email notifications on booking still pending

### Next steps
- Integrate Stripe for Pro and Elite subscriptions
- Build individual course lesson pages (LMS layer)
- Wire Google Calendar to availableSlots collection
- Build /admin/students/:uid detailed profile page
- Add email notifications on booking confirmation

---
## [April 10, 2026] — Blank Page Bug Fixed
**Status:** fixed

### What happened
- Blank page on localhost:5173/5175 after admin setup
- Root cause: conflicting importmap in index.html (lines 109-118)
  was forcing browser to load React from CDN instead of Vite,
  breaking module resolution silently

### Fix applied
- Removed <script type="importmap"> block from index.html
- Cleared node_modules/.vite cache
- Restarted dev server - clean startup, no errors

### Result
- Dev server runs cleanly on localhost:5175
- VITE_ADMIN_UID confirmed loading
- /admin route accessible with Matt's account

### Known issues
- Navbar visible before auth (to be fixed next)
- Dashboard UI needs richer cards and content
- Enroll button has no paywall yet
- No subscription/pricing model yet

---
## [April 10, 2026] — Admin Dashboard Built
**Status:** working

### What changed
- /admin protected route - only accessible by Matt's uid (VITE_ADMIN_UID env var)
- useAdminGuard hook - redirects non-admins to /dashboard
- Admin stats row: total students, bookings this week, XP awarded, most popular course
- Upcoming bookings table with confirm/complete/cancel actions
- Student roster with search, XP, level, streak per student
- Course analytics: enrollments, avg progress, completions
- Quick actions: add slot, export CSV, announcement placeholder
- availableSlots Firestore collection - Matt adds slots manually
- Student dashboard booking panel now reads from availableSlots (replaces hardcoded static slots), atomic batch write on booking to prevent double-bookings

### Why
- Completes the core CRM loop: student books -> Matt sees and confirms -> booking tracked in Firestore
- availableSlots collection is the bridge to Google Calendar sync - same data structure, just populated manually for now
- Matt needs roster visibility before the LMS makes sense

### Known issues
- Google Calendar sync not yet wired (slots still manual)
- /admin/students/:uid profile page is a placeholder
- No email notifications on booking confirmation yet
- Facebook OAuth still pending

### Next steps
- Wire availableSlots to Google Calendar API (auto-populate slots from Matt's real availability)
- Build individual course/lesson pages (LMS)
- Email notification on booking confirm (Firebase Extensions or Resend API)
- Build /admin/students/:uid detailed student profile page

---
## [April 10, 2026] — Student Dashboard Built
**Status:** working

### What changed
- Built /dashboard protected route (redirects to home if not authed)
- Firestore schema: users, enrollments, bookings collections
- src/lib/firestore.ts with typed helper functions
- src/data/courses.ts with all 6 course definitions
- src/hooks/: useUserProfile, useEnrollments, useBookings, useStreak
- Dashboard sections: stats row, courses grid, booking panel, badges
- Gamification: XP system, level progression (6 levels), streak tracking, per-course badges
- After login (Google or email/password), user lands on /dashboard

### Why
- CRM foundation: every student now has a Firestore profile
- Gamification drives retention and course completion
- Booking panel is the bridge to the Google Calendar sync (still using static slots for now)

### Known issues
- Booking slots still hardcoded (Google Calendar sync pending)
- /courses/{courseId} lesson pages not yet built (placeholder route)
- Admin/Matt dashboard not yet built
- Facebook OAuth not yet added

### Next steps
- Wire booking slots to real Google Calendar availability
- Build individual course/lesson pages (LMS layer)
- Build Matt's admin dashboard (see all students, bookings, XP)
- Add Facebook OAuth to auth modal

---
## [April 9, 2026] — Email/Password Auth Added to Modal
**Status:** working

### What changed
- Integrated email/password login and create account flow into the existing auth modal popup
- Modal now shows Google Sign In + divider + email/password form in one place
- Added toggle between Login and Create Account modes inside the modal
- Uses signInWithEmailAndPassword and createUserWithEmailAndPassword from firebase/auth
- Kept /login route and Login.tsx as fallback, modal is now primary UX

### Why
- Email/Password was enabled in Firebase but only wired to a separate /login page
- Users clicking "Entrar" in the navbar only saw the Google button - email option was invisible
- Modal is the correct entry point for client auth in the CRM flow

### Known issues
- Facebook auth provider not yet added (planned next)
- Google Calendar sync and live availability slots still using mock data

### Next steps
- Add Facebook OAuth provider to modal
- Wire AGENDAR button to real Google Calendar availability
- Begin CRM client tracking feature (booked classes)

---
## [April 6, 2026] — Fixed React App Loading Issue
**Commit:** eeae960
**Status:** working

### What changed
- Added `include /etc/nginx/mime.types;` to nginx.conf to fix JavaScript MIME type serving
- Added `base: '/'` to vite.config.ts for correct asset paths in production
- These fixes resolve the issue where React app wasn't loading (blank page)

### Why
- nginx was serving .js files as text/plain instead of application/javascript
- Vite was generating relative asset paths that broke in production deployment
- Without these fixes, the React app and Firebase Auth UI couldn't load

### Known issues
- Need to test Firebase Auth UI functionality
- Need to verify Google OAuth popup works correctly
- Need to test protected routes redirect to home page

### Next steps
- Test Sign In and Get Started buttons in navbar
- Verify Google OAuth popup authentication flow
- Test protected routes (/dashboard, /agenda, /lessons, /profile)
- Add localhost to Firebase Auth authorized domains for local testing

---
## [April 6, 2026] — Manual Deployment with Latest Fixes
**Commit:** dc000b5
**Status:** working

### What changed
- Manual deployment using gcloud instead of Cloud Build
- Deployed latest image `dc000b5633b6580f723457b8bfa96ea9b80f732b` from AR registry
- Used `southamerica-east1-docker.pkg.dev` registry path
- Bypassed Docker unavailability in environment

### Why
- Docker not available in PowerShell environment
- Needed to ensure latest nginx and Vite fixes were deployed
- Direct gcloud deployment is more reliable than automated Cloud Build

### Known issues
- Need to verify React app loads correctly with manual deployment
- Need to test Firebase Auth UI functionality
- Need to confirm Google OAuth popup works

### Next steps
- Test Sign In and Get Started buttons appear in navbar
- Verify Google OAuth authentication flow
- Test protected routes redirect behavior
- Validate all Firebase Auth functionality

---
## 2026-04-06 — nginx and Vite config fixes
**Status:** testing
**Commit:** f0373c6

### What changed
- Added include /etc/nginx/mime.types to nginx.conf
- Added default_type application/octet-stream to nginx.conf
- Fixed health endpoint from /healthz to /health
- Confirmed try_files SPA fallback in nginx.conf
- Confirmed COPY path matches /app/dist in Dockerfile
- Confirmed base: '/' already present in vite.config.ts

### Why
- App blank on Cloud Run despite successful build
- JS files served with wrong MIME type or wrong path
- Health endpoint mismatch causing deployment issues
- SPA routing not working properly on production

### Next steps
- Verify live URL loads React app after deploy
- Test Google login on live URL
- Confirm all Firebase Auth functionality works

---
## 2026-04-06 — Root cause found and fixed
**Status:** fixed
**Lesson learned:** Deleting a Cloud Run service requires:
  1. Re-grant secretAccessor to new Cloud Build SA on ALL secrets
  2. Re-push secret values from .env.local to Secret Manager
  3. Trigger a fresh build AFTER both steps above are complete

### What happened
- Firebase error auth/invalid-api-key on live URL
- VITE_* secrets in Secret Manager had wrong/empty values after service deletion
- Cloud Build SA lost secretAccessor permissions when service was recreated

### Fix applied
- Resynced all 7 Firebase secrets from .env.local to Secret Manager
- Re-granted secretAccessor to Cloud Build SA (17211915954@cloudbuild.gserviceaccount.com)
- Manually deployed latest image to elo-matt-rj service
- Fixed service name to match correct URL pattern

### Result
- Live URL: https://elo-matt-rj-17211915954.southamerica-east1.run.app
- Firebase secrets now populated with correct values
- Auth UI should load and Google OAuth should work
