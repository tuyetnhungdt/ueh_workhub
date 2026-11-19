/* =====================================================================
   LIÊN KẾT DỮ LIỆU GIỮA CÁC PHÂN HỆ + KẾ HOẠCH GIẢNG NHIỀU KHÓA
   - relatedOf(item, items): các bản ghi liên quan ở phân hệ khác (kèm lý do)
   - lecturerDocs(lec, items): giấy tờ của 1 GV gom từ hồ sơ GV + các đoàn công tác
   - TEACHING_PLAN / COHORTS / COHORT_TERMS / K52_RENNES_PLAN: lịch giảng theo khóa
   ===================================================================== */
import { MODULE, sameName, personKey } from './schema.js'

const nz = (s = '') => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
export const courseKey = (s = '') => nz(s).replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim()
const sameCourse = (a, b) => { const x = courseKey(a), y = courseKey(b); return !!x && !!y && (x === y || (x.length > 8 && y.startsWith(x)) || (y.length > 8 && x.startsWith(y))) }
const d10 = (s) => (s || '').slice(0, 10)
export const addDays = (iso, n) => { const d = new Date(iso.slice(0, 10) + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
export const dayDiff = (a, b) => Math.round((new Date(b.slice(0, 10) + 'T00:00:00Z') - new Date(a.slice(0, 10) + 'T00:00:00Z')) / 86400000)
export const surname = (name = '') => { const k = personKey(name).split(' ').filter(Boolean); return k[k.length - 1] || '' }
const hasWord = (txt, w) => !!w && w.length >= 4 && new RegExp('(^|[^a-z])' + w + '([^a-z]|$)').test(txt)
const fileNames = (r) => ['files', 'syllabi'].flatMap((k) => (Array.isArray(r[k]) ? r[k].map((f) => f.name || '') : []))
const textOf = (r, keys) => nz(keys.map((k) => (Array.isArray(r[k]) ? r[k].map((x) => x.name || x.text || '').join(' ') : r[k] || '')).join(' | '))

/* Khoảng thời gian 1 đoàn công tác có mặt ở UEH */
export function tripWindow(t) {
  const a = [t.teachFrom, d10(t.arriveAt), t.checkIn].filter(Boolean).sort()[0]
  const b = [t.teachTo, d10(t.returnAt), t.checkOut].filter(Boolean).sort().pop()
  return { from: a || b || '', to: b || a || '' }
}
const inWin = (date, w, pad = 1) => !!date && !!w.from && date >= addDays(w.from, -pad) && date <= addDays(w.to, pad)

/* Khoản chi → đoàn công tác: cùng họ GV trong nội dung/người nhận; ưu tiên trùng file chứng từ, sau đó gần ngày nhất */
export function expenseTrips(exp, trips) {
  const txt = textOf(exp, ['item', 'payee', 'note', 'files', 'voucher', 'invoiceNo'])
  const cands = trips.filter((t) => hasWord(txt, surname(t.lecturer)))
  if (cands.length <= 1) return cands
  const names = new Set(fileNames(exp))
  const byFile = cands.filter((t) => fileNames(t).some((n) => names.has(n)))
  if (byFile.length) return byFile
  if (!exp.date) return cands
  const dist = (t) => { const w = tripWindow(t); return w.from ? Math.min(Math.abs(dayDiff(exp.date, w.from)), Math.abs(dayDiff(exp.date, w.to))) : 9999 }
  const best = Math.min(...cands.map(dist))
  return cands.filter((t) => dist(t) === best)
}

/* Bảng quy tắc liên kết (đối xứng). Mỗi quy tắc: hai phân hệ, nhãn lý do, hàm kiểm tra */
export const LINK_RULES = [
  { a: 'trips', b: 'sessions', why: 'Buổi giảng nằm trong thời gian đoàn công tác', test: (t, s, ctx) => sameName(t.lecturer, s.lecturer) && inWin(s.date, ctx.win(t)) },
  { a: 'trips', b: 'expenses', why: 'Khoản chi của đoàn (vé, khách sạn, thù lao/SHP)', test: (t, e, ctx) => ctx.expTrips(e).some((x) => x.id === t.id) },
  { a: 'trips', b: 'lecturers', why: 'Hồ sơ giảng viên của đoàn (hộ chiếu, HĐ, yêu cầu riêng)', test: (t, l) => sameName(t.lecturer, l.fullName) },
  { a: 'trips', b: 'exams', why: 'Kỳ thi của học phần đoàn giảng', test: (t, x) => sameCourse(t.course, x.course) },
  { a: 'trips', b: 'docs', why: 'Văn bản nêu tên GV / số hợp đồng của đoàn', test: (t, d, ctx) => { const txt = ctx.text(d); return hasWord(txt, surname(t.lecturer)) || (t.contractNo && t.contractNo.length > 5 && txt.includes(nz(t.contractNo))) } },
  { a: 'sessions', b: 'lecturers', why: 'Giảng viên phụ trách buổi học', test: (s, l) => sameName(s.lecturer, l.fullName) },
  { a: 'sessions', b: 'exams', why: 'Kỳ thi kết thúc học phần', test: (s, x) => sameCourse(s.course, x.course) },
  { a: 'lecturers', b: 'expenses', why: 'Khoản chi cho/của giảng viên', test: (l, e, ctx) => hasWord(ctx.text(e), surname(l.fullName)) },
  { a: 'lecturers', b: 'docs', why: 'Văn bản nêu tên GV / số HĐ', test: (l, d, ctx) => { const txt = ctx.text(d); return (l.side === 'Rennes' && hasWord(txt, surname(l.fullName))) || (l.contractNo && l.contractNo.length > 5 && txt.includes(nz(l.contractNo))) } },
  { a: 'lecturers', b: 'exams', why: 'GV chấm thi / học phần GV phụ trách', test: (l, x) => sameName(l.fullName, x.grader) || (l.side === 'Rennes' && String(l.courses || '').split(/;\s*/).some((c) => sameCourse(c, x.course))) },
  { a: 'exams', b: 'grades', why: 'Điểm học phần của kỳ thi', test: (x, g) => sameCourse(x.course, g.course) },
  { a: 'students', b: 'grades', why: 'Điểm học phần của sinh viên', test: (s, g) => (s.studentId && s.studentId === g.studentId) || sameName(s.fullName, g.fullName) },
  { a: 'students', b: 'tickets', why: 'Email sinh viên gửi tới hộp thư', test: (s, t) => (s.email && nz(s.email) === nz(t.fromEmail)) || sameName(s.fullName, t.fromName) },
  { a: 'transfers', b: 'docs', why: 'Tờ trình / văn bản của đợt chuyển tiền', test: (t, d, ctx) => !!t.proposalNo && t.proposalNo.length > 4 && ctx.text(d).includes(nz(t.proposalNo)) },
]

function makeCtx(items) {
  const trips = items.filter((x) => x.module === 'trips')
  const wins = new Map(), texts = new Map(), et = new Map()
  return {
    win: (t) => wins.get(t.id) || (wins.set(t.id, tripWindow(t)), wins.get(t.id)),
    text: (r) => texts.get(r.id) || (texts.set(r.id, textOf(r, ['title', 'number', 'item', 'payee', 'note', 'files', 'partner'])), texts.get(r.id)),
    expTrips: (e) => et.get(e.id) || (et.set(e.id, expenseTrips(e, trips)), et.get(e.id)),
  }
}

/* → [{ module, name, why, items: [...] }] */
export function relatedOf(item, items) {
  if (!item?.module || !item.id) return []
  const ctx = makeCtx(items)
  const groups = []
  for (const r of LINK_RULES) {
    let other, fn
    if (r.a === item.module) { other = r.b; fn = (y) => r.test(item, y, ctx) }
    else if (r.b === item.module) { other = r.a; fn = (y) => r.test(y, item, ctx) }
    else continue
    const hits = items.filter((y) => y.module === other && y.id !== item.id && y.projectId === item.projectId && fn(y))
    if (hits.length) groups.push({ module: other, name: MODULE[other]?.name || other, why: r.why, items: hits })
  }
  return groups
}
export const itemLabel = (r) => {
  const m = MODULE[r.module]
  const t = (m && r[m.title]) || r.title || r.fullName || r.course || '—'
  const date = m?.date && r[m.date] ? d10(r[m.date]) : ''
  return { title: String(t), date, sub: r.module === 'sessions' ? `${r.start || ''}${r.end ? '–' + r.end : ''} · ${r.room || ''}` : r.module === 'expenses' ? (r.amount ? (+r.amount).toLocaleString('vi-VN') + ' ₫' : '') : r.status || '' }
}

/* ---------- Giấy tờ của giảng viên: gom từ hồ sơ GV + mọi đoàn công tác của GV đó ---------- */
const nzf = (f) => nz(f?.name || '')
export const DOC_MATCH = [
  { key: 'cv', re: /\bcv\b|llkh|ly lich|curriculum/ },
  { key: 'degree', re: /bang cap|van bang|diploma|degree|xac nhan nang luc/ },
  { key: 'passport', re: /passport|ho chieu|passeport/ },
  { key: 'contract', re: /hop dong|hdtg|(^|[^a-z])hd([^a-z]|$)|thinh giang|contract|agreement/ },
  { key: 'tax', re: /bang ke thanh toan|thue|tncn|tax/ },
  { key: 'grades', re: /bang diem|grade|transcript|notes/ },
]
export const docKind = (text) => { const t = nz(text); return DOC_MATCH.find((d) => d.re.test(t))?.key || null }
export function lecturerDocs(lec, items) {
  if (!lec) return []
  const out = []
  const seen = new Set()
  const add = (f, source) => { const k = nzf(f); if (!k || seen.has(k)) return; seen.add(k); out.push({ ...f, source, kind: docKind(f.name) }) }
  ;(lec.files || []).forEach((f) => add(f, 'Hồ sơ giảng viên'))
  items.filter((x) => x.module === 'trips' && x.projectId === lec.projectId && sameName(x.lecturer, lec.fullName))
    .sort((a, b) => (a.teachFrom || '').localeCompare(b.teachFrom || ''))
    .forEach((t) => (t.files || []).forEach((f) => add(f, `Đoàn công tác ${t.teachFrom ? t.teachFrom.slice(8, 10) + '/' + t.teachFrom.slice(5, 7) : ''}${t.teachTo ? '–' + t.teachTo.slice(8, 10) + '/' + t.teachTo.slice(5, 7) + '/' + t.teachTo.slice(0, 4) : ''}`)))
  return out
}

/* =====================================================================
   KẾ HOẠCH GIẢNG NHIỀU KHÓA (nguồn: "UEH-RENNES teaching plan 2026-2027 - 2 programs.xlsx",
   "Lịch giảng 5 môn HKC2026 - GV RENNES.pdf", CTĐT K50/K51/K52 FBDP)
   ===================================================================== */
export const COHORTS = [
  { id: 'K50', label: 'K50', program: 'Song bằng FBDP', note: 'Năm 3 · lớp HKC2026.DHCQ.K50.N1' },
  { id: 'K51', label: 'K51', program: 'Song bằng FBDP', note: 'Năm 2 · lớp FBDPF1 (HKC2026.DHCQ.K51.N1)' },
  { id: 'K52', label: 'K52', program: 'Song bằng FBDP', note: 'Năm 1 · CTĐT DHCQK52FBDPS' },
  { id: 'AF003', label: 'AF003', program: 'Applied Finance', note: 'Applied Finance Programme' },
  { id: 'AF004', label: 'AF004', program: 'Applied Finance', note: 'Applied Finance Programme' },
  { id: 'AF005', label: 'AF005', program: 'Applied Finance', note: 'Applied Finance Programme' },
]
/* Học kỳ của từng khóa để quy ra "tuần thứ mấy". Ngày bắt đầu HK theo lịch UEH (dự kiến) – sửa tại đây khi có lịch chính thức */
const FBDP_TERMS = [
  { code: 'HKC2026', start: '2026-07-06', end: '2026-12-27' },
  { code: 'HKĐ2027', start: '2027-01-04', end: '2027-06-27' },
  { code: 'HKC2027', start: '2027-07-05', end: '2027-12-26' },
]
const AF_TERMS = [
  { code: 'Phase 1', start: '2026-06-01', end: '2026-09-27' },
  { code: 'Phase 2', start: '2026-09-28', end: '2026-12-27' },
  { code: 'Phase 3', start: '2027-03-01', end: '2027-07-25' },
]
export const COHORT_TERMS = {
  K50: FBDP_TERMS, K51: FBDP_TERMS,
  K52: [
    { code: 'HK1 (HKC2026)', start: '2026-09-07', end: '2026-12-27' },
    { code: 'HK2 (HKĐ2027)', start: '2027-01-04', end: '2027-06-27' },
    { code: 'HK3 (HKC2027)', start: '2027-07-05', end: '2027-12-26' },
  ],
  AF003: AF_TERMS, AF004: AF_TERMS, AF005: AF_TERMS,
}
export function termWeek(cohort, date) {
  const t = (COHORT_TERMS[cohort] || []).find((x) => date >= x.start && date <= x.end)
  if (!t) return null
  return { term: t.code, week: Math.floor(dayDiff(t.start, date) / 7) + 1 }
}

/* Các đợt giảng Rennes đề xuất cho năm học 2026–2027 (cả 2 chương trình) */
export const TEACHING_PLAN = [
  { cohorts: ['K50', 'K51'], course: 'Tiền tệ, ngân hàng và thị trường tài chính', en: 'Money, Banking & Financial Markets', lecturer: 'Jean-Christophe Poutineau', from: '2026-07-27', to: '2026-08-01', phase: 'Phase 1', status: 'Đã dạy' },
  { cohorts: ['K50', 'K51'], course: 'Kinh tế vĩ mô', en: 'Macroeconomics', lecturer: 'Christophe Tavera', from: '2026-08-24', to: '2026-08-29', phase: 'Phase 1', status: 'Đã dạy' },
  { cohorts: ['K50', 'K51'], course: 'Kinh tế lượng chuỗi thời gian', en: 'Econometrics of Time Series', lecturer: 'Christophe Tavera', from: '2026-11-02', to: '2026-11-07', phase: 'Phase 2' },
  { cohorts: ['K50', 'K51'], course: 'Sản phẩm phái sinh', en: 'Derivatives', lecturer: 'Franck Martin', from: '2026-11-30', to: '2026-12-05', phase: 'Phase 2' },
  { cohorts: ['K50', 'K51'], course: 'Tài chính quốc tế', en: 'International Finance', lecturer: 'Fabien Rondeau', from: '2026-12-07', to: '2026-12-12', phase: 'Phase 2' },
  { cohorts: ['K50', 'K51'], course: 'Kinh tế lượng dữ liệu bảng', en: 'Panel Data Econometrics', lecturer: 'Tovonony Razafindrabe', from: '2027-05-03', to: '2027-05-08', phase: 'Phase 3' },
  { cohorts: ['K50', 'K51'], course: 'Kinh tế lượng tài chính và mô hình hóa tài chính', en: 'Financial Econometrics & Modelling', lecturer: 'Franck Martin', from: '', to: '', phase: 'Phase 3', when: '05–06/2027 (chưa chốt ngày)' },
  { cohorts: ['AF004'], course: 'Money, Banking & Financial Markets', en: 'Money, Banking & Financial Markets', lecturer: 'Jean-Christophe Poutineau', from: '2026-07-26', to: '2026-08-28', phase: 'Phase 1' },
  { cohorts: ['AF003', 'AF004'], course: 'Introduction to R', en: 'Introduction to R', lecturer: 'Fabien Rondeau', from: '2026-09-20', to: '2026-09-27', phase: 'Phase 1' },
  { cohorts: ['AF004'], course: 'Econometrics of Time Series', en: 'Econometrics of Time Series', lecturer: 'Christophe Tavera', from: '2026-10-26', to: '2026-10-31', phase: 'Phase 2' },
  { cohorts: ['AF003'], course: 'Applied Microeconomics', en: 'Applied Microeconomics', lecturer: 'Benjamin', from: '2026-11-23', to: '2026-11-28', phase: 'Phase 2' },
  { cohorts: ['AF003'], course: 'Advanced Forecasting Methods', en: 'Advanced Forecasting Methods', lecturer: 'Christophe Tavera', from: '2026-12-07', to: '2026-12-12', phase: 'Phase 2' },
  { cohorts: ['AF004'], course: 'Macroeconomic 2', en: 'Macroeconomic 2', lecturer: 'Fabien Rondeau', from: '2026-12-12', to: '2026-12-20', phase: 'Phase 2' },
  { cohorts: ['AF004'], course: 'Microeconomic 2', en: 'Microeconomic 2', lecturer: 'Penard', from: '', to: '', phase: 'Phase 3', when: '03–07/2027' },
  { cohorts: ['AF004'], course: 'Financial Econometrics & Modelling', en: 'Financial Econometrics & Modelling', lecturer: 'Franck Martin', from: '', to: '', phase: 'Phase 3', when: '03–07/2027' },
  { cohorts: ['AF005'], course: 'Money, Banking & Financial Markets', en: 'Money, Banking & Financial Markets', lecturer: 'Jean-Christophe Poutineau', from: '', to: '', phase: 'Phase 3', when: '03–07/2027' },
  { cohorts: ['AF005'], course: 'Financial Market', en: 'Financial Market', lecturer: 'Franck Martin', from: '', to: '', phase: 'Phase 3', when: '03–07/2027' },
  { cohorts: ['AF004'], course: 'Introduction to Python', en: 'Introduction to Python', lecturer: '', from: '', to: '', phase: 'Phase 3', when: '03–07/2027' },
].map((p, i) => ({ id: 'tp' + i, ...p }))

/* K52 – 7 học phần do GV Rennes giảng theo CTĐT DHCQK52FBDPS (file K52_UIS-ChuongTrinhDaoTao_FBDPS.xls) */
export const K52_RENNES_PLAN = [
  { code: 'FIN505199', course: 'Kinh tế vĩ mô', hk: 'HK02', term: 'HKĐ2027', from: '2027-01-04', to: '2027-06-27', credits: 3 },
  { code: 'FIN505202', course: 'Tiền tệ, ngân hàng và thị trường tài chính', hk: 'HK03', term: 'HKC2027', from: '2027-07-05', to: '2027-12-26', credits: 3 },
  { code: 'FIN505204', course: 'Kinh tế lượng chuỗi thời gian', hk: 'HK04', term: 'HKĐ2028', from: '2028-01-03', to: '2028-06-25', credits: 3 },
  { code: 'FIN505200', course: 'Tài chính quốc tế', hk: 'HK04', term: 'HKĐ2028', from: '2028-01-03', to: '2028-06-25', credits: 3 },
  { code: 'FIN505201', course: 'Sản phẩm phái sinh', hk: 'HK05', term: 'HKC2028', from: '2028-07-03', to: '2028-12-24', credits: 3 },
  { code: 'FIN505203', course: 'Kinh tế lượng dữ liệu bảng', hk: 'HK05', term: 'HKC2028', from: '2028-07-03', to: '2028-12-24', credits: 3 },
  { code: 'FIN505205', course: 'Kinh tế lượng tài chính và mô hình chuỗi tài chính', hk: 'HK06', term: 'HKĐ2029', from: '2029-01-01', to: '2029-06-24', credits: 3 },
]
/* K52 – học phần HK01 (HKC2026) theo CTĐT chính thức */
export const K52_HK1 = [
  ['ACC507069', 'Nguyên lý kế toán', 3], ['ECO501097', 'Kinh tế vi mô', 3], ['BUS503272', 'Nhập môn tâm lý học', 2],
  ['LAW511070', 'Luật kinh doanh', 3], ['MAT508133', 'Toán ứng dụng', 3], ['PHI510023', 'Triết học Mác – Lênin', 3],
]

/* Khóa của 1 buổi học (từ nhóm lớp / tên lớp) */
export function sessionCohorts(s) {
  const t = `${s.teachingGroup || ''} ${s.className || ''}`
  const out = ['K50', 'K51', 'K52', 'AF003', 'AF004', 'AF005'].filter((c) => t.includes(c))
  return out.length ? out : (/K50.?K51|K50–K51/.test(t) ? ['K50', 'K51'] : [])
}

/* Các khóa 1 đoàn công tác dạy: từ buổi học thực tế + kế hoạch đề xuất cùng GV trùng thời gian */
export function tripCohortCoverage(trip, items) {
  const w = tripWindow(trip)
  const rows = []
  items.filter((s) => s.module === 'sessions' && sameName(s.lecturer, trip.lecturer) && inWin(s.date, w)).forEach((s) => {
    sessionCohorts(s).forEach((c) => rows.push({ cohort: c, course: s.course, date: s.date, src: 'session' }))
  })
  const covered = new Set(rows.map((r) => r.cohort + '|' + courseKey(r.course)))
  TEACHING_PLAN.filter((p) => p.from && sameName(p.lecturer, trip.lecturer) && p.from <= w.to && p.to >= w.from).forEach((p) => {
    p.cohorts.forEach((c) => { if (!covered.has(c + '|' + courseKey(p.course)) && !rows.some((r) => r.cohort === c && sameCourse(r.course, p.course))) rows.push({ cohort: c, course: p.course, date: p.from > w.from ? p.from : w.from, src: 'plan', plan: p }) })
  })
  const by = {}
  rows.forEach((r) => {
    const o = (by[r.cohort] ||= { cohort: r.cohort, courses: new Set(), first: r.date, src: r.src })
    o.courses.add(r.course)
    if (r.date < o.first) o.first = r.date
    if (r.src === 'session') o.src = 'session'
  })
  const cov = Object.values(by).map((o) => ({ ...o, courses: [...o.courses], tw: termWeek(o.cohort, o.first) }))
  // đợt giảng cùng GV sát chuyến (≤ 10 ngày) → gợi ý kéo dài chuyến để dạy thêm khóa
  const near = TEACHING_PLAN.filter((p) => p.from && sameName(p.lecturer, trip.lecturer) && !(p.from <= w.to && p.to >= w.from))
    .map((p) => ({ plan: p, gap: p.from > w.to ? dayDiff(w.to, p.from) : dayDiff(p.to, w.from) }))
    .filter((x) => x.gap > 0 && x.gap <= 10)
  return { window: w, cohorts: cov.sort((a, b) => COHORTS.findIndex((c) => c.id === a.cohort) - COHORTS.findIndex((c) => c.id === b.cohort)), near }
}
