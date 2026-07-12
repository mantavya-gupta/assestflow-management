"use client";

import { useState } from 'react';
import { DepartmentTab } from './components/department-tab';
import { EmployeeTab } from './components/employee-tab';
import { Building2, Users, Settings } from 'lucide-react';

export default function OrganizationSetupPage() {
  const [activeTab, setActiveTab] = useState<'departments' | 'employees' | 'settings'>('departments');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 pb-20 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Organization Setup</h1>
          <p className="mt-2 text-slate-400">Configure master data, departments, and roles for AssetFlow.</p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-slate-800 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('departments')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === 'departments'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Departments
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === 'employees'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Users className="h-4 w-4" />
              Employee Directory
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Settings className="h-4 w-4" />
              Global Settings (Coming Soon)
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'departments' && <DepartmentTab />}
          {activeTab === 'employees' && <EmployeeTab />}
          {activeTab === 'settings' && (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
              <Settings className="h-8 w-8 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300">Global Settings</h3>
              <p className="text-slate-500 mt-2">This feature is not yet available.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
