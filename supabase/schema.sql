-- UEH WorkHub – bật chế độ dùng chung (nhiều người, đồng bộ thời gian thực)
-- 1) Tạo project tại https://supabase.com → SQL Editor → dán toàn bộ file này → Run
-- 2) Lấy Project URL + anon public key (Settings → API) và đặt vào biến môi trường trên Vercel:
--    VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY  → Redeploy
-- 3) Người đầu tiên đăng ký sẽ là Quản trị (admin).

create table if not exists public.records (
  kind text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (kind, id)
);

-- Cấp quyền Data API cho người đã đăng nhập (cần khi tắt "Automatically expose new tables")
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.records to authenticated;
revoke all on public.records from anon;

alter table public.records enable row level security;

-- Chỉ người đã đăng nhập mới đọc/ghi được (nội bộ tổ chức)
drop policy if exists "auth read" on public.records;
drop policy if exists "auth write" on public.records;
create policy "auth read" on public.records for select to authenticated using (true);
create policy "auth write" on public.records for all to authenticated using (true) with check (true);

-- Realtime: mọi thay đổi được đẩy tới tất cả người đang mở web
alter table public.records replica identity full;
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'records') then
    alter publication supabase_realtime add table public.records;
  end if;
end $$;
