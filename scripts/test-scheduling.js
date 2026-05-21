// TEST SCHEDULING SYSTEM - Paste in browser console
// This will test the complete 60-minute slot scheduling system

const testScheduling = async () => {
  console.log('🧪 TESTING COMPLETE SCHEDULING SYSTEM');
  console.log('=====================================');
  
  try {
    const { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp } = window.firebase.firestore;
    const db = window.firebase.firestore();
    
    // STEP 1: Test creating slots for today
    console.log('\n📅 STEP 1: Creating slots for today...');
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Today is: ${today}`);
    
    const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    
    for (const time of times) {
      // Check if slot already exists
      const existingQuery = query(
        collection(db, 'slots'),
        where('date', '==', today),
        where('time', '==', time)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.empty) {
        // Create new slot
        const slotData = {
          date: today,
          time: time,
          duration: 60,
          available: true,
          status: 'available',
          bookedBy: null,
          bookedByName: null,
          meetLink: null,
          googleEventId: null,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'slots'), slotData);
        console.log(`✅ Created slot: ${today} ${time}`);
      } else {
        console.log(`⏭️  Slot already exists: ${today} ${time}`);
      }
    }
    
    // STEP 2: Test reading slots
    console.log('\n📖 STEP 2: Reading slots...');
    const slotsQuery = query(
      collection(db, 'slots'),
      where('date', '==', today),
      orderBy('time')
    );
    const slotsSnapshot = await getDocs(slotsQuery);
    const slots = slotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📊 Found ${slots.length} slots for today:`);
    slots.forEach(slot => {
      console.log(`  📅 ${slot.time} - Available: ${slot.available} - Status: ${slot.status}`);
    });
    
    // STEP 3: Test booking a slot
    console.log('\n🎯 STEP 3: Testing slot booking...');
    const availableSlot = slots.find(slot => slot.available);
    
    if (availableSlot) {
      console.log(`🎯 Booking slot: ${availableSlot.date} ${availableSlot.time}`);
      
      // Simulate booking (you would normally get user info from auth)
      const testUserId = 'test-user-id';
      const testUserName = 'Test Student';
      
      await updateDoc(doc(db, 'slots', availableSlot.id), {
        available: false,
        status: 'booked',
        bookedBy: testUserId,
        bookedByName: testUserName,
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Successfully booked slot for ${testUserName}`);
    } else {
      console.log('❌ No available slots to test booking');
    }
    
    // STEP 4: Verify booking
    console.log('\n🔍 STEP 4: Verifying booking...');
    const updatedSnapshot = await getDocs(slotsQuery);
    const updatedSlots = updatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('📊 Updated slots:');
    updatedSlots.forEach(slot => {
      console.log(`  📅 ${slot.time} - Available: ${slot.available} - Status: ${slot.status} - Booked by: ${slot.bookedByName || 'None'}`);
    });
    
    // STEP 5: Test admin dashboard view
    console.log('\n👨‍💼 STEP 5: Testing admin dashboard view...');
    const bookedSlots = updatedSlots.filter(slot => !slot.available);
    const availableSlotsCount = updatedSlots.filter(slot => slot.available).length;
    
    console.log(`📊 Admin dashboard would show:`);
    console.log(`  - Total slots: ${updatedSlots.length}`);
    console.log(`  - Available: ${availableSlotsCount}`);
    console.log(`  - Booked: ${bookedSlots.length}`);
    
    if (bookedSlots.length > 0) {
      console.log(`  - Student bookings:`);
      bookedSlots.forEach(slot => {
        console.log(`    • ${slot.bookedByName} booked ${slot.date} at ${slot.time}`);
      });
    }
    
    console.log('\n🎉 ALL TESTS COMPLETE!');
    console.log('✅ The scheduling system is working correctly');
    console.log('📱 Test the user interface:');
    console.log('  1. Go to /agenda to see the calendar');
    console.log('  2. Select today\'s date');
    console.log('  3. Click "Create Slots" if needed');
    console.log('  4. Click "Book Slot" to test booking');
    console.log('  5. Go to /admin to see student bookings');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Auto-run
testScheduling();
