// Simple script to seed slots directly to Firestore
// Run with: node scripts/seed-slots.cjs

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, writeBatch, doc, getDocs } = require('firebase/firestore');

// Firebase config from real project
const firebaseConfig = {
  apiKey: "AIzaSyA7fP_66TNOvoFWDP66jydtu1oIwM_4VDM",
  authDomain: "gen-lang-client-0976465403.firebaseapp.com",
  projectId: "gen-lang-client-0976465403",
  storageBucket: "gen-lang-client-0976465403.firebasestorage.app",
  messagingSenderId: "17211915954",
  appId: "1:17211915954:web:881c1088ad260fe6d453ab"
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
        
        // Generate flexible time slots
        const baseHours = ['09', '10', '11', '14', '15', '16', '17', '18', '19'];
        const startMinutes = ['00', '15', '30', '45'];
        const durations = [15, 30, 45, 60];
        
        for (const hour of baseHours) {
          for (const minute of startMinutes) {
            for (const duration of durations) {
              const time = `${hour}:${minute.padStart(2, '0')}`;
              
              // Only create slots that make sense (e.g., don't create 15-min slots starting at 19:45)
              const hourNum = parseInt(hour);
              const minuteNum = parseInt(minute);
              const endHour = hourNum + Math.floor((minuteNum + duration) / 60);
              
              // Don't create slots that would end after 20:00
              if (endHour > 20 || (endHour === 20 && (minuteNum + duration) % 60 > 0)) {
                continue;
              }
              
              // Don't create slots before 09:00
              if (hourNum < 9 || (hourNum === 9 && minuteNum < 0)) {
                continue;
              }
              
              slots.push({
                date: dateStr,
                time,
                duration,
                available: true,
                status: 'available',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
          }
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
