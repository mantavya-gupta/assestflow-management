import {
  Laptop,
  Wrench,
  Clock,
  CalendarPlus,
  AlertCircle
} from 'lucide-react';
import { KpiCard } from './kpi-card';
import { QuickAction } from './quick-action';

interface MyAsset {
  id: string;
  assetName: string;
  status: string;
  dueDate: string;
}

interface ReturnItem {
  id: string;
  assetName: string;
  dueDate: string;
  daysOverdue?: number;
}

interface EmployeeDashboardProps {
  data: any;
}

export function EmployeeDashboard({ data }: EmployeeDashboardProps) {
  const kpi = data?.kpi || {
    myAssets: 0,
    pendingRequests: 0,
    upcomingReturns: 0
  };

  const myAssetsList = data?.myAssetsList || [];
  const upcomingReturns = data?.upcomingReturns || [];

  const kpiData = [
    { title: 'My Assets', value: kpi.myAssets, icon: Laptop, color: 'blue' as const },
    { title: 'Pending Requests', value: kpi.pendingRequests, icon: Wrench, color: 'amber' as const },
    { title: 'Upcoming Returns', value: kpi.upcomingReturns, icon: Clock, color: 'emerald' as const }
  ];

  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">My Workspace</h1>
        <p className="mt-2 text-slate-400">Manage your assigned assets and requests.</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            title="Request Asset"
            description="Submit a request for new equipment"
            icon={CalendarPlus}
            color="blue"
          />
          <QuickAction
            title="Report Issue"
            description="Log a maintenance request for your asset"
            icon={AlertCircle}
            color="purple"
          />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-4">My Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiData.map((kpiItem, idx) => (
            <KpiCard key={idx} {...kpiItem} />
          ))}
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* My Assets */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/80 text-slate-300 ring-1 ring-inset ring-slate-700">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">My Assets</h2>
              <p className="text-sm text-slate-400">Currently assigned to you</p>
            </div>
          </div>

          <div className="space-y-4">
            {myAssetsList.length === 0 ? (
               <div className="text-sm text-slate-500 italic">You don't have any assets assigned.</div>
            ) : (
              myAssetsList.map((asset: MyAsset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between border-b border-slate-800/50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-200">{asset.assetName}</span>
                    <span className="text-sm text-emerald-400">{asset.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm text-slate-400">
                      Return: {asset.dueDate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Returns */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/80 text-slate-300 ring-1 ring-inset ring-slate-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">My Upcoming Returns</h2>
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
                    {item.daysOverdue !== undefined && (
                      <span className="text-sm text-rose-500 font-semibold">{item.daysOverdue} days overdue</span>
                    )}
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
