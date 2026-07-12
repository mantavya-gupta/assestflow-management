'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function ForgotForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mockLink, setMockLink] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setMockLink(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');

    try {
      const res = await fetch('http://localhost:4000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Request failed');
        setIsPending(false);
        return;
      }

      setSuccess(data.success);
      setMockLink(data._mockLink);
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsPending(false);
    }
  }

  if (success) {
    return (
      <div className="mt-8 space-y-6 text-center">
        <div className="rounded-md bg-emerald-950/50 p-4 border border-emerald-900">
          <p className="text-sm font-medium text-emerald-400">{success}</p>
        </div>
        {mockLink && (
          <div className="mt-4 text-xs text-slate-400 break-all p-2 bg-slate-950 rounded border border-slate-800">
            [Demo Only] Link: <Link href={mockLink} className="text-emerald-500 hover:underline">{mockLink}</Link>
          </div>
        )}
      </div>
    );
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
            className="relative block w-full rounded-md border-0 bg-slate-800/50 py-3 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all"
            placeholder="Email address"
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
            'Send Reset Link'
          )}
        </button>
      </div>
    </form>
  );
}
