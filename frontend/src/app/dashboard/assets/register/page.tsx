"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { PlusCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default function RegisterAssetPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: '', 
    type: '',
    serialNumber: '',
    acquisitionDate: '',
    acquisitionCost: '',
    condition: '',
    location: '',
    shared: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        acquisitionCost: formData.acquisitionCost ? parseFloat(formData.acquisitionCost) : undefined
      };

      const res = await fetch(`${API_URL}/api/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to register asset');
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
        
        <Link href="/dashboard" className="text-emerald-500 hover:text-emerald-400 text-sm mb-6 inline-block">
          &larr; Back to Dashboard
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Register Asset</h1>
              <p className="text-slate-400">Add a new item to the company inventory.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Asset Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="e.g. MacBook Pro 16-inch"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Asset Type/Category
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g. Laptop, License"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g. C02X..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Acquisition Date
                </label>
                <input
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={e => setFormData({ ...formData, acquisitionDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Acquisition Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.acquisitionCost}
                  onChange={e => setFormData({ ...formData, acquisitionCost: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g. NY Office"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={e => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">-- Select Condition --</option>
                  <option value="NEW">New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/50 p-4 border border-slate-800 rounded-lg">
              <input
                type="checkbox"
                id="shared"
                checked={formData.shared}
                onChange={e => setFormData({ ...formData, shared: e.target.checked })}
                className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50"
              />
              <label htmlFor="shared" className="text-sm text-slate-300 cursor-pointer">
                Shared / Bookable Resource (e.g. Projector, Conference Room)
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
            >
              <Package className="h-5 w-5" />
              {isSubmitting ? 'Registering...' : 'Register Asset'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
