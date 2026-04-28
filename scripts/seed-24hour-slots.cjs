// Script to seed 24-hour slots (12am to 12am next day)
// Run with: node scripts/seed-24hour-slots.cjs

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config from real project
const firebaseConfig = {
  apiKey: "AIzaSyA7fP_66TNOvoFWDP66jydtu1oIwM_4VDM",
  authDomain: "gen-lang-client-0976465403.firebaseapp.com",
  projectId: "gen-lang-client-0976465403",
  storageBucket: "gen-lang-client-0976465403.firebasestorage.app",
  messagingSenderId: "17211915954",
  appId: "1:17211915954:web:881c1088ad260fe6d453ab"
};

async function seed24HourSlots() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Generate slots for next 3 days with 24-hour coverage
    const slots = [];
    const today = new Date();
    
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Generate slots every hour from 00:00 to 23:00
      for (let hour = 0; hour < 24; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        
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

    // Add slots to Firestore
    const slotsRef = collection(db, 'slots');
    
    for (const slot of slots) {
      await addDoc(slotsRef, slot);
      console.log(`✅ Created slot: ${slot.date} at ${slot.time}`);
    }

    console.log(`\n🎉 Successfully seeded ${slots.length} 24-hour slots!`);
    console.log('Slots are now available in the Agenda page.\n');

  } catch (error) {
    console.error('❌ Error seeding 24-hour slots:', error);
  }
}

seed24HourSlots();
