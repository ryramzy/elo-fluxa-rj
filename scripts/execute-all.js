// COMBINED EXECUTION SCRIPT - Run this in browser console
// This will execute both test slots and full schedule

const executeAll = async () => {
  console.log('🚀 EXECUTING ALL SLOT CREATION SCRIPTS');
  console.log('==========================================');
  
  try {
    const { collection, addDoc, getDocs, query, where, writeBatch, doc } = window.firebase.firestore;
    const db = window.firebase.firestore();
    
    // STEP 1: Write 5 test documents
    console.log('\n📝 STEP 1: Writing 5 test documents...');
    
    const testSlots = [
      {
        "date": "2026-05-05", "time": "08:00", "duration": 60, "available": true, "status": "available",
        "bookedBy": null, "bookedByName": null, "meetLink": null, "googleEventId": null
      },
      {
        "date": "2026-05-05", "time": "09:00", "duration": 60, "available": true, "status": "available",
        "bookedBy": null, "bookedByName": null, "meetLink": null, "googleEventId": null
      },
      {
        "date": "2026-05-06", "time": "08:00", "duration": 60, "available": true, "status": "available",
        "bookedBy": null, "bookedByName": null, "meetLink": null, "googleEventId": null
      },
      {
        "date": "2026-05-06", "time": "10:00", "duration": 60, "available": true, "status": "available",
        "bookedBy": null, "bookedByName": null, "meetLink": null, "googleEventId": null
      },
      {
        "date": "2026-05-07", "time": "14:00", "duration": 60, "available": true, "status": "available",
        "bookedBy": null, "bookedByName": null, "meetLink": null, "googleEventId": null
      }
    ];
    
    for (let i = 0; i < testSlots.length; i++) {
      const slot = testSlots[i];
      const docRef = await addDoc(collection(db, 'slots'), slot);
      console.log(`✅ Test document ${i + 1} written: ${docRef.id} (${slot.date} ${slot.time})`);
    }
    
    console.log('🎉 STEP 1 COMPLETE - 5 test documents written');
    
    // STEP 2: Write full 8-week schedule
    console.log('\n📅 STEP 2: Writing full 8-week schedule...');
    
    const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    const startDate = new Date('2026-05-05'); // Monday
    const endDate = new Date('2026-06-28'); // Sunday
    
    let totalSlotsWritten = 0;
    let batch = writeBatch(db);
    let batchCount = 0;
    
    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const dayOfWeek = currentDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Only process Monday through Friday (1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Check if slots already exist for this date
        const existingQuery = query(collection(db, 'slots'), where('date', '==', dateStr));
        const existingSnapshot = await getDocs(existingQuery);
        const existingTimes = new Set(existingSnapshot.docs.map(doc => doc.data().time));
        
        console.log(`📅 Processing ${dayName} ${dateStr} (${existingTimes.size} existing slots)`);
        
        // Create slots for each time
        for (const time of times) {
          // Skip if slot already exists
          if (existingTimes.has(time)) {
            console.log(`  ⏭️  Skipping existing slot: ${dateStr} ${time}`);
            continue;
          }
          
          const slotData = {
            date: dateStr, time: time, duration: 60, available: true, status: "available",
            bookedBy: null, bookedByName: null, meetLink: null, googleEventId: null
          };
          
          // Add to batch
          const slotRef = doc(collection(db, 'slots'));
          batch.set(slotRef, slotData);
          batchCount++;
          totalSlotsWritten++;
          
          console.log(`  ✅ Adding slot: ${dateStr} ${time}`);
          
          // Write batch when it reaches 500 operations
          if (batchCount >= 500) {
            await batch.commit();
            console.log(`📝 Batch committed (${batchCount} operations)`);
            batch = writeBatch(db);
            batchCount = 0;
          }
        }
      }
    }
    
    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`📝 Final batch committed (${batchCount} operations)`);
    }
    
    console.log(`🎉 STEP 2 COMPLETE - Wrote ${totalSlotsWritten} slots to Firestore`);
    
    // STEP 3: Verify results
    console.log('\n🔍 STEP 3: Verifying results...');
    
    const today = new Date().toISOString().split('T')[0];
    const todayQuery = query(collection(db, 'slots'), where('date', '==', today));
    const todaySnapshot = await getDocs(todayQuery);
    console.log(`📊 Today (${today}) has ${todaySnapshot.size} slots`);
    
    const totalQuery = query(collection(db, 'slots'));
    const totalSnapshot = await getDocs(totalQuery);
    console.log(`📊 Total slots in database: ${totalSnapshot.size}`);
    
    console.log('\n🎉 ALL STEPS COMPLETE!');
    console.log('🔄 Refresh the agenda page to see the slots');
    console.log('📅 Navigate to different weeks to verify all slots appear');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Auto-run
executeAll();
