'use client';
import { useEffect, useState } from 'react';

export default function Messages() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [phone, setPhone]       = useState('');
  const [text, setText]         = useState('');
  const [history, setHistory]   = useState<any[]>([]);

  useEffect(() => { fetch('/api/sessions').then(r=>r.json()).then(setSessions); }, []);
  useEffect(() => {
    const q = sessionId ? `?sessionId=${sessionId}` : '';
    fetch(`/api/messages${q}`).then(r=>r.json()).then(setHistory);
  }, [sessionId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, phone, message: text }),
    });
    if (r.ok) { setText(''); setHistory(h => [/* optimistic */, ...h]); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Messages</h1>

      <form onSubmit={send} className="grid gap-3 max-w-lg">
        <select value={sessionId} onChange={e=>setSessionId(e.target.value)}
                className="p-3 rounded-lg bg-white/5 border border-white/10">
          <option value="">Select a session…</option>
          {sessions.map(s => <option key={s.id} value={s.id}>{s.label} ({s.phone_number ?? 'pending'})</option>)}
        </select>
        <input value={phone} onChange={e=>setPhone(e.target.value)}
               placeholder="Recipient (e.g. 2126XXXXXXXX)"
               className="p-3 rounded-lg bg-white/5 border border-white/10" />
        <textarea value={text} onChange={e=>setText(e.target.value)}
                  placeholder="Message" rows={3}
                  className="p-3 rounded-lg bg-white/5 border border-white/10" />
        <button disabled={!sessionId || !phone || !text}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-medium disabled:opacity-40">
          Send
        </button>
      </form>

      <section>
        <h2 className="text-lg font-semibold mb-3">History</h2>
        <ul className="space-y-2">
          {history.map(m => (
            <li key={m.id} className={`p-3 rounded-lg border border-white/10 ${m.direction==='out'?'ml-12':'mr-12'}`}>
              <div className="text-xs text-neutral-500">{m.direction==='out'?'→':'←'} {m.peer_number}</div>
              <div>{m.body}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
