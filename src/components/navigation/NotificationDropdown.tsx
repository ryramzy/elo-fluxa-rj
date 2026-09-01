import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firestore';
import { useAuth } from '../../hooks/useAuth';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { FaBell, FaCheck, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  body?: string;
  message?: string;
  read: boolean;
  actionUrl?: string;
  createdAt: any;
}

export const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isGranted, isRequesting, requestPermission, testNotification, isSupported } = usePushNotifications(user?.uid);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;

    if (user.uid === 'guest_user') {
      setNotifications([
        {
          id: 'guest_welcome',
          title: 'Bem-vindo ao ELO! 👋',
          message: 'Explore os cursos de conversação e agende sua aula particular!',
          read: false,
          createdAt: new Date()
        }
      ]);
      setUnreadCount(1);
      return;
    }

    let unsubscribe: () => void = () => {};

    try {
      const q = query(
        collection(db, 'users', user.uid, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(15)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Notification));
        
        // Trigger browser push notification for new unread items
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              if (!data.read) {
                try {
                  new Notification(data.title || 'ELO! Notificação', {
                    body: data.message || 'Você tem uma nova atualização da sua aula.',
                    icon: '/favicon.ico'
                  });
                } catch (e) {}
              }
            }
          });
        }

        setNotifications(list);
        setUnreadCount(list.filter(n => !n.read).length);
      }, (error) => {
        console.warn('Fallback: query without index:', error);
        // Fallback without orderBy if composite index is generating
        const fallbackQ = query(collection(db, 'users', user.uid, 'notifications'), limit(15));
        unsubscribe = onSnapshot(fallbackQ, (snap) => {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
          setNotifications(list);
          setUnreadCount(list.filter(n => !n.read).length);
        });
      });
    } catch (e) {
      console.warn('Notification listener error:', e);
    }

    return () => unsubscribe();
  }, [user?.uid]);

  const markAllAsRead = async () => {
    if (!user?.uid || user.uid === 'guest_user') {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      return;
    }

    const batch = writeBatch(db);
    const unreadNotifications = notifications.filter(n => !n.read);
    
    unreadNotifications.forEach(n => {
      const ref = doc(db, 'users', user.uid, 'notifications', n.id);
      batch.update(ref, { read: true });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const clearAll = async () => {
    if (!user?.uid || user.uid === 'guest_user') {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const q = query(collection(db, 'users', user.uid, 'notifications'));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user?.uid || user.uid === 'guest_user') {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }

    try {
      const ref = doc(db, 'users', user.uid, 'notifications', id);
      await updateDoc(ref, { read: true });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      await markAsRead(n.id);
    }
    setIsOpen(false);
    if (n.actionUrl) {
      navigate(n.actionUrl);
    }
  };

  return (
    <div className="relative notifications-menu">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-full text-slate-300 hover:text-white transition-colors duration-200"
        title="Notificações"
      >
        <FaBell size={14} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-slate-900 shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay to close when clicking background */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-80 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="font-bold text-sm text-white tracking-wide">Notificações</span>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      title="Marcar todas como lidas"
                    >
                      <FaCheck size={8} /> Lidas
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                      title="Limpar todas"
                    >
                      <FaTrashAlt size={8} /> Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Browser Push Notification Quick Activation Banner */}
              {isSupported && !isGranted && (
                <div className="bg-blue-600/15 border border-blue-500/30 rounded-xl p-2.5 mb-3 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FaBell className="text-blue-400 shrink-0" size={12} />
                    <span className="text-[11px] font-bold text-white leading-tight">Receber Lembretes de Aula</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight mb-2">
                    Receba avisos 15 min antes das suas aulas ao vivo no Zoom.
                  </p>
                  <button
                    type="button"
                    onClick={() => requestPermission()}
                    disabled={isRequesting}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {isRequesting ? 'Ativando...' : 'Ativar no Navegador'}
                  </button>
                </div>
              )}

              {isGranted && (
                <div className="flex items-center justify-between px-1 py-1 mb-2 text-[10px] text-slate-400 border-b border-slate-850">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <FaCheckCircle size={10} /> Lembretes Ativados
                  </span>
                  <button
                    type="button"
                    onClick={() => testNotification('Teste de Lembrete', 'Seus alertas de aula estão funcionando perfeitamente!')}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-bold"
                  >
                    Testar alerta
                  </button>
                </div>
              )}

              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1.5">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-550 font-light">
                    Nenhuma notificação por aqui.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        n.read
                          ? 'bg-slate-950/20 border-slate-900 text-slate-400'
                          : 'bg-blue-600/5 border-blue-500/20 text-slate-200 hover:bg-blue-600/10'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-0.5">
                        <span className={`font-bold text-xs ${n.read ? 'text-slate-400' : 'text-blue-400'}`}>{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0 animate-pulse"></span>}
                      </div>
                      <p className="text-[11px] font-light leading-relaxed">{n.body || n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
