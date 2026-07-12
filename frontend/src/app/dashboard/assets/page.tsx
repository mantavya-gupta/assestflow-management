"use client";

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { Package, Search, Filter, History } from 'lucide-react';
import Link from 'next/link';

interface AssetData {
  id: string;
  assetTag: string;
  name: string;
  type: string;
  status: string;
  serialNumber?: string;
  location?: string;
  condition?: string;
  allocations: any[];
  maintenanceRequests: any[];
  transfers: any[];
}

export default function AssetDirectoryPage() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      let query = '';
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (filterStatus) query += `status=${filterStatus}`;

      const res = await fetch(`${API_URL}/api/assets?${query}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAssets(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timeout = setTimeout(() => {
      fetchAssets();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, filterStatus]);

  const openDetails = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/assets/${id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSelectedAsset(data.data);
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AVAILABLE': return 'bg-emerald-950 text-emerald-400 ring-emerald-800';
      case 'ALLOCATED': return 'bg-blue-950 text-blue-400 ring-blue-800';
      case 'MAINTENANCE': return 'bg-purple-950 text-purple-400 ring-purple-800';
      case 'RESERVED': return 'bg-amber-950 text-amber-400 ring-amber-800';
      default: return 'bg-slate-800 text-slate-400 ring-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 relative">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <Link href="/dashboard" className="text-emerald-500 hover:text-emerald-400 text-sm mb-4 inline-block">
              &larr; Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400">
                <Package className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-white">Asset Directory</h1>
            </div>
          </div>
          
          <Link href="/dashboard/assets/register" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors">
            + Register New
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by tag, name, or serial number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="RESERVED">Reserved</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="LOST">Lost</option>
              <option value="DISPOSED">Disposed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Tag</th>
                  <th className="px-6 py-4 font-medium">Asset Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No assets found.</td>
                  </tr>
                ) : (
                  assets.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-emerald-400">{a.assetTag}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{a.name}</p>
                        {a.serialNumber && <p className="text-xs text-slate-500">SN: {a.serialNumber}</p>}
                      </td>
                      <td className="px-6 py-4">{a.type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{a.location || '--'}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openDetails(a.id)}
                          className="text-emerald-500 hover:text-emerald-400 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {selectedAsset.name}
                </h3>
                <span className="font-mono text-xs px-2 py-1 bg-slate-950 text-slate-300 rounded border border-slate-700">
                  {selectedAsset.assetTag}
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <p className={`text-sm font-medium ${getStatusColor(selectedAsset.status).split(' ')[1]}`}>{selectedAsset.status}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Condition</p>
                  <p className="text-sm font-medium text-white">{selectedAsset.condition || '--'}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Serial Number</p>
                  <p className="text-sm font-medium text-white">{selectedAsset.serialNumber || '--'}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Location</p>
                  <p className="text-sm font-medium text-white">{selectedAsset.location || '--'}</p>
                </div>
              </div>

              {/* Lifecycle History */}
              <div>
                <h4 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
                  <History className="h-4 w-4" /> Allocation History
                </h4>
                {selectedAsset.allocations.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No allocations yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedAsset.allocations.map(alloc => (
                      <div key={alloc.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-300">{alloc.assignee.name}</p>
                          <p className="text-xs text-slate-500">From: {new Date(alloc.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${alloc.status === 'ACTIVE' ? 'bg-blue-900/50 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                            {alloc.status}
                          </span>
                          {alloc.actualReturnDate && (
                            <p className="text-xs text-slate-500 mt-1">Ret: {new Date(alloc.actualReturnDate).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
