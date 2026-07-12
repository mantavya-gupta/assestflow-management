import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'slate';
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'neutral',
  color = 'slate'
}: KpiCardProps) {
  
  const colorStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-500 ring-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-500 ring-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-500 ring-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-500 ring-rose-500/20',
    slate: 'bg-slate-500/10 text-slate-400 ring-slate-500/20',
  };

  const trendStyles = {
    up: 'text-emerald-400',
    down: 'text-rose-400',
    neutral: 'text-slate-400',
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900/50 p-6 ring-1 ring-inset ring-slate-800 backdrop-blur-xl transition-all hover:bg-slate-800/50 hover:ring-slate-700 shadow-lg shadow-black/20 group">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className={`p-2 rounded-lg ring-1 ring-inset ${colorStyles[color]} transition-colors group-hover:bg-opacity-20`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-white">{value}</p>
        {trend && (
          <span className={`text-xs font-medium ${trendStyles[trendDirection]}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
