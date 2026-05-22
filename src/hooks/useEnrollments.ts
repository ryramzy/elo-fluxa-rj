import { useState, useEffect } from 'react';
import { onSnapshot, query, orderBy, collection } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { courses } from '../data/courses';
import { Enrollment } from '../lib/firestore';

export function useEnrollments(uid: string) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    let legacyData: any[] = [];
    let rootData: any[] = [];

    const updateCombined = () => {
      // Combine avoiding duplicates (root takes precedence)
      const combinedMap = new Map();
      legacyData.forEach(d => combinedMap.set(d.courseId, d));
      rootData.forEach(d => combinedMap.set(d.courseId, d)); // overwrites legacy if exists

      const combined = Array.from(combinedMap.values())
        .sort((a, b) => b.enrolledAt?.toMillis?.() - a.enrolledAt?.toMillis?.());

      const enrollmentsWithCourses = combined.map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        return { ...enrollment, course };
      });

      setEnrollments(enrollmentsWithCourses);
      setLoading(false);
    };

    const unsubscribeLegacy = onSnapshot(
      query(collection(db, 'users', uid, 'courses')),
      (snapshot) => {
        legacyData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        updateCombined();
      },
      (err) => {
        console.error('Error fetching legacy enrollments:', err);
        setError(err.message);
      }
    );

    const unsubscribeRoot = onSnapshot(
      query(collection(db, 'enrollments'), where('userId', '==', uid)),
      (snapshot) => {
        rootData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        updateCombined();
      },
      (err) => {
        console.error('Error fetching root enrollments:', err);
        setError(err.message);
      }
    );

    return () => {
      unsubscribeLegacy();
      unsubscribeRoot();
    };
  }, [uid]);

  return { enrollments, loading, error };
}
