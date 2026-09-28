import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';

export async function DELETE() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Best-effort: stop all their OpenWA sessions before deleting rows
  const { data: sessions } = await supabase
    .from('whatsapp_sessions')
    .select('openwa_session_id')
    .eq('user_id', user.id);

  for (const s of sessions ?? []) {
    try {
      await fetch(`${process.env.OPENWA_BASE_URL}/api/sessions/${s.openwa_session_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${process.env.OPENWA_API_KEY}` },
      });
    } catch { /* ignore — deletion of the DB rows is what matters */ }
  }

  // Delete the auth user (cascade removes profiles/sessions/messages via FK)
  const admin = supabaseAdmin();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
