-- UEH WorkHub – KHÓA QUYỀN TRONG DATABASE (chạy SAU schema.sql; chạy lại nhiều lần không sao)
-- • Mỗi người chỉ đọc được dự án mình là thành viên (quản trị thấy tất cả)
-- • Muốn vào dự án phải nhập đúng mã tham gia (hàm join_project)
-- • Chỉ quản trị mới cấp được quyền quản trị; chỉ quản lý dự án mới sửa được thông tin/thành viên dự án

-- ---------- Hàm hỗ trợ (security definer: đọc bảng mà không bị vòng lặp RLS) ----------
create or replace function public.my_profile_id() returns text
language sql stable security definer set search_path = public as $$
  select id from public.records
  where kind = 'users' and data->>'authId' = auth.uid()::text
  limit 1
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.records
    where kind = 'users' and data->>'authId' = auth.uid()::text and data->>'role' = 'admin'
  )
$$;

create or replace function public.is_member(pid text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.records p
    where p.kind = 'projects' and p.id = pid
      and p.data->'members' @> jsonb_build_array(jsonb_build_object('userId', public.my_profile_id()))
  )
$$;

create or replace function public.is_manager(pid text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.records p
    where p.kind = 'projects' and p.id = pid
      and p.data->'members' @> jsonb_build_array(jsonb_build_object('userId', public.my_profile_id(), 'role', 'manager'))
  )
$$;

-- ---------- Tham gia dự án bằng mã ----------
create or replace function public.join_project(p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare
  pid text;
  me text := public.my_profile_id();
begin
  if me is null then raise exception 'Chưa có hồ sơ người dùng, hãy tải lại trang'; end if;
  select id into pid from public.records
   where kind = 'projects' and upper(data->>'joinCode') = upper(trim(p_code))
   limit 1;
  if pid is null then raise exception 'Mã dự án không đúng'; end if;
  update public.records
     set data = jsonb_set(data, '{members}', coalesce(data->'members', '[]'::jsonb) || jsonb_build_array(jsonb_build_object('userId', me, 'role', 'member'))),
         updated_at = now()
   where kind = 'projects' and id = pid
     and not (coalesce(data->'members', '[]'::jsonb) @> jsonb_build_array(jsonb_build_object('userId', me)));
  return pid;
end
$$;

revoke all on function public.join_project(text) from public, anon;
grant execute on function public.join_project(text) to authenticated;

-- ---------- Chặn tự nâng quyền quản trị ----------
create or replace function public.guard_records() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() null = chạy từ SQL Editor/dashboard → cho phép
  if auth.uid() is not null and new.kind = 'users' and not public.is_admin() then
    if new.data->>'role' = 'admin'
       and (tg_op = 'INSERT' or coalesce(old.data->>'role', '') <> 'admin') then
      raise exception 'Chỉ quản trị mới cấp được quyền quản trị';
    end if;
  end if;
  return new;
end
$$;

drop trigger if exists guard_records on public.records;
create trigger guard_records before insert or update on public.records
for each row execute function public.guard_records();

-- ---------- Chính sách đọc / ghi ----------
drop policy if exists "auth read" on public.records;
drop policy if exists "auth write" on public.records;
drop policy if exists "read scoped" on public.records;
drop policy if exists "insert scoped" on public.records;
drop policy if exists "update scoped" on public.records;
drop policy if exists "delete scoped" on public.records;

create policy "read scoped" on public.records for select to authenticated using (
  kind = 'users'
  or (kind = 'projects' and public.is_member(id))
  or (kind in ('tasks', 'comments', 'activities', 'items') and public.is_member(data->>'projectId'))
  or (kind = 'notifications' and data->>'userId' = public.my_profile_id())
);

create policy "insert scoped" on public.records for insert to authenticated with check (
  (kind = 'users' and (data->>'authId' = auth.uid()::text or public.is_admin()))
  or (kind = 'projects' and public.is_admin())
  or (kind in ('tasks', 'comments', 'activities', 'items') and public.is_member(data->>'projectId'))
  or (kind = 'notifications')
);

create policy "update scoped" on public.records for update to authenticated
using (
  (kind = 'users' and (
      data->>'authId' = auth.uid()::text
      or public.is_admin()
      or (data->>'authId' is null and lower(data->>'email') = lower(auth.jwt()->>'email'))  -- gắn tài khoản với hồ sơ khai báo sẵn
  ))
  or (kind = 'projects' and public.is_manager(id))
  or (kind in ('tasks', 'comments', 'activities', 'items') and public.is_member(data->>'projectId'))
  or (kind = 'notifications' and data->>'userId' = public.my_profile_id())
)
with check (
  (kind = 'users' and (data->>'authId' = auth.uid()::text or public.is_admin()))
  or (kind = 'projects' and public.is_manager(id))
  or (kind in ('tasks', 'comments', 'activities', 'items') and public.is_member(data->>'projectId'))
  or (kind = 'notifications')
);

create policy "delete scoped" on public.records for delete to authenticated using (
  (kind = 'projects' and public.is_admin())
  or (kind in ('tasks', 'comments', 'items') and public.is_manager(data->>'projectId'))
  or (kind = 'users' and public.is_admin())
);

-- ---------- Kho file (Supabase Storage): bucket riêng tư "files", đường dẫn <projectId>/<tên file> ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('files', 'files', false, 52428800)  -- tối đa 50MB/file
on conflict (id) do nothing;

drop policy if exists "files read members" on storage.objects;
drop policy if exists "files upload members" on storage.objects;
drop policy if exists "files delete members" on storage.objects;
create policy "files read members" on storage.objects for select to authenticated
  using (bucket_id = 'files' and public.is_member(split_part(name, '/', 1)));
create policy "files upload members" on storage.objects for insert to authenticated
  with check (bucket_id = 'files' and public.is_member(split_part(name, '/', 1)));
create policy "files delete members" on storage.objects for delete to authenticated
  using (bucket_id = 'files' and public.is_member(split_part(name, '/', 1)));
