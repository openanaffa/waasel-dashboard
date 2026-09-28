import 'server-only';

const BASE = process.env.OPENWA_BASE_URL!;
const KEY  = process.env.OPENWA_API_KEY!;

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`OpenWA ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

// NOTE: adjust paths if your OpenWA build uses different routes.
// Run `curl -H "Authorization: Bearer $KEY" $OPENWA_BASE_URL/api/...` to confirm.
export const openwa = {
  listSessions: () => call<any[]>('/api/sessions'),
  startSession: (label: string) =>
    call<any>('/api/session/start', { method: 'POST', body: JSON.stringify({ name: label }) }),
  getSession: (id: string) => call<any>(`/api/sessions/${id}`),
  sendMessage: (sessionId: string, phone: string, message: string) =>
    call<any>('/api/sendMessage', {
      method: 'POST',
      body: JSON.stringify({ sessionId, phone, message }),
    }),
};
