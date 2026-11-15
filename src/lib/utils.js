export const STATUSES = [
  { id: 'todo', label: 'Chưa bắt đầu', short: 'Cần làm', color: '#64748b', bg: '#eef2f6', chart: '#c9d3dc' },
  { id: 'doing', label: 'Đang thực hiện', short: 'Đang làm', color: '#03616a', bg: '#e1f1f2', chart: '#6fb3b9' },
  { id: 'review', label: 'Chờ duyệt', short: 'Chờ duyệt', color: '#c25f1c', bg: '#fcebdc', chart: '#f2b07e' },
  { id: 'done', label: 'Hoàn thành', short: 'Xong', color: '#1e8a4c', bg: '#e2f4e9', chart: '#8fd0a8' },
]
export const STATUS = Object.fromEntries(STATUSES.map((s) => [s.id, s]))

export const PRIORITIES = [
  { id: 'low', label: 'Thấp', color: '#64748b' },
  { id: 'medium', label: 'Trung bình', color: '#0b7480' },
  { id: 'high', label: 'Cao', color: '#d4712f' },
  { id: 'urgent', label: 'Khẩn', color: '#c62828' },
]
export const PRIORITY = Object.fromEntries(PRIORITIES.map((p) => [p.id, p]))

export const DEFAULT_CATEGORIES = [
  { id: 'c01', no: '01', name: 'Quản trị chương trình, hành chính và văn bản', icon: 'FileText' },
  { id: 'c02', no: '02', name: 'Quản lý khóa và hồ sơ sinh viên', icon: 'Users' },
  { id: 'c03', no: '03', name: 'Kế hoạch đào tạo và lịch giảng', icon: 'CalendarDays' },
  { id: 'c04', no: '04', name: 'Khảo thí, chuyển đổi điểm và tốt nghiệp', icon: 'GraduationCap' },
  { id: 'c05', no: '05', name: 'Giảng viên, đợt công tác và hợp đồng', icon: 'Presentation' },
  { id: 'c06', no: '06', name: 'Hậu cần giảng viên Rennes', icon: 'Plane' },
  { id: 'c07', no: '07', name: 'Học phí và thanh toán cho Rennes', icon: 'Coins' },
  { id: 'c08', no: '08', name: 'Chi phí vận hành và quyết toán tài chính', icon: 'Calculator' },
  { id: 'c09', no: '09', name: 'Công tác sinh viên, truyền thông và đảm bảo chất lượng', icon: 'MessagesSquare' },
  { id: 'c10', no: '10', name: 'Quản trị dữ liệu, báo cáo và kiểm soát tiến độ', icon: 'BarChart3' },
]

export const DEFAULT_TAGS = [
  { id: 'tg1', name: 'Rennes', color: '#03616a' },
  { id: 'tg2', name: 'Văn bản', color: '#2563eb' },
  { id: 'tg3', name: 'Tài chính', color: '#d4712f' },
  { id: 'tg4', name: 'Cần ký duyệt', color: '#c62828' },
  { id: 'tg5', name: 'Sinh viên', color: '#16a34a' },
  { id: 'tg6', name: 'Định kỳ', color: '#7c3aed' },
]
export const TAG_COLORS = ['#03616a', '#d4712f', '#2563eb', '#16a34a', '#7c3aed', '#c62828', '#ca8a04', '#db2777', '#0891b2', '#64748b']

export const genCode = () => {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const r = crypto.getRandomValues(new Uint32Array(8))
  return Array.from(r, (x) => A[x % A.length]).join('').replace(/^(.{4})/, '$1-')
}

export const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

export const todayStr = () => toISODate(new Date())
export const toISODate = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const addDays = (n, base = new Date()) => {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}
export const daysUntil = (dateStr) => {
  if (!dateStr) return null
  const a = new Date(todayStr() + 'T00:00:00')
  const b = new Date(dateStr + 'T00:00:00')
  return Math.round((b - a) / 86400000)
}
export const fmtDate = (s) => {
  if (!s) return '—'
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}
export const fmtShort = (s) => {
  if (!s) return '—'
  const [, m, d] = s.split('-')
  return `${d}/${m}`
}
export const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'vừa xong'
  if (diff < 3600) return Math.floor(diff / 60) + ' phút trước'
  if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước'
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + ' ngày trước'
  const d = new Date(iso)
  return fmtDate(toISODate(d))
}

export const isOverdue = (t) => t.status !== 'done' && t.dueDate && daysUntil(t.dueDate) < 0
export const isDueSoon = (t, n = 3) => {
  if (t.status === 'done' || !t.dueDate) return false
  const d = daysUntil(t.dueDate)
  return d >= 0 && d <= n
}

export const deadlineLabel = (t) => {
  if (!t.dueDate) return { text: 'Chưa có hạn', tone: 'muted' }
  if (t.status === 'done') return { text: fmtDate(t.dueDate), tone: 'muted' }
  const d = daysUntil(t.dueDate)
  if (d < 0) return { text: `Quá hạn ${-d} ngày`, tone: 'danger' }
  if (d === 0) return { text: 'Hạn hôm nay', tone: 'warn' }
  if (d === 1) return { text: 'Hạn ngày mai', tone: 'warn' }
  if (d <= 3) return { text: `Còn ${d} ngày`, tone: 'warn' }
  return { text: fmtDate(t.dueDate), tone: 'normal' }
}

export const initials = (name = '') => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const progressOf = (tasks) => {
  if (!tasks.length) return 0
  return Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)
}

export const normalize = (s = '') =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

export const cx = (...a) => a.filter(Boolean).join(' ')

/* Sắp xếp theo độ gấp: deadline gần → xa; cùng ngày thì ưu tiên Khẩn → Cao → TB → Thấp; chưa có hạn & đã xong xuống cuối */
const PR_RANK = { urgent: 0, high: 1, medium: 2, low: 3 }
export const urgencyCmp = (dueOf = (t) => t.dueDate) => (a, b) =>
  (a.status === 'done') - (b.status === 'done') ||
  (dueOf(a) || '9999-99-99').localeCompare(dueOf(b) || '9999-99-99') ||
  (PR_RANK[a.priority] ?? 2) - (PR_RANK[b.priority] ?? 2) ||
  (a.title || '').localeCompare(b.title || '', 'vi')
export const byUrgency = urgencyCmp()
