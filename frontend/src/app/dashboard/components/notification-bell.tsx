"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { Bell, Check } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/activity/notifications`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/activity/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-slate-950"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-3 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{notifications.length} Unread</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">You have no unread notifications.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-800/30 transition-colors flex gap-3 items-start group">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${n.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">{n.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/50 rounded opacity-0 group-hover:opacity-100 transition-all"
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
