"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { Wrench } from 'lucide-react';
import Link from 'next/link';

interface AssetData { id: string; name: string; }

export default function RaiseMaintenancePage() {
  const router = useRouter();
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    assetId: '',
    issue: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ALL assets, or at least allocated/available ones, because any asset might break
        const res = await fetch(`${API_URL}/api/assets`, { credentials: 'include' });
        
        if (res.ok) {
          const a = await res.json();
          // Let's filter out retired assets, but keep available and allocated
          const activeAssets = a.data?.filter((ast: any) => ast.status !== 'RETIRED') || [];
          setAssets(activeAssets);
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
      const res = await fetch(`${API_URL}/api/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to raise maintenance');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 relative">
      <div className="max-w-xl mx-auto px-4 relative z-10">
        
        <Link href="/dashboard" className="text-purple-500 hover:text-purple-400 text-sm mb-6 inline-block">
          &larr; Back to Dashboard
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-950 text-purple-400">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Raise Maintenance</h1>
              <p className="text-slate-400">Report an issue or schedule a repair for an asset.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading assets...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Asset
                </label>
                <select
                  required
                  value={formData.assetId}
                  onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="">-- Choose an Asset --</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Issue Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.issue}
                  onChange={e => setFormData({ ...formData, issue: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="Describe the problem..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || assets.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                <Wrench className="h-5 w-5" />
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
