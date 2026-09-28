-- Profiles (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  full_name text,
  plan text default 'free',
  created_at timestamptz default now()
);

-- WhatsApp sessions (each belongs to ONE user)
create table whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  openwa_session_id text not null,          -- ID returned by OpenWA
  label text,                                -- friendly name e.g. "Sales line"
  phone_number text,                         -- filled after QR scan
  status text default 'pending',             -- pending | connected | disconnected
  qr_code text,                              -- data URL, cleared once connected
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on whatsapp_sessions(user_id);

-- Message log (inbound + outbound)
create table messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  session_id uuid references whatsapp_sessions(id) on delete cascade not null,
  direction text not null check (direction in ('in','out')),
  peer_number text,                          -- the customer's WhatsApp number
  body text,
  media_url text,
  status text default 'sent',
  created_at timestamptz default now()
);
create index on messages(user_id, created_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Row Level Security: users can only see their own rows
alter table profiles enable row level security;
alter table whatsapp_sessions enable row level security;
alter table messages enable row level security;

create policy "own profile"   on profiles          for all using (auth.uid() = id);
create policy "own sessions"  on whatsapp_sessions for all using (auth.uid() = user_id);
create policy "own messages"  on messages          for all using (auth.uid() = user_id);
