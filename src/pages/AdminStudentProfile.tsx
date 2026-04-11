import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, getAllBookings, getAllEnrollments, updateUserXP, updateUserPlan } from '../lib/firestore';
import { awardXP } from '../lib/xpSystem';
import { courses } from '../data/courses';

interface StudentProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: any;
  badgesEarned: string[];
  createdAt: any;
  plan: 'free' | 'pro' | 'elite';
  planActivatedAt: any;
  bookingsThisMonth: number;
  bookingLimit: number;
}

interface Booking {
  id: string;
  uid: string;
  studentName: string;
  studentEmail: string;
  datetime: any;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: any;
}

interface Enrollment {
  courseId: string;
  uid: string;
  progress: number;
  xpEarned: number;
}

const AdminStudentProfile: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [xpAmount, setXpAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'elite'>('free');

  useEffect(() => {
    if (!uid || !adminUser) return;
    
    loadStudentData();
  }, [uid, adminUser]);

  const loadStudentData = async () => {
    if (!uid) return;
    
    try {
      setLoading(true);
      
      // Load student profile
      const profile = await getUserProfile(uid);
      if (profile) {
        setStudent({ ...profile, uid });
      }
      
      // Load bookings
      const allBookings = await getAllBookings();
      const studentBookings = allBookings.filter(b => b.uid === uid);
      setBookings(studentBookings);
      
      // Load enrollments
      const allEnrollments = await getAllEnrollments();
      const studentEnrollments = allEnrollments.filter(e => e.uid === uid);
      setEnrollments(studentEnrollments);
      
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!uid) return;
    
    try {
      // Save admin notes to Firestore
      console.log('Saving admin notes:', adminNotes);
      // TODO: Implement actual Firestore update
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleAwardXP = async () => {
    if (!uid || !xpAmount) return;
    
    try {
      const xp = parseInt(xpAmount);
      if (isNaN(xp) || xp <= 0) return;
      
      await awardXP(uid, xp, 'Manual XP award by admin');
      await loadStudentData(); // Reload to show updated XP
      setXpAmount('');
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  const handlePlanChange = async () => {
    if (!uid) return;
    
    try {
      await updateUserPlan(uid, selectedPlan);
      await loadStudentData(); // Reload to show updated plan
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const getLevelColor = (level: number) => {
    const colors = [
      '#6B7280', // Level 1 - gray
      '#3B82F6', // Level 2 - blue
      '#10B981', // Level 3 - green
      '#F59E0B', // Level 4 - amber
      '#8B5CF6', // Level 5 - purple
      '#EF4444'  // Level 6 - red
    ];
    return colors[Math.min(level - 1, 5)];
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-700';
      case 'pro': return 'bg-blue-100 text-blue-700';
      case 'elite': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading student profile...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Student not found</h1>
          <button 
            onClick={() => navigate('/admin')}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to admin dashboard
          </button>
        </div>
      </div>
    );
  }

  const completedClasses = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/admin')}
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-slate-900">Student Profile</h1>
          <div></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Student Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: getLevelColor(student.level) }}
            >
              {student.displayName?.charAt(0) || student.email?.charAt(0) || 'U'}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{student.displayName}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(student.plan)}`}>
                  {student.plan.charAt(0).toUpperCase() + student.plan.slice(1)}
                </span>
              </div>
              <p className="text-slate-600 mb-4">{student.email}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Member since:</span>
                  <p className="font-medium text-slate-900">{formatDate(student.createdAt)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Last active:</span>
                  <p className="font-medium text-slate-900">{formatDate(student.lastActiveDate)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Plan activated:</span>
                  <p className="font-medium text-slate-900">
                    {student.planActivatedAt ? formatDate(student.planActivatedAt) : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">UID:</span>
                  <p className="font-medium text-slate-900 font-mono text-xs">{student.uid}</p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${student.email}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors text-center"
              >
                Send Message
              </a>
              <a
                href={`https://console.firebase.google.com/project/elo-fluxa-rj/firestore/data/users/${student.uid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors text-center"
              >
                View in Firebase
              </a>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Total XP</p>
            <p className="text-2xl font-bold text-slate-900">{student.xp}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Current Level</p>
            <p className="text-2xl font-bold text-slate-900">Level {student.level}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Streak Days</p>
            <p className="text-2xl font-bold text-slate-900">{student.streakDays}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Classes Attended</p>
            <p className="text-2xl font-bold text-slate-900">{completedClasses}</p>
          </div>
        </div>

        {/* Enrollment Progress */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Enrollment Progress</h3>
          <div className="space-y-4">
            {courses.map(course => {
              const enrollment = enrollments.find(e => e.courseId === course.id);
              const isEnrolled = !!enrollment;
              
              return (
                <div key={course.id} className={`flex items-center gap-4 p-4 rounded-lg border ${
                  isEnrolled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'
                }`}>
                  <div className="text-2xl">{course.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{course.title}</h4>
                    {isEnrolled ? (
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${enrollment.progress}%`,
                                backgroundColor: course.accentColor 
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-slate-600">
                          {enrollment.xpEarned} XP earned
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Not enrolled</p>
                    )}
                  </div>
                  <div className="text-sm text-slate-600">
                    {isEnrolled ? `${enrollment.progress}% complete` : 'Not enrolled'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking History</h3>
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-700">Date</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-700">Time</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-700">Status</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-700">Course Context</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-b border-slate-100">
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {formatDate(booking.datetime).split(',')[0]}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {formatDate(booking.datetime).split(',')[1]}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {/* TODO: Add course context from enrollment */}
                        General English
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {/* TODO: Add booking notes */}
                        -
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">No bookings yet</p>
          )}
        </div>

        {/* Admin Notes */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Admin Notes</h3>
          <p className="text-sm text-slate-600 mb-4">
            Private notes about this student (never visible to the student)
          </p>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full h-32 p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add your private notes about this student..."
          />
          <button
            onClick={handleSaveNotes}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Notes
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upgrade Plan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upgrade Plan</label>
              <div className="flex gap-2">
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as 'free' | 'pro' | 'elite')}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="elite">Elite</option>
                </select>
                <button
                  onClick={handlePlanChange}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Award XP */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Award XP</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAwardXP}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Award
                </button>
              </div>
            </div>

            {/* Book Class */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Book Class</label>
              <button className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                Book Class for Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentProfile;
