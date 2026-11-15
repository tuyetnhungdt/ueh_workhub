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
  'Đang giải ngân': 'info', 'Chứng từ chờ duyệt': 'warn',
}

export const MODULES = [
  {
    id: 'docs', newOnNoMatch: true, pending: (r) => !['Đã ký', 'Đã gửi', 'Hết hiệu lực'].includes(r.status) || (r.signers || []).some((c) => !c.done), recordWork: true, cat: 'c01', name: 'Văn bản & hồ sơ', icon: 'FileText', item: 'văn bản',
    desc: 'MOA, phụ lục, công văn đi/đến, biên bản họp, quyết định – lưu file gốc, số hiệu, trạng thái.',
    title: 'title', status: 'status', date: 'date',
    fields: [
      { k: 'title', label: 'Tên văn bản', type: 'text', req: true, col: true, w: 300 },
      { k: 'docType', label: 'Loại', type: 'select', options: S('MOA', 'Phụ lục hợp tác', 'Công văn đi', 'Công văn đến', 'Biên bản họp', 'Quyết định', 'Kế hoạch', 'Khác'), col: true },
      { k: 'number', label: 'Số hiệu', type: 'text', col: true },
      { k: 'date', label: 'Ngày ban hành', type: 'date', col: true },
      { k: 'partner', label: 'Đối tác / nơi nhận', type: 'text', col: true },
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Dự thảo', 'Chờ góp ý', 'Đang trình ký', 'Đã ký', 'Đã gửi', 'Hết hiệu lực'), col: true },
      { k: 'expiry', label: 'Hiệu lực đến', type: 'date' },
      { k: 'owner', label: 'Người phụ trách', type: 'user', col: true },
      { k: 'signers', label: 'Trình ký / góp ý', type: 'checklist', col: true, ph: 'VD: Thầy Chí ký, GV ký bảng trừ thuế…', defaults: ['Rà soát nội dung', 'Trưởng khoa ký'] },
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
    },
    fields: [
      { k: 'studentId', label: 'MSSV', type: 'text', req: true, w: 110 },
      { k: 'fullName', label: 'Họ và tên', type: 'text', req: true, w: 190 },
      { k: 'dob', label: 'Ngày sinh', type: 'date' },
      { k: 'gender', label: 'Giới tính', type: 'select', options: S('Nữ', 'Nam', 'Khác') },
      { k: 'email', label: 'Email', type: 'email' },
      { k: 'phone', label: 'Số điện thoại', type: 'phone' },
      { k: 'className', label: 'Lớp', type: 'text' },
      { k: 'cohort', label: 'Khóa', type: 'select', options: S('K49', 'K50', 'K51', 'K52', 'K53') },
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
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    sums: ['tuitionAmount', 'tuitionPaid'],
    groupBy: ['cohort', 'yearLevel', 'tuitionStatus', 'accountStatus', 'dualDegree'],
  },
  {
    id: 'sessions', cat: 'c03', name: 'Kế hoạch & lịch giảng', icon: 'CalendarDays', item: 'buổi học',
    desc: 'Từng buổi học: học phần, giảng viên, ngày giờ, phòng, hình thức. Xem dạng bảng, lịch tháng và timeline học phần.',
    title: 'course', status: 'status', date: 'date', special: 'sessions',
    fields: [
      { k: 'course', label: 'Học phần', type: 'text', req: true, w: 220 },
      { k: 'courseCode', label: 'Mã HP', type: 'text' },
      { k: 'lecturer', label: 'Giảng viên', type: 'text' },
      { k: 'side', label: 'Bên giảng', type: 'select', options: S('Rennes', 'UEH') },
      { k: 'className', label: 'Lớp / khóa', type: 'text' },
      { k: 'teachingGroup', label: 'Nhóm lớp', type: 'select', options: S('K50–K51', 'K52', 'Chung') },
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
      { k: 'files', label: 'Bảng điểm / file', type: 'file' },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    cols: ['date', 'start', 'course', 'examType', 'className', 'room', 'count', 'status', 'files'],
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
      { k: 'rateEur', label: 'Thù lao/giờ (sau thuế)', type: 'number', cur: 'EUR' },
      { k: 'dob', label: 'Ngày sinh', type: 'date' },
      { k: 'specialization', label: 'Chuyên môn', type: 'text' },
      { k: 'address', label: 'Địa chỉ liên lạc', type: 'text', w: 260 },
      { k: 'passport', label: 'Số hộ chiếu', type: 'text' },
      { k: 'passportIssued', label: 'Ngày cấp / nơi cấp', type: 'text' },
      { k: 'bankAccount', label: 'Số tài khoản (IBAN)', type: 'text' },
      { k: 'bankName', label: 'Ngân hàng / BIC', type: 'text' },
      { k: 'taxCode', label: 'Mã số thuế TNCN', type: 'text' },
      { k: 'cohorts', label: 'Khóa / lớp phụ trách', type: 'text', ph: 'VD: K50, K51 (ISB-K51-01)' },
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
      { k: 'files', label: 'Đề nghị, ủy nhiệm chi', type: 'file' },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    defaults: { feePerStudent: MOA.feePerStudentEur, fx: MOA.fx, status: 'Đề nghị' },
    computed: {
      totalEur: { label: 'Tổng phải chuyển', type: 'eur', fn: (r) => (+r.studentCount || 0) * (+r.feePerStudent || 0) },
      totalVnd: { label: 'Quy đổi VND', type: 'money', fn: (r) => Math.round((+r.studentCount || 0) * (+r.feePerStudent || 0) * (+r.fx || MOA.fx)) },
    },
    cols: ['term', 'studentCount', 'feePerStudent', 'totalEur', 'totalVnd', 'requestDate', 'transferDate', 'status', 'debt', 'files'],
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
      { k: 'status', label: 'Trạng thái', type: 'select', options: S('Đề nghị', 'Đã duyệt', 'Đã chi', 'Đã quyết toán') },
      { k: 'files', label: 'Chứng từ', type: 'file' },
      { k: 'note', label: 'Ghi chú', type: 'long' },
    ],
    cols: ['date', 'item', 'category', 'amount', 'payee', 'voucher', 'status', 'files'],
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
