# 📱 ELO! Mobile App Architecture & API Specification (Capacitor / Android / Flutter / iOS)

This specification defines the decoupled data structures, authentication protocols, and backend endpoints powering the **ELO! English Learning Platform** across web, Capacitor Android, and future Flutter/iOS native apps.

---

## 1. Authentication & Session Architecture

### Primary Auth Provider: Firebase Auth
- **Sign In Methods:** Google OAuth 2.0 (`GoogleAuthProvider`), Email & Password (`createUserWithEmailAndPassword`).
- **Session Tokens:** JWT ID Tokens issued by Firebase Auth, refreshed automatically.
- **Guest Session Mode:**
  - Tokenless temporary mode (`sessionStorage.setItem('elo_guest', 'true')`).
  - Temporary XP tracking in local memory/storage.
  - Seamless migration to Firebase Auth upon registration.

---

## 2. Core Data Schemas (JSON/TypeScript)

### A. User Profile (`/users/{uid}`)
```json
{
  "uid": "string",
  "displayName": "string",
  "email": "string",
  "photoURL": "string",
  "xp": 450,
  "level": 4,
  "streakDays": 5,
  "lastActiveDate": "2026-07-23T15:00:00Z",
  "badgesEarned": ["first_lesson", "streak_3", "drill_master"],
  "role": "student | tutor | admin | org_admin",
  "timezone": "America/Sao_Paulo",
  "createdAt": "2026-07-01T10:00:00Z"
}
```

### B. Course Definition (`/courses`)
```json
{
  "id": "basic-english-daily-life",
  "title": "Basic English: Daily Life & Survival",
  "titlePt": "Inglês Básico: Vida Diária",
  "description": "Essential English for daily life.",
  "level": "Beginner | High-Beginner | Intermediate | Upper-Intermediate | Advanced | Specialty",
  "tag": "Daily Life | Business | Tech | Culture",
  "emoji": "☀️",
  "totalLessons": 5,
  "lessons": [
    { "id": "be-dl-01", "title": "Greetings & Introductions", "lessonIndex": 0, "xpReward": 50 }
  ]
}
```

### C. Lesson & Slide Data Structure (`/lessonContent`)
Each lesson contains an array of **8 Pipe-Delimited Slide Strings**:

```typescript
// Format: TYPE|||Title|||Content|||EloPrompt|||ExpectedAnswer (optional 5th part for DRILL)
[
  "INTRO|||Greetings & Introductions|||Learn natural greetings...|||Elo: Vamos aprender a se apresentar!",
  "VOCAB|||Core Vocab|||* **I'm...** - Casual...|||Elo: Treine em voz alta!",
  "CONCEPT|||I'm vs My name is|||* **'I'm Matt'** - 90% natural... \n\n> 🗣️ **Connected Speech Phonetics:**\n> Merge into **'aim-mat'**|||Elo: Qual soa mais natural?",
  "EXAMPLE|||Real World|||*\"Hi! I'm Matt.\"*|||Elo: Repita a frase.",
  "CULTURE|||The 'How are you?' Trap|||In the US, 'How are you?' is a greeting.|||Elo: O que você responde?",
  "DRILL|||⚡ Quick Challenge|||Barista: *\"Hi! How are you?\"* \n\n> 🗣️ **Help Box:** *'Good, thanks!'*|||Elo: Reaja rápido!|||Good, thanks!",
  "ROLEPLAY|||🎭 Meeting Sarah|||Sarah: *\"Hi! Welcome!\"* \n\n> 🎭 **Challenge:** Use connected speech *'mee-chew'*.|||Elo: Apresente-se para a Sarah!",
  "REVIEW|||Unlocked Skills|||1. Say 'I'm'\n2. Connected speech **'aim-mat'**\n3. Fast response\n4. US greeting rules|||Elo: Parabéns!"
]
```

### D. Booking Slot & Class Reservation (`/bookings`)
```json
{
  "id": "booking_12345",
  "studentId": "uid_student",
  "tutorId": "matt_ramsay",
  "tutorName": "Matt Ramsay",
  "date": "2026-07-25",
  "time": "14:00",
  "duration": 60,
  "status": "confirmed | cancelled | completed",
  "meetLink": "https://elospeak.com.br/video-call/room_12345",
  "createdAt": "2026-07-23T15:30:00Z"
}
```

---

## 3. Mobile Client Implementation (Flutter / Android / iOS)

### Recommended Flutter Packages for Future Native App:
1. `firebase_core`, `firebase_auth`, `cloud_firestore`: Firebase Auth & Database synchronization.
2. `flutter_tts`, `speech_to_text`: Speech synthesis & voice drill evaluation.
3. `jitsi_meet_flutter_sdk` or `flutter_webrtc`: Live 1-on-1 video call rooms with Matt.
4. `flutter_local_notifications`: Class reminders 15 mins before scheduled live sessions.

---

## 4. Capacitor Android Release Checklist
- [x] Package ID configured: `com.elospeak.app`
- [x] Web asset directory: `dist`
- [x] Safe area viewport: `viewport-fit=cover`
- [x] Status bar theme color: `#0f172a`
- [x] Android permissions: Camera & Microphone (for video calls & speech recognition).
