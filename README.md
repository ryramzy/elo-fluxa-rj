# ELO! — Native Tutor Marketplace & English Learning Platform 🇧🇷🇺🇸

**ELO!** ([eloingles.com.br](https://eloingles.com.br)) is a high-performance, mobile-first language platform connecting Brazilian learners with native English speakers via interactive curriculum, personalized 1:1 live Zoom coaching, and gamified practice.

---

## 🌟 Key Features & Architecture

### 1. 🎯 Interactive 4-Step Student Onboarding
- **Personalized Learning Plan:** When a student creates an account, they complete an interactive questionnaire selecting their current level (Iniciante, Básico, Intermediário, Avançado), primary goal (Carreira, Viagens, Conversação, Mídia), biggest speaking hurdle, and daily study pace.
- **Instant Welcome Reward:** Automatically awards **+50 XP** with celebratory confetti animation and saves the customized curriculum path directly into their Firestore profile.

### 2. 👨‍🏫 Live 1:1 Teaching & Booking System
- **1-Click Zoom Live Sessions:** Instant access to live video sessions with native teachers.
- **Visual Slot Picker (`VisualSlotPicker.tsx`):** Cambly-style booking calendar converting slots dynamically to Rio de Janeiro local time (`America/Sao_Paulo`).
- **Presentation Deck (`SlideViewer.tsx`):** Built-in interactive slide engine with Fullscreen (`F`), Slide Jumper (`G`), and Teacher Notes (`T`).

### 3. 📱 Mobile-First & App Store Ready
- **PWA "Add to Home Screen" (`PwaInstallPrompt.tsx`):** 1-tap install on Android/Chrome and step-by-step 3-tap visual guide on iOS Safari.
- **Capacitor Mobile Shell:** Ready for native iOS & Android stores (`com.elospeak.app`).
- **Apple & LGPD Compliance:**
  - **Account Deletion Flow (`ProfilePage.tsx`):** Self-service account deletion requiring confirmation to permanently purge profile & auth records (Apple Guideline 5.1.1(v)).
  - **Legal URLs:** Live **[Privacy Policy](/privacidade)** (LGPD compliant) and **[Terms of Service](/termos)** pages.

### 4. 💳 Payments & Subscriptions
- **Mercado Pago Pix:** Instant QR Code & Copia e Cola with live expiration countdown timer.
- **Stripe Subscriptions:** Credit card checkout for Monthly and Quarterly membership tiers.

### 5. 📧 Transactional Email Infrastructure (Resend)
- Automated emails sent via `ELO! <contato@eloingles.com.br>`:
  - Welcome email on registration (`/api/email/welcome`)
  - Booking confirmation & calendar invite
  - Tutor application received & admin approval notifications

---

## 🛠 Tech Stack

* **Frontend:** React 19 + TypeScript + Vite 6 + Tailwind CSS (v3 PostCSS) + Framer Motion
* **Hosting & Edge APIs:** Vercel Edge Network + Serverless Functions (`/api/*`)
* **Auth & Database:** Firebase Auth (Google SSO + Email/Password) + Cloud Firestore
* **Mobile Runtime:** Capacitor 6 / Progressive Web App (PWA)
* **Email Gateway:** Resend API

---

## 📁 Repository Structure

```text
├── api/                        # Vercel Serverless Edge endpoints (Resend email, stripe, webhooks)
├── public/                     # Static assets, PWA manifest, service worker, icons
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Auth/               # Login, Signup, ProtectedRoute
│   │   ├── booking/            # VisualSlotPicker, TutorAgendaView
│   │   ├── dashboard/          # WelcomeBanner, CoursesGrid, InteractiveOnboardingModal
│   │   └── navigation/         # Navbar, BottomNav, PwaInstallPrompt
│   ├── data/                   # Course curriculum, slide decks & lesson content
│   ├── hooks/                  # Custom React hooks (useAuth, useUserProfile, useEnrollments)
│   ├── lib/                    # Firebase, Firestore, and Stripe initializations
│   ├── pages/                  # Route views (Dashboard, AgendaPage, ProfilePage, PrivacyPolicy, TermsOfService)
│   └── utils/                  # Analytics, auth error translation, date parsers
├── firestore.rules             # Role-based security rules (student, tutor, admin)
├── capacitor.config.json       # Mobile application bundle configuration
└── vercel.json                 # Routing, headers, and serverless rules
```

---

## ⚡ Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

### 3. Type Checking & Production Build
```bash
npx tsc --noEmit
npm run build
```

### 4. Deploy to Vercel Production
```bash
npx vercel deploy --prod
```

---

## 🔒 Security & Invariants
- **Zero Hardcoded Secrets:** All API keys managed via Vercel Environment Variables.
- **Mobile Safari Guard:** `useAuth` contains a 1.5s fallback timer and safe `sessionStorage` wrappers to prevent loading freezes on mobile Safari / private browsing.
- **Desktop Scroll Isolation:** Root `html` tag remains free of `touch-action` or overflow locks to ensure standard mousewheel and trackpad operation.
