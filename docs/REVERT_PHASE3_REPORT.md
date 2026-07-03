# Diagnostic & Reversion Report: Phase 3 AI Expansion Rollback

## Overview
To address the consecutive Vercel compilation and packaging checks failures, we executed a clean, stable reversion of the newly introduced **Phase 3 AI Expansion features** back to the stable baseline of **Commit `9b793e4`**. The main repository branch is now restored to an active, green build-and-deploy status on Vercel.

---

## 🔍 Root Cause Analysis of Build Failures

The build failures occurred at two levels during Vercel's packaging of the outputs:

### 1. Serverless Node.js Bundler Clashes (`firebase-admin`)
* **The issue**: We added `"firebase-admin"` to `package.json` to upgrade user plans directly in the backend webhook.
* **The compilation crash**: `firebase-admin` is designed for server-side Node.js applications and contains heavy binary and native system dependencies (such as gRPC, long, and proto buffers). Vercel's serverless bundler attempts to package and type-check all serverless functions inside `/api/` in isolation. Importing `firebase-admin` or importing the client-side `db` (which resolved down to `import.meta.env` within Vite config) triggered unresolved dependency compile exceptions.

### 2. Dependency Disconnect (`@capacitor/core`)
* **The issue**: In a previous commit, we staged Capacitor mobile configuration wrappers, which added `@capacitor/core` imports in `src/utils/mobilePermissions.ts`.
* **The compilation crash**: When rolling back `package.json` to clean up the backend dependencies, the Capacitor dev dependencies were uninstalled, but the client code `src/utils/mobilePermissions.ts` still imported `@capacitor/core`. This caused Vite/Rollup compilation checks to throw a fatal error: `Rollup failed to resolve import "@capacitor/core"`.

---

## 🛠️ Reversion Actions Taken

We have rolled back the workspace to the stable frontend/backend architecture baseline of **Commit `9b793e4`**:

1. **Removed Webhook & Cron APIs**: Deleted `api/webhooks/mercado-pago.ts` and `api/cron/b2b-report.ts`.
2. **Restored Serverless Bookings Helpers**: Reverted `api/email/lesson-reminder.ts` and `api/force-create-slots.ts` to their previous stable models.
3. **Removed Native Mobile Wrapper Configuration**: Deleted `capacitor.config.ts` and `src/utils/mobilePermissions.ts`.
4. **Cleaned Up Frontend Coach & Speech Engine**: Restored `src/pages/AiCoachPage.tsx` and `src/utils/tts.ts` to their previous stable versions (excluding the pronunciation grading dashboard and regional accent switches).
5. **Cleaned Up Dependencies**: Restored `package.json` and `vercel.json` to the original stable configurations.

---

## 💡 How to Safely Re-implement Phase 3 Later

To implement the payment webhook, speech accents, and pronunciation analyzer later without causing Vercel compilation crashes, follow these architectural guidelines:

### A. Implementing the Mercado Pago Webhook (Without `firebase-admin`)
* **Avoid `firebase-admin` entirely**: To write/read Firestore from Vercel Serverless Functions, use **Firebase REST API Calls** instead of importing the Admin SDK or Client SDK. The REST API is dependency-free, extremely fast, and requires no packaging or gRPC configuration.
* **REST URL Example**:
  `PATCH https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/users/{uid}`
* **Authorization**: Authenticate REST requests using Google Auth client libraries or metadata tokens.

### B. Safe Pronunciation Grader & Accent Engines
* **Avoid external imports inside `mobilePermissions.ts`**: If Capacitor is needed, install it in a standalone branch dedicated to native app wrapping.
* **Local Speeches**: The Web Speech API (`SpeechSynthesis` and `SpeechRecognition`) is native to browsers. You can write accent and grader code using pure Vanilla JS without installing native shell dependencies on the web repository.
