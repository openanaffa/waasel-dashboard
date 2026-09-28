import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { openwa } from '@/lib/openwa';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: row } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const live = await openwa.getSession(row.openwa_session_id);
  await supabase.from('whatsapp_sessions').update({
    status: live.status ?? row.status,
    phone_number: live.phone ?? row.phone_number,
    qr_code: live.status === 'connected' ? null : (live.qr ?? row.qr_code),
    updated_at: new Date().toISOString(),
  }).eq('id', row.id);

  return NextResponse.json({ ...row, ...live });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  await supabase.from('whatsapp_sessions')
    .delete().eq('id', id).eq('user_id', user.id);

  return NextResponse.json({ ok: true });
}
