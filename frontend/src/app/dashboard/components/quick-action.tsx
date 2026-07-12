import { LucideIcon } from 'lucide-react';

interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  color?: 'emerald' | 'blue' | 'purple';
}

export function QuickAction({
  title,
  description,
  icon: Icon,
  onClick,
  color = 'emerald'
}: QuickActionProps) {

  const colorStyles = {
    emerald: 'from-emerald-600/20 to-emerald-900/20 hover:from-emerald-500/30 hover:to-emerald-800/30 border-emerald-800/50 text-emerald-500',
    blue: 'from-blue-600/20 to-blue-900/20 hover:from-blue-500/30 hover:to-blue-800/30 border-blue-800/50 text-blue-500',
    purple: 'from-purple-600/20 to-purple-900/20 hover:from-purple-500/30 hover:to-purple-800/30 border-purple-800/50 text-purple-500',
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
