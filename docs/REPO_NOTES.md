# 📘 ELO! Repository Architecture & Production Notes
**Domain:** `eloingles.com.br` | **Project:** `elo-fluxa-rj`
**Stack:** React 19 + TypeScript + Vite + Firebase Firestore + Vercel + Resend

---

## 🏛️ 1. Firestore Database Schema & Conventions

### Core Collections Overview:

```
Firestore Root
│
├── /users/{uid}                           [Student & Tutor Profiles]
│   ├── displayName: string
│   ├── email: string
│   ├── photoURL: string
│   ├── role: 'student' | 'tutor' | 'admin'
│   ├── plan: 'free' | 'monthly' | 'quarterly' | 'pro' | 'unlimited' | 'corporate'
│   ├── xp: number
│   ├── level: number
│   ├── hasSeenOnboarding: boolean          [Permanently true for tutors, admins & returning accounts]
│   ├── hasSeenTour: boolean
│   ├── bookingsThisMonth: number
│   ├── bookingLimit: number
│   ├── targetGoal: string
│   ├── bio: string
│   ├── lastActiveDate: Timestamp
│   └── 📁 notifications/{notifId}         [In-app notifications & Web Push triggers]
│       ├── title: string
│       ├── message: string
│       ├── read: boolean
│       └── createdAt: Timestamp
│
├── /bookings/{bookingId}                  [Deterministic Booking Documents]
│   │                                      Format: {tutorId}_{YYYY-MM-DD}_{HHMM}
│   │                                      (e.g., 'matt_2026-08-25_1400')
│   ├── id: string
│   ├── tutorId: 'matt'                    [Standardized canonical tutor ID]
│   ├── tutorName: 'Professor Matt'
│   ├── userId / uid: string               [Student UID]
│   ├── userName / studentName: string
│   ├── userEmail / studentEmail: string
│   ├── date: 'YYYY-MM-DD'                 (e.g., '2026-08-25')
│   ├── time: 'HH:MM'                      (e.g., '14:00')
│   ├── duration: 60
│   ├── status: 'confirmed' | 'pending' | 'cancelled_by_tutor' | 'cancelled_by_student'
│   ├── meetLink: string                   [Live classroom video gateway]
│   ├── googleEventId: string | null
│   ├── notes: string
│   ├── createdAt: Timestamp
│   ├── datetime: Timestamp                [UTC-3 parsed timestamp for sorting]
│   └── tutorNotes: {                      [Post-Class Feedback (Sprint 2 Dependency)]
│         summary: string,                 [Resumo da Conversação]
│         pronunciation: string,           [Pronúncia & Connected Speech]
│         vocabulary: string,              [Novo Vocabulário & Expressões]
│         homework: string,                [Tarefa / Prática Recomendada]
│         studentRating: number,           [1-5 Stars]
│         attendance: 'present' | 'absent',
│         submittedAt: Timestamp
│       }
│
├── /blockedSlots/{slotId}                 [Tutor Day / Hour Blackouts]
│   │                                      Format: {tutorId}_{YYYY-MM-DD}_{HHMM}
│   ├── tutorId: 'matt'
│   ├── date: 'YYYY-MM-DD'
│   ├── time: 'HH:MM'
│   ├── blocked: true
│   ├── reason: string
│   └── createdAt: Timestamp
│
└── /settings/tutor & /settings/classroom  [Dynamic Zero-Downtime Settings]
    ├── meetingUrl: string                 (e.g., 'https://zoom.us/j/...', 'https://meet.google.com/...')
    ├── provider: 'zoom' | 'meet'
    └── updatedAt: Timestamp
```

---

## ⚠️ 2. Active Development Buffers & Launch Removal Plan

### 📌 `bookingLimit: 99` Temporary Buffer
* **Status:** Active in development (`src/lib/firestore.ts` in `bookSlot()`).
* **Purpose:** Prevents silent transaction aborts and allows unrestricted testing/dogfooding across student and tutor accounts during pre-launch iterations.
* **Launch Action Item:** Before general public onboarding and marketing ad campaigns, wire `bookingLimit` to strict subscription tier enforcement:
  * `free`: 1 session (Trial)
  * `monthly`: 4 sessions / month
  * `quarterly`: 12 sessions / quarter
  * `elite` / `corporate`: custom quota / credit balance.

---

## 📈 3. Scalability & Query Optimization Roadmap (Sprint 2 Task)

### 📌 Date-Range Scoped Booking Queries
* **Current Implementation:** `collection(db, 'bookings')` real-time listener ensures 100% immediate sync during prototype phase.
* **Scale Requirement:** When scaling past 100+ active students, optimize queries using date-scoped ranges:
  * **Student View:** `query(collection(db, 'bookings'), where('date', '>=', currentWeekStart), where('date', '<=', currentWeekEnd))`
  * **Student History (`/perfil`):** `query(collection(db, 'bookings'), where('userId', '==', currentUser.uid), orderBy('datetime', 'desc'), limit(20))`
  * **Tutor Management View:** `query(collection(db, 'bookings'), where('tutorId', '==', 'matt'), where('date', '>=', currentWeekStart))`

---

## 🔒 4. Double-Booking Prevention & Concurrency

* **Deterministic Document ID:** Every slot uses `${tutorId}_${date}_${time.replace(':', '')}`.
* **Firestore Transaction / Atomic Write:** `bookSlot()` executes with atomic deduplication. If two students tap the same slot simultaneously, the write verifies slot availability and prevents collisions.

---

## 🎯 5. Dashboard Architecture & Booking CTA Rule (Single Source of Truth)

* **Primary Booking CTA Rule:** The primary booking call-to-action lives in the **Smart Hero Card ONLY** (`Dashboard.tsx`).
* **No Redundant Booking Buttons:** Sub-widgets (such as `StudentTimeline`, `UpcomingClasses`, `LiveTutorsWidget`, `QuickLinks`) must NOT inject independent booking buttons or redundant KPI counters. Instead, they must render status indicators or direct deep-links (`onNavigateToAgenda`) without creating competing CTAs.
* **Smart Hero Card 3-State Specification:**
  1. **State 1: Confirmed Class (`status === 'confirmed'`):**
     - Title: *"Sua próxima aula está agendada! 🎉"*
     - Details: Class date, time, and Professor Matt.
     - Actions: `📹 Entrar na Sala` (Primary) + `📅 Ver Agenda` (Secondary).
  2. **State 2: Pending Class (`status === 'pending'`):**
     - Title: *"⏳ Aula Aguardando Confirmação"*
     - Subtitle: *"Professor Matt entrará em contato em breve para confirmar seu horário."*
     - Actions: `💬 Falar no WhatsApp` (Primary) + `📅 Ver Agenda` (Secondary).
  3. **State 3: No Upcoming Class:**
     - Title: *"Pronto para sua próxima aula de conversação?"*
     - Subtitle: *"Agende uma sessão individual com o Professor Matt e destrave sua fluência."*
     - Action: `🗓️ Escolher Horário` (Single high-contrast CTA).

