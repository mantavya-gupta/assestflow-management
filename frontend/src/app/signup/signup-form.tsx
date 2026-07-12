'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{name?: string, email?: string, password?: string}>({});
  const [isPending, setIsPending] = useState(false);
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const pass = formData.get('password') as string;

    // Client-side validation
    let hasError = false;
    const errors: any = {};
    if (name.length < 2) { errors.name = "Name must be at least 2 characters"; hasError = true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errors.email = "Invalid email format"; hasError = true; }
    if (pass.length < 8) { errors.password = "Password must be at least 8 characters"; hasError = true; }
    else if (!/[A-Z]/.test(pass)) { errors.password = "Password must contain at least one uppercase letter"; hasError = true; }
    else if (!/[a-z]/.test(pass)) { errors.password = "Password must contain at least one lowercase letter"; hasError = true; }
    else if (!/[0-9]/.test(pass)) { errors.password = "Password must contain at least one number"; hasError = true; }
    else if (!/[^A-Za-z0-9]/.test(pass)) { errors.password = "Password must contain at least one special character"; hasError = true; }

    if (hasError) {
      setFieldErrors(errors);
      setIsPending(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setIsPending(false);
        return;
      }

      router.push('/login?registered=true');
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-5 rounded-md shadow-sm">
        <div>
          <label htmlFor="name" className="sr-only">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={`relative block w-full rounded-t-md border-0 bg-slate-800/50 py-3 px-4 text-white ring-1 ring-inset ${fieldErrors.name ? 'ring-rose-500 focus:ring-rose-500' : 'ring-slate-700 focus:ring-emerald-500'} placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all`}
            placeholder="Full Name"
            onChange={() => setFieldErrors({...fieldErrors, name: ''})}
          />
          {fieldErrors.name && <p className="text-rose-400 text-xs mt-1 ml-1">{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`relative block w-full border-0 bg-slate-800/50 py-3 px-4 text-white ring-1 ring-inset ${fieldErrors.email ? 'ring-rose-500 focus:ring-rose-500' : 'ring-slate-700 focus:ring-emerald-500'} placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all`}
            placeholder="Email address"
            onChange={() => setFieldErrors({...fieldErrors, email: ''})}
          />
          {fieldErrors.email && <p className="text-rose-400 text-xs mt-1 ml-1">{fieldErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors({...fieldErrors, password: ''});
            }}
            className={`relative block w-full rounded-b-md border-0 bg-slate-800/50 py-3 px-4 text-white ring-1 ring-inset ${fieldErrors.password ? 'ring-rose-500 focus:ring-rose-500' : 'ring-slate-700 focus:ring-emerald-500'} placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all`}
            placeholder="Password (min 8 chars, 1 uppercase, 1 special)"
          />
          {fieldErrors.password && <p className="text-rose-400 text-xs mt-1 ml-1">{fieldErrors.password}</p>}
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
            'Create Account'
          )}
        </button>
      </div>
    </form>
  );
}
