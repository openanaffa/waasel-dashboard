'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

type Props = {
  userId: string;
  email: string;
  fullName: string;
  dailyCap: number;
};

export default function SettingsForms({ userId, email, fullName, dailyCap }: Props) {
  const router = useRouter();

  /* ---- Profile ---- */
  const [name, setName]   = useState(fullName);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    const { error } = await supabaseBrowser()
      .from('profiles')
      .update({ full_name: name })
      .eq('id', userId);
    setProfileMsg(error ? error.message : 'Saved ✓');
  }

  /* ---- Password ---- */
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw1 !== pw2) return setPwMsg('Passwords do not match');
    if (pw1.length < 8) return setPwMsg('Minimum 8 characters');
    const { error } = await supabaseBrowser().auth.updateUser({ password: pw1 });
    if (error) return setPwMsg(error.message);
    setPw1(''); setPw2('');
    setPwMsg('Password updated ✓');
  }

  /* ---- Sending preferences ---- */
  const [cap, setCap] = useState(dailyCap);
  const [prefMsg, setPrefMsg] = useState<string | null>(null);

  async function savePreferences(e: React.FormEvent) {
    e.preventDefault();
    setPrefMsg(null);
    const safe = Math.max(1, Math.min(1000, Number(cap) || 200));
    const { error } = await supabaseBrowser()
      .from('profiles')
      .update({ daily_message_cap: safe })
      .eq('id', userId);
    setPrefMsg(error ? error.message : 'Preferences saved ✓');
  }

  /* ---- Delete account ---- */
  const [confirm, setConfirm] = useState('');
  const [delMsg, setDelMsg] = useState<string | null>(null);

  async function deleteAccount() {
    if (confirm !== 'DELETE') return setDelMsg('Type DELETE to confirm');
    setDelMsg(null);
    const res = await fetch('/api/account', { method: 'DELETE' });
    if (!res.ok) return setDelMsg((await res.json().catch(() => ({}))).error ?? 'Failed');
    await supabaseBrowser().auth.signOut();
    router.push('/');
    router.refresh();
  }

  /* ---- Sign out ---- */
  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Profile */}
      <section className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
        <h2 className="text-lg font-semibold">Profile</h2>
        <form onSubmit={saveProfile} className="space-y-3">
          <label className="block text-sm text-neutral-400">Full name</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10"
          />
          <label className="block text-sm text-neutral-400">Email</label>
          <input
            value={email} disabled
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-neutral-500 cursor-not-allowed"
          />
          <button className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-medium">Save</button>
          {profileMsg && <p className="text-sm text-emerald-400">{profileMsg}</p>}
        </form>
      </section>

      {/* Password */}
      <section className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
        <h2 className="text-lg font-semibold">Change password</h2>
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" placeholder="New password"
                 value={pw1} onChange={(e) => setPw1(e.target.value)}
                 className="w-full p-3 rounded-lg bg-white/5 border border-white/10" />
          <input type="password" placeholder="Confirm new password"
                 value={pw2} onChange={(e) => setPw2(e.target.value)}
                 className="w-full p-3 rounded-lg bg-white/5 border border-white/10" />
          <button className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-medium">Update</button>
          {pwMsg && <p className="text-sm text-emerald-400">{pwMsg}</p>}
        </form>
      </section>

      {/* Sending preferences */}
      <section className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
        <h2 className="text-lg font-semibold">Sending limits</h2>
        <p className="text-sm text-neutral-400">
          Your daily cap. Lower is safer for new WhatsApp numbers. Max 1000.
        </p>
        <form onSubmit={savePreferences} className="space-y-3">
          <input type="number" min={1} max={1000}
                 value={cap} onChange={(e) => setCap(Number(e.target.value))}
                 className="w-full p-3 rounded-lg bg-white/5 border border-white/10" />
          <button className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-medium">Save</button>
          {prefMsg && <p className="text-sm text-emerald-400">{prefMsg}</p>}
        </form>
      </section>

      {/* Sign out */}
      <section className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
        <button onClick={signOut} className="px-4 py-2 rounded-lg border border-white/20">
          Sign out
        </button>
      </section>

      {/* Danger zone */}
      <section className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-3">
        <h2 className="text-lg font-semibold text-red-400">Delete account</h2>
        <p className="text-sm text-neutral-400">
          Permanently deletes your account, sessions, and message history. Cannot be undone.
        </p>
        <input
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder='Type "DELETE" to confirm'
          className="w-full p-3 rounded-lg bg-white/5 border border-white/10"
        />
        <button onClick={deleteAccount}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium">
          Delete my account
        </button>
        {delMsg && <p className="text-sm text-red-400">{delMsg}</p>}
      </section>
    </>
  );
}
