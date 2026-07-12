"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { Wrench, CheckCircle2, UserPlus, FileWarning } from 'lucide-react';
import Link from 'next/link';

interface TechnicianData {
  id: string;
  name: string;
}

interface MaintenanceData {
  id: string;
  asset: { name: string; assetTag: string; type: string };
  technician?: { name: string };
  issue: string;
  priority: string;
  photoUrl?: string;
  status: string;
  reportedDate: string;
}

export default function MaintenanceDashboardPage() {
  const [requests, setRequests] = useState<MaintenanceData[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const [reqRes, techRes] = await Promise.all([
        fetch(`${API_URL}/api/maintenance`, { credentials: 'include' }),
        fetch(`${API_URL}/api/employees`, { credentials: 'include' }) // Assuming employees can be techs
      ]);
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data.data);
      }
      if (techRes.ok) {
        const data = await techRes.json();
        setTechnicians(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string, technicianId?: string) => {
    try {
      const payload: any = { status };
      if (technicianId) payload.technicianId = technicianId;

      const res = await fetch(`${API_URL}/api/maintenance/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchRequests();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-rose-950 text-rose-400 ring-rose-800';
      case 'HIGH': return 'bg-orange-950 text-orange-400 ring-orange-800';
      case 'MEDIUM': return 'bg-amber-950 text-amber-400 ring-amber-800';
      case 'LOW': return 'bg-blue-950 text-blue-400 ring-blue-800';
      default: return 'bg-slate-800 text-slate-400 ring-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 relative">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <Link href="/dashboard" className="text-purple-500 hover:text-purple-400 text-sm mb-4 inline-block">
              &larr; Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 text-purple-400">
                <Wrench className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-white">Maintenance Dashboard</h1>
            </div>
            <p className="text-slate-400 mt-2">Manage repairs and track maintenance lifecycles.</p>
          </div>
          
          <Link href="/dashboard/maintenance/new" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors">
            + Raise Request
          </Link>
        </div>

        {/* Kanban Board / Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column: Pending / New */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FileWarning className="h-4 w-4 text-amber-500" /> Pending Review
              </h3>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full">
                {requests.filter(r => r.status === 'PENDING').length}
              </span>
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
              {requests.filter(r => r.status === 'PENDING').map(r => (
                <div key={r.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-purple-400">{r.asset.assetTag}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ring-1 ring-inset ${getPriorityColor(r.priority)}`}>
                      {r.priority}
                    </span>
                  </div>
                  <h4 className="text-white font-medium mb-1">{r.asset.name}</h4>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{r.issue}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateStatus(r.id, 'APPROVED')}
                      className="flex-1 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-400 text-xs py-2 rounded transition-colors border border-emerald-900/50"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => updateStatus(r.id, 'REJECTED')}
                      className="flex-1 bg-rose-950/50 hover:bg-rose-900/50 text-rose-400 text-xs py-2 rounded transition-colors border border-rose-900/50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Approved & Assigned */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-500" /> Approved / In Progress
              </h3>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full">
                {requests.filter(r => ['APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length}
              </span>
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
              {requests.filter(r => ['APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS'].includes(r.status)).map(r => (
                <div key={r.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-purple-400">{r.asset.assetTag}</span>
                    <span className="text-xs text-blue-400 bg-blue-950 px-2 py-0.5 rounded ring-1 ring-inset ring-blue-800">
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-white font-medium mb-1">{r.asset.name}</h4>
                  
                  {r.status === 'APPROVED' ? (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <label className="text-xs text-slate-500 block mb-2">Assign Technician</label>
                      <select 
                        onChange={(e) => updateStatus(r.id, 'TECHNICIAN_ASSIGNED', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-sm rounded p-2 text-white"
                        defaultValue=""
                      >
                        <option value="" disabled>Select tech...</option>
                        {technicians.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <p className="text-xs text-slate-400 mb-3">Assigned to: <span className="text-white">{r.technician?.name}</span></p>
                      {r.status === 'TECHNICIAN_ASSIGNED' && (
                        <button 
                          onClick={() => updateStatus(r.id, 'IN_PROGRESS')}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded transition-colors"
                        >
                          Start Work
                        </button>
                      )}
                      {r.status === 'IN_PROGRESS' && (
                        <button 
                          onClick={() => updateStatus(r.id, 'RESOLVED')}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 rounded transition-colors flex justify-center items-center gap-1"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Mark Resolved
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column: Resolved */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full opacity-70">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Resolved
              </h3>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full">
                {requests.filter(r => r.status === 'RESOLVED').length}
              </span>
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[70vh]">
              {requests.filter(r => r.status === 'RESOLVED').map(r => (
                <div key={r.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-slate-500">{r.asset.assetTag}</span>
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded ring-1 ring-inset ring-emerald-800/50">
                      RESOLVED
                    </span>
                  </div>
                  <h4 className="text-slate-300 font-medium mb-1 line-through decoration-slate-600">{r.asset.name}</h4>
                  <p className="text-xs text-slate-500">Fixed by: {r.technician?.name}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
