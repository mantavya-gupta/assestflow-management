import { LucideIcon } from 'lucide-react';

interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  color?: 'emerald' | 'blue' | 'purple' | 'amber';
}

export function QuickAction({
  title,
  description,
  icon: Icon,
  onClick,
  color = 'emerald'
}: QuickActionProps) {

  const colorStyles = {
    emerald: 'from-emerald-950/50 to-slate-900 border-emerald-900/50 hover:border-emerald-500/50 group-hover:bg-emerald-500/10 text-emerald-400 group-hover:text-emerald-300',
    blue: 'from-blue-950/50 to-slate-900 border-blue-900/50 hover:border-blue-500/50 group-hover:bg-blue-500/10 text-blue-400 group-hover:text-blue-300',
    purple: 'from-purple-950/50 to-slate-900 border-purple-900/50 hover:border-purple-500/50 group-hover:bg-purple-500/10 text-purple-400 group-hover:text-purple-300',
    amber: 'from-amber-950/50 to-slate-900 border-amber-900/50 hover:border-amber-500/50 group-hover:bg-amber-500/10 text-amber-400 group-hover:text-amber-300',
  };

  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full flex-col items-start gap-4 rounded-xl border bg-gradient-to-br p-6 text-left transition-all ${colorStyles[color]}`}
    >
      <div className="rounded-lg bg-slate-950/50 p-3 ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold text-white group-hover:text-white/90">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      
      {/* Decorative background glow */}
      <div className="absolute -inset-x-4 -top-4 -z-10 h-[100px] w-full rounded-full bg-current opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
    </button>
  );
}
