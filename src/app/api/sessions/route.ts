import { NextResponse } from 'next/server';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { openwa } from '@/lib/openwa';

// GET /api/sessions → only *my* sessions
export async function GET() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json(data ?? []);
}

// POST /api/sessions → create a new OpenWA session, store mapping to current user
export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { label } = await req.json().catch(() => ({ label: 'My WhatsApp' }));

  // Call OpenWA as admin, then remember only the session ID
  const created = await openwa.startSession(label);

  // Use service role to insert (RLS would also allow it, but this guarantees user_id)
  const admin = supabaseAdmin();
  const { data: row, error } = await admin
    .from('whatsapp_sessions')
    .insert({
      user_id: user.id,
      openwa_session_id: created.id ?? created.sessionId ?? created.name,
      label,
      status: 'pending',
      qr_code: created.qr ?? created.qrCode ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(row);
}
