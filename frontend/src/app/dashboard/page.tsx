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

async function getDashboardData() {
  try {
    const res = await fetch('http://localhost:4000/api/dashboard/summary', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data');
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  
  // Default fallbacks if backend is unavailable
  const kpi = data?.kpi || {
    assetsAvailable: 0,
    assetsAllocated: 0,
    maintenanceToday: 0,
    activeBookings: 0,
    pendingTransfers: 0,
    upcomingReturns: 0
  };

  const overdueReturns = data?.overdueReturns || [];
  const upcomingReturns = data?.upcomingReturns || [];

  const kpiData = [
    { title: 'Assets Available', value: kpi.assetsAvailable, icon: Laptop, color: 'emerald' as const },
    { title: 'Assets Allocated', value: kpi.assetsAllocated, icon: MonitorCheck, color: 'blue' as const },
    { title: 'Maintenance Today', value: kpi.maintenanceToday, icon: Wrench, color: 'rose' as const },
    { title: 'Active Bookings', value: kpi.activeBookings, icon: CalendarCheck, color: 'purple' as const },
    { title: 'Pending Transfers', value: kpi.pendingTransfers, icon: ArrowLeftRight, color: 'amber' as const },
    { title: 'Upcoming Returns', value: kpi.upcomingReturns, icon: Clock, color: 'slate' as const },
  ];

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
            {kpiData.map((kpiItem, idx) => (
              <KpiCard key={idx} {...kpiItem} />
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
              {upcomingReturns.length === 0 ? (
                 <div className="text-sm text-slate-500 italic">No upcoming returns scheduled.</div>
              ) : (
                upcomingReturns.map((item: any) => (
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
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
