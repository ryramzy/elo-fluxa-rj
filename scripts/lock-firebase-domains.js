// scripts/lock-firebase-domains.js
// Run with: node scripts/lock-firebase-domains.js
// Requires FIREBASE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS
// or FIREBASE_SERVICE_ACCOUNT env var

const https = require('https')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'elo-fluxa-rj'

// AUTHORIZED DOMAINS — edit this list if domains change
// This is the single source of truth for Firebase auth domains
const AUTHORIZED_DOMAINS = [
  'localhost',
  'elo-fluxa-rj.vercel.app',
  'elo-fluxa-rj.firebaseapp.com',
  'elo-fluxa-rj.web.app',
]

console.log('Firebase Authorized Domains that should be set:')
console.log(AUTHORIZED_DOMAINS.join('\n'))
console.log('')
console.log('To set these manually:')
console.log('1. Go to Firebase Console')
console.log('   https://console.firebase.google.com/project/' 
  + PROJECT_ID + '/authentication/settings')
console.log('2. Under "Authorized domains", ensure ONLY')
console.log('   these domains are listed:')
AUTHORIZED_DOMAINS.forEach(d => console.log('   - ' + d))
console.log('')
console.log('Remove any Vercel preview URLs like:')
console.log('   elo-fluxa-*.vercel.app (anything with a hash)')
