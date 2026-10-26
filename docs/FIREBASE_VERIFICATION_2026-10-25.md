# Existing Firebase setup verified — October 25, 2026

This was a read-only verification. Do not create a database, change billing, migrate projects, or generate new Google credentials as part of this maintenance request.

## Login

The live site's JavaScript and Vercel Preview configuration identify Firebase project `gen-lang-client-0976465403` (project number `17211915954`). Google's Firebase Authentication administration API returned HTTP 200 and confirmed:

- The email sign-in provider is enabled.
- The Google sign-in provider is enabled.
- Both `eloingles.com.br` and `www.eloingles.com.br` are authorized domains.

`src/lib/firebase.ts` initializes Firebase Authentication with `getAuth(app)`. `src/hooks/useAuth.ts` restores the signed-in user through `onAuthStateChanged` and starts Google sign-in through `signInWithPopup`. Firebase Authentication manages identity and the login session separately from Firestore. Verifying these settings did not require creating a database or a test user. A new interactive sign-in was not performed on the user's behalf.

## Student data is a separate code path

The same initialization module also calls `getFirestore(app)`. Profiles, bookings, enrollments, notifications, and lesson progress use Firestore in `src/lib/firestore.ts` and the related hooks. Firebase Authentication does not automatically provision that database or persist those application records.

Google's database-list REST API returned HTTP 200 with zero databases for the configured project. The gcloud listing agreed, and describing `(default)` returned `NOT_FOUND`. No student records were queried, no database was created, and no existing resources were modified by these checks.

The site can render and an existing login session can restore independently of that database. These observations do not prove that profile or booking writes are succeeding. The existing server `/api/health` check also fails because Vercel does not list `GOOGLE_SERVICE_ACCOUNT_KEY`; that endpoint measures the server Google/Firestore integration, not Firebase client sign-in.

## Antigravity references

Relevant artifacts are in Antigravity conversation `f8db21ac-ba22-4247-8a43-39de1b177b1b`, under the user's Antigravity `brain` directory:

- `architecture_report.md` (June 30): maps Firebase Authentication and Firestore separately, with Firestore storing user metadata, bookings, and lesson tracking. Its dev/prod project split is an architectural recommendation; the live bundle uses the project verified above.
- `implementation_plan.md` and `walkthrough.md` (September 6): describe Firestore write acknowledgments, local caching, and background synchronization. Those notes explain how the UI can continue while a cloud write is pending; they do not prove the current server write succeeded.
- Repository `docs/REPO_NOTES.md`, `REPO_NOTES.md`, and `DEV_NOTES.md`: document the intended Firestore collections and server environment variables.

The maintenance release remains a draft while its required backend smoke check is failing. Do not silently provision resources or bypass required checks to make that release green.
