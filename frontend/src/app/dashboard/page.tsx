import { 
  Laptop, 
  MonitorCheck, 
  Wrench, 
  CalendarCheck, 
  ArrowLeftRight, 
  Clock,
  PlusCircle,
  CalendarPlus
} from 'lucide-react';
import { KpiCard } from './components/kpi-card';
import { QuickAction } from './components/quick-action';
import { OverdueAlert } from './components/overdue-alert';

// --- MOCK DATA ---
const kpiData = [
  { title: 'Assets Available', value: 124, icon: Laptop, trend: '+12%', trendDirection: 'up' as const, color: 'emerald' as const },
  { title: 'Assets Allocated', value: 342, icon: MonitorCheck, trend: '+2%', trendDirection: 'up' as const, color: 'blue' as const },
  { title: 'Maintenance Today', value: 8, icon: Wrench, trend: '-1', trendDirection: 'down' as const, color: 'rose' as const },
  { title: 'Active Bookings', value: 45, icon: CalendarCheck, color: 'purple' as const },
  { title: 'Pending Transfers', value: 12, icon: ArrowLeftRight, trend: 'Requires action', trendDirection: 'neutral' as const, color: 'amber' as const },
  { title: 'Upcoming Returns', value: 28, icon: Clock, color: 'slate' as const },
];

const overdueReturns = [
  { id: '1', assetName: 'MacBook Pro 16" (M2 Max)', assignee: 'Sarah Jenkins', dueDate: 'Oct 12, 2023', daysOverdue: 14 },
  { id: '2', assetName: 'Dell UltraSharp 32" 4K Monitor', assignee: 'Michael Chang', dueDate: 'Oct 20, 2023', daysOverdue: 6 },
  { id: '3', assetName: 'Herman Miller Aeron Chair', assignee: 'Alex Rodriguez', dueDate: 'Oct 24, 2023', daysOverdue: 2 },
];

const upcomingReturns = [
  { id: '4', assetName: 'iPad Pro 12.9"', assignee: 'Emily Chen', dueDate: 'Oct 28, 2023' },
  { id: '5', assetName: 'Logitech MX Master 3', assignee: 'David Smith', dueDate: 'Oct 29, 2023' },
  { id: '6', assetName: 'Standing Desk - Ergo', assignee: 'Jessica Williams', dueDate: 'Oct 31, 2023' },
];
// -----------------

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 pb-20 relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="mt-2 text-slate-400">Welcome back. Here is your operational snapshot for today.</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction 
              title="Register Asset" 
              description="Add new hardware or licenses to inventory"
              icon={PlusCircle}
              color="emerald"
            />
            <QuickAction 
              title="Book Resource" 
              description="Reserve equipment for upcoming projects"
              icon={CalendarPlus}
              color="blue"
            />
            <QuickAction 
              title="Raise Maintenance" 
              description="Report issues or schedule repairs"
              icon={Wrench}
              color="purple"
            />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpiData.map((kpi, idx) => (
              <KpiCard key={idx} {...kpi} />
            ))}
          </div>
        </div>

        {/* Returns Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overdue Returns (Highlighted) */}
          <div>
            <OverdueAlert items={overdueReturns} />
          </div>

          {/* Upcoming Returns */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/80 text-slate-300 ring-1 ring-inset ring-slate-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Upcoming Returns</h2>
                <p className="text-sm text-slate-400">Scheduled for the next 7 days</p>
              </div>
            </div>

            <div className="space-y-4">
              {upcomingReturns.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between border-b border-slate-800/50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-200">{item.assetName}</span>
                    <span className="text-sm text-slate-500">{item.assignee}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm text-slate-400">
                      Due: {item.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
