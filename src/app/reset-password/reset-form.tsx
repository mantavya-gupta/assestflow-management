'use client';

import { useActionState } from 'react';
import { resetPasswordAction } from '../auth/actions';
import { Loader2 } from 'lucide-react';

export function ResetForm({ token }: { token: string }) {
  const [state, action, isPending] = useActionState(resetPasswordAction, null);

  return (
    <form action={action} className="mt-8 space-y-6">
      <input type="hidden" name="token" value={token} />
      
      <div className="space-y-4 rounded-md shadow-sm">
        <div>
          <label htmlFor="password" className="sr-only">New Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="relative block w-full rounded-md border-0 bg-slate-800/50 py-3 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all"
            placeholder="New Password (min 8 characters)"
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
            'Update Password'
          )}
        </button>
      </div>
    </form>
  );
}
