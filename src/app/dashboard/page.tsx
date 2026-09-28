import { supabaseServer } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Overview() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: sessions }, { count: msgCount }] = await Promise.all([
    supabase.from('whatsapp_sessions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome back</h1>

      <div className="grid grid-cols-2 gap-6">
        <Stat label="Sessions" value={sessions?.length ?? 0} />
        <Stat label="Messages sent & received" value={msgCount ?? 0} />
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your WhatsApp lines</h2>
          <Link href="/dashboard/connect"
                className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-medium">
            + Connect new
          </Link>
        </div>
        {sessions?.length ? (
          <ul className="space-y-2">
            {sessions.map(s => (
              <li key={s.id} className="p-4 rounded-xl border border-white/10 flex justify-between">
                <div>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-sm text-neutral-400">{s.phone_number ?? 'Not connected yet'}</div>
                </div>
                <StatusPill status={s.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-400">No sessions yet. Click “Connect new” to get started.</p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-neutral-400 text-sm mt-1">{label}</div>
    </div>
  );
}
function StatusPill({ status }: { status: string }) {
  const color = status === 'connected' ? 'bg-emerald-500/20 text-emerald-300'
              : status === 'pending'   ? 'bg-amber-500/20 text-amber-300'
              : 'bg-red-500/20 text-red-300';
  return <span className={`self-start px-3 py-1 rounded-full text-xs ${color}`}>{status}</span>;
}
