'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Without this, the browser discards the Set-Cookie header on this
        // cross-origin response and the session cookie never gets stored.
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setIsPending(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4 rounded-md shadow-sm">
        <div>
          <label htmlFor="email" className="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="relative block w-full rounded-t-md border-0 bg-slate-800/50 py-3 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="relative block w-full rounded-b-md border-0 bg-slate-800/50 py-3 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all"
            placeholder="Password"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm text-center bg-red-950/50 py-2 rounded-md border border-red-900">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="group relative flex w-full justify-center rounded-md bg-emerald-600 py-3 px-3 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Sign in'
          )}
        </button>
      </div>
      
      <div className="flex items-center justify-between text-sm mt-4">
        <Link href="/forgot-password" className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
          Forgot your password?
        </Link>
        <Link href="/signup" className="text-slate-400 hover:text-white font-medium transition-colors">
          Sign up
        </Link>
      </div>
    </form>
  );
}
