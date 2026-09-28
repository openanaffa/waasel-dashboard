'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr]           = useState<string | null>(null);
  const [busy, setBusy]         = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen grid place-items-center bg-neutral-950 text-white p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-neutral-400 mt-1">Log in to your dashboard</p>
        </div>

        <input
          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-500 outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <input
          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-emerald-500 outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <button
          disabled={busy}
          className="w-full p-3 rounded-lg bg-emerald-500 text-black font-medium disabled:opacity-50"
        >
          {busy ? 'Logging in…' : 'Log in'}
        </button>

        <p className="text-sm text-neutral-400">
          No account?{' '}
          <Link href="/signup" className="text-emerald-400">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
