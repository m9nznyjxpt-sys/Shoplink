-- ShopLink: chạy toàn bộ file này trong Supabase > SQL Editor
create table if not exists public.devices (
  id text primary key check (id ~ '^device_[0-9a-f-]{36}$'),
  status text not null default 'pending' check (status in ('pending','approved','revoked')),
  label text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
create table if not exists public.chests (
  id bigserial primary key,
  code text unique not null,
  type text not null default 'box' check (type in ('box','tele','clover','bag')),
  cur int not null default 0,
  max int not null default 0,
  flag text, rate numeric, views int default 0, level int,
  note text, link text, sec int default 47,
  created_at timestamptz not null default now()
);
create index if not exists chests_created_idx on public.chests (created_at desc);
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);

alter table public.devices enable row level security;
alter table public.chests  enable row level security;
alter table public.admins  enable row level security;  -- không có policy: chỉ truy cập qua is_admin()

create or replace function public.device_id() returns text
language sql stable as $$ select nullif(current_setting('request.headers', true)::json->>'x-device-id','') $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- Thiết bị: tự đăng ký (chỉ ở trạng thái pending) và chỉ đọc được dòng của chính mình
create policy dev_insert on public.devices for insert to anon, authenticated with check (status = 'pending');
create policy dev_self   on public.devices for select to anon, authenticated using (id = public.device_id());
create policy dev_admin  on public.devices for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Rương: chỉ thiết bị đã được duyệt mới đọc được (kiểm tra ở phía server)
create policy chest_read on public.chests for select to anon, authenticated
  using (exists (select 1 from public.devices d where d.id = public.device_id() and d.status = 'approved'));
create policy chest_admin on public.chests for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Sau khi tạo tài khoản admin trong Authentication > Users, chạy (đổi email):
-- insert into public.admins select id from auth.users where email = 'ban@example.com';
-- Tùy chọn dọn rương cũ: delete from public.chests where created_at < now() - interval '1 day';
