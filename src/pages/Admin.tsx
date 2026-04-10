import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { 
  getAllUsers, 
  getAllBookings, 
  updateBookingStatus, 
  getAllEnrollments,
  createAvailableSlot,
  getAvailableSlots,
  bookAvailableSlot
} from '../lib/firestore';
import { courses } from '../data/courses';
import { writeBatch } from 'firebase/firestore';
import { db } from '../lib/firestore';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminGuard();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadData();
    }
  }, [adminLoading, isAdmin]);

  const loadData = async () => {
    try {
      const [usersData, bookingsData, enrollmentsData, slotsData] = await Promise.all([
        getAllUsers(),
        getAllBookings(),
        getAllEnrollments(),
        getAvailableSlots()
      ]);
      
      setUsers(usersData);
      setBookings(bookingsData);
      setEnrollments(enrollmentsData);
      setAvailableSlots(slotsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatus(bookingId, status as any);
      
      // Optimistic update
      setBookings(prev => prev.map(booking => 
        booking.uid === bookingId ? { ...booking, status } : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlotDate) return;
    
    try {
      await createAvailableSlot(new Date(newSlotDate));
      setNewSlotDate('');
      setShowAddSlot(false);
      loadData(); // Reload slots
    } catch (error) {
      console.error('Error adding slot:', error);
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Student Name', 'Email', 'Date & Time', 'Status'],
      ...bookings.map(booking => [
        booking.displayName,
        booking.email,
        booking.datetime.toDate().toLocaleString(),
        booking.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate stats
  const totalStudents = users.length;
  const bookingsThisWeek = bookings.filter(booking => {
    const bookingDate = booking.datetime.toDate();
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return bookingDate >= weekStart && bookingDate <= weekEnd && 
           (booking.status === 'booked' || booking.status === 'confirmed');
  }).length;
  
  const totalXPAwarded = users.reduce((sum: number, user: any) => sum + (user.xp || 0), 0);
  
  const courseEnrollments = enrollments.reduce((acc, enrollment) => {
    acc[enrollment.courseId] = (acc[enrollment.courseId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostPopularCourse = Object.entries(courseEnrollments)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'None';

  // Filter users for search
  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate course analytics
  const courseAnalytics = courses.map(course => {
    const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
    const avgProgress = courseEnrollments.length > 0 
      ? courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length 
      : 0;
    const completions = courseEnrollments.filter(e => e.progress === 100).length;
    const totalXP = courseEnrollments.reduce((sum, e) => sum + e.xpEarned, 0);

    return {
      ...course,
      enrolled: courseEnrollments.length,
      avgProgress: Math.round(avgProgress),
      completions,
      totalXP
    };
  });

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Checking admin access...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useAdminGuard
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP BAR */}
      <header className="bg-slate-800 text-white border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold">Elo Matt! - Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Admin
              </span>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
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
                <p className="text-sm text-slate-600 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">users</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Bookings This Week</p>
                <p className="text-2xl font-bold text-slate-900">{bookingsThisWeek}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">book</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total XP Awarded</p>
                <p className="text-2xl font-bold text-slate-900">{totalXPAwarded}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600">XP</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Most Popular Course</p>
                <p className="text-lg font-bold text-slate-900 truncate">
                  {courses.find(c => c.id === mostPopularCourse)?.title.split(' ')[0] || 'None'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">star</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1 - UPCOMING BOOKINGS */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date & Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      No upcoming bookings
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.uid} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-900">{booking.displayName}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{booking.email}</td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {booking.datetime.toDate().toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'completed' ? 'bg-slate-100 text-slate-500' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {booking.status === 'booked' && (
                            <button
                              onClick={() => handleBookingStatusUpdate(booking.uid, 'confirmed')}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleBookingStatusUpdate(booking.uid, 'completed')}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Complete
                            </button>
                          )}
                          {(booking.status === 'booked' || booking.status === 'confirmed') && (
                            <button
                              onClick={() => handleBookingStatusUpdate(booking.uid, 'cancelled')}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2 - STUDENT ROSTER */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Student Roster</h3>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div key={user.uid} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-slate-900">{user.displayName}</h4>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Level:</span>
                    <span className="font-medium">Level {user.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">XP:</span>
                    <span className="font-medium">{user.xp || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Streak:</span>
                    <span className="font-medium">{user.streakDays || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Courses:</span>
                    <span className="font-medium">{enrollments.filter(e => e.uid === user.uid).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Classes:</span>
                    <span className="font-medium">{bookings.filter(b => b.uid === user.uid).length}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/admin/students/${user.uid}`)}
                  className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3 - COURSE ANALYTICS */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Course Analytics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Enrolled</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Avg Progress %</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Completions</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total XP Awarded</th>
                </tr>
              </thead>
              <tbody>
                {courseAnalytics.map((course) => (
                  <tr key={course.id} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-sm text-slate-900">{course.title}</td>
                    <td className="py-3 px-4 text-sm text-slate-900">{course.enrolled}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${course.avgProgress}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-900">{course.avgProgress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">{course.completions}</td>
                    <td className="py-3 px-4 text-sm text-slate-900">{course.totalXP}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4 - QUICK ACTIONS */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddSlot(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Available Slot
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export Bookings CSV
              </button>
              <button
                onClick={() => navigate('/admin/announcements')}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Send Announcement
              </button>
            </div>
            
            {showAddSlot && (
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-3">Add Available Slot</h4>
                <div className="flex gap-3">
                  <input
                    type="datetime-local"
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddSlot}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Slot
                  </button>
                  <button
                    onClick={() => setShowAddSlot(false)}
                    className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
