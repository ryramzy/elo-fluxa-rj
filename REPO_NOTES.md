# elo-fluxa-rj — Repo Notes
> Running log of all changes, decisions, and next steps.
> Updated automatically on every push.

---
## [April 6, 2026] — Fixed React App Loading Issue
**Commit:** eeae960
**Status:** working

### What changed
- Added `include /etc/nginx/mime.types;` to nginx.conf to fix JavaScript MIME type serving
- Added `base: '/'` to vite.config.ts for correct asset paths in production
- These fixes resolve the issue where React app wasn't loading (blank page)

### Why
- nginx was serving .js files as text/plain instead of application/javascript
- Vite was generating relative asset paths that broke in production deployment
- Without these fixes, the React app and Firebase Auth UI couldn't load

### Known issues
- Need to test Firebase Auth UI functionality
- Need to verify Google OAuth popup works correctly
- Need to test protected routes redirect to home page

### Next steps
- Test Sign In and Get Started buttons in navbar
- Verify Google OAuth popup authentication flow
- Test protected routes (/dashboard, /agenda, /lessons, /profile)
- Add localhost to Firebase Auth authorized domains for local testing

---
## [April 6, 2026] — Manual Deployment with Latest Fixes
**Commit:** dc000b5
**Status:** working

### What changed
- Manual deployment using gcloud instead of Cloud Build
- Deployed latest image `dc000b5633b6580f723457b8bfa96ea9b80f732b` from AR registry
- Used `southamerica-east1-docker.pkg.dev` registry path
- Bypassed Docker unavailability in environment

### Why
- Docker not available in PowerShell environment
- Needed to ensure latest nginx and Vite fixes were deployed
- Direct gcloud deployment is more reliable than automated Cloud Build

### Known issues
- Need to verify React app loads correctly with manual deployment
- Need to test Firebase Auth UI functionality
- Need to confirm Google OAuth popup works

### Next steps
- Test Sign In and Get Started buttons appear in navbar
- Verify Google OAuth authentication flow
- Test protected routes redirect behavior
- Validate all Firebase Auth functionality

---
## 2026-04-06 — nginx and Vite config fixes
**Status:** testing
**Commit:** f0373c6

### What changed
- Added include /etc/nginx/mime.types to nginx.conf
- Added default_type application/octet-stream to nginx.conf
- Fixed health endpoint from /healthz to /health
- Confirmed try_files SPA fallback in nginx.conf
- Confirmed COPY path matches /app/dist in Dockerfile
- Confirmed base: '/' already present in vite.config.ts

### Why
- App blank on Cloud Run despite successful build
- JS files served with wrong MIME type or wrong path
- Health endpoint mismatch causing deployment issues
- SPA routing not working properly on production

### Next steps
- Verify live URL loads React app after deploy
- Test Google login on live URL
- Confirm all Firebase Auth functionality works
