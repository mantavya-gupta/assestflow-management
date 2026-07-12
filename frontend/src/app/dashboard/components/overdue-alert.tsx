import { AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface OverdueItem {
  id: string;
  assetName: string;
  assignee: string;
  dueDate: string;
  daysOverdue: number;
}

export function OverdueAlert({ items }: { items: OverdueItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-6 overflow-hidden relative">
      {/* Background Warning Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-rose-600/10 blur-3xl"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20 text-rose-500 ring-1 ring-inset ring-rose-500/30">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Overdue Returns</h2>
          <p className="text-sm text-rose-200/70">Requires immediate attention</p>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between rounded-lg bg-slate-900/60 p-4 ring-1 ring-inset ring-rose-900/50 hover:bg-slate-800/80 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="font-medium text-white">{item.assetName}</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-sm text-slate-400">{item.assignee}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block text-sm font-medium text-rose-400">
                  {item.daysOverdue} days overdue
                </span>
                <span className="text-xs text-slate-500">
                  Due: {item.dueDate}
                </span>
              </div>
              <button className="rounded bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition-colors">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
