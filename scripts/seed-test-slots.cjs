// Quick script to seed 3 test slots for immediate testing
// Run with: node scripts/seed-test-slots.cjs

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

async function seedTestSlots() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Calculate next Monday, Tuesday, Wednesday
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilMonday = currentDay === 0 ? 6 : 1 - currentDay;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysUntilMonday);
    
    const tuesday = new Date(monday);
    tuesday.setDate(monday.getDate() + 1);
    
    const wednesday = new Date(monday);
    wednesday.setDate(monday.getDate() + 2);

    const testSlots = [
      {
        date: monday.toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        available: true,
        status: 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        date: tuesday.toISOString().split('T')[0],
        time: '14:30',
        duration: 60,
        available: true,
        status: 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      {
        date: wednesday.toISOString().split('T')[0],
        time: '16:00',
        duration: 60,
        available: true,
        status: 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    ];

    // Add slots to Firestore
    const slotsRef = collection(db, 'slots');
    
    for (const slot of testSlots) {
      await addDoc(slotsRef, slot);
      console.log(`✅ Created slot: ${slot.date} at ${slot.time}`);
    }

    console.log(`\n🎉 Successfully seeded ${testSlots.length} test slots!`);
    console.log('Slots are now available in the Agenda page.\n');

  } catch (error) {
    console.error('❌ Error seeding test slots:', error);
  }
}

seedTestSlots();
