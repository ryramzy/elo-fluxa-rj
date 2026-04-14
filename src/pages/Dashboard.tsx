import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useEnrollments } from '../hooks/useEnrollments';
import { useBookings } from '../hooks/useBookings';
import { useStreak } from '../hooks/useStreak';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { courses } from '../data/courses';
import { createBooking, getAvailableSlots, bookAvailableSlot, checkCourseAccess, updateUserPlan } from '../lib/firestore';
import { XP_REWARDS, awardFirstLoginBonus, awardXP } from '../lib/xpSystem';
import { writeBatch, doc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../lib/firestore';
import SubscriptionModal from '../components/SubscriptionModal';
import OnboardingModal from '../components/OnboardingModal';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid || '');
  const { enrollments, loading: enrollmentsLoading } = useEnrollments(user?.uid || '');
  const { bookings, loading: bookingsLoading } = useBookings(user?.uid || '');
  const { streak } = useStreak(user?.uid || '');
  
  useDocumentTitle('Dashboard');
  
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<string | null>(null);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  // Award first login bonus
  useEffect(() => {
    if (user?.uid && profile) {
      awardFirstLoginBonus(user.uid);
    }
  }, [user?.uid, profile]);

  // Check if user needs onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !profile) return;
      
      try {
        const userDoc = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDoc);
        
        if (!userSnapshot.exists() || !userSnapshot.data().onboardingComplete) {
          setOnboardingModalOpen(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [user, profile]);

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
      // Check booking limit
      if (profile && profile.bookingsThisMonth >= profile.bookingLimit) {
        alert(`Você atingiu seu limite de aulas este mês (${profile.bookingLimit}). Faça upgrade para continuar reservando!`);
        setSubscriptionModalOpen(true);
        return;
      }
      
      // Use atomic batch write to prevent double-bookings
      const batch = writeBatch(db);
      
      // Create booking
      const bookingData = {
        uid: user.uid,
        studentName: user.displayName || 'Unknown',
        studentEmail: user.email || 'unknown@example.com',
        datetime: slot.datetime,
        status: 'booked' as const,
        createdAt: serverTimestamp()
      };
      
      const bookingRef = doc(collection(db, 'bookings'));
      batch.set(bookingRef, bookingData);
      
      // Mark slot as booked
      const slotRef = doc(collection(db, 'availableSlots'), slot.id);
      batch.update(slotRef, { status: 'booked' });
      
      // Update user booking count
      const userRef = doc(collection(db, 'users'), user.uid);
      batch.update(userRef, {
        bookingsThisMonth: (profile?.bookingsThisMonth || 0) + 1
      });
      
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

  const handleEnrollClick = async (courseId: string) => {
    if (!user?.uid) return;
    
    try {
      // Check course access
      const accessCheck = await checkCourseAccess(user.uid, courseId);
      
      if (!accessCheck.canAccess) {
        // Open subscription modal
        setSelectedCourseForEnroll(courseId);
        setSubscriptionModalOpen(true);
        return;
      }
      
      // Enroll directly if user has access
      await enrollInCourse(courseId);
    } catch (error) {
      console.error('Error checking course access:', error);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user?.uid) return;
    
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;
      
      // Create enrollment
      const enrollmentData = {
        courseId,
        enrolledAt: serverTimestamp(),
        progress: 0,
        lessonsCompleted: 0,
        totalLessons: course.lessons,
        xpEarned: 0
      };
      
      await addDoc(collection(db, `users/${user.uid}/courses`), enrollmentData);
      
      // Award enrollment XP
      await awardXP(user.uid, 50, 'course enrolled');
      
      // Show success message (you could add a toast notification here)
      console.log(`Successfully enrolled in ${course.title}! +50 XP`);
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const handleSubscriptionPlanSelect = async (plan: 'starter' | 'pro' | 'elite') => {
    if (!user?.uid) return;
    
    try {
      if (plan === 'starter') {
        // Update user plan to free
        await updateUserPlan(user.uid, 'free');
        
        // If there's a selected course, enroll in it
        if (selectedCourseForEnroll) {
          await enrollInCourse(selectedCourseForEnroll);
          setSelectedCourseForEnroll(null);
        }
      } else {
        // For Pro and Elite, show WhatsApp message (payment placeholder)
        console.log(`User selected ${plan} plan - redirecting to WhatsApp for payment`);
      }
    } catch (error) {
      console.error('Error handling plan selection:', error);
    }
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
        {/* HERO WELCOME SECTION */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return 'Bom dia';
                if (hour < 18) return 'Boa tarde';
                return 'Boa noite';
              })()}, {profile?.displayName?.split(' ')[0] || 'estudante'}! Ready to level up today?
            </h1>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">{'\ud83d\udd25'}</span>
                </div>
                <span className="text-slate-700 font-medium">{streak || 0} day streak</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>XP to Level {profile?.level + 1 || 2}</span>
                  <span>{getXPToNextLevel()} XP</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-600 ease-out"
                    style={{ 
                      width: `${(() => {
                        const currentXP = profile?.xp || 0;
                        const xpToNext = getXPToNextLevel();
                        const totalForLevel = (() => {
                          const ranges = [
                            { level: 1, min: 0, max: 499 },
                            { level: 2, min: 500, max: 999 },
                            { level: 3, min: 1000, max: 1999 },
                            { level: 4, min: 2000, max: 2999 },
                            { level: 5, min: 3000, max: 4999 }
                          ];
                          const currentRange = ranges.find(r => r.level === (profile?.level || 1));
                          return currentRange ? currentRange.max - currentRange.min : 500;
                        })();
                        return ((totalForLevel - xpToNext) / totalForLevel) * 100;
                      })()}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full opacity-20 -ml-12 -mb-12"></div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#faeeda] p-6 rounded-lg border border-amber-200 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-amber-700 mb-1">Total XP</p>
                <p className="text-2xl font-bold text-[#ba7517]">{profile?.xp || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-amber-600 font-bold">XP</span>
              </div>
            </div>
            {/* Background star icon */}
            <div className="absolute bottom-0 right-0 w-20 h-20 opacity-8 pointer-events-none">
              <svg className="w-full h-full text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-orange-700 mb-1">Streak</p>
                <p className="text-2xl font-bold text-orange-800">{streak || 0} days</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">{'\ud83d\udd25'}</span>
              </div>
            </div>
            {/* Background lightning icon */}
            <div className="absolute bottom-0 right-0 w-20 h-20 opacity-8 pointer-events-none">
              <svg className="w-full h-full text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-blue-700 mb-1">Classes Booked</p>
                <p className="text-2xl font-bold text-blue-800">
                  {bookings.filter(b => b.status === 'booked').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">{'\ud83d\udcc5'}</span>
              </div>
            </div>
            {/* Background calendar icon */}
            <div className="absolute bottom-0 right-0 w-20 h-20 opacity-8 pointer-events-none">
              <svg className="w-full h-full text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
          </div>

          <div className="bg-teal-50 p-6 rounded-lg border border-teal-200 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-teal-700 mb-1">Courses</p>
                <p className="text-2xl font-bold text-teal-800">
                  {enrollments.length} total, {enrollments.filter(e => e.progress === 100).length} completed
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-teal-600 font-bold">{'\ud83d\udcda'}</span>
              </div>
            </div>
            {/* Background book icon */}
            <div className="absolute bottom-0 right-0 w-20 h-20 opacity-8 pointer-events-none">
              <svg className="w-full h-full text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
              </svg>
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
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
                  onClick={() => {
                    // Placeholder navigation
                    console.log('Navigate to course:', course.id);
                  }}
                >
                  {/* Locked overlay for paid plans */}
                  {/* TODO: Add plan check logic here */}
                  
                  {/* Photo Banner with Colored Overlay */}
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0"
                      style={{ backgroundColor: course.accentColor + '40' }}
                    />
                    {/* Emoji */}
                    <div className="absolute bottom-2 left-2 text-2xl">
                      {course.emoji}
                    </div>
                    {/* Tag Badge */}
                    <div className="absolute top-2 right-2">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: course.accentColor }}
                      >
                        {course.tag}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 text-sm">{course.title}</h3>
                    
                    {/* Course description */}
                    <p className="text-xs text-slate-600 mb-2 line-clamp-1">{course.description}</p>
                    
                    {/* Audience tag */}
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                        {course.audience}
                      </span>
                    </div>
                    
                    {/* XP reward */}
                    <div className="mb-3">
                      <span className="text-sm font-semibold" style={{ color: course.accentColor }}>
                        +{course.totalXpReward} XP
                      </span>
                    </div>
                    
                    {/* Progress bar (thicker) */}
                    {isEnrolled && (
                      <div className="mb-3">
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
                    )}
                    
                    {/* Context-aware CTA */}
                    {isEnrolled ? (
                      isCompleted ? (
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded transition-colors">
                          Review
                        </button>
                      ) : (
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition-colors">
                          Continue
                        </button>
                      )
                    ) : (
                      <button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnrollClick(course.id);
                        }}
                      >
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

          {/* GAMIFICATION SIDEBAR PANEL */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Progress</h3>
            
            {/* Level Name Display */}
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-blue-600">
                {(() => {
                  const levelNames = ['Beginner', 'Explorer', 'Conversationalist', 'Rising Star', 'Fluent', 'Native Flow'];
                  return levelNames[profile?.level - 1] || 'Beginner';
                })()}
              </div>
              <div className="text-sm text-slate-600">Level {profile?.level || 1}</div>
            </div>
            
            {/* XP Progress Bar with Milestones */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Progress</span>
                <span>{getXPToNextLevel()} XP to next level</span>
              </div>
              <div className="relative">
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-600"
                    style={{ 
                      width: `${(() => {
                        const currentXP = profile?.xp || 0;
                        const xpToNext = getXPToNextLevel();
                        const totalForLevel = (() => {
                          const ranges = [
                            { level: 1, min: 0, max: 499 },
                            { level: 2, min: 500, max: 999 },
                            { level: 3, min: 1000, max: 1999 },
                            { level: 4, min: 2000, max: 2999 },
                            { level: 5, min: 3000, max: 4999 }
                          ];
                          const currentRange = ranges.find(r => r.level === (profile?.level || 1));
                          return currentRange ? currentRange.max - currentRange.min : 500;
                        })();
                        return ((totalForLevel - xpToNext) / totalForLevel) * 100;
                      })()}%` 
                    }}
                  />
                </div>
                {/* Milestone markers */}
                <div className="absolute top-0 left-0 w-full h-3 flex justify-between px-1">
                  <div className="w-1 h-1 bg-slate-400 rounded-full self-center"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full self-center"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full self-center"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full self-center"></div>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">Next reward at Level {Math.min((profile?.level || 1) + 1, 6)}</div>
            </div>

            {/* Badge Grid with Tooltips */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Achievements</h4>
              <div className="grid grid-cols-3 gap-3">
                {courses.map((course) => {
                  const isEarned = enrollments.some(e => e.courseId === course.id && e.progress === 100);
                  return (
                    <div
                      key={course.id}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 border-2 transition-all cursor-pointer group relative ${
                        isEarned 
                          ? 'border-yellow-400 bg-yellow-50' 
                          : 'border-slate-200 bg-slate-50 opacity-50'
                      }`}
                      title={isEarned ? 'Completed!' : `Complete ${course.title} to earn this badge`}
                    >
                      <span className="text-2xl mb-1">{course.emoji}</span>
                      <span className="text-xs text-slate-600 text-center">{course.tag}</span>
                      {isEarned && (
                        <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg pointer-events-none"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly XP Chart */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Weekly XP</h4>
              <div className="flex items-end justify-between h-20 gap-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  // Mock data - replace with actual weekly XP data
                  const xp = Math.floor(Math.random() * 100) + 20;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${xp}%` }}
                        title={`${day}: ${xp} XP`}
                      ></div>
                      <span className="text-xs text-slate-500 mt-1">{day.slice(0, 1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => {
          setSubscriptionModalOpen(false);
          setSelectedCourseForEnroll(null);
        }}
        onPlanSelect={handleSubscriptionPlanSelect}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
