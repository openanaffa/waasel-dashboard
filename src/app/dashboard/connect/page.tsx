'use client';
import { useState, useEffect } from 'react';

export default function Connect() {
  const [label, setLabel] = useState('My WhatsApp');
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);

  async function start() {
    setError(null);
    const r = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
    if (!r.ok) return setError((await r.json()).error ?? 'Failed to start session');
    setSession(await r.json());
  }

  // Poll status
  useEffect(() => {
    if (!session || session.status === 'connected') return;
    const t = setInterval(async () => {
      const r = await fetch(`/api/sessions/${session.id}`);
      if (r.ok) setSession(await r.json());
    }, 3000);
    return () => clearInterval(t);
  }, [session]);

  if (session?.status === 'connected') {
    return <div className="text-emerald-400 text-xl">✅ Connected as {session.phone_number}</div>;
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Connect WhatsApp</h1>
      {!session ? (
        <>
          <input value={label} onChange={e=>setLabel(e.target.value)}
                 className="w-full p-3 rounded-lg bg-white/5 border border-white/10"
                 placeholder="Label (e.g. Sales)" />
          <button onClick={start}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-medium">
            Generate QR
          </button>
        </>
      ) : (
        <>
          <p className="text-neutral-400">Open WhatsApp → Linked Devices → Scan this code:</p>
          {session.qr_code && (
            <img src={session.qr_code} alt="WhatsApp QR" className="w-64 h-64 bg-white rounded-xl p-3" />
          )}
          <p className="text-sm text-neutral-500">Waiting for scan…</p>
        </>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
