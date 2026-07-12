'use client';

import { useActionState } from 'react';
import { forgotPasswordAction } from '../auth/actions';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function ForgotForm() {
  const [state, action, isPending] = useActionState(forgotPasswordAction, null);

  if (state?.success) {
    return (
      <div className="mt-8 space-y-6 text-center">
        <div className="rounded-md bg-emerald-950/50 p-4 border border-emerald-900">
          <p className="text-sm font-medium text-emerald-400">{state.success}</p>
        </div>
        {state._mockLink && (
          <div className="mt-4 text-xs text-slate-400 break-all p-2 bg-slate-950 rounded border border-slate-800">
            [Demo Only] Link: <Link href={state._mockLink} className="text-emerald-500 hover:underline">{state._mockLink}</Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-6">
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

      {state?.error && (
        <div className="text-red-400 text-sm text-center bg-red-950/50 py-2 rounded-md border border-red-900">
          {state.error}
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
