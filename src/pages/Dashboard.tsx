import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useEnrollments } from '../hooks/useEnrollments';
import { useBookings } from '../hooks/useBookings';
import { useStreak } from '../hooks/useStreak';
import { courses } from '../data/courses';
import { createBooking, getAvailableSlots, bookAvailableSlot } from '../lib/firestore';
import { awardXP, XP_REWARDS, awardFirstLoginBonus } from '../lib/xpSystem';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { db } from '../lib/firestore';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid || '');
  const { enrollments, loading: enrollmentsLoading } = useEnrollments(user?.uid || '');
  const { bookings, loading: bookingsLoading } = useBookings(user?.uid || '');
  const { streak } = useStreak(user?.uid || '');
  
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // Award first login bonus
  useEffect(() => {
    if (user?.uid && profile) {
      awardFirstLoginBonus(user.uid);
    }
  }, [user?.uid, profile]);

  // Load available slots
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const slots = await getAvailableSlots();
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error loading available slots:', error);
      }
    };
    loadSlots();
  }, []);

  const handleBooking = async (slot: any) => {
    if (!user || !slot.datetime) return;
    
    setBookingLoading(slot.id);
    try {
      // Use atomic batch write to prevent double-bookings
      const batch = writeBatch(db);
      
      // Create booking
      const bookingData = {
        uid: user.uid,
        studentName: user.displayName || 'Unknown',
        studentEmail: user.email || 'unknown@example.com',
        datetime: slot.datetime,
        status: 'booked' as const,
        createdAt: new Date()
      };
      
      const bookingRef = doc(collection(db, 'bookings'));
      batch.set(bookingRef, bookingData);
      
      // Mark slot as booked
      const slotRef = doc(collection(db, 'availableSlots'), slot.id);
      batch.update(slotRef, { status: 'booked' });
      
      await batch.commit();
      await awardXP(user.uid, XP_REWARDS.BOOKING_CREATED, 'booking created');
      
      // Reload available slots
      const slots = await getAvailableSlots();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error booking class:', error);
    } finally {
      setBookingLoading(null);
    }
  };

  const isSlotBooked = (slot: any) => {
    return bookings.some(booking => 
      booking.datetime.toDate().getTime() === slot.datetime.getTime()
    );
  };

  const getXPToNextLevel = () => {
    if (!profile) return 0;
    const xpRanges = [
      { level: 1, min: 0, max: 499 },
      { level: 2, min: 500, max: 999 },
      { level: 3, min: 1000, max: 1999 },
      { level: 4, min: 2000, max: 2999 },
      { level: 5, min: 3000, max: 4999 },
      { level: 6, min: 5000, max: Infinity },
    ];
    
    const currentRange = xpRanges.find(range => range.level === profile.level);
    if (!currentRange) return 0;
    
    return currentRange.max - profile.xp;
  };

  if (profileLoading || enrollmentsLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP BAR */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold text-blue-600">Elo Matt!</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Level {profile?.level || 1}
              </span>
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total XP</p>
                <p className="text-2xl font-bold text-slate-900">{profile?.xp || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600">XP</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Streak</p>
                <p className="text-2xl font-bold text-slate-900">{streak || 0} days</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600">star</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Classes Booked</p>
                <p className="text-2xl font-bold text-slate-900">
                  {bookings.filter(b => b.status === 'booked').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">book</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Courses</p>
                <p className="text-2xl font-bold text-slate-900">
                  {enrollments.length} total, {enrollments.filter(e => e.progress === 100).length} completed
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">course</span>
              </div>
            </div>
          </div>
        </div>

        {/* COURSES SECTION */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Your courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => {
              const enrollment = enrollments.find(e => e.courseId === course.id);
              const isEnrolled = !!enrollment;
              const isCompleted = enrollment?.progress === 100;

              return (
                <div 
                  key={course.id}
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    // Placeholder navigation
                    console.log('Navigate to course:', course.id);
                  }}
                >
                  <div className="h-24 flex items-center justify-center" style={{ backgroundColor: course.color }}>
                    <span className="text-4xl">{course.emoji}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 text-sm">{course.title}</h3>
                    <p className="text-xs text-slate-600 mb-3">{course.lessons} lessons</p>
                    
                    {isEnrolled ? (
                      <div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Progress</span>
                            <span>{enrollment?.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${enrollment?.progress || 0}%`,
                                backgroundColor: course.accentColor 
                              }}
                            />
                          </div>
                        </div>
                        {isCompleted && (
                          <div className="text-green-600 text-xs font-medium">Completed</div>
                        )}
                      </div>
                    ) : (
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition-colors">
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BOOKING PANEL */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Book a class with Matt</h3>
            <div className="space-y-3">
              {availableSlots.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No slots available right now - check back soon!
                </div>
              ) : (
                availableSlots.map((slot) => {
                  const slotDate = slot.datetime.toDate();
                  const isBooked = isSlotBooked(slot);
                  return (
                    <div 
                      key={slot.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                    >
                      <span className="text-sm text-slate-700">
                        {slotDate.toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} (Rio)
                      </span>
                      <button
                        onClick={() => handleBooking(slot)}
                        disabled={isBooked || bookingLoading === slot.id}
                        className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
                          isBooked 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : bookingLoading === slot.id
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isBooked ? 'Booked' : bookingLoading === slot.id ? 'Booking...' : 'Book'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* BADGES & LEVEL */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Badges & level</h3>
            
            {/* XP Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Level {profile?.level || 1} - {profile?.levelName || 'Beginner'}</span>
                <span>{getXPToNextLevel()} XP to next level</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${profile?.xp || 0}%` }}
                />
              </div>
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-3 gap-4">
              {courses.map((course) => {
                const isEarned = enrollments.some(e => e.courseId === course.id && e.progress === 100);
                return (
                  <div
                    key={course.id}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 border-2 transition-all ${
                      isEarned 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : 'border-slate-200 bg-slate-50 opacity-50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{course.emoji}</span>
                    <span className="text-xs text-slate-600 text-center">{course.tag}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
