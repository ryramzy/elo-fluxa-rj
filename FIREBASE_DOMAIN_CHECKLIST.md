# Firebase Authorized Domains — Source of Truth

## Current authorized domains
- localhost
- eloingle.com.br
- www.eloingle.com.br
- eloingles.com.br
- www.eloingles.com.br
- elospeak.com.br
- elo-fluxa-rj.vercel.app
- elo-fluxa-rj.firebaseapp.com
- elo-fluxa-rj.web.app

## How to configure in Firebase Console
1. Open **Firebase Console** → Select your project (`elo-fluxa-rj`).
2. Navigate to **Authentication** → **Settings** tab → **Authorized domains**.
3. Click **Add domain** and enter:
   - `eloingle.com.br`
   - `www.eloingle.com.br`
4. Click **Save**.

## Google Cloud Console (OAuth 2.0 Credentials)
If using Google Sign-In / OAuth 2.0 Client:
1. Open **GCP Console** (console.cloud.google.com) → **APIs & Services** → **Credentials**.
2. Select your Web Client ID (e.g. `Elo Matt Web` / `OAuth 2.0 Client IDs`).
3. Under **Authorized JavaScript origins**, add:
   - `https://eloingle.com.br`
   - `https://www.eloingle.com.br`
4. Under **Authorized redirect URIs**, ensure your Firebase auth handler is present:
   - `https://<firebase-project-id>.firebaseapp.com/__/auth/handler`
   - `https://eloingle.com.br/__/auth/handler` (if custom domain handler is used)
5. Save changes.

## If auth breaks after a deploy
1. Go to Firebase Console authorized domains
2. Remove any preview deployment URLs (anything with a random hash)
3. Confirm only the production and staging domains above are listed
4. Click Save
5. Auth will work immediately — no redeploy needed

## Vercel Previews
Vercel creates a new preview URL for every push.
Firebase OAuth flow can register these as authorized
domains automatically. Fix: disable Vercel preview
deployments (see Vercel dashboard settings).
