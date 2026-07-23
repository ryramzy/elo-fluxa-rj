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

## 🛠️ Tech Stack
- **Frontend Framework**: Vite, React 19, TypeScript
- **Styling**: TailwindCSS & Custom Glassmorphism System
- **Database & Auth**: Firebase Auth, Firestore, Security Rules
- **APIs**: Resend Email, Google Calendar, Web Speech API
- **Deployment**: Vercel (`elo-fluxa-rj.vercel.app`), GitHub Actions (`ryramzy/elo-fluxa-rj`), GCP (`elo-fluxa-rj`)

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
