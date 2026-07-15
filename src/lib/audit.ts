import { db } from './firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Write a standardized log entry to the /audit_logs collection.
 * Helpful for tracking booking, credit, and mailing lifecycles.
 */
export async function writeAuditLog(
  event: string,
  userId: string,
  bookingId: string,
  status: 'success' | 'failure',
  metadata: Record<string, any> = {}
) {
  try {
    const auditLogsRef = collection(db, 'audit_logs');
    await addDoc(auditLogsRef, {
      event,
      userId,
      bookingId,
      status,
      timestamp: serverTimestamp(),
      metadata,
    });
  } catch (error) {
    console.error('[Audit Log] Failed to write audit log:', error);
  }
}
