import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../src/lib/firestore';

export async function POST() {
  try {
    console.log('🔥 FORCE CREATING SLOTS - Direct API Approach');
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // First, delete any existing slots for today to avoid conflicts
    console.log('🗑️ Cleaning up existing slots for today...');
    const existingQuery = query(
      collection(db, 'slots'),
      where('date', '==', todayStr)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      const deletePromises = existingSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log(`🗑️ Deleted ${existingSnapshot.size} existing slots for today`);
    }
    
    // Create slots from 8:00 AM to 9:00 PM
    const slots = [];
    for (let hour = 8; hour <= 21; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      
      slots.push({
        date: todayStr,
        time: timeString,
        duration: 60,
        available: true,
        status: 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    console.log(`📅 Creating ${slots.length} slots for ${todayStr}`);
    
    // Create all slots
    const createdSlots = [];
    for (const slot of slots) {
      const docRef = await addDoc(collection(db, 'slots'), slot);
      createdSlots.push({
        id: docRef.id,
        ...slot
      });
      console.log(`✅ Created slot: ${slot.date} ${slot.time} (ID: ${docRef.id})`);
    }
    
    console.log(`🎉 Successfully created ${createdSlots.length} slots!`);
    
    return Response.json({
      success: true,
      message: `Created ${createdSlots.length} slots for ${todayStr}`,
      slots: createdSlots,
      date: todayStr,
      totalSlots: createdSlots.length
    });
    
  } catch (error) {
    console.error('❌ Error force-creating slots:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create slots'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('🔍 CHECKING CURRENT SLOTS STATUS');
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check existing slots
    const existingQuery = query(
      collection(db, 'slots'),
      where('date', '==', todayStr),
      where('available', '==', true)
    );
    const existingSnapshot = await getDocs(existingQuery);
    const existingSlots = existingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📊 Found ${existingSlots.length} available slots for today`);
    
    return Response.json({
      success: true,
      date: todayStr,
      existingSlots: existingSlots,
      totalSlots: existingSlots.length,
      message: `Found ${existingSlots.length} slots for ${todayStr}`
    });
    
  } catch (error) {
    console.error('❌ Error checking slots:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
