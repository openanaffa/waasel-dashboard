'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [err, setErr]           = useState<string|null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabaseBrowser().auth.signUp({
      email, password, options: { data: { full_name: name } },
    });
    if (error) return setErr(error.message);
    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen grid place-items-center bg-neutral-950 text-white p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <input className="w-full p-3 rounded-lg bg-white/5 border border-white/10"
               placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-3 rounded-lg bg-white/5 border border-white/10"
               placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full p-3 rounded-lg bg-white/5 border border-white/10"
               placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="w-full p-3 rounded-lg bg-emerald-500 text-black font-medium">Sign up</button>
        <p className="text-sm text-neutral-400">Already have an account? <Link href="/login" className="text-emerald-400">Log in</Link></p>
      </form>
    </main>
  );
}
