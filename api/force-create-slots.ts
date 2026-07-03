import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized successfully in force-create-slots.');
    } catch (parseErr) {
      console.error('❌ Failed to parse Google Service Account key:', parseErr);
      admin.initializeApp(); // Fallback
    }
  } else {
    console.warn('⚠️ GOOGLE_SERVICE_ACCOUNT_KEY not found, falling back to default app credentials.');
    admin.initializeApp();
  }
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔥 FORCE CREATING SLOTS - Direct admin API Approach');
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // First, delete any existing slots for today to avoid conflicts
      console.log('🗑️ Cleaning up existing slots for today...');
      const existingSnapshot = await db.collection('slots')
        .where('date', '==', todayStr)
        .get();
      
      if (!existingSnapshot.empty) {
        const batch = db.batch();
        existingSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`🗑️ Deleted ${existingSnapshot.size} existing slots for today`);
      }
      
      // Create slots from 8:00 AM to 9:00 PM
      const createdSlots = [];
      const batch = db.batch();
      
      for (let hour = 8; hour <= 21; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const slotData = {
          date: todayStr,
          time: timeString,
          duration: 60,
          available: true,
          status: 'available',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = db.collection('slots').doc();
        batch.set(docRef, slotData);
        createdSlots.push({
          id: docRef.id,
          ...slotData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ Staged slot: ${slotData.date} ${slotData.time} (ID: ${docRef.id})`);
      }
      
      await batch.commit();
      console.log(`🎉 Successfully created ${createdSlots.length} slots!`);
      
      return res.status(200).json({
        success: true,
        message: `Created ${createdSlots.length} slots for ${todayStr}`,
        slots: createdSlots,
        date: todayStr,
        totalSlots: createdSlots.length
      });
      
    } catch (error) {
      console.error('❌ Error force-creating slots:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create slots'
      });
    }
  } else if (req.method === 'GET') {
    try {
      console.log('🔍 CHECKING CURRENT SLOTS STATUS');
      
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Check existing slots
      const existingSnapshot = await db.collection('slots')
        .where('date', '==', todayStr)
        .where('available', '==', true)
        .get();
        
      const existingSlots = existingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log(`📊 Found ${existingSlots.length} available slots for today`);
      
      return res.status(200).json({
        success: true,
        date: todayStr,
        existingSlots: existingSlots,
        totalSlots: existingSlots.length,
        message: `Found ${existingSlots.length} slots for ${todayStr}`
      });
      
    } catch (error) {
      console.error('❌ Error checking slots:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
