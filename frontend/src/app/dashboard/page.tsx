import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
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
import { API_URL } from '@/lib/api';

interface ReturnItem {
  id: string;
  assetName: string;
  assignee: string;
  dueDate: string;
  daysOverdue?: number;
}

async function getDashboardData() {
  // The backend now requires auth on this endpoint, so the visitor's
  // session cookie has to be forwarded explicitly — a server-side fetch
  // does not automatically carry the browser's cookies.
  const sessionCookie = (await cookies()).get('session');

  if (!sessionCookie) {
    // Next.js middleware already redirects unauthenticated visitors away
    // from /dashboard, but this is a safe fallback if it's ever reached
    // without a session (e.g. cookie expired between middleware and here).
    redirect('/login');
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/dashboard/summary`, {
      cache: 'no-store',
      headers: {
        Cookie: `session=${sessionCookie.value}`,
      },
    });
  } catch (error) {
    console.error(error);
    // Graceful fallback if the backend is unreachable — the page still
    // renders with zeroed-out KPIs instead of crashing.
    return null;
  }

  // redirect() throws internally, so this must stay outside the try/catch
  // above or the redirect would be swallowed as a fetch failure.
  if (res.status === 401) {
    redirect('/login');
  }

  if (!res.ok) {
    console.error('Failed to fetch dashboard data:', res.status);
    return null;
  }

  const json = await res.json();
  return json.data;
}

export default async function DashboardPage() {
  const data = await getDashboardData();

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
                upcomingReturns.map((item: ReturnItem) => (
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
