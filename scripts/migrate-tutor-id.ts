/**
 * One-time migration: rename tutorId 'matthew' → 'matt' in bookings collection
 * Run once manually, then delete this file.
 * Usage: npx ts-node scripts/migrate-tutor-id.ts
 */
import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function migrate() {
  const snapshot = await db.collection('bookings')
    .where('tutorId', '==', 'matthew')
    .get();

  console.log(`Found ${snapshot.size} bookings to migrate`);

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { tutorId: 'matt' });
  });

  const slotsSnapshot = await db.collection('availableSlots')
    .where('tutorId', '==', 'matthew')
    .get();
  
  console.log(`Found ${slotsSnapshot.size} availableSlots to migrate`);
  slotsSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, { tutorId: 'matt' });
  });

  await batch.commit();
  console.log('Migration complete');
}

migrate().catch(console.error);
