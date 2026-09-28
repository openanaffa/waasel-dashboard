import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      <aside className="w-60 border-r border-white/10 p-6 space-y-2">
        <div className="font-bold mb-6">Bouskoura<span className="text-emerald-400">.</span></div>
        {[
          ['/dashboard',           'Overview'],
          ['/dashboard/connect',   'Connect'],
          ['/dashboard/messages',  'Messages'],
          ['/dashboard/settings',  'Settings'],
        ].map(([href, label]) => (
          <Link key={href} href={href}
                className="block px-3 py-2 rounded-lg hover:bg-white/5 text-neutral-300">
            {label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
