# ELO! Development Notes & Architecture Guide

> Last Updated: September 1, 2026
> Production Domain: https://eloingles.com.br

---

## 1. Cross-Platform QA Test Results (September 1, 2026)

Full automated functional and UI/UX testing performed across all three target form factors:

### A. Desktop (1280px+ / Chromium, Firefox, WebKit)
- **Functional Tests:** 23/23 PASSED (36.8s)
- **UI/UX Design Health Score:** 100/100 (14/14 PASSED)
- **Layout & Interactions:** Smooth desktop hover states, zero layout shift (CLS < 0.05), full keyboard accessibility, clear visual hierarchy.
- **Classroom Obsidian Theme:** High-contrast slate styling with verified 1-click Zoom launch and link copier fallback.

### B. Mobile iOS (iPhone SE 375px & iPhone 14/15 390px / Mobile Safari)
- **Zero Horizontal Overflow:** Verified on 375px and 390px viewports.
- **Form Ergonomics:** Text input font sizes enforced at 16px to completely eliminate unwanted iOS auto-zoom on focus.
- **Apple Calendar Integration:** Generates valid RFC 5545 `.ics` with `TRIGGER:-PT15M` pre-alarm, strict UTC date math (+3 hours for BRT), and clean `text/calendar` MIME type for native iOS Calendar capture.
- **Touch Targets:** All buttons, calendar cells, and CTAs strictly exceed the 44x44px ergonomic touch target requirement.

### C. Mobile Android (Pixel 7 / Galaxy 412px / Android Chrome & WebViews)
- **Direct App Launch:** Semantic `<a>` tags with `target="_blank"` prevent popup-blockers when opening Zoom/Google Meet.
- **Clipboard Fallback:** Double-layered clipboard copy (`navigator.clipboard` + `document.execCommand('copy')`) ensures link copying works on older Android WebViews.
- **Universal Notification Prompts:** Removed standalone-only PWA gatekeeper so Android users get native browser push notifications directly.

---

## 2. Key Architecture & Recent Upgrades

### A. Mercado Pago & Pix Checkout Architecture (`api/checkout.ts`, `CheckoutForm.tsx`)
- **Payment Engine Focus:** 100% focused on Mercado Pago and Pix for the Brazilian market. Stripe client-side buttons cleanly removed from UI.
- **Self-Healing Fallback:** When calling direct transparent Pix (`/v1/payments`), if Mercado Pago returns `401 Unauthorized use of live credentials` (code 7) because direct API homologation is pending, the backend automatically creates a **Checkout Pro Preference** and seamlessly redirects the student to the official Mercado Pago hosted payment screen where Pix, Credit Cards (up to 12x), and Wallet work without errors.
- **Zero Raw JSON Errors:** Error boundaries now display user-friendly Portuguese copy with dual 1-click recovery buttons (`[ 💳 Pagar no Mercado Pago Oficial ]` and `[ 🔑 Pagar com Chave Pix Direta ]`).

### B. Universal Push & Class Reminders (`pushNotifications.ts`, `usePushNotifications.ts`)
- **Removed PWA Standalone Gatekeeper:** Browsers on desktop and mobile web can now request notification permissions directly without requiring home screen installation first.
- **User-Activated Gestures:** Removed illegal `useEffect` page-load calls to comply with modern browser security policies.
- **Profile Management Card:** Added dedicated notification controls on `/profile` with live status indicators and an instant **"Testar Notificação Agora"** button.
- **Navbar Bell Dropdown:** Integrated 1-tap activation banner when notifications have not yet been granted.

### C. Email Gateway with Automatic Fallback (`api/email.ts`)
- **Multi-Sender Fallback:** Dispatches from `contato@eloingles.com.br`. If Resend rejects due to unverified custom domain DNS, the system automatically retries with `onboarding@resend.dev` to ensure admin and test alerts are never lost.
- **Diagnostic Health Endpoints:**
  - `GET /api/email/health` — Checks API key and sender configuration.
  - `GET/POST /api/email/test?to=mramsay0@gmail.com` — Fires a live end-to-end test verification email.

### D. Classroom Page Streamlining (`ClassroomPage.tsx`)
- **Removed Fake Indicators:** Eliminated static, non-functional "Microfone OK / Áudio HD OK / 100% Privado" badges.
- **Added Pre-Class Tips:** Replaced with honest, actionable pre-class advice (headphones, quiet room, microphone test).
- **Accurate Labeling:** Renamed button to "📚 Cursos ELO!" to honestly reflect destination.

---

## 3. Environment & Configuration Checklist

| Variable | Description | Required For |
|---|---|---|
| `MERCADO_PAGO_ACCESS_TOKEN` | Production Access Token (`APP_USR-...`) | Checkout & Pix |
| `MERCADO_PAGO_PUBLIC_KEY` | Production Public Key (`APP_USR-...`) | Client SDK |
| `RESEND_API_KEY` | Resend API Key (`re_...`) | Transactional Emails |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Service Account JSON | Google Calendar & Firestore Auth |
| `VAPID_PUBLIC_KEY` / `PRIVATE_KEY` | Web Push Keys | Background Web Push |
| `VITE_APP_URL` | App Base URL (`https://eloingles.com.br`) | Email links & callbacks |
