import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validate config
const missing = Object.entries(firebaseConfig)
  .filter(([_, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0) {
  console.error('❌ Missing Firebase configuration variables:', missing);
  process.exit(1);
}

// Initialize Firebase client app
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});

async function runMigration() {
  const isDryRun = process.env.DRY_RUN !== 'false';
  console.log(`🚀 Starting Timezone Migration. Mode: ${isDryRun ? 'DRY RUN (Simulation)' : 'WRITE MODE (Real Update)'}`);

  try {
    // 1. Fetch all bookings
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    const bookings: any[] = [];

    snapshot.forEach((docSnap) => {
      bookings.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    console.log(`📊 Found ${bookings.length} bookings to process.`);

    if (bookings.length === 0) {
      console.log('✅ No bookings found. Exiting.');
      return;
    }

    // 2. Create local backup
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `bookings_backup_${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(bookings, null, 2), 'utf-8');
    console.log(`💾 Local backup successfully created at: ${backupFile}`);

    // 3. Process and convert
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const booking of bookings) {
      const { id, date, time } = booking;

      if (!date || !time) {
        console.warn(`⚠️ Warning: Booking ${id} is missing date or time field. Skipped.`);
        skippedCount++;
        continue;
      }

      try {
        // Parse Rio local time (America/Sao_Paulo is stable UTC-3 year-round)
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        
        // UTC is local time + 3 hours
        const utcDate = new Date(Date.UTC(year, month - 1, day, hour + 3, minute));
        const datetimeTimestamp = Timestamp.fromDate(utcDate);

        console.log(`[Processing ${id}]: ${date} ${time} (Rio) -> ${utcDate.toISOString()} (UTC)`);

        if (!isDryRun) {
          const docRef = doc(db, 'bookings', id);
          await updateDoc(docRef, {
            datetime: datetimeTimestamp
          });
          updatedCount++;
        } else {
          updatedCount++; // Simulated
        }
      } catch (err) {
        console.error(`❌ Error converting booking ${id}:`, err);
        errorCount++;
      }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Mode: ${isDryRun ? 'DRY RUN (Simulation)' : 'WRITE MODE (Real Update)'}`);
    console.log(`Processed: ${bookings.length}`);
    console.log(`Success: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('-------------------------\n');

    if (isDryRun) {
      console.log('👉 To write these changes to Firestore, run with env variable DRY_RUN=false.');
    } else {
      console.log('✅ Timezone migration successfully completed.');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();
