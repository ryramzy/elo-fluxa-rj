# ELO (EloSpeak) — English LMS & 1-on-1 Tutoring Platform

**ELO** is a high-fidelity English learning management system (LMS) and 1-on-1 live lesson scheduling platform with native tutor Matt Ramsay in Rio de Janeiro.

---

## 🌟 Key Features

1. **📚 100% Gold Standard Curriculum Engine:**
   - 159 lessons with 8-slide structure (`INTRO`, `VOCAB`, `CONCEPT`, `EXAMPLE`, `CULTURE`, `DRILL`, `ROLEPLAY`, `REVIEW`).
   - Connected Speech Phonetics, ⚡ Quick Challenge drills, 🎭 Vivid US Roleplays, and tutor coaching prompts in Brazilian Portuguese.

2. **🌐 Unauthenticated Landing Page & Demo Conversion:**
   - Interactive 1-click **"Testar Aula Grátis (Sem Cadastro)"** demo lesson trigger.
   - Seamless guest-to-full account progress migration.

3. **📅 Live 1-on-1 Tutoring Engine with Matt Ramsay:**
   - Real-time slot booking, Google Calendar `.ics` exports, WhatsApp confirmation, and live video call room links (`/video-call/:roomId`).

4. **📱 Mobile App & Flutter/iOS Architecture:**
   - Capacitor Android app configuration (`com.elospeak.app`).
   - Published Decoupled API Specification ([`docs/MOBILE_FLUTTER_API_SPEC.md`](file:///c:/Users/DELL%20I5%20DE%208%C2%BA/Soft%20Dev/elo-fluxa-rj/docs/MOBILE_FLUTTER_API_SPEC.md)) for future Flutter/iOS native apps.

---

## 🛠️ Architecture & Tech Stack

ELO! is designed as a **100% Serverless, Cloud-Native Web & Mobile Platform**:

* **Web Frontend (Vite + React 19 + TypeScript)**: Built with Vite for ultra-fast client-side bundle execution, instant hot-reloading (HMR), and zero SSR server overhead. Hosted on **Vercel Edge Network**.
* **Mobile Ready**: Capacitor wrapper configured for Android/iOS, with a complete REST API spec (`docs/MOBILE_FLUTTER_API_SPEC.md`) ready for React Native or Flutter mobile apps.
* **Backend & Database**: Firebase Auth + Cloud Firestore + GCP Cloud Functions (Serverless).
* **Serverless APIs**: Vercel Serverless Functions (`/api/*`) handling Email (Resend), Google Calendar sync, and webhook integrations.
* **Styling**: Modern TailwindCSS + Custom Glassmorphism UI/UX design system.
* **CI/CD Pipeline**: GitHub -> Vercel automatic deployments (`ryramzy/elo-fluxa-rj`).

---

## 🚀 Quick Start Commands

### Preview website on local dev server:
```bash
npm run dev
```

### Build production bundle:
```bash
npm run build
```

### Push updates to GitHub & Vercel:
```bash
git add .
git commit -m "feat: ELO GTM release readiness & curriculum engine"
git push origin main
```
