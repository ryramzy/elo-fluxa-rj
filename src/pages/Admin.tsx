import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { 
  getAllUsers, 
  getAllBookings, 
  updateBookingStatus, 
  getAllEnrollments,
  createTimeSlot,
  getAvailableSlots,
  updateUserPlan
} from '../lib/firestore';
import { courses } from '../data/courses';
import { writeBatch, doc, collection, setDoc, updateDoc, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firestore';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminGuard();
  const navigate = useNavigate();
  
  useDocumentTitle('Admin Dashboard');
  
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('09:00');
  const [newSlotDuration, setNewSlotDuration] = useState(60);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);

  // Delete slot function
  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;
    
    try {
      await deleteDoc(doc(db, 'slots', slotId));
      loadData(); // Reload slots
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Erro ao excluir horário. Tente novamente.');
    }
  };

  // Time options for 15-minute intervals
  const timeOptions = [
    '07:00', '07:15', '07:30', '07:45',
    '08:00', '08:15', '08:30', '08:45',
    '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45',
    '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45',
    '13:00', '13:15', '13:30', '13:45',
    '14:00', '14:15', '14:30', '14:45',
    '15:00', '15:15', '15:30', '15:45',
    '16:00', '16:15', '16:30', '16:45',
    '17:00', '17:15', '17:30', '17:45',
    '18:00', '18:15', '18:30', '18:45'
  ];
  
  // Lead management state
  const [leads, setLeads] = useState<any[]>([]);
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    whatsapp: '',
    email: '',
    interestedIn: '',
    status: 'new',
    notes: ''
  });
  const [manualRevenue, setManualRevenue] = useState(0);

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadData();
    }
  }, [adminLoading, isAdmin]);

  const loadData = async () => {
    try {
      // Get today's date for slot retrieval
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 2);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];
      
      const [usersData, bookingsData, enrollmentsData, slotsData] = await Promise.all([
        getAllUsers(),
        getAllBookings(),
        getAllEnrollments(),
        getAvailableSlots(today, nextMonthStr)
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
    if (!newSlotDate || !newSlotTime) return;
    
    try {
      // Create slot in new slots collection with TimeSlot schema
      const slotData = {
        date: newSlotDate,
        time: newSlotTime,
        duration: newSlotDuration,
        available: true,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const slotsRef = collection(db, 'slots');
      await addDoc(slotsRef, slotData);
      
      setNewSlotDate('');
      setNewSlotTime('09:00');
      setNewSlotDuration(60);
      setShowAddSlot(false);
      loadData(); // Reload slots
    } catch (error) {
      console.error('Error adding slot:', error);
    }
  };

  // Generate weekly schedule for next 4 weeks
  const handleGenerateWeeklySchedule = async () => {
    setGeneratingSchedule(true);
    
    try {
      // Generate time slots from 8:00 AM to 9:00 PM for each weekday
      const generateDailySlots = () => {
        const slots = [];
        for (let hour = 8; hour <= 21; hour++) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
      };

      const weeklySchedule = {
        Monday: generateDailySlots(),
        Tuesday: generateDailySlots(),
        Wednesday: generateDailySlots(),
        Thursday: generateDailySlots(),
        Friday: generateDailySlots(),
        Saturday: generateDailySlots(),
        Sunday: [] // No slots on Sunday
      };

      const today = new Date();
      const slotsToCreate = [];
      
      // Generate slots for next 30 days starting from today
      for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ...
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dayOfWeek];
        
        if (weeklySchedule[dayName as keyof typeof weeklySchedule]) {
          const times = weeklySchedule[dayName as keyof typeof weeklySchedule];
            
            for (const time of times) {
            slotsToCreate.push({
              date: dateStr,
              time,
              duration: 60,
              available: true,
              status: 'available',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }

      // Check for existing slots and avoid duplicates
      const slotsRef = collection(db, 'slots');
      let createdCount = 0;
      
      for (const slot of slotsToCreate) {
        // Check if slot already exists
        const existingQuery = query(
          slotsRef,
          where('date', '==', slot.date),
          where('time', '==', slot.time)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (existingSnapshot.empty) {
          await addDoc(slotsRef, slot);
          createdCount++;
        }
      }
      
      console.log(`✓ ${createdCount} slots criados`);
      alert(`✓ ${createdCount} slots criados com sucesso!`);
      loadData(); // Reload slots
      
    } catch (error) {
      console.error('Error generating weekly schedule:', error);
      alert('Erro ao gerar agenda semanal. Tente novamente.');
    } finally {
      setGeneratingSchedule(false);
    }
  };

  // Add 24-hour sample slots for testing
  const handleAddSampleSlots = async () => {
    const today = new Date().toISOString().split('T')[0];
    const sampleSlots = [];
    
    // Add every hour from 00:00 to 23:00 for today
    for (let hour = 0; hour < 24; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      sampleSlots.push({
        date: today,
        time,
        duration: 60
      });
    }
    
    // Add a few slots for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    ['09:00', '14:00', '16:00', '20:00'].forEach(time => {
      sampleSlots.push({
        date: tomorrowStr,
        time,
        duration: 60
      });
    });

    try {
      console.log('Adding 24-hour sample slots...');
      for (const slot of sampleSlots) {
        const slotData = {
          date: slot.date,
          time: slot.time,
          duration: slot.duration,
          available: true,
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const slotsRef = collection(db, 'slots');
        await addDoc(slotsRef, slotData);
      }
      console.log('24-hour sample slots added successfully!');
      loadData(); // Reload slots
    } catch (error) {
      console.error('Error adding sample slots:', error);
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
  };

  const handlePlanUpgrade = async (userId: string, newPlan: 'free' | 'pro' | 'elite') => {
    if (!window.confirm(`Upgrade student to ${newPlan.toUpperCase()}?`)) return;
    
    try {
      await updateUserPlan(userId, newPlan);
      
      // Log the plan change
      const planHistoryRef = doc(collection(db, 'users', userId, 'planHistory'), new Date().toISOString());
      await setDoc(planHistoryRef, {
        fromPlan: users.find(u => u.uid === userId)?.plan || 'free',
        toPlan: newPlan,
        changedAt: new Date(),
        changedBy: 'admin'
      });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.uid === userId ? { ...user, plan: newPlan } : user
      ));
      
      // Show success message (would integrate with toast system)
      alert(`Student upgraded to ${newPlan.toUpperCase()}`);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Error upgrading plan');
    }
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.whatsapp || !newLead.interestedIn) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const leadId = new Date().toISOString();
      const leadRef = doc(db, 'leads', leadId);
      
      await setDoc(leadRef, {
        ...newLead,
        createdAt: new Date(),
        convertedAt: null,
        revenue: null
      });

      setLeads(prev => [...prev, { ...newLead, id: leadId, createdAt: new Date() }]);
      setNewLead({
        name: '',
        whatsapp: '',
        email: '',
        interestedIn: '',
        status: 'new',
        notes: ''
      });
      setShowAddLead(false);
      
      alert('Lead added successfully!');
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Error adding lead');
    }
  };

  const handleLeadStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, { 
        status: newStatus,
        convertedAt: newStatus === 'converted' ? new Date() : null
      });
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus, convertedAt: newStatus === 'converted' ? new Date() : lead.convertedAt } : lead
      ));
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Error updating lead status');
    }
  };

  const handleConvertLead = async (leadId: string) => {
    const revenue = prompt('Enter revenue amount (R$):');
    if (!revenue || isNaN(Number(revenue))) return;
    
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, {
        status: 'converted',
        convertedAt: new Date(),
        revenue: Number(revenue)
      });
      
      // Update manual revenue total
      const adminSettingsRef = doc(db, 'adminSettings', 'revenue');
      await setDoc(adminSettingsRef, {
        totalManualRevenue: manualRevenue + Number(revenue),
        lastUpdated: new Date()
      }, { merge: true });
      
      setManualRevenue(prev => prev + Number(revenue));
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: 'converted', convertedAt: new Date(), revenue: Number(revenue) } : lead
      ));
      
      alert(`Lead converted! Revenue: R$${revenue}`);
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Error converting lead');
    }
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
            <span className="text-2xl font-serif font-bold">Elo! - Admin</span>
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

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Manual Revenue</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-slate-900">R${manualRevenue}</p>
                  <button
                    onClick={() => {
                      const amount = prompt('Update manual revenue (R$):');
                      if (amount && !isNaN(Number(amount))) {
                        setManualRevenue(Number(amount));
                      }
                    }}
                    className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">R$</span>
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.plan === 'elite' ? 'bg-purple-100 text-purple-700' :
                    user.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {user.plan || 'free'}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-3">
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
                
                {/* Quick Plan Upgrade */}
                <div className="mb-3">
                  <label className="text-xs text-slate-600 block mb-1">Quick Upgrade:</label>
                  <select
                    value={user.plan || 'free'}
                    onChange={(e) => handlePlanUpgrade(user.uid, e.target.value as 'free' | 'pro' | 'elite')}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/students/${user.uid}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2.5 - LEAD TRACKER */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Lead Tracker</h3>
              <p className="text-sm text-slate-600">
                {leads.filter(l => l.status === 'converted').length} of {leads.length} leads converted ({Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) || 0}%)
              </p>
            </div>
            <button
              onClick={() => setShowAddLead(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Add Lead
            </button>
          </div>

          {/* Add Lead Form */}
          {showAddLead && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-slate-900 mb-3">Add New Lead</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name *"
                  value={newLead.name}
                  onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="WhatsApp *"
                  value={newLead.whatsapp}
                  onChange={(e) => setNewLead(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newLead.email}
                  onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                />
                <select
                  value={newLead.interestedIn}
                  onChange={(e) => setNewLead(prev => ({ ...prev, interestedIn: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Course *</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Notes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 md:col-span-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddLead}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Add Lead
                </button>
                <button
                  onClick={() => setShowAddLead(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Lead Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <div key={lead.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-slate-900">{lead.name}</h4>
                    <p className="text-sm text-slate-600">{lead.whatsapp}</p>
                    {lead.email && <p className="text-sm text-slate-600">{lead.email}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                    lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                    lead.status === 'lost' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {lead.status}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-slate-600 mb-1">Interested in:</p>
                  <p className="text-sm font-medium text-slate-900">
                    {courses.find(c => c.id === lead.interestedIn)?.title || lead.interestedIn}
                  </p>
                </div>

                {lead.notes && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-600 mb-1">Notes:</p>
                    <p className="text-sm text-slate-700">{lead.notes}</p>
                  </div>
                )}

                {lead.revenue && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-600 mb-1">Revenue:</p>
                    <p className="text-sm font-medium text-green-700">R${lead.revenue}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleLeadStatusUpdate(lead.id, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="lost">Lost</option>
                    <option value="converted">Converted</option>
                  </select>
                  
                  {lead.status !== 'converted' && (
                    <button
                      onClick={() => handleConvertLead(lead.id)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Convert
                    </button>
                  )}
                </div>
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
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setShowAddSlot(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Available Slot
              </button>
              <button
                onClick={handleGenerateWeeklySchedule}
                disabled={generatingSchedule}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {generatingSchedule ? 'Gerando...' : 'Gerar Semana Padrão'}
              </button>
              <button
                onClick={handleAddSampleSlots}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Add Sample Slots (Testing)
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export CSV
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
                    type="date"
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded focus:outline-none focus:border-blue-500"
                    placeholder="Date"
                  />
                  <select
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded focus:outline-none focus:border-blue-500"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  <select
                    value={newSlotDuration}
                    onChange={(e) => setNewSlotDuration(Number(e.target.value))}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
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

        {/* SECTION 5 - MANAGE SLOTS */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Horários desta semana</h3>
          
          {availableSlots.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>Nenhum horário encontrado para esta semana.</p>
              <p className="text-sm mt-2">Use "Gerar Semana Padrão" para criar horários automaticamente.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableSlots.map((slot) => (
                <div key={slot.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  slot.available ? 'border-slate-200 bg-white' : 'border-slate-300 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      slot.available ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium text-slate-900">
                        {slot.date} às {slot.time}
                      </div>
                      <div className="text-sm text-slate-600">
                        {slot.duration} min • {slot.available ? 'Disponível' : `Reservado por ${slot.bookedByName || 'Aluno'}`}
                      </div>
                    </div>
                  </div>
                  {slot.available && (
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir horário"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Admin;
