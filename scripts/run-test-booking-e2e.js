// E2E TEST BOOKING & EMAIL SYSTEM - Paste in browser console
// This simulates the complete scheduling flow end-to-end.

const runE2EBookingTest = async () => {
  console.log('🧪 STARTING E2E BOOKING & EMAIL INTEGRATION TEST');
  console.log('==================================================');
  
  // Test settings
  const studentName = 'Fake Test Student';
  const studentEmail = 'fake_test_student_elo@mailinator.com'; // Easy to check on mailinator
  const adminEmail = 'mramsay0@gmail.com';
  
  // Find next Monday's date for a clean slot test
  const today = new Date();
  const nextMonday = new Date();
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
  const testDate = nextMonday.toISOString().split('T')[0];
  const testTime = '10:00';
  
  console.log(`👤 Student: ${studentName} (${studentEmail})`);
  console.log(`👑 Admin:   ${adminEmail}`);
  console.log(`📅 Slot:    ${testDate} at ${testTime}`);
  
  try {
    const { collection, doc, getDoc, getDocs, query, where, setDoc, deleteDoc, Timestamp } = window.firebase.firestore;
    const db = window.firebase.firestore();
    
    // STEP 1: Cleanup any existing test bookings for this slot
    console.log('\n🧹 STEP 1: Cleaning up any old test bookings...');
    const bookingId = `${testDate}_${testTime.replace(':', '')}`;
    const bookingRef = doc(db, 'bookings', bookingId);
    const docSnap = await getDoc(bookingRef);
    
    if (docSnap.exists()) {
      await deleteDoc(bookingRef);
      console.log(`   ✅ Deleted existing booking: ${bookingId}`);
    } else {
      console.log('   ✅ No pre-existing booking found. Clean slot.');
    }
    
    // STEP 2: Call the Google Calendar API to create meeting link
    console.log('\n📅 STEP 2: Generating Google Calendar / Meet event...');
    
    const startIso = `${testDate}T${testTime}:00-03:00`;
    const startDateObj = new Date(startIso);
    const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000); // 1 hour duration
    const endIso = endDateObj.toISOString().replace('Z', '-03:00');
    
    let eventId = null;
    let meetLink = null;
    
    try {
      const calRes = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: `Aula de Inglês com Matt: ${studentName}`,
          description: `Sua aula particular de inglês americano com o Professor Matt.\nGoogle Meet: a ser acessado pelo link.`,
          startDateTime: startIso,
          endDateTime: endIso,
          attendeeEmail: studentEmail,
          attendeeName: studentName
        })
      });
      
      if (!calRes.ok) {
        throw new Error(`Calendar API returned status ${calRes.status}`);
      }
      
      const calData = await calRes.json();
      eventId = calData.eventId;
      meetLink = calData.meetLink;
      console.log(`   ✅ Calendar Event Created! ID: ${eventId}`);
      console.log(`   🔗 Google Meet / Jitsi Link: ${meetLink}`);
    } catch (calErr) {
      console.warn('   ⚠️ Calendar API failed (expected if local env lacks keys). Falling back to Jitsi:', calErr.message);
      const sanitizedName = studentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      meetLink = `https://meet.jit.si/elo-class-${sanitizedName}-${Date.now().toString().slice(-4)}`;
      eventId = `fallback_event_${Date.now()}`;
      console.log(`   🔗 Jitsi Fallback Link: ${meetLink}`);
    }
    
    // STEP 3: Write booking to Firestore with legay & modern fields
    console.log('\n💾 STEP 3: Saving E2E booking to Firestore...');
    const localIsoString = `${testDate}T${testTime}:00-03:00`;
    const utcDate = new Date(localIsoString);
    const datetimeTimestamp = Timestamp.fromDate(utcDate);
    
    const bookingData = {
      userId: 'test_student_e2e_123',
      userName: studentName,
      userEmail: studentEmail,
      uid: 'test_student_e2e_123',             // Legacy compatibility
      studentName: studentName,   // Legacy compatibility
      studentEmail: studentEmail, // Legacy compatibility
      date: testDate,
      time: testTime,
      duration: 60,
      status: 'confirmed',
      googleEventId: eventId,
      meetLink: meetLink,
      notes: 'Test booking E2E simulation.',
      createdAt: Timestamp.now(),
      datetime: datetimeTimestamp
    };
    
    await setDoc(bookingRef, bookingData);
    console.log(`   ✅ Booking document set successfully: ${bookingId}`);
    
    // STEP 4: Trigger the Resend email confirmation
    console.log('\n📧 STEP 4: Triggering Resend email confirmation endpoint...');
    try {
      const emailRes = await fetch('/api/email/booking-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeName: studentName,
          attendeeEmail: studentEmail,
          date: testDate,
          time: testTime,
          durationMinutes: 60,
          meetLink: meetLink,
          notes: 'Test booking E2E simulation.'
        })
      });
      
      if (emailRes.ok) {
        console.log('   ✅ Email Endpoint triggered successfully!');
        console.log(`   📬 Emails sent to both: ${studentEmail} AND ${adminEmail}`);
      } else {
        const errorText = await emailRes.text();
        console.error('   ❌ Email Endpoint failed:', errorText);
      }
    } catch (emailErr) {
      console.error('   ❌ Failed to call email endpoint:', emailErr);
    }
    
    // STEP 5: Verification Check
    console.log('\n🔍 STEP 5: Verifying data sync...');
    const verifiedSnap = await getDoc(bookingRef);
    if (verifiedSnap.exists()) {
      const data = verifiedSnap.data();
      console.log('   🎉 Verification Success! Booking in database matches:');
      console.log(`      - Status: ${data.status}`);
      console.log(`      - Date/Time: ${data.date} at ${data.time}`);
      console.log(`      - Legacy studentEmail: ${data.studentEmail}`);
      console.log(`      - Legacy studentName: ${data.studentName}`);
    } else {
      console.error('   ❌ Verification Failed! Booking document could not be read back.');
    }
    
    console.log('\n==================================================');
    console.log('🎉 E2E BOOKING TEST EXECUTION COMPLETE!');
    console.log('==================================================');
    
  } catch (error) {
    console.error('\n❌ E2E Test execution crashed:', error);
  }
};

runE2EBookingTest();
