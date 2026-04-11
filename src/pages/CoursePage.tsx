import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useEnrollments } from '../hooks/useEnrollments';
import { courses, Course, Lesson } from '../data/courses';
import { checkCourseAccess } from '../lib/firestore';
import { XP_REWARDS, awardXP } from '../lib/xpSystem';
import SubscriptionModal from '../components/SubscriptionModal';

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  const { enrollments } = useEnrollments(user?.uid || '');
  const [activeTab, setActiveTab] = useState<'lessons' | 'about'>('lessons');
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const enrollment = enrollments.find(e => e.courseId === courseId);
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.progress === 100;

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Course not found</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleEnrollClick = async () => {
    if (!user?.uid) return;
    
    try {
      const accessCheck = await checkCourseAccess(user.uid, course.id);
      
      if (!accessCheck.canAccess) {
        setSelectedCourseForEnroll(course.id);
        setSubscriptionModalOpen(true);
        return;
      }
      
      // Enroll directly if user has access
      await enrollInCourse();
    } catch (error) {
      console.error('Error checking course access:', error);
    }
  };

  const enrollInCourse = async () => {
    if (!user?.uid) return;
    
    try {
      // Create enrollment logic would go here
      // For now, just show success and award XP
      await awardXP(user.uid, 50, 'course enrolled');
      console.log(`Successfully enrolled in ${course.title}! +50 XP`);
      setSelectedCourseForEnroll(null);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const handleSubscriptionPlanSelect = async (plan: 'starter' | 'pro' | 'elite') => {
    if (!user?.uid) return;
    
    try {
      if (plan === 'starter') {
        // Update user plan to free logic would go here
        if (selectedCourseForEnroll) {
          await enrollInCourse();
        }
      } else {
        console.log(`User selected ${plan} plan - redirecting to WhatsApp for payment`);
      }
    } catch (error) {
      console.error('Error handling plan selection:', error);
    }
  };

  const handleShareClick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleLessonClick = async (lesson: Lesson) => {
    if (!user?.uid) {
      navigate('/', { state: { openAuthModal: true, returnTo: `/courses/${courseId}/lessons/${lesson.id}` } });
      return;
    }

    if (lesson.free || isEnrolled) {
      navigate(`/courses/${courseId}/lessons/${lesson.id}`);
    } else {
      setSelectedCourseForEnroll(course.id);
      setSubscriptionModalOpen(true);
    }
  };

  const getLessonTypeColor = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-700';
      case 'reading': return 'bg-amber-100 text-amber-700';
      case 'quiz': return 'bg-purple-100 text-purple-700';
      case 'conversation': return 'bg-teal-100 text-teal-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const estimatedTotalTime = course.lessons.reduce((total, lesson) => {
    const minutes = parseInt(lesson.duration);
    return total + minutes;
  }, 0);

  const totalLessonXP = course.lessons.reduce((total, lesson) => total + lesson.xpReward, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Course Hero Banner */}
      <div 
        className="relative h-64 flex items-center justify-center"
        style={{ backgroundColor: course.color }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-4 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <div className="text-6xl mb-4">{course.emoji}</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
            <span className="bg-slate-100 px-3 py-1 rounded-full">{course.audience}</span>
            <span>{course.lessons.length} lessons</span>
            <span>+{course.totalXpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Progress Bar (if enrolled) */}
      {isEnrolled && (
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Course Progress</span>
              <span className="text-sm text-slate-600">{enrollment?.progress || 0}% complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${enrollment?.progress || 0}%`,
                  backgroundColor: course.accentColor 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Overview (65% width) */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-slate-200 mb-6">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'lessons'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lessons
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'about'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  About
                </button>
              </div>

              {/* Lessons Tab */}
              {activeTab === 'lessons' && (
                <div className="p-6">
                  <div className="space-y-3">
                    {course.lessons.map((lesson, index) => {
                      const isCompleted = false; // TODO: Check lesson completion
                      const isCurrent = false; // TODO: Determine current lesson
                      const canAccess = lesson.free || isEnrolled;
                      
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`flex items-center p-4 rounded-lg border transition-all cursor-pointer ${
                            isCurrent
                              ? 'border-blue-500 bg-blue-50'
                              : canAccess
                              ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              : 'border-slate-200 bg-slate-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center flex-1">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 mr-4">
                              {isCompleted ? '??' : index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-900">{lesson.title}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-slate-600">{lesson.duration}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getLessonTypeColor(lesson.type)}`}>
                                  {lesson.type}
                                </span>
                                {lesson.free && (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                    Grátis
                                  </span>
                                )}
                                {!canAccess && (
                                  <span className="text-xs text-slate-500">
                                    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">+{lesson.xpReward} XP</span>
                            {isCurrent && (
                              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                Continue
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">About this course</h3>
                    <p className="text-slate-700 leading-relaxed">{course.aboutText}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Who this is for</h3>
                    <p className="text-slate-700 leading-relaxed">{course.whoThisIsFor}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">What you will learn</h3>
                    <ul className="space-y-2">
                      {course.whatYouWillLearn.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Meet your teacher</h3>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        M
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Matt</h4>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          Matt is a native English speaker from the United States living in Rio de Janeiro. 
                          With years of experience teaching professionals, students, and culture enthusiasts, 
                          he brings real American English - not textbook English - to every lesson.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar (35% width) */}
          <div className="space-y-6">
            {/* Course Stats */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Course Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total XP</span>
                  <span className="font-medium text-slate-900">+{course.totalXpReward} XP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Time</span>
                  <span className="font-medium text-slate-900">~{Math.round(estimatedTotalTime / 60)}h {estimatedTotalTime % 60}min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Lessons</span>
                  <span className="font-medium text-slate-900">{course.lessons.length}</span>
                </div>
              </div>
            </div>

            {/* Student Stats (if enrolled) */}
            {isEnrolled && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Your Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Lessons Completed</span>
                    <span className="font-medium text-slate-900">
                      {enrollment?.lessonsCompleted || 0} / {course.lessons.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">XP Earned</span>
                    <span className="font-medium text-slate-900">{enrollment?.xpEarned || 0} XP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Current Streak</span>
                    <span className="font-medium text-slate-900">{profile?.streakDays || 0} days</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {isEnrolled ? (
                  isCompleted ? (
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded transition-colors">
                      Course Completed! ???
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        const nextLesson = course.lessons.find(l => !l.free);
                        if (nextLesson) {
                          navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors"
                    >
                      Continue Learning
                    </button>
                  )
                ) : (
                  <button 
                    onClick={handleEnrollClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors"
                  >
                    Enroll in Course
                  </button>
                )}
                
                <button 
                  onClick={handleShareClick}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded transition-colors"
                >
                  {linkCopied ? 'Link copied!' : 'Share Course'}
                </button>
              </div>
            </div>

            {/* Help */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Need help?</h3>
              <a
                href="https://wa.me/5521999999999?text=Ol%C3%A1!%20Tenho%20d%C3%BAvidas%20sobre%20o%20curso%20{course.title}"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                </svg>
                Message Matt on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => {
          setSubscriptionModalOpen(false);
          setSelectedCourseForEnroll(null);
        }}
        onPlanSelect={handleSubscriptionPlanSelect}
      />
    </div>
  );
};

export default CoursePage;
