import { ForgotForm } from './forgot-form';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="z-10 w-full max-w-md space-y-8 rounded-2xl bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl border border-slate-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email to receive a reset link
          </p>
        </div>
        <ForgotForm />
        <div className="text-center text-sm text-slate-400 mt-6">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
