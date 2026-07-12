"use client";

import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  user: {
    name: string;
    role: string;
    email: string;
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include' // crucial to send the HTTP-only cookie
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    // Hard navigate to clear all Next.js client-side cache and force a
    // server-side re-evaluation of the (now deleted) session cookie.
    window.location.href = '/login';
  };

  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 ring-1 ring-inset ring-slate-700">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-white">{user.name}</h2>
          <p className="text-xs text-slate-400 capitalize">
            {user.role.replace(/_/g, ' ').toLowerCase()}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700 hover:text-white rounded-lg transition-colors ring-1 ring-inset ring-slate-700/50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );
}
