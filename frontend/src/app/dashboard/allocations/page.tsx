"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { CalendarPlus, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface AllocationData {
  id: string;
  asset: { name: string; assetTag: string };
  assignee: { name: string };
  expectedReturnDate: string;
  status: string;
}

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<AllocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Return Modal State
  const [returningAlloc, setReturningAlloc] = useState<AllocationData | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllocations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/allocations`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAllocations(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningAlloc) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/allocations/${returningAlloc.id}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ returnNotes })
      });
      if (res.ok) {
        setReturningAlloc(null);
        setReturnNotes('');
        fetchAllocations();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to return asset');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 relative">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
              &larr; Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-blue-400">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-white">Active Allocations</h1>
            </div>
          </div>
          
          <Link href="/dashboard/allocations/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex gap-2">
            <CalendarPlus className="h-4 w-4" /> New Booking
          </Link>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">Assignee</th>
                  <th className="px-6 py-4 font-medium">Expected Return</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : allocations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No active allocations found.</td>
                  </tr>
                ) : (
                  allocations.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{a.asset.name}</p>
                        <p className="text-xs font-mono text-emerald-500">{a.asset.assetTag}</p>
                      </td>
                      <td className="px-6 py-4">{a.assignee.name}</td>
                      <td className="px-6 py-4">
                        <span className={a.status === 'ACTIVE' && isOverdue(a.expectedReturnDate) ? 'text-rose-400 font-medium' : ''}>
                          {new Date(a.expectedReturnDate).toLocaleDateString()}
                          {a.status === 'ACTIVE' && isOverdue(a.expectedReturnDate) && ' (Overdue)'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          a.status === 'ACTIVE' ? 'bg-blue-950 text-blue-400 ring-1 ring-inset ring-blue-800' : 'bg-slate-800 text-slate-400 ring-1 ring-inset ring-slate-700'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {a.status === 'ACTIVE' && (
                          <button 
                            onClick={() => setReturningAlloc(a)}
                            className="text-emerald-500 hover:text-emerald-400 font-medium text-sm flex items-center justify-end gap-1 ml-auto"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Mark Returned
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {returningAlloc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                Check In Asset: {returningAlloc.asset.name}
              </h3>
            </div>
            
            <form onSubmit={handleReturn} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Condition & Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  placeholder="e.g. Returned in good condition, minor scratch on lid..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReturningAlloc(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors ring-1 ring-inset ring-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
