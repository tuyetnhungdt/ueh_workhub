-- Đưa 6 giảng viên Đại học Rennes vào dự án "Song bằng UEH – Rennes" (dữ liệu THẬT, chỉ thành viên dự án xem được)
-- Nguồn: Đề án chương trình (5a), Lý lịch khoa học 06 GV UR (PL4.3), Hợp đồng thỉnh giảng số 1150/HĐTG-ĐHKT-TC.
-- Chạy SAU seed-rennes.sql. Chạy lại không tạo trùng (chỉ thêm GV chưa có).

do $$
declare
  now_ts text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
  admin_id text := (select id from public.records where kind = 'users' and data->>'role' = 'admin' order by updated_at limit 1);
  addr text := 'Faculté des Sciences Économiques, 7 place Hoche, CS 86514, 35065 Rennes Cedex, France';
  docs jsonb := '[{"text":"CV / LLKH","done":true},{"text":"Bản sao bằng cấp","done":false},{"text":"Hộ chiếu","done":false},{"text":"HĐ thỉnh giảng đã ký","done":false},{"text":"Bảng trừ thuế TNCN 20% đã ký","done":false},{"text":"Bảng điểm đã gửi","done":false}]'::jsonb;
  r record;
begin
  if not exists (select 1 from public.records where kind = 'projects' and id = 'p_rennes') then
    raise exception 'Chưa có dự án p_rennes. Hãy chạy seed-rennes.sql trước.';
  end if;

  for r in select * from (values
    ('martin', 'Franck Martin', 'Professor of Economics, PhD (Paris 1), Agrégation', 'franck.martin@univ-rennes.fr', '+33 6 79 59 54 55',
     'Kinh tế lượng chuỗi thời gian; Kinh tế lượng dữ liệu bảng; Sản phẩm phái sinh; Kinh tế lượng tài chính và Mô hình hóa tài chính', 'K50, K51',
     'Econometrics, Risk Management, Macroeconomics, Finance', 144, '1150/HĐTG-ĐHKT-TC', '2026-09-10', '2027-09-10', 'Đang trình ký',
     '1965-12-23', '04 Les Vignes, 35250 Saint-Sulpice-La-Forêt, France', '19AC37193', '28/01/2019 – Préfecture de l''Ille-et-Vilaine, Rennes',
     'FR76 1007 1350 0000 0010 0000 135', 'Trésor Public (10071) · BIC TRPUFRP1',
     'Điều phối học thuật phía Đại học Rennes (MOA). HĐ 10/09/2026–10/09/2027.'),
    ('rondeau', 'Fabien Rondeau', 'Full Professor, PhD (Rennes 1), HDR', 'fabien.rondeau@univ-rennes.fr', '+33 (0)2 23 23 33 66',
     'Kinh tế vĩ mô; Tài chính quốc tế', 'K51', 'Macroeconomics, International Economics, Trade and Integration, European Union', 72, '', '', '', 'Đã ký HĐ',
     '', '', '', '', '', '', 'Phiếu đặt phòng BK4744.'),
    ('poutineau', 'Jean-Christophe Poutineau', 'Full Professor (Professeur des Universités), Classe exceptionnelle', 'jean-christophe.poutineau@univ-rennes.fr', '',
     'Tiền tệ, Ngân hàng và Thị trường tài chính; Tài chính quốc tế', 'K51', 'Macroeconomics, International Finance, Monetary Policy, Business Cycles', 72, '', '', '', 'Chưa có',
     '', '', '', '', '', '', ''),
    ('tavera', 'Christophe Tavera', 'Full Professor in Economics, PhD, HDR', 'christophe.tavera@univ-rennes.fr', '',
     'Kinh tế vĩ mô; Kinh tế lượng chuỗi thời gian; Kinh tế lượng dữ liệu bảng', 'K51', 'Applied econometrics, Forecasting, Economic convergence', 108, '', '', '', 'Chưa có',
     '', '', '', '', '', '', 'Vice Dean for International Relations, Faculty of Economics.'),
    ('casteuble', 'Cécile Casteuble', 'Assistant Professor in Economics, PhD (Limoges)', 'cecile.casteuble@univ-rennes.fr', '+33 (0)2 23 23 34 28',
     'Tiền tệ, Ngân hàng và Thị trường tài chính', 'K51', 'Banking and finance: capital markets, banks'' governance, risks', 36, '', '', '', 'Chưa có',
     '', '', '', '', '', '', ''),
    ('razafindrabe', 'Tovonony Razafindrabe', 'Associate Professor (tenure, HDR)', 'tovonony.razafindrabe@univ-rennes.fr', '',
     'Sản phẩm phái sinh; Kinh tế lượng tài chính và Mô hình hóa tài chính', 'K50', 'Commodity & energy macroeconomics, Climate change, International finance, Exchange rates', 72, '', '', '', 'Chưa có',
     '', '', '', '', '', '', 'Pedagogical supervisor, Master 2 Finance-Data.')
  ) as t(slug, full_name, title, email, phone, courses, cohorts, spec, hours, contract_no, c_from, c_to, c_status, dob, home, passport, passport_issued, iban, bank, note)
  loop
    insert into public.records (kind, id, data) values ('items', 'lec_' || r.slug, jsonb_build_object(
      'id', 'lec_' || r.slug, 'projectId', 'p_rennes', 'module', 'lecturers',
      'fullName', r.full_name, 'side', 'Rennes', 'academicTitle', r.title, 'email', r.email, 'phone', r.phone,
      'courses', r.courses, 'cohorts', r.cohorts, 'specialization', r.spec, 'hoursPlanned', r.hours, 'hoursDone', 0,
      'contractNo', r.contract_no, 'contractFrom', r.c_from, 'contractTo', r.c_to, 'contractStatus', r.c_status, 'gradesSent', 'Chưa gửi điểm', 'rateEur', 104,
      'dob', r.dob, 'address', coalesce(nullif(r.home, ''), addr), 'passport', r.passport, 'passportIssued', r.passport_issued,
      'bankAccount', r.iban, 'bankName', r.bank, 'taxCode', '', 'docs', docs, 'files', '[]'::jsonb, 'syllabi', '[]'::jsonb, 'note', r.note,
      'createdAt', now_ts, 'updatedAt', now_ts, 'createdBy', admin_id, 'updatedBy', admin_id))
    on conflict (kind, id) do nothing;
  end loop;
end $$;

select data->>'fullName' as giang_vien, data->>'courses' as hoc_phan, data->>'contractStatus' as hop_dong
from public.records where kind = 'items' and data->>'module' = 'lecturers' and data->>'projectId' = 'p_rennes'
order by data->>'fullName';
