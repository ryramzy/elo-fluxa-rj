import { useUserProfile } from './useUserProfile';
import { useEnrollments } from './useEnrollments';
import { useBookings } from './useBookings';
import { useStreak } from './useStreak';
import { useMemo } from 'react';
import { getNextBookingDisplay, getUpcomingBookings, getWeeklyBookings } from '../utils/bookingUtils';
import { getXPProgress, getLevelName, canLevelUp } from '../utils/xpUtils';

export const useDashboardData = (user: any) => {
  const { profile, loading: profileLoading } = useUserProfile(user?.uid || '');
  const { enrollments, loading: enrollmentsLoading } = useEnrollments(user?.uid || '');
  const { bookings, loading: bookingsLoading } = useBookings(user?.uid || '');
  const { streak } = useStreak(user?.uid || '');

  const loading = profileLoading || enrollmentsLoading || bookingsLoading;

  // Memoized computed values
  const nextBooking = useMemo(() => {
    return getNextBookingDisplay(bookings || []);
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    return getUpcomingBookings(bookings || []);
  }, [bookings]);

  const weeklyBookings = useMemo(() => {
    return getWeeklyBookings(bookings || []);
  }, [bookings]);

  const xpProgress = useMemo(() => {
    return getXPProgress(profile);
  }, [profile]);

  const levelName = useMemo(() => {
    return getLevelName(profile?.level || 1);
  }, [profile?.level]);

  const canUserLevelUp = useMemo(() => {
    return canLevelUp(profile);
  }, [profile]);

  const stats = useMemo(() => {
    return {
      totalEnrollments: enrollments?.length || 0,
      totalBookings: bookings?.length || 0,
      weeklyBookings: weeklyBookings.length,
      currentStreak: streak || 0,
      completedLessons: bookings?.filter(b => b.status === 'completed').length || 0,
    };
  }, [enrollments, bookings, weeklyBookings, streak]);

  return {
    // Raw data
    profile,
    enrollments,
    bookings,
    streak,
    loading,

    // Computed values
    nextBooking,
    upcomingBookings,
    weeklyBookings,
    xpProgress,
    levelName,
    canUserLevelUp,
    stats,
  };
};
