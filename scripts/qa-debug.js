// COMPREHENSIVE QA DEBUG SCRIPT - Paste in browser console
// This will diagnose exactly what's wrong with the slot system

const qaDebug = async () => {
  console.log('🔍 COMPREHENSIVE QA DEBUG');
  console.log('============================');
  
  try {
    const { collection, getDocs, query, where, orderBy } = window.firebase.firestore;
    const db = window.firebase.firestore();
    
    // TEST 1: Check if any slots exist at all
    console.log('\n📊 TEST 1: Checking if any slots exist...');
    const allSlotsQuery = query(collection(db, 'slots'), orderBy('date'), orderBy('time'));
    const allSlotsSnapshot = await getDocs(allSlotsQuery);
    console.log(`📊 Total slots in database: ${allSlotsSnapshot.size}`);
    
    if (allSlotsSnapshot.size === 0) {
      console.log('❌ ISSUE: No slots exist in database!');
      console.log('💡 SOLUTION: Need to create slots first');
      return;
    }
    
    // Show first few slots
    allSlotsSnapshot.docs.slice(0, 3).forEach(doc => {
      const data = doc.data();
      console.log(`  📅 Sample slot: ${doc.id} - ${data.date} ${data.time} (available: ${data.available})`);
    });
    
    // TEST 2: Check current week range calculation
    console.log('\n📅 TEST 2: Checking week range calculation...');
    const now = new Date();
    const day = now.getDay();
    const toMon = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + toMon);
    mon.setHours(0,0,0,0);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const fmt = (d) => d.toISOString().split('T')[0];
    const weekFrom = fmt(mon);
    const weekTo = fmt(sun);
    
    console.log(`📅 Current week range: ${weekFrom} to ${weekTo}`);
    console.log(`📅 Today is: ${now.toISOString().split('T')[0]}`);
    
    // TEST 3: Check what slots exist in current week range
    console.log('\n📅 TEST 3: Checking slots in current week range...');
    const weekQuery = query(
      collection(db, 'slots'),
      where('date', '>=', weekFrom),
      where('date', '<=', weekTo),
      where('available', '==', true),
      orderBy('date'),
      orderBy('time')
    );
    const weekSnapshot = await getDocs(weekQuery);
    console.log(`📊 Available slots this week: ${weekSnapshot.size}`);
    
    if (weekSnapshot.size === 0) {
      console.log('❌ ISSUE: No available slots in current week range!');
      
      // Check if any slots exist in range (regardless of availability)
      const anySlotsQuery = query(
        collection(db, 'slots'),
        where('date', '>=', weekFrom),
        where('date', '<=', weekTo),
        orderBy('date'),
        orderBy('time')
      );
      const anySlotsSnapshot = await getDocs(anySlotsQuery);
      console.log(`📊 Any slots this week: ${anySlotsSnapshot.size}`);
      
      if (anySlotsSnapshot.size > 0) {
        console.log('❌ ISSUE: Slots exist but none are marked as available!');
        anySlotsSnapshot.docs.slice(0, 3).forEach(doc => {
          const data = doc.data();
          console.log(`  📅 Slot: ${data.date} ${data.time} (available: ${data.available}, status: ${data.status})`);
        });
      } else {
        console.log('❌ ISSUE: No slots exist for current week at all!');
        console.log('💡 SOLUTION: Need to create slots for current week dates');
      }
    } else {
      console.log('✅ Available slots found:');
      weekSnapshot.docs.slice(0, 5).forEach(doc => {
        const data = doc.data();
        console.log(`  📅 Slot: ${data.date} ${data.time} (available: ${data.available}, status: ${data.status})`);
      });
    }
    
    // TEST 4: Check if getAvailableSlots function works
    console.log('\n🔧 TEST 4: Testing getAvailableSlots function...');
    try {
      // Simulate what the useBooking hook does
      const testFrom = weekFrom;
      const testTo = weekTo;
      
      const testQuery = query(
        collection(db, 'slots'),
        where('date', '>=', testFrom),
        where('date', '<=', testTo),
        where('available', '==', true),
        orderBy('date'),
        orderBy('time')
      );
      const testSnapshot = await getDocs(testQuery);
      const testResults = testSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      console.log(`🔧 getAvailableSlots(${testFrom}, ${testTo}) returns: ${testResults.length} slots`);
      
      if (testResults.length === 0) {
        console.log('❌ ISSUE: getAvailableSlots returns empty array!');
        console.log('💡 This explains why agenda shows "Nenhum horário encontrado"');
      } else {
        console.log('✅ getAvailableSlots working correctly');
      }
      
    } catch (error) {
      console.error('❌ ERROR in getAvailableSlots test:', error);
      console.log('💡 This could be a Firestore index issue');
    }
    
    // TEST 5: Check today specifically
    console.log('\n📅 TEST 5: Checking today specifically...');
    const today = now.toISOString().split('T')[0];
    const todayQuery = query(
      collection(db, 'slots'),
      where('date', '==', today),
      where('available', '==', true),
      orderBy('time')
    );
    const todaySnapshot = await getDocs(todayQuery);
    console.log(`📊 Available slots today (${today}): ${todaySnapshot.size}`);
    
    // SUMMARY
    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log(`- Total slots in DB: ${allSlotsSnapshot.size}`);
    console.log(`- Current week: ${weekFrom} to ${weekTo}`);
    console.log(`- Available this week: ${weekSnapshot.size}`);
    console.log(`- Available today: ${todaySnapshot.size}`);
    
    if (allSlotsSnapshot.size === 0) {
      console.log('❌ ROOT CAUSE: No slots exist in database');
      console.log('💡 FIX: Run slot creation script first');
    } else if (weekSnapshot.size === 0) {
      console.log('❌ ROOT CAUSE: No available slots in current week');
      console.log('💡 FIX: Create slots for current week or check availability flags');
    } else {
      console.log('✅ Slots exist and should be visible');
      console.log('❌ ROOT CAUSE: Frontend display issue or query mismatch');
    }
    
  } catch (error) {
    console.error('❌ QA DEBUG ERROR:', error);
  }
};

// Auto-run
qaDebug();
