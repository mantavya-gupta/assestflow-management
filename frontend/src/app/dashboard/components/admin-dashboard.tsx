import {
  Laptop,
  MonitorCheck,
  Wrench,
  Clock,
  Package,
  Building2,
  UserCircle,
  PlusCircle,
  CalendarPlus,
  ArrowLeftRight,
  Database,
  CalendarCheck
} from 'lucide-react';
import Link from 'next/link';
import { KpiCard } from './kpi-card';
import { QuickAction } from './quick-action';
import { OverdueAlert } from './overdue-alert';

interface ReturnItem {
  id: string;
  assetName: string;
  assignee: string;
  dueDate: string;
  daysOverdue?: number;
}

interface AdminDashboardProps {
  data: any;
}

export function AdminDashboard({ data }: AdminDashboardProps) {
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
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Overview</h1>
        <p className="mt-2 text-slate-400">Welcome back. Here is your global operational snapshot for today.</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/assets/register">
            <QuickAction
              title="Register Asset"
              description="Add new hardware or licenses to inventory"
              icon={PlusCircle}
              color="emerald"
            />
          </Link>
          <Link href="/dashboard/allocations/new">
            <QuickAction
              title="Book Resource"
              description="Reserve equipment for upcoming projects"
              icon={CalendarPlus}
              color="blue"
            />
          </Link>
          <Link href="/dashboard/maintenance/new">
            <QuickAction
              title="Raise Maintenance"
              description="Report issues or schedule repairs"
              icon={Wrench}
              color="purple"
            />
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-4">Global Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiData.map((kpiItem, idx) => (
            <KpiCard key={idx} {...kpiItem} />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-4">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/assets">
            <QuickAction
              title="Asset Directory"
              description="View full inventory and lifecycle history"
              icon={Database}
              color="emerald"
            />
          </Link>
          <Link href="/dashboard/allocations">
            <QuickAction
              title="Active Allocations"
              description="Track current assignments and return assets"
              icon={Package}
              color="blue"
            />
          </Link>
          <Link href="/dashboard/transfers">
            <QuickAction
              title="Transfer Requests"
              description="Approve re-assignments between employees"
              icon={ArrowLeftRight}
              color="amber"
            />
          </Link>
        </div>
      </div>

      {/* Returns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <OverdueAlert items={overdueReturns} />
        </div>

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
    </>
  );
}
