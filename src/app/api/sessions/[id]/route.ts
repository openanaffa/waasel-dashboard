import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { openwa } from '@/lib/openwa';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Ownership check — RLS already does this, but be explicit
  const { data: row } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });

  // Refresh status from OpenWA
  const live = await openwa.getSession(row.openwa_session_id);
  await supabase.from('whatsapp_sessions').update({
    status: live.status ?? row.status,
    phone_number: live.phone ?? row.phone_number,
    qr_code: live.status === 'connected' ? null : (live.qr ?? row.qr_code),
    updated_at: new Date().toISOString(),
  }).eq('id', row.id);

  return NextResponse.json({ ...row, ...live });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  await supabase.from('whatsapp_sessions')
    .delete().eq('id', params.id).eq('user_id', user.id);

  return NextResponse.json({ ok: true });
}
