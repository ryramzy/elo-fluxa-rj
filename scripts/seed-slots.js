// Simple script to seed slots directly to Firestore
// Run with: node scripts/seed-slots.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, writeBatch, doc, getDocs } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA7fP_66TNOvoFWDP66jydtu1oIwM_4VDM",
  authDomain: "gen-lang-client-0976465403.firebaseapp.com",
  projectId: "gen-lang-client-0976465403",
  storageBucket: "gen-lang-client-0976465403.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

async function seedSlots() {
  try {
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
    
    console.log(`✅ Created ${slots.length} time slots`);
    console.log(`Date range: ${slots[0]?.date} to ${slots[slots.length - 1]?.date}`);
    console.log('Slots seeded successfully! 🎉');

  } catch (error) {
    console.error('❌ Error seeding slots:', error);
  }
}

seedSlots();
