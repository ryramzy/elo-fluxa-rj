import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestoreAccessToken } from './utils/googleAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const token = await getFirestoreAccessToken();
    const projectId = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!).project_id;
    const baseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (req.method === 'POST') {
      console.log('🔥 FORCE CREATING SLOTS - Direct REST API Approach');
      
      // 1. Query existing slots for today to clean them up
      const queryUrl = `${baseRestUrl}:runQuery`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: 'slots' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'date' },
              op: 'EQUAL',
              value: { stringValue: todayStr }
            }
          }
        }
      };

      const queryResponse = await fetch(queryUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      });

      const queryResults = await queryResponse.json();
      
      // Delete existing slots
      if (Array.isArray(queryResults)) {
        const deletePromises = queryResults
          .filter((item: any) => item.document)
          .map((item: any) => {
            const docName = item.document.name;
            const deleteUrl = `https://firestore.googleapis.com/v1/${docName}`;
            return fetch(deleteUrl, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
          });
        await Promise.all(deletePromises);
        console.log(`🗑️ Deleted slots for today`);
      }

      // Create slots from 8:00 AM to 9:00 PM
      const createdSlots = [];
      const createUrl = `${baseRestUrl}/slots`;

      for (let hour = 8; hour <= 21; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const slotBody = {
          fields: {
            date: { stringValue: todayStr },
            time: { stringValue: timeString },
            duration: { integerValue: '60' },
            available: { booleanValue: true },
            status: { stringValue: 'available' },
            createdAt: { timestampValue: new Date().toISOString() },
            updatedAt: { timestampValue: new Date().toISOString() }
          }
        };

        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(slotBody)
        });

        if (createResponse.ok) {
          const slotData = await createResponse.json();
          createdSlots.push(slotData);
          console.log(`✅ Created slot: ${todayStr} ${timeString}`);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Created ${createdSlots.length} slots for ${todayStr}`,
        date: todayStr,
        totalSlots: createdSlots.length
      });
    }

    if (req.method === 'GET') {
      console.log('🔍 CHECKING CURRENT SLOTS STATUS');
      
      const queryUrl = `${baseRestUrl}:runQuery`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: 'slots' }],
          where: {
            compositeFilter: {
              op: 'AND',
              filters: [
                {
                  fieldFilter: {
                    field: { fieldPath: 'date' },
                    op: 'EQUAL',
                    value: { stringValue: todayStr }
                  }
                },
                {
                  fieldFilter: {
                    field: { fieldPath: 'available' },
                    op: 'EQUAL',
                    value: { booleanValue: true }
                  }
                }
              ]
            }
          }
        }
      };

      const queryResponse = await fetch(queryUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      });

      const queryResults = await queryResponse.json();
      const existingSlots = Array.isArray(queryResults)
        ? queryResults
            .filter((item: any) => item.document)
            .map((item: any) => {
              const doc = item.document;
              const fields = doc.fields;
              const parts = doc.name.split('/');
              const id = parts[parts.length - 1];
              return {
                id,
                date: fields.date?.stringValue,
                time: fields.time?.stringValue,
                available: fields.available?.booleanValue,
                status: fields.status?.stringValue
              };
            })
        : [];

      return res.status(200).json({
        success: true,
        date: todayStr,
        existingSlots,
        totalSlots: existingSlots.length,
        message: `Found ${existingSlots.length} slots for ${todayStr}`
      });
    }

  } catch (error: any) {
    console.error('❌ Error in force-create-slots handler:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
}
