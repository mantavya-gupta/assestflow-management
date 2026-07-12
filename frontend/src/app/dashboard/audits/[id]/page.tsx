"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { ClipboardCheck, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
import Link from 'next/link';

interface AuditRecord {
  id: string;
  status: string;
  notes?: string;
  asset: { name: string; assetTag: string; location: string; status: string; };
  scannedAt?: string;
}

interface AuditCycleDetail {
  id: string;
  name: string;
  status: string;
  records: AuditRecord[];
}

export default function AuditExecutionPage({ params }: { params: { id: string } }) {
  const [cycle, setCycle] = useState<AuditCycleDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchCycle = async () => {
    try {
      const res = await fetch(`${API_URL}/api/audits/${params.id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCycle(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCycle();
  }, [params.id]);

  const updateRecord = async (recordId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/audits/records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchCycle();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeCycle = async () => {
    if (!confirm('Are you sure you want to close this audit? This will lock the records and mark MISSING assets as LOST.')) return;
    try {
      const res = await fetch(`${API_URL}/api/audits/${params.id}/close`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        fetchCycle();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!cycle) return <div className="p-12 text-center text-white">Loading...</div>;

  const filteredRecords = cycle.records.filter(r => 
    r.asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: cycle.records.length,
    pending: cycle.records.filter(r => r.status === 'PENDING').length,
    verified: cycle.records.filter(r => r.status === 'VERIFIED').length,
    missing: cycle.records.filter(r => r.status === 'MISSING').length,
    damaged: cycle.records.filter(r => r.status === 'DAMAGED').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 relative">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <Link href="/dashboard/audits" className="text-slate-400 hover:text-white mr-4">
              &larr; Back to Audits
            </Link>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-950 text-orange-400">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{cycle.name}</h1>
                <p className="text-sm text-slate-400 mt-1">Audit Execution & Verification</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block ${cycle.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'}`}>
              {cycle.status}
            </span>
            {cycle.status !== 'COMPLETED' && (
              <div>
                <button onClick={closeCycle} className="bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 py-2 rounded-lg text-sm">
                  Close Audit Cycle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-400 uppercase">Total Items</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-slate-300">{stats.pending}</div>
            <div className="text-xs text-slate-400 uppercase">Pending</div>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.verified}</div>
            <div className="text-xs text-emerald-500 uppercase">Verified</div>
          </div>
          <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.damaged}</div>
            <div className="text-xs text-amber-500 uppercase">Damaged</div>
          </div>
          <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-rose-400">{stats.missing}</div>
            <div className="text-xs text-rose-500 uppercase">Missing</div>
          </div>
        </div>

        {/* List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Scan or search tag..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Global Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-right">Actions (Auditor)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{r.asset.name}</p>
                    <p className="text-xs text-orange-400 font-mono">{r.asset.assetTag}</p>
                    {r.asset.location && <p className="text-xs text-slate-500 mt-1">{r.asset.location}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] uppercase bg-slate-800 px-2 py-1 rounded text-slate-400">
                      {r.asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex w-fit items-center gap-1 px-2 py-1 text-xs font-bold rounded ${
                      r.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400' :
                      r.status === 'DAMAGED' ? 'bg-amber-950 text-amber-400' :
                      r.status === 'MISSING' ? 'bg-rose-950 text-rose-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {r.status === 'VERIFIED' && <CheckCircle2 className="h-3 w-3" />}
                      {r.status === 'DAMAGED' && <AlertTriangle className="h-3 w-3" />}
                      {r.status === 'MISSING' && <XCircle className="h-3 w-3" />}
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {cycle.status !== 'COMPLETED' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => updateRecord(r.id, 'VERIFIED')}
                          className="p-2 bg-emerald-950/50 hover:bg-emerald-900 text-emerald-400 rounded transition-colors"
                          title="Mark Verified"
                        ><CheckCircle2 className="h-4 w-4" /></button>
                        <button 
                          onClick={() => updateRecord(r.id, 'DAMAGED')}
                          className="p-2 bg-amber-950/50 hover:bg-amber-900 text-amber-400 rounded transition-colors"
                          title="Mark Damaged"
                        ><AlertTriangle className="h-4 w-4" /></button>
                        <button 
                          onClick={() => updateRecord(r.id, 'MISSING')}
                          className="p-2 bg-rose-950/50 hover:bg-rose-900 text-rose-400 rounded transition-colors"
                          title="Mark Missing"
                        ><XCircle className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
