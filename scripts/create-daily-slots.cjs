const admin = require('firebase-admin');

// Initialize Firebase Admin with environment variables
const serviceAccount = {
  "type": "service_account",
  "project_id": "elo-fluxa-rj",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID || "your-key-id",
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "your-private-key",
  "client_email": process.env.FIREBASE_CLIENT_EMAIL || "your-client-email",
  "client_id": process.env.FIREBASE_CLIENT_ID || "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'elo-fluxa-rj'
});

const db = admin.firestore();

// Create slots from 8:00 AM to 9:00 PM São Paulo time for the next 30 days
async function createDailySlots() {
  const slots = [];
  const now = new Date();
  
  // Create slots for next 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() + dayOffset);
    
    // Skip Sundays (optional - remove if you want Sunday slots)
    if (currentDate.getDay() === 0) continue;
    
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Create slots from 8:00 AM to 9:00 PM (13 slots total)
    for (let hour = 8; hour <= 21; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      
      slots.push({
        date: dateString,
        time: timeString,
        duration: 60,
        available: true,
        status: 'available',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  
  console.log(`Creating ${slots.length} slots...`);
  
  // Batch write all slots
  const batch = db.batch();
  const slotsRef = db.collection('slots');
  
  slots.forEach(slot => {
    const docRef = slotsRef.doc();
    batch.set(docRef, slot);
  });
  
  await batch.commit();
  console.log(`Successfully created ${slots.length} time slots!`);
  
  // Clean up any existing slots for the same dates to avoid duplicates
  console.log('Cleaning up potential duplicates...');
  const startDate = now.toISOString().split('T')[0];
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 30);
  const endDateString = endDate.toISOString().split('T')[0];
  
  const existingSlots = await db.collection('slots')
    .where('date', '>=', startDate)
    .where('date', '<=', endDateString)
    .get();
    
  console.log(`Found ${existingSlots.size} existing slots in the date range`);
  
  process.exit(0);
}

createDailySlots().catch(console.error);
