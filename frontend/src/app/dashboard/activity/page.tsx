"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { Activity, Clock } from 'lucide-react';
import Link from 'next/link';

interface LogEntry {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  user: { name: string; email: string };
  asset?: { name: string; assetTag: string };
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/activity/logs`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 relative">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <Link href="/dashboard" className="text-slate-400 hover:text-white mr-4">
              &larr; Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400">
                <Activity className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-white">System Activity Logs</h1>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan={4} className="p-6 text-center">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center">No activity found.</td></tr>
              ) : logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(l.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {l.user.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] uppercase font-bold bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300">{l.details}</p>
                    {l.asset && (
                      <p className="text-xs text-indigo-400 mt-1 font-mono">
                        Asset: {l.asset.name} ({l.asset.assetTag})
                      </p>
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
