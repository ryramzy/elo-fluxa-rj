# elo-matt

A scheduling app for Carioca students with Firebase Authentication and Gemini AI integration.

## Tech Stack
- Frontend: Vite, React 19, TypeScript
- Authentication: Firebase Auth
- Routing: react-router-dom
- AI: @google/genai
- Backend/Agents: FastMCP

## Environment Variables
Create a `.env.local` file in the root with the following variables:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Running the App
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. The app will be available on `http://localhost:5173`.

## Routes
- `/login`: Firebase Email/Password Sign-In
- `/signup`: Firebase Account Creation
- `/agenda`: Booking and Calendar interface (Protected Route). Unauthenticated users are redirected to `/login`.
- `/courses`: Available course catalog

## MCP Integration
Inside `mcp_server/server.py` runs a FastMCP agent handling logic such as:
- `register_carioca_student`
- `list_available_slots` 
- `create_lesson_event`

## Recent Important Fixes

### Booking Architecture & Security Refactor (2026-05-25)
**Problem**: The application previously fetched 70 blank slot documents per week to prove availability, causing extreme latency. It also required manual regeneration of slots. Furthermore, double-booking race conditions could occur.

**Solution**:
- **Default-Available Architecture**: We eliminated the `slots` collection entirely. The Mon-Fri 8AM-9PM schedule is inherently considered open. We now exclusively query the `bookings` collection. An empty schedule returns 0 documents, making the calendar load instantly and scaling infinitely into the future without manual slot creation.
- **Transactional Consistency**: The `bookSlot` function now uses deterministic document IDs (`YYYY-MM-DD_HHMM`) and a strict `runTransaction` check to guarantee that double bookings cannot occur simultaneously.
- **Firestore Security Rules**: Shipped `firestore.rules` that restrict students to creating/deleting exclusively their own booking documents (`request.auth.uid == resource.data.userId`), while granting admins full control.

### Course Card Image Loading Fix (2026-04-14)
**Problem**: Hip Hop and Law Enforcement course cards displayed emoji placeholders instead of images due to broken Unsplash URLs returning binary data.

**Solution**: Replaced external image URLs with self-contained base64 SVG data URIs:
- Hip Hop course: Purple SVG background with "Hip Hop" text
- Law Enforcement course: Green SVG background with "Law Enforcement" text
- Added debugging with onLoad/onError handlers
- Fixed CSS z-index layering for proper image visibility

**Benefits**:
- No external dependency on image services
- Guaranteed image loading regardless of network conditions
- Faster loading (no external HTTP requests)
- Consistent visual appearance across all devices

### Dark Mode Implementation (2026-04-14)
- Added navbar dark mode toggle with sun/moon icons
- Implemented React Context for state management
- Added comprehensive CSS dark mode support
- localStorage persistence for user preferences
- System preference detection

### Enrollment Flow & Firestore Index Fix (2026-05-22)
**Problem 1**: Enrolling in a course by clicking "Começar de graça" resulted in a silent failure where the user was not navigated to the course and no enrollment document was created.
**Problem 2**: Course duration in the sidebar was rendering as `NaNh NaNmin` when lesson durations were undefined or missing.

**Solution**:
- **Firestore Missing Index**: The `enrollments` collection query had multiple `where` clauses (on `userId` and `courseId`), which silently failed due to a missing composite index. Bypassed this by querying only by `userId` and filtering for `courseId` in JavaScript.
- **NaN Time**: Added a safety check with `isNaN()` inside the reduce function, and a fallback render of `—` if the time calculation fails or is `0`.
- **XP Isolation**: Wrapped the `awardXP` function in a `try/catch` within the `enrollInCourse` logic to ensure secondary feature failures (like XP) do not completely break the critical path of course enrollment and navigation.
- **Error UI**: Added a user-facing error banner in `CoursePage.tsx` to surface silent Promise failures (like missing permissions or network drops).

**Benefits**:
- Guaranteed execution of course enrollment by removing rigid dependencies on unindexed fields.
- Better error transparency to users rather than silent browser console errors.
