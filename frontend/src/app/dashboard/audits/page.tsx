"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { ClipboardCheck, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AuditCycle {
  id: string;
  name: string;
  scopeType: string;
  scopeValue?: string;
  startDate: string;
  endDate: string;
  status: string;
  _count?: { records: number };
}

export default function AuditsPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    scopeType: 'ALL',
    scopeValue: '',
    startDate: '',
    endDate: ''
  });

  const fetchCycles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/audits`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCycles(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/audits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setShowModal(false);
        router.push(`/dashboard/audits/${data.data.id}`);
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
            <Link href="/dashboard" className="text-slate-400 hover:text-white mr-4">
              &larr; Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-950 text-orange-400">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-white">Asset Audits</h1>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-orange-600 hover:bg-orange-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + New Audit Cycle
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Audit Name</th>
                <th className="px-6 py-4">Scope</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr>
              ) : cycles.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center">No audits found.</td></tr>
              ) : cycles.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs uppercase px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {c.scopeType} {c.scopeValue && `: ${c.scopeValue}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(c.startDate).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1 mt-1"><Calendar className="h-3 w-3"/> {new Date(c.endDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono">
                    {c._count?.records || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      c.status === 'OPEN' ? 'bg-blue-950 text-blue-400' :
                      c.status === 'IN_PROGRESS' ? 'bg-amber-950 text-amber-400' :
                      'bg-emerald-950 text-emerald-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/audits/${c.id}`} className="text-orange-400 hover:text-orange-300 font-medium">
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create Audit Cycle</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Cycle Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" placeholder="Q3 Annual Audit" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Scope</label>
                  <select value={formData.scopeType} onChange={e => setFormData({...formData, scopeType: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white">
                    <option value="ALL">All Assets</option>
                    <option value="LOCATION">By Location</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Value (If location)</label>
                  <input disabled={formData.scopeType !== 'LOCATION'} value={formData.scopeValue} onChange={e => setFormData({...formData, scopeValue: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white disabled:opacity-50" placeholder="HQ-Floor-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                  <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" style={{colorScheme: 'dark'}} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">End Date</label>
                  <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" style={{colorScheme: 'dark'}} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded font-medium">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
