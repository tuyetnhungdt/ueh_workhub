// Bố cục biểu mẫu nhập liệu theo từng phân hệ: nhóm trường thành các mục đánh số
// và bổ sung quy tắc kiểm tra (số nguyên, giới hạn, không vượt quá trường khác…).
const WIDE = ['checklist', 'file', 'long']

export const FORM_SECTIONS = {
  exams: [
    ['Thông tin kỳ thi', ['course', 'examType', 'className', 'date', 'start', 'room', 'proctor', 'count', 'status']],
    ['Đề thi & phòng thi', ['paperStatus', 'paperCopies', 'roomStatus']],
    ['Chấm thi (Rennes)', ['grader', 'sendMethod', 'scriptsSentAt', 'scriptsCount', 'gradesReceivedAt']],
    ['Duyệt & công bố điểm', ['councilStatus', 'councilDate', 'publishedAt']],
    ['Tiến độ, file & ghi chú', ['steps', 'files', 'note']],
  ],
  lecturers: [
    ['Thông tin giảng viên', ['fullName', 'side', 'academicTitle', 'dob', 'email', 'phone', 'specialization']],
    ['Học phần & giờ giảng', ['courses', 'cohorts', 'hoursPlanned', 'hoursDone', 'rateEur']],
    ['Hợp đồng & nghiệm thu', ['contractNo', 'contractFrom', 'contractTo', 'contractStatus', 'gradesSent', 'acceptance', 'acceptanceDate', 'payStatus']],
    ['Giấy tờ & tài khoản', ['passport', 'passportIssued', 'taxCode', 'bankAccount', 'bankName', 'address']],
    ['Sở thích & hậu cần', ['diet', 'seatPref', 'allergies', 'fruits', 'drinks', 'hotelPref', 'otherPrefs']],
    ['Hồ sơ & ghi chú', ['syllabi', 'docs', 'files', 'note']],
  ],
  trips: [
    ['Giảng viên & học phần', ['lecturer', 'course', 'className', 'teachFrom', 'teachTo', 'teachHours', 'contractNo']],
    ['Chuyến bay', ['outFlight', 'departAt', 'arriveAt', 'returnFlight', 'returnAt']],
    ['Khách sạn, visa & đón tiễn', ['hotel', 'bookingCode', 'hotelStatus', 'checkIn', 'checkOut', 'visa', 'pickup']],
    ['Định mức chi phí (MOA)', ['rateEur', 'taxRate', 'perDiemDays', 'perDiemRate', 'tgvEur', 'fx', 'ticketCost', 'hotelCost', 'otherCost']],
    ['Tạm ứng & thanh toán', ['advanceBy', 'advanceEur', 'advanceStatus', 'status', 'payStatus']],
    ['Việc cần làm & hồ sơ', ['steps', 'files', 'note']],
  ],
  students: [
    ['Thông tin cá nhân', ['studentId', 'fullName', 'dob', 'gender', 'email', 'phone']],
    ['Học tập', ['className', 'cohort', 'yearLevel', 'dualDegree', 'academicStatus', 'credits']],
    ['Học phí', ['tuitionStatus', 'tuitionAmount', 'tuitionPaid', 'tuitionNote']],
    ['Tài khoản Rennes', ['rennesId', 'rennesEmail', 'lmsAccount', 'accountStatus', 'accountDate']],
    ['Xét chuyển giai đoạn 2', ['englishLevel', 'b2Status', 'rennesForm', 'phase2']],
    ['Ghi chú', ['note']],
  ],
  sessions: [
    ['Học phần & giảng viên', ['course', 'courseCode', 'lecturer', 'side', 'className', 'teachingGroup']],
    ['Thời gian & địa điểm', ['date', 'start', 'end', 'room', 'mode']],
    ['Xác nhận lịch', ['status', 'uehConfirmed', 'rennesConfirmed', 'scheduleVersion']],
    ['Ghi chú', ['note']],
  ],
  docs: [
    ['Thông tin văn bản', ['title', 'docType', 'number', 'date', 'expiry', 'partner', 'status', 'owner']],
    ['Trình ký & file', ['signers', 'files']],
    ['Góp ý & ghi chú', ['note']],
  ],
}

// Quy tắc kiểm tra bổ sung theo phân hệ → trường
export const FIELD_RULES = {
  exams: { count: { max: 500 }, paperCopies: { max: 1000 }, scriptsCount: { maxOf: 'count' } },
  lecturers: { hoursPlanned: { max: 2000 }, hoursDone: { max: 2000 }, rateEur: { max: 1000 } },
  trips: { teachHours: { max: 300 }, taxRate: { max: 100, unit: '%' }, perDiemDays: { max: 60 }, tgvEur: { max: 150, help: 'MOA: tối đa €150' }, fx: { max: 100000 } },
  students: { credits: { max: 250 }, tuitionPaid: { maxOf: 'tuitionAmount' } },
  transfers: { studentCount: { max: 1000 } },
}

/* Trả về [{ title, fields }] cho một phân hệ */
export function buildSections(m) {
  const rules = FIELD_RULES[m.id] || {}
  const withRules = (fd) => (rules[fd.k] ? { ...fd, ...rules[fd.k] } : fd)
  const byKey = Object.fromEntries(m.fields.map((fd) => [fd.k, fd]))
  const def = FORM_SECTIONS[m.id]
  if (def) {
    const seen = new Set()
    const out = def.map(([title, keys]) => ({
      title,
      fields: keys.filter((k) => byKey[k] && !seen.has(k) && seen.add(k)).map((k) => withRules(byKey[k])),
    })).filter((s) => s.fields.length)
    const rest = m.fields.filter((fd) => !seen.has(fd.k)).map(withRules)
    if (rest.length) {
      const last = out[out.length - 1]
      const plain = rest.filter((fd) => !WIDE.includes(fd.type))
      if (plain.length) out.splice(Math.max(0, out.length - 1), 0, { title: 'Thông tin khác', fields: plain })
      const wide = rest.filter((fd) => WIDE.includes(fd.type))
      if (wide.length) last.fields.push(...wide)
    }
    return out
  }
  const main = m.fields.filter((fd) => !WIDE.includes(fd.type)).map(withRules)
  const extra = m.fields.filter((fd) => WIDE.includes(fd.type)).map(withRules)
  const out = []
  if (main.length) out.push({ title: 'Thông tin chính', fields: main })
  if (extra.length) out.push({ title: 'Tiến độ, hồ sơ & ghi chú', fields: extra })
  return out
}
