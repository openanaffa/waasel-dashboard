import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import SettingsForms from './SettingsForms';

export default async function Settings() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <SettingsForms
        userId={user.id}
        email={user.email ?? ''}
        fullName={profile?.full_name ?? ''}
        dailyCap={profile?.daily_message_cap ?? 200}
      />
    </div>
  );
}
