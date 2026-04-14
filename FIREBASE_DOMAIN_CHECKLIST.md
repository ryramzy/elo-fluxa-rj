# Firebase Authorized Domains — Source of Truth

## Current authorized domains (do not add others)
- localhost
- elo-fluxa-rj.vercel.app
- elo-fluxa-rj.firebaseapp.com
- elo-fluxa-rj.web.app

## How to check
Firebase Console → Authentication → Settings → 
Authorized domains

## If auth breaks after a deploy
1. Go to Firebase Console authorized domains
2. Remove any preview deployment URLs 
   (anything with a random hash)
3. Confirm only the 4 domains above are listed
4. Click Save
5. Auth will work immediately — no redeploy needed

## Why this keeps happening
Vercel creates a new preview URL for every push.
Firebase OAuth flow can register these as authorized
domains automatically. Fix: disable Vercel preview
deployments (see Vercel dashboard settings).
