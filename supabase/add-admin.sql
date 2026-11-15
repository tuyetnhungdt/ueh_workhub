-- CẤP QUYỀN QUẢN TRỊ cho một email (chạy trong SQL Editor; chạy lại không sao)
-- • Nếu người này ĐÃ đăng nhập web (đã có hồ sơ) → nâng hồ sơ đó lên Quản trị
-- • Nếu CHƯA → tạo hồ sơ khai báo sẵn; lần đầu đăng nhập sẽ tự nhận quyền Quản trị
-- Chỉ cần sửa email (và tên) ở 2 dòng có dấu ←, rồi Run. Sau đó tải lại trang web.

do $$
declare
  v_email text := lower(trim('email-cua-ban@ueh.edu.vn'));  -- ← sửa
  v_name  text := 'Họ và tên quản trị';                     -- ← sửa (chỉ dùng khi tạo mới)
  n int;
begin
  update public.records
     set data = jsonb_set(data, '{role}', '"admin"'), updated_at = now()
   where kind = 'users' and lower(data->>'email') = v_email;
  get diagnostics n = row_count;

  if n = 0 then
    insert into public.records (kind, id, data) values ('users', 'u_admin_' || substr(md5(v_email), 1, 8), jsonb_build_object(
      'id', 'u_admin_' || substr(md5(v_email), 1, 8), 'name', v_name, 'email', v_email,
      'title', 'Quản trị chương trình', 'role', 'admin', 'color', '#03616a'));
    raise notice 'Đã tạo hồ sơ quản trị cho %', v_email;
  else
    raise notice 'Đã nâng % hồ sơ lên Quản trị', n;
  end if;
end $$;

-- Kiểm tra
select data->>'name' as ten, data->>'email' as email, data->>'role' as quyen,
       case when data ? 'authId' then 'đã đăng nhập' else 'chưa đăng nhập' end as trang_thai
from public.records where kind = 'users' order by data->>'role', data->>'name';
