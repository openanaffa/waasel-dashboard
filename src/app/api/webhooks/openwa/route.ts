import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret');
  if (secret !== process.env.OPENWA_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  // Adapt these fields to your OpenWA webhook payload
  const { sessionId, from, body: text, mediaUrl } = body;

  const admin = supabaseAdmin();
  const { data: s } = await admin
    .from('whatsapp_sessions')
    .select('id, user_id')
    .eq('openwa_session_id', sessionId)
    .single();
  if (!s) return NextResponse.json({ ok: true });

  await admin.from('messages').insert({
    user_id: s.user_id,
    session_id: s.id,
    direction: 'in',
    peer_number: from,
    body: text,
    media_url: mediaUrl,
  });

  return NextResponse.json({ ok: true });
}
