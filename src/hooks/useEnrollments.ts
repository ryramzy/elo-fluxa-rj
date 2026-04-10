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

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'users', uid, 'courses'),
        orderBy('enrolledAt', 'desc')
      ),
      (querySnapshot) => {
        const enrollmentData = querySnapshot.docs.map(doc => ({
          courseId: doc.data().courseId,
          enrolledAt: doc.data().enrolledAt,
          progress: doc.data().progress,
          lessonsCompleted: doc.data().lessonsCompleted,
          totalLessons: doc.data().totalLessons,
          xpEarned: doc.data().xpEarned,
          id: doc.id
        }));

        // Join with course catalog
        const enrollmentsWithCourses = enrollmentData.map(enrollment => {
          const course = courses.find(c => c.id === enrollment.courseId);
          return {
            ...enrollment,
            course
          };
        });

        setEnrollments(enrollmentsWithCourses);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching enrollments:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { enrollments, loading, error };
}
