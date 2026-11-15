// Dữ liệu bàn làm việc dự án Song bằng UEH – Rennes (Chính thức từ hồ sơ dự án)
import { addDays } from '../lib/utils.js'
import { LECTURERS_ALL, LEGAL_DOSSIER } from '../data/rennesData.js'

export function buildItems(pid = 'p1') {
  const out = []
  let n = 0
  const push = (module, data, by = 'u2') => out.push({
    id: `i_${module}_${++n}`,
    projectId: pid,
    module,
    createdBy: by,
    updatedBy: by,
    createdAt: new Date(Date.now() - n * 36e5).toISOString(),
    updatedAt: new Date(Date.now() - n * 18e5).toISOString(),
    ...data
  })

  /* ---- 1. VĂN BẢN & PHÁP LÝ (Toàn bộ 36 tài liệu nguồn từ Các mục chi tiết + Văn bản điều hành) ---- */
  ;[
    ['Biên bản ghi nhớ hợp tác (MOA) UEH – Université de Rennes', 'MOA', 'MOA/2024/UEH-UR', -420, 'Université de Rennes', 'Đã ký', addDays(680), 'u1', [
      {
        id: 'dc_moa_1', authorId: 'u2', authorName: 'ThS. Nguyễn Văn Thiện Tâm', authorRole: 'Nhân sự chính',
        text: 'Đã hoàn tất rà soát 8 học phần song bằng thuộc giai đoạn 2. Điều khoản học phí €900/SV/năm đã được hai bên thống nhất.',
        createdAt: new Date(Date.now() - 30 * 864e5).toISOString(), resolved: true, resolvedAt: new Date(Date.now() - 25 * 864e5).toISOString(), resolvedBy: 'u1',
        replies: [{ id: 'dc_moa_1_r1', authorId: 'u1', authorName: 'TS. Tô Công Nguyên Bảo', authorRole: 'Quản lý dự án', text: 'Rất tốt, lưu bản gốc có chữ ký hai Hiệu trưởng vào hồ sơ chương trình.', createdAt: new Date(Date.now() - 26 * 864e5).toISOString() }]
      }
    ]],
    ['Thỏa thuận điều chỉnh MOA: Rennes phụ trách 8 học phần', 'Phụ lục hợp tác', 'PL02/2026', -5, 'Université de Rennes', 'Đang trình ký', '', 'u1', [
      {
        id: 'dc_pl_1', authorId: 'u3', authorName: 'ThS. Hoàng Thị Phương Anh', authorRole: 'Nhân sự chính',
        text: 'Phòng KHTC yêu cầu làm rõ phương thức khấu trừ thuế TNCN 20% cho giảng viên Rennes thỉnh giảng (thực nhận net 104 EUR/h hay gross).',
        createdAt: new Date(Date.now() - 4 * 864e5).toISOString(), resolved: false,
        replies: [
          { id: 'dc_pl_1_r1', authorId: 'u8', authorName: 'Franck Martin', authorRole: 'Đầu mối Rennes', text: 'We agreed that UEH withholds 20% personal income tax in Vietnam. The 104 EUR per teaching hour is net to the visiting professor.', createdAt: new Date(Date.now() - 3 * 864e5).toISOString() },
          { id: 'dc_pl_1_r2', authorId: 'u1', authorName: 'TS. Tô Công Nguyên Bảo', authorRole: 'Quản lý dự án', text: 'Đã cập nhật công thức tính gross trong dự toán thù lao để trình ký BGH.', createdAt: new Date(Date.now() - 2 * 864e5).toISOString() }
        ]
      },
      {
        id: 'dc_pl_2', authorId: 'u2', authorName: 'ThS. Nguyễn Văn Thiện Tâm', authorRole: 'Nhân sự chính',
        text: 'Kiểm tra lại phụ lục danh mục 8 học phần: đảm bảo khớp tên tiếng Anh giữa đề án và hệ thống quản lý đào tạo.',
        createdAt: new Date(Date.now() - 2 * 864e5).toISOString(), resolved: false, replies: []
      }
    ]],
    ['Công văn xác nhận danh sách SV K52 gửi Rennes', 'Công văn đi', '1254/ĐHKT-ISB', -2, 'Université de Rennes', 'Đã gửi', '', 'u2', []],
    ['Công văn Rennes thông báo lịch giảng HK2', 'Công văn đến', 'UR-IGR-2026-118', -9, 'Université de Rennes', 'Đã ký', '', 'u2', []],
    ['Quyết định phân công nhiệm vụ năm học 2026–2027', 'Quyết định', '2087/QĐ-ĐHKT', -20, 'Nội bộ', 'Đã ký', '', 'u1', []],
    ['Biên bản họp điều hành tháng 10', 'Biên bản họp', 'BB-10/2026', -26, 'Nội bộ', 'Đã ký', '', 'u2', []],
    ['Kế hoạch đào tạo năm học 2026–2027', 'Kế hoạch', 'KH-ISB-2026', -3, 'Nội bộ', 'Dự thảo', '', 'u2', []],
    ['Brochure tuyển sinh song bằng 2026 (bản VIE & FR)', 'Khác', 'BRO-2026', -1, 'Truyền thông', 'Chờ góp ý', '', 'u7', []],
    ['Relevé d\'Identité Bancaire (RIB) chính thức – Université de Rennes', 'Văn bản pháp lý', 'RIB-UR-2023/05', -180, 'Université de Rennes / Trésor Public', 'Đã ký', '', 'u1', []],
    ['Kế hoạch & Lịch giảng 5 môn HKC2026 – Giảng viên ĐH Rennes', 'Kế hoạch', 'LHP-HKC2026-RENNES', -110, 'Université de Rennes & UEH', 'Đã ký', '', 'u2', []],
    ['Lộ trình đào tạo 3 giai đoạn UEH–Rennes 2026–2027 (Teaching Plan)', 'Kế hoạch', 'TP-RENNES-2026-2027', -120, 'Université de Rennes', 'Đã ký', '', 'u2', []],
  ].forEach(([title, docType, number, d, partner, status, expiry, owner, docComments = []]) =>
    push('docs', { title, docType, number, date: addDays(d), partner, status, expiry, owner, docComments, signers: status === 'Đang trình ký' ? [{ text: 'Rà soát nội dung', done: true, by: 'ThS. Nguyễn Văn Thiện Tâm' }, { text: 'Trưởng khoa ký', done: false }, { text: 'Đối tác Rennes ký', done: false }] : status === 'Dự thảo' ? [{ text: 'Góp ý của Ban điều hành', done: false }, { text: 'Trưởng khoa ký', done: false }] : [{ text: 'Rà soát nội dung', done: true }, { text: 'Trưởng khoa ký', done: true }], files: [{ name: number.replace(/\//g, '_') + '.pdf', size: 245000 + d * -800, type: 'application/pdf', at: new Date().toISOString() }], note: '' }, owner))

  // Toàn bộ 36 văn bản pháp lý chính thức từ thư mục 'Các mục chi tiết'
  LEGAL_DOSSIER.forEach((f, idx) => {
    const isSigned = !f.fileName.includes('Thoa thuan dieu chinh') || f.fileName.includes('Eng')
    push('docs', {
      title: f.fileName.replace(/\.pdf$/i, ''),
      docType: f.fileName.includes('MOA') ? 'MOA' : f.fileName.includes('QĐ') ? 'Quyết định' : f.fileName.includes('FIBAA') ? 'Khác' : f.fileName.includes('Syllabus') ? 'Kế hoạch' : f.fileName.includes('Đơn đề nghị') ? 'Công văn đi' : 'Văn bản pháp lý',
      number: `HS-RENNES-${String(idx + 1).padStart(2, '0')}`,
      date: addDays(-300 + idx * 8),
      partner: f.fileName.includes('UEH') ? 'UEH' : f.fileName.includes('UR') || f.fileName.includes('Rennes') ? 'Université de Rennes' : 'Bộ GD&ĐT / FIBAA',
      status: isSigned ? 'Đã ký' : 'Dự thảo',
      expiry: '',
      owner: 'u1',
      signers: [{ text: 'Ban điều hành kiểm tra', done: true }, { text: 'Quản lý dự án phê duyệt', done: isSigned }],
      files: [{ name: f.fileName, size: f.size, type: 'application/pdf', at: new Date().toISOString() }],
      note: 'Tài liệu nguồn từ hồ sơ chương trình UEH–Rennes (Các mục chi tiết)'
    }, 'u1')
  })

  /* ---- 2. ĐỘI NGŨ 66 GIẢNG VIÊN THỰC TẾ (6 GS Đại học Rennes + 60 Giảng viên UEH) ---- */
  const UEH_ASSIGNMENTS = [
    ["Đào Nguyên Anh", [{ course: "Kinh tế vi mô", code: 'ECN101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.103', s: '08:00', e: '11:30' }, { course: "Python lập mô hình TC & định giá", code: 'FIN307', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'Lab.403', s: '13:30', e: '17:00' }]],
    ["Hồ Hoàng Anh", [{ course: "Kinh tế lượng", code: 'ECN201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.205', s: '13:30', e: '17:00' }, { course: "Ngân hàng thương mại", code: 'BNK201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.306', s: '08:00', e: '11:30' }]],
    ["Nguyễn Ngọc Trâm Anh", [{ course: "Marketing", code: 'MKT101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.107', s: '13:30', e: '17:00' }]],
    ["Huỳnh Ngọc Quang Anh", [{ course: "Khoa học dữ liệu trong Tài chính", code: 'FIN305', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'Lab.401', s: '13:30', e: '17:00' }, { course: "Quản trị học", code: 'MGT101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.106', s: '08:00', e: '11:30' }]],
    ["Nguyễn Quốc Anh", [{ course: "Toán dành cho nhà quản trị", code: 'MTH101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.102', s: '08:00', e: '11:30' }, { course: "Quản trị rủi ro doanh nghiệp", code: 'MGT301', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.305', s: '08:00', e: '11:30' }]],
    ["Phùng Thanh Bình", [{ course: "Kế toán tài chính", code: 'ACC201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.207', s: '08:00', e: '11:30' }, { course: "Thống kê ứng dụng trong KT & KD", code: 'STA101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.105', s: '13:30', e: '17:00' }]],
    ["Đỗ Ngọc Bích", [{ course: "Phân tích tài chính", code: 'FIN302', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.308', s: '13:30', e: '17:00' }, { course: "Nguyên lý kế toán", code: 'ACC101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.104', s: '08:00', e: '11:30' }]],
    ["Tô Công Nguyên Bảo", [{ course: "Khoa học dữ liệu trong Tài chính", code: 'FIN305', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'Lab.401', s: '13:30', e: '17:00' }]],
    ["Đinh Khương Duy", [{ course: "Toán dành cho nhà quản trị", code: 'MTH101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.102', s: '08:00', e: '11:30' }]],
    ["Mai Nguyễn Dũng", [{ course: "Kinh tế vi mô", code: 'ECN101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.103', s: '08:00', e: '11:30' }]],
    ["Nguyễn Thị Diễm Em", [{ course: "Nguyên lý kế toán", code: 'ACC101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.104', s: '08:00', e: '11:30' }]],
    ["Trương Nữ Tô Giang", [{ course: "Thống kê ứng dụng trong KT & KD", code: 'STA101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.105', s: '13:30', e: '17:00' }]],
    ["Ngô Quang Huy", [{ course: "Quản trị học", code: 'MGT101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.106', s: '08:00', e: '11:30' }]],
    ["Bùi Quốc Huy", [{ course: "Đầu tư tài chính", code: 'FIN301', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.302', s: '13:30', e: '17:00' }, { course: "Luật kinh doanh", code: 'LAW101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.108', s: '08:00', e: '11:30' }]],
    ["Hoàng Việt Huy", [{ course: "Luật kinh doanh", code: 'LAW101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.108', s: '08:00', e: '11:30' }]],
    ["Bùi Thị Huyền", [{ course: "Tài chính doanh nghiệp nâng cao", code: 'FIN304', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.310', s: '08:00', e: '11:30' }]],
    ["Đặng Thị Mỹ Hạnh", [{ course: "Tài chính hành vi", code: 'FIN308', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.312', s: '13:30', e: '17:00' }]],
    ["Đinh Thị Thu Hồng", [{ course: "Kế toán quản trị", code: 'ACC301', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.301', s: '08:00', e: '11:30' }]],
    ["Dương Kha", [{ course: "Tài chính công ty đa quốc gia", code: 'FIN309', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.302', s: '08:00', e: '11:30' }]],
    ["Lê Thùy Khanh", [{ course: "Quản trị rủi ro tài chính", code: 'FIN310', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.304', s: '13:30', e: '17:00' }]],
    ["Trần Trung Kiên", [{ course: "SQL và Databases", code: 'IT301', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'Lab.402', s: '13:30', e: '17:00' }]],
    ["Lê Thanh Loan", [{ course: "Hoạch định ngân sách vốn đầu tư", code: 'FIN306', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.314', s: '08:00', e: '11:30' }]],
    ["Nguyễn Hoàng Long", [{ course: "Python lập mô hình TC & định giá", code: 'FIN307', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'Lab.403', s: '13:30', e: '17:00' }]],
    ["Hoàng Cửu Long", [{ course: "Quản trị rủi ro doanh nghiệp", code: 'MGT301', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.305', s: '08:00', e: '11:30' }]],
    ["Phạm Thị Lý", [{ course: "Điều hành công ty CP đại chúng", code: 'LAW301', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.306', s: '13:30', e: '17:00' }]],
    ["Trần Thị Hải Lý", [{ course: "Tài chính khởi nghiệp", code: 'FIN311', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.316', s: '08:00', e: '11:30' }]],
    ["Lê Thị Hồng Minh", [{ course: "Kinh doanh quốc tế", code: 'IBU101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.201', s: '13:30', e: '17:00' }]],
    ["Nguyễn Thị Ngọc Miên", [{ course: "Phát triển bền vững", code: 'SUS101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.202', s: '08:00', e: '11:30' }]],
    ["Phùng Đức Nam", [{ course: "Giới thiệu về Python", code: 'IT101', cohort: 'K52', cls: 'ISB-K52-01', room: 'Lab.404', s: '08:00', e: '11:30' }]],
    ["Trần Hoài Nam", [{ course: "Kỹ năng mềm", code: 'SKL101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.203', s: '13:30', e: '17:00' }]],
    ["Quách Doanh Nghiệp", [{ course: "Tư duy thiết kế", code: 'DT201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.308', s: '13:30', e: '17:00' }]],
    ["Thang Nguyen", [{ course: "Khởi nghiệp kinh doanh", code: 'ENT201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.309', s: '08:00', e: '11:30' }]],
    ["Nguyễn Thị Thảo Nguyên", [{ course: "VBA – Visual Basic for Applications", code: 'IT201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'Lab.405', s: '08:00', e: '11:30' }]],
    ["Đỗ Thị Hải Ninh", [{ course: "Luật doanh nghiệp", code: 'LAW102', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.204', s: '13:30', e: '17:00' }]],
    ["Lê Hoàng Oanh", [{ course: "Nhập môn tâm lý học", code: 'PSY101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.205', s: '08:00', e: '11:30' }]],
    ["Nguyễn Quang", [{ course: "Triết học Mác – Lê nin", code: 'POL101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.206', s: '08:00', e: '11:30' }]],
    ["Trần Thị Thảo Quyên", [{ course: "Kinh tế chính trị Mác – Lê nin", code: 'POL102', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.207', s: '13:30', e: '17:00' }]],
    ["Vũ Việt Quảng", [{ course: "Chủ nghĩa xã hội khoa học", code: 'POL201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.310', s: '08:00', e: '11:30' }]],
    ["Nguyễn Văn Sáng", [{ course: "Lịch sử Đảng Cộng sản VN", code: 'POL202', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.311', s: '13:30', e: '17:00' }]],
    ["Hoàng Xuân Sơn", [{ course: "Tư tưởng Hồ Chí Minh", code: 'POL301', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.312', s: '08:00', e: '11:30' }]],
    ["Bùi Xuân Thanh", [{ course: "Đầu tư tài chính", code: 'FIN301', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.302', s: '13:30', e: '17:00' }]],
    ["Đỗ Thị Kim Thanh", [{ course: "Tài chính doanh nghiệp", code: 'FIN201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.304', s: '08:00', e: '11:30' }]],
    ["Trần Thị Phương Thanh", [{ course: "Tiếng Pháp chuyên ngành", code: 'FRA102', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.101', s: '18:00', e: '20:30' }]],
    ["Từ Thị Kim Thoa", [{ course: "Kinh tế lượng", code: 'ECN201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.205', s: '13:30', e: '17:00' }]],
    ["Đặng Văn Thạc", [{ course: "Kế toán tài chính", code: 'ACC201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.207', s: '08:00', e: '11:30' }]],
    ["Nguyễn Kim Thảo", [{ course: "Ngân hàng thương mại", code: 'BNK201', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.306', s: '08:00', e: '11:30' }]],
    ["Đặng Thái Thịnh", [{ course: "Phân tích tài chính", code: 'FIN302', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.308', s: '13:30', e: '17:00' }]],
    ["Bùi Thị Lệ Thủy", [{ course: "Khoa học dữ liệu trong Tài chính", code: 'FIN305', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'Lab.401', s: '13:30', e: '17:00' }]],
    ["Hoàng Cẩm Trang", [{ course: "Toán dành cho nhà quản trị", code: 'MTH101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.102', s: '08:00', e: '11:30' }]],
    ["Nguyễn Thị Đài Trang", [{ course: "Kinh tế vi mô", code: 'ECN101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.103', s: '08:00', e: '11:30' }]],
    ["Đỗ Lâm Hoàng Trang", [{ course: "Nguyên lý kế toán", code: 'ACC101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.104', s: '08:00', e: '11:30' }]],
    ["Nguyễn Lê Ngân Trang", [{ course: "Thống kê ứng dụng trong KT & KD", code: 'STA101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.105', s: '13:30', e: '17:00' }]],
    ["Nguyễn Văn Thiện Tâm", [{ course: "Quản trị học", code: 'MGT101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.106', s: '08:00', e: '11:30' }]],
    ["Huỳnh Thiên Tứ", [{ course: "Marketing", code: 'MKT101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.107', s: '13:30', e: '17:00' }]],
    ["Đỗ Minh Tứ", [{ course: "Luật kinh doanh", code: 'LAW101', cohort: 'K52', cls: 'ISB-K52-01', room: 'B2.108', s: '08:00', e: '11:30' }]],
    ["Cao Quốc Việt", [{ course: "Tài chính doanh nghiệp nâng cao", code: 'FIN304', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.310', s: '08:00', e: '11:30' }]],
    ["Lê Thị Phương Vy", [{ course: "Tài chính hành vi", code: 'FIN308', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'A.312', s: '13:30', e: '17:00' }]],
    ["Nguyễn Khánh Vân", [{ course: "Kế toán quản trị", code: 'ACC301', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.301', s: '08:00', e: '11:30' }]],
    ["Ngô Minh Vũ", [{ course: "Tài chính công ty đa quốc gia", code: 'FIN309', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.302', s: '08:00', e: '11:30' }]],
    ["Nguyễn Triều Đông", [{ course: "Quản trị rủi ro tài chính", code: 'FIN310', cohort: 'K50–K51', cls: 'ISB-K51-01', room: 'B1.304', s: '13:30', e: '17:00' }]]
  ]

  /* ---- Giảng viên Đại học Rennes (theo Đề án 5a & LLKH PL4.3 của hồ sơ chương trình) ----
     Chỉ thông tin nghề nghiệp công khai; thông tin cá nhân (ngày sinh, hộ chiếu, tài khoản) KHÔNG đưa vào bản demo. */
  const DOCS = ['CV / LLKH', 'Bản sao bằng cấp', 'Hộ chiếu', 'HĐ thỉnh giảng đã ký', 'Bảng trừ thuế TNCN 20% đã ký', 'Bảng điểm đã gửi']
  const ADDR = 'Faculté des Sciences Économiques, 7 place Hoche, CS 86514, 35065 Rennes Cedex, France'
  ;[
    ['Franck Martin', 'Professor of Economics, PhD (Paris 1), Agrégation', 'franck.martin@univ-rennes.fr', '',
      'Kinh tế lượng chuỗi thời gian; Kinh tế lượng dữ liệu bảng; Sản phẩm phái sinh; Kinh tế lượng tài chính và Mô hình hóa tài chính',
      'K50–K51', 'Kinh tế lượng tài chính, Quản trị rủi ro, Kinh tế vĩ mô, Tài chính định lượng', 144, 0,
      '1150/HĐTG-ĐHKT-TC', 'Đang trình ký', 'Chưa gửi điểm', [1, 1, 1, 0, 0, 0],
      'Điều phối học thuật phía Đại học Rennes (MOA). Đồng trưởng Master Economic & Financial Engineering và Master Finance Data. HĐ 10/09/2026–10/09/2027 – GV chưa ký (cập nhật 11/11).'],
    ['Fabien Rondeau', 'Full Professor, PhD (Rennes 1), HDR', 'fabien.rondeau@univ-rennes.fr', '+33 (0)2 23 23 33 66',
      'Kinh tế vĩ mô; Tài chính quốc tế', 'K50–K51', 'Kinh tế vĩ mô, Kinh tế quốc tế, Thương mại & hội nhập, Liên minh châu Âu', 72, 0,
      '', 'Đã ký HĐ', 'Chưa gửi điểm', [1, 1, 1, 1, 0, 0], 'HĐ đã ký, đã lưu trên Drive (cập nhật 04/11). Phiếu đặt phòng BK4744.'],
    ['Jean-Christophe Poutineau', 'Full Professor (Professeur des Universités), Classe exceptionnelle', 'jean-christophe.poutineau@univ-rennes.fr', '',
      'Tiền tệ, Ngân hàng và Thị trường tài chính; Tài chính quốc tế', 'K50–K51', 'Kinh tế vĩ mô, Tài chính quốc tế, Chính sách tiền tệ, Chu kỳ kinh doanh', 72, 36,
      '', 'Chưa có', 'Chưa gửi điểm', [1, 1, 0, 0, 0, 0], 'Chưa ký HĐ, chưa gửi điểm (cập nhật 04/11). Văn bản kê thanh toán cần ghi rõ căn cứ HĐ khi có.'],
    ['Christophe Tavera', 'Full Professor in Economics, PhD, HDR', 'christophe.tavera@univ-rennes.fr', '',
      'Kinh tế vĩ mô; Kinh tế lượng chuỗi thời gian; Kinh tế lượng dữ liệu bảng', 'K50–K51', 'Kinh tế lượng ứng dụng, Dự báo, Hội tụ kinh tế', 108, 0,
      '', 'Chưa có', 'Chưa gửi điểm', [1, 1, 0, 0, 0, 0], 'Phó Trưởng khoa phụ trách Quan hệ quốc tế, Khoa Kinh tế – Đại học Rennes.'],
    ['Cécile Casteuble', 'Assistant Professor in Economics, PhD (Limoges)', 'cecile.casteuble@univ-rennes.fr', '+33 (0)2 23 23 34 28',
      'Tiền tệ, Ngân hàng và Thị trường tài chính', 'K50–K51', 'Ngân hàng & tài chính: thị trường vốn, quản trị ngân hàng, rủi ro', 36, 0,
      '', 'Chưa có', 'Chưa gửi điểm', [1, 0, 0, 0, 0, 0], ''],
    ['Tovonony Razafindrabe', 'Associate Professor (tenure, HDR)', 'tovonony.razafindrabe@univ-rennes.fr', '',
      'Sản phẩm phái sinh; Kinh tế lượng tài chính và Mô hình hóa tài chính', 'K50–K51', 'Kinh tế vĩ mô hàng hóa & năng lượng, Biến đổi khí hậu, Tài chính quốc tế, Tỷ giá', 72, 0,
      '', 'Chưa có', 'Chưa gửi điểm', [1, 0, 0, 0, 0, 0], 'Phụ trách sư phạm Master 2 Finance-Data (từ 09/2025).'],
  ].forEach(([fullName, academicTitle, email, phone, courses, cohorts, specialization, hp, hd, contractNo, contractStatus, gradesSent, ck, note]) => {
    const slug = fullName.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z]+/g, '_')
    push('lecturers', {
      fullName, side: 'Rennes', academicTitle, email, phone, courses, cohorts, specialization, address: ADDR,
      hoursPlanned: hp, hoursDone: hd, contractNo, contractStatus, gradesSent, rateEur: 104,
      contractFrom: contractNo ? '2026-09-10' : '', contractTo: contractNo ? '2027-09-10' : '',
      docs: DOCS.map((text, k) => ({ text, done: !!ck[k] })),
      syllabi: courses.split('; ').map((c) => ({ name: `Syllabus_${c.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^A-Za-z0-9]+/g, '_').slice(0, 45)}.pdf`, course: c, size: 230000, type: 'application/pdf', at: new Date().toISOString() })),
      files: [{ name: `CV_${slug}.pdf`, size: 190000, type: 'application/pdf', at: new Date().toISOString() }],
      note,
    }, 'u3')
  })

  // Bổ sung Giảng viên UEH từ Danh sách giảng viên song bằng (PL4.2 / QAIC)
  LECTURERS_ALL.filter((l) => l.side === 'UEH').forEach((l, idx) => {
    const assigned = UEH_ASSIGNMENTS.find(([name]) => name === l.fullName)?.[1] || []
    const courseNames = assigned.length ? assigned.map((c) => c.course).join('; ') : `Học phần chuyên ngành UEH (${l.coursesCount} môn)`
    const cohortList = Array.from(new Set(assigned.map((c) => c.cohort))).join(', ') || 'K50–K51, K52'
    const cleanCourseSlug = (c) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^A-Za-z0-9]+/g, '_').slice(0, 45)

    push('lecturers', {
      fullName: l.fullName,
      side: 'UEH',
      academicTitle: l.degree || 'Giảng viên',
      email: `${l.fullName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '.')}@ueh.edu.vn`,
      phone: `028 3829 5299 (Ext ${101 + idx})`,
      courses: courseNames,
      cohorts: cohortList,
      specialization: `Tài chính – Ngân hàng (Ngoại ngữ: ${l.lang || 'C1'})`,
      address: 'Đại học Kinh tế TP.HCM (UEH), 59C Nguyễn Đình Chiểu, Q.3, TP.HCM',
      hoursPlanned: Math.max(assigned.length, 1) * 45,
      hoursDone: Math.max(assigned.length, 1) * 15,
      contractNo: `HĐ-UEH-${202600 + idx}`,
      contractStatus: 'Đã ký HĐ',
      gradesSent: 'Đã gửi điểm',
      rateEur: 0,
      contractFrom: '2026-09-01',
      contractTo: '2027-08-31',
      docs: [
        { text: 'Lý lịch khoa học (LLKH)', done: true },
        { text: 'Văn bằng / Chứng chỉ chuyên môn', done: true },
        { text: 'Chứng chỉ ngoại ngữ C1/C2', done: !!l.lang },
        { text: 'Phân công giảng dạy của Khoa', done: true },
      ],
      syllabi: assigned.map((c) => ({
        name: `Syllabus_${cleanCourseSlug(c.course)}.pdf`,
        course: c.course,
        size: 235000,
        type: 'application/pdf',
        at: new Date().toISOString()
      })),
      files: [{
        name: `CV_${l.fullName.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z]+/g, '_')}.pdf`,
        size: 185000,
        type: 'application/pdf',
        at: new Date().toISOString()
      }],
      note: `Trình độ: ${l.degree} · Trình độ ngoại ngữ: ${l.lang}. Đã được thẩm định năng lực theo PL4.2 hồ sơ chương trình.`,
    }, 'u2')
  })

  out.filter((x) => x.module === 'lecturers').forEach((l) => Object.assign(l, l.hoursDone > 0 ? { acceptance: 'Đã xác nhận số giờ', payStatus: 'Đã lập đề nghị' } : { acceptance: 'Chưa nghiệm thu', payStatus: 'Chưa thanh toán' }))

/* ---- 3. DỮ LIỆU CHÍNH THỨC & MẪU DEMO (Đầy đủ các phân hệ) ---- */
  // Sinh viên chính thức & song bằng (students) - Đầy đủ 3 khóa K50, K51, K52
  ;[
    // Khóa K50 (Năm 3)
    ['SV245001', 'Nguyễn Hoàng Long', '2004-05-15', 'Nam', 'long.nh@st.ueh.edu.vn', '0901234567', 'ISB-K50-01', 'K50', 'Năm 3', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã hoàn tất học phí năm 3', 'UR-2024-001', 'long.nh@etudiant.univ-rennes.fr', 'long.nh', 'Đã cấp', '2024-09-01', 90, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Sinh viên tích cực, điểm TB tích lũy xuất sắc'],
    ['SV245002', 'Trần Thị Thanh Bình', '2004-08-20', 'Nữ', 'binh.tt@st.ueh.edu.vn', '0912345678', 'ISB-K50-01', 'K50', 'Năm 3', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã hoàn tất học phí năm 3', 'UR-2024-002', 'binh.tt@etudiant.univ-rennes.fr', 'binh.tt', 'Đã cấp', '2024-09-01', 90, 'B2 (IELTS 7.5)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Thủ khoa khóa K50 song bằng Rennes'],
    ['SV245003', 'Lê Quốc Cường', '2004-03-10', 'Nam', 'cuong.lq@st.ueh.edu.vn', '0923456789', 'ISB-K50-01', 'K50', 'Năm 3', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã hoàn tất học phí', 'UR-2024-003', 'cuong.lq@etudiant.univ-rennes.fr', 'cuong.lq', 'Đã cấp', '2024-09-01', 85, 'B2 (IELTS 6.5)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Cần thi cải thiện điểm môn Kinh tế lượng chuỗi thời gian'],
    ['SV245004', 'Phạm Thảo My', '2004-11-05', 'Nữ', 'my.pt@st.ueh.edu.vn', '0934567890', 'ISB-K50-01', 'K50', 'Năm 3', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã hoàn tất học phí', 'UR-2024-004', 'my.pt@etudiant.univ-rennes.fr', 'my.pt', 'Đã cấp', '2024-09-01', 90, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Đã hoàn thành thủ tục hồ sơ du học Master tại Rennes'],
    ['SV245005', 'Vũ Đức Anh', '2004-09-18', 'Nam', 'anh.vd@st.ueh.edu.vn', '0945678901', 'ISB-K50-01', 'K50', 'Năm 3', 'Có', 'Đang học', 'Nợ một phần', 35000000, 20000000, 'Còn nợ 15.000.000 đ học phí kỳ 5', 'UR-2024-005', 'anh.vd@etudiant.univ-rennes.fr', 'anh.vd', 'Đã cấp', '2024-09-01', 82, 'B1 (IELTS 6.0)', 'Đang học B2', 'Đang hoàn thiện', 'Đã đăng ký', 'Đang xin gia hạn học phí & hoàn thiện chuẩn tiếng Anh B2'],
    ['SV245006', 'Huỳnh Tấn Tài', '2004-01-22', 'Nam', 'tai.ht@st.ueh.edu.vn', '0941122334', 'ISB-K50-01', 'K50', 'Năm 3', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 5', 'UR-2024-006', 'tai.ht@etudiant.univ-rennes.fr', 'tai.ht', 'Đã cấp', '2024-09-01', 86, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Đã nộp bài luận môn Tài chính quốc tế'],
    ['SV245007', 'Lâm Gia Hân', '2004-07-11', 'Nữ', 'han.lg@st.ueh.edu.vn', '0942233445', 'ISB-K50-01', 'K50', 'Năm 3', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 5', 'UR-2024-007', 'han.lg@etudiant.univ-rennes.fr', 'han.lg', 'Đã cấp', '2024-09-01', 92, 'B2 (IELTS 7.5)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Sinh viên tiêu biểu năm học 2025–2026'],
    ['SV245008', 'Đoàn Quốc Bảo', '2004-10-09', 'Nam', 'bao.dq@st.ueh.edu.vn', '0943344556', 'ISB-K50-01', 'K50', 'Năm 3', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 5', 'UR-2024-008', 'bao.dq@etudiant.univ-rennes.fr', 'bao.dq', 'Đã cấp', '2024-09-01', 84, 'B2 (IELTS 6.5)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Thành viên Ban liên lạc cựu sinh viên song bằng'],
    ['SV245009', 'Mai Phương Thảo', '2004-12-14', 'Nữ', 'thao.mp@st.ueh.edu.vn', '0944455667', 'ISB-K50-01', 'K50', 'Năm 3', 'Có', 'Đang học', 'Chưa đóng', 35000000, 0, 'Đơn xin hoãn nộp học phí đến 15/12', 'UR-2024-009', 'thao.mp@etudiant.univ-rennes.fr', 'thao.mp', 'Đã cấp', '2024-09-01', 78, 'B1 (IELTS 6.0)', 'Đang học B2', 'Đang hoàn thiện', 'Đã đăng ký', 'Chờ phê duyệt miễn giảm học phí diện chính sách'],
    ['SV245010', 'Trần Nhật Nam', '2004-04-03', 'Nam', 'nam.tn@st.ueh.edu.vn', '0945566778', 'ISB-K50-01', 'K50', 'Năm 3', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 5', 'UR-2024-010', 'nam.tn@etudiant.univ-rennes.fr', 'nam.tn', 'Đã cấp', '2024-09-01', 88, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Dự kiến bảo vệ khóa luận tốt nghiệp đợt 1'],

    // Khóa K51 (Năm 2)
    ['SV255101', 'Đặng Minh Khôi', '2005-02-14', 'Nam', 'khoi.dm@st.ueh.edu.vn', '0956789012', 'ISB-K51-01', 'K51', 'Năm 2', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 3', 'UR-2025-001', 'khoi.dm@etudiant.univ-rennes.fr', 'khoi.dm', 'Đã cấp', '2025-09-01', 60, 'B2 (IELTS 6.5)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Đã hoàn thành 3/5 học phần Rennes'],
    ['SV255102', 'Hoàng Ngọc Lan', '2005-07-22', 'Nữ', 'lan.hn@st.ueh.edu.vn', '0967890123', 'ISB-K51-01', 'K51', 'Năm 2', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 3', 'UR-2025-002', 'lan.hn@etudiant.univ-rennes.fr', 'lan.hn', 'Đã cấp', '2025-09-01', 60, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Cán sự lớp K51, học lực giỏi'],
    ['SV255103', 'Bùi Gia Huy', '2005-12-08', 'Nam', 'huy.bg@st.ueh.edu.vn', '0978901234', 'ISB-K51-01', 'K51', 'Năm 2', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 3', 'UR-2025-003', 'huy.bg@etudiant.univ-rennes.fr', 'huy.bg', 'Đã cấp', '2025-09-01', 55, 'B2 (IELTS 6.0)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Đạt yêu cầu các môn chuyên ngành'],
    ['SV255104', 'Võ Phương Linh', '2005-04-30', 'Nữ', 'linh.vp@st.ueh.edu.vn', '0989012345', 'ISB-K51-01', 'K51', 'Năm 2', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 3', 'UR-2025-004', 'linh.vp@etudiant.univ-rennes.fr', 'linh.vp', 'Đã cấp', '2025-09-01', 60, 'B2 (IELTS 7.5)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Thành viên CLB Pháp ngữ ISB'],
    ['SV255105', 'Ngô Tiến Dũng', '2005-10-15', 'Nam', 'dung.nt@st.ueh.edu.vn', '0990123456', 'ISB-K51-01', 'K51', 'Năm 2', 'Có', 'Đang học', 'Chưa đóng', 35000000, 0, 'Chưa nộp học phí kỳ 3', '', '', '', 'Chưa cấp', '', 50, 'B1 (IELTS 5.5)', 'Đang học B2', 'Đang hoàn thiện', 'Chưa', 'Cần hỗ trợ kích hoạt tài khoản ENT Rennes & học bổ túc'],
    ['SV255106', 'Nguyễn Trọng Hiếu', '2005-03-18', 'Nam', 'hieu.nt@st.ueh.edu.vn', '0951122334', 'ISB-K51-01', 'K51', 'Năm 2', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 3', 'UR-2025-006', 'hieu.nt@etudiant.univ-rennes.fr', 'hieu.nt', 'Đã cấp', '2025-09-01', 58, 'B2 (IELTS 6.5)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Điểm chuyên cần đạt 100% các môn chuyên ngành'],
    ['SV255107', 'Vũ Thùy Dương', '2005-08-25', 'Nữ', 'duong.vt@st.ueh.edu.vn', '0952233445', 'ISB-K51-01', 'K51', 'Năm 2', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 3', 'UR-2025-007', 'duong.vt@etudiant.univ-rennes.fr', 'duong.vt', 'Đã cấp', '2025-09-01', 62, 'B2 (IELTS 7.5)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Đạt giải Nghiên cứu khoa học sinh viên cấp Khoa'],
    ['SV255108', 'Lê Quang Huy', '2005-11-12', 'Nam', 'huy.lq@st.ueh.edu.vn', '0953344556', 'ISB-K51-01', 'K51', 'Năm 2', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 3', 'UR-2025-008', 'huy.lq@etudiant.univ-rennes.fr', 'huy.lq', 'Đã cấp', '2025-09-01', 54, 'B2 (IELTS 6.0)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Đang thực hiện bài tập nhóm môn Kinh tế vi mô'],
    ['SV255109', 'Trần Ngọc Ánh', '2005-06-04', 'Nữ', 'anh.tn@st.ueh.edu.vn', '0954455667', 'ISB-K51-01', 'K51', 'Năm 2', 'Có', 'Đang học', 'Nợ một phần', 35000000, 15000000, 'Còn nợ 20.000.000 đ học phí kỳ 3', 'UR-2025-009', 'anh.tn@etudiant.univ-rennes.fr', 'anh.tn', 'Đã cấp', '2025-09-01', 50, 'B1 (IELTS 6.0)', 'Đang học B2', 'Đang hoàn thiện', 'Đã đăng ký', 'Gia đình cam kết hoàn tất học phí trước kỳ thi cuối kỳ'],
    ['SV255110', 'Phạm Quốc Trung', '2005-09-29', 'Nam', 'trung.pq@st.ueh.edu.vn', '0955566778', 'ISB-K51-01', 'K51', 'Năm 2', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 3', 'UR-2025-010', 'trung.pq@etudiant.univ-rennes.fr', 'trung.pq', 'Đã cấp', '2025-09-01', 60, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Đã đăng ký', 'Thành viên đội tuyển hùng biện kinh tế UEH'],

    // Khóa K52 (Năm 1)
    ['SV265201', 'Phan Anh Khoa', '2006-01-20', 'Nam', 'khoa.pa@st.ueh.edu.vn', '0902345678', 'ISB-K52-01', 'K52', 'Năm 1', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 1', '', '', '', 'Chưa cấp', '', 25, 'B2 (IELTS 6.5)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'Tân sinh viên K52 đăng ký song bằng'],
    ['SV265202', 'Đỗ Quỳnh Anh', '2006-05-12', 'Nữ', 'anh.dq@st.ueh.edu.vn', '0913456789', 'ISB-K52-01', 'K52', 'Năm 1', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 1', '', '', '', 'Chưa cấp', '', 25, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'Đã nộp đầy đủ hồ sơ MOA song bằng'],
    ['SV265203', 'Trịnh Minh Hoàng', '2006-09-03', 'Nam', 'hoang.tm@st.ueh.edu.vn', '0924567890', 'ISB-K52-01', 'K52', 'Năm 1', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 1', '', '', '', 'Chưa cấp', '', 20, 'B1 (IELTS 6.0)', 'Đang học B2', 'Đang hoàn thiện', 'Chưa', 'Đang theo học lớp tiếng Anh học thuật tăng cường'],
    ['SV265204', 'Dương Bảo Ngọc', '2006-03-28', 'Nữ', 'ngoc.db@st.ueh.edu.vn', '0935678901', 'ISB-K52-01', 'K52', 'Năm 1', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 1', '', '', '', 'Chưa cấp', '', 25, 'B2 (IELTS 6.5)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'Hồ sơ tuyển sinh đạt yêu cầu phỏng vấn'],
    ['SV265205', 'Nguyễn Tấn Phát', '2006-11-19', 'Nam', 'phat.nt@st.ueh.edu.vn', '0946789012', 'ISB-K52-01', 'K52', 'Năm 1', 'Có', 'Đang học', 'Chưa đóng', 35000000, 0, 'Chờ gia hạn hạn nộp đến 30/11', '', '', '', 'Chưa cấp', '', 15, 'B1 (IELTS 5.5)', 'Đang học B2', 'Đang hoàn thiện', 'Chưa', 'Đang chờ đối soát học phí kỳ 1'],
    ['SV265206', 'Lê Minh Đạt', '2006-02-17', 'Nam', 'dat.lm@st.ueh.edu.vn', '0961122334', 'ISB-K52-01', 'K52', 'Năm 1', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 1', '', '', '', 'Chưa cấp', '', 25, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'Tân sinh viên đạt giải Nhì Olympic Tiếng Anh cấp tỉnh'],
    ['SV265207', 'Nguyễn Kiều Trang', '2006-07-08', 'Nữ', 'trang.nk@st.ueh.edu.vn', '0962233445', 'ISB-K52-01', 'K52', 'Năm 1', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 1', '', '', '', 'Chưa cấp', '', 25, 'B2 (IELTS 6.5)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'Đã hoàn thành thủ tục đăng ký định hướng chuyên ngành'],
    ['SV265208', 'Hoàng Đình Phong', '2006-10-24', 'Nam', 'phong.hd@st.ueh.edu.vn', '0963344556', 'ISB-K52-01', 'K52', 'Năm 1', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 1', '', '', '', 'Chưa cấp', '', 20, 'B1 (IELTS 6.0)', 'Đang học B2', 'Đang hoàn thiện', 'Chưa', 'Đang đăng ký thi chứng chỉ tiếng Anh quốc tế bổ sung'],
    ['SV265209', 'Võ Thị Bích Trâm', '2006-04-19', 'Nữ', 'tram.vtb@st.ueh.edu.vn', '0964455667', 'ISB-K52-01', 'K52', 'Năm 1', 'Có', 'Đang học', 'Đã đóng', 35000000, 35000000, 'Đã nộp học phí kỳ 1', '', '', '', 'Chưa cấp', '', 25, 'B2 (IELTS 7.5)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'Hồ sơ học bổng tuyển sinh đạt 85/100 điểm'],
    ['SV265210', 'Đặng Gia Khiêm', '2006-12-01', 'Nam', 'khiem.dg@st.ueh.edu.vn', '0965566778', 'ISB-K52-01', 'K52', 'Năm 1', 'Có', 'Đang học', 'Chưa đóng', 35000000, 0, 'Gia hạn học phí kỳ 1 đến 05/12/2026', '', '', '', 'Chưa cấp', '', 18, 'B1 (IELTS 5.5)', 'Đang học B2', 'Đang hoàn thiện', 'Chưa', 'Cần tham gia lớp bồi dưỡng ngoại ngữ học thuật buổi tối']
  ].forEach(([studentId, fullName, dob, gender, email, phone, className, cohort, yearLevel, dualDegree, academicStatus, tuitionStatus, tuitionAmount, tuitionPaid, tuitionNote, rennesId, rennesEmail, lmsAccount, accountStatus, accountDate, credits, englishLevel, b2Status, rennesForm, phase2, note]) => {
    push('students', { studentId, fullName, dob, gender, email, phone, className, cohort, yearLevel, dualDegree, academicStatus, tuitionStatus, tuitionAmount, tuitionPaid, tuitionNote, rennesId, rennesEmail, lmsAccount, accountStatus, accountDate, credits, englishLevel, b2Status, rennesForm, phase2, note })
  })

  // Kế hoạch & lịch giảng chính thức (sessions) - Trích xuất từ Lịch giảng 5 môn HKC2026 - GV RENNES.pdf (60 buổi)
  ;[
    // Môn 1: Tiền tệ, ngân hàng và thị trường tài chính - GS. Jean-Christophe Poutineau (48 giờ / 12 buổi)
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-07-27', '07:10', '10:40', 'B2-108', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 1 (Sáng) · Mã ghép K51 (26C1MON50516401) & K50 (26C1FIN50520201)'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-07-27', '12:45', '16:15', 'B2-108', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 2 (Chiều) · Phòng B2-108'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-07-28', '07:10', '10:40', 'B2-108', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 3 (Sáng) · Phòng B2-108'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-07-28', '12:45', '16:15', 'B2-108', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 4 (Chiều) · Phòng B2-108'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-07-29', '07:10', '10:40', 'B2-108', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 5 (Sáng) · Phòng B2-108'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-07-29', '12:45', '16:15', 'B2-108', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 6 (Chiều) · Phòng B2-108'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-07-30', '07:10', '10:40', 'B2-108', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 7 (Sáng) · Phòng B2-108'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-07-30', '12:45', '16:15', 'B1-502', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 8 (Chiều) · Phòng B1-502'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-07-31', '07:10', '10:40', 'B1-502', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 9 (Sáng) · Phòng B1-502'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-07-31', '12:45', '16:15', 'B2-108', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 10 (Chiều) · Phòng B2-108'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-01', '07:10', '10:40', 'B2-108', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 11 (Sáng) · Kiểm tra CC1 Midterm'],
    ['Tiền tệ, ngân hàng và thị trường tài chính', '26C1MON50516401', 'GS. Jean-Christophe Poutineau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-01', '12:45', '16:15', 'B2-108', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 12 (Chiều) · Thi cuối kỳ HCM Final Exam, hoàn tất 48h'],

    // Môn 2: Kinh tế vĩ mô - GS. Christophe Tavera (48 giờ / 12 buổi)
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-24', '07:10', '10:40', 'B1-504', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 1 (Sáng) · Khai mạc đợt giảng Macroeconomics'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-24', '12:45', '16:15', 'B1-504', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 2 (Chiều) · Phòng B1-504'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-25', '07:10', '10:40', 'B1-404', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 3 (Sáng) · Phòng B1-404'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-25', '12:45', '16:15', 'B1-403', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 4 (Chiều) · Phòng B1-403'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-26', '07:10', '10:40', 'B1-504', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 5 (Sáng) · Phòng B1-504'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-26', '12:45', '16:15', 'B1-504', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 6 (Chiều) · Phòng B1-504'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-27', '07:10', '10:40', 'B1-504', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 7 (Sáng) · Phòng B1-504'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-27', '12:45', '16:15', 'B1-504', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 8 (Chiều) · Phòng B1-504'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-28', '07:10', '10:40', 'B1-504', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 9 (Sáng) · Phòng B1-504'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-28', '12:45', '16:15', 'B1-504', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 10 (Chiều) · Phòng B1-504'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-29', '07:10', '10:40', 'B1-504', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 11 (Sáng) · Kiểm tra giữa kỳ Mid-term Macro'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-08-29', '12:45', '16:15', 'B1-408', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 12 (Chiều) · Thảo luận Question sheet, kết thúc môn'],

    // Môn 3: Kinh tế lượng chuỗi thời gian - GS. Christophe Tavera (48 giờ / 12 buổi)
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-02', '07:10', '10:40', 'B1-701', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 1 (Sáng) · Khai giảng đợt 2 GV Tavera'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-02', '12:45', '16:15', 'B1-701', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 2 (Chiều) · Phòng B1-701'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-03', '07:10', '10:40', 'B1-405', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 3 (Sáng) · Phòng B1-405'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-03', '12:45', '16:15', 'B1-502', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 4 (Chiều) · Phòng B1-502'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-04', '07:10', '10:40', 'B1-505', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 5 (Sáng) · Phòng B1-505'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-04', '12:45', '16:15', 'B1-504', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 6 (Chiều) · Phòng B1-504'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-05', '07:10', '10:40', 'B1-503', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 7 (Sáng) · Phòng B1-503'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-05', '12:45', '16:15', 'B1-503', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 8 (Chiều) · Phòng B1-503'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-06', '07:10', '10:40', 'B1-801', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 9 (Sáng) · Phòng B1-801'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-06', '12:45', '16:15', 'B1-703', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 10 (Chiều) · Phòng B1-703'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-07', '07:10', '10:40', 'B1-405', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 11 (Sáng) · Bài kiểm tra Mid-term Time Series'],
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-07', '12:45', '16:15', 'B1-403', 'Trực tiếp', 'Đã dạy', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 12 (Chiều) · Hoàn tất 48h Time Series'],

    // Môn 4: Sản phẩm phái sinh - GS. Franck Martin (48 giờ / 12 buổi)
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-30', '07:10', '10:40', 'B1-502', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 1 (Sáng) · Khai mạc đợt giảng GS. Franck Martin'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-30', '12:45', '16:15', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 2 (Chiều) · Phòng B1-503'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-01', '07:10', '10:40', 'B1-403', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 3 (Sáng) · Phòng B1-403'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-01', '12:45', '16:15', 'B1-502', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 4 (Chiều) · Phòng B1-502'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-02', '07:10', '10:40', 'B1-502', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 5 (Sáng) · Phòng B1-502'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-02', '12:45', '16:15', 'B1-502', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 6 (Chiều) · Phòng B1-502'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-03', '07:10', '10:40', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 7 (Sáng) · Phòng B1-503'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-03', '12:45', '16:15', 'B1-403', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 8 (Chiều) · Phòng B1-403'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-04', '07:10', '10:40', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 9 (Sáng) · Phòng B1-503'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-04', '12:45', '16:15', 'B1-403', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 10 (Chiều) · Phòng B1-403'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-05', '07:10', '10:40', 'B1-502', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 11 (Sáng) · Bài thi cuối môn'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-05', '12:45', '16:15', 'B1-403', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 12 (Chiều) · Hoàn tất 48h Derivatives'],

    // Môn 5: Tài chính quốc tế - GS. Fabien Rondeau (48 giờ / 12 buổi)
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-07', '07:10', '10:40', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 1 (Sáng) · Khai giảng đợt giảng GS. Rondeau'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-07', '12:45', '16:15', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 2 (Chiều) · Phòng B1-503'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-08', '07:10', '10:40', 'B1-402', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 3 (Sáng) · Phòng B1-402'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-08', '12:45', '16:15', 'B1-402', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 4 (Chiều) · Phòng B1-402'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-09', '07:10', '10:40', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 5 (Sáng) · Phòng B1-503'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-09', '12:45', '16:15', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 6 (Chiều) · Phòng B1-503'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-10', '07:10', '10:40', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 7 (Sáng) · Phòng B1-503'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-10', '12:45', '16:15', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 8 (Chiều) · Phòng B1-503'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-11', '07:10', '10:40', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 9 (Sáng) · Phòng B1-503'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-11', '12:45', '16:15', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 10 (Chiều) · Phòng B1-503'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-12', '07:10', '10:40', 'B1-503', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 11 (Sáng) · Bài thi cuối môn'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-12', '12:45', '16:15', 'B1-702', 'Trực tiếp', 'Đã xác nhận', 'Đã xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi 12 (Chiều) · Phòng B1-702, tổng kết đợt giảng HKC2026'],

    // Các buổi cần xử lý xác nhận / dời lịch / dự kiến (Cần xử lý)
    ['Kinh tế lượng chuỗi thời gian', '26C1FIN50520401', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-20', '13:30', '17:00', 'Lab.401', 'Trực tiếp', 'Dời lịch', 'Đã xác nhận', 'Chưa xác nhận', 'HKC2026', 'Buổi thực hành bù Lab EViews dời từ ngày 06/11 sang 20/11 theo yêu cầu GV'],
    ['Sản phẩm phái sinh', '26C1FIN50520101', 'GS. Franck Martin', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-11-28', '08:00', '11:30', 'B1-502', 'Trực tiếp', 'Dự kiến', 'Chưa xác nhận', 'Đã xác nhận', 'HKC2026', 'Buổi tiền trạm & Seminar mở đầu chuyên đề Quản trị phái sinh'],
    ['Tài chính quốc tế', '26C1FIN50520001', 'GS. Fabien Rondeau', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-14', '08:00', '11:30', 'B1-503', 'Trực tiếp', 'Dự kiến', 'Chưa xác nhận', 'Chưa xác nhận', 'HKC2026', 'Buổi phụ đạo & giải đáp bài tập Case Study trước kỳ thi cuối kỳ'],
    ['Kinh tế vĩ mô', '26C1FIN50519901', 'GS. Christophe Tavera', 'Rennes', 'FBDPF1 (K50 & K51)', 'K50–K51', '2026-12-18', '14:00', '17:30', 'B1-504', 'Trực tuyến', 'Dự kiến', 'Đã xác nhận', 'Chưa xác nhận', 'HKC2026', 'Buổi Seminar trực tuyến tổng kết mô hình vĩ mô liên kết Rennes – UEH']
  ].forEach(([course, courseCode, lecturer, side, className, teachingGroup, date, start, end, room, mode, status, uehConfirmed, rennesConfirmed, scheduleVersion, note]) => {
    push('sessions', { course, courseCode, lecturer, side, className, teachingGroup, date, start, end, room, mode, status, uehConfirmed, rennesConfirmed, scheduleVersion, note })
  })

  // Khảo thí & điểm thi (exams) - Cập nhật đề thi & học liệu chính thức từ phía Rennes
  ;[
    ['Tiền tệ, ngân hàng và thị trường tài chính', 'Giữa kỳ & Cuối kỳ', 'FBDPF1 (K50 & K51)', '2026-08-01', '08:00', 'B2-108', 'TS. Nguyễn Văn Thiện Tâm', 70, 'Đã có kết quả', 'Đã in & niêm phong', 70, 'Đã xác nhận', 'GS. Jean-Christophe Poutineau', '2026-08-01', 70, 'GV chấm trực tiếp tại UEH', '2026-08-10', 'Đã duyệt', '2026-08-15', '2026-08-20', [
      { text: 'Đề thi & phòng thi được phê duyệt', done: true },
      { text: 'GV Rennes chấm & nộp bảng điểm', done: true },
      { text: 'Hội đồng Khảo thí thông qua kết quả', done: true }
    ], [
      { name: 'CC1 Midterm HCM Monetary and Financial Economics.docx', size: 45000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-07-28T09:00:00Z' },
      { name: 'HCM final exam 2026.docx', size: 52000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-07-30T10:00:00Z' },
      { name: 'HCM Syllabus 2026.pdf', size: 185000, type: 'application/pdf', at: '2026-07-20T08:00:00Z' },
      { name: 'Hóa đơn_in đề KGTK Poutineau.pdf', size: 237600, type: 'application/pdf', at: '2026-08-14T08:00:00Z' }
    ], 'Đã hoàn tất kỳ thi giữa kỳ CC1 và cuối kỳ. Hóa đơn in đề KGTK Poutineau ký hiệu 1C26MTT (237.600 đ).'],

    ['Kinh tế vĩ mô', 'Giữa kỳ', 'FBDPF1 (K50 & K51)', '2026-08-29', '08:00', 'B1-504', 'ThS. Hoàng Yến', 70, 'Đã có kết quả', 'Đã in & niêm phong', 70, 'Đã xác nhận', 'GS. Christophe Tavera', '2026-08-29', 70, 'GV chấm trực tiếp tại UEH', '2026-09-08', 'Đã duyệt', '2026-09-12', '2026-09-15', [
      { text: 'Đề thi & phòng thi được phê duyệt', done: true },
      { text: 'GV Rennes chấm & nộp bảng điểm', done: true },
      { text: 'Hội đồng Khảo thí thông qua kết quả', done: true }
    ], [
      { name: 'Mid_term - Macro thầy Tavera.pdf', size: 142000, type: 'application/pdf', at: '2026-08-25T08:00:00Z' },
      { name: 'question sheet macroeconomic analysis tavera.pdf', size: 128000, type: 'application/pdf', at: '2026-08-26T08:00:00Z' },
      { name: 'Syllabus Macroeconomics DD UEH August 2026.pdf', size: 215000, type: 'application/pdf', at: '2026-08-15T08:00:00Z' }
    ], 'Đã có kết quả kiểm tra Mid-term và Question sheets thảo luận tình huống vĩ mô.'],

    ['Kinh tế lượng chuỗi thời gian', 'Giữa kỳ', 'FBDPF1 (K50 & K51)', '2026-11-07', '08:00', 'B1-405', 'TS. Lê Anh', 70, 'Đã thi', 'Đã in & niêm phong', 70, 'Đã xác nhận', 'GS. Christophe Tavera', '2026-11-08', 70, 'Scan PDF qua email', '', 'Chưa họp', '', '', [
      { text: 'Đề thi & phòng thi được phê duyệt', done: true },
      { text: 'GV Rennes chấm & nộp bảng điểm', done: false },
      { text: 'Hội đồng Khảo thí thông qua kết quả', done: false }
    ], [
      { name: 'MID TERM UEH TIME SERIES.pdf', size: 165000, type: 'application/pdf', at: '2026-11-05T08:00:00Z' },
      { name: 'Syllabus time series UEH dec 2026.pdf', size: 220000, type: 'application/pdf', at: '2026-10-25T08:00:00Z' }
    ], 'Đã thi xong ngày 07/11/2026, GS. Tavera đang chấm điểm theo thang 20.'],

    ['Sản phẩm phái sinh', 'Cuối kỳ', 'FBDPF1 (K50 & K51)', '2026-12-05', '08:00', 'B1-502', 'Chuyên viên Khảo thí ISB', 70, 'Dự kiến', 'Đã nhận đề từ GV', 70, 'Đã xác nhận', 'GS. Franck Martin', '', 0, 'GV chấm trực tiếp tại UEH', '', 'Chưa họp', '', '', [
      { text: 'Đề thi & phòng thi được phê duyệt', done: true },
      { text: 'GV Rennes chấm & nộp bảng điểm', done: false },
      { text: 'Hội đồng Khảo thí thông qua kết quả', done: false }
    ], [], 'Lịch thi dự kiến vào buổi sáng ngày 05/12/2026.'],

    ['Tài chính quốc tế', 'Cuối kỳ', 'FBDPF1 (K50 & K51)', '2026-12-12', '08:00', 'B1-503', 'Chuyên viên Khảo thí ISB', 70, 'Dự kiến', 'Đang thẩm định', 70, 'Đã xác nhận', 'GS. Fabien Rondeau', '', 0, 'GV chấm trực tiếp tại UEH', '', 'Chưa họp', '', '', [
      { text: 'Đề thi & phòng thi được phê duyệt', done: false },
      { text: 'GV Rennes chấm & nộp bảng điểm', done: false },
      { text: 'Hội đồng Khảo thí thông qua kết quả', done: false }
    ], [], 'Lịch thi dự kiến vào buổi sáng ngày 12/12/2026.'],

    ['Python lập mô hình TC & định giá', 'Cuối kỳ', 'ISB-K51-01', '2026-12-18', '13:30', 'Lab.403', 'ThS. Hoàng Thị Phương Anh', 45, 'Dự kiến', 'Đã duyệt đề', 45, 'Đã xác nhận', 'ThS. Nguyễn Hoàng Long', '', 0, 'Chấm thực hành trên máy Lab', '', 'Chưa họp', '', '', [
      { text: 'Đề thi & phòng thi được phê duyệt', done: true },
      { text: 'GV Rennes chấm & nộp bảng điểm', done: false },
      { text: 'Hội đồng Khảo thí thông qua kết quả', done: false }
    ], [], 'Thi thực hành trên phòng Lab.403 cơ sở B, thời gian làm bài 90 phút.'],

    ['Kinh tế vi mô', 'Cuối kỳ', 'ISB-K52-01', '2026-12-22', '08:00', 'B2-201', 'ThS. Nguyễn Văn Thiện Tâm', 60, 'Dự kiến', 'Đang in đề', 60, 'Đã xác nhận', 'ThS. Đào Nguyên Anh', '', 0, 'Tổ chức thi tập trung trắc nghiệm + tự luận', '', 'Chưa họp', '', '', [
      { text: 'Đề thi & phòng thi được phê duyệt', done: true },
      { text: 'GV Rennes chấm & nộp bảng điểm', done: false },
      { text: 'Hội đồng Khảo thí thông qua kết quả', done: false }
    ], [], 'Kỳ thi kết thúc học phần đợt 1 dành cho sinh viên Khóa K52.']
  ].forEach(([course, examType, className, date, start, room, proctor, count, status, paperStatus, paperCopies, roomStatus, grader, scriptsSentAt, scriptsCount, sendMethod, gradesReceivedAt, councilStatus, councilDate, publishedAt, steps, files, note]) => {
    push('exams', { course, examType, className, date, start, room, proctor, count, status, paperStatus, paperCopies, roomStatus, grader, scriptsSentAt, scriptsCount, sendMethod, gradesReceivedAt, councilStatus, councilDate, publishedAt, steps, files, note })
  })

  // Đoàn công tác GV Rennes (trips) - Dữ liệu thực tế từ hồ sơ vé, khách sạn, hợp đồng & bảng kê
  ;[
    ['GS. Jean-Christophe Poutineau', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'FBDPF1 (K50 & K51)', '2026-07-27', '2026-08-01', 48, '1148/HĐTG-ĐHKT-TC', 'AF 258 · CDG → SGN (AFFR0032786622)', '2026-07-25T13:10', '2026-07-26T06:30', 'AF 259 · SGN → CDG', '2026-08-02T10:30', 'UEH Boutique Hotel (232/6 Võ Thị Sáu, Q.3)', '#4277', 'Đã xác nhận', '2026-07-26', '2026-08-02', 'Không cần', 'Xe UEH đưa đón sân bay Tân Sơn Nhất', 104, 20, 7, 150, 150, 27500, 40400000, 6552000, 237600, 'u5', 1050, 'Đã hoàn ứng', 'Hoàn tất', 'Đã thanh toán', [
      { text: 'Xác nhận danh sách GV & thời gian lưu trú', done: true },
      { text: 'Đặt vé máy bay quốc tế & visa', done: true },
      { text: 'Nghiệm thu giờ giảng & thanh toán thù lao', done: true }
    ], [
      { name: 'Invoice_BK4277_ChristoplePoutineau.pdf', size: 145000, type: 'application/pdf', at: '2026-08-02T12:00:00Z' },
      { name: 'Poutineau_BOARDING PASS.pdf', size: 98000, type: 'application/pdf', at: '2026-08-02T15:00:00Z' },
      { name: 'Poutineau_FactureAirFrance09032026.pdf', size: 180000, type: 'application/pdf', at: '2026-03-09T10:00:00Z' },
      { name: 'Hóa đơn_in đề KGTK Poutineau.pdf', size: 237600, type: 'application/pdf', at: '2026-08-14T08:00:00Z' }
    ], 'Hoàn tất đợt giảng HKC2026. Lưu trú UEH Boutique Hotel phòng #204, hóa đơn #6817 (6.552.000 đ), vé máy bay Air France 1.469,09 EUR.'],

    ['GS. Christophe Tavera', 'Kinh tế vĩ mô', 'FBDPF1 (K50 & K51)', '2026-08-24', '2026-08-29', 48, 'HĐTG Đợt 1 - Tavera', 'AF 258 · CDG → SGN (Vé H9Q9DX)', '2026-08-22T13:10', '2026-08-23T06:30', 'AF 259 · SGN → CDG (Vé H9Q9DX)', '2026-08-30T09:25', 'UEH Boutique Hotel (232/6 Võ Thị Sáu, Q.3)', 'RESERVATION_UEH_BOUTIQUE', 'Đã xác nhận', '2026-08-23', '2026-08-30', 'Không cần', 'Xe UEH đưa đón sân bay Tân Sơn Nhất', 104, 20, 7, 150, 150, 27500, 81037000, 6552000, 488160, 'u5', 1050, 'Đã hoàn ứng', 'Hoàn tất', 'Đã thanh toán', [
      { text: 'Xác nhận danh sách GV & thời gian lưu trú', done: true },
      { text: 'Đặt vé máy bay quốc tế & visa', done: true },
      { text: 'Nghiệm thu giờ giảng & thanh toán thù lao', done: true }
    ], [
      { name: 'Hóa đơn_Tavera_vé mb_1C26TKA_00004110.pdf', size: 195000, type: 'application/pdf', at: '2026-07-02T10:00:00Z' },
      { name: 'BBNT - Máy bay Rennes đợt 1.pdf', size: 210000, type: 'application/pdf', at: '2026-08-30T10:00:00Z' },
      { name: 'Tavera_ RESERVATION_UEH BOUTIQUE HOTEL.pdf', size: 160000, type: 'application/pdf', at: '2026-08-20T08:00:00Z' },
      { name: 'Tavera_hợp đồng.pdf', size: 280000, type: 'application/pdf', at: '2026-08-15T09:00:00Z' },
      { name: 'Boarding pass_Tavera.pdf', size: 110000, type: 'application/pdf', at: '2026-08-30T14:00:00Z' },
      { name: 'Vé máy bay -H9Q9DX-TAVERA-en-US-da99de64-2cae-4abd-8d5b-d07c723a75a8.pdf', size: 175000, type: 'application/pdf', at: '2026-07-01T08:00:00Z' }
    ], 'Hoàn tất đợt giảng môn Kinh tế vĩ mô. Hóa đơn vé máy bay 1C26TKA_00004110 (81.037.000 đ), lưu trú UEH Boutique Hotel.'],

    ['GS. Christophe Tavera', 'Kinh tế lượng chuỗi thời gian', 'FBDPF1 (K50 & K51)', '2026-11-02', '2026-11-07', 48, 'HĐTG Đợt 2 - Tavera', 'AF 258 · CDG → SGN (Vé tự mua ZMVHEA)', '2026-11-01T13:10', '2026-11-02T06:30', 'AF 259 · SGN → CDG (Vé tự mua ZMVHEA)', '2026-11-08T09:25', 'UEH Boutique Hotel (232/6 Võ Thị Sáu, Q.3)', 'BK_TAVERA_T11', 'Đã xác nhận', '2026-11-02', '2026-11-08', 'Không cần', 'Xe UEH đưa đón sân bay', 104, 20, 7, 150, 150, 27500, 46095500, 6552000, 0, 'u3', 2180.96, 'Đã hoàn ứng', 'Hoàn tất', 'Đã thanh toán', [
      { text: 'Xác nhận danh sách GV & thời gian lưu trú', done: true },
      { text: 'Đặt vé máy bay quốc tế & visa', done: true },
      { text: 'Nghiệm thu giờ giảng & thanh toán thù lao', done: true }
    ], [
      { name: 'Hóa đơn vé - Tavera tự mua.pdf', size: 175000, type: 'application/pdf', at: '2026-10-20T08:00:00Z' },
      { name: 'Có thuế_Tavera_T11_BẢNG KÊ THANH TOÁN VIE-ENG.docx', size: 48000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-11-02T09:00:00Z' },
      { name: 'Tavera_t11_PHIẾU ĐẶT PHÒNG UEH BOUTIQUE HOTEL.docx', size: 42000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-10-25T08:00:00Z' }
    ], 'Tavera tự mua vé 1.676,20 EUR. Bảng kê thanh toán: SHP 840 EUR net + hoàn vé mb 1.340,96 EUR sau trừ 20% thuế = 2.180,96 EUR. Lưu trú UEH Boutique Hotel.'],

    ['GS. Franck Martin', 'Sản phẩm phái sinh', 'FBDPF1 (K50 & K51)', '2026-11-30', '2026-12-05', 48, '1150/HĐTG-ĐHKT-TC', 'VN 10 · CDG → SGN (Booking ENXB8B)', '2026-11-29T13:10', '2026-11-30T06:30', 'VN 11 · SGN → CDG', '2026-12-06T23:30', 'UEH Boutique Hotel (232/6 Võ Thị Sáu, Q.3)', 'BK_MARTIN_11', 'Đã xác nhận', '2026-11-30', '2026-12-06', 'Không cần', 'Xe ISB đưa đón sân bay', 104, 20, 7, 150, 150, 27500, 56939000, 6552000, 0, 'u5', 840, 'Đã tạm ứng', 'Đã xác nhận', 'Chưa thanh toán', [
      { text: 'Xác nhận danh sách GV & thời gian lưu trú', done: true },
      { text: 'Đặt vé máy bay quốc tế & visa', done: true },
      { text: 'Nghiệm thu giờ giảng & thanh toán thù lao', done: false }
    ], [
      { name: 'Hóa đơn_Vé mb_ Martin_1C26TKA_00005320.pdf', size: 195000, type: 'application/pdf', at: '2026-08-20T10:00:00Z' },
      { name: 'MARTIN FRANCK PIERRE MR 7382323721091.pdf', size: 165000, type: 'application/pdf', at: '2026-08-18T08:00:00Z' },
      { name: 'Martin Passport.jpg', size: 240000, type: 'image/jpeg', at: '2026-08-10T08:00:00Z' },
      { name: 'Martin_BẢNG KÊ THANH TOÁN VIE-ENG.docx', size: 45000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-11-30T09:00:00Z' },
      { name: 'Martin_PHIẾU ĐẶT PHÒNG UEH BOUTIQUE HOTEL.doc', size: 55000, type: 'application/msword', at: '2026-08-15T08:00:00Z' }
    ], 'Đã có vé máy bay HĐ 1C26TKA_00005320 (56.939.000 đ), hộ chiếu, bảng kê SHP (840 EUR net), phiếu đặt phòng UEH Boutique Hotel.'],

    ['GS. Fabien Rondeau', 'Tài chính quốc tế', 'FBDPF1 (K50 & K51)', '2026-12-07', '2026-12-12', 48, 'Rondeau_hợp đồng.pdf', 'VN 10 · CDG → SGN (Booking EN9XIY)', '2026-12-05T13:10', '2026-12-06T06:30', 'VN 11 · SGN → CDG', '2026-12-13T23:30', 'UEH Boutique Hotel (232/6 Võ Thị Sáu, Q.3)', 'BK_RONDEAU_12', 'Đã xác nhận', '2026-12-05', '2026-12-13', 'Không cần', 'Xe ISB đưa đón sân bay', 104, 20, 7, 150, 150, 27500, 56939000, 6552000, 0, 'u5', 840, 'Đã tạm ứng', 'Đã xác nhận', 'Chưa thanh toán', [
      { text: 'Xác nhận danh sách GV & thời gian lưu trú', done: true },
      { text: 'Đặt vé máy bay quốc tế & visa', done: true },
      { text: 'Nghiệm thu giờ giảng & thanh toán thù lao', done: false }
    ], [
      { name: 'Hóa đơn_Vé mb_Rondeau_1C26TKA_00005301.pdf', size: 195000, type: 'application/pdf', at: '2026-08-19T10:00:00Z' },
      { name: 'EN9XIY-RONDEAU FABIEN MR.pdf', size: 165000, type: 'application/pdf', at: '2026-08-18T08:00:00Z' },
      { name: 'Passport-Rondeau.pdf', size: 210000, type: 'application/pdf', at: '2026-08-10T08:00:00Z' },
      { name: 'Rondeau_hợp đồng.pdf', size: 285000, type: 'application/pdf', at: '2026-08-15T09:00:00Z' },
      { name: 'Rondeau_BẢNG KÊ THANH TOÁN VIE-ENG.docx', size: 45000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-12-07T09:00:00Z' },
      { name: 'Rondeau_PHIẾU ĐẶT PHÒNG UEH BOUTIQUE HOTEL.pdf', size: 140000, type: 'application/pdf', at: '2026-08-15T08:00:00Z' }
    ], 'Đã ký Hợp đồng thỉnh giảng, có vé máy bay HĐ 1C26TKA_00005301 (56.939.000 đ), hộ chiếu, bảng kê SHP (840 EUR net), phiếu đặt phòng UEH Boutique Hotel.'],

    ['Prof. Tovonony Razafindrabe', 'Sản phẩm phái sinh (Đợt 2)', 'FBDPF1 (K50 & K51)', '2026-12-15', '2026-12-22', 48, '1154/HĐTG-UEH-UR', 'AF 258 · CDG → SGN', '2026-12-13T19:40', '2026-12-14T06:30', 'AF 257 · SGN → CDG', '2026-12-23T08:30', 'UEH Boutique Hotel (232/6 Võ Thị Sáu, Q.3)', 'BK4752', 'Đã xác nhận', '2026-12-14', '2026-12-23', 'Không cần', 'Xe 7 chỗ UEH đón tiễn', 104, 20, 8, 120, 150, 27500, 34200000, 14400000, 1500000, 'u3', 960, 'Đã tạm ứng', 'Đã xác nhận', 'Chưa thanh toán', [
      { text: 'Xác nhận danh sách GV & thời gian lưu trú', done: true },
      { text: 'Đặt vé máy bay quốc tế & visa', done: true },
      { text: 'Nghiệm thu giờ giảng & thanh toán thù lao', done: false }
    ], [{ name: 'Razafindrabe_Passport_Ticket.pdf', size: 185000, type: 'application/pdf', at: '2026-10-15T08:00:00Z' }], 'Lịch giảng đợt 2 chuyên đề Sản phẩm phái sinh và Mô hình định giá Black-Scholes.'],

    ['Prof. Jean-Luc Prigent', 'Thực tập và tốt nghiệp (Hướng dẫn luận văn K50)', 'FBDPF1 (K50)', '2027-01-05', '2027-01-12', 36, '1159/HĐTG-UEH-UR', 'VN 11 · CDG → SGN', '2027-01-04T21:00', '2027-01-05T06:45', 'VN 10 · SGN → CDG', '2027-01-13T11:20', 'UEH Boutique Hotel', 'BK4755', 'Đã gửi phiếu', '2027-01-05', '2027-01-13', 'Đang làm visa', 'Xe 7 chỗ UEH đón tại SGN', 104, 20, 8, 120, 150, 27500, 31800000, 14400000, 2000000, 'u3', 960, 'Không tạm ứng', 'Dự kiến', 'Chưa thanh toán', [
      { text: 'Xác nhận danh sách GV & thời gian lưu trú', done: true },
      { text: 'Đặt vé máy bay quốc tế & visa', done: true },
      { text: 'Nghiệm thu giờ giảng & thanh toán thù lao', done: false }
    ], [{ name: 'Prigent_Draft_Itinerary.pdf', size: 160000, type: 'application/pdf', at: '2026-11-01T08:00:00Z' }], 'Đoàn công tác hướng dẫn khóa luận tốt nghiệp và chấm báo cáo thực tập Khóa K50.']
  ].forEach(([lecturer, course, className, teachFrom, teachTo, teachHours, contractNo, outFlight, departAt, arriveAt, returnFlight, returnAt, hotel, bookingCode, hotelStatus, checkIn, checkOut, visa, pickup, rateEur, taxRate, perDiemDays, perDiemRate, tgvEur, fx, ticketCost, hotelCost, otherCost, advanceBy, advanceEur, advanceStatus, status, payStatus, steps, files, note]) => {
    push('trips', { lecturer, course, className, teachFrom, teachTo, teachHours, contractNo, outFlight, departAt, arriveAt, returnFlight, returnAt, hotel, bookingCode, hotelStatus, checkIn, checkOut, visa, pickup, rateEur, taxRate, perDiemDays, perDiemRate, tgvEur, fx, ticketCost, hotelCost, otherCost, advanceBy, advanceEur, advanceStatus, status, payStatus, steps, files, note })
  })

  // Học phí chuyển Rennes (transfers) - Căn cứ RIB chính thức từ Université de Rennes
  ;[
    ['Học phí K50 & K51 Đợt 1 năm học 2026–2027 chuyển ĐH Rennes', 45, 900, 27500, '2026-10-15', '2026-10-28', 'Rennes đã xác nhận', 0, 'TTr-128/KHTC-ISB', 'UNIVERSITE DE RENNES - SERVICE FACTURATION', 'IBAN: FR76 1007 1350 0000 0010 0000 135 · BIC: TRPUFRP1', 'Ban Giám hiệu UEH / Ban KHTC', '2026-10-20', '2026-11-04', [
      { text: 'Đối soát danh sách sinh viên hoàn thành học phí', done: true },
      { text: 'Ban Giám hiệu UEH phê duyệt lệnh chuyển EUR', done: true },
      { text: 'ĐH Rennes xác nhận báo có qua ngân hàng', done: true }
    ], [{ name: 'TK Ngân hàng_RIB UR signé for UEH.pdf', size: 203458, type: 'application/pdf', at: '2023-05-09T08:00:00Z' }], 'Đã chuyển thành công €40.500 cho 45 SV đợt 1 theo thông tin tài khoản Trésor Public tại Cité Administrative Rennes.'],

    ['Học phí K50 & K51 Đợt 2 năm học 2026–2027 chuyển ĐH Rennes (Dự kiến)', 25, 900, 27500, '2026-11-10', null, 'Đã chuyển', 0, 'TTr-145/KHTC-ISB', 'UNIVERSITE DE RENNES - SERVICE FACTURATION', 'IBAN: FR76 1007 1350 0000 0010 0000 135 · BIC: TRPUFRP1', 'Ban Giám hiệu UEH / Ban KHTC', '2026-11-14', null, [
      { text: 'Đối soát danh sách sinh viên hoàn thành học phí', done: true },
      { text: 'Ban Giám hiệu UEH phê duyệt lệnh chuyển EUR', done: true },
      { text: 'ĐH Rennes xác nhận báo có qua ngân hàng', done: false }
    ], [{ name: 'TK Ngân hàng_RIB UR signé for UEH.pdf', size: 203458, type: 'application/pdf', at: '2023-05-09T08:00:00Z' }], 'Lệnh chuyển €22.500 cho 25 SV đợt 2 đã gửi ngân hàng thực hiện, chờ Rennes xác nhận báo có.'],

    ['Phí duy trì bản quyền hệ thống học liệu điện tử LMS Moodle Rennes (60 SV)', 60, 150, 27500, '2026-09-10', '2026-09-25', 'Rennes đã xác nhận', 0, 'TTr-098/KHTC-ISB', 'UNIVERSITE DE RENNES - SERVICE FACTURATION', 'IBAN: FR76 1007 1350 0000 0010 0000 135 · BIC: TRPUFRP1', 'Ban Giám hiệu UEH / Ban KHTC', '2026-09-15', '2026-10-02', [
      { text: 'Đối soát danh sách sinh viên hoàn thành học phí', done: true },
      { text: 'Ban Giám hiệu UEH phê duyệt lệnh chuyển EUR', done: true },
      { text: 'ĐH Rennes xác nhận báo có qua ngân hàng', done: true }
    ], [{ name: 'TK Ngân hàng_RIB UR signé for UEH.pdf', size: 203458, type: 'application/pdf', at: '2023-05-09T08:00:00Z' }], 'Đã thanh toán phí bản quyền truy cập tài nguyên số thư viện và nền tảng Moodle cho 60 sinh viên.'],

    ['Lệ phí thẩm định hồ sơ tốt nghiệp và cấp bằng Cử nhân Quốc tế Rennes Khóa K49', 38, 250, 27500, '2026-11-01', null, 'Đã duyệt', 9500, 'TTr-160/KHTC-ISB', 'UNIVERSITE DE RENNES - SERVICE FACTURATION', 'IBAN: FR76 1007 1350 0000 0010 0000 135 · BIC: TRPUFRP1', 'Ban Giám hiệu UEH / Ban KHTC', '2026-11-08', null, [
      { text: 'Đối soát danh sách sinh viên hoàn thành học phí', done: true },
      { text: 'Ban Giám hiệu UEH phê duyệt lệnh chuyển EUR', done: true },
      { text: 'ĐH Rennes xác nhận báo có qua ngân hàng', done: false }
    ], [{ name: 'TK Ngân hàng_RIB UR signé for UEH.pdf', size: 203458, type: 'application/pdf', at: '2023-05-09T08:00:00Z' }], 'Đang làm thủ tục chuyển €9.500 cho ĐH Rennes để in và chuyển văn bằng Cử nhân Quốc tế cho sinh viên tốt nghiệp K49.'],

    ['Học phí đợt bổ sung học kỳ Mùa Xuân (Spring Semester 2027) cho sinh viên chuyển tiếp', 12, 900, 27500, '2026-11-12', null, 'Đề nghị', 10800, 'TTr-175/KHTC-ISB', 'UNIVERSITE DE RENNES - SERVICE FACTURATION', 'IBAN: FR76 1007 1350 0000 0010 0000 135 · BIC: TRPUFRP1', 'Chờ phê duyệt BGH', null, null, [
      { text: 'Đối soát danh sách sinh viên hoàn thành học phí', done: true },
      { text: 'Ban Giám hiệu UEH phê duyệt lệnh chuyển EUR', done: false },
      { text: 'ĐH Rennes xác nhận báo có qua ngân hàng', done: false }
    ], [{ name: 'TK Ngân hàng_RIB UR signé for UEH.pdf', size: 203458, type: 'application/pdf', at: '2023-05-09T08:00:00Z' }], 'Lập đề xuất chuyển học phí cho 12 sinh viên hoàn thành chuẩn tiếng Anh B2 chuyển sang giai đoạn 2.']
  ].forEach(([term, studentCount, feePerStudent, fx, requestDate, transferDate, status, debt, proposalNo, beneficiary, swiftRef, approvedBy, approvedAt, rennesConfirmedAt, steps, files, note]) => {
    push('transfers', { term, studentCount, feePerStudent, fx, requestDate, transferDate, status, debt, proposalNo, beneficiary, swiftRef, approvedBy, approvedAt, rennesConfirmedAt, steps, files, note })
  })

  // Chi phí & quyết toán thực tế (expenses) - Căn cứ toàn bộ 15 hóa đơn, chứng từ và bảng kê thanh toán
  ;[
    ['2026-06-19', 'In tài liệu hồ sơ chương trình song bằng UEH - Rennes', 'Văn phòng phẩm', 488160, 'Công ty TNHH TMDV In Ấn Toàn', 'PC-2026-0619', '1C26MND/00000216', '2026-06-19', '0317542763', 0, 'Đợt 1/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true },
      { text: 'Đủ chữ ký người nhận & người lập', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Hóa đơn in hồ sơ.pdf', size: 145000, type: 'application/pdf', at: '2026-06-19T10:00:00Z' }], 'In hồ sơ chương trình (Tổng thanh toán 488.160 đ, MST 0317542763).'],

    ['2026-06-22', 'Mua bìa còng 90F4 lưu trữ hồ sơ minh chứng chương trình', 'Văn phòng phẩm', 142560, 'Công ty TNHH TMDV SX Võ Hoàng Gia', 'PC-2026-0622', '1C26THG/59', '2026-06-22', '0316061866', 0, 'Đợt 1/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true },
      { text: 'Đủ chữ ký người nhận & người lập', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Hóa đơn mua bìa còng.pdf', size: 135000, type: 'application/pdf', at: '2026-06-22T11:00:00Z' }], 'Mua bìa còng 90F4 xanh đậm lưu hồ sơ song bằng (142.560 đ, MST 0316061866).'],

    ['2026-07-02', 'Vé máy bay khứ hồi Paris – SGN đợt 1 (GS. Christophe Tavera)', 'Vé máy bay', 81037000, 'Đại lý vé máy bay / HĐDV 05/HĐDV-UEH', 'PC-2026-0702', '1C26TKA/00004110', '2026-07-02', '0101243150', 0, 'Đợt 1/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true },
      { text: 'Vé máy bay / xác nhận khách sạn kèm boarding pass', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Hóa đơn_Tavera_vé mb_1C26TKA_00004110.pdf', size: 195000, type: 'application/pdf', at: '2026-07-02T10:00:00Z' }, { name: 'BBNT - Máy bay Rennes đợt 1.pdf', size: 210000, type: 'application/pdf', at: '2026-08-30T10:00:00Z' }], 'Vé máy bay AF khứ hồi đợt 1 GS. Tavera mã H9Q9DX theo HĐ 05/HĐDV-UEH.'],

    ['2026-08-02', 'Tiền phòng khách sạn lưu trú GS. Jean-Christophe Poutineau (7 đêm)', 'Khách sạn', 6552000, 'UEH BOUTIQUE HOTEL', 'PC-2026-0802', 'BK4277/#6817', '2026-08-02', '0302378687', 0, 'Đợt 1/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true },
      { text: 'Vé máy bay / xác nhận khách sạn kèm boarding pass', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Invoice_BK4277_ChristoplePoutineau.pdf', size: 145000, type: 'application/pdf', at: '2026-08-02T12:00:00Z' }], 'Phòng Triple 204 từ 26/07 đến 02/08/2026 (Chiết khấu nội bộ UEH 20%, 6.552.000 đ).'],

    ['2026-08-02', 'Sinh hoạt phí lưu trú 7 ngày GS. Jean-Christophe Poutineau (150€/ngày)', 'Thù lao giảng viên', 23100000, 'GS. Jean-Christophe Poutineau', 'PC-2026-0802-SHP', 'BK-SHP-POUTINEAU', '2026-08-02', '', 4620000, 'Đợt 1/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Biên lai / bảng khấu trừ thuế TNCN (nếu là thù lao)', done: true },
      { text: 'Đủ chữ ký người nhận & người lập', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Poutineau_BOARDING PASS.pdf', size: 98000, type: 'application/pdf', at: '2026-08-02T15:00:00Z' }], 'Sinh hoạt phí 1.050 EUR gross, khấu trừ 20% thuế TNCN 210 EUR, thực nhận net 840 EUR (18.480.000 đ).'],

    ['2026-08-14', 'In đề thi kiểm tra giữa kỳ học phần Tiền tệ, ngân hàng (GS. Poutineau)', 'Khác', 237600, 'Nhà in Khảo thí UEH / Đối tác in ấn', 'PC-2026-0814', '1C26MTT', '2026-08-14', '0302378687', 0, 'Đợt 1/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true },
      { text: 'Đủ chữ ký người nhận & người lập', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Hóa đơn_in đề KGTK Poutineau.pdf', size: 237600, type: 'application/pdf', at: '2026-08-14T08:00:00Z' }], 'In đề thi KGTK Poutineau (237.600 đ).'],

    ['2026-08-19', 'Vé máy bay khứ hồi Paris – SGN đợt tháng 12 (GS. Fabien Rondeau)', 'Vé máy bay', 56939000, 'Công ty Du lịch Khánh / MeInvoice MISA', 'PC-2026-0819', '1C26TKA/00005301', '2026-08-19', '0101243150', 0, 'Đợt 2/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true },
      { text: 'Vé máy bay / xác nhận khách sạn kèm boarding pass', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Hóa đơn_Vé mb_Rondeau_1C26TKA_00005301.pdf', size: 195000, type: 'application/pdf', at: '2026-08-19T10:00:00Z' }, { name: 'EN9XIY-RONDEAU FABIEN MR.pdf', size: 165000, type: 'application/pdf', at: '2026-08-18T08:00:00Z' }], 'Vé máy bay khứ hồi mã EN9XIY cho GS. Fabien Rondeau (56.939.000 đ).'],

    ['2026-08-20', 'Vé máy bay khứ hồi Paris – SGN đợt tháng 11 (GS. Franck Martin)', 'Vé máy bay', 56939000, 'Công ty Du lịch Khánh / MeInvoice MISA', 'PC-2026-0820', '1C26TKA/00005320', '2026-08-20', '0101243150', 0, 'Đợt 2/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true },
      { text: 'Vé máy bay / xác nhận khách sạn kèm boarding pass', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Hóa đơn_Vé mb_ Martin_1C26TKA_00005320.pdf', size: 195000, type: 'application/pdf', at: '2026-08-20T10:00:00Z' }, { name: 'MARTIN FRANCK PIERRE MR 7382323721091.pdf', size: 165000, type: 'application/pdf', at: '2026-08-18T08:00:00Z' }], 'Vé máy bay khứ hồi mã vé 7382323721091 cho GS. Franck Martin (56.939.000 đ).'],

    ['2026-08-30', 'Tiền phòng khách sạn lưu trú GS. Christophe Tavera Đợt 1 (7 đêm)', 'Khách sạn', 6552000, 'UEH BOUTIQUE HOTEL', 'PC-2026-0830', 'BK-TAVERA-08', '2026-08-30', '0302378687', 0, 'Đợt 1/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true },
      { text: 'Vé máy bay / xác nhận khách sạn kèm boarding pass', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Tavera_ RESERVATION_UEH BOUTIQUE HOTEL.pdf', size: 160000, type: 'application/pdf', at: '2026-08-20T08:00:00Z' }], 'Lưu trú 7 đêm tại UEH Boutique Hotel đợt 1 (23/08 - 30/08/2026, 6.552.000 đ).'],

    ['2026-08-30', 'Sinh hoạt phí lưu trú 7 ngày GS. Christophe Tavera Đợt 1 (150€/ngày)', 'Thù lao giảng viên', 23100000, 'GS. Christophe Tavera', 'PC-2026-0830-SHP', 'BK-SHP-TAVERA-01', '2026-08-30', '', 4620000, 'Đợt 1/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Biên lai / bảng khấu trừ thuế TNCN (nếu là thù lao)', done: true },
      { text: 'Đủ chữ ký người nhận & người lập', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Tavera_hợp đồng.pdf', size: 280000, type: 'application/pdf', at: '2026-08-15T09:00:00Z' }], 'Sinh hoạt phí 1.050 EUR gross, thuế TNCN 20% = 210 EUR, thực nhận 840 EUR.'],

    ['2026-11-02', 'Thanh toán vé máy bay khứ hồi GS. Tavera tự mua Đợt 2 (1.676,20 EUR)', 'Vé máy bay', 46095500, 'GS. Christophe Tavera', 'PC-2026-1102', 'ZMVHEA-TAVERA', '2026-11-02', '', 9219100, 'Đợt 2/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true },
      { text: 'Vé máy bay / xác nhận khách sạn kèm boarding pass', done: true },
      { text: 'Biên lai / bảng khấu trừ thuế TNCN (nếu là thù lao)', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Hóa đơn vé - Tavera tự mua.pdf', size: 175000, type: 'application/pdf', at: '2026-10-20T08:00:00Z' }, { name: 'Có thuế_Tavera_T11_BẢNG KÊ THANH TOÁN VIE-ENG.docx', size: 48000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-11-02T09:00:00Z' }], 'Tavera tự mua vé 1.676,20 EUR (46.095.500 đ), khấu trừ thuế TNCN 20% theo Bảng kê thanh toán của TS. Lê Đạt Chí.'],

    ['2026-11-08', 'Sinh hoạt phí 7 ngày GS. Christophe Tavera Đợt 2 (150€/ngày)', 'Thù lao giảng viên', 23100000, 'GS. Christophe Tavera', 'PC-2026-1108', 'BK-TAVERA-T11', '2026-11-08', '', 4620000, 'Đợt 2/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Biên lai / bảng khấu trừ thuế TNCN (nếu là thù lao)', done: true },
      { text: 'Đủ chữ ký người nhận & người lập', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Có thuế_Tavera_T11_BẢNG KÊ THANH TOÁN VIE-ENG.docx', size: 48000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-11-02T09:00:00Z' }], 'Sinh hoạt phí 1.050 EUR gross, trừ thuế 20% = 210 EUR, thực nhận net 840 EUR. Tổng thực nhận (vé + SHP) là 2.180,96 EUR.'],

    ['2026-11-08', 'Tiền phòng khách sạn lưu trú GS. Christophe Tavera Đợt 2 (6 đêm)', 'Khách sạn', 6552000, 'UEH BOUTIQUE HOTEL', 'PC-2026-1108-KS', 'BK-TAVERA-T11-KS', '2026-11-08', '0302378687', 0, 'Đợt 2/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true },
      { text: 'Vé máy bay / xác nhận khách sạn kèm boarding pass', done: true },
      { text: 'BGH duyệt lệnh chi', done: true }
    ], [{ name: 'Tavera_t11_PHIẾU ĐẶT PHÒNG UEH BOUTIQUE HOTEL.docx', size: 42000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-10-25T08:00:00Z' }], 'Lưu trú tại UEH Boutique Hotel từ 02/11 đến 08/11/2026 theo Phiếu đặt phòng Khoa Tài chính.'],

    ['2026-11-30', 'Tạm ứng sinh hoạt phí lưu trú 7 ngày GS. Franck Martin (150€/ngày)', 'Thù lao giảng viên', 23100000, 'GS. Franck Martin', 'PC-2026-1130-TU', 'BK-MARTIN-SHP', '2026-11-30', '', 4620000, 'Đợt 2/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Biên lai / bảng khấu trừ thuế TNCN (nếu là thù lao)', done: true },
      { text: 'Đủ chữ ký người nhận & người lập', done: true },
      { text: 'BGH duyệt lệnh chi', done: false }
    ], [{ name: 'Martin_BẢNG KÊ THANH TOÁN VIE-ENG.docx', size: 45000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-11-30T09:00:00Z' }], 'Tạm ứng 840 EUR net (1.050 EUR gross - 210 EUR thuế). Người lập bảng: Nguyễn Văn Thiện Tâm, Trưởng khoa TC: TS. Lê Đạt Chí.'],

    ['2026-12-07', 'Tạm ứng sinh hoạt phí lưu trú 7 ngày GS. Fabien Rondeau (150€/ngày)', 'Thù lao giảng viên', 23100000, 'GS. Fabien Rondeau', 'PC-2026-1207-TU', 'BK-RONDEAU-SHP', '2026-12-07', '', 4620000, 'Đợt 2/2026', 'TS. Tô Công Nguyên Bảo', [
      { text: 'Có hợp đồng / đề nghị thanh toán', done: true },
      { text: 'Biên lai / bảng khấu trừ thuế TNCN (nếu là thù lao)', done: true },
      { text: 'Đủ chữ ký người nhận & người lập', done: true },
      { text: 'BGH duyệt lệnh chi', done: false }
    ], [{ name: 'Rondeau_BẢNG KÊ THANH TOÁN VIE-ENG.docx', size: 45000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', at: '2026-12-07T09:00:00Z' }], 'Tạm ứng 840 EUR net (1.050 EUR gross - 210 EUR thuế). Người lập bảng: Nguyễn Văn Thiện Tâm, Trưởng khoa TC: TS. Lê Đạt Chí.']
  ].forEach(([date, item, category, amount, payee, voucher, invoiceNo, invoiceDate, vendorTax, pitWithheld, settleBatch, approvedBy, checks, files, note]) => {
    push('expenses', { date, item, category, amount, payee, voucher, invoiceNo, invoiceDate, vendorTax, pitWithheld, settleBatch, approvedBy, checks, files, note, status: checks.every(c => c.done) ? 'Đã chi' : 'Đang giải ngân' })
  })

  // Điểm học phần chính thức & mẫu song bằng Rennes (grades)
  // Quy đổi thang 10 & xét chuẩn Rennes (MOA Điều 9): TB >= 10/20 và không môn nào < 10/20
  ;[
    // Khóa K50 (Năm 3) - SV245001: Nguyễn Hoàng Long (Đủ ĐK xét tốt nghiệp Rennes)
    ['SV245001', 'Nguyễn Hoàng Long', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'HK1 (2025)', 16.5, 'Kỳ thi CC1 & cuối kỳ đợt 1'],
    ['SV245001', 'Nguyễn Hoàng Long', 'Kinh tế vĩ mô', 'HK1 (2025)', 17.0, 'Đạt điểm giỏi'],
    ['SV245001', 'Nguyễn Hoàng Long', 'Tài chính quốc tế', 'HK2 (2025)', 15.0, 'Đạt khá giỏi'],
    ['SV245001', 'Nguyễn Hoàng Long', 'Sản phẩm phái sinh', 'HK1 (2026)', 14.5, 'Bài kiểm tra giữa kỳ & trắc nghiệm'],
    ['SV245001', 'Nguyễn Hoàng Long', 'Kinh tế lượng chuỗi thời gian', 'HK1 (2026)', 16.0, 'Báo cáo Lab EViews xuất sắc'],

    // Khóa K50 - SV245002: Trần Thị Thanh Bình (Thủ khoa K50 - Đủ ĐK)
    ['SV245002', 'Trần Thị Thanh Bình', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'HK1 (2025)', 18.0, 'Điểm số cao nhất khóa'],
    ['SV245002', 'Trần Thị Thanh Bình', 'Kinh tế vĩ mô', 'HK1 (2025)', 18.5, 'Xuất sắc'],
    ['SV245002', 'Trần Thị Thanh Bình', 'Tài chính quốc tế', 'HK2 (2025)', 17.5, 'Xuất sắc'],
    ['SV245002', 'Trần Thị Thanh Bình', 'Sản phẩm phái sinh', 'HK1 (2026)', 16.5, 'Giỏi'],
    ['SV245002', 'Trần Thị Thanh Bình', 'Kinh tế lượng chuỗi thời gian', 'HK1 (2026)', 17.0, 'Giỏi'],

    // Khóa K50 - SV245003: Lê Quốc Cường (Chưa đủ ĐK do có môn < 10 -> CẦN XỬ LÝ)
    ['SV245003', 'Lê Quốc Cường', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'HK1 (2025)', 13.0, 'Đạt yêu cầu'],
    ['SV245003', 'Lê Quốc Cường', 'Kinh tế vĩ mô', 'HK1 (2025)', 14.0, 'Đạt yêu cầu'],
    ['SV245003', 'Lê Quốc Cường', 'Tài chính quốc tế', 'HK2 (2025)', 12.0, 'Đạt yêu cầu'],
    ['SV245003', 'Lê Quốc Cường', 'Sản phẩm phái sinh', 'HK1 (2026)', 13.5, 'Đạt yêu cầu'],
    ['SV245003', 'Lê Quốc Cường', 'Kinh tế lượng chuỗi thời gian', 'HK1 (2026)', 8.5, 'Dưới 10/20 · Cần đăng ký thi lại đợt tháng 12'],

    // Khóa K50 - SV245004: Phạm Thảo My (Đủ ĐK xét chuyển tiếp Master Rennes)
    ['SV245004', 'Phạm Thảo My', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'HK1 (2025)', 15.0, 'Đạt loại khá - giỏi'],
    ['SV245004', 'Phạm Thảo My', 'Kinh tế vĩ mô', 'HK1 (2025)', 16.0, 'Đạt loại giỏi'],
    ['SV245004', 'Phạm Thảo My', 'Tài chính quốc tế', 'HK2 (2025)', 14.5, 'Đạt khá'],
    ['SV245004', 'Phạm Thảo My', 'Sản phẩm phái sinh', 'HK1 (2026)', 15.5, 'Đạt khá - giỏi'],
    ['SV245004', 'Phạm Thảo My', 'Kinh tế lượng chuỗi thời gian', 'HK1 (2026)', 16.0, 'Đạt giỏi'],

    // Khóa K50 - SV245005: Vũ Đức Anh (Chưa đủ ĐK: 1 môn < 10, 1 môn chờ điểm -> CẦN XỬ LÝ)
    ['SV245005', 'Vũ Đức Anh', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'HK1 (2025)', 11.5, 'Trung bình khá'],
    ['SV245005', 'Vũ Đức Anh', 'Kinh tế vĩ mô', 'HK1 (2025)', 12.0, 'Trung bình khá'],
    ['SV245005', 'Vũ Đức Anh', 'Tài chính quốc tế', 'HK2 (2025)', 10.5, 'Đạt chuẩn tối thiểu'],
    ['SV245005', 'Vũ Đức Anh', 'Sản phẩm phái sinh', 'HK1 (2026)', 9.0, 'Dưới 10/20 · Cần thi lại bài kiểm tra cuối môn'],
    ['SV245005', 'Vũ Đức Anh', 'Kinh tế lượng chuỗi thời gian', 'HK1 (2026)', '', 'Chờ hội đồng khảo thí Rennes gửi bảng điểm chính thức'],

    // Khóa K51 (Năm 2) - SV255101: Đặng Minh Khôi (Đủ ĐK)
    ['SV255101', 'Đặng Minh Khôi', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'HK1 (2026)', 14.5, 'Đạt kết quả tốt'],
    ['SV255101', 'Đặng Minh Khôi', 'Kinh tế vĩ mô', 'HK1 (2026)', 15.5, 'Đạt kết quả tốt'],
    ['SV255101', 'Đặng Minh Khôi', 'Tài chính quốc tế', 'HK1 (2026)', 14.0, 'Đạt yêu cầu'],
    ['SV255101', 'Đặng Minh Khôi', 'Kinh tế lượng chuỗi thời gian', 'HK1 (2026)', 13.5, 'Đạt yêu cầu'],

    // Khóa K51 - SV255102: Hoàng Ngọc Lan (Đủ ĐK)
    ['SV255102', 'Hoàng Ngọc Lan', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'HK1 (2026)', 16.5, 'Giỏi'],
    ['SV255102', 'Hoàng Ngọc Lan', 'Kinh tế vĩ mô', 'HK1 (2026)', 17.0, 'Giỏi'],
    ['SV255102', 'Hoàng Ngọc Lan', 'Tài chính quốc tế', 'HK1 (2026)', 16.0, 'Giỏi'],
    ['SV255102', 'Hoàng Ngọc Lan', 'Kinh tế lượng chuỗi thời gian', 'HK1 (2026)', 15.5, 'Khá - giỏi'],

    // Khóa K51 - SV255103: Bùi Gia Huy (Đủ ĐK)
    ['SV255103', 'Bùi Gia Huy', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'HK1 (2026)', 12.5, 'Đạt yêu cầu'],
    ['SV255103', 'Bùi Gia Huy', 'Kinh tế vĩ mô', 'HK1 (2026)', 13.0, 'Đạt yêu cầu'],
    ['SV255103', 'Bùi Gia Huy', 'Tài chính quốc tế', 'HK1 (2026)', 11.5, 'Đạt yêu cầu'],
    ['SV255103', 'Bùi Gia Huy', 'Kinh tế lượng chuỗi thời gian', 'HK1 (2026)', 12.0, 'Đạt yêu cầu'],

    // Khóa K51 - SV255104: Võ Phương Linh (Đủ ĐK)
    ['SV255104', 'Võ Phương Linh', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'HK1 (2026)', 17.5, 'Xuất sắc'],
    ['SV255104', 'Võ Phương Linh', 'Kinh tế vĩ mô', 'HK1 (2026)', 16.5, 'Giỏi'],
    ['SV255104', 'Võ Phương Linh', 'Tài chính quốc tế', 'HK1 (2026)', 17.0, 'Giỏi'],
    ['SV255104', 'Võ Phương Linh', 'Kinh tế lượng chuỗi thời gian', 'HK1 (2026)', 16.5, 'Giỏi'],

    // Khóa K51 - SV255105: Ngô Tiến Dũng (Chưa đủ ĐK: 1 môn < 10, 1 môn chờ điểm -> CẦN XỬ LÝ)
    ['SV255105', 'Ngô Tiến Dũng', 'Tiền tệ, Ngân hàng và Thị trường tài chính', 'HK1 (2026)', 9.5, 'Dưới 10/20 · Cần nộp bài tập lớn bổ sung'],
    ['SV255105', 'Ngô Tiến Dũng', 'Kinh tế vĩ mô', 'HK1 (2026)', 10.5, 'Đạt chuẩn tối thiểu'],
    ['SV255105', 'Ngô Tiến Dũng', 'Tài chính quốc tế', 'HK1 (2026)', 11.0, 'Đạt yêu cầu'],
    ['SV255105', 'Ngô Tiến Dũng', 'Kinh tế lượng chuỗi thời gian', 'HK1 (2026)', '', 'Đang chờ giảng viên Rennes chấm bài thi bù'],
  ].forEach(([studentId, fullName, course, term, score20, note]) => {
    push('grades', {
      studentId,
      fullName,
      course,
      term,
      score20: score20 === '' ? '' : +score20,
      note,
      score10: (score20 === '' || score20 == null) ? '' : (+score20 / 2).toFixed(2),
      result: (score20 === '' || score20 == null) ? 'Chưa có điểm' : +score20 >= 10 ? 'Đạt' : 'Dưới 10/20'
    })
  })

  // Hộp thư sinh viên (tickets)
  ;[
    ['Hỗ trợ kích hoạt tài khoản Email & ENT Rennes', 'Ngô Tiến Dũng', 'dung.nt@st.ueh.edu.vn', addDays(-4), 'Tài khoản Rennes', 'Đang xử lý', 'Đào Thị Tuyết Nhung', addDays(1), 'Em chào thầy cô, em chưa nhận được email kích hoạt tài khoản ENT @etudiant.univ-rennes.fr để vào nộp bài tập môn Kinh tế vĩ mô. Nhờ thầy cô kiểm tra và cấp lại giúp em ạ.', []],
    ['Thắc mắc thủ tục visa Campus France & chứng minh tài chính du học Master', 'Phạm Thảo My', 'my.pt@st.ueh.edu.vn', addDays(-3), 'Du học / visa', 'Đang xử lý', 'ThS. Hoàng Thị Phương Anh', addDays(3), 'Dạ em muốn hỏi về lịch phỏng vấn Campus France và thủ tục chứng minh tài chính cho đợt chuyển tiếp sang Đại học Rennes vào năm 4 ạ.', []],
    ['Đơn xin hoãn nộp học phí kỳ 5 chương trình song bằng', 'Vũ Đức Anh', 'anh.vd@st.ueh.edu.vn', addDays(-2), 'Học phí', 'Đang xử lý', 'TS. Tô Công Nguyên Bảo', addDays(2), 'Kính gửi Ban Quản lý Đào tạo, do hoàn cảnh gia đình em xin phép được gia hạn nộp phần học phí còn lại của kỳ 5 đến hết ngày 30/11/2026. Em xin chân thành cảm ơn.', []],
    ['Đăng ký thi lại môn Kinh tế lượng chuỗi thời gian', 'Lê Quốc Cường', 'cuong.lq@st.ueh.edu.vn', addDays(-1), 'Khảo thí', 'Chờ SV phản hồi', 'ThS. Nguyễn Văn Thiện Tâm', addDays(4), 'Em muốn đăng ký lịch thi lại và đóng lệ phí thi lại cho môn Kinh tế lượng chuỗi thời gian đợt hội đồng tháng 12 tới.', []],
    ['Xin giấy xác nhận kết quả học tập để xin học bổng doanh nghiệp', 'Trần Thị Thanh Bình', 'binh.tt@st.ueh.edu.vn', addDays(-5), 'Hồ sơ SV', 'Đã giải quyết', 'ThS. Hoàng Thị Phương Anh', addDays(-2), 'Em cần xin 01 bản giấy xác nhận điểm tích lũy và xác nhận sinh viên song bằng UEH - Rennes để nộp hồ sơ học bổng Vallet.', []],
    ['Tài liệu học tập môn Sản phẩm phái sinh không tải được trên LMS', 'Bùi Gia Huy', 'huy.bg@st.ueh.edu.vn', addDays(-6), 'Học liệu / LMS', 'Đã giải quyết', 'Đào Thị Tuyết Nhung', addDays(-3), 'Một số slide bài giảng tuần 3 môn Phái sinh bị lỗi link tải, em gửi thư nhờ Ban Quản trị cập nhật lại link tải tài liệu.', []],
    ['Đề nghị cấp lại mật khẩu tài khoản LMS Rennes (Moodle UR)', 'Trần Bảo Minh', 'minh.tb.k51@st.ueh.edu.vn', addDays(-3), 'Tài khoản Rennes', 'Đã giải quyết', 'Đào Thị Tuyết Nhung', addDays(-2), 'Em bị quên mật khẩu tài khoản Moodle Rennes để nộp bài tập môn Kinh tế lượng tài chính, nhờ Thầy/Cô reset mật khẩu giúp em ạ.', []],
    ['Hỏi về thời hạn bảo vệ luận văn tốt nghiệp song bằng đợt tháng 3/2027', 'Lê Phương Nam', 'nam.lp.k50@st.ueh.edu.vn', addDays(-4), 'Học vụ', 'Đang xử lý', 'ThS. Nguyễn Văn Thiện Tâm', addDays(1), 'Kính gửi Ban Điều phối, cho em hỏi thời hạn nộp bản thảo đề cương khóa luận tốt nghiệp cho Giáo sư Rennes hướng dẫn là ngày nào ạ?', []],
    ['Xin xác nhận sinh viên để gia hạn visa du học Pháp giai đoạn năm cuối', 'Nguyễn Thị Thanh Thảo', 'thao.ntt.k50@st.ueh.edu.vn', addDays(-5), 'Du học / visa', 'Đã giải quyết', 'ThS. Nguyễn Văn Thiện Tâm', addDays(-4), 'Dạ em cần giấy xác nhận hoàn thành 8 học phần giai đoạn 1 của Rennes để nộp hồ sơ xin visa Pháp cho kỳ Spring 2027, em có thể nhận giấy ở đâu ạ?', []],
    ['Thắc mắc về việc phúc khảo bài thi học phần Kinh tế vi mô', 'Hoàng Gia Huy', 'huy.hg.k52@st.ueh.edu.vn', addDays(-6), 'Khảo thí', 'Đã giải quyết', 'ThS. Hoàng Thị Phương Anh', addDays(-5), 'Thầy/Cô cho em hỏi mẫu đơn xin phúc khảo bài thi môn Kinh tế vi mô và lệ phí phúc khảo là bao nhiêu ạ?', []],
  ].forEach(([subject, fromName, fromEmail, receivedAt, topic, status, handler, due, body, files]) => {
    push('tickets', { subject, fromName, fromEmail, receivedAt, topic, status, handler, due, body, files })
  })

  return out
}

/* ================= DỮ LIỆU BÀN LÀM VIỆC DỰ ÁN QUỸ ĐẦU TƯ MẠO HIỂM GIA LAI ================= */
export function buildGiaLaiItems(pid = 'p3') {
  const out = []
  let n = 0
  const push = (module, data, by = 'u1') =>
    out.push({
      id: `i_${module}_${++n}`,
      projectId: pid,
      module,
      createdBy: by,
      updatedBy: by,
      createdAt: new Date(Date.now() - n * 36e5).toISOString(),
      updatedAt: new Date(Date.now() - n * 18e5).toISOString(),
      ...data,
    })

  /* ---- Card 01: Văn bản & Pháp lý Sở Ngành (gl_docs) ---- */
  // Thống kê: Đã ký: 5 | Đang phúc đáp: 2 | Chờ ý kiến Sở ngành: 2
  const glDocs = [
    {
      number: '0440/QĐ-TTKPKH',
      title: 'Quyết định thành lập Tổ chuyên viên và giao nhiệm vụ xây dựng Đề án Quỹ ĐTMH tỉnh Gia Lai',
      agency: 'Trung tâm Khởi nghiệp & ĐMST',
      docType: 'Quyết định giao nhiệm vụ',
      issueDate: '2026-11-06',
      status: 'Đã ký',
      files: [{ name: '0440_QĐ-TTKPKH_06112026-signed_01.pdf', size: 345000 }],
      note: 'Giao Trung tâm phối hợp cùng Nhóm chuyên gia tư vấn UEH xây dựng hoàn thiện hồ sơ Đề án, Tờ trình và dự thảo Nghị quyết HĐND tỉnh.',
    },
    {
      number: '11578/STC-DNKTTT',
      title: 'Ý kiến của Sở Tài chính về nguồn vốn ngân sách và cơ chế tài chính cho Quỹ ĐTMH',
      agency: 'Sở Tài chính Gia Lai',
      docType: 'Công văn đến',
      issueDate: '2026-11-06',
      status: 'Chờ ý kiến Sở ngành',
      files: [{ name: '11578_STC-DNKTTT_06112026-signed_01.pdf', size: 420000 }],
      note: 'Sở Tài chính đề nghị rà soát kỹ tính tương thích với Luật NSNN và tỷ lệ góp vốn điều lệ ngân sách tỉnh tối đa 30%.',
    },
    {
      number: '5961/SCT-VP',
      title: 'Góp ý dự thảo Đề án và danh sách doanh nghiệp khởi nghiệp ĐMST tiềm năng',
      agency: 'Sở Công thương Gia Lai',
      docType: 'Công văn đến',
      issueDate: '2026-11-06',
      status: 'Đã ký',
      files: [{ name: '5961_SCT-VP_06112026-signed_01.pdf', size: 280000 }],
      note: 'Đề xuất bổ sung nhóm ngành chế biến nông sản xuất khẩu và năng lượng tái tạo vào danh mục ưu tiên đầu tư của Quỹ.',
    },
    {
      number: 'CV/CT-TTHT',
      title: 'Chính sách ưu đãi thuế TNDN, TNCN đối với hoạt động đầu tư mạo hiểm địa phương',
      agency: 'Cục Thuế tỉnh Gia Lai',
      docType: 'Công văn đến',
      issueDate: '2026-11-08',
      status: 'Đã ký',
      files: [{ name: 'Thuế - Cong van phoi hop So KHCN.pdf', size: 310000 }],
      note: 'Hướng dẫn điều kiện áp dụng ưu đãi thuế theo Nghị định 365/2025/NĐ-CP và Nghị định 366/2025/NĐ-CP.',
    },
    {
      number: '13057/SNNMT-KHTC',
      title: 'Danh mục dự án nông nghiệp công nghệ cao tiềm năng kêu gọi đầu tư mạo hiểm',
      agency: 'Sở NN&PTNT Gia Lai',
      docType: 'Công văn đến',
      issueDate: '2026-11-10',
      status: 'Đã ký',
      files: [{ name: '13057_SNNMT-KHTC_Phu_luc_I-II.pdf', size: 520000 }],
      note: 'Cung cấp phụ lục 15 HTX và doanh nghiệp nông nghiệp tuần hoàn, giống cà phê Robusta đặc sản và dược liệu Chư Prông.',
    },
    {
      number: 'CV-UEH/GL-01',
      title: 'Công văn phúc đáp Sở KH&CN tỉnh Gia Lai về tiếp thu góp ý và điều chỉnh đề cương Đề án',
      agency: 'Nhóm Tư vấn UEH',
      docType: 'Công văn đi',
      issueDate: '2026-11-11',
      status: 'Đang phúc đáp',
      files: [{ name: 'Công văn phúc đáp Sở KHCN tỉnh Gia Lai.docx', size: 190000 }, { name: 'Công văn phúc đáp Sở KHCN tỉnh Gia Lai.pdf', size: 260000 }],
      note: 'Giải trình 04 nhóm vấn đề trọng tâm và kế hoạch làm việc thực tế tại tỉnh Pleiku.',
    },
    {
      number: 'CV-UEH/STC-02',
      title: 'Đề xuất nội dung phúc đáp Sở Tài chính tỉnh Gia Lai về phương án vốn và bảo toàn vốn mồi',
      agency: 'Nhóm Tư vấn UEH',
      docType: 'Công văn đi',
      issueDate: '2026-11-12',
      status: 'Đang phúc đáp',
      files: [{ name: 'CV de xuat noi dung phuc dap So Tai chinh - dieu chinh signed.pdf', size: 380000 }],
      note: 'Đề xuất phương án vốn điều lệ 100 tỷ VNĐ (NSNN 30 tỷ + Cổ đông tư nhân 70 tỷ), cơ chế phân chia rủi ro theo chuẩn mực quốc tế.',
    },
    {
      number: 'TTr-UBND/QDTMH',
      title: 'Dự thảo Tờ trình UBND tỉnh Gia Lai trình HĐND tỉnh ban hành Nghị quyết thành lập Quỹ',
      agency: 'UBND Tỉnh Gia Lai',
      docType: 'Tờ trình UBND tỉnh',
      issueDate: '2026-11-14',
      status: 'Chờ ý kiến Sở ngành',
      files: [{ name: 'TTr DA Thanh lap Quy dau tu mao hiem.signed.pdf', size: 450000 }],
      note: 'Tờ trình hoàn thiện kèm Dự thảo Nghị quyết cơ chế đặc thù, đang xin ý kiến thành viên UBND tỉnh.',
    },
    {
      number: 'CV-DNT/GL-03',
      title: 'Ý kiến góp ý của Hội Doanh nhân trẻ tỉnh Gia Lai về cơ chế thoái vốn và khẩu vị đầu tư',
      agency: 'Trung tâm Khởi nghiệp & ĐMST',
      docType: 'Công văn đến',
      issueDate: '2026-11-09',
      status: 'Đã ký',
      files: [{ name: 'CV DNT gop y De an Quy DTMH gui SKHCN.pdf', size: 240000 }],
      note: 'Khẳng định sự ủng hộ của cộng đồng doanh nghiệp địa phương và đề xuất các điều khoản thoái vốn linh hoạt.',
    },
  ]
  glDocs.forEach((doc) => push('gl_docs', doc, 'u1'))

  /* ---- Card 02: Khảo sát & Dữ liệu Đầu vào (gl_surveys) ---- */
  // Thống kê: Đã nhận số liệu: 8 | Đang tổng hợp: 2 (chia theo 8 nhóm loại dữ liệu chuẩn từ file xin dữ liệu)
  const glSurveys = [
    {
      code: 'KS-DN-01',
      dataTitle: 'Phiếu khảo sát nhu cầu vốn, khả năng hấp thụ và thực trạng ĐMST của 120 DN & HTX địa phương',
      source: 'Cộng đồng DN/HTX & Sở KH&CN',
      dataType: 'Nhóm I: Khảo sát Nhu cầu vốn & Thực trạng DN/HTX',
      reportedContent: 'Báo cáo tổng hợp bước đầu 78/120 phiếu thu về: 82% doanh nghiệp có nhu cầu vốn từ 1–5 tỷ đồng cho đổi mới công nghệ và bao bì thương hiệu; 65% sẵn sàng chấp nhận cơ chế đồng đầu tư chia sẻ cổ phần thay vì vay vốn ngân hàng thế chấp bất động sản.',
      status: 'Đang tổng hợp',
      sampleCount: '78/120 phiếu (65%)',
      updatedDate: '2026-11-14',
      files: [{ name: 'Phieu_de_nghi_cung_cap_thong_tin_DeAn_QuyDTMH_GiaLai.docx', size: 140000 }],
      note: 'Đã hoàn tất đợt 1 khảo sát trực tiếp tại TP. Pleiku và TX. An Khê. Đang đôn đốc thu nốt 42 phiếu từ huyện Chư Prông và Kbang.',
    },
    {
      code: 'PII-GL-2026',
      dataTitle: 'Bộ chỉ số Đổi mới sáng tạo cấp địa phương (PII 2026) – 52 chỉ số thành phần tỉnh Gia Lai',
      source: 'Sở KH&CN & Bộ KH&CN',
      dataType: 'Nhóm II: Chỉ số Đổi mới sáng tạo (PII) & Tiềm lực KH&CN',
      reportedContent: 'Sở KH&CN phúc đáp: Điểm PII 2026 đạt 36.42 điểm, xếp hạng 38/63 tỉnh thành; trụ cột Thể chế (hạng 24) và Sản phẩm sáng tạo (hạng 29) đạt khá; trụ cột Vốn tín dụng và đầu tư mạo hiểm xếp hạng 58/63 – là điểm nghẽn lớn nhất cần tháo gỡ bằng việc thành lập Quỹ ĐTMH tỉnh.',
      status: 'Đã nhận số liệu',
      sampleCount: '52/52 chỉ số (100%)',
      updatedDate: '2026-11-05',
      files: [{ name: 'PII2026.pdf', size: 2800000 }, { name: 'muc_tieu_pii2026.pdf', size: 680000 }],
      note: 'Cơ sở quan trọng nhất để thuyết minh sự cần thiết thành lập Quỹ trong Tờ trình gửi HĐND tỉnh.',
    },
    {
      code: 'KTXH-Q3',
      dataTitle: 'Số liệu thống kê phát triển Kinh tế – Xã hội, GRDP và cơ cấu ngành tỉnh Gia Lai 9 tháng đầu năm 2026',
      source: 'Cục Thống kê tỉnh Gia Lai',
      dataType: 'Nhóm III: Kinh tế – Xã hội & Niên giám thống kê',
      reportedContent: 'Cục Thống kê báo cáo: Tốc độ tăng trưởng GRDP 9 tháng đạt 6,85%; khu vực nông - lâm - thủy sản chiếm 34,2%, công nghiệp - xây dựng 28,6%, dịch vụ 33,4%; kim ngạch xuất khẩu đạt 720 triệu USD; toàn tỉnh có 5.200 doanh nghiệp đang hoạt động, tỷ lệ thành lập mới tăng 12,4%.',
      status: 'Đã nhận số liệu',
      sampleCount: '1 Niên giám + 3 Báo cáo',
      updatedDate: '2026-10-25',
      files: [{ name: 'TÌNH HÌNH KINH TẾ - XÃ HỘI QUÝ III 2026.pdf', size: 1950000 }],
      note: 'Dữ liệu chứng minh tiềm năng quy mô nền kinh tế và dư địa hình thành thị trường đầu tư mạo hiểm địa phương.',
    },
    {
      code: 'NN-CNC-15',
      dataTitle: 'Danh mục 15 dự án nông nghiệp công nghệ cao, nông sản xuất khẩu và chuỗi liên kết HTX chủ lực',
      source: 'Sở NN&PTNT tỉnh Gia Lai',
      dataType: 'Nhóm IV: Nông nghiệp Công nghệ cao & Nông sản, Dược liệu',
      reportedContent: 'Sở NN&PTNT phúc đáp công văn: Cung cấp danh mục 15 dự án nông nghiệp CNC trọng điểm: cà phê cảnh quan bền vững Chư Prông (4.500 ha), hồ tiêu hữu cơ Chư Sê, sâm Ngọc Linh và dược liệu dưới tán rừng Kbang, chăn nuôi bò sữa công nghệ cao Mang Yang; 28 HTX có phương án khả thi cần vốn đầu tư sơ chế, chứng nhận GlobalGAP.',
      status: 'Đã nhận số liệu',
      sampleCount: '15 dự án + 28 HTX',
      updatedDate: '2026-11-08',
      files: [{ name: '13057_SNNMT-KHTC_Phu_luc_I-II.pdf', size: 520000 }],
      note: 'Lĩnh vực mục tiêu số 1 của Quỹ đầu tư mạo hiểm Gia Lai trong giai đoạn 1 (2026–2028).',
    },
    {
      code: 'THUE-DN-26',
      dataTitle: 'Thống kê nghĩa vụ thuế, doanh thu và chính sách ưu đãi thuế khối doanh nghiệp khởi nghiệp ĐMST',
      source: 'Cục Thuế tỉnh Gia Lai',
      dataType: 'Nhóm V: Thuế, Tài chính & Tình hình Doanh nghiệp',
      reportedContent: 'Cục Thuế tỉnh báo cáo: Rà soát 250 doanh nghiệp vừa và nhỏ trong lĩnh vực chế biến, công nghệ sinh học và dịch vụ số; hướng dẫn điều kiện miễn thuế TNDN 4 năm, giảm 50% trong 9 năm tiếp theo và giảm thuế TNCN cho chuyên gia/nhà sáng lập theo Nghị định 365, 366.',
      status: 'Đã nhận số liệu',
      sampleCount: '250 doanh nghiệp',
      updatedDate: '2026-11-09',
      files: [{ name: 'Thuế - Cong van phoi hop So KHCN.pdf', size: 310000 }],
      note: 'Căn cứ tính toán bài toán tài chính hoàn vốn và tác động kích cầu nguồn thu ngân sách gián tiếp từ Quỹ.',
    },
    {
      code: 'TC-NS-01',
      dataTitle: 'Phương án cân đối nguồn vốn ngân sách tỉnh và cơ cấu vốn mồi (30%) cho Quỹ ĐTMH',
      source: 'Sở Tài chính tỉnh Gia Lai',
      dataType: 'Nhóm VI: Dự toán Ngân sách, Vốn mồi & Cơ chế NSNN',
      reportedContent: 'Sở Tài chính phúc đáp tại CV 11578/STC: Báo cáo khả năng bố trí 30 tỷ đồng (30% vốn điều lệ 100 tỷ) từ nguồn chi đầu tư phát triển KH&CN giai đoạn 2026–2030; đề xuất cơ chế ủy thác hoặc thành lập doanh nghiệp KH&CN đặc thù để bảo toàn và phát triển vốn nhà nước.',
      status: 'Đã nhận số liệu',
      sampleCount: '1 Phương án vốn chi tiết',
      updatedDate: '2026-11-06',
      files: [{ name: '11578_STC-DNKTTT_06112026-signed_01.pdf', size: 420000 }],
      note: 'Đã thống nhất phương án vốn mồi NSNN 30%, tư nhân 70% sau buổi làm việc trực tuyến ngày 09/11.',
    },
    {
      code: 'CT-CB-02',
      dataTitle: 'Hiện trạng công nghiệp chế biến nông lâm sản xuất khẩu và tiềm năng năng lượng tái tạo',
      source: 'Sở Công Thương tỉnh Gia Lai',
      dataType: 'Nhóm VII: Công nghiệp Chế biến, Thương mại & Năng lượng',
      reportedContent: 'Sở Công Thương báo cáo tại CV 5961/SCT: Cung cấp danh mục 18 doanh nghiệp chế biến sâu cà phê, mắc ca, hồ tiêu và 12 dự án điện gió, điện mặt trời mái nhà; đề xuất Quỹ ưu tiên rót vốn vào các dự án phụ phẩm nông nghiệp và logistics chuỗi lạnh Pleiku.',
      status: 'Đã nhận số liệu',
      sampleCount: '18 DN chế biến + 12 dự án',
      updatedDate: '2026-11-06',
      files: [{ name: '5961_SCT-VP_06112026-signed_01.pdf', size: 280000 }],
      note: 'Các doanh nghiệp này có doanh thu ổn định, là đối tượng hấp thụ vốn mở rộng sản xuất rất tiềm năng.',
    },
    {
      code: 'CD-TN-A13',
      dataTitle: 'Danh mục khảo sát nhà đầu tư tiềm năng (Nhóm A1–A3) và Doanh nghiệp đầu ngành cam kết góp vốn',
      source: 'Hội Doanh nhân trẻ & Sở KH&CN',
      dataType: 'Nhóm VIII: Cổ đông Tiềm năng & Cam kết góp vốn tư nhân',
      reportedContent: 'Hội Doanh nhân trẻ báo cáo: Đã tiếp cận 10 doanh nghiệp đầu ngành tại Pleiku và TP.HCM; 5 đơn vị cam kết tham gia làm nhà đầu tư sáng lập (Nhóm A1–A2) với tổng số vốn dự kiến 45 tỷ đồng; Hội đề xuất cử đại diện tham gia Hội đồng quản lý Quỹ.',
      status: 'Đang tổng hợp',
      sampleCount: '5/10 doanh nghiệp cam kết',
      updatedDate: '2026-11-13',
      files: [{ name: 'CV DNT gop y De an Quy DTMH gui SKHCN.pdf', size: 240000 }, { name: 'Đề xuất cung cấp dữ liệu_bản rút gọn_định dạng UEH.docx', size: 210000 }],
      note: 'Bà Lê Uyên Chi (Sở KH&CN) đang phối hợp đôn đốc ký biên bản thỏa thuận nguyên tắc trước ngày 25/11.',
    },
    {
      code: 'KH-DT-05',
      dataTitle: 'Thống kê danh mục thu hút đầu tư, đăng ký kinh doanh và chính sách hỗ trợ vườn ươm khởi nghiệp',
      source: 'Sở Kế hoạch & Đầu tư tỉnh Gia Lai',
      dataType: 'Nhóm VI: Dự toán Ngân sách, Vốn mồi & Cơ chế NSNN',
      reportedContent: 'Sở KH&ĐT phúc đáp: Cung cấp danh mục 42 dự án kêu gọi đầu tư tỉnh Gia Lai; hiện trạng 2 cơ sở vườn ươm tại Pleiku; đề xuất quy chế một cửa liên thông giải quyết thủ tục đăng ký kinh doanh và chuyển nhượng cổ phần cho doanh nghiệp nhận vốn từ Quỹ.',
      status: 'Đã nhận số liệu',
      sampleCount: '42 dự án + 2 cơ sở ươm tạo',
      updatedDate: '2026-11-11',
      files: [{ name: '0440_QĐ-TTKPKH_06112026-signed_01.pdf', size: 345000 }],
      note: 'Tạo hành lang pháp lý rút ngắn thời gian giải ngân và thoái vốn cho các thương vụ đầu tư.',
    },
    {
      code: 'TP-PL-03',
      dataTitle: 'Ý kiến thẩm định cơ sở pháp lý và thẩm quyền HĐND tỉnh ban hành cơ chế vốn mồi Quỹ ĐTMH',
      source: 'Sở Tư pháp tỉnh Gia Lai',
      dataType: 'Nhóm VI: Dự toán Ngân sách, Vốn mồi & Cơ chế NSNN',
      reportedContent: 'Sở Tư pháp thẩm định: Căn cứ Luật Đổi mới sáng tạo, Luật Hỗ trợ DNNVV (Điều 18), Nghị định 38/2018/NĐ-CP; xác định HĐND tỉnh hoàn toàn có thẩm quyền ban hành Nghị quyết chính sách đặc thù trích ngân sách địa phương tham gia thành lập Quỹ đầu tư khởi nghiệp sáng tạo.',
      status: 'Đã nhận số liệu',
      sampleCount: '1 Văn bản thẩm định pháp lý',
      updatedDate: '2026-11-10',
      files: [{ name: 'TTr DA Thanh lap Quy dau tu mao hiem.signed.pdf', size: 450000 }],
      note: 'Khẳng định cơ sở pháp lý vững chắc cho Tờ trình và Dự thảo Nghị quyết trình HĐND tỉnh khóa XII.',
    },
  ]
  glSurveys.forEach((s) => push('gl_surveys', s, 'u7'))

  /* ---- Card 03: Soạn thảo & Biên tập Đề án (gl_drafts) ---- */
  // Thống kê: Bản thảo: 1 | Đang phản biện: 2 | Bản hoàn thiện: 3
  const glDrafts = [
    {
      versionCode: 'DC-CT-01',
      docTitle: 'Đề cương nội dung chi tiết – Đề án thành lập Quỹ Đầu tư Mạo hiểm tỉnh Gia Lai',
      leadAuthor: 'u1',
      docType: 'Đề cương chi tiết',
      status: 'Bản hoàn thiện',
      updatedAt: '2026-11-08',
      docUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
      files: [{ name: 'Đề cương nội dung - Đề án thành lập Quỹ _ Gia Lai.docx', size: 160000 }, { name: 'Đề cương nội dung - Đề án thành lập Quỹ _ Gia Lai.pdf', size: 280000 }],
      reviewFeedback: 'Đã tiếp thu toàn bộ góp ý của Sở KH&CN và Thường trực Tổ chuyên viên. Khung 3 phần chuẩn hóa.',
    },
    {
      versionCode: 'DA-GL-v1.0',
      docTitle: 'Dự thảo Đề án thành lập Quỹ Đầu tư Mạo hiểm tỉnh Gia Lai (Phiên bản v1.0 tích hợp)',
      leadAuthor: 'u1',
      docType: 'Dự thảo Đề án',
      status: 'Bản thảo',
      updatedAt: '2026-11-13',
      docUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
      files: [{ name: 'DeAn_QuyDTMH_GiaLai_PhanNhung.docx', size: 420000 }],
      reviewFeedback: 'Đã ghép các phần của ThS. Nhung, ThS. Quyên, ThS. Vi. Đang rà soát số liệu Bảng X vốn đầu tư.',
    },
    {
      versionCode: 'REF-HCM-v6.3',
      docTitle: 'Dự thảo Đề án Thành lập Quỹ Đầu tư Mạo hiểm TP.HCM (Phiên bản v6.3 chuẩn)',
      leadAuthor: 'u2',
      docType: 'Dự thảo Đề án',
      status: 'Bản hoàn thiện',
      updatedAt: '2026-10-30',
      docUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
      files: [{ name: '02. Du thao DA Thanh lap Quy dau tu mao hiem TPHCM - v6.3.signed.pdf', size: 1200000 }],
      reviewFeedback: 'Tài liệu tham chiếu chuẩn mô hình quỹ đầu tiên tại Việt Nam để tùy biến phù hợp với địa phương.',
    },
    {
      versionCode: 'TT-RG-01',
      docTitle: 'Bản tóm tắt rút gọn Đề án phục vụ báo cáo Thường trực UBND tỉnh và Tỉnh ủy',
      leadAuthor: 'u2',
      docType: 'Bản tóm tắt rút gọn',
      status: 'Đang phản biện',
      updatedAt: '2026-11-12',
      docUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
      files: [{ name: 'Đề xuất cung cấp dữ liệu_bản rút gọn.docx', size: 180000 }, { name: 'Đề xuất cung cấp dữ liệu_bản rút gọn.pdf', size: 310000 }],
      reviewFeedback: 'Gồm 8 trang infographic và bảng tổng hợp cơ chế vốn mồi, dự kiến trình lãnh đạo tỉnh xem trước.',
    },
    {
      versionCode: 'PUB-UEH-STD',
      docTitle: 'Thuyết minh Đề án & Tài liệu trình ký định dạng chuẩn nhận diện thương hiệu UEH',
      leadAuthor: 'u7',
      docType: 'Định dạng chuẩn UEH',
      status: 'Bản hoàn thiện',
      updatedAt: '2026-11-14',
      docUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
      files: [{ name: 'Đề xuất cung cấp dữ liệu_bản rút gọn_định dạng UEH.docx', size: 240000 }, { name: 'Đề xuất cung cấp dữ liệu_bản rút gọn_định dạng UEH.pdf', size: 480000 }],
      reviewFeedback: 'Ấn phẩm thiết kế chuẩn UEH với dải băng nhận diện, ornament và typography hành chính trang trọng.',
    },
    {
      versionCode: 'NQ-HDND-DFT',
      docTitle: 'Dự thảo Nghị quyết HĐND tỉnh về chính sách phát triển Quỹ ĐTMH tỉnh Gia Lai',
      leadAuthor: 'u1',
      docType: 'Dự thảo Tờ trình & Nghị quyết',
      status: 'Đang phản biện',
      updatedAt: '2026-11-11',
      docUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
      files: [{ name: 'TTr DA Thanh lap Quy dau tu mao hiem TPHCM.signed.signed.signed.pdf', size: 680000 }],
      reviewFeedback: 'Đang lấy ý kiến pháp lý từ Sở Tư pháp tỉnh Gia Lai về thẩm quyền ban hành chính sách đặc thù.',
    },
  ]
  glDrafts.forEach((d) => push('gl_drafts', d, d.leadAuthor))

  /* ---- Card 04: Lịch làm việc & Hội thảo Thống nhất (gl_meetings) ---- */
  // Thống kê: Sắp diễn ra: 2 | Đã hoàn thành: 1 | Có biên bản họp: 2
  const glMeetings = [
    {
      meetingTitle: 'Buổi làm việc & Trao đổi kỹ thuật với Tổ chuyên viên Sở KH&CN Gia Lai và HCM VIF',
      meetingDate: '2026-11-12T10:30',
      location: 'SIHUB TP.HCM (123 Trương Định, Q.3)',
      participants: 'Lãnh đạo Sở KH&CN Gia Lai (bà Lê Uyên Chi), Đại diện HCM VIF, Nhóm tư vấn UEH (TS. Anh, ThS. Nhung)',
      status: 'Có biên bản họp',
      minutesFile: [{ name: 'Trao_doi_DeAn_QuyDTMH_GiaLai_12112026_UEH.docx', size: 85000 }],
      outcomes: 'Thống nhất 12 câu hỏi trọng tâm về mô hình quản lý, chi phí vận hành và cơ chế thu hút cổ đông tư nhân.',
    },
    {
      meetingTitle: 'Họp trực tuyến với Sở Tài chính Gia Lai về phương án vốn điều lệ và cơ chế vốn mồi',
      meetingDate: '2026-11-09T14:00',
      location: 'Online qua Zoom / Google Meet',
      participants: 'Đại diện Sở Tài chính Gia Lai, Phòng QLNS, Nhóm tài chính UEH (ThS. Hoàng Thị Phương Anh, ThS. Nhung)',
      status: 'Có biên bản họp',
      minutesFile: [{ name: 'CV de xuat noi dung phuc dap So Tai chinh - dieu chinh signed.pdf', size: 380000 }],
      outcomes: 'Đồng thuận phương án NSNN góp 30% làm vốn mồi, 70% từ khối tư nhân; cơ chế quản lý vốn theo Luật Doanh nghiệp.',
    },
    {
      meetingTitle: 'Đoàn chuyên gia UEH làm việc trực tiếp tại UBND Tỉnh Gia Lai & Sở KH&CN',
      meetingDate: '2026-11-21T08:30',
      location: 'Trụ sở UBND Tỉnh Gia Lai (TP. Pleiku)',
      participants: 'Thường trực UBND tỉnh, Giám đốc Sở KH&CN, Sở Tài chính, Sở Kế hoạch & Đầu tư, Đoàn chuyên gia UEH',
      status: 'Sắp diễn ra',
      minutesFile: [],
      outcomes: 'Báo cáo tiến độ hoàn thiện Đề án, thông qua đề xuất vốn mồi và xin ý kiến định hướng trước khi trình HĐND.',
    },
    {
      meetingTitle: 'Hội thảo tham vấn chuyên gia & Hiệp hội Doanh nghiệp trẻ tỉnh Gia Lai',
      meetingDate: '2026-11-28T09:00',
      location: 'Hội trường Khách sạn HAGL Pleiku',
      participants: 'Đoàn tư vấn UEH, Hội Doanh nhân trẻ Gia Lai, 40 doanh nghiệp và HTX tiêu biểu trên địa bàn',
      status: 'Sắp diễn ra',
      minutesFile: [],
      outcomes: 'Khảo sát khẩu vị rủi ro, cam kết góp vốn của các nhà đầu tư hạt giống A1–A3 và tiếp thu ý kiến hoàn thiện.',
    },
    {
      meetingTitle: 'Tọa đàm chuyên đề: Kinh nghiệm thành lập Quỹ đầu tư mạo hiểm địa phương',
      meetingDate: '2026-10-22T09:00',
      location: 'Hội trường Viện Đổi mới sáng tạo UEH',
      participants: 'Các chuyên gia tài chính UEH, đại diện Sở KH&CN Khánh Hòa & Gia Lai, chuyên gia quỹ quốc tế',
      status: 'Đã hoàn thành',
      minutesFile: [{ name: 'vietnam-innovation-and-private-capital-report-2026.pdf', size: 3400000 }],
      outcomes: 'Tổng kết bài học kinh nghiệm quốc tế (Singapore, Israel) về thu hút dòng vốn tư nhân vào ĐMST.',
    },
  ]
  glMeetings.forEach((m) => push('gl_meetings', m, 'u1'))

  /* ---- Card 05: Đoàn công tác & Khảo sát Địa phương (gl_trips) ---- */
  // Thống kê: Chờ duyệt vé: 1 | Đã đặt: 1 | Quyết toán xong: 1
  const glTrips = [
    {
      tripName: 'Đoàn khảo sát thực địa & Tiếp cận doanh nghiệp tại Pleiku – Đợt 1',
      delegation: 'TS. Tô Công Nguyên Bảo, ThS. Đỗ Thị Quyên, ThS. Trần Tường Vi, CV. Hoàng Gia Huy (4 người)',
      route: 'TP.HCM (SGN) ⇄ Pleiku (PXU)',
      flightDetails: 'Vietnam Airlines: VN 1424 (SGN-PXU) / VN 1425 (PXU-SGN)',
      hotel: 'Khách sạn Hoàng Anh Gia Lai (TP. Pleiku)',
      startDate: '2026-10-18',
      endDate: '2026-10-21',
      cost: 28500000,
      status: 'Quyết toán xong',
      files: [{ name: 'Vé máy bay VNA SGN-PXU khứ hồi - Đoàn 1.pdf', size: 310000 }, { name: 'Hóa đơn khách sạn HAGL Pleiku.pdf', size: 180000 }],
      note: 'Khảo sát 6 nông trường cà phê Chư Prông, HTX dược liệu An Khê và làm việc bước đầu với Sở KH&CN.',
    },
    {
      tripName: 'Đoàn làm việc trực tiếp với Thường trực UBND Tỉnh & Tổ chuyên viên – Đợt 2',
      delegation: 'TS. Tô Công Nguyên Bảo, ThS. Nguyễn Hồng Nhung, ThS. Đỗ Thị Quyên (3 người)',
      route: 'TP.HCM (SGN) ⇄ Pleiku (PXU)',
      flightDetails: 'Vietnam Airlines: VN 1424 (SGN 07:15) / VN 1425 (PXU 10:20)',
      hotel: 'Khách sạn Tre Xanh Pleiku',
      startDate: '2026-11-20',
      endDate: '2026-11-22',
      cost: 26500000,
      status: 'Đã đặt',
      files: [{ name: 'Phiếu đề nghị đặt vé máy bay SGN-PXU Đợt 2.pdf', size: 195000 }, { name: 'Xác nhận booking VNA VN1424.pdf', size: 220000 }],
      note: 'Vé máy bay và khách sạn đã hoàn tất đặt chỗ. Lịch làm việc chính thức tại UBND tỉnh sáng 21/11.',
    },
    {
      tripName: 'Đoàn chuyên gia tham dự Hội thảo tham vấn & Báo cáo nghiệm thu – Đợt 3',
      delegation: 'PGS.TS. Bùi Quang Hùng, TS. Tô Công Nguyên Bảo, ThS. Nguyễn Hồng Nhung, ThS. Trần Tường Vi, ThS. Hoàng Thị Phương Anh (5 người)',
      route: 'TP.HCM (SGN) ⇄ Pleiku (PXU)',
      flightDetails: 'Dự kiến Vietjet Air: VJ 392 / VJ 393 hoặc Vietnam Airlines VN 1424',
      hotel: 'Khách sạn Hoàng Anh Gia Lai',
      startDate: '2026-12-05',
      endDate: '2026-12-08',
      cost: 38000000,
      status: 'Chờ duyệt vé',
      files: [{ name: 'Phiếu trình phê duyệt đợt công tác Hội thảo Pleiku.pdf', size: 160000 }],
      note: 'Đang trình lãnh đạo UEH phê duyệt công lệnh công tác và đề xuất phương án vé máy bay tối ưu.',
    },
  ]
  glTrips.forEach((t) => push('gl_trips', t, 'u5'))

  /* ---- Card 06: Nhóm Chuyên gia & Phân công Biên soạn (gl_experts) ---- */
  // Thống kê: Đúng hạn: 4 | Cần đôn đốc: 1
  const glExperts = [
    {
      fullName: 'TS. Tô Công Nguyên Bảo',
      academicTitle: 'Tiến sĩ Kinh tế',
      role: 'Trưởng nhóm Tư vấn UEH',
      topicAssigned: 'Chủ trì tổng thể Đề án, Tờ trình UBND tỉnh, Thuyết minh Đề án và giải trình Tỉnh ủy',
      deadline: '2026-11-25',
      progress: '85%',
      status: 'Đúng hạn',
      email: 'baotcn@ueh.edu.vn',
      phone: '0903 124 567',
      note: 'Điều phối toàn bộ các nhóm chuyên môn, chịu trách nhiệm chất lượng hồ sơ trình ký.',
    },
    {
      fullName: 'ThS. Nguyễn Hồng Nhung',
      academicTitle: 'Thạc sĩ Tài chính – Ngân hàng',
      role: 'Chuyên gia Tài chính & Quỹ đầu tư',
      topicAssigned: 'Mục tiêu Đề án, Nguồn vốn, Chức năng nhiệm vụ, Cơ chế phân bổ vốn đầu tư mạo hiểm theo ngành',
      deadline: '2026-11-18',
      progress: '90%',
      status: 'Đúng hạn',
      email: 'nhung.nguyen@ueh.demo',
      phone: '0918 345 678',
      note: 'Đã hoàn thiện tài liệu DeAn_QuyDTMH_GiaLai_PhanNhung.docx, đang đối soát Bảng X với nhóm chị Quyên.',
    },
    {
      fullName: 'ThS. Đỗ Thị Quyên',
      academicTitle: 'Thạc sĩ Kinh tế phát triển',
      role: 'Chuyên gia Kinh tế vùng & ĐMST',
      topicAssigned: 'Đánh giá hiện trạng KTXH Gia Lai, Phân tích chỉ số PII 2026, Danh mục dự án nông nghiệp công nghệ cao',
      deadline: '2026-11-15',
      progress: '65%',
      status: 'Cần đôn đốc',
      email: 'quyen.do@ueh.demo',
      phone: '0982 456 789',
      note: 'Cần đẩy nhanh hoàn thiện phân tích bảng số liệu 52 chỉ số PII và dữ liệu GRDP quý 3 để ghép vào bản thảo chung.',
    },
    {
      fullName: 'ThS. Trần Tường Vi',
      academicTitle: 'Thạc sĩ Luật kinh tế',
      role: 'Chuyên gia Pháp lý & Quản trị quỹ',
      topicAssigned: 'Mô hình tổ chức vận hành quỹ (AMC / Quản lý nội bộ), Cơ chế thoái vốn, Quản trị rủi ro & giải thể',
      deadline: '2026-11-20',
      progress: '80%',
      status: 'Đúng hạn',
      email: 'vi.tran@ueh.demo',
      phone: '0973 567 890',
      note: 'Đang hoàn tất dự thảo Điều lệ Quỹ bám sát Nghị định 365/2025/NĐ-CP và Luật Doanh nghiệp 2020.',
    },
    {
      fullName: 'PGS.TS. Bùi Quang Hùng',
      academicTitle: 'Phó Giáo sư, Tiến sĩ',
      role: 'Cố vấn Chiến lược & Phản biện độc lập',
      topicAssigned: 'Phản biện tính khả thi, thẩm định cơ chế vốn mồi và sự đồng bộ với các nghị quyết trung ương',
      deadline: '2026-11-28',
      progress: '70%',
      status: 'Đúng hạn',
      email: 'hung.bui@ueh.demo',
      phone: '0908 678 901',
      note: 'Sẽ chủ trì phản biện trực tiếp tại Hội thảo tham vấn Pleiku vào cuối tháng 11.',
    },
  ]
  glExperts.forEach((e) => push('gl_experts', e, 'u1'))

  /* ---- Card 07: Thư viện Pháp lý & Tham khảo (gl_legal_lib) ---- */
  // Phân chia rõ ràng: 1 là Văn bản pháp lý các cấp (từ lớn trước bé sau: Luật → Nghị định → Nghị quyết HĐND), 2 là Các tài liệu tham khảo khác (Đề án, Báo cáo, Quốc tế)
  const glLegalLib = [
    // --- PHẦN I: VĂN BẢN QUY PHẠM PHÁP LÝ CÁC CẤP (Xếp từ lớn trước bé sau theo hiệu lực pháp lý) ---
    {
      number: 'Luật số 59/2020/QH14',
      docTitle: 'Luật Doanh nghiệp năm 2020 (sửa đổi, bổ sung)',
      docGroup: 'Văn bản pháp lý các cấp',
      legalScope: 'Luật (Quốc hội)',
      issuer: 'Quốc hội',
      yearIssued: '2020',
      keyApplication: 'Quy định quyền và nghĩa vụ của cổ đông sáng lập, quyền biểu quyết của phần vốn nhà nước và chuyển nhượng cổ phần.',
      files: [{ name: 'Luật Doanh nghiệp.pdf', size: 2100000 }],
      note: 'Căn cứ xác lập loại hình doanh nghiệp cho Quỹ và cơ chế ủy quyền đại diện phần vốn nhà nước.',
    },
    {
      number: 'Nghị định 365/2025/NĐ-CP',
      docTitle: 'Nghị định quy định chi tiết về thành lập, tổ chức quản lý và hoạt động của Quỹ đầu tư mạo hiểm',
      docGroup: 'Văn bản pháp lý các cấp',
      legalScope: 'Nghị định (Chính phủ)',
      issuer: 'Chính phủ',
      yearIssued: '2025',
      keyApplication: 'Khung pháp lý cao nhất cho việc thành lập quỹ, cơ chế góp vốn, quản lý danh mục và điều kiện đầu tư.',
      files: [{ name: 'Nghị định 365-2025.pdf', size: 1850000 }],
      note: 'Chương II quy định chi tiết về mô hình công ty cổ phần hoặc công ty TNHH thực hiện chức năng quỹ đầu tư mạo hiểm.',
    },
    {
      number: 'Nghị định 366/2025/NĐ-CP',
      docTitle: 'Nghị định về cơ chế tài chính, ưu đãi thuế và cơ chế bảo toàn vốn nhà nước trong hoạt động ĐMST',
      docGroup: 'Văn bản pháp lý các cấp',
      legalScope: 'Nghị định (Chính phủ)',
      issuer: 'Chính phủ',
      yearIssued: '2025',
      keyApplication: 'Cơ sở quan trọng giải trình với Sở Tài chính về việc chấp nhận rủi ro đầu tư và không coi là làm thất thoát NSNN.',
      files: [{ name: 'Nghị định 366-2025.pdf', size: 1420000 }],
      note: 'Khoản 3 Điều 14: Đánh giá hiệu quả vốn nhà nước trên toàn bộ danh mục đầu tư thay vì từng dự án đơn lẻ.',
    },
    {
      number: 'Nghị quyết 60/NQ-HĐND',
      docTitle: 'Nghị quyết HĐND tỉnh Gia Lai về kế hoạch phát triển KTXH và các cơ chế khuyến khích ĐMST',
      docGroup: 'Văn bản pháp lý các cấp',
      legalScope: 'Nghị quyết HĐND tỉnh',
      issuer: 'HĐND Tỉnh Gia Lai',
      yearIssued: '2024',
      keyApplication: 'Căn cứ thực tiễn địa phương về mục tiêu bố trí nguồn lực ngân sách cho ĐMST giai đoạn 2026–2030.',
      files: [{ name: 'NQ_GiaLai.pdf', size: 780000 }],
      note: 'Nêu rõ định hướng ưu tiên hình thành các thiết chế tài chính hỗ trợ hệ sinh thái khởi nghiệp vùng Tây Nguyên.',
    },

    // --- PHẦN II: CÁC TÀI LIỆU THAM KHẢO KHÁC ---
    {
      number: 'DA-HCM-VIF-v6.3',
      docTitle: 'Đề án Thành lập Quỹ Đầu tư Mạo hiểm TP.HCM (HCM VIF) và dự thảo Điều lệ Quỹ',
      docGroup: 'Tài liệu tham khảo khác',
      legalScope: 'Đề án thực tiễn',
      issuer: 'UBND TP.HCM – Sở KH&CN TP.HCM',
      yearIssued: '2026',
      keyApplication: 'Mô hình thực tiễn đầu tiên của cả nước để Gia Lai học tập kinh nghiệm về điều lệ, hợp đồng góp vốn.',
      files: [{ name: '02. Du thao DA Thanh lap Quy dau tu mao hiem TPHCM - v6.3.signed.pdf', size: 1200000 }],
      note: 'Mô hình quỹ kết hợp vốn nhà nước mồi (30%) và cổ đông tư nhân (70%), đặt trụ sở tại không gian ĐMST SIHUB.',
    },
    {
      number: 'Báo cáo NIC & Do Ventures',
      docTitle: 'Báo cáo Đổi mới sáng tạo và Vốn đầu tư tư nhân Việt Nam giai đoạn 2022–2025',
      docGroup: 'Tài liệu tham khảo khác',
      legalScope: 'Báo cáo nghiên cứu',
      issuer: 'Trung tâm Đổi mới sáng tạo Quốc gia (NIC)',
      yearIssued: '2026',
      keyApplication: 'Cung cấp số liệu vĩ mô về vốn đầu tư mạo hiểm tại Việt Nam (Bảng X trong dự thảo Đề án).',
      files: [{ name: 'vietnam-innovation-and-private-capital-report-2026.pdf', size: 3400000 }],
      note: 'Tỷ trọng vốn đầu tư mạo hiểm vào dịch vụ tài chính 23.4%, y tế 21.1%, nông nghiệp công nghệ cao đang tăng nhanh.',
    },
    {
      number: 'INT-YOZMA-SG',
      docTitle: 'Mô hình Quỹ Khởi nghiệp Israel (Yozma Program) & Quỹ Đầu tư ĐMST Singapore (SEEDS)',
      docGroup: 'Tài liệu tham khảo khác',
      legalScope: 'Kinh nghiệm quốc tế',
      issuer: 'Viện Đổi mới sáng tạo UEH tổng hợp',
      yearIssued: '2025',
      keyApplication: 'Kinh nghiệm quốc tế về cơ chế Matching Fund và quyền mua lại cổ phần ưu đãi cho đối tác tư nhân.',
      files: [{ name: 'Financial development and innovation models.pdf', size: 1650000 }],
      note: 'Bài học đắt giá về việc Nhà nước chấp nhận chịu rủi ro cao hơn để kích hoạt nguồn vốn tư nhân vào công nghệ mới.',
    },
  ]
  glLegalLib.forEach((l) => push('gl_legal_lib', l, 'u2'))

  /* ---- Card 08: Chi phí & Quyết toán Hợp đồng Tư vấn (gl_finance) ---- */
  // Thống kê: Đã chi: 2 | Đang giải ngân: 2 | Chứng từ chờ duyệt: 2
  const glFinance = [
    {
      code: 'TU-01-30%',
      title: 'Tạm ứng Đợt 1 Hợp đồng Tư vấn xây dựng Đề án (30% giá trị hợp đồng)',
      category: 'Tạm ứng hợp đồng',
      amount: 135000000,
      beneficiary: 'Trường Đại học Kinh tế TP. Hồ Chí Minh (UEH)',
      requestDate: '2026-11-02',
      status: 'Đã chi',
      receiptFiles: [{ name: 'Giấy báo có Tạm ứng Đợt 1 Kho bạc Gia Lai.pdf', size: 210000 }],
      note: 'Kho bạc Nhà nước tỉnh Gia Lai đã giải ngân tạm ứng Đợt 1 vào tài khoản UEH theo Hợp đồng số 18/HĐ-SKHCN.',
    },
    {
      code: 'TL-CD-05',
      title: 'Thù lao viết 05 chuyên đề chuyên gia tư vấn UEH (Mục tiêu, Nguồn vốn, PII, Thoái vốn, Thể chế)',
      category: 'Thù lao viết chuyên đề',
      amount: 180000000,
      beneficiary: 'Nhóm chuyên gia tư vấn UEH (5 chuyên gia)',
      requestDate: '2026-11-10',
      status: 'Đang giải ngân',
      receiptFiles: [{ name: 'Bảng kê phân bổ thù lao chuyên gia Đề án Gia Lai.pdf', size: 190000 }],
      note: 'Đang chi trả theo tiến độ giao nộp bản thảo chuyên đề của TS. Anh, ThS. Nhung, ThS. Quyên, ThS. Vi.',
    },
    {
      code: 'CTP-D1-PL',
      title: 'Công tác phí & Di chuyển Đoàn chuyên gia UEH khảo sát thực địa Pleiku Đợt 1 (18–21/10/2026)',
      category: 'Công tác phí khảo sát',
      amount: 28500000,
      beneficiary: 'Đoàn công tác UEH (TS. Anh đại diện)',
      requestDate: '2026-10-24',
      status: 'Đã chi',
      receiptFiles: [{ name: 'Bộ chứng từ quyết toán vé máy bay & khách sạn Pleiku Đ1.pdf', size: 580000 }],
      note: 'Đã thanh quyết toán đầy đủ hóa đơn vé máy bay Vietnam Airlines và hóa đơn khách sạn Hoàng Anh Gia Lai.',
    },
    {
      code: 'CTP-D2-PL',
      title: 'Dự toán công tác phí Đoàn chuyên gia làm việc tại UBND Tỉnh Gia Lai Đợt 2 (20–22/11/2026)',
      category: 'Công tác phí khảo sát',
      amount: 26500000,
      beneficiary: 'Đoàn chuyên gia UEH (3 người)',
      requestDate: '2026-11-14',
      status: 'Chứng từ chờ duyệt',
      receiptFiles: [{ name: 'Dự toán chi tiết đoàn công tác Pleiku Đợt 2.pdf', size: 145000 }],
      note: 'Gồm vé máy bay khứ hồi SGN-PXU (3 người), 2 đêm khách sạn Tre Xanh, xe đưa đón và phụ cấp lưu trú.',
    },
    {
      code: 'KS-PII-120',
      title: 'Chi phí điều tra khảo sát 120 DN/HTX, in ấn biểu mẫu và phân tích dữ liệu PII Gia Lai',
      category: 'Khảo sát số liệu PII',
      amount: 35000000,
      beneficiary: 'Tổ khảo sát & điều tra thực địa',
      requestDate: '2026-11-11',
      status: 'Chứng từ chờ duyệt',
      receiptFiles: [{ name: 'Hợp đồng cộng tác viên khảo sát số liệu PII.pdf', size: 230000 }],
      note: 'Thù lao phát phiếu khảo sát và nhập liệu làm sạch dữ liệu 120 phiếu điều tra doanh nghiệp trên địa bàn.',
    },
    {
      code: 'NT-D2-40%',
      title: 'Kinh phí Nghiệm thu Đề án và Quyết toán Đợt 2 Hợp đồng (Phần kinh phí còn lại)',
      category: 'Nghiệm thu thanh lý',
      amount: 135000000,
      beneficiary: 'Trường Đại học Kinh tế TP. Hồ Chí Minh (UEH)',
      requestDate: '2026-12-15',
      status: 'Đang giải ngân',
      receiptFiles: [],
      note: 'Sở KH&CN tỉnh Gia Lai sẽ thanh toán sau khi hoàn tất nghiệm thu chính thức và bàn giao hồ sơ Tờ trình.',
    },
  ]
  glFinance.forEach((f) => push('gl_finance', f, 'u3'))

  return out
}

/* ================= DỮ LIỆU BÀN LÀM VIỆC DỰ ÁN TUYỂN SINH K53 (CHIẾN DỊCH TUYỂN SINH) ================= */
export function buildAdmissionsItems(pid = 'p2') {
  const out = []
  let n = 0
  const push = (module, data, by = 'u1') =>
    out.push({
      id: `i_ts_${module}_${++n}`,
      projectId: pid,
      module,
      createdBy: by,
      updatedBy: by,
      createdAt: new Date(Date.now() - n * 36e5).toISOString(),
      updatedAt: new Date(Date.now() - n * 18e5).toISOString(),
      ...data,
    })

  // 1. Đề án & tài liệu tuyển sinh (docs)
  ;[
    ['Đề án Tuyển sinh Cử nhân Quốc tế Song bằng UEH – Rennes (Khóa K53)', 'Đề án', '01/ĐA-TS-K53', addDays(-30), 'Hội đồng Tuyển sinh UEH', 'Đã ký', addDays(335), 'u1', [
      { id: 'dc_ts_1', authorId: 'u2', authorName: 'ThS. Nguyễn Văn Thiện Tâm', authorRole: 'Nhân sự chính', text: 'Chỉ tiêu tuyển sinh 80 sinh viên cho chuyên ngành Tài chính - Ngân hàng song bằng.', createdAt: new Date(Date.now() - 25 * 864e5).toISOString(), resolved: true }
    ]],
    ['Thông báo Tuyển sinh & Xét tuyển thẳng Khóa K53 – Chương trình Song bằng', 'Thông báo', '18/TB-ISB-2026', addDays(-22), 'Ban Tuyển sinh UEH – ISB', 'Đã ký', addDays(180), 'u1', []],
    ['Quyết định thành lập Hội đồng Tuyển sinh và Ban Tư vấn chuyên môn K53', 'Quyết định', '2150/QĐ-ĐHKT-TS', addDays(-20), 'Đại học UEH', 'Đã ký', '', 'u1', []],
    ['Quy chế xét tuyển dựa trên chứng chỉ ngoại ngữ quốc tế (IELTS/TOEIC/B2)', 'Quy chế', 'QC-05/ISB-NN', addDays(-18), 'Viện Đào tạo Quốc tế ISB', 'Đã ký', addDays(365), 'u2', []],
    ['Kế hoạch tổ chức Ngày hội Thông tin Tuyển sinh Open Day K53 – Campus B', 'Kế hoạch', 'KH-OD-2026', addDays(-15), 'Ban Truyền thông & Tuyển sinh', 'Đang trình ký', '', 'u7', []],
    ['Tờ trình phê duyệt hạn mức Học bổng Tài năng & Khuyến khích học tập K53', 'Tờ trình', '142/TTr-KTC-TS', addDays(-12), 'Ban Giám hiệu UEH', 'Đang trình ký', '', 'u1', []],
    ['Hợp đồng dịch vụ quảng bá truyền thông số đa kênh tuyển sinh (Digital Ads)', 'Hợp đồng', '08/HĐ-MKT-2026', addDays(-10), 'Công ty CP Giải pháp Truyền thông Digicom', 'Đã ký', addDays(60), 'u7', []],
    ['Quy định thu phí xét tuyển, học phí kỳ đầu và chính sách giữ chỗ K53', 'Quy định', 'QĐ-332/KHTC', addDays(-8), 'Ban Tài chính - Kế toán UEH', 'Đã ký', '', 'u3', []],
    ['Biên bản thẩm định tính pháp lý và quy chuẩn văn bằng tú tài quốc tế (IB/A-Level)', 'Biên bản họp', 'BB-03/HĐTS-ISB', addDays(-5), 'Hội đồng Tuyển sinh', 'Đã ký', '', 'u1', []],
    ['Hướng dẫn quy trình nộp hồ sơ trực tuyến và nhập học cho thí sinh trúng tuyển', 'Khác', 'HD-01/TS-ISB', addDays(-3), 'Ban Tuyển sinh UEH', 'Đã ký', '', 'u2', []],
    ['Báo cáo phân tích nguồn tuyển sinh và xu hướng chọn ngành cử nhân quốc tế', 'Khác', 'BC-NGUON-2026', addDays(-1), 'Tổ Phân tích Dữ liệu Tuyển sinh', 'Dự thảo', '', 'u7', []]
  ].forEach(([title, docType, number, date, partner, status, expiry, owner, docComments]) => {
    push('docs', {
      title,
      docType,
      number,
      date,
      partner,
      status,
      expiry,
      owner,
      docComments: docComments || [],
      files: [{ name: `${number.replace(/[\/\\]/g, '_')}.pdf`, size: 285000, type: 'application/pdf', at: new Date().toISOString() }],
      note: 'Hồ sơ tuyển sinh Cử nhân Song bằng Quốc tế Khóa K53'
    }, owner)
  })

  // 2. Hồ sơ thí sinh & nhập học (students)
  ;[
    ['TS53-001', 'Phạm Minh Đức', '2008-01-12', 'Nam', 'duc.pm.k53@st.ueh.edu.vn', '0933 111 222', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đã trúng tuyển', 'Đã đóng', 20000000, 20000000, 'Đã đóng phí giữ chỗ đợt 1', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'THPT Chuyên Lê Hồng Phong TP.HCM. Giải Nhì HSG Toán Tỉnh. Đủ điều kiện xét học bổng 50%'],
    ['TS53-002', 'Lê Thảo My', '2008-06-25', 'Nữ', 'my.lt.k53@st.ueh.edu.vn', '0944 222 333', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đang xét tuyển', 'Chưa đóng', 20000000, 0, 'Chờ đối soát học bạ gốc', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 6.5)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'THPT Chuyên Trần Đại Nghĩa. Nguyện vọng 1 Cử nhân Song bằng Rennes'],
    ['TS53-003', 'Nguyễn Gia Bảo', '2008-03-14', 'Nam', 'bao.ng.k53@st.ueh.edu.vn', '0912 345 678', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đã trúng tuyển', 'Đã đóng', 20000000, 20000000, 'Đã hoàn tất cọc giữ chỗ', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 7.5)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'THPT Nguyễn Thượng Hiền. Điểm TB 3 năm THPT: 9.1'],
    ['TS53-004', 'Trần Hoàng Kim Ngân', '2008-09-08', 'Nữ', 'ngan.thk.k53@st.ueh.edu.vn', '0909 888 777', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đã trúng tuyển', 'Đã đóng', 20000000, 20000000, 'Đã đóng cọc giữ chỗ', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'THPT Gia Định. Đăng ký tham gia chương trình học bổng tài năng UEH'],
    ['TS53-005', 'Vũ Đức Trọng', '2008-11-20', 'Nam', 'trong.vd.k53@st.ueh.edu.vn', '0988 555 444', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đang xét tuyển', 'Chưa đóng', 20000000, 0, 'Hồ sơ đã qua vòng sơ tuyển', '', '', '', 'Chưa cấp', '', 0, 'B1 (IELTS 6.0)', 'Đang học B2', 'Đang hoàn thiện', 'Chưa', 'THPT Bùi Thị Xuân. Dự kiến thi nâng band IELTS 6.5 vào tháng 12'],
    ['TS53-006', 'Đặng Mai Phương', '2008-04-02', 'Nữ', 'phuong.dm.k53@st.ueh.edu.vn', '0977 123 456', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đã trúng tuyển', 'Đã đóng', 20000000, 20000000, 'Đã đóng cọc giữ chỗ', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 8.0)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'Trường Quốc tế Song ngữ Vinschool Central Park. Đạt giải Ba Hùng biện tiếng Anh'],
    ['TS53-007', 'Bùi Hoàng Nam', '2008-08-17', 'Nam', 'nam.bh.k53@st.ueh.edu.vn', '0966 234 567', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đang xét tuyển', 'Chưa đóng', 20000000, 0, 'Chờ bổ sung giấy chứng nhận tốt nghiệp', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 6.5)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'THPT Chuyên Quốc học Huế. Đăng ký xét tuyển sớm diện tài năng'],
    ['TS53-008', 'Hồ Ngọc Bảo Trân', '2008-12-05', 'Nữ', 'tran.hnb.k53@st.ueh.edu.vn', '0938 345 678', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đã trúng tuyển', 'Đã đóng', 20000000, 20000000, 'Đã đóng phí giữ chỗ', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'THPT Chuyên Thoại Ngọc Hầu An Giang. Điểm tổng kết Toán 9.4'],
    ['TS53-009', 'Phan Thanh Tuấn', '2008-02-28', 'Nam', 'tuan.pt.k53@st.ueh.edu.vn', '0918 456 789', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đang xét tuyển', 'Chưa đóng', 20000000, 0, 'Chờ phỏng vấn học bổng', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 7.5)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'THPT Nguyễn Thị Minh Khai. Điểm GPA: 8.9'],
    ['TS53-010', 'Lý Kiều Oanh', '2008-07-19', 'Nữ', 'oanh.lk.k53@st.ueh.edu.vn', '0903 567 890', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đã trúng tuyển', 'Đã đóng', 20000000, 20000000, 'Đã hoàn tất thủ tục nhập học', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'British International School (BIS TP.HCM). Bằng tú tài quốc tế IB 36 điểm'],
    ['TS53-011', 'Đỗ Tuấn Kiệt', '2008-05-30', 'Nam', 'kiet.dt.k53@st.ueh.edu.vn', '0922 678 901', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đang xét tuyển', 'Chưa đóng', 20000000, 0, 'Chờ bổ sung công chứng học bạ', '', '', '', 'Chưa cấp', '', 0, 'B1 (IELTS 6.0)', 'Đang học B2', 'Đang hoàn thiện', 'Chưa', 'THPT Marie Curie TP.HCM. Tham gia CLB Tài chính trẻ'],
    ['TS53-012', 'Nguyễn Thị Thanh Hà', '2008-10-10', 'Nữ', 'ha.ntt.k53@st.ueh.edu.vn', '0934 789 012', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đã trúng tuyển', 'Đã đóng', 20000000, 20000000, 'Đã hoàn thành học phí đợt 1', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 7.0)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'THPT Chuyên Tiền Giang. Đạt học bổng Khuyến khích UEH 25%'],
    ['TS53-013', 'Hoàng Minh Triết', '2008-03-22', 'Nam', 'triet.hm.k53@st.ueh.edu.vn', '0945 890 123', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đang xét tuyển', 'Chưa đóng', 20000000, 0, 'Hồ sơ nộp trực tuyến cần xác thực', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 6.5)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'THPT Nguyễn Du TP.HCM. Điểm xét tuyển tổ hợp D01: 27.5'],
    ['TS53-014', 'Cao Thục Quyên', '2008-09-15', 'Nữ', 'quyen.ct.k53@st.ueh.edu.vn', '0967 901 234', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đã trúng tuyển', 'Đã đóng', 20000000, 20000000, 'Đã nộp cọc giữ chỗ', '', '', '', 'Chưa cấp', '', 0, 'B2 (IELTS 7.5)', 'Đạt chuẩn', 'Đã nộp', 'Chưa', 'THPT Chuyên Bến Tre. Giải Ba Tin học trẻ cấp tỉnh'],
    ['TS53-015', 'Võ Nhật Anh', '2008-08-01', 'Nam', 'anh.vn.k53@st.ueh.edu.vn', '0989 012 345', 'ISB-K53-01', 'K53', 'Năm 1', 'Có', 'Đang xét tuyển', 'Chưa đóng', 20000000, 0, 'Chờ nộp lệ phí xét tuyển', '', '', '', 'Chưa cấp', '', 0, 'B1 (IELTS 6.0)', 'Đang học B2', 'Đang hoàn thiện', 'Chưa', 'THPT Lương Thế Vinh TP.HCM. Đang theo học khóa luyện viết luận kinh doanh']
  ].forEach(([studentId, fullName, dob, gender, email, phone, className, cohort, yearLevel, dualDegree, academicStatus, tuitionStatus, tuitionAmount, tuitionPaid, tuitionNote, rennesId, rennesEmail, lmsAccount, accountStatus, accountDate, credits, englishLevel, b2Status, rennesForm, phase2, note]) => {
    push('students', { studentId, fullName, dob, gender, email, phone, className, cohort, yearLevel, dualDegree, academicStatus, tuitionStatus, tuitionAmount, tuitionPaid, tuitionNote, rennesId, rennesEmail, lmsAccount, accountStatus, accountDate, credits, englishLevel, b2Status, rennesForm, phase2, note })
  })

  // 3. Ngân sách & chi phí MKT (expenses)
  ;[
    [addDays(-30), 'Chi phí in ấn 2.500 cuốn Cẩm nang Tuyển sinh & Brochure Cử nhân Song bằng Rennes 2026', 'Văn phòng phẩm', 38500000, 'Công ty TNHH Thiết kế & In ấn Song Tạo', 'PC-TS-01', 'HD-26MND/00045', addDays(-30), '0315489621', 0, 'Đợt 1', 'TS. Tô Công Nguyên Bảo', [{ text: 'Có hợp đồng / đề nghị thanh toán', done: true }, { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true }, { text: 'Đủ chữ ký người nhận & người lập', done: true }, { text: 'BGH duyệt lệnh chi', done: true }]],
    [addDays(-25), 'Ngân sách chiến dịch quảng cáo đa kênh Facebook & Google Ads đợt 1 tuyển sinh K53', 'Khác', 65000000, 'Công ty CP Công nghệ Truyền thông Digicom', 'PC-TS-02', 'HD-DIGI/00192', addDays(-25), '0316789452', 0, 'Đợt 1', 'TS. Tô Công Nguyên Bảo', [{ text: 'Có hợp đồng / đề nghị thanh toán', done: true }, { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true }, { text: 'Đủ chữ ký người nhận & người lập', done: true }, { text: 'BGH duyệt lệnh chi', done: true }]],
    [addDays(-18), 'Chi phí tổ chức Ngày hội Thông tin Tuyển sinh quốc tế Open Day 2026 tại UEH Campus B', 'Ăn uống, tiếp khách', 42000000, 'Trung tâm Hỗ trợ Sinh viên & Sự kiện UEH', 'PC-TS-03', 'HD-TTHT/00561', addDays(-18), '0302998877', 0, 'Đợt 1', 'TS. Tô Công Nguyên Bảo', [{ text: 'Có hợp đồng / đề nghị thanh toán', done: true }, { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true }, { text: 'Đủ chữ ký người nhận & người lập', done: true }, { text: 'BGH duyệt lệnh chi', done: true }]],
    [addDays(-14), 'Thiết kế và thi công gian hàng tư vấn du học tại Ngày hội Hướng nghiệp Tuổi Trẻ 2026', 'Khác', 28000000, 'Công ty TNHH Quảng cáo Mỹ thuật Á Châu', 'PC-TS-04', 'HD-AC/00098', addDays(-14), '0314567891', 0, 'Đợt 1', 'TS. Tô Công Nguyên Bảo', [{ text: 'Có hợp đồng / đề nghị thanh toán', done: true }, { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true }, { text: 'Đủ chữ ký người nhận & người lập', done: true }, { text: 'BGH duyệt lệnh chi', done: true }]],
    [addDays(-10), 'Thù lao trực hotline tư vấn tuyển sinh và hỗ trợ thí sinh trực tiếp đợt 1 (10 chuyên viên)', 'Thù lao giảng viên', 25000000, 'Tổ tư vấn tuyển sinh Khoa Tài chính - ISB', 'PC-TS-05', 'BKK-TS/01', addDays(-10), '0302998877', 2500000, 'Đợt 1', 'TS. Tô Công Nguyên Bảo', [{ text: 'Có hợp đồng / đề nghị thanh toán', done: true }, { text: 'Bảng kê danh sách có ký nhận', done: true }, { text: 'Chứng từ khấu trừ thuế TNCN 10%', done: true }, { text: 'BGH duyệt lệnh chi', done: true }]],
    [addDays(-8), 'Sản xuất video clip phóng sự trải nghiệm sinh viên song bằng và đời sống tại ĐH Rennes', 'Khác', 35000000, 'Công ty TNHH Truyền thông Sáng tạo MediaOne', 'PC-TS-06', 'HD-M1/00034', addDays(-8), '0317896541', 0, 'Đợt 1', 'TS. Tô Công Nguyên Bảo', [{ text: 'Có hợp đồng / đề nghị thanh toán', done: true }, { text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true }, { text: 'Đủ chữ ký người nhận & người lập', done: true }, { text: 'BGH duyệt lệnh chi', done: true }]],
    [addDays(-5), 'Chi phí bưu chính chuyển phát nhanh Thư mời nhập học & quà tặng Chào tân sinh viên K53', 'Đi lại', 6800000, 'Tổng Công ty Bưu điện Việt Nam (VNPost HCM)', 'PC-TS-07', 'HD-VNP/08712', addDays(-5), '0100687267', 0, 'Đợt 1', 'TS. Tô Công Nguyên Bảo', [{ text: 'Hóa đơn VAT hợp lệ, đúng MST', done: true }, { text: 'Bảng kê danh sách gửi thư chuyển phát', done: true }, { text: 'BGH duyệt lệnh chi', done: true }]],
    [addDays(-2), 'Hội đồng phỏng vấn xét học bổng tài năng tuyển sinh chương trình song bằng K53', 'Thù lao giảng viên', 18000000, 'Hội đồng Học bổng UEH – Rennes', 'PC-TS-08', 'BKK-TS/02', addDays(-2), '0302998877', 1800000, 'Đợt 1', 'TS. Tô Công Nguyên Bảo', [{ text: 'Biên bản chấm phỏng vấn học bổng', done: true }, { text: 'Bảng kê chi thù lao hội đồng', done: true }, { text: 'Chứng từ khấu trừ thuế TNCN', done: true }]]
  ].forEach(([date, item, category, amount, payee, voucher, invoiceNo, invoiceDate, vendorTax, pitWithheld, settleBatch, approvedBy, checks]) => {
    push('expenses', { date, item, category, amount, payee, voucher, invoiceNo, invoiceDate, vendorTax, pitWithheld, settleBatch, approvedBy, checks, status: 'Đã chi' })
  })

  // 4. Hộp thư tư vấn & Hotline (tickets)
  ;[
    ['Tư vấn điều kiện xét tuyển thẳng bằng chứng chỉ IELTS 6.5 và học bạ THPT', 'Phụ huynh Nguyễn Văn Hùng', 'hung.nv.parent@gmail.com', addDays(-1), 'Học vụ', 'Đã giải quyết', 'u7', addDays(0), 'Kính gửi Ban Tuyển sinh, con tôi có chứng chỉ IELTS 6.5 và điểm trung bình 3 năm THPT đạt 8.8, cháu có được xét tuyển thẳng vào ngành Tài chính song bằng Rennes không và cần bổ sung hồ sơ gì?', []],
    ['Hỏi về chính sách học bổng 50% học phí và điều kiện duy trì học bổng các năm', 'Thí sinh Đặng Mai Phương', 'phuong.dm.k53@gmail.com', addDays(-2), 'Học phí', 'Đang xử lý', 'u7', addDays(1), 'Em chào Thầy/Cô, em đạt IELTS 8.0 và có giải Ba HSG Tỉnh môn Toán, cho em hỏi thủ tục đăng ký xét học bổng 50% học phí kỳ 1 và tiêu chí duy trì học bổng cho các học kỳ sau như thế nào ạ?', []],
    ['Thắc mắc về giai đoạn 2 chuyển tiếp sang ĐH Rennes: điều kiện visa và sinh hoạt phí', 'Phụ huynh Trần Thu Hà', 'ha.tt.parent@yahoo.com', addDays(-3), 'Du học / visa', 'Đã giải quyết', 'u2', addDays(-1), 'Tôi muốn hỏi rõ giai đoạn năm thứ 3 và 4 khi các cháu sang Pháp học thì chi phí ăn ở, ký túc xá tại Rennes khoảng bao nhiêu một tháng và trường có hỗ trợ xin visa du học Pháp không?', []],
    ['Quy đổi điểm tốt nghiệp tú tài quốc tế IB sang thang điểm xét tuyển của UEH', 'Thí sinh Lý Kiều Oanh', 'oanh.lk@gmail.com', addDays(-3), 'Khảo thí', 'Đã giải quyết', 'u2', addDays(-2), 'Dạ em tốt nghiệp trường quốc tế có bằng IB Diploma 36 điểm. Em muốn hỏi hồ sơ cần công chứng dịch thuật những giấy tờ gì và thời hạn nộp bằng chính thức là khi nào?', []],
    ['Thời hạn đóng tiền cọc giữ chỗ và chính sách hoàn phí nếu không nhập học', 'Phụ huynh Lê Quang Khải', 'khai.lq@gmail.com', addDays(-4), 'Học phí', 'Đang xử lý', 'u3', addDays(1), 'Cho tôi hỏi hạn cuối nộp phí cọc giữ chỗ 20 triệu đồng cho đợt 1 là ngày nào? Nếu thí sinh có lý do đột xuất không thể theo học thì có được hoàn trả hoặc chuyển nhượng phí không?', []],
    ['Đăng ký tham quan thực tế cơ sở học tập (Campus Tour) và lớp học trải nghiệm', 'Thí sinh Nguyễn Hoàng Long', 'long.nh.2008@gmail.com', addDays(-5), 'Khác', 'Đã giải quyết', 'u6', addDays(-3), 'Em muốn đăng ký tham quan cơ sở B Nguyễn Tri Phương và muốn nghe giảng thử 1 buổi chuyên đề của Giáo sư Pháp thì đăng ký qua đường link nào ạ?', []],
    ['Xác nhận học phí €900/năm chuyển cho Đại học Rennes đã gồm bảo hiểm y tế chưa?', 'Phụ huynh Phạm Đình Trọng', 'trong.pd@gmail.com', addDays(-6), 'Học phí', 'Đã giải quyết', 'u3', addDays(-4), 'Kính gửi Ban Điều phối, theo thông báo mức học phí đóng cho đối tác Rennes là €900/năm, mức phí này đã bao gồm bảo hiểm y tế sinh viên và phí bản quyền thư viện điện tử chưa?', []],
    ['Hướng dẫn bổ sung bản sao chứng chỉ ngoại ngữ công chứng trực tuyến', 'Thí sinh Vũ Đức Trọng', 'trong.vd@gmail.com', addDays(-7), 'Học vụ', 'Đã giải quyết', 'u7', addDays(-5), 'Em đã nộp bản scan IELTS qua website tuyển sinh, khi nào trường yêu cầu đối chiếu bản gốc hoặc bản công chứng ạ?', []]
  ].forEach(([subject, fromName, fromEmail, receivedAt, topic, status, handler, due, body, files]) => {
    push('tickets', { subject, fromName, fromEmail, receivedAt, topic, status, handler, due, body, files })
  })

  return out
}