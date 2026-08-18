# ELO! — Native Tutor Marketplace & Language Platform

**ELO!** (eloingles.com.br) is a high-performance, lightweight personal tutoring platform connecting students with native English speakers via 1-click Zoom live sessions.

---

## 🚀 Key Architecture & Features

1. **Open English Live Zoom Teaching Model:**
   - **Zero-Friction Student Entry**: 1-click **"Entrar no Zoom"** live classroom entry. Students do NOT need to create a Zoom account or sign up to join.
   - **Tutor Presentation Deck**: Built-in slide presentation engine (`SlideViewer.tsx`) with Fullscreen (`F`), Slide Jumper (`G`), Teacher Notes (`T`), and PDF Material Library.

2. **Interactive WhatsApp Onboarding & Notifications:**
   - Contextual WhatsApp messaging triggers for instant student welcome, booking confirmation, and pre-class session inquiries.
   - Real-time GCP / Firebase Analytics tracking for all WhatsApp and session engagement events.

3. **Payments & Subscription Paywalls:**
   - **Smart Routing:** Unsubscribed students are seamlessly routed to a locked dashboard paywall.
   - **Mercado Pago Pix**: Instant QR Code generation + Chave Pix Copia e Cola with 30-minute live expiration countdown timer.
   - **Stripe Subscriptions**: Seamless credit card checkout for Monthly and Quarterly plans.

4. **Multi-Tutor Marketplace Deck:**
   - **Tutor Application Flow (`/apply`)**: Prospective native tutors can apply directly from the platform. Applications automatically set the user's role to `tutor_pending` with a locked holding screen.
   - **Admin Management Panel (`/admin`)**: A centralized dashboard allowing platform admins to view pending applications and instantly **Approve** (sets role to `tutor`) or **Decline** candidates.
   - **Cambly-Style Booking**: Approved students gain access to the `VisualSlotPicker` to schedule 1:1 sessions with approved tutors.

5. **Security & Cloud Hardening:**
   - **Firestore Security Rules**: Strict role-based authentication guards (`student`, `tutor`, `admin`) on all collections (`users`, `bookings`, `slots`, `tutor_applications`).
   - **Zero Hardcoded Secrets**: All API keys (Resend, Stripe, Mercado Pago) managed exclusively via Vercel Environment Variables.

---

## 🛠 Architecture & Tech Stack

ELO! is built as a **100% Serverless, Cloud-Native Web & Mobile Platform**:

* **Web Frontend**: Vite + React 19 + TypeScript + Tailwind CSS (v3 PostCSS) on **Vercel Edge Network**.
* **Database & Auth**: Firebase Auth (1-tap Google SSO) + Cloud Firestore.
* **Serverless Edge APIs**: Vercel Serverless Functions (`/api/*`) for transactional emails (Resend) and Stripe integrations.
* **Mobile Ready**: Capacitor wrapper configured for Android/iOS (`com.elospeak.app`) with responsive touch controls.

---

## ⚡ Quick Start Commands

### Start local dev server:
```bash
npm run dev
```

### Validate TypeScript compilation:
```bash
npx tsc --noEmit
```

### Build production bundle:
```bash
npm run build
```

### Sync Capacitor for Mobile:
```bash
npx cap sync
```
