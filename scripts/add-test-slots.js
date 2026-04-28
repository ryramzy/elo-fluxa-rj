// Simple script to add test slots via browser console
// Copy and paste this into the browser console when logged in as admin

const addTestSlots = async () => {
  const { collection, addDoc, serverTimestamp } = window.firebase.firestore;
  const db = window.firebase.firestore();
  
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const testSlots = [
    // Today slots 8AM-9PM
    { date: today, time: '08:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '09:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '10:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '11:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '14:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '15:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '16:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '17:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '18:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '19:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '20:00', duration: 60, available: true, status: 'available' },
    { date: today, time: '21:00', duration: 60, available: true, status: 'available' },
    
    // Tomorrow slots 8AM-9PM
    { date: tomorrowStr, time: '08:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '09:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '10:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '11:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '14:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '15:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '16:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '17:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '18:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '19:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '20:00', duration: 60, available: true, status: 'available' },
    { date: tomorrowStr, time: '21:00', duration: 60, available: true, status: 'available' },
  ];
  
  console.log('Adding', testSlots.length, 'test slots...');
  
  try {
    for (const slot of testSlots) {
      const slotData = {
        ...slot,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'slots'), slotData);
      console.log(`✓ Added slot: ${slot.date} ${slot.time}`);
    }
    
    console.log('✅ All test slots added successfully!');
    console.log('🔄 Refresh the agenda page to see the slots');
  } catch (error) {
    console.error('❌ Error adding test slots:', error);
  }
};

// Run the function
addTestSlots();
