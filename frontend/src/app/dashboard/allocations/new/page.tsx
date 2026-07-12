"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { CalendarPlus, User } from 'lucide-react';
import Link from 'next/link';

interface AssetData { id: string; name: string; }
interface UserData { id: string; name: string; email: string; }

export default function BookResourcePage() {
  const router = useRouter();
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictMsg, setConflictMsg] = useState<{ msg: string; assigneeId: string } | null>(null);

  const [formData, setFormData] = useState({
    assetId: '',
    assigneeId: '',
    expectedReturnDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ALL assets, not just AVAILABLE, because we want to demonstrate the conflict rule
        // if someone tries to book an already allocated asset.
        const [assetRes, userRes] = await Promise.all([
          fetch(`${API_URL}/api/assets`, { credentials: 'include' }),
          fetch(`${API_URL}/api/employees`, { credentials: 'include' })
        ]);
        
        if (assetRes.ok) {
          const a = await assetRes.json();
          // Filter out RETIRED/LOST/DISPOSED, but keep AVAILABLE and ALLOCATED
          const activeAssets = a.data?.filter((ast: any) => 
            !['RETIRED', 'LOST', 'DISPOSED'].includes(ast.status)
          ) || [];
          setAssets(activeAssets);
        }
        if (userRes.ok) {
          const u = await userRes.json();
          setUsers(u.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      setConflictMsg(null);
      const payload = {
        ...formData,
        expectedReturnDate: new Date(formData.expectedReturnDate).toISOString()
      };

      const res = await fetch(`${API_URL}/api/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push('/dashboard');
      } else if (res.status === 409 && data.conflict) {
        setConflictMsg({ msg: data.error, assigneeId: data.currentAssigneeId });
      } else {
        alert(data.error || 'Failed to book resource');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestTransfer = async () => {
    if (!conflictMsg) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assetId: formData.assetId,
          toUserId: formData.assigneeId
        })
      });
      
      if (res.ok) {
        alert('Transfer Request sent successfully! Waiting for approval.');
        router.push('/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to request transfer');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 relative">
      <div className="max-w-xl mx-auto px-4 relative z-10">
        
        <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 text-sm mb-6 inline-block">
          &larr; Back to Dashboard
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-blue-400">
              <CalendarPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Book Resource</h1>
              <p className="text-slate-400">Allocate an available asset to a team member.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading available assets...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Asset (Only Available shown)
                </label>
                <select
                  required
                  value={formData.assetId}
                  onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">-- Choose an Asset --</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Assignee
                </label>
                <select
                  required
                  value={formData.assigneeId}
                  onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">-- Choose an Employee --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.expectedReturnDate}
                  onChange={e => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {conflictMsg && (
                <div className="bg-amber-950/40 border border-amber-900 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-400">Allocation Conflict</h4>
                      <p className="text-sm text-amber-200/80 mt-1">{conflictMsg.msg}</p>
                      <button
                        type="button"
                        onClick={handleRequestTransfer}
                        disabled={isSubmitting}
                        className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {isSubmitting ? 'Requesting...' : 'Request Transfer Instead'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || assets.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                <CalendarPlus className="h-5 w-5" />
                {isSubmitting ? 'Booking...' : 'Book Resource'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
