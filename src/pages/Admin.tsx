import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firestore';

interface Booking {
  id: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  userEmail?: string;
  status: string;
  createdAt?: any;
}

interface User {
  uid: string;
  displayName: string;
  email: string;
  plan: 'free' | 'pro' | 'elite';
  createdAt: any;
  lastLogin?: any;
}

interface AdminProps {
  onSwitchToStudentView?: () => void;
}

const Admin: React.FC<AdminProps> = ({ onSwitchToStudentView }) => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminGuard();
  const navigate = useNavigate();
  
  useDocumentTitle('Admin - Student Bookings');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [activeTab, setActiveTab] = useState<'bookings' | 'users' | 'revenue' | 'enrollments'>('bookings');
  const [enrollments, setEnrollments] = useState<any[]>([]);

  // Get week dates based on offset
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + (offset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  const loadWeekBookings = async () => {
    setLoading(true);
    try {
      const weekDates = getWeekDates(selectedWeek);
      const weekStart = weekDates[0];
      const weekEnd = weekDates[4];
      
      console.log('🔄 Admin loading bookings for week:', weekStart, 'to', weekEnd);
      
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('date', '>=', weekStart),
        where('date', '<=', weekEnd)
      );
      
      const snapshot = await getDocs(bookingsQuery);
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
      
      console.log(`📊 Found ${bookingsData.length} bookings for admin view`);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete booking function
  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      console.log('✅ Booking deleted successfully');
      loadWeekBookings(); // Reload bookings
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking. Please try again.');
    }
  };

  // Jump to current week
  const jumpToCurrentWeek = () => {
    setSelectedWeek(0);
  };

  // Load users
  const loadUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Upgrade user plan
  const upgradeUserPlan = async (userId: string, newPlan: 'free' | 'pro' | 'elite') => {
    if (!confirm(`Upgrade user to ${newPlan.toUpperCase()}?`)) return;
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        plan: newPlan,
        planUpdatedAt: new Date()
      });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.uid === userId ? { ...user, plan: newPlan } : user
      ));
      
      alert(`User upgraded to ${newPlan.toUpperCase()}`);
    } catch (error) {
      console.error('Error upgrading user:', error);
      alert('Error upgrading user');
    }
  };

  // WhatsApp contact
  const openWhatsApp = (phone: string, message: string) => {
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Revenue calculations
  const calculateRevenue = () => {
    const paidUsers = users.filter(u => u.plan !== 'free');
    const proRevenue = users.filter(u => u.plan === 'pro').length * 97; // R$97/month
    const eliteRevenue = users.filter(u => u.plan === 'elite').length * 197; // R$197/month
    return {
      monthly: proRevenue + eliteRevenue,
      paidUsers: paidUsers.length,
      proUsers: users.filter(u => u.plan === 'pro').length,
      eliteUsers: users.filter(u => u.plan === 'elite').length
    };
  };

  const loadEnrollments = async () => {
    try {
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        orderBy('enrolledAt', 'desc')
      );
      const snapshot = await getDocs(enrollmentsQuery);
      const enrollmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadWeekBookings();
      loadUsers();
      loadEnrollments();
    }
  }, [isAdmin, selectedWeek]);

  const weekDates = getWeekDates(selectedWeek);
  const isCurrentWeek = selectedWeek === 0;
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600">Loading admin...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600">Access denied</div>
      </div>
    );
  }

    const revenue = calculateRevenue();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage students, bookings, and revenue
            </p>
          </div>
          {onSwitchToStudentView && (
            <button
              onClick={onSwitchToStudentView}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-lg shadow-md transition-all hover:scale-105"
            >
              Visualizar como Aluno
            </button>
          )}
        </div>

        {/* Revenue Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Revenue Overview
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                R${revenue.monthly}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Monthly Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {revenue.paidUsers}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Paid Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {revenue.proUsers}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Pro Plans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {revenue.eliteUsers}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Elite Plans</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'revenue'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'enrollments'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Enrollments ({enrollments.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {isCurrentWeek ? 'This Week' : `Week of ${new Date(weekDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedWeek(selectedWeek - 1)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  ← Previous
                </button>
                <button
                  onClick={jumpToCurrentWeek}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    isCurrentWeek 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                  }`}
                >
                  Current Week
                </button>
                <button
                  onClick={() => setSelectedWeek(selectedWeek + 1)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Next →
                </button>
              </div>
            </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Loading bookings...</p>
            </div>
          )}

          {/* No bookings */}
          {!loading && bookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">
                No bookings found for this week
              </p>
            </div>
          )}

          {/* Bookings Grid */}
          {!loading && (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header Row */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 p-2">Time</div>
                  {weekDays.map((day, index) => (
                    <div key={day} className="text-xs font-medium text-slate-600 dark:text-slate-400 p-2 text-center">
                      <div>{day.slice(0, 3)}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(weekDates[index]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots Grid */}
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-6 gap-2 mb-1">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 p-2 flex items-center">
                      {time}
                    </div>
                    {weekDates.map((date) => {
                      const booking = bookings.find(b => b.date === date && b.time === time);
                      const isPast = new Date(date + ' ' + time) < new Date();
                      
                      return (
                        <div key={`${date}-${time}`} className="p-1">
                          {booking ? (
                            <div className={`w-full h-12 rounded-lg text-xs font-medium p-2 ${
                              isPast
                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            }`}>
                              <div className="font-medium truncate">
                                {booking.userName || 'Booked'}
                              </div>
                              <div className="text-xs opacity-75 truncate">
                                {booking.userEmail}
                              </div>
                              {!isPast && (
                                <button
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="mt-1 text-xs bg-red-500 text-white px-1 py-0.5 rounded hover:bg-red-600"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-12 rounded-lg bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                              <span className="text-[10px] text-slate-400">Available</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {!loading && bookings.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {timeSlots.length * 5}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">Total Possible Slots</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {(timeSlots.length * 5) - bookings.length}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {bookings.length}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">Booked</div>
                </div>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              User Management
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Plan</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-3">{user.displayName}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.plan === 'elite' ? 'bg-orange-100 text-orange-800' :
                          user.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => upgradeUserPlan(user.uid, 'pro')}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          >
                            Pro
                          </button>
                          <button
                            onClick={() => upgradeUserPlan(user.uid, 'elite')}
                            className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                          >
                            Elite
                          </button>
                          <button
                            onClick={() => openWhatsApp('5511999999999', `Hi ${user.displayName}, this is Matt from Elo!`)}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          >
                            WhatsApp
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Revenue Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Plan Distribution</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Free Users:</span>
                    <span>{users.filter(u => u.plan === 'free').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pro Users (R$97/month):</span>
                    <span>{revenue.proUsers} × R$97 = R${revenue.proUsers * 97}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Elite Users (R$197/month):</span>
                    <span>{revenue.eliteUsers} × R$197 = R${revenue.eliteUsers * 197}</span>
                  </div>
                  <div className="border-t pt-2 font-bold">
                    <div className="flex justify-between">
                      <span>Total Monthly Revenue:</span>
                      <span>R${revenue.monthly}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Export Revenue Report
                  </button>
                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Send Payment Reminders
                  </button>
                  <button className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Enrollments Management
            </h2>
            
            {/* Enrollment Summary per course */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Array.from(new Set(enrollments.map(e => e.courseId))).map(courseId => {
                const count = enrollments.filter(e => e.courseId === courseId).length;
                return (
                  <div key={courseId} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{courseId.replace(/-/g, ' ').toUpperCase()}</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{count}</div>
                  </div>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-3">Student Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Course</th>
                    <th className="text-left p-3">Enrolled Date</th>
                    <th className="text-left p-3">Price Paid</th>
                    <th className="text-left p-3">Email Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-3">{enrollment.userName || 'Unknown'}</td>
                      <td className="p-3">{enrollment.userEmail || 'N/A'}</td>
                      <td className="p-3 font-medium">{enrollment.courseId}</td>
                      <td className="p-3">
                        {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="p-3">
                        R${enrollment.pricePaid || 0}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          enrollment.emailSent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {enrollment.emailSent ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {enrollments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500">
                        No enrollments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
