-- Tạo dự án UEH – Rennes trên Supabase: 10 hạng mục × 4 ĐẦU VIỆC THƯỜNG XUYÊN (có chu kỳ + quy trình chuẩn SOP) + MÃ THAM GIA
-- Chạy SAU schema.sql, security.sql và add-admin.sql. Chạy lại không tạo trùng.
-- Đầu việc chưa có người phụ trách chính → quản lý chọn trong web, rồi "Mở đợt mới" để giao việc có deadline.

do $$
declare
  admin_id text := (select id from public.records where kind = 'users' and data->>'role' = 'admin' order by updated_at limit 1);
  code text := upper(substr(md5(random()::text), 1, 4) || '-' || substr(md5(random()::text), 1, 4));
  now_ts text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
begin
  if admin_id is null then raise exception 'Chưa có quản trị. Hãy chạy add-admin.sql trước.'; end if;

  if not exists (select 1 from public.records where kind = 'projects' and id = 'p_rennes') then
    insert into public.records (kind, id, data) values ('projects', 'p_rennes', jsonb_build_object(
      'id', 'p_rennes',
      'name', 'Song bằng UEH – Rennes',
      'code', 'UEH-RENNES',
      'description', 'Cử nhân song bằng UEH – Université de Rennes. Điều phối 10 hạng mục vận hành chương trình.',
      'color', '#03616a',
      'startDate', to_char(current_date, 'YYYY-MM-DD'),
      'endDate', to_char(current_date + 365, 'YYYY-MM-DD'),
      'createdBy', admin_id,
      'createdAt', now_ts,
      'members', jsonb_build_array(jsonb_build_object('userId', admin_id, 'role', 'manager')),
      'categories', '[{"id":"c01","no":"01","name":"Quản trị chương trình, hành chính và văn bản","icon":"FileText"},{"id":"c02","no":"02","name":"Quản lý khóa và hồ sơ sinh viên","icon":"Users"},{"id":"c03","no":"03","name":"Kế hoạch đào tạo và lịch giảng","icon":"CalendarDays"},{"id":"c04","no":"04","name":"Khảo thí, chuyển đổi điểm và tốt nghiệp","icon":"GraduationCap"},{"id":"c05","no":"05","name":"Giảng viên, đợt công tác và hợp đồng","icon":"Presentation"},{"id":"c06","no":"06","name":"Hậu cần giảng viên Rennes","icon":"Plane"},{"id":"c07","no":"07","name":"Học phí và thanh toán cho Rennes","icon":"Coins"},{"id":"c08","no":"08","name":"Chi phí vận hành và quyết toán tài chính","icon":"Calculator"},{"id":"c09","no":"09","name":"Công tác sinh viên, truyền thông và đảm bảo chất lượng","icon":"MessagesSquare"},{"id":"c10","no":"10","name":"Quản trị dữ liệu, báo cáo và kiểm soát tiến độ","icon":"BarChart3"}]'::jsonb,
      'tags', '[{"id":"tg1","name":"Rennes","color":"#03616a"},{"id":"tg2","name":"Văn bản","color":"#2563eb"},{"id":"tg3","name":"Tài chính","color":"#d4712f"},{"id":"tg4","name":"Cần ký duyệt","color":"#c62828"},{"id":"tg5","name":"Sinh viên","color":"#16a34a"},{"id":"tg6","name":"Định kỳ","color":"#7c3aed"}]'::jsonb,
      'joinCode', code
    ));
  end if;

  -- Xóa các đầu việc dạng cũ (bản trước tạo 40 việc lẻ tr_01..tr_40) nếu chưa ai cập nhật
  delete from public.records where kind = 'tasks' and id like 'tr\_%' and data->>'projectId' = 'p_rennes'
    and data->>'status' = 'todo' and data->'assigneeIds' = '[]'::jsonb;

  insert into public.records (kind, id, data)
  select 'tasks', 'p_rennes_' || t.id, jsonb_build_object(
    'id', 'p_rennes_' || t.id, 'projectId', 'p_rennes', 'categoryId', t.cat, 'title', t.title,
    'isStream', true, 'cadence', t.cadence, 'sop', t.sop, 'ownerId', null,
    'description', '', 'assigneeIds', '[]'::jsonb, 'createdBy', admin_id, 'priority', 'medium', 'status', 'doing',
    'startDate', null, 'dueDate', null, 'checklist', '[]'::jsonb, 'tagIds', t.tags, 'parentId', null,
    'createdAt', now_ts, 'updatedAt', now_ts, 'completedAt', null)
  from (values
    ('s01', 'c01', 'MOA, phụ lục hợp tác và các văn bản liên quan', 'year', '["Rà soát điều khoản hiện hành","Soạn dự thảo phụ lục/điều chỉnh","Trình lãnh đạo & pháp chế góp ý","Ký kết và lưu bản gốc"]'::jsonb, '["tg2"]'::jsonb),
    ('s02', 'c01', 'Công văn, xác nhận với đối tác và cơ quan liên quan', 'batch', '["Soạn dự thảo công văn","Trình ký","Gửi & lấy số công văn","Theo dõi phản hồi"]'::jsonb, '["tg2"]'::jsonb),
    ('s03', 'c01', 'Phân công trách nhiệm, quy trình phối hợp', 'year', '["Cập nhật ma trận phân công (RACI)","Họp thống nhất với các bên","Ban hành & phổ biến"]'::jsonb, '["tg2"]'::jsonb),
    ('s04', 'c01', 'Họp điều hành, biên bản và theo dõi cam kết', 'monthly', '["Chuẩn bị agenda & tài liệu","Gửi thư mời","Ghi biên bản","Giao việc phát sinh & theo dõi cam kết"]'::jsonb, '["tg6"]'::jsonb),
    ('s05', 'c02', 'Quản lý các khóa K50, K51, K52', 'term', '["Cập nhật sĩ số từng khóa","Đối chiếu tình trạng học tập","Báo cáo tổng hợp khóa"]'::jsonb, '["tg5"]'::jsonb),
    ('s06', 'c02', 'Danh sách sinh viên, đăng ký song bằng và tình trạng học tập', 'term', '["Mở đăng ký song bằng","Thu & kiểm tra hồ sơ","Chốt danh sách","Cập nhật tình trạng học tập"]'::jsonb, '["tg5"]'::jsonb),
    ('s07', 'c02', 'Tài khoản, quyền truy cập hệ thống Rennes (LMS, email…)', 'batch', '["Xuất danh sách SV cần cấp","Gửi file mẫu cho IT Rennes","Nhận & phân phối tài khoản","Hỗ trợ SV đăng nhập lần đầu"]'::jsonb, '["tg1"]'::jsonb),
    ('s08', 'c02', 'Chuyển danh sách sinh viên năm 3 và cập nhật với Rennes', 'year', '["Lọc SV đủ điều kiện năm 3","Xác nhận nguyện vọng với SV","Gửi danh sách cho Rennes","Cập nhật phản hồi của Rennes"]'::jsonb, '["tg1"]'::jsonb),
    ('s09', 'c03', 'Kế hoạch đào tạo, học phần UEH/Rennes', 'year', '["Rà soát CTĐT hai bên","Đối chiếu học phần tương đương","Trình duyệt kế hoạch","Công bố cho SV"]'::jsonb, '["tg1"]'::jsonb),
    ('s10', 'c03', 'Lịch giảng, xác nhận hai phía và bố trí phòng học', 'term', '["Lập lịch dự kiến","Rennes xác nhận lịch GV","Đăng ký phòng học","Công bố thời khóa biểu"]'::jsonb, '["tg1"]'::jsonb),
    ('s11', 'c03', 'Xử lý trùng lịch, ghép lớp (K50–K51), tổ chức pre-course', 'batch', '["Rà soát trùng lịch","Phương án ghép lớp","Thông báo SV","Tổ chức pre-course"]'::jsonb, '[]'::jsonb),
    ('s12', 'c03', 'Theo dõi điều chỉnh và cập nhật cho các bên liên quan', 'ongoing', '["Ghi nhận thay đổi lịch","Cập nhật TKB & LMS","Thông báo GV/SV/Rennes"]'::jsonb, '[]'::jsonb),
    ('s13', 'c04', 'Tổ chức kiểm tra/thi và quản lý kết quả', 'term', '["Lập lịch thi","Chuẩn bị đề & phòng thi","Tổ chức thi","Nhập & công bố điểm"]'::jsonb, '["tg5"]'::jsonb),
    ('s14', 'c04', 'Quy đổi điểm, công nhận tín chỉ giữa hai trường', 'term', '["Nhận bảng điểm từ Rennes","Quy đổi theo thang điểm","Trình Hội đồng công nhận","Cập nhật hệ thống"]'::jsonb, '["tg1"]'::jsonb),
    ('s15', 'c04', 'Xử lý phúc khảo và các trường hợp đặc biệt', 'batch', '["Tiếp nhận đơn","Phối hợp GV chấm lại","Trả kết quả cho SV"]'::jsonb, '["tg5"]'::jsonb),
    ('s16', 'c04', 'Xét điều kiện và thủ tục cấp hai bằng', 'year', '["Rà soát điều kiện tốt nghiệp","Đối chiếu với Rennes","Trình xét công nhận","Làm thủ tục cấp bằng"]'::jsonb, '["tg4"]'::jsonb),
    ('s17', 'c05', 'Phân công giảng viên UEH và Rennes, số giờ giảng', 'term', '["Tổng hợp nhu cầu giảng dạy","Đề xuất phân công","Rennes xác nhận GV","Chốt số giờ giảng"]'::jsonb, '[]'::jsonb),
    ('s18', 'c05', 'Hồ sơ giảng viên và hợp đồng thỉnh giảng theo từng đợt', 'batch', '["Thu thập CV, bằng cấp, hộ chiếu","Soạn hợp đồng","Trình ký","Lưu hồ sơ"]'::jsonb, '["tg4"]'::jsonb),
    ('s19', 'c05', 'Theo dõi tiến độ giảng dạy và xác nhận hoàn thành', 'ongoing', '["Theo dõi buổi dạy","Thu xác nhận số giờ","Gửi xác nhận hoàn thành cho tài chính"]'::jsonb, '[]'::jsonb),
    ('s20', 'c05', 'Đánh giá, phản hồi về hoạt động giảng dạy', 'term', '["Gửi khảo sát SV","Tổng hợp kết quả","Gửi phản hồi cho GV"]'::jsonb, '[]'::jsonb),
    ('s21', 'c06', 'Vé máy bay, khách sạn, visa và các thủ tục liên quan', 'batch', '["Gửi thư mời làm visa","Đặt vé khứ hồi","Đặt khách sạn","Gửi lịch trình cho GV xác nhận"]'::jsonb, '["tg1"]'::jsonb),
    ('s22', 'c06', 'Đón tiễn, di chuyển, ăn uống và nơi làm việc', 'batch', '["Đặt xe đón tiễn sân bay","Chuẩn bị phòng làm việc","Sắp xếp ăn uống"]'::jsonb, '["tg1"]'::jsonb),
    ('s23', 'c06', 'Lịch công tác, hỗ trợ trong thời gian giảng dạy', 'batch', '["Lập lịch công tác chi tiết","Phân công người hỗ trợ","Xử lý phát sinh"]'::jsonb, '[]'::jsonb),
    ('s24', 'c06', 'Theo dõi thay đổi (chuyến bay, lưu trú, lịch làm việc)', 'ongoing', '["Ghi nhận thay đổi","Cập nhật đặt chỗ","Thông báo các bên"]'::jsonb, '[]'::jsonb),
    ('s25', 'c07', 'Quản lý nghĩa vụ học phí của sinh viên', 'term', '["Thông báo mức học phí","Theo dõi tình hình nộp","Nhắc SV chậm nộp"]'::jsonb, '["tg3"]'::jsonb),
    ('s26', 'c07', 'Đối soát số lượng sinh viên và căn cứ tính tiền', 'term', '["Xuất danh sách SV đã đóng","Đối chiếu với danh sách Rennes","Chốt số liệu"]'::jsonb, '["tg3"]'::jsonb),
    ('s27', 'c07', 'Lập đề nghị chuyển tiền cho Rennes', 'term', '["Lập bảng tính","Trình duyệt","Gửi Phòng KHTC chuyển tiền"]'::jsonb, '["tg4"]'::jsonb),
    ('s28', 'c07', 'Xác nhận Rennes đã nhận và đối soát công nợ (nếu có)', 'term', '["Gửi chứng từ chuyển tiền","Nhận xác nhận của Rennes","Đối soát công nợ"]'::jsonb, '["tg3"]'::jsonb),
    ('s29', 'c08', 'Lập và theo dõi dự toán theo học kỳ/năm', 'year', '["Thu thập nhu cầu chi","Lập dự toán","Trình duyệt","Theo dõi thực hiện"]'::jsonb, '["tg3"]'::jsonb),
    ('s30', 'c08', 'Thanh toán thù lao giảng viên, vé máy bay, khách sạn…', 'batch', '["Thu hồ sơ thanh toán","Kiểm tra chứng từ","Trình ký","Chuyển Phòng KHTC"]'::jsonb, '["tg3"]'::jsonb),
    ('s31', 'c08', 'Kiểm tra, lưu trữ chứng từ và hồ sơ thanh toán', 'monthly', '["Kiểm tra tính hợp lệ","Scan & lưu hồ sơ điện tử","Lưu bản gốc"]'::jsonb, '["tg6"]'::jsonb),
    ('s32', 'c08', 'Quyết toán chi phí và báo cáo theo quy định', 'year', '["Tổng hợp chi phí","Đối chiếu dự toán","Lập báo cáo quyết toán","Trình duyệt"]'::jsonb, '["tg4"]'::jsonb),
    ('s33', 'c09', 'Định hướng, hỗ trợ và chăm sóc sinh viên', 'ongoing', '["Tổ chức buổi định hướng","Tiếp nhận & xử lý yêu cầu SV","Theo dõi SV cần hỗ trợ"]'::jsonb, '["tg5"]'::jsonb),
    ('s34', 'c09', 'Khảo sát môn học, thu thập phản hồi và đánh giá giảng viên', 'term', '["Thiết kế phiếu khảo sát","Gửi SV","Tổng hợp & báo cáo"]'::jsonb, '["tg5"]'::jsonb),
    ('s35', 'c09', 'Truyền thông hoạt động chương trình và tuyển sinh khóa tiếp theo', 'ongoing', '["Lập kế hoạch truyền thông","Sản xuất nội dung","Đăng tải & đo lường"]'::jsonb, '[]'::jsonb),
    ('s36', 'c09', 'Theo dõi, đề xuất cải tiến và đảm bảo chất lượng chương trình', 'year', '["Tổng hợp phản hồi các bên","Đề xuất cải tiến","Họp thông qua & theo dõi"]'::jsonb, '[]'::jsonb),
    ('s37', 'c10', 'Quản lý dữ liệu, hồ sơ điện tử và lưu trữ có hệ thống', 'ongoing', '["Chuẩn hóa cấu trúc thư mục","Cập nhật dữ liệu định kỳ","Sao lưu"]'::jsonb, '["tg6"]'::jsonb),
    ('s38', 'c10', 'Báo cáo định kỳ (học kỳ, năm) cho hai phía', 'term', '["Thu thập số liệu","Soạn báo cáo","Trình duyệt","Gửi UEH & Rennes"]'::jsonb, '["tg6"]'::jsonb),
    ('s39', 'c10', 'Theo dõi tiến độ, các đầu việc chờ xác nhận và rủi ro phát sinh', 'ongoing', '["Rà soát việc quá hạn/chờ duyệt","Cập nhật danh sách rủi ro","Báo cáo trong họp điều hành"]'::jsonb, '[]'::jsonb),
    ('s40', 'c10', 'Cập nhật Dashboard vận hành và cảnh báo các mốc quan trọng', 'ongoing', '["Cập nhật số liệu dashboard","Kiểm tra cảnh báo mốc","Gửi nhắc việc"]'::jsonb, '["tg6"]'::jsonb)
  ) as t(id, cat, title, cadence, sop, tags)
  on conflict (kind, id) do nothing;

  insert into public.records (kind, id, data) values ('activities', 'a_rennes_init', jsonb_build_object(
    'id', 'a_rennes_init', 'projectId', 'p_rennes', 'taskId', null, 'userId', admin_id,
    'text', 'tạo dự án với 10 hạng mục và 40 đầu việc thường xuyên', 'createdAt', now_ts))
  on conflict (kind, id) do nothing;
end $$;

-- Mã tham gia (gửi mã này cho mọi người)
select data->>'name' as du_an, data->>'joinCode' as ma_tham_gia,
  (select count(*) from public.records where kind = 'tasks' and data->>'projectId' = 'p_rennes' and (data->>'isStream')::boolean) as so_dau_viec
from public.records where kind = 'projects' and id = 'p_rennes';

-- Đổi tên dự án (nếu đã tạo trước đó với tên cũ)
update public.records set data = jsonb_set(data, '{name}', '"Song bằng UEH – Rennes"'), updated_at = now()
where kind = 'projects' and id = 'p_rennes' and data->>'name' <> 'Song bằng UEH – Rennes';
