# ELO (EloSpeak) -- LMS and Scheduling App

ELO is a premium, high-fidelity English learning management system (LMS) and 1-on-1 lesson scheduling platform tailored for students. It integrates Firebase Authentication, Firestore databases, Google APIs (Calendar, Meet, Gmail), and browser Speech APIs to deliver a modern, gamified learning experience.

---

## Tech Stack
- **Frontend**: Vite, React 19, TypeScript
- **Styling**: Vanilla CSS with custom design systems (dark mode, glassmorphism, responsive layouts)
- **Database / Auth**: Firebase (Authentication, Firestore, Security Rules)
- **Email**: Resend API
- **APIs and Tools**: Google Calendar / Gmail / Meet APIs, @react-oauth/google, Web Speech API (SpeechSynthesis + SpeechRecognition), swiper.js (native-like touch controls)

---

## Environment Variables
Create a `.env` file in the root with the following variables:
```env
VITE_ADMIN_UID="QI3mgrlplVSNPER0VxuZIPSlo2B3"
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Running the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:5173 in your browser.
4. Compile for production:
   ```bash
   npm run build
   ```

---

## Key Routes
- `/login`: Firebase Email/Password and Google Sign-In interface (with Guest Mode option)
- `/signup`: Student account creation
- `/dashboard`: Unified Student/Tutor dashboard (Protected Route)
- `/agenda`: Booking and Calendar interface (Protected Route)
- `/courses`: Available course catalog (Protected Route)
- `/courses/:courseId`: Course outline and lessons overview
- `/courses/:courseId/lessons/:lessonId`: SlideViewer lessons player
- `/profile`: Editable student profile (Protected Route)
- `/ai-coach`: AI speaking chatbot with speech-to-text (Protected Route)
- `/admin`: Tutor CRM and booking calendar management (Admin Only)
- `/admin/students/:uid`: Detailed student view and notes history (Admin Only)

---

## Core Features and Architecture

### 1. Student LMS Experience
- **Swipeable Slideshow**: Full-screen slide player (swiper.js) with tap-to-advance and progress bars, optimizing learning for mobile viewports.
- **Rich Markdown Formatting**: Lesson text uses react-markdown and remark-gfm to natively support lists, tables, bold text, and blockquotes.
- **Siri-Style AI Tutor Bubble**: A glowing, circular Siri-style audio bubble in the top right corner of the slide viewer that triggers speech synthesis. It displays pulsing gradient ripples and a moving soundwave waveform when speaking.
- **Natural Voice Scoring**: Evaluates and prioritizes the highest-quality English voices installed on the operating system (e.g. Edge/Chrome Natural or Apple Samantha) for a soothing, human-like voice experience.
- **Firestore Write Debouncing**: Progress tracking during lessons is debounced by 2.5 seconds, saving only the final slide index (or flushing on unmount) to minimize database write frequencies and reduce cloud hosting costs by up to 85%.
- **Dopamine Gamification**: Completions trigger confetti bursts and award XP levels.
- **Procedural Sound Engine**: Synthesizes clean sound chimes (for enrollment/lessons) using the browser's Web Audio API, avoiding heavy external MP3 loading.

### 2. 1-on-1 Class Scheduling
- **Default-Available Schedule**: Eliminated heavy pre-created slot documents. The calendar assumes availability from Mon-Fri (8AM-9PM) automatically.
- **Double-Booking Transactional Protection**: Uses Firestore runTransaction and deterministic document IDs (YYYY-MM-DD_HHMM) to prevent concurrent double-booking conflicts.
- **Google Meet Integration**: Automatic creation of Google Meet virtual rooms on booking, falling back to Jitsi Meet URLs if Google Calendar API services are down.

### 3. Tutor CRM Dashboard (/admin)
- **Student Engagement Tracker**: Tracks student streaks, total XP, and last active timestamps.
- **Inactivity Alerts**: Displays a warning alert for students who haven't logged in for 5+ days.
- **WhatsApp Prefilled Nudges**: One-click WhatsApp link triggers a prefilled template prompting inactive students to return and book lessons.
- **Inline Editing**: Allows the tutor to edit student phone numbers directly in the CRM table.

### 4. Speaking Feedback Loop
- **Tutor Feedback Input**: Tutors record Pronunciation, Vocabulary, and Homework recommendations directly inside calendar bookings.
- **TutorNotesWidget**: A beautiful glassmorphic dashboard card displaying notes from the latest completed class.

### 5. Guest Trial Mode
- **10-Minute Expiry**: Users can bypass registration to test-drive the app. A timer banner counts down 10 minutes before automatically logging out.
- **In-Memory Storage**: Enrolling in courses and completing trivia is stored in sessionStorage and completely wiped upon logout, preventing database clutter.

### 6. AI Speaking Coach
- **Voice Recognition & Clarity Scoring**: Dictate responses using SpeechRecognition. ELO scores and displays a pronunciation clarity percentage badge (filtering out noisy confidence scores < 0.4).
- **TEFL/TESOL Certified Feedback**: Grammatical checking is formulated in a certified TEFL/TESOL format (encouragement/praise, correction, and rule explanation in under 25 words).
- **On-Demand Translations**: Translate ELO's English responses into Brazilian Portuguese instantly on click.

### 7. Persistent Notifications Dropdown
- **Real-Time Feed**: Bell in the Navbar showing unread flags for booking updates, trivia completion, and course achievements.

---

## Security and Stability Audits

### 1. React Hooks Ordering Fix
- **Problem**: When a profile finished loading, the dashboard crashed because state and effect hooks were initialized after early conditional returns.
- **Solution**: Moved all hooks in src/pages/Dashboard.tsx to the top level of the component, securing React's hooks lifecycle.

### 2. Firestore Profile Auto-Creation
- **Problem**: New users were redirect-blocked because their profiles didn't exist in Firestore.
- **Solution**: Updated the useUserProfile.ts hook to detect empty profiles and automatically create a default student document on login.

### 3. Safe Sorting
- Hardened date comparison sorting inside useEnrollments.ts to fallback gracefully if enrolledAt fields are undefined or formatted as standard Date objects.
