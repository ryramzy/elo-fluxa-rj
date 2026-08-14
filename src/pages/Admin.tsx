import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firestore';
import { useToast } from '../hooks/useToast';
import { BookingFeedbackModal } from '../components/BookingFeedbackModal';
import { setAdminViewMode } from '../utils/adminView';
import { TutorManagementPanel } from '../components/admin/TutorManagementPanel';

interface Booking {
  id: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  userEmail?: string;
  status: string;
  createdAt?: any;
  uid?: string;
  tutorNotes?: {
    pronunciation: string;
    vocabulary: string;
    homework: string;
    summary?: string;
    studentRating?: number;
    nextGoal?: string;
    attendance?: 'present' | 'absent';
    submittedAt: any;
  };
}

interface User {
  uid: string;
  displayName: string;
  email: string;
  plan: 'free' | 'pro' | 'elite' | 'corporate';
  createdAt: any;
  lastActiveDate?: any;
  streakDays?: number;
  phone?: string;
  xp?: number;
  organizationId?: string;
  corporateCredits?: number;
  paymentPastDue?: boolean;
}

// Admin is always controlled via the setAdminViewMode event bus
interface AdminProps {}

const TimezoneSyncPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [bookingsToMigrate, setBookingsToMigrate] = useState<any[]>([]);
  const [backupData, setBackupData] = useState<any[] | null>(null);
  const [status, setStatus] = useState<string>('');

  const loadBookings = async () => {
    setLoading(true);
    setLogs([]);
    try {
      const snap = await getDocs(collection(db, 'bookings'));
      const list: any[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      setBookingsToMigrate(list);
      setBackupData(list);
      setStatus(`Loaded ${list.length} bookings.`);
    } catch (error: any) {
      setStatus(`Error loading bookings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const downloadBackup = async () => {
    setLoading(true);
    setStatus('Iniciando backup completo (bookings, slots, availableSlots)...');
    try {
      const [bookingsSnap, slotsSnap, availableSlotsSnap] = await Promise.all([
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'slots')),
        getDocs(collection(db, 'availableSlots'))
      ]);

      const bookingsList: any[] = [];
      bookingsSnap.forEach(d => bookingsList.push({ id: d.id, ...d.data() }));

      const slotsList: any[] = [];
      slotsSnap.forEach(d => slotsList.push({ id: d.id, ...d.data() }));

      const availableSlotsList: any[] = [];
      availableSlotsSnap.forEach(d => availableSlotsList.push({ id: d.id, ...d.data() }));

      const fullBackup = {
        bookings: bookingsList,
        slots: slotsList,
        availableSlots: availableSlotsList,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `elo_full_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus(`Backup completo baixado com sucesso! (${bookingsList.length} reservas, ${slotsList.length} slots, ${availableSlotsList.length} slots disponíveis)`);
    } catch (error: any) {
      setStatus(`Erro ao gerar backup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    setLoading(true);
    const runLogs: string[] = [];
    const isDry = dryRun;
    
    runLogs.push(`Starting timezone migration. Mode: ${isDry ? 'DRY RUN' : 'WRITE MODE'}`);
    setLogs([...runLogs]);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const booking of bookingsToMigrate) {
      const { id, date, time } = booking;
      if (!date || !time) {
        runLogs.push(`⚠️ Warning: Booking ${id} is missing date or time. Skipped.`);
        skippedCount++;
        setLogs([...runLogs]);
        continue;
      }

      try {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day, hour + 3, minute));
        const datetimeTimestamp = Timestamp.fromDate(utcDate);

        runLogs.push(`[${id}]: ${date} ${time} (Rio) -> ${utcDate.toISOString()} (UTC)`);
        setLogs([...runLogs]);

        if (!isDry) {
          await updateDoc(doc(db, 'bookings', id), {
            datetime: datetimeTimestamp
          });
        }
        updatedCount++;
      } catch (err: any) {
        runLogs.push(`❌ Error migrating booking ${id}: ${err.message}`);
        errorCount++;
        setLogs([...runLogs]);
      }
    }

    runLogs.push(`\n--- Summary ---`);
    runLogs.push(`Mode: ${isDry ? 'DRY RUN' : 'WRITE MODE'}`);
    runLogs.push(`Success: ${updatedCount}`);
    runLogs.push(`Skipped: ${skippedCount}`);
    runLogs.push(`Errors: ${errorCount}`);
    setLogs([...runLogs]);
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Timezone Synchronization Tool
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        This tool migrates legacy booking documents in Firestore to include an absolute UTC timestamp (<code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-red-500 font-mono">datetime</code>).
        All conversions are based on Matt's timezone (<code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-blue-500 font-mono">America/Sao_Paulo</code> / UTC-3).
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button
          onClick={loadBookings}
          disabled={loading}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          Refresh Data
        </button>

        {backupData && backupData.length > 0 && (
          <button
            onClick={downloadBackup}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Download Local Backup (.json)
          </button>
        )}

        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              disabled={loading}
              className="rounded text-blue-500"
            />
            Dry Run Mode (Simulate)
          </label>
        </div>

        <button
          onClick={handleMigrate}
          disabled={loading || bookingsToMigrate.length === 0}
          className={`px-6 py-2 rounded-lg font-medium text-white transition-all ${
            dryRun
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
          } disabled:opacity-50`}
        >
          {dryRun ? 'Simulate Migration' : 'Run Live Migration'}
        </button>
      </div>

      <div className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
        Status: {status || (loading ? 'Loading...' : 'Ready')}
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        <div className="px-4 py-2 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Migration Logs
        </div>
        <div className="p-4 h-72 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 space-y-1">
          {logs.length === 0 ? (
            <div className="text-slate-400 italic">No logs generated. Click 'Simulate' or 'Run Live' to start.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Admin: React.FC<AdminProps> = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminGuard();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  useDocumentTitle('Admin - Student Bookings');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [activeTab, setActiveTab] = useState<'bookings' | 'users' | 'revenue' | 'crm' | 'enrollments' | 'b2b' | 'tutors' | 'utilities' | 'analytics'>('bookings');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState<Booking | null>(null);
  const [cacInput, setCacInput] = useState<number>(30);

  const [tutorOnline, setTutorOnline] = useState(false);
  const [tutorPresenceLoading, setTutorPresenceLoading] = useState(false);

  const loadTutorPresence = async () => {
    try {
      const docRef = doc(db, 'settings', 'tutor_presence');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTutorOnline(docSnap.data().isOnline || false);
      }
    } catch (error) {
      console.error('Error loading tutor presence:', error);
    }
  };

  const toggleTutorPresence = async () => {
    setTutorPresenceLoading(true);
    const nextState = !tutorOnline;
    try {
      const docRef = doc(db, 'settings', 'tutor_presence');
      await setDoc(docRef, {
        isOnline: nextState,
        updatedAt: new Date()
      }, { merge: true });
      setTutorOnline(nextState);
      showToast({ type: 'success', message: `Status de Matt atualizado para: ${nextState ? 'ONLINE' : 'OFFLINE'}` });
    } catch (error: any) {
      console.error('Error updating tutor presence:', error);
      alert('Failed to update tutor status: ' + error.message);
    } finally {
      setTutorPresenceLoading(false);
    }
  };

  // Analytics states
  const [cancellations, setCancellations] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [availableSlotsCount, setAvailableSlotsCount] = useState(0);

  const loadAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const [cancellationsSnap, availableSlotsSnap] = await Promise.all([
        getDocs(collection(db, 'booking_cancellations')),
        getDocs(collection(db, 'availableSlots'))
      ]);

      const cancellationsList: any[] = [];
      cancellationsSnap.forEach(d => cancellationsList.push({ id: d.id, ...d.data() }));
      setCancellations(cancellationsList);
      
      setAvailableSlotsCount(availableSlotsSnap.size);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalyticsData();
    }
  }, [activeTab]);

  useEffect(() => {
    loadTutorPresence();
  }, []);

  // B2B states
  const [selectedUserUid, setSelectedUserUid] = useState('');
  const [targetOrgId, setTargetOrgId] = useState('');
  const [targetCredits, setTargetCredits] = useState('0');
  const [savingB2b, setSavingB2b] = useState(false);

  // Helper to format a timestamp/date to Rio strings
  const getMattStringsFromTimestamp = (timestamp: any) => {
    if (!timestamp) return null;
    const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(dateObj);
    
    const partMap: Record<string, string> = {};
    parts.forEach(p => {
      partMap[p.type] = p.value;
    });
    
    return {
      date: `${partMap.year}-${partMap.month}-${partMap.day}`,
      time: `${partMap.hour}:${partMap.minute}`
    };
  };

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
      
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(date);
      
      const partMap: Record<string, string> = {};
      parts.forEach(p => {
        partMap[p.type] = p.value;
      });
      
      weekDates.push(`${partMap.year}-${partMap.month}-${partMap.day}`);
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
      const bookingsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let date = data.date;
        let time = data.time;
        if (data.datetime) {
          const mattStrings = getMattStringsFromTimestamp(data.datetime);
          if (mattStrings) {
            date = mattStrings.date;
            time = mattStrings.time;
          }
        }
        return {
          id: doc.id,
          ...data,
          date,
          time
        } as Booking;
      });
      
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
      const usersQuery = query(collection(db, 'users'));
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
      
      // Sort in-memory by createdAt descending
      usersData.sort((a, b) => {
        const timeA = a.createdAt?.seconds 
          ? a.createdAt.seconds * 1000 
          : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.seconds 
          ? b.createdAt.seconds * 1000 
          : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Save B2B allocations
  const handleSaveB2b = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserUid) {
      alert('Please select a student.');
      return;
    }
    setSavingB2b(true);
    try {
      const orgIdClean = targetOrgId.trim();
      await updateDoc(doc(db, 'users', selectedUserUid), {
        organizationId: orgIdClean || null,
        corporateCredits: Number(targetCredits),
        plan: orgIdClean ? 'corporate' : 'free'
      });
      alert('B2B attributes updated successfully!');
      setSelectedUserUid('');
      setTargetOrgId('');
      setTargetCredits('0');
      // Reload users list
      loadUsers();
    } catch (error: any) {
      alert(`Error updating B2B settings: ${error.message}`);
    } finally {
      setSavingB2b(false);
    }
  };

  // Upgrade user plan
  const upgradeUserPlan = async (userId: string, newPlan: 'free' | 'pro' | 'elite') => {
    if (!confirm(`Upgrade user to ${newPlan.toUpperCase()}?`)) return;
    
    const limit = newPlan === 'elite' ? 12 : newPlan === 'pro' ? 4 : 0;
    try {
      await updateDoc(doc(db, 'users', userId), {
        plan: newPlan,
        bookingLimit: limit,
        planUpdatedAt: new Date()
      });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.uid === userId ? { ...user, plan: newPlan, bookingLimit: limit } : user
      ));
      
      showToast({ type: 'success', message: `Plano atualizado para ${newPlan.toUpperCase()}` });
    } catch (error) {
      console.error('Error upgrading user:', error);
      showToast({ type: 'error', message: 'Erro ao atualizar plano' });
    }
  };

  const togglePaymentPastDue = async (userId: string, currentPastDue: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        paymentPastDue: !currentPastDue
      });
      setUsers(prev => prev.map(user => 
        user.uid === userId ? { ...user, paymentPastDue: !currentPastDue } : user
      ));
      showToast({ type: 'success', message: 'Status de pagamento atualizado com sucesso!' });
    } catch (error) {
      console.error('Error toggling past due:', error);
      showToast({ type: 'error', message: 'Erro ao atualizar status de pagamento' });
    }
  };

  // Save edited phone number
  const handlePhoneSave = async (userId: string, newPhone: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        phone: newPhone
      });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, phone: newPhone } : u));
      showToast({ type: 'success', message: 'Telefone atualizado com sucesso!' });
    } catch (error) {
      console.error('Error saving phone number:', error);
      showToast({ type: 'error', message: 'Erro ao salvar o telefone.' });
    }
  };

  // Determine low engagement (no activity in 5 days)
  const isInactive = (student: User) => {
    if (!student.lastActiveDate) return true;
    const lastActive = student.lastActiveDate.toDate ? student.lastActiveDate.toDate() : new Date(student.lastActiveDate);
    const diffTime = Math.abs(new Date().getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 5;
  };

  // Prefilled WhatsApp nudge link
  const getWhatsAppLink = (student: User) => {
    if (!student.phone) return '';
    const cleanPhone = student.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const message = `Oi ${student.displayName}, tudo bem? Notei que você ficou sem praticar no Elo esta semana. Vamos agendar nossa próxima aula de conversação?`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  // WhatsApp contact
  const openWhatsApp = (phone: string, message: string) => {
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Revenue calculations
  const calculateRevenue = () => {
    const paidUsers = users.filter(u => u.plan && u.plan !== 'free');
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
    }
  }, [isAdmin, selectedWeek]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadEnrollments();
    }
  }, [isAdmin]);

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
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Presence Toggler */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className={`w-3 h-3 rounded-full ${tutorOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-650'}`}></span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Matt Online</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Chamadas Instantâneas</span>
              </div>
              <button
                disabled={tutorPresenceLoading}
                onClick={toggleTutorPresence}
                className={`ml-2 px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide transition-all border ${tutorOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-700 dark:hover:bg-slate-800'}`}
              >
                {tutorPresenceLoading ? '...' : tutorOnline ? 'Offline' : 'Online'}
              </button>
            </div>

            <button
              onClick={() => {
                setAdminViewMode(false);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold uppercase tracking-wider text-xs px-5 py-3 rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>🎓</span> Visualizar como Aluno
            </button>
          </div>
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
              onClick={() => setActiveTab('crm')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'crm'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              💼 Pipeline CRM
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
            <button
              onClick={() => setActiveTab('b2b')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'b2b'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              B2B Partnerships
            </button>
            <button
              onClick={() => setActiveTab('utilities')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'utilities'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Timezone Sync
            </button>
            <button
              onClick={() => setActiveTab('tutors')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'tutors'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              📹 Tutores & Zoom
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              📊 Analytics
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
                      const isPast = new Date(`${date}T${time}:00-03:00`) < new Date();
                      
                      return (
                        <div key={`${date}-${time}`} className="p-1">
                          {booking ? (
                            <div 
                              onClick={() => setSelectedBookingForFeedback(booking)}
                              className={`w-full h-12 rounded-lg text-xs font-medium p-2 cursor-pointer hover:shadow transition-shadow ${
                                isPast
                                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                  : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              <div className="font-semibold truncate flex items-center justify-between">
                                <span>{booking.userName || 'Booked'}</span>
                                {booking.tutorNotes && <span className="text-[10px]" title="Feedback preenchido">📝</span>}
                              </div>
                              <div className="text-[10px] opacity-75 truncate">
                                {booking.userEmail}
                              </div>
                              {!isPast && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBooking(booking.id);
                                  }}
                                  className="mt-1 text-[9px] bg-red-500 text-white px-1 py-0.5 rounded hover:bg-red-600 transition-colors"
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
              User Management (CRM)
            </h2>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-3">Student</th>
                    <th className="text-left p-3">Plan</th>
                    <th className="text-left p-3">Streak & XP</th>
                    <th className="text-left p-3">Last Active</th>
                    <th className="text-left p-3">Phone (WhatsApp)</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter((user) => {
                      const query = searchQuery.toLowerCase().trim();
                      if (!query) return true;
                      return (
                        user.displayName?.toLowerCase().includes(query) ||
                        user.email?.toLowerCase().includes(query) ||
                        user.phone?.includes(query)
                      );
                    })
                    .map((user) => (
                    <tr key={user.uid} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          {user.displayName}
                          {isInactive(user) && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse">
                              ⚠️ Inativo
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (user.plan || 'free') === 'elite' ? 'bg-orange-100 text-orange-800' :
                          (user.plan || 'free') === 'pro' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {(user.plan || 'free').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-xs font-semibold">{user.streakDays || 0} 🔥</div>
                        <div className="text-xs text-slate-500">{user.xp || 0} XP</div>
                      </td>
                      <td className="p-3 text-xs">
                        {user.lastActiveDate ? (
                          new Date(user.lastActiveDate.toDate ? user.lastActiveDate.toDate() : user.lastActiveDate).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          <span className="text-slate-400">Nunca ativo</span>
                        )}
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={user.phone || ''}
                          onBlur={(e) => handlePhoneSave(user.uid, e.target.value)}
                          placeholder="(21) 99999-9999"
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1 px-2 text-xs w-36 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => upgradeUserPlan(user.uid, 'pro')}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                          >
                            Pro
                          </button>
                          <button
                            onClick={() => upgradeUserPlan(user.uid, 'elite')}
                            className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                          >
                            Elite
                          </button>
                          {user.phone ? (
                            <a
                              href={getWhatsAppLink(user)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors inline-flex items-center gap-1"
                            >
                              WhatsApp
                            </a>
                          ) : (
                            <button
                              disabled
                              title="Telefone não cadastrado"
                              className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 text-xs rounded cursor-not-allowed"
                            >
                              WhatsApp
                            </button>
                          )}
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
                    <span>{users.filter(u => !u.plan || u.plan === 'free').length}</span>
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

        {activeTab === 'b2b' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
              B2B Partnerships & Corporate Allocations
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Organization Summary */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                    Active B2B Tenants
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                          <th className="pb-3">Organization ID</th>
                          <th className="pb-3 text-center">Employees</th>
                          <th className="pb-3 text-center">Total Credits</th>
                          <th className="pb-3 text-center">Total XP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const orgSummary: Record<string, { count: number; credits: number; xp: number }> = {};
                          users.forEach(u => {
                            if (u.organizationId) {
                              const org = u.organizationId.toLowerCase();
                              if (!orgSummary[org]) {
                                orgSummary[org] = { count: 0, credits: 0, xp: 0 };
                              }
                              orgSummary[org].count += 1;
                              orgSummary[org].credits += (u.corporateCredits || 0);
                              orgSummary[org].xp += (u.xp || 0);
                            }
                          });

                          const summaries = Object.entries(orgSummary);
                          if (summaries.length === 0) {
                            return (
                              <tr>
                                <td colSpan={4} className="py-4 text-center text-slate-500 dark:text-slate-450">
                                  No active B2B corporate profiles detected.
                                </td>
                              </tr>
                            );
                          }

                          return summaries.map(([orgName, stats]) => (
                            <tr key={orgName} className="border-b border-slate-105 dark:border-slate-800 text-slate-700 dark:text-slate-350">
                              <td className="py-3 font-mono font-bold uppercase text-blue-500">{orgName}</td>
                              <td className="py-3 text-center">{stats.count}</td>
                              <td className="py-3 text-center">{stats.credits}</td>
                              <td className="py-3 text-center">{stats.xp} XP</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* List of Corporate Users */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                    Corporate Employees Directory
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                          <th className="pb-3">Name</th>
                          <th className="pb-3">Organization</th>
                          <th className="pb-3 text-center">Streak</th>
                          <th className="pb-3 text-center">XP</th>
                          <th className="pb-3 text-center">Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => u.organizationId).map(u => (
                          <tr key={u.uid} className="border-b border-slate-105 dark:border-slate-800 text-slate-700 dark:text-slate-350">
                            <td className="py-3 font-semibold">
                              {u.displayName || u.email.split('@')[0]}
                              <div className="text-[10px] text-slate-450 dark:text-slate-500 font-normal">{u.email}</div>
                            </td>
                            <td className="py-3 font-mono uppercase text-xs text-slate-500 dark:text-slate-400">{u.organizationId}</td>
                            <td className="py-3 text-center">🔥 {u.streakDays || 0}d</td>
                            <td className="py-3 text-center">{u.xp || 0}</td>
                            <td className="py-3 text-center">{u.corporateCredits ?? 0}</td>
                          </tr>
                        ))}
                        {users.filter(u => u.organizationId).length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-slate-500 dark:text-slate-450">
                              No corporate employees mapped yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Allocation Form */}
              <div className="bg-slate-550 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 h-fit">
                <h3 className="text-sm font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-4">
                  Modify Corporate Settings
                </h3>
                
                <form onSubmit={handleSaveB2b} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Select Student
                    </label>
                    <select
                      value={selectedUserUid}
                      onChange={(e) => {
                        setSelectedUserUid(e.target.value);
                        const match = users.find(u => u.uid === e.target.value);
                        if (match) {
                          setTargetOrgId(match.organizationId || '');
                          setTargetCredits(String(match.corporateCredits || 0));
                        } else {
                          setTargetOrgId('');
                          setTargetCredits('0');
                        }
                      }}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:text-white"
                    >
                      <option value="">-- Choose student --</option>
                      {users.map(u => (
                        <option key={u.uid} value={u.uid}>
                          {u.displayName || u.email} ({u.organizationId ? `Org: ${u.organizationId.toUpperCase()}` : 'No Org'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Organization ID (Domain Filter)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. gas-corp, tech-hub"
                      value={targetOrgId}
                      onChange={(e) => setTargetOrgId(e.target.value)}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Prepaid Tutor Credits
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={targetCredits}
                      onChange={(e) => setTargetCredits(e.target.value)}
                      className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingB2b || !selectedUserUid}
                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingB2b ? 'Updating...' : 'Save Settings'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'utilities' && (
          <TimezoneSyncPanel />
        )}

        {activeTab === 'tutors' && (
          <TutorManagementPanel />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 mb-6">
            {loadingAnalytics ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Carregando métricas de agendamento...</p>
              </div>
            ) : (() => {
              const totalCreated = bookings.length + availableSlotsCount;
              const utilizationRate = totalCreated > 0 ? Math.round((bookings.length / totalCreated) * 100) : 0;
              const totalSessionsRecorded = bookings.length + cancellations.length;
              const cancellationRatio = totalSessionsRecorded > 0 ? Math.round((cancellations.length / totalSessionsRecorded) * 100) : 0;

              const hourCounts: Record<string, number> = {};
              bookings.forEach(b => {
                if (b.time) {
                  const hour = b.time.slice(0, 5);
                  hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                }
              });
              const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
              const maxHourCount = sortedHours.length > 0 ? sortedHours[0][1] : 1;

              const earlyCancels = cancellations.filter(c => c.cancellationType === 'early').length;
              const lateCancels = cancellations.filter(c => c.cancellationType === 'late').length;
              const earlyCancelPercent = cancellations.length > 0 ? Math.round((earlyCancels / cancellations.length) * 100) : 0;
              const lateCancelPercent = cancellations.length > 0 ? Math.round((lateCancels / cancellations.length) * 100) : 0;

              const orgCancelCounts: Record<string, number> = {};
              cancellations.forEach(c => {
                const org = c.organizationId || 'Pessoa Física / B2C';
                orgCancelCounts[org] = (orgCancelCounts[org] || 0) + 1;
              });
              const sortedOrgs = Object.entries(orgCancelCounts).sort((a, b) => b[1] - a[1]);

              return (
                <>
                  {/* Metrics Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Utilization Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Utilização dos Horários</h3>
                      
                      {/* Ring Chart */}
                      <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-emerald-500" strokeWidth="6" fill="transparent"
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40 * (1 - (totalCreated > 0 ? (bookings.length / totalCreated) : 0))}
                          />
                        </svg>
                        <span className="absolute text-xl font-extrabold text-slate-900 dark:text-white font-serif">{utilizationRate}%</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                        <strong>{bookings.length}</strong> de <strong>{totalCreated}</strong> slots reservados
                      </p>
                    </div>

                    {/* Total Booked Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Aulas Agendadas</h3>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wide">Status: Ativas / Confirmadas</p>
                      </div>
                      <div className="my-3">
                        <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-serif">{bookings.length}</span>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-450 border-t border-slate-100 dark:border-slate-750 pt-2">
                        Contando reservas ativas nas próximas semanas.
                      </p>
                    </div>

                    {/* Cancellations Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Cancelamentos</h3>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wide">Métrica de Reserva</p>
                      </div>
                      <div className="my-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-red-500 font-serif">{cancellations.length}</span>
                        <span className="text-[10px] font-bold text-slate-400">({cancellationRatio}% taxa)</span>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-450 border-t border-slate-100 dark:border-slate-750 pt-2">
                        Total de reservas canceladas via painel do aluno.
                      </p>
                    </div>

                    {/* Next Availability Slot Count */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Slots Livres</h3>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wide">Disponíveis na Agenda</p>
                      </div>
                      <div className="my-3">
                        <span className="text-3xl font-extrabold text-purple-650 dark:text-purple-400 font-serif">{availableSlotsCount}</span>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-450 border-t border-slate-100 dark:border-slate-750 pt-2">
                        Horários disponíveis aguardando agendamento.
                      </p>
                    </div>
                  </div>

                  {/* Popular Hours and Cancellation Breakdown Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Peak Booking Hours */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-750 pb-3">
                        Horários de Pico de Agendamento
                      </h3>
                      {sortedHours.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-12">Nenhum dado de horário registrado.</p>
                      ) : (
                        <div className="space-y-4">
                          {sortedHours.map(([hour, count]) => {
                            const widthPercent = Math.round((count / maxHourCount) * 100);
                            return (
                              <div key={hour} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  <span>{hour}h</span>
                                  <span>{count} reserva{count > 1 ? 's' : ''}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{ width: `${widthPercent}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Cancellation Ratios */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-750 pb-3">
                          Relação de Cancelamento
                        </h3>
                        
                        <div className="space-y-6">
                          {/* Early Cancellation */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-emerald-500">Early (&ge; 24h - Reembolsado)</span>
                              <span className="text-slate-700 dark:text-slate-350">{earlyCancels} ({earlyCancelPercent}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${earlyCancelPercent}%` }}></div>
                            </div>
                          </div>

                          {/* Late Cancellation */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-red-500">Late (&lt; 24h - Sem Reembolso)</span>
                              <span className="text-slate-700 dark:text-slate-350">{lateCancels} ({lateCancelPercent}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${lateCancelPercent}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700/50 space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Distribuição por Parceria (B2B)</h4>
                        {sortedOrgs.length === 0 ? (
                          <p className="text-[10px] text-slate-500">Sem dados corporativos registrados.</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            {sortedOrgs.map(([org, count]) => (
                              <div key={org} className="flex justify-between bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="font-semibold truncate max-w-[120px]">{org}</span>
                                <span className="text-slate-450 font-bold">{count} cancelamento{count > 1 ? 's' : ''}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Cancellations table */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                      Registro Recente de Cancelamentos
                    </h3>
                    {cancellations.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-8">Nenhum registro de cancelamento encontrado.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-750 text-slate-550 font-bold uppercase tracking-wider">
                              <th className="py-3 px-4">Estudante</th>
                              <th className="py-3 px-4">Data do Slot</th>
                              <th className="py-3 px-4">Horário</th>
                              <th className="py-3 px-4">Cancelado Em</th>
                              <th className="py-3 px-4">Tipo</th>
                              <th className="py-3 px-4">Org ID</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-slate-700 dark:text-slate-300">
                            {cancellations.slice(0, 10).map((c) => {
                              const cancelDate = c.cancelledAt?.toDate ? c.cancelledAt.toDate() : new Date(c.cancelledAt);
                              return (
                                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                                    {c.studentName} <span className="block text-[10px] font-normal text-slate-400">{c.studentEmail}</span>
                                  </td>
                                  <td className="py-3 px-4">{c.slotDate}</td>
                                  <td className="py-3 px-4 font-semibold">{c.slotTime}</td>
                                  <td className="py-3 px-4">{cancelDate.toLocaleDateString('pt-BR')} {cancelDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      c.cancellationType === 'early' 
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                        : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                                    }`}>
                                      {c.cancellationType === 'early' ? 'Reembolsado' : 'Sem Reembolso'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-mono text-[10px]">{c.organizationId || '-'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'crm' && (() => {
          // Helper functions to trace user metrics
          const getUserBookings = (userId: string) => {
            return bookings.filter(b => b.userId === userId || b.uid === userId);
          };
          
          const getUserLastBookingDate = (userId: string) => {
            const userBookings = getUserBookings(userId);
            if (userBookings.length === 0) return null;
            const dates = userBookings.map(b => {
              if (b.date) {
                return new Date(b.date).getTime();
              }
              return 0;
            }).filter(d => d > 0);
            if (dates.length === 0) return null;
            return new Date(Math.max(...dates));
          };

          // Categorize users into funnel stages
          const getStage = (u: any) => {
            const isSub = u.plan === 'pro' || u.plan === 'elite' || u.plan === 'corporate' || !!u.organizationId;
            const bookingsCount = getUserBookings(u.uid).length;
            const lastBooking = getUserLastBookingDate(u.uid);
            const isInactive = lastBooking && (Date.now() - lastBooking.getTime() > 14 * 24 * 60 * 60 * 1000);
            
            if (u.paymentPastDue || (isSub && isInactive)) {
              return 'risk';
            }
            if (isSub) {
              return 'subscriber';
            }
            if (bookingsCount > 0) {
              return 'trial';
            }
            return 'lead';
          };

          const leads = users.filter(u => getStage(u) === 'lead');
          const trials = users.filter(u => getStage(u) === 'trial');
          const subscribers = users.filter(u => getStage(u) === 'subscriber');
          const risks = users.filter(u => getStage(u) === 'risk');

          const totalLeadsCount = leads.length;
          const totalTrialsCount = trials.length;
          const totalSubscribersCount = subscribers.length;
          const totalRisksCount = risks.length;
          const totalUsers = users.length;

          // Conversion Rates
          const leadToTrialRate = totalUsers > 0 ? Math.round(((totalTrialsCount + totalSubscribersCount) / totalUsers) * 100) : 0;
          const trialToSubRate = (totalTrialsCount + totalSubscribersCount) > 0 ? Math.round((totalSubscribersCount / (totalTrialsCount + totalSubscribersCount)) * 100) : 0;

          // Churn rate assumption
          const totalPaid = totalSubscribersCount + totalRisksCount;
          const churnRate = totalPaid > 0 ? (totalRisksCount / totalPaid) : 0.05; // default 5%
          
          // LTV calculation
          const avgPrice = 147;
          const estimatedLtv = Math.round(avgPrice / (churnRate > 0 ? churnRate : 0.05));

          // Monthly forecast
          const mrrForecast = (users.filter(u => u.plan === 'pro').length * 97) + (users.filter(u => u.plan === 'elite').length * 197);

          return (
            <div className="space-y-6 mb-6">
              {/* Header metrics card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Pipeline Metrics & LTV Calculator</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-700/55 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase block">MRR Forecast</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-450 mt-1 block">R$ {mrrForecast}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Com base em planos ativos</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/55 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase block">Taxa de Churn</span>
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-450 mt-1 block">{(churnRate * 100).toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Clientes em Risco / Assinantes</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/55 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase block">LTV Estimado</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-450 mt-1 block">R$ {estimatedLtv}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">LTV = Preço Médio (R$147) / Churn</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/55 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase block">CAC Adquirido (R$)</span>
                    <input
                      type="number"
                      value={cacInput}
                      onChange={(e) => setCacInput(Number(e.target.value))}
                      className="text-lg font-black text-slate-800 dark:text-white mt-1 w-20 bg-white dark:bg-slate-850 border border-slate-350 dark:border-slate-650 rounded px-2 block"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">ROI: {(estimatedLtv / (cacInput || 1)).toFixed(1)}x</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Conversão Lead ➡️ Aula de Teste:</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${leadToTrialRate}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-1 block">{leadToTrialRate}% de leads agendaram</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Conversão Aula de Teste ➡️ Assinatura:</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${trialToSubRate}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-1 block">{trialToSubRate}% de conversão pós-aula</span>
                  </div>
                </div>
              </div>

              {/* Kanban board */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Leads Column */}
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead Inicial ({totalLeadsCount})</h4>
                    <span className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">{totalLeadsCount}</span>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                    {leads.map(u => (
                      <div key={u.uid} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-100 dark:border-slate-700 space-y-2">
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{u.displayName || 'Sem Nome'}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-55 dark:border-slate-705">
                          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold">{u.plan || 'free'}</span>
                          <select
                            onChange={(e) => upgradeUserPlan(u.uid, e.target.value as any)}
                            className="text-[9px] bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1 text-slate-700 dark:text-slate-300"
                            value={u.plan || 'free'}
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="elite">Elite</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <div className="text-center py-8 text-[11px] text-slate-400">Nenhum lead nesta fase.</div>
                    )}
                  </div>
                </div>

                {/* Trial Column */}
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider">Fase de Teste ({totalTrialsCount})</h4>
                    <span className="w-5 h-5 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">{totalTrialsCount}</span>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                    {trials.map(u => {
                      const bookingsCount = getUserBookings(u.uid).length;
                      return (
                        <div key={u.uid} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-100 dark:border-slate-700 space-y-2">
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{u.displayName || 'Sem Nome'}</div>
                          <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                          <div className="text-[9px] text-blue-500 font-bold bg-blue-500/5 px-2 py-0.5 rounded inline-block">
                            {bookingsCount} {bookingsCount === 1 ? 'Aula Agendada' : 'Aulas Agendadas'}
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-55 dark:border-slate-705">
                            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold">{u.plan || 'free'}</span>
                            <select
                              onChange={(e) => upgradeUserPlan(u.uid, e.target.value as any)}
                              className="text-[9px] bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1 text-slate-700 dark:text-slate-300"
                              value={u.plan || 'free'}
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                              <option value="elite">Elite</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                    {trials.length === 0 && (
                      <div className="text-center py-8 text-[11px] text-slate-400">Nenhum estudante em trial.</div>
                    )}
                  </div>
                </div>

                {/* Subscribers Column */}
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Assinante Ativo ({totalSubscribersCount})</h4>
                    <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{totalSubscribersCount}</span>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                    {subscribers.map(u => {
                      const lastBooking = getUserLastBookingDate(u.uid);
                      return (
                        <div key={u.uid} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-100 dark:border-slate-700 space-y-2">
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{u.displayName || 'Sem Nome'}</div>
                          <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                          {lastBooking && (
                            <div className="text-[9px] text-slate-400">
                              Última aula: {lastBooking.toLocaleDateString('pt-BR')}
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-55 dark:border-slate-705">
                            <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-black ${
                              u.plan === 'elite' ? 'bg-orange-100 text-orange-850' :
                              u.plan === 'pro' ? 'bg-blue-100 text-blue-850' :
                              'bg-emerald-100 text-emerald-850'
                            }`}>{u.plan || 'free'}</span>
                            
                            <button
                              onClick={() => togglePaymentPastDue(u.uid, u.paymentPastDue || false)}
                              className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/25 rounded px-2 py-0.5"
                            >
                              Forçar Atraso
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {subscribers.length === 0 && (
                      <div className="text-center py-8 text-[11px] text-slate-400">Nenhum assinante ativo.</div>
                    )}
                  </div>
                </div>

                {/* Churn Risk Column */}
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider">Risco de Churn ({totalRisksCount})</h4>
                    <span className="w-5 h-5 bg-rose-100 dark:bg-rose-950 rounded-full flex items-center justify-center text-[10px] font-bold text-rose-600 dark:text-rose-400">{totalRisksCount}</span>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                    {risks.map(u => {
                      const lastBooking = getUserLastBookingDate(u.uid);
                      const isPastDue = u.paymentPastDue;
                      return (
                        <div key={u.uid} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-rose-200 dark:border-rose-950/30 space-y-2">
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{u.displayName || 'Sem Nome'}</div>
                          <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                          <div className="flex flex-wrap gap-1">
                            {isPastDue && (
                              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-red-100 text-red-700 rounded border border-red-200 font-semibold">Atraso</span>
                            )}
                            <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-yellow-100 text-yellow-750 rounded border border-yellow-200 font-semibold">Inativo &gt; 14d</span>
                          </div>
                          {lastBooking && (
                            <div className="text-[9px] text-slate-400">
                              Última aula: {lastBooking.toLocaleDateString('pt-BR')}
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-55 dark:border-slate-705">
                            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold">{u.plan || 'free'}</span>
                            
                            <button
                              onClick={() => togglePaymentPastDue(u.uid, u.paymentPastDue || false)}
                              className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/25 rounded px-2 py-0.5"
                            >
                              Regularizar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {risks.length === 0 && (
                      <div className="text-center py-8 text-[11px] text-slate-400">Nenhum cliente em risco.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

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

      {selectedBookingForFeedback && (
        <BookingFeedbackModal
          booking={selectedBookingForFeedback}
          onClose={() => {
            setSelectedBookingForFeedback(null);
            loadWeekBookings(); // Refresh bookings
          }}
        />
      )}
    </div>
  );
};

export default Admin;
