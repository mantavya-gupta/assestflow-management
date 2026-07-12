"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { LineChart, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import Link from 'next/link';

interface ReportData {
  statusDistribution: { name: string; value: number }[];
  departmentAllocations: { name: string; value: number }[];
  maintenanceFrequency: { name: string; value: number }[];
}

export default function ReportsDashboard() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/reports/dashboard`, { credentials: 'include' })
      .then(res => res.json())
      .then(d => setData(d.data))
      .catch(console.error);
  }, []);

  if (!data) return <div className="p-12 text-center text-white">Loading Analytics...</div>;

  const totalAssets = data.statusDistribution.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <Link href="/dashboard" className="text-slate-400 hover:text-white mr-4">
              &larr; Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-950 text-pink-400">
                <BarChart2 className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
            </div>
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Export Data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-pink-500" /> Asset Global Status
            </h3>
            <div className="space-y-4">
              {data.statusDistribution.map(s => {
                const percentage = Math.round((s.value / totalAssets) * 100) || 0;
                return (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{s.name}</span>
                      <span className="text-white font-mono">{s.value} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${s.name === 'AVAILABLE' ? 'bg-emerald-500' : s.name === 'ALLOCATED' ? 'bg-blue-500' : s.name === 'MAINTENANCE' ? 'bg-purple-500' : 'bg-slate-500'}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Allocation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-500" /> Department Allocation Summary
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {data.departmentAllocations.map(d => (
                <div key={d.name} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-300 text-sm">{d.name}</span>
                  <span className="text-blue-400 font-bold bg-blue-950/50 px-2 py-1 rounded text-xs">{d.value} Active</span>
                </div>
              ))}
              {data.departmentAllocations.length === 0 && <p className="text-slate-500 text-sm">No active allocations.</p>}
            </div>
          </div>

          {/* Maintenance Frequency */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <LineChart className="h-4 w-4 text-amber-500" /> Maintenance Frequency by Type
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {data.maintenanceFrequency.sort((a,b) => b.value - a.value).map(m => (
                <div key={m.name} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-300 text-sm">{m.name}</span>
                  <span className="text-amber-400 font-bold bg-amber-950/50 px-2 py-1 rounded text-xs">{m.value} Incidents</span>
                </div>
              ))}
              {data.maintenanceFrequency.length === 0 && <p className="text-slate-500 text-sm">No maintenance records.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
