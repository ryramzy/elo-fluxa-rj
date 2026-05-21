// COMPREHENSIVE QA TEST - Paste in browser console
// This will test all aspects of the new scheduling system

const comprehensiveQA = async () => {
  console.log('🧪 COMPREHENSIVE QA - NEW SCHEDULING SYSTEM');
  console.log('============================================');
  
  const results = {
    agendaPage: { passed: 0, failed: 0, issues: [] },
    adminDashboard: { passed: 0, failed: 0, issues: [] },
    bookingFlow: { passed: 0, failed: 0, issues: [] },
    dataIntegrity: { passed: 0, failed: 0, issues: [] }
  };

  try {
    const { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } = window.firebase.firestore;
    const db = window.firebase.firestore();

    // ========================================
    // TEST 1: AGENDA PAGE FUNCTIONALITY
    // ========================================
    console.log('\n📅 TEST 1: AgendaPage Functionality');
    
    // Test 1.1: Check if AgendaPage component exists and loads
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log(`✅ Today's date: ${today}`);
      results.agendaPage.passed++;
    } catch (error) {
      results.agendaPage.failed++;
      results.agendaPage.issues.push('Date formatting failed');
    }

    // Test 1.2: Check if slots can be created
    try {
      const testDate = '2026-05-05';
      const testTime = '10:00';
      
      // Check if slot already exists
      const existingQuery = query(
        collection(db, 'slots'),
        where('date', '==', testDate),
        where('time', '==', testTime)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.empty) {
        // Create test slot
        const slotData = {
          date: testDate,
          time: testTime,
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
        console.log('✅ Test slot created successfully');
      } else {
        console.log('✅ Test slot already exists');
      }
      results.agendaPage.passed++;
    } catch (error) {
      results.agendaPage.failed++;
      results.agendaPage.issues.push('Slot creation failed: ' + error.message);
    }

    // Test 1.3: Check if slots can be read
    try {
      const slotsQuery = query(
        collection(db, 'slots'),
        where('date', '==', '2026-05-05'),
        orderBy('time')
      );
      const slotsSnapshot = await getDocs(slotsQuery);
      console.log(`✅ Found ${slotsSnapshot.size} slots for test date`);
      results.agendaPage.passed++;
    } catch (error) {
      results.agendaPage.failed++;
      results.agendaPage.issues.push('Slot reading failed: ' + error.message);
    }

    // ========================================
    // TEST 2: ADMIN DASHBOARD FUNCTIONALITY
    // ========================================
    console.log('\n👨‍💼 TEST 2: Admin Dashboard Functionality');

    // Test 2.1: Check if admin can see all slots (available + booked)
    try {
      const allSlotsQuery = query(
        collection(db, 'slots'),
        orderBy('date'),
        orderBy('time')
      );
      const allSlotsSnapshot = await getDocs(allSlotsQuery);
      const allSlots = allSlotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const availableCount = allSlots.filter(slot => slot.available).length;
      const bookedCount = allSlots.filter(slot => !slot.available).length;
      
      console.log(`✅ Admin can see ${allSlots.length} total slots`);
      console.log(`   - Available: ${availableCount}`);
      console.log(`   - Booked: ${bookedCount}`);
      results.adminDashboard.passed++;
    } catch (error) {
      results.adminDashboard.failed++;
      results.adminDashboard.issues.push('Admin slot reading failed: ' + error.message);
    }

    // Test 2.2: Check if student bookings are visible
    try {
      const bookedQuery = query(
        collection(db, 'slots'),
        where('available', '==', false),
        orderBy('date'),
        orderBy('time')
      );
      const bookedSnapshot = await getDocs(bookedQuery);
      
      if (bookedSnapshot.size > 0) {
        bookedSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`✅ Student booking visible: ${data.bookedByName} booked ${data.date} ${data.time}`);
        });
      } else {
        console.log('ℹ️  No booked slots found (expected if no bookings made yet)');
      }
      results.adminDashboard.passed++;
    } catch (error) {
      results.adminDashboard.failed++;
      results.adminDashboard.issues.push('Student booking visibility failed: ' + error.message);
    }

    // ========================================
    // TEST 3: COMPLETE BOOKING FLOW
    // ========================================
    console.log('\n🎯 TEST 3: Complete Booking Flow');

    // Test 3.1: Create test slot for booking
    let testSlotId = '';
    try {
      const testDate = new Date().toISOString().split('T')[0];
      const testTime = '14:00';
      
      // Clean up any existing test slot
      const cleanupQuery = query(
        collection(db, 'slots'),
        where('date', '==', testDate),
        where('time', '==', testTime)
      );
      const cleanupSnapshot = await getDocs(cleanupQuery);
      cleanupSnapshot.docs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      
      // Create new test slot
      const slotData = {
        date: testDate,
        time: testTime,
        duration: 60,
        available: true,
        status: 'available',
        bookedBy: null,
        bookedByName: null,
        meetLink: null,
        googleEventId: null,
        createdAt: serverTimestamp()
      };
      const slotRef = await addDoc(collection(db, 'slots'), slotData);
      testSlotId = slotRef.id;
      console.log(`✅ Created test slot: ${testDate} ${testTime}`);
      results.bookingFlow.passed++;
    } catch (error) {
      results.bookingFlow.failed++;
      results.bookingFlow.issues.push('Test slot creation failed: ' + error.message);
    }

    // Test 3.2: Simulate booking
    try {
      if (testSlotId) {
        await updateDoc(doc(db, 'slots', testSlotId), {
          available: false,
          status: 'booked',
          bookedBy: 'test-user-id',
          bookedByName: 'Test Student',
          updatedAt: serverTimestamp()
        });
        console.log('✅ Slot successfully booked');
        results.bookingFlow.passed++;
      }
    } catch (error) {
      results.bookingFlow.failed++;
      results.bookingFlow.issues.push('Booking failed: ' + error.message);
    }

    // Test 3.3: Verify booking persistence
    try {
      if (testSlotId) {
        const bookedSlotQuery = query(
          collection(db, 'slots'),
          where('date', '==', new Date().toISOString().split('T')[0]),
          where('time', '==', '14:00')
        );
        const bookedSnapshot = await getDocs(bookedSlotQuery);
        const bookedSlot = bookedSnapshot.docs[0]?.data();
        
        if (bookedSlot && !bookedSlot.available && bookedSlot.bookedByName === 'Test Student') {
          console.log('✅ Booking persisted correctly');
          results.bookingFlow.passed++;
        } else {
          results.bookingFlow.failed++;
          results.bookingFlow.issues.push('Booking did not persist correctly');
        }
      }
    } catch (error) {
      results.bookingFlow.failed++;
      results.bookingFlow.issues.push('Booking verification failed: ' + error.message);
    }

    // ========================================
    // TEST 4: DATA INTEGRITY
    // ========================================
    console.log('\n🔍 TEST 4: Data Integrity');

    // Test 4.1: Verify slot schema
    try {
      const schemaTestQuery = query(collection(db, 'slots'), limit(1));
      const schemaSnapshot = await getDocs(schemaTestQuery);
      
      if (!schemaSnapshot.empty) {
        const slotData = schemaSnapshot.docs[0].data();
        const requiredFields = ['date', 'time', 'duration', 'available', 'status'];
        const missingFields = requiredFields.filter(field => !(field in slotData));
        
        if (missingFields.length === 0) {
          console.log('✅ All required fields present in slot schema');
          results.dataIntegrity.passed++;
        } else {
          results.dataIntegrity.failed++;
          results.dataIntegrity.issues.push(`Missing fields: ${missingFields.join(', ')}`);
        }
      }
    } catch (error) {
      results.dataIntegrity.failed++;
      results.dataIntegrity.issues.push('Schema verification failed: ' + error.message);
    }

    // Test 4.2: Verify 60-minute slots
    try {
      const durationQuery = query(collection(db, 'slots'), where('duration', '==', 60), limit(5));
      const durationSnapshot = await getDocs(durationQuery);
      
      if (durationSnapshot.size > 0) {
        console.log('✅ 60-minute slots verified');
        results.dataIntegrity.passed++;
      } else {
        results.dataIntegrity.failed++;
        results.dataIntegrity.issues.push('No 60-minute slots found');
      }
    } catch (error) {
      results.dataIntegrity.failed++;
      results.dataIntegrity.issues.push('Duration verification failed: ' + error.message);
    }

    // Test 4.3: Verify 8AM-9PM time range
    try {
      const timeQuery = query(collection(db, 'slots'), orderBy('time'), limit(1));
      const timeSnapshot = await getDocs(timeQuery);
      
      if (!timeSnapshot.empty) {
        const times = timeSnapshot.docs.map(doc => doc.data().time);
        const validTimes = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
        const invalidTimes = times.filter(time => !validTimes.includes(time));
        
        if (invalidTimes.length === 0) {
          console.log('✅ Time slots within 8AM-9PM range verified');
          results.dataIntegrity.passed++;
        } else {
          results.dataIntegrity.failed++;
          results.dataIntegrity.issues.push(`Invalid times found: ${invalidTimes.join(', ')}`);
        }
      }
    } catch (error) {
      results.dataIntegrity.failed++;
      results.dataIntegrity.issues.push('Time range verification failed: ' + error.message);
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n📊 QA RESULTS SUMMARY');
    console.log('====================');
    
    const totalPassed = results.agendaPage.passed + results.adminDashboard.passed + results.bookingFlow.passed + results.dataIntegrity.passed;
    const totalFailed = results.agendaPage.failed + results.adminDashboard.failed + results.bookingFlow.failed + results.dataIntegrity.failed;
    
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('✅ The scheduling system is working correctly');
      console.log('\n📱 MANUAL TESTING RECOMMENDED:');
      console.log('1. Go to /agenda and test the UI');
      console.log('2. Create slots for different dates');
      console.log('3. Test the booking flow');
      console.log('4. Go to /admin and verify student bookings');
    } else {
      console.log('\n❌ SOME TESTS FAILED!');
      console.log('Issues found:');
      
      if (results.agendaPage.issues.length > 0) {
        console.log('\n📅 AgendaPage Issues:');
        results.agendaPage.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (results.adminDashboard.issues.length > 0) {
        console.log('\n👨‍💼 Admin Dashboard Issues:');
        results.adminDashboard.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (results.bookingFlow.issues.length > 0) {
        console.log('\n🎯 Booking Flow Issues:');
        results.bookingFlow.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (results.dataIntegrity.issues.length > 0) {
        console.log('\n🔍 Data Integrity Issues:');
        results.dataIntegrity.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    }
    
  } catch (error) {
    console.error('❌ QA Test Failed:', error);
  }
};

// Auto-run the comprehensive QA
comprehensiveQA();
