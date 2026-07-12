"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { CalendarClock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface BookingData {
  id: string;
  asset: { name: string; assetTag: string };
  user: { name: string };
  startTime: string;
  endTime: string;
  status: string;
}

interface AssetData {
  id: string;
  name: string;
  assetTag: string;
}

export default function ResourceBookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Booking State
  const [formData, setFormData] = useState({
    assetId: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [bookRes, assetRes] = await Promise.all([
        fetch(`${API_URL}/api/bookings`, { credentials: 'include' }),
        fetch(`${API_URL}/api/assets`, { credentials: 'include' })
      ]);
      
      if (bookRes.ok) {
        const data = await bookRes.json();
        setBookings(data.data);
      }
      if (assetRes.ok) {
        const data = await assetRes.json();
        // Only show shared assets for booking
        setAssets(data.data?.filter((a: any) => a.shared === true) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Construct exact DateTime strings
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();

      // We need user context to book (assume backend uses JWT, but our schema requires userId. 
      // If backend doesn't infer userId from JWT, we'd pass it. Let's fetch current user or assume backend handles it.
      // Wait, our backend schema requires userId. I need to make sure the user id is passed or inferred.
      // The instructions for controller: `const { assetId, userId, ... }`. I didn't add JWT inference in controller yet.
      // I'll fetch employees and pick the first active one, or we can just send a hardcoded ID for demo?
      // No, it's better to fetch user profile. Let's fetch `/api/auth/me` first.
      
      const meRes = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
      const meData = await meRes.json();
      const userId = meData.user?.id;

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assetId: formData.assetId,
          userId: userId,
          startTime: startDateTime,
          endTime: endDateTime
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFormData({ assetId: '', date: '', startTime: '', endTime: '' });
        fetchData();
      } else {
        setErrorMsg(data.error || 'Failed to book resource');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-white mr-4">
            &larr; Back
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400">
            <CalendarClock className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-white">Resource Bookings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Book Shared Resource</h2>
              
              {errorMsg && (
                <div className="bg-rose-950/50 border border-rose-900 rounded p-3 mb-6 text-sm text-rose-400">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Resource</label>
                  <select
                    required
                    value={formData.assetId}
                    onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="">-- Choose Resource --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Time</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || assets.length === 0}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-lg mt-4 transition-colors"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>

          {/* Schedule / List View */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-full">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Upcoming Schedule</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4 font-medium">Resource</th>
                      <th className="px-6 py-4 font-medium">Date & Time</th>
                      <th className="px-6 py-4 font-medium">Booked By</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {isLoading ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading...</td></tr>
                    ) : bookings.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-500">No active bookings.</td></tr>
                    ) : bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-800/20">
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">{b.asset.name}</p>
                          <p className="text-xs text-cyan-400 font-mono">{b.asset.assetTag}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-white">{new Date(b.startTime).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-6 py-4">{b.user.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                            b.status === 'UPCOMING' ? 'bg-blue-950 text-blue-400' :
                            b.status === 'ONGOING' ? 'bg-emerald-950 text-emerald-400' :
                            b.status === 'CANCELLED' ? 'bg-slate-800 text-slate-500 line-through' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {['UPCOMING', 'ONGOING'].includes(b.status) && (
                            <button 
                              onClick={() => handleCancel(b.id)}
                              className="text-slate-500 hover:text-rose-400"
                              title="Cancel Booking"
                            >
                              <XCircle className="h-5 w-5 ml-auto" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
