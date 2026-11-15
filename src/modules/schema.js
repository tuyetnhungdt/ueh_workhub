// Phân hệ "Bàn làm việc": mỗi phân hệ là một bảng dữ liệu nghiệp vụ gắn với hạng mục.
// Kiểu trường: text | long | date | time | datetime | number | money | select | user | file | email | phone

const S = (...o) => o

/* Quy định từ MOA UEH – Rennes (Phụ lục 1, 2 & Thỏa thuận điều chỉnh 03/2026) */
export const MOA = { rateEur: 104, hoursPerCourse: 36, daysPerCourse: 6, perDiemEur: 120, perDiemDays: 7, tgvMaxEur: 150, feePerStudentEur: 900, taxRate: 20, fx: 28000, passMark20: 10 }
export const RENNES_COURSES = [
  ['Tiền tệ, Ngân hàng và Thị trường tài chính', 'Năm 2', 'S3', 3],
  ['Kinh tế vĩ mô', 'Năm 2', 'S3', 3],
  ['Tài chính quốc tế', 'Năm 2', 'S4', 3],
  ['Sản phẩm phái sinh', 'Năm 3', 'S5', 3],
  ['Kinh tế lượng chuỗi thời gian', 'Năm 3', 'S5', 3],
  ['Kinh tế lượng tài chính và Mô hình hóa tài chính', 'Năm 3', 'S6', 3],
  ['Kinh tế lượng dữ liệu bảng', 'Năm 3', 'S6', 3],
  ['Thực tập và tốt nghiệp', 'Năm 4', 'S7', 10],
]
const COURSE_NAMES = RENNES_COURSES.map((c) => c[0])
const eur = (n) => Math.round((+n || 0) * 100) / 100
/* Chi phí 1 đợt giảng của GV Rennes theo MOA */
export const tripCalc = (r) => {
  const hours = +r.teachHours || 0, rate = +r.rateEur || 0, tax = (+r.taxRate || 0) / 100
  const net = hours * rate
  const gross = tax < 1 ? net / (1 - tax) : net
  const perDiem = (+r.perDiemDays || 0) * (+r.perDiemRate || 0)
  const eurTotal = gross + perDiem + (+r.tgvEur || 0)
  const fx = +r.fx || 0
  return { net: eur(net), gross: eur(gross), taxAmt: eur(gross - net), perDiem: eur(perDiem), eurTotal: eur(eurTotal), vnd: Math.round(eurTotal * fx + (+r.ticketCost || 0) + (+r.hotelCost || 0) + (+r.otherCost || 0)) }
}
export const STATUS_TONE = {
  // màu cho các giá trị trạng thái phổ biến
  'Đã ký': 'ok', 'Đã gửi': 'ok', 'Đã đóng': 'ok', 'Đã cấp': 'ok', 'Đã kích hoạt': 'ok', 'Đang học': 'ok', 'Đã xác nhận': 'ok', 'Đã dạy': 'ok',
  'Đã giải quyết': 'ok', 'Đã thanh toán': 'ok', 'Đã chi': 'ok', 'Đã quyết toán': 'ok', 'Rennes đã xác nhận': 'ok', 'Đã cấp visa': 'ok', 'Hoàn tất': 'ok', 'Có': 'ok', 'Đã có kết quả': 'ok', 'Đã ký HĐ': 'ok', 'Đạt': 'ok', 'Dưới 10/20': 'danger', 'Chưa có điểm': 'muted', 'Đã gửi điểm': 'ok', 'Chưa gửi điểm': 'warn', 'Chờ góp ý': 'warn', 'Đã gửi phiếu': 'info', 'Chưa đặt': 'warn', 'Đã hoàn ứng': 'ok', 'Không tạm ứng': 'muted', 'Đủ điều kiện': 'ok', 'Chưa đủ điều kiện': 'danger',
  'Dự thảo': 'muted', 'Dự kiến': 'muted', 'Chưa cấp': 'muted', 'Mới': 'info', 'Đề nghị': 'muted', 'Chưa đóng': 'warn', 'Nợ một phần': 'warn', 'Chờ duyệt': 'warn', 'Đang trình ký': 'warn',
  'Đang xử lý': 'info', 'Chờ SV phản hồi': 'warn', 'Đã yêu cầu': 'info', 'Đang làm visa': 'warn', 'Đã tạm ứng': 'info', 'Đã duyệt': 'info', 'Đã chuyển': 'info', 'Đang soạn HĐ': 'warn',
  'Hủy': 'danger', 'Dời lịch': 'warn', 'Bảo lưu': 'warn', 'Thôi học': 'danger', 'Hết hiệu lực': 'danger', 'Quá hạn': 'danger', 'Chưa thanh toán': 'warn', 'Tốt nghiệp': 'ok', 'Miễn giảm': 'info', 'Chờ duyệt song bằng': 'warn',
  // Trạng thái dự án Quỹ ĐTMH Gia Lai
  'Đang phúc đáp': 'warn', 'Chờ ý kiến Sở ngành': 'danger',
  'Đã nhận số liệu': 'ok', 'Cần thu thập thêm': 'warn',
  'Bản thảo': 'muted', 'Đang phản biện': 'warn', 'Bản hoàn thiện': 'ok',
  'Sắp diễn ra': 'warn', 'Đã hoàn thành': 'ok', 'Có biên bản họp': 'ok',
  'Chờ duyệt vé': 'warn', 'Đã đặt': 'info', 'Quyết toán xong': 'ok',
  'Đúng hạn': 'ok', 'Cần đôn đốc': 'danger',
  'Tài liệu TW': 'info', 'Văn bản Tỉnh': 'ok', 'Tài liệu quốc tế': 'warn',
  'Văn bản pháp lý các cấp': 'ok', 'Tài liệu tham khảo khác': 'info',
  'Văn bản pháp lý': 'ok', 'Tài liệu tham khảo': 'info',
  'Luật (Quốc hội)': 'ok', 'Nghị định (Chính phủ)': 'info', 'Nghị quyết HĐND tỉnh': 'warn',
  'Đề án thực tiễn': 'muted', 'Báo cáo nghiên cứu': 'info', 'Kinh nghiệm quốc tế': 'warn',
  'Đang giải ngân': 'info', 'Chứng từ chờ duyệt': 'warn',
}

export function getLegalRank(r) {
  if (!r) return 100
  const group = (r.docGroup || '').toLowerCase()
  const num = (r.number || '').toLowerCase()
  const title = (r.docTitle || '').toLowerCase()
  const scope = (r.legalScope || '').toLowerCase()
  const issuer = (r.issuer || '').toLowerCase()

  // 1. Phân biệt nhóm: Tham khảo khác vs Pháp lý
  const isRef = group.includes('tham khảo') ||
    scope.includes('tham khảo') ||
    scope.includes('quốc tế') ||
    scope.includes('đề án') ||
    scope.includes('báo cáo') ||
    num.startsWith('da-') ||
    num.startsWith('int-') ||
    num.includes('báo cáo') ||
    title.includes('đề án') ||
    title.includes('báo cáo') ||
    title.includes('mô hình')

  if (isRef) {
    return 100 // nhóm tài liệu tham khảo khác
  }

  // 2. Nhóm văn bản pháp lý: sắp xếp từ lớn trước bé sau (thứ bậc hiệu lực)
  if (num.startsWith('hiến pháp') || title.startsWith('hiến pháp')) return 1
  if (num.startsWith('luật') || title.startsWith('luật') || issuer.includes('quốc hội') || scope.includes('luật')) return 2
  if (num.includes('nghị quyết qh') || (num.startsWith('nq') && issuer.includes('quốc hội'))) return 3
  if (num.includes('pháp lệnh')) return 4
  if (num.includes('lệnh') || num.includes('qđ-ctn')) return 5
  if (num.includes('nđ-cp') || num.startsWith('nghị định') || title.startsWith('nghị định') || issuer.includes('chính phủ') || scope.includes('nghị định')) return 6
  if (num.includes('qđ-ttg') || (num.includes('qđ') && issuer.includes('thủ tướng'))) return 7
  if (num.includes('tt-') || num.startsWith('thông tư') || title.startsWith('thông tư') || issuer.includes('bộ ')) return 8
  if (num.includes('nq-hđnd') || num.includes('nq-hdnd') || num.startsWith('nghị quyết') || issuer.includes('hđnd') || issuer.includes('hdnd') || scope.includes('hđnd')) return 9
  if (num.includes('qđ-ubnd') || (num.includes('qđ') && issuer.includes('ubnd')) || issuer.includes('ubnd') || scope.includes('ubnd')) return 10
  return 20
}

export const MODULES = [
  {
    id: 'docs', newOnNoMatch: true, pending: (r) => !['Đã ký', 'Đã gửi', 'Hết hiệu lực'].includes(r.status) || (r.signers || []).some((c) => !c.done), recordWork: true, cat: 'c01', name: 'Văn bản & hồ sơ', icon: 'FileText', item: 'văn bản',
    desc: 'MOA, phụ lục, công văn đi/đến, biên bản họp, quyết định – lưu file gốc, số hiệu, trạng thái.',
    title: 'title', status: 'status', date: 'date',
    fields: [
      { k: 'title', label: 'Tên văn bản', type: 'text', req: true, col: true, w: 240 },
      { k: 'docType', label: 'Loại', type: 'select', options: S('MOA', 'Phụ lục hợp tác', 'Công văn đi', 'Công văn đến', 'Biên bản họp', 'Quyết định', 'Kế hoạch', 'Khác'), col: true },
      { k: 'number', label: 'Số hiệu', type: 'text', col: true },
      { k: 'date', label: 'Ngày ban hành', type: 'date', col: true },
      { k: 'partner', label: 'Đối tác / nơi nhận', type: 'text', col: true },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Dự thảo', 'Chờ góp ý', 'Đang trình ký', 'Đã ký', 'Đã gửi', 'Hết hiệu lực'), col: true },
      { k: 'expiry', label: 'Hiệu lực đến', type: 'date' },
      { k: 'owner', label: 'Người phụ trách', type: 'user', col: true },
      { k: 'signers', label: 'Trình ký / góp ý', type: 'checklist', col: true, ph: 'VD: Thầy Chí ký, GV ký bảng trừ thuế…', defaults: ['Rà soát nội dung & đối chiếu pháp lý', 'Trưởng khoa KHTC rà soát & ký nháy', 'Đại diện BGH UEH ký chính thức', 'Đại diện Đại học Rennes ký'] },
      { k: 'files', label: 'File đính kèm', type: 'file', col: true },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    docs: ['missionOrder', 'flightReq', 'hotelReq', 'payTable'],
  },
  {
    id: 'students', pending: (r, view) => view === 'Tài khoản Rennes' ? !['Đã cấp', 'Đã kích hoạt'].includes(r.accountStatus) : view === 'Học phí' ? ['Chưa đóng', 'Nợ một phần'].includes(r.tuitionStatus) : r.dualDegree === 'Chờ duyệt song bằng' || !r.email || !r.phone, cat: 'c02', name: 'Sinh viên', icon: 'GraduationCap', item: 'sinh viên',
    desc: 'Hồ sơ SV các khóa, đăng ký song bằng, tình trạng học tập, học phí và tài khoản Rennes.',
    title: 'fullName', status: 'academicStatus',
    views: {
      'Hồ sơ': ['studentId', 'fullName', 'dob', 'email', 'phone', 'className', 'cohort', 'yearLevel', 'dualDegree', 'academicStatus'],
      'Học phí': ['studentId', 'fullName', 'className', 'cohort', 'tuitionStatus', 'tuitionAmount', 'tuitionPaid', 'tuitionNote'],
      'Tài khoản Rennes': ['studentId', 'fullName', 'email', 'rennesId', 'rennesEmail', 'lmsAccount', 'accountStatus', 'accountDate'],
      'Xét giai đoạn 2': ['studentId', 'fullName', 'cohort', 'credits', 'englishLevel', 'b2Status', 'rennesForm', 'accountStatus', 'phase2'],
    },
    fields: [
      { k: 'studentId', label: 'MSSV', type: 'text', req: true, w: 110 },
      { k: 'fullName', label: 'Họ và tên', type: 'text', req: true, w: 190 },
      { k: 'dob', label: 'Ngày sinh', type: 'date' },
      { k: 'gender', label: 'Giới tính', type: 'select', options: S('Nữ', 'Nam', 'Khác') },
      { k: 'email', label: 'Email', type: 'email' },
      { k: 'phone', label: 'Số điện thoại', type: 'phone' },
      { k: 'className', label: 'Lớp', type: 'text' },
      { k: 'cohort', label: 'Khóa', type: 'select', options: S('K50–K51', 'K52') },
      { k: 'yearLevel', label: 'Năm học', type: 'select', options: S('Năm 1', 'Năm 2', 'Năm 3', 'Năm 4') },
      { k: 'dualDegree', label: 'Song bằng', type: 'select', options: S('Có', 'Chờ duyệt song bằng', 'Không') },
      { k: 'academicStatus', label: 'Tình trạng học tập', type: 'select', options: S('Đang học', 'Bảo lưu', 'Thôi học', 'Tốt nghiệp') },
      { k: 'tuitionStatus', label: 'Học phí', type: 'select', options: S('Đã đóng', 'Chưa đóng', 'Nợ một phần', 'Miễn giảm') },
      { k: 'tuitionAmount', label: 'Học phí phải đóng', type: 'money' },
      { k: 'tuitionPaid', label: 'Đã đóng', type: 'money' },
      { k: 'tuitionNote', label: 'Ghi chú học phí', type: 'text' },
      { k: 'rennesId', label: 'Mã SV Rennes', type: 'text' },
      { k: 'rennesEmail', label: 'Email Rennes', type: 'email' },
      { k: 'lmsAccount', label: 'Tài khoản LMS', type: 'text' },
      { k: 'accountStatus', label: 'Tài khoản Rennes', type: 'select', options: S('Chưa cấp', 'Đã yêu cầu', 'Đã cấp', 'Đã kích hoạt') },
      { k: 'accountDate', label: 'Ngày cấp TK', type: 'date' },
      { k: 'credits', label: 'Tín chỉ tích lũy', type: 'number' },
      { k: 'englishLevel', label: 'Ngoại ngữ (IELTS/TOEIC/B2…)', type: 'text', ph: 'VD: IELTS 6.0 / B2' },
      { k: 'b2Status', label: 'Chuẩn ngoại ngữ B2', type: 'select', options: S('Đạt B2', 'Chưa đạt', 'Chưa nộp chứng chỉ') },
      { k: 'rennesForm', label: 'Form đăng ký Rennes', type: 'select', options: S('Chưa nộp', 'Đã nộp – chưa đối soát', 'Khớp dữ liệu UEH', 'Sai lệch – cần sửa') },
      { k: 'phase2', label: 'Xét chuyển giai đoạn 2', type: 'select', options: S('Đủ điều kiện', 'Chưa đủ điều kiện', 'Chờ xét') },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    sums: ['tuitionAmount', 'tuitionPaid'],
    groupBy: ['cohort', 'yearLevel', 'tuitionStatus', 'accountStatus', 'dualDegree'],
  },
  {
    id: 'sessions', cat: 'c03', name: 'Kế hoạch & lịch giảng', icon: 'CalendarDays', item: 'buổi học',
    desc: 'Từng buổi học: học phần, giảng viên, ngày giờ, phòng, hình thức. Xem dạng bảng, lịch tháng và timeline học phần.',
    title: 'course', status: 'status', date: 'date', special: 'sessions',
    pending: (r) => ['Dự kiến', 'Dời lịch'].includes(r.status) || r.uehConfirmed === 'Chưa xác nhận' || r.rennesConfirmed === 'Chưa xác nhận',
    fields: [
      { k: 'course', label: 'Học phần', type: 'text', req: true, w: 220 },
      { k: 'courseCode', label: 'Mã HP', type: 'text' },
      { k: 'lecturer', label: 'Giảng viên', type: 'text' },
      { k: 'side', label: 'Bên giảng', type: 'select', options: S('Rennes', 'UEH') },
      { k: 'className', label: 'Lớp / khóa', type: 'text' },
      { k: 'teachingGroup', label: 'Nhóm lớp', type: 'select', options: S('K50–K51', 'K52') },
      { k: 'date', label: 'Ngày', type: 'date', req: true },
      { k: 'start', label: 'Bắt đầu', type: 'time' },
      { k: 'end', label: 'Kết thúc', type: 'time' },
      { k: 'room', label: 'Phòng', type: 'text' },
      { k: 'mode', label: 'Hình thức', type: 'select', options: S('Trực tiếp', 'Online', 'Kết hợp') },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Dự kiến', 'Đã xác nhận', 'Đã dạy', 'Dời lịch', 'Hủy') },
      { k: 'uehConfirmed', label: 'UEH xác nhận', type: 'select', options: S('Đã xác nhận', 'Chưa xác nhận') },
      { k: 'rennesConfirmed', label: 'Rennes xác nhận', type: 'select', options: S('Đã xác nhận', 'Chưa xác nhận') },
      { k: 'scheduleVersion', label: 'Phiên bản', type: 'text' },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    cols: ['date', 'start', 'end', 'course', 'lecturer', 'className', 'teachingGroup', 'room', 'status', 'uehConfirmed', 'rennesConfirmed'],
    sort: (a, b) => (a.date || '').localeCompare(b.date || '') || (a.start || '').localeCompare(b.start || ''),
  },
  {
    id: 'exams', newOnNoMatch: true, pending: (r) => !['Đã có kết quả', 'Hủy'].includes(r.status), recordWork: true, cat: 'c04', name: 'Khảo thí & điểm', icon: 'ClipboardCheck', item: 'kỳ thi',
    desc: 'Lịch thi, phòng thi, cán bộ coi thi, tình trạng nhập điểm/quy đổi điểm, phúc khảo.',
    title: 'course', status: 'status', date: 'date',
    fields: [
      { k: 'course', label: 'Học phần', type: 'text', req: true, w: 220 },
      { k: 'examType', label: 'Loại', type: 'select', options: S('Giữa kỳ', 'Cuối kỳ', 'Thi lại', 'Phúc khảo', 'Quy đổi điểm') },
      { k: 'className', label: 'Lớp / khóa', type: 'text' },
      { k: 'date', label: 'Ngày thi', type: 'date' },
      { k: 'start', label: 'Giờ', type: 'time' },
      { k: 'room', label: 'Phòng', type: 'text' },
      { k: 'proctor', label: 'Cán bộ coi thi', type: 'text' },
      { k: 'count', label: 'Số SV', type: 'number' },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Dự kiến', 'Đã xác nhận', 'Đã thi', 'Đã có kết quả', 'Hủy') },
      { k: 'paperStatus', label: 'Đề thi', type: 'select', options: S('Chưa nhận đề', 'Đã nhận đề từ GV', 'Đã duyệt đề', 'Đã in & niêm phong') },
      { k: 'paperCopies', label: 'Số đề in', type: 'number' },
      { k: 'roomStatus', label: 'Phòng thi', type: 'select', options: S('Chưa đăng ký', 'Đã đăng ký', 'Đã xác nhận') },
      { k: 'grader', label: 'GV chấm (Rennes)', type: 'text' },
      { k: 'scriptsSentAt', label: 'Ngày gửi bài cho Rennes chấm', type: 'date' },
      { k: 'scriptsCount', label: 'Số bài gửi chấm', type: 'number' },
      { k: 'sendMethod', label: 'Hình thức gửi bài', type: 'select', options: S('Scan PDF qua email', 'Nộp trên LMS Rennes', 'Gửi bản giấy (DHL)', 'GV chấm trực tiếp tại UEH') },
      { k: 'gradesReceivedAt', label: 'Ngày nhận bảng điểm (thang 20)', type: 'date' },
      { k: 'councilStatus', label: 'Hội đồng Khảo thí', type: 'select', options: S('Chưa họp', 'Đã duyệt', 'Yêu cầu chấm lại') },
      { k: 'councilDate', label: 'Ngày HĐ Khảo thí duyệt', type: 'date' },
      { k: 'publishedAt', label: 'Ngày công bố điểm', type: 'date' },
      { k: 'steps', label: 'Tiến độ khảo thí', type: 'checklist', defaults: ['Nhận đề thi từ GV', 'Duyệt đề thi', 'In & niêm phong đề', 'Đăng ký phòng thi & phân công coi thi', 'Tổ chức thi', 'Gửi bài thi cho GV Rennes chấm', 'Nhận bảng điểm gốc thang 20', 'Quy đổi thang 10 & HĐ Khảo thí duyệt', 'Công bố điểm cho SV'] },
      { k: 'files', label: 'Bảng điểm / file', type: 'file' },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    cols: ['date', 'start', 'course', 'examType', 'className', 'room', 'paperStatus', 'scriptsSentAt', 'gradesReceivedAt', 'councilStatus', 'status'],
  },
  {
    id: 'lecturers', pending: (r) => r.side === 'Rennes' && (r.contractStatus !== 'Đã ký HĐ' || r.gradesSent === 'Chưa gửi điểm' || (r.docs || []).some((c) => !c.done)), recordWork: true, cat: 'c05', name: 'Giảng viên & hợp đồng', icon: 'Presentation', item: 'giảng viên',
    desc: 'Danh sách GV UEH/Rennes, học phần phụ trách, số giờ kế hoạch/đã dạy, hợp đồng thỉnh giảng.',
    title: 'fullName', status: 'contractStatus',
    fields: [
      { k: 'fullName', label: 'Họ tên', type: 'text', req: true, w: 190 },
      { k: 'side', label: 'Đơn vị', type: 'select', options: S('Rennes', 'UEH') },
      { k: 'academicTitle', label: 'Học hàm/vị', type: 'text' },
      { k: 'email', label: 'Email', type: 'email' },
      { k: 'phone', label: 'Điện thoại', type: 'phone' },
      { k: 'courses', label: 'Học phần phụ trách', type: 'text' },
      { k: 'hoursPlanned', label: 'Giờ kế hoạch', type: 'number' },
      { k: 'hoursDone', label: 'Giờ đã dạy', type: 'number' },
      { k: 'contractNo', label: 'Số HĐ', type: 'text', ph: 'VD: 1150/HĐTG-ĐHKT-TC' },
      { k: 'contractFrom', label: 'HĐ từ ngày', type: 'date' },
      { k: 'contractTo', label: 'HĐ đến ngày', type: 'date' },
      { k: 'contractStatus', label: 'Hợp đồng', type: 'select', options: S('Chưa có', 'Đang soạn HĐ', 'Đang trình ký', 'Đã ký HĐ', 'Đã thanh lý') },
      { k: 'gradesSent', label: 'Bảng điểm', type: 'select', options: S('Chưa gửi điểm', 'Đã gửi điểm', 'Không áp dụng') },
      { k: 'acceptance', label: 'Nghiệm thu giờ giảng', type: 'select', options: S('Chưa nghiệm thu', 'Đã xác nhận số giờ', 'Đã ký biên bản nghiệm thu') },
      { k: 'acceptanceDate', label: 'Ngày nghiệm thu', type: 'date' },
      { k: 'payStatus', label: 'Thanh toán thù lao', type: 'select', options: S('Chưa thanh toán', 'Đã lập đề nghị', 'Đã thanh toán') },
      { k: 'rateEur', label: 'Thù lao/giờ (sau thuế)', type: 'number', cur: 'EUR' },
      { k: 'dob', label: 'Ngày sinh', type: 'date' },
      { k: 'specialization', label: 'Chuyên môn', type: 'text' },
      { k: 'address', label: 'Địa chỉ liên lạc', type: 'text', w: 260 },
      { k: 'passport', label: 'Số hộ chiếu', type: 'text' },
      { k: 'passportIssued', label: 'Ngày cấp / nơi cấp', type: 'text' },
      { k: 'bankAccount', label: 'Số tài khoản (IBAN)', type: 'text' },
      { k: 'bankName', label: 'Ngân hàng / BIC', type: 'text' },
      { k: 'taxCode', label: 'Mã số thuế TNCN', type: 'text' },
      { k: 'cohorts', label: 'Khóa / lớp phụ trách', type: 'text', ph: 'VD: K50–K51, K52' },
      { k: 'diet', label: 'Chế độ ăn', type: 'select', options: S('Không yêu cầu', 'Ăn chay', 'Ăn mặn', 'Không ăn hải sản', 'Không ăn thịt bò', 'Không ăn thịt heo', 'Halal') },
      { k: 'allergies', label: 'Dị ứng', type: 'text', ph: 'VD: đậu phộng, tôm cua' },
      { k: 'fruits', label: 'Trái cây / đồ ăn ưa thích', type: 'text', ph: 'VD: xoài, thanh long; không ăn sầu riêng' },
      { k: 'drinks', label: 'Đồ uống', type: 'text', ph: 'VD: cà phê đen, trà xanh, nước suối' },
      { k: 'hotelPref', label: 'Yêu cầu phòng khách sạn', type: 'text', ph: 'VD: phòng không hút thuốc, tầng cao, gần UEH' },
      { k: 'seatPref', label: 'Ghế máy bay', type: 'select', options: S('Không yêu cầu', 'Cạnh cửa sổ', 'Cạnh lối đi') },
      { k: 'otherPrefs', label: 'Yêu cầu khác', type: 'long', ph: 'VD: cần máy chiếu HDMI, micro không dây; đi lại bằng taxi' },
      { k: 'syllabi', label: 'Syllabus các học phần', type: 'file' },
      { k: 'docs', label: 'Hồ sơ cần có', type: 'checklist', defaults: ['CV / LLKH', 'Bản sao bằng cấp', 'Hộ chiếu', 'HĐ thỉnh giảng đã ký', 'Bảng trừ thuế TNCN 20% đã ký', 'Bảng điểm đã gửi'] },
      { k: 'files', label: 'CV, bằng cấp, HĐ', type: 'file' },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    cols: ['fullName', 'side', 'courses', 'hoursPlanned', 'hoursDone', 'contractNo', 'contractStatus', 'gradesSent', 'docs', 'files'],
    defaults: { side: 'Rennes', rateEur: MOA.rateEur, contractStatus: 'Chưa có', gradesSent: 'Chưa gửi điểm' },
    docs: ['contractInfo', 'lecturerSheet'],
    sums: ['hoursPlanned', 'hoursDone'],
  },
  {
    id: 'trips', pending: (r) => !['Hoàn tất', 'Hủy'].includes(r.status) || r.payStatus !== 'Đã thanh toán' || (r.steps || []).some((c) => !c.done), recordWork: true, cat: 'c06', name: 'Đoàn công tác GV Rennes', icon: 'Plane', item: 'chuyến công tác',
    desc: 'Mỗi đợt giảng của GV Rennes: vé, khách sạn, visa, đón tiễn và chi phí tự tính theo MOA (104€/giờ sau thuế, phụ cấp 120€/ngày, TGV ≤150€).',
    title: 'lecturer', status: 'status', date: 'arriveAt', special: 'trips',
    fields: [
      { k: 'lecturer', label: 'Giảng viên', type: 'text', req: true, w: 180 },
      { k: 'course', label: 'Học phần giảng', type: 'select', options: COURSE_NAMES },
      { k: 'className', label: 'Lớp', type: 'text' },
      { k: 'teachFrom', label: 'Giảng từ ngày', type: 'date' },
      { k: 'teachTo', label: 'đến ngày', type: 'date' },
      { k: 'teachHours', label: 'Số giờ giảng', type: 'number' },
      { k: 'contractNo', label: 'Căn cứ HĐ số', type: 'text' },
      { k: 'outFlight', label: 'Chuyến bay đến', type: 'text', ph: 'VD: AF 258 · CDG → SGN' },
      { k: 'departAt', label: 'Khởi hành', type: 'datetime' },
      { k: 'arriveAt', label: 'Đến SGN', type: 'datetime' },
      { k: 'returnFlight', label: 'Chuyến bay về', type: 'text', ph: 'VD: AF 257 · SGN → CDG' },
      { k: 'returnAt', label: 'Giờ bay về', type: 'datetime' },
      { k: 'hotel', label: 'Khách sạn', type: 'text' },
      { k: 'bookingCode', label: 'Mã phiếu đặt phòng', type: 'text', ph: 'VD: BK4744' },
      { k: 'hotelStatus', label: 'Đặt phòng', type: 'select', options: S('Chưa đặt', 'Đã gửi phiếu', 'Đã duyệt', 'Đã xác nhận') },
      { k: 'checkIn', label: 'Nhận phòng', type: 'date' },
      { k: 'checkOut', label: 'Trả phòng', type: 'date' },
      { k: 'visa', label: 'Visa', type: 'select', options: S('Không cần', 'Đang làm visa', 'Đã cấp visa') },
      { k: 'pickup', label: 'Đón tiễn', type: 'text', ph: 'Xe, tài xế, SĐT' },
      { k: 'rateEur', label: 'Thù lao/giờ (sau thuế)', type: 'number', cur: 'EUR' },
      { k: 'taxRate', label: 'Thuế TNCN (%)', type: 'number' },
      { k: 'perDiemDays', label: 'Số ngày phụ cấp', type: 'number' },
      { k: 'perDiemRate', label: 'Phụ cấp/ngày', type: 'number', cur: 'EUR' },
      { k: 'tgvEur', label: 'TGV Rennes–CDG (≤ €150)', type: 'number', cur: 'EUR' },
      { k: 'fx', label: 'Tỷ giá', type: 'number', cur: 'VND/EUR' },
      { k: 'ticketCost', label: 'Vé máy bay', type: 'money' },
      { k: 'hotelCost', label: 'Khách sạn', type: 'money' },
      { k: 'otherCost', label: 'Chi phí khác', type: 'money' },
      { k: 'advanceBy', label: 'Người tạm ứng', type: 'user' },
      { k: 'advanceEur', label: 'Số tiền tạm ứng', type: 'number', cur: 'EUR' },
      { k: 'advanceStatus', label: 'Tạm ứng', type: 'select', options: S('Không tạm ứng', 'Đã tạm ứng', 'Đã hoàn ứng') },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Dự kiến', 'Đã xác nhận', 'Đang công tác', 'Hoàn tất', 'Hủy') },
      { k: 'payStatus', label: 'Thanh toán', type: 'select', options: S('Chưa thanh toán', 'Đã tạm ứng', 'Đã thanh toán') },
      { k: 'steps', label: 'Việc cần làm cho chuyến', type: 'checklist', defaults: ['HĐ thỉnh giảng đã ký', 'Thư mời / hồ sơ visa', 'Đặt vé máy bay', 'Phiếu đặt phòng được duyệt', 'Gửi thông tin chuyến cho GV', 'Đặt xe đón tiễn', 'GV ký bảng trừ thuế 20%', 'Lập đề nghị thanh toán', 'Hoàn ứng / hoàn quỹ Khoa'] },
      { k: 'files', label: 'Vé, booking, thư mời', type: 'file' },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    cols: ['lecturer', 'course', 'teachFrom', 'arriveAt', 'hotelStatus', 'visa', 'steps', 'eurTotal', 'total', 'status', 'payStatus'],
    sums: ['ticketCost', 'hotelCost', 'otherCost', 'advanceEur'],
    defaults: { teachHours: MOA.hoursPerCourse, rateEur: MOA.rateEur, taxRate: MOA.taxRate, perDiemDays: MOA.perDiemDays, perDiemRate: MOA.perDiemEur, tgvEur: MOA.tgvMaxEur, fx: MOA.fx, hotelStatus: 'Chưa đặt', status: 'Dự kiến', payStatus: 'Chưa thanh toán', advanceStatus: 'Không tạm ứng' },
    computed: {
      feeNet: { label: 'Thù lao thực nhận', type: 'eur', fn: (r) => tripCalc(r).net },
      taxAmt: { label: 'Thuế TNCN (gross-up)', type: 'eur', fn: (r) => tripCalc(r).taxAmt },
      feeGross: { label: 'Thù lao trước thuế', type: 'eur', fn: (r) => tripCalc(r).gross },
      perDiemEur: { label: 'Phụ cấp lưu trú', type: 'eur', fn: (r) => tripCalc(r).perDiem },
      eurTotal: { label: 'Tổng EUR (thù lao + phụ cấp + TGV)', type: 'eur', fn: (r) => tripCalc(r).eurTotal },
      total: { label: 'Tổng chi phí quy VND', type: 'money', fn: (r) => tripCalc(r).vnd },
    },
    docs: ['flightReq', 'hotelReq', 'missionOrder', 'payTable', 'advanceReq', 'tripEmail'],
  },
  {
    id: 'transfers', newOnNoMatch: true, pending: (r) => r.status !== 'Rennes đã xác nhận' || +r.debt > 0, recordWork: true, cat: 'c07', name: 'Học phí chuyển Rennes', icon: 'Coins', item: 'đợt chuyển tiền',
    desc: 'Đối soát số SV, đề nghị chuyển tiền, xác nhận Rennes đã nhận và công nợ theo học kỳ.',
    title: 'term', status: 'status', date: 'requestDate',
    fields: [
      { k: 'term', label: 'Học kỳ / đợt', type: 'text', req: true },
      { k: 'studentCount', label: 'Số SV', type: 'number' },
      { k: 'feePerStudent', label: 'Phí/SV', type: 'number', cur: 'EUR' },
      { k: 'fx', label: 'Tỷ giá', type: 'number', cur: 'VND/EUR' },
      { k: 'requestDate', label: 'Ngày đề nghị', type: 'date' },
      { k: 'transferDate', label: 'Ngày chuyển', type: 'date' },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Đề nghị', 'Đã duyệt', 'Đã chuyển', 'Rennes đã xác nhận') },
      { k: 'debt', label: 'Công nợ còn lại', type: 'number', cur: 'EUR' },
      { k: 'proposalNo', label: 'Số tờ trình', type: 'text', ph: 'VD: 152/TTr-KTC' },
      { k: 'beneficiary', label: 'Đơn vị thụ hưởng', type: 'text', ph: 'Université de Rennes – Faculté des Sciences Économiques' },
      { k: 'swiftRef', label: 'Số lệnh chuyển tiền / SWIFT', type: 'text' },
      { k: 'approvedBy', label: 'Người duyệt (BGH / KHTC)', type: 'text' },
      { k: 'approvedAt', label: 'Ngày duyệt', type: 'date' },
      { k: 'rennesConfirmedAt', label: 'Ngày Rennes xác nhận đã nhận', type: 'date' },
      { k: 'steps', label: 'Quy trình chuyển tiền', type: 'checklist', defaults: ['Đối soát số SV thực tế & mức phí €900/SV', 'Lập tờ trình đề nghị chuyển tiền', 'Dự thảo lệnh chuyển tiền quốc tế', 'BGH / Ban KHTC duyệt', 'Ngân hàng thực hiện chuyển tiền', 'Rennes xác nhận đã nhận & đối soát công nợ'] },
      { k: 'files', label: 'Đề nghị, ủy nhiệm chi', type: 'file' },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    defaults: { feePerStudent: MOA.feePerStudentEur, fx: MOA.fx, status: 'Đề nghị' },
    docs: ['transferProposal'],
    computed: {
      totalEur: { label: 'Tổng phải chuyển', type: 'eur', fn: (r) => (+r.studentCount || 0) * (+r.feePerStudent || 0) },
      totalVnd: { label: 'Quy đổi VND', type: 'money', fn: (r) => Math.round((+r.studentCount || 0) * (+r.feePerStudent || 0) * (+r.fx || MOA.fx)) },
    },
    cols: ['term', 'studentCount', 'feePerStudent', 'totalEur', 'totalVnd', 'proposalNo', 'approvedAt', 'transferDate', 'status', 'steps', 'debt'],
    sums: ['studentCount', 'debt'],
  },
  {
    id: 'expenses', pending: (r) => !['Đã chi', 'Đã quyết toán'].includes(r.status), recordWork: true, cat: 'c08', name: 'Chi phí & quyết toán', icon: 'Calculator', item: 'khoản chi',
    desc: 'Từng khoản chi (thù lao, vé, khách sạn…), chứng từ, trạng thái thanh toán và tổng hợp theo loại.',
    title: 'item', status: 'status', date: 'date',
    fields: [
      { k: 'date', label: 'Ngày', type: 'date' },
      { k: 'item', label: 'Nội dung chi', type: 'text', req: true, w: 240 },
      { k: 'category', label: 'Loại chi', type: 'select', options: S('Thù lao giảng viên', 'Vé máy bay', 'Khách sạn', 'Ăn uống, tiếp khách', 'Đi lại', 'Văn phòng phẩm', 'Khác') },
      { k: 'amount', label: 'Số tiền', type: 'money' },
      { k: 'payee', label: 'Người/đơn vị nhận', type: 'text' },
      { k: 'voucher', label: 'Số chứng từ', type: 'text' },
      { k: 'invoiceNo', label: 'Số hóa đơn VAT', type: 'text' },
      { k: 'invoiceDate', label: 'Ngày hóa đơn', type: 'date' },
      { k: 'vendorTax', label: 'MST bên bán', type: 'text' },
      { k: 'pitWithheld', label: 'Thuế TNCN khấu trừ', type: 'money' },
      { k: 'settleBatch', label: 'Đợt quyết toán', type: 'text', ph: 'VD: Đợt 1 – HP S3' },
      { k: 'approvedBy', label: 'Người duyệt chi', type: 'text' },
      { k: 'checks', label: 'Kiểm tra chứng từ', type: 'checklist', defaults: ['Có hợp đồng / đề nghị thanh toán', 'Hóa đơn VAT hợp lệ, đúng MST', 'Vé máy bay / xác nhận khách sạn kèm boarding pass', 'Biên lai / bảng khấu trừ thuế TNCN (nếu là thù lao)', 'Đủ chữ ký người nhận & người lập', 'BGH duyệt lệnh chi'] },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Đề nghị', 'Đã duyệt', 'Đã chi', 'Đã quyết toán') },
      { k: 'files', label: 'Chứng từ', type: 'file' },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    cols: ['date', 'item', 'category', 'amount', 'invoiceNo', 'checks', 'settleBatch', 'status', 'files'],
    sums: ['amount'],
    groupBy: ['category', 'status'],
  },
  {
    id: 'grades', pending: (r) => r.score20 === '' || r.score20 == null || +r.score20 < 10, cat: 'c04', name: 'Điểm học phần Rennes', icon: 'Award', item: 'điểm',
    desc: 'Điểm các học phần GV Rennes giảng (thang 20) → tự quy đổi thang 10 (2 số lẻ) và xét điều kiện bằng Rennes: TB ≥ 10/20 và không học phần nào < 10/20.',
    title: 'fullName', status: 'result', special: 'grades',
    fields: [
      { k: 'studentId', label: 'MSSV', type: 'text', req: true },
      { k: 'fullName', label: 'Họ và tên', type: 'text', w: 190 },
      { k: 'course', label: 'Học phần', type: 'select', options: COURSE_NAMES, req: true },
      { k: 'term', label: 'Học kỳ', type: 'text' },
      { k: 'score20', label: 'Điểm (thang 20)', type: 'number' },
      { k: 'note', label: 'Ghi chú', type: 'text' },
    ],
    cols: ['studentId', 'fullName', 'course', 'term', 'score20', 'score10', 'result'],
    computed: {
      score10: { label: 'Quy đổi thang 10', type: 'number', fn: (r) => (r.score20 === '' || r.score20 == null ? '' : Math.round((+r.score20 / 2) * 100) / 100) },
      result: { label: 'Kết quả', type: 'select', options: ['Đạt', 'Dưới 10/20', 'Chưa có điểm'], fn: (r) => (r.score20 === '' || r.score20 == null ? 'Chưa có điểm' : +r.score20 >= MOA.passMark20 ? 'Đạt' : 'Dưới 10/20') },
    },
  },
  {
    id: 'tickets', pending: (r) => r.status !== 'Đã giải quyết', cat: 'c09', name: 'Hộp thư sinh viên', icon: 'Mail', item: 'email',
    desc: 'Tải email (.eml) SV gửi lên → hệ thống tự đọc người gửi, tiêu đề, nội dung; giao người xử lý và theo dõi tiến độ.',
    title: 'subject', status: 'status', date: 'receivedAt', special: 'inbox',
    fields: [
      { k: 'subject', label: 'Tiêu đề', type: 'text', req: true, w: 260 },
      { k: 'fromName', label: 'Người gửi', type: 'text' },
      { k: 'fromEmail', label: 'Email người gửi', type: 'email' },
      { k: 'receivedAt', label: 'Nhận lúc', type: 'datetime' },
      { k: 'topic', label: 'Nhóm vấn đề', type: 'select', options: S('Học vụ', 'Học phí', 'Tài khoản Rennes', 'Du học / visa', 'Khảo thí', 'Khác') },
      { k: 'status', label: 'Tiến độ', type: 'select', options: S('Mới', 'Đang xử lý', 'Chờ SV phản hồi', 'Đã giải quyết') },
      { k: 'handler', label: 'Người xử lý', type: 'user' },
      { k: 'due', label: 'Hạn phản hồi', type: 'date' },
      { k: 'body', label: 'Nội dung email', type: 'long' },
      { k: 'files', label: 'File email & đính kèm', type: 'file' },
    ],
    cols: ['receivedAt', 'fromName', 'subject', 'topic', 'handler', 'due', 'status'],
    sort: (a, b) => (b.receivedAt || '').localeCompare(a.receivedAt || ''),
  },

  /* ================= DỰ ÁN TƯ VẤN QUỸ ĐẦU TƯ MẠO HIỂM GIA LAI ================= */
  {
    id: 'gl_docs', cat: 'gl01', name: 'Văn bản & Pháp lý Sở Ngành', icon: 'FileText', item: 'văn bản',
    desc: 'Công văn đi/đến (Sở KH&CN, Sở Tài chính, Cục Thuế, Sở Công thương), Tờ trình, Quyết định giao nhiệm vụ.',
    title: 'title', status: 'status', date: 'issueDate',
    pending: (r) => r.status === 'Chờ ý kiến Sở ngành' || r.status === 'Đang phúc đáp',
    fields: [
      { k: 'number', label: 'Số hiệu văn bản', type: 'text', col: true, w: 130 },
      { k: 'title', label: 'Trích yếu văn bản', type: 'text', req: true, col: true, w: 240 },
      { k: 'agency', label: 'Cơ quan ban hành / Phối hợp', type: 'select', options: S('Sở KH&CN Gia Lai', 'Sở Tài chính Gia Lai', 'Cục Thuế tỉnh Gia Lai', 'Sở Công thương Gia Lai', 'Sở NN&PTNT Gia Lai', 'Trung tâm Khởi nghiệp & ĐMST', 'Nhóm Tư vấn UEH', 'UBND Tỉnh Gia Lai'), col: true },
      { k: 'docType', label: 'Loại văn bản', type: 'select', options: S('Quyết định giao nhiệm vụ', 'Công văn đến', 'Công văn đi', 'Tờ trình UBND tỉnh', 'Dự thảo Nghị quyết', 'Biên bản làm việc', 'Văn bản phúc đáp'), col: true },
      { k: 'issueDate', label: 'Ngày ban hành', type: 'date', col: true },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Đã ký', 'Đang phúc đáp', 'Chờ ý kiến Sở ngành'), col: true },
      { k: 'files', label: 'File đính kèm', type: 'file', col: true },
      { k: 'note', label: 'Ghi chú & Đóng góp ý kiến', type: 'long' },
    ],
    cols: ['number', 'title', 'agency', 'docType', 'issueDate', 'status', 'files'],
    sort: (a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''),
  },
  {
    id: 'gl_surveys', cat: 'gl02', name: 'Khảo sát & Dữ liệu Đầu vào', icon: 'Database', item: 'bộ số liệu',
    desc: 'Báo cáo số liệu các sở ngành gửi lại Sở KH&CN, chỉ số PII, báo cáo KTXH Gia Lai, số liệu DN & HTX.',
    title: 'dataTitle', status: 'status', date: 'updatedDate',
    pending: (r) => r.status === 'Cần thu thập thêm' || r.status === 'Đã gửi phiếu' || r.status === 'Đang tổng hợp',
    views: {
      'Chia theo nhóm dữ liệu': ['code', 'dataTitle', 'source', 'reportedContent', 'sampleCount', 'status', 'files'],
      'Bảng toàn bộ': ['code', 'dataTitle', 'source', 'reportedContent', 'dataType', 'sampleCount', 'status', 'files'],
    },
    fields: [
      { k: 'code', label: 'Mã số liệu', type: 'text', col: true, w: 100 },
      { k: 'dataTitle', label: 'Tên chỉ tiêu / Khảo sát', type: 'text', req: true, col: true, w: 230 },
      { k: 'source', label: 'Sở / Tổ chức cung cấp', type: 'text', col: true, w: 160 },
      { k: 'reportedContent', label: 'Nội dung ban ngành báo cáo lại', type: 'long', col: true, w: 220 },
      { k: 'dataType', label: 'Nhóm loại dữ liệu', type: 'select', options: S(
        'Nhóm I: Khảo sát Nhu cầu vốn & Thực trạng DN/HTX',
        'Nhóm II: Chỉ số Đổi mới sáng tạo (PII) & Tiềm lực KH&CN',
        'Nhóm III: Kinh tế – Xã hội & Niên giám thống kê',
        'Nhóm IV: Nông nghiệp Công nghệ cao & Nông sản, Dược liệu',
        'Nhóm V: Thuế, Tài chính & Tình hình Doanh nghiệp',
        'Nhóm VI: Dự toán Ngân sách, Vốn mồi & Cơ chế NSNN',
        'Nhóm VII: Công nghiệp Chế biến, Thương mại & Năng lượng',
        'Nhóm VIII: Cổ đông Tiềm năng & Cam kết góp vốn tư nhân'
      ), col: true },
      { k: 'sampleCount', label: 'Tiến độ thu thập', type: 'text', col: true, w: 120 },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Đã nhận số liệu', 'Đang tổng hợp', 'Đã gửi phiếu', 'Cần thu thập thêm'), col: true, w: 120 },
      { k: 'updatedDate', label: 'Ngày cập nhật', type: 'date', col: true, w: 100 },
      { k: 'files', label: 'File số liệu & báo cáo', type: 'file', col: true },
      { k: 'note', label: 'Ghi chú & Đánh giá sơ bộ', type: 'long' },
    ],
    cols: ['code', 'dataTitle', 'source', 'reportedContent', 'dataType', 'sampleCount', 'status', 'files'],
    sort: (a, b) => (b.updatedDate || '').localeCompare(a.updatedDate || ''),
  },
  {
    id: 'gl_drafts', cat: 'gl03', name: 'Soạn thảo & Biên tập Đề án', icon: 'BookOpenCheck', item: 'bản thảo',
    desc: 'Phiên bản đề cương, Dự thảo Đề án v1.0, v6.3, Bản tóm tắt rút gọn, Bản chuẩn format UEH.',
    title: 'docTitle', status: 'status', date: 'updatedAt',
    pending: (r) => r.status === 'Đang phản biện' || r.status === 'Bản thảo',
    fields: [
      { k: 'versionCode', label: 'Phiên bản / Mã', type: 'text', col: true, w: 110 },
      { k: 'docTitle', label: 'Tên tài liệu / Phần đề án', type: 'text', req: true, col: true, w: 230 },
      { k: 'leadAuthor', label: 'Người chủ trì', type: 'user', col: true, w: 140 },
      { k: 'docType', label: 'Phân loại', type: 'select', options: S('Đề cương chi tiết', 'Dự thảo Đề án', 'Bản tóm tắt rút gọn', 'Định dạng chuẩn UEH', 'Dự thảo Tờ trình & Nghị quyết'), col: true },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Bản thảo', 'Đang phản biện', 'Bản hoàn thiện'), col: true },
      { k: 'updatedAt', label: 'Ngày cập nhật', type: 'date', col: true },
      { k: 'files', label: 'File bản thảo (.docx/.pdf)', type: 'file', col: true },
      { k: 'reviewFeedback', label: 'Ý kiến phản biện & tiếp thu', type: 'long' },
    ],
    cols: ['versionCode', 'docTitle', 'leadAuthor', 'docType', 'status', 'updatedAt', 'files'],
    sort: (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''),
  },
  {
    id: 'gl_meetings', cat: 'gl04', name: 'Lịch làm việc & Hội thảo Thống nhất', icon: 'CalendarClock', item: 'buổi làm việc',
    desc: 'Lịch làm việc trực tiếp tại Tỉnh, trao đổi kỹ thuật với Tổ chuyên viên Sở KH&CN, Hội thảo tham vấn chuyên gia.',
    title: 'meetingTitle', status: 'status', date: 'meetingDate',
    pending: (r) => r.status === 'Sắp diễn ra',
    fields: [
      { k: 'meetingTitle', label: 'Tiêu đề buổi làm việc / Hội thảo', type: 'text', req: true, col: true, w: 230 },
      { k: 'meetingDate', label: 'Thời gian', type: 'datetime', col: true, w: 140 },
      { k: 'location', label: 'Địa điểm', type: 'text', col: true, w: 160 },
      { k: 'participants', label: 'Thành phần tham dự', type: 'text', col: true, w: 180 },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Sắp diễn ra', 'Đã hoàn thành', 'Có biên bản họp'), col: true },
      { k: 'minutesFile', label: 'Biên bản & Tài liệu họp', type: 'file', col: true },
      { k: 'outcomes', label: 'Kết luận & Nhiệm vụ tiếp theo', type: 'long' },
    ],
    cols: ['meetingTitle', 'meetingDate', 'location', 'participants', 'status', 'minutesFile'],
    sort: (a, b) => (b.meetingDate || '').localeCompare(a.meetingDate || ''),
  },
  {
    id: 'gl_trips', cat: 'gl05', name: 'Đoàn công tác & Khảo sát Địa phương', icon: 'PlaneTakeoff', item: 'chuyến công tác',
    desc: 'Hậu cần công tác Pleiku/Gia Lai: Đề xuất & đặt vé máy bay đoàn chuyên gia UEH, khách sạn, xe đưa đón; tích hợp luồng vé máy bay & phiếu đề nghị.',
    title: 'tripName', status: 'status', date: 'startDate',
    pending: (r) => r.status === 'Chờ duyệt vé',
    fields: [
      { k: 'tripName', label: 'Đợt công tác', type: 'text', req: true, col: true, w: 260 },
      { k: 'delegation', label: 'Đoàn chuyên gia UEH', type: 'text', col: true, w: 220 },
      { k: 'route', label: 'Hành trình', type: 'text', col: true, w: 150 },
      { k: 'flightDetails', label: 'Chuyến bay & Hãng', type: 'text', col: true, w: 170 },
      { k: 'hotel', label: 'Khách sạn Pleiku', type: 'text', col: true, w: 170 },
      { k: 'startDate', label: 'Ngày đi', type: 'date', col: true },
      { k: 'endDate', label: 'Ngày về', type: 'date', col: true },
      { k: 'cost', label: 'Dự toán kinh phí', type: 'money', col: true, w: 130 },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Chờ duyệt vé', 'Đã đặt', 'Quyết toán xong'), col: true },
      { k: 'files', label: 'Phiếu đề nghị & Vé máy bay', type: 'file', col: true },
      { k: 'note', label: 'Lịch trình chi tiết', type: 'long' },
    ],
    cols: ['tripName', 'delegation', 'route', 'flightDetails', 'hotel', 'startDate', 'endDate', 'cost', 'status', 'files'],
    sort: (a, b) => (b.startDate || '').localeCompare(a.startDate || ''),
  },
  {
    id: 'gl_experts', cat: 'gl06', name: 'Nhóm Chuyên gia & Phân công Biên soạn', icon: 'UsersRound', item: 'chuyên gia',
    desc: 'Danh sách chuyên gia tư vấn UEH, phân công phụ trách phần đề án: Cơ sở pháp lý, Mô hình vận hành quỹ, Cơ chế thoái vốn...',
    title: 'fullName', status: 'status', date: 'deadline',
    pending: (r) => r.status === 'Cần đôn đốc',
    fields: [
      { k: 'fullName', label: 'Họ và tên chuyên gia', type: 'text', req: true, col: true, w: 200 },
      { k: 'academicTitle', label: 'Học hàm / Học vị', type: 'text', col: true, w: 130 },
      { k: 'role', label: 'Vai trò dự án', type: 'text', col: true, w: 180 },
      { k: 'topicAssigned', label: 'Phần đề án phụ trách', type: 'text', col: true, w: 280 },
      { k: 'deadline', label: 'Hạn nộp bản thảo', type: 'date', col: true },
      { k: 'progress', label: 'Tiến độ (%)', type: 'text', col: true, w: 100 },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Đúng hạn', 'Cần đôn đốc'), col: true },
      { k: 'email', label: 'Email', type: 'email' },
      { k: 'phone', label: 'Điện thoại', type: 'phone' },
      { k: 'note', label: 'Ghi chú & Thống nhất nội dung', type: 'long' },
    ],
    cols: ['fullName', 'academicTitle', 'role', 'topicAssigned', 'deadline', 'progress', 'status'],
    sort: (a, b) => (a.deadline || '').localeCompare(b.deadline || ''),
  },
  {
    id: 'gl_legal_lib', cat: 'gl07', name: 'Thư viện Pháp lý & Tham khảo', icon: 'Library', item: 'văn bản tham khảo',
    desc: 'Văn bản quy phạm pháp lý (Luật, Nghị định, Nghị quyết HĐND) và Tài liệu tham khảo (Đề án, Báo cáo, Quốc tế).',
    title: 'docTitle', status: 'docGroup', date: 'yearIssued',
    groupBy: ['docGroup', 'legalScope'],
    views: {
      'Tất cả': ['number', 'docTitle', 'legalScope', 'issuer', 'yearIssued', 'keyApplication', 'files'],
      'Văn bản pháp lý': ['number', 'docTitle', 'legalScope', 'issuer', 'yearIssued', 'keyApplication', 'files'],
      'Tài liệu tham khảo': ['number', 'docTitle', 'legalScope', 'issuer', 'yearIssued', 'keyApplication', 'files'],
    },
    fields: [
      { k: 'number', label: 'Số hiệu / Ký hiệu', type: 'text', col: true, w: 160 },
      { k: 'docTitle', label: 'Tên văn bản / Đề án tham khảo', type: 'text', req: true, col: true, w: 320 },
      { k: 'docGroup', label: 'Nhóm tài liệu', type: 'select', options: S('Văn bản pháp lý các cấp', 'Tài liệu tham khảo khác'), col: false, w: 180 },
      { k: 'legalScope', label: 'Cấp hiệu lực / Phân loại', type: 'select', options: S('Luật (Quốc hội)', 'Nghị định (Chính phủ)', 'Nghị quyết HĐND tỉnh', 'Đề án thực tiễn', 'Báo cáo nghiên cứu', 'Kinh nghiệm quốc tế', 'Tài liệu TW', 'Văn bản Tỉnh', 'Tài liệu quốc tế'), col: true, w: 170 },
      { k: 'issuer', label: 'Cơ quan ban hành', type: 'text', col: true, w: 180 },
      { k: 'yearIssued', label: 'Năm', type: 'text', col: true, w: 90 },
      { k: 'keyApplication', label: 'Giá trị tham chiếu cho Gia Lai', type: 'text', col: true, w: 280 },
      { k: 'files', label: 'File tài liệu gốc (PDF)', type: 'file', col: true },
      { k: 'note', label: 'Trích yếu điều khoản mấu chốt', type: 'long' },
    ],
    cols: ['number', 'docTitle', 'legalScope', 'issuer', 'yearIssued', 'keyApplication', 'files'],
    sort: (a, b) => {
      const ra = getLegalRank(a)
      const rb = getLegalRank(b)
      if (ra !== rb) return ra - rb
      return (b.yearIssued || '').localeCompare(a.yearIssued || '') || (a.number || '').localeCompare(b.number || '')
    },
  },
  {
    id: 'gl_finance', cat: 'gl08', name: 'Chi phí & Quyết toán Hợp đồng Tư vấn', icon: 'Calculator', item: 'khoản thanh toán',
    desc: 'Tạm ứng, thù lao viết chuyên đề, công tác phí khảo sát, hồ sơ thanh quyết toán với Sở KH&CN.',
    title: 'title', status: 'status', date: 'requestDate',
    pending: (r) => r.status === 'Chứng từ chờ duyệt',
    fields: [
      { k: 'code', label: 'Mã chứng từ', type: 'text', col: true, w: 120 },
      { k: 'title', label: 'Hạng mục chi / Thù lao', type: 'text', req: true, col: true, w: 280 },
      { k: 'category', label: 'Nhóm chi phí', type: 'select', options: S('Tạm ứng hợp đồng', 'Thù lao viết chuyên đề', 'Công tác phí khảo sát', 'Khảo sát số liệu PII', 'Hội thảo & Tham vấn', 'Nghiệm thu thanh lý'), col: true },
      { k: 'amount', label: 'Số tiền (VNĐ)', type: 'money', col: true, w: 140 },
      { k: 'beneficiary', label: 'Đơn vị / Người nhận', type: 'text', col: true, w: 180 },
      { k: 'requestDate', label: 'Ngày đề nghị', type: 'date', col: true },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Đã chi', 'Đang giải ngân', 'Chứng từ chờ duyệt'), col: true },
      { k: 'receiptFiles', label: 'Hóa đơn & Chứng từ', type: 'file', col: true },
      { k: 'note', label: 'Căn cứ hợp đồng & Điều khoản', type: 'long' },
    ],
    cols: ['code', 'title', 'category', 'amount', 'beneficiary', 'requestDate', 'status', 'receiptFiles'],
    sort: (a, b) => (b.requestDate || '').localeCompare(a.requestDate || ''),
  },
]
export const MODULE = Object.fromEntries(MODULES.map((m) => [m.id, m]))
export const CATEGORY_MODULES = MODULES.reduce((acc, m) => ((acc[m.cat] ||= []).push(m.id), acc), { c07: [], c10: [] })
CATEGORY_MODULES.c07.push('students')
export const fieldOf = (m, k) => m.fields.find((f) => f.k === k) || (m.computed?.[k] && { k, ...m.computed[k] })
export const columnsOf = (m, view) => (m.views ? m.views[view || Object.keys(m.views)[0]] : m.cols || m.fields.filter((f) => f.col).map((f) => f.k))
export const valueOf = (m, r, k) => (m.computed?.[k] ? m.computed[k].fn(r) : r[k])

/* Việc → phân hệ nơi thực hiện (trang làm việc trực tiếp) */
const nz = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
export function workTarget(task, tasks = []) {
  if (!task) return null
  const stream = task.isStream ? task : tasks.find((x) => x.id === task.parentId)
  const t = nz((stream?.title || '') + ' ' + task.title)
  const cat = task.categoryId
  if (cat === 'c10') return { module: 'report' }
  if (cat === 'c02' || cat === 'c07') {
    if (/tai khoan|lms/.test(t)) return { module: 'students', view: 'Tài khoản Rennes' }
    if (/hoc phi|doi soat so/.test(t) && !/chuyen tien|da nhan|cong no/.test(t)) return { module: 'students', view: 'Học phí' }
    if (cat === 'c07') return { module: 'transfers' }
    return { module: 'students', view: 'Hồ sơ' }
  }
  if (cat === 'c09') return /cham soc|ho tro|dinh huong|email|tu van/.test(t) ? { module: 'tickets' } : null
  const ms = CATEGORY_MODULES[cat]
  return ms?.length ? { module: ms[0] } : null
}
export const workHref = (task, tasks) => {
  const w = workTarget(task, tasks)
  return w ? `/projects/${task.projectId}/work/${w.module}?task=${task.id}${w.view ? '&view=' + encodeURIComponent(w.view) : ''}` : null
}


/* Việc ↔ bản ghi: tìm bản ghi trong phân hệ khớp nhất với tên việc */
const STOP = new Set(['cho', 'cua', 'voi', 'cac', 'nhung', 'trong', 'theo', 'tu', 've', 'va', 'la', 'mot', 'dot', 'lap', 'nam', 'hoc'])
const toks = (x) => nz(String(x || '')).split(/[^a-z0-9]+/).filter((w) => (w.length >= 3 || /\d/.test(w)) && !STOP.has(w))
export function matchItem(task, items, m) {
  if (!task || !items.length) return null
  const linked = task.links?.[m.id] && items.find((x) => x.id === task.links[m.id])
  if (linked) return { item: linked, sure: true }
  const tt = new Set(toks(task.title))
  const due = task.dueDate ? new Date(task.dueDate) : new Date()
  let best = null
  for (const it of items) {
    const head = new Set(toks(it[m.title]))
    const rest = new Set(toks(Object.entries(it).filter(([k, v]) => k !== m.title && typeof v === 'string' && !/^\d{4}-\d{2}-\d{2}/.test(v) && !/^(id|projectId|module|createdBy|updatedBy|createdAt|updatedAt)$/.test(k)).map(([, v]) => v).join(' ')))
    let sc = 0, hd = 0
    tt.forEach((w) => { if (head.has(w)) { sc += 2; hd++ } else if (rest.has(w)) sc += 1 })
    if (!hd) sc = 0 // phải trùng ít nhất 1 từ trong tên bản ghi
    const dk = m.date && it[m.date] ? Math.abs(new Date(String(it[m.date]).slice(0, 10)) - due) : 9e15
    if (!best || sc > best.sc || (sc === best.sc && dk < best.dk)) best = { item: it, sc, dk }
  }
  return best && best.sc >= 3 ? { item: best.item, sure: false } : null
}

/* Tóm tắt yêu cầu đặc biệt của GV (ghi nhớ, dùng lại cho mọi chuyến) */
export function prefsText(l) {
  if (!l) return ''
  return [l.diet && l.diet !== 'Không yêu cầu' && l.diet, l.allergies && 'Dị ứng: ' + l.allergies, l.fruits && 'Ưa thích: ' + l.fruits, l.drinks && 'Đồ uống: ' + l.drinks,
    l.hotelPref && 'Phòng: ' + l.hotelPref, l.seatPref && l.seatPref !== 'Không yêu cầu' && 'Ghế: ' + l.seatPref, l.otherPrefs].filter(Boolean).join(' · ')
}
const TITLES = new Set(['prof', 'dr', 'ts', 'ths', 'pgs', 'gs', 'mr', 'mrs', 'ms', 'phd'])
export const personKey = (s = '') => nz(s).replace(/[^a-z ]/g, ' ').split(/\s+/).filter((w) => w && !TITLES.has(w)).join(' ')
export const sameName = (a, b) => {
  const x = personKey(a), y = personKey(b)
  if (!x || !y) return false
  if (x === y) return true
  const wx = x.split(' ').filter((w) => w.length > 2), wy = y.split(' ').filter((w) => w.length > 2)
  const [short, long] = wx.length <= wy.length ? [wx, wy] : [wy, wx]
  return short.length >= 2 && short.every((w) => long.includes(w))
}
