# ELO! (EloSpeak) — Personal Cambly Live Zoom Tutoring Platform

**ELO!** is a high-performance, lightweight personal Cambly platform connecting Brazilian students with native American English teacher Matthew Ramsay (`mramsay0@gmail.com`) and invited tutors via 1-click Zoom live sessions.

---

## 🌟 Key Architecture & Features

1. **📹 Open English Live Zoom Teaching Model:**
   - **Zero-Friction Student Entry**: 1-click **"Entrar no Zoom"** live classroom entry (`https://zoom.us/j/mramsay0`). Students do NOT need to create a Zoom account or sign up to join.
   - **Tutor Presentation Deck**: Built-in slide presentation engine (`SlideViewer.tsx`) with Fullscreen (`F`), Slide Jumper (`G`), Teacher Notes (`T`), and OpenEnglish PDF Material Library ([`MaterialLibraryModal.tsx`](file:///c:/Users/DELL%20I5%20DE%208%C2%BA/Soft%20Dev/elo-fluxa-rj/src/components/course/MaterialLibraryModal.tsx)).

2. **📲 Interactive WhatsApp Onboarding & Notifications:**
   - Contextual WhatsApp messaging triggers (`5522992322566`) for instant student welcome, booking confirmation, and pre-class session inquiries.
   - Real-time GCP / Firebase Analytics tracking for all WhatsApp and session engagement events.

3. **💳 Payments & Paywalls:**
   - **Mercado Pago Pix**: Instant QR Code generation + Chave Pix Copia e Cola with 30-minute live expiration countdown timer.
   - **Stripe Subscriptions**: Seamless credit card checkout for Starter, Pro, and Elite monthly plans.
   - **B2B Corporate Seats**: Credit allocation engine for corporate employee training.

4. **📹 Multi-Tutor GCP Roster Deck:**
   - Dedicated Tutor Management Panel in Admin (`Admin.tsx`) allowing Matt to onboard and manage native tutors with individual Zoom rooms and availability settings.

5. **🔒 Security & Cloud Hardening:**
   - **Firestore Security Rules**: Strict `isOwner()` and `isTutor()` authentication guards on all collections (`users`, `bookings`, `slots`, `tutors`, `settings`).
   - **Zero Hardcoded Secrets**: All API keys (Resend, Stripe, Mercado Pago) managed exclusively via Vercel Environment Variables.

---

## 🛠️ Architecture & Tech Stack

ELO! is built as a **100% Serverless, Cloud-Native Web & Mobile Platform**:

* **Web Frontend**: Vite + React 19 + TypeScript on **Vercel Edge Network**.
* **Database & Auth**: Firebase Auth + Cloud Firestore + GCP Analytics (`analytics_events`).
* **Serverless Edge APIs**: Vercel Serverless Functions (`/api/*`) for transactional emails (Resend), Mercado Pago Pix webhooks, and Calendar integrations.
* **Mobile Ready**: Capacitor wrapper configured for Android/iOS (`com.elospeak.app`) with responsive touch controls.

---

## 🚀 Quick Start Commands

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

### Push updates to GitHub & Vercel:
```bash
git add .
git commit -m "feat: release Open English Zoom architecture & WhatsApp onboarding"
git push origin main
```
