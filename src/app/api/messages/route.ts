import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import { openwa } from '@/lib/openwa';

const SendSchema = z.object({
  sessionId: z.string().uuid(),
  phone: z.string().min(6),
  message: z.string().min(1).max(4096),
});

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = SendSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'bad request' }, { status: 400 });
  const { sessionId, phone, message } = parsed.data;

  // Confirm the session belongs to this user
  const { data: session } = await supabase
    .from('whatsapp_sessions').select('*')
    .eq('id', sessionId).eq('user_id', user.id).single();
  if (!session) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const result = await openwa.sendMessage(session.openwa_session_id, phone, message);

  const admin = supabaseAdmin();
  await admin.from('messages').insert({
    user_id: user.id,
    session_id: session.id,
    direction: 'out',
    peer_number: phone,
    body: message,
    status: 'sent',
  });

  return NextResponse.json({ ok: true, result });
}

export async function GET(req: Request) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sessionId = new URL(req.url).searchParams.get('sessionId');
  const q = supabase.from('messages')
    .select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200);
  if (sessionId) q.eq('session_id', sessionId);

  const { data } = await q;
  return NextResponse.json(data ?? []);
}
