import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore, collection, addDoc, serverTimestamp, writeBatch, doc, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase config (should match your existing config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { weekOffset = 0 } = req.body;

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Generate slots for the next 2 weeks
    const slots = [];
    const today = new Date();
    
    for (let week = 0; week < 2; week++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (week * 7) - today.getDay() + 1); // Next Monday
      
      for (let day = 0; day < 5; day++) { // Monday to Friday
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + day);
        
        // Skip weekends
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
        
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Add time slots for each day
        const times = [
          '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
        ];
        
        for (const time of times) {
          slots.push({
            date: dateStr,
            time,
            duration: 60,
            available: true,
            status: 'available',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    // Clear existing slots
    const slotsCollection = collection(db, 'slots');
    const existingSlots = await getDocs(slotsCollection);
    
    if (!existingSlots.empty) {
      const batch = writeBatch(db);
      existingSlots.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Cleared ${existingSlots.size} existing slots`);
    }

    // Add new slots
    const batch = writeBatch(db);
    slots.forEach(slot => {
      const docRef = doc(slotsCollection);
      batch.set(docRef, slot);
    });
    
    await batch.commit();
    
    console.log(`Created ${slots.length} time slots`);

    res.status(200).json({ 
      success: true, 
      slotsCreated: slots.length,
      dateRange: {
        from: slots[0]?.date,
        to: slots[slots.length - 1]?.date
      }
    });

  } catch (error) {
    console.error('Error seeding slots:', error);
    res.status(500).json({ 
      error: 'Failed to seed slots',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
