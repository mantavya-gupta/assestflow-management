"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface TransferData {
  id: string;
  asset: { name: string; assetTag: string };
  fromUser: { name: string };
  toUser: { name: string };
  status: string;
  createdAt: string;
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/transfers`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTransfers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this transfer? The current allocation will be cancelled and reassigned.')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/transfers/${id}/approve`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        fetchTransfers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to approve transfer');
      }
    } catch (err) {
      console.error(err);
    }
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950 text-amber-400">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-white">Transfer Requests</h1>
            </div>
            <p className="text-slate-400 mt-2">Approve or reject requests to re-assign an active asset.</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">From User</th>
                  <th className="px-6 py-4 font-medium">To User</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : transfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No transfer requests found.</td>
                  </tr>
                ) : (
                  transfers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{t.asset.name}</p>
                        <p className="text-xs font-mono text-emerald-500">{t.asset.assetTag}</p>
                      </td>
                      <td className="px-6 py-4 text-rose-400">{t.fromUser.name}</td>
                      <td className="px-6 py-4 text-emerald-400">{t.toUser.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          t.status === 'PENDING' ? 'bg-amber-950 text-amber-400 ring-1 ring-amber-800' : 'bg-slate-800 text-slate-400 ring-1 ring-slate-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {t.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => handleApprove(t.id)}
                              className="text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1"
                              title="Approve"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-slate-500 hover:text-rose-400 font-medium flex items-center gap-1"
                              title="Reject (UI only for now)"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
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
    </div>
  );
}
