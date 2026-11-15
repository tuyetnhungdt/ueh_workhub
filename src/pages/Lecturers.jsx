import { useMemo, useState } from 'react'
import * as L from 'lucide-react'
import { useStore, visibleProjects, projectRole } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { useToast, Empty } from '../components/ui.jsx'
import { MODULE, tripCalc, prefsText, sameName } from '../modules/schema.js'
import { ItemForm, FilePreview, Pill, money, newItem } from '../modules/Workspace.jsx'
import { openFile, isPdf, isImage, uploadFile, removeFile, fmtSize } from '../modules/io.js'
import { cx, fmtDate, initials, normalize, toISODate, todayStr, daysUntil } from '../lib/utils.js'

const M = MODULE.lecturers
const COLORS = ['#0b7480', '#d4712f', '#7c3aed', '#2563eb', '#16a34a', '#db2777', '#ca8a04', '#64748b']
const fmtDT = (s) => (s ? `${fmtDate(s.slice(0, 10))} ${s.slice(11, 16)}` : '—')
const eur = (n) => '€ ' + (+n || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })
const hoursOf = (s) => { if (!s.start || !s.end) return 0; const [a, b] = s.start.split(':').map(Number); const [c, d] = s.end.split(':').map(Number); return (c * 60 + d - a * 60 - b) / 60 }

function formatLecturerNameWithTitle(l) {
  if (!l) return ''
  const name = (l.fullName || '').trim()
  if (/^(Prof\.|Dr\.|TS\.|ThS\.|PGS\.|GS\.)/i.test(name)) {
    return name
  }
  const title = (l.academicTitle || l.degree || '').trim()
  if (title.includes('GS') || title.includes('Giáo sư')) return `GS. ${name}`
  if (title.includes('PGS') || title.includes('Phó Giáo sư')) return `PGS. ${name}`
  if (title.includes('Tiến sĩ') || title.includes('TS')) return `TS. ${name}`
  if (title.includes('Thạc sĩ') || title.includes('ThS')) return `ThS. ${name}`
  return name
}

export default function Lecturers({ projectId }) {
  const { state, me, saveItem, deleteItems } = useStore()
  const { go } = useUI()
  const toast = useToast()
  const projects = visibleProjects(state, me).filter((p) => !projectId || p.id === projectId)
  const proj = projectId && projects[0]
  const pids = new Set(projects.map((p) => p.id))
  const items = state.items.filter((x) => pids.has(x.projectId))
  const lecs = items.filter((x) => x.module === 'lecturers').sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''))
  const [side, setSide] = useState('')
  const [q, setQ] = useState('')
  const [cur, setCur] = useState(() => lecs.find((l) => l.side === 'Rennes')?.id || lecs[0]?.id)
  const [tab, setTab] = useState('profile')
  const [edit, setEdit] = useState(null)
  const [hidden, setHidden] = useState([])
  const [focusedLecId, setFocusedLecId] = useState(null)
  const [view, setView] = useState('profile') // 'profile' | 'schedule'
  const colorOf = (id) => COLORS[Math.max(0, lecs.findIndex((x) => x.id === id)) % COLORS.length]
  const list = lecs.filter((l) => (!side || l.side === side) && (!q || normalize(`${l.fullName} ${l.courses} ${l.email}`).includes(normalize(q))))
  const l = lecs.find((x) => x.id === cur) || list[0]
  const project = l && state.projects.find((p) => p.id === l.projectId)
  const isMgr = project && projectRole(project, me) === 'manager'
  const users = (project?.members || []).map((m) => state.users.find((u) => u.id === m.userId)).filter(Boolean)
  const sessionsOf = (x) => items.filter((s) => s.module === 'sessions' && sameName(s.lecturer, x.fullName))
  const tripsOf = (x) => items.filter((t) => t.module === 'trips' && sameName(t.lecturer, x.fullName))
  const canAdd = projects.some((p) => projectRole(p, me) === 'manager')

  // Giảng viên hiển thị trên lịch giảng: đồng bộ theo danh sách bên trái
  const focusedLec = focusedLecId ? lecs.find((x) => x.id === focusedLecId) : null
  const activeLecs = useMemo(() => {
    if (focusedLec) return [focusedLec]
    return list.filter((x) => !hidden.includes(x.id))
  }, [focusedLec, list, hidden])

  const totalInScope = side === 'Rennes'
    ? lecs.filter((x) => x.side === 'Rennes').length
    : side === 'UEH'
      ? lecs.filter((x) => x.side === 'UEH').length
      : q.trim()
        ? list.length
        : lecs.length

  const scheduleTitle = useMemo(() => {
    if (activeLecs.length === 1) {
      return `Lịch giảng của ${formatLecturerNameWithTitle(activeLecs[0])}`
    }
    if (side === 'Rennes') return 'Lịch giảng của giảng viên Rennes'
    if (side === 'UEH') return 'Lịch giảng của giảng viên UEH'
    if (q.trim()) return `Lịch giảng theo tìm kiếm: “${q.trim()}”`
    return 'Lịch giảng tổng quan'
  }, [activeLecs, side, q])

  const scheduleSubtitle = useMemo(() => {
    if (activeLecs.length === 1) {
      const gv = activeLecs[0]
      return `${gv.side === 'Rennes' ? 'Đại học Rennes (Pháp)' : 'Trường Đại học Kinh tế TP.HCM (UEH)'} · ${gv.courses || 'Giảng viên'}`
    }
    if (side === 'Rennes') return `${activeLecs.length}/${totalInScope} giảng viên Rennes · bấm biểu tượng con mắt ở ô tên để ẩn/hiện`
    if (side === 'UEH') return `${activeLecs.length}/${totalInScope} giảng viên UEH · bấm biểu tượng con mắt ở ô tên để ẩn/hiện`
    if (q.trim()) return `${activeLecs.length}/${totalInScope} giảng viên phù hợp · bấm biểu tượng con mắt ở ô tên để ẩn/hiện`
    return `${activeLecs.length}/${totalInScope} giảng viên · bấm biểu tượng con mắt ở ô tên để ẩn/hiện`
  }, [activeLecs, side, q, totalInScope])

  const save = (d) => { saveItem(d.projectId || project?.id || projects[0].id, 'lecturers', d, `hồ sơ giảng viên “${d.fullName}”`); toast('Đã lưu hồ sơ'); setEdit(null) }

  return (
    <>
      <div className="row between wrap" style={{ marginBottom: 14, gap: 10 }}>
        <div><h2 style={{ fontSize: 20 }}>Hồ sơ giảng viên{proj ? ' – ' + proj.name : ''}</h2><div className="muted small">Danh sách giảng viên Đại học Rennes & UEH tham gia chương trình – hồ sơ, học phần, lịch giảng, syllabus, chuyến công tác.</div></div>
        {canAdd && <button className="btn primary" onClick={() => setEdit({ ...newItem(M), side: 'Rennes', projectId: projects.find((p) => projectRole(p, me) === 'manager').id })}><L.UserPlus size={16} />Thêm giảng viên</button>}
      </div>
      {!lecs.length ? <div className="card"><Empty icon="Presentation" text="Chưa có giảng viên nào." /></div> : (
        <div className="lec-layout">
          {/* ---- danh sách GV ---- */}
          <aside className="card lec-list">
            <div className="lec-tools" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="search sm"><L.Search size={15} /><input className="input" placeholder="Tìm tên, học phần…" value={q} onChange={(e) => { setQ(e.target.value); setFocusedLecId(null) }} /></div>
              <select className="select sm" value={side} onChange={(e) => { setSide(e.target.value); setFocusedLecId(null) }}>
                <option value="">Tất cả trường ({lecs.length})</option>
                <option value="Rennes">Đại học Rennes ({lecs.filter(x => x.side === 'Rennes').length})</option>
                <option value="UEH">UEH ({lecs.filter(x => x.side === 'UEH').length})</option>
              </select>
            </div>
            {list.map((x) => {
              const open = (x.docs || []).filter((c) => !c.done).length
              const isSelected = view === 'schedule' ? (focusedLecId ? focusedLecId === x.id : false) : (l?.id === x.id)
              return (
                <button
                  key={x.id}
                  className={cx(
                    'lec-item',
                    isSelected && 'on',
                    view === 'schedule' && hidden.includes(x.id) && 'off'
                  )}
                  onClick={() => {
                    if (view === 'schedule') {
                      setFocusedLecId(focusedLecId === x.id ? null : x.id)
                    } else {
                      setCur(x.id)
                      setView('profile')
                    }
                  }}
                  style={{ '--lc': colorOf(x.id) }}
                >
                  <span className="lec-av" style={{ background: colorOf(x.id) }}>{initials(x.fullName.replace(/^(Prof\.|Dr\.|TS\.|ThS\.|PGS\.|GS\.)\s*/, ''))}</span>
                  <span className="grow" style={{ minWidth: 0 }}>
                    <div className="row between" style={{ gap: 4 }}>
                      <b className="ellipsis">{x.fullName}</b>
                      <span className="badge" style={{ fontSize: 9.5, padding: '1px 5px', background: x.side === 'Rennes' ? 'rgba(212, 113, 47, 0.12)' : 'var(--teal-100)', color: x.side === 'Rennes' ? '#b45309' : 'var(--teal-800)' }}>
                        {x.side === 'Rennes' ? 'UR' : 'UEH'}
                      </span>
                    </div>
                    <span className="small muted ellipsis" style={{ display: 'block' }}>{x.courses || '—'}</span>
                  </span>
                  {open > 0 && <span className="lec-badge" title={`${open} giấy tờ còn thiếu`}>{open}</span>}
                  {view === 'schedule' && <span role="button" tabIndex={0} className="eye" title={hidden.includes(x.id) ? 'Hiện trên lịch' : 'Ẩn khỏi lịch'}
                    onClick={(e) => { e.stopPropagation(); setHidden(hidden.includes(x.id) ? hidden.filter((i) => i !== x.id) : [...hidden, x.id]) }}>
                    {hidden.includes(x.id) ? <L.EyeOff size={15} /> : <L.Eye size={15} />}
                  </span>}
                </button>
              )
            })}
            {!list.length && <div className="empty small">Không tìm thấy</div>}
            <button className={cx('btn', 'lec-cal-btn', view === 'schedule' ? 'primary' : '')} onClick={() => setView(view === 'schedule' ? 'profile' : 'schedule')}>
              <L.CalendarDays size={16} />{view === 'schedule' ? 'Đóng lịch giảng tổng quan' : 'Lịch giảng tổng quan'}
            </button>
          </aside>

          {/* ---- lịch giảng tổng quan: chỉ mở khi bấm nút ---- */}
          {view === 'schedule' && (
            <section className="lec-main">
              <Schedule
                lecs={activeLecs}
                total={totalInScope}
                title={scheduleTitle}
                subtitle={scheduleSubtitle}
                focusedLec={focusedLec}
                totalInList={list.length}
                onClearFocus={() => setFocusedLecId(null)}
                sessionsOf={sessionsOf}
                colorOf={colorOf}
              />
            </section>
          )}

          {/* ---- chi tiết ---- */}
          {view === 'profile' && l && (
            <section className="lec-main">
              <div className="card lec-head">
                <span className="lec-av lg" style={{ background: l.side === 'Rennes' ? '#d4712f' : '#03616a' }}>{initials(l.fullName.replace(/^(Prof\.|Dr\.|TS\.|ThS\.|PGS\.|GS\.)\s*/, ''))}</span>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="row wrap" style={{ gap: 8 }}><h2 style={{ fontSize: 20 }}>{l.fullName}</h2><span className="chip">{l.side === 'Rennes' ? 'Université de Rennes' : 'UEH'}</span><Pill v={l.contractStatus} />{l.side === 'Rennes' && <Pill v={l.gradesSent} />}</div>
                  <div className="small muted" style={{ marginTop: 4 }}>{[l.academicTitle, l.specialization].filter(Boolean).join(' · ')}</div>
                  <div className="row wrap small" style={{ gap: 14, marginTop: 6 }}>
                    {l.email && <a href={'mailto:' + l.email}><L.Mail size={13} style={{ verticalAlign: -2 }} /> {l.email}</a>}
                    {l.phone && <a href={'tel:' + l.phone.replace(/\s/g, '')}><L.Phone size={13} style={{ verticalAlign: -2 }} /> {l.phone}</a>}
                  </div>
                  {prefsText(l) && <div className="pref-line"><L.Utensils size={14} />{prefsText(l)}</div>}
                </div>
                <div className="row" style={{ gap: 8, alignSelf: 'flex-start' }}>
                  <button className="btn" onClick={() => setEdit(l)}><L.Pencil size={15} />Sửa hồ sơ</button>
                </div>
              </div>

              <div className="tabs" style={{ marginTop: 12 }}>
                {[['profile', 'Hồ sơ', 'IdCard'], ['courses', 'Học phần & syllabus', 'BookOpen'], ['trips', 'Chuyến công tác & vé', 'Plane'], ['prefs', 'Yêu cầu đặc biệt', 'Utensils']].map(([k, t, ic]) => {
                  const C = L[ic]
                  const n = k === 'trips' ? tripsOf(l).length : null
                  return <button key={k} className={cx('tab', tab === k && 'active')} onClick={() => setTab(k)}><C size={15} />{t}{n ? <span className="n">{n}</span> : null}</button>
                })}
              </div>

              {tab === 'profile' && <Profile l={l} onEdit={() => setEdit(l)} onSave={save} projectId={l.projectId || project?.id} />}
              {tab === 'courses' && <Courses l={l} sessions={sessionsOf(l)} onSave={save} projectId={l.projectId || project?.id} />}
              {tab === 'trips' && <Trips l={l} trips={tripsOf(l)} goWork={(t) => go(`/projects/${t.projectId}/work/trips`)} />}
              {tab === 'prefs' && <Prefs key={l.id} l={l} onSave={save} />}
            </section>
          )}
        </div>
      )}
      {edit && (
        <ItemForm project={state.projects.find((p) => p.id === (edit.projectId || project?.id)) || projects[0]} m={M} item={edit} users={users} isMgr={isMgr}
          allItems={items} onClose={() => setEdit(null)} onSave={save}
          onDelete={() => { deleteItems(edit.projectId, [edit.id], `xóa hồ sơ giảng viên “${edit.fullName}”`); setEdit(null) }} />
      )}
    </>
  )
}

/* ---------- Hồ sơ ---------- */
function Profile({ l, onEdit, onSave, projectId }) {
  const toast = useToast()
  const files = [...(l.files || [])]
  const [pv, setPv] = useState(files.findIndex((f) => isPdf(f) || isImage(f)))
  const [uploading, setUploading] = useState(false)
  const Row = ({ k, v }) => <div className="kv-row"><span>{k}</span><b>{v || <span className="faint">—</span>}</b></div>
  const ck = l.docs || []

  const handleUploadFiles = async (fileList) => {
    if (!fileList || !fileList.length) return
    setUploading(true)
    try {
      const up = []
      for (const file of fileList) {
        up.push(await uploadFile(projectId || l.projectId || 'p1', file))
      }
      const updatedFiles = [...files, ...up]
      onSave({ ...l, files: updatedFiles })
      toast(`Đã tải lên ${up.length} tài liệu thành công`)
    } catch (err) {
      toast(err.message || 'Lỗi khi tải file')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = (idx) => {
    if (!confirm('Xác nhận gỡ bỏ tài liệu này?')) return
    const updatedFiles = files.filter((_, i) => i !== idx)
    onSave({ ...l, files: updatedFiles })
    if (pv === idx) setPv(-1)
    toast('Đã gỡ tài liệu')
  }

  return (
    <div className="lec-grid">
      <div className="card card-pad">
        <h4 className="lec-h"><L.User size={16} />Thông tin cá nhân</h4>
        <Row k="Ngày sinh" v={l.dob && fmtDate(l.dob)} />
        <Row k="Học hàm/học vị" v={l.academicTitle} />
        <Row k="Chuyên môn" v={l.specialization} />
        <Row k="Địa chỉ" v={l.address} />
        <Row k="Hộ chiếu" v={[l.passport, l.passportIssued].filter(Boolean).join(' · ')} />
      </div>
      <div className="card card-pad">
        <h4 className="lec-h"><L.FileSignature size={16} />Hợp đồng & thanh toán</h4>
        <Row k="Số HĐ" v={l.contractNo} />
        <Row k="Thời hạn" v={l.contractFrom && `${fmtDate(l.contractFrom)} → ${fmtDate(l.contractTo)}`} />
        <Row k="Trạng thái" v={<Pill v={l.contractStatus} />} />
        <Row k="Thù lao/giờ" v={l.rateEur ? eur(l.rateEur) : ''} />
        <Row k="Tài khoản" v={l.bankAccount} />
        <Row k="Ngân hàng" v={l.bankName} />
        <Row k="MST TNCN" v={l.taxCode || (l.side === 'Rennes' ? 'Chưa có MST tại Việt Nam' : '')} />
      </div>
      <div className="card card-pad">
        <h4 className="lec-h"><L.ListChecks size={16} />Giấy tờ cần có ({ck.filter((c) => c.done).length}/{ck.length})</h4>
        {ck.map((c, i) => <div key={i} className={cx('ck-ro', c.done && 'done')}>{c.done ? <L.CheckCircle2 size={16} /> : <L.Circle size={16} />}<span>{c.text}</span></div>)}
        {!ck.length && <div className="faint small">Chưa có checklist</div>}
        <button className="btn sm" style={{ marginTop: 10 }} onClick={onEdit}><L.Pencil size={13} />Cập nhật</button>
      </div>
      <div className="card card-pad wide">
        <div className="row between wrap" style={{ gap: 10, marginBottom: 12 }}>
          <h4 className="lec-h" style={{ margin: 0 }}><L.Paperclip size={16} />Tài liệu (CV, bằng cấp, hợp đồng…)</h4>
          <label className={cx('btn sm primary', uploading && 'busy')} style={{ cursor: 'pointer', gap: 6 }}>
            <L.Upload size={14} />
            {uploading ? 'Đang tải lên…' : 'Tải tài liệu lên'}
            <input
              type="file"
              multiple
              hidden
              disabled={uploading}
              onChange={(e) => {
                handleUploadFiles(Array.from(e.target.files))
                e.target.value = ''
              }}
            />
          </label>
        </div>

        {files.length ? files.map((f, i) => (
          <div key={i} className={cx('fileitem-wrap', pv === i && 'open')} style={{ marginBottom: 6 }}>
            <div className="fileitem">
              <L.FileText size={16} color={isPdf(f) ? '#c62828' : 'var(--teal-700)'} />
              <span className="grow ellipsis">{f.name}</span>
              {f.size && <span className="faint small">{fmtSize(f.size)}</span>}
              {(isPdf(f) || isImage(f)) && (
                <button
                  type="button"
                  className={cx('btn sm', pv === i ? 'primary' : 'ghost')}
                  onClick={() => setPv(pv === i ? -1 : i)}
                >
                  {pv === i ? <L.EyeOff size={14} /> : <L.Eye size={14} />}
                  {pv === i ? 'Ẩn' : 'Xem trước'}
                </button>
              )}
              <button
                type="button"
                className="iconbtn"
                onClick={() => openFile(f).catch((e) => toast(e.message))}
                title="Mở trong tab mới"
              >
                <L.ExternalLink size={14} />
              </button>
              <button
                type="button"
                className="iconbtn"
                onClick={() => handleRemoveFile(i)}
                title="Gỡ file này"
              >
                <L.Trash2 size={14} />
              </button>
            </div>
            {pv === i && <FilePreview file={f} height={460} />}
          </div>
        )) : (
          <div className="faint small" style={{ padding: '16px 0', textAlign: 'center', background: '#f8fafc', borderRadius: 8 }}>
            Chưa có tài liệu đính kèm. Bấm nút <b>“Tải tài liệu lên”</b> ở trên hoặc <b>“Sửa hồ sơ”</b> để thêm file.
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Học phần & syllabus ---------- */
function Courses({ l, sessions, onSave, projectId }) {
  const toast = useToast()
  const [uploading, setUploading] = useState(false)
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all')

  // Nhóm các buổi học theo học phần
  const groups = Object.values(sessions.reduce((a, s) => {
    const k = s.course + '|' + (s.className || '')
    ;(a[k] ||= { course: s.course, cls: s.className, list: [] }).list.push(s)
    return a
  }, {}))

  // Danh sách các học phần giảng viên phụ trách (kết hợp khai báo hồ sơ + lịch thực tế)
  const declaredCourses = useMemo(() => {
    return (l.courses || '')
      .split(/[,;·\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }, [l.courses])

  const sessionCourses = useMemo(() => {
    return Array.from(new Set(sessions.map((s) => (s.course || '').trim()).filter(Boolean)))
  }, [sessions])

  const allCourses = useMemo(() => {
    const combined = [...new Set([...declaredCourses, ...sessionCourses])]
    return combined.length ? combined : ['Học phần chuyên ngành UEH (1 môn)']
  }, [declaredCourses, sessionCourses])

  const syl = l.syllabi || []
  const [pv, setPv] = useState(syl.length ? 0 : -1)

  // Khớp file syllabus với học phần
  const getFileCourse = (f) => {
    if (f.course) return f.course
    const match = allCourses.find((c) =>
      f.name.toLowerCase().includes(c.toLowerCase()) || normalize(f.name).includes(normalize(c))
    )
    return match || allCourses[0]
  }

  // Tải syllabus trực tiếp cho một học phần cụ thể
  const handleUploadSyllabus = async (fileList, targetCourse) => {
    if (!fileList || !fileList.length) return
    setUploading(true)
    try {
      const up = []
      for (const file of fileList) {
        const uploaded = await uploadFile(projectId || l.projectId || 'p1', file)
        up.push({ ...uploaded, course: targetCourse || allCourses[0] })
      }
      const updatedSyllabi = [...syl, ...up]
      onSave({ ...l, syllabi: updatedSyllabi })
      toast(`Đã tải lên ${up.length} syllabus cho học phần “${targetCourse || allCourses[0]}”`)
    } catch (err) {
      toast(err.message || 'Lỗi khi tải file')
    } finally {
      setUploading(false)
    }
  }

  // Đổi học phần gắn với syllabus
  const handleUpdateFileCourse = (fileIndex, newCourse) => {
    const updatedSyllabi = [...syl]
    if (updatedSyllabi[fileIndex]) {
      updatedSyllabi[fileIndex] = { ...updatedSyllabi[fileIndex], course: newCourse }
      onSave({ ...l, syllabi: updatedSyllabi })
      toast(`Đã gán syllabus vào môn “${newCourse}”`)
    }
  }

  // Gỡ bỏ syllabus
  const handleRemoveSyllabus = (fileIndex) => {
    if (!confirm('Xác nhận gỡ bỏ syllabus này?')) return
    const updatedSyllabi = syl.filter((_, i) => i !== fileIndex)
    onSave({ ...l, syllabi: updatedSyllabi })
    if (pv === fileIndex) setPv(-1)
    toast('Đã gỡ syllabus')
  }

  // Chuẩn hóa tên khóa: chỉ K50–K51 và K52
  const cohortDisplay = (l.cohorts || 'K50–K51, K52')
    .replace(/\bK50,\s*K51,\s*K52\b/g, 'K50–K51, K52')
    .replace(/\bK50,\s*K51\b/g, 'K50–K51')

  const displayedCourses = selectedCourseFilter === 'all'
    ? allCourses
    : allCourses.filter((c) => c === selectedCourseFilter)

  return (
    <div className="lec-grid">
      {/* Bảng tiến độ học phần phụ trách */}
      <div className="card wide tbl-wrap">
        <div className="card-head">
          <h3>Học phần phụ trách</h3>
          <span className="small muted">Khóa/lớp: {cohortDisplay}</span>
        </div>
        {groups.length ? (
          <table className="tbl">
            <thead>
              <tr>
                <th>Học phần</th>
                <th>Lớp / khóa</th>
                <th>Thời gian</th>
                <th style={{ textAlign: 'right' }}>Số buổi</th>
                <th style={{ textAlign: 'right' }}>Số giờ</th>
                <th>Đã dạy</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const live = g.list.filter((s) => s.status !== 'Hủy').sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                const done = live.filter((s) => s.status === 'Đã dạy').length
                const hrs = live.reduce((x, s) => x + hoursOf(s), 0)
                return (
                  <tr key={g.course + g.cls}>
                    <td data-l="Học phần" className="td-title"><b>{g.course}</b></td>
                    <td data-l="Lớp">{g.cls || '—'}</td>
                    <td data-l="Thời gian">{live.length ? `${fmtDate(live[0].date)} → ${fmtDate(live[live.length - 1].date)}` : '—'}</td>
                    <td data-l="Số buổi" style={{ textAlign: 'right' }}>{live.length}</td>
                    <td data-l="Số giờ" style={{ textAlign: 'right' }}>{hrs.toFixed(1).replace('.0', '')}</td>
                    <td data-l="Đã dạy">
                      <div className="row small" style={{ gap: 6 }}>
                        <div className="progress" style={{ width: 70 }}>
                          <i style={{ width: (live.length ? (done / live.length) * 100 : 0) + '%' }} />
                        </div>
                        {done}/{live.length}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="card-pad faint small">
            Chưa có buổi giảng nào trong lịch. Học phần khai báo: {l.courses || '—'}
          </div>
        )}
      </div>

      {/* Mục Syllabus: phân tách rõ từng học phần */}
      <div className="card card-pad wide">
        <div className="row between wrap" style={{ gap: 10, marginBottom: 12 }}>
          <div>
            <h4 className="lec-h" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
              <L.BookOpen size={16} /> Syllabus từng học phần ({allCourses.length} môn)
            </h4>
            <div className="small muted" style={{ marginTop: 2 }}>
              Mỗi học phần có một file syllabus riêng. Giảng viên phụ trách nhiều môn có thể tải syllabus tương ứng cho từng môn.
            </div>
          </div>

          <label className={cx('btn sm primary', uploading && 'busy')} style={{ cursor: 'pointer', gap: 6 }}>
            <L.Upload size={14} />
            {uploading ? 'Đang tải lên…' : 'Tải lên syllabus'}
            <input
              type="file"
              multiple
              hidden
              disabled={uploading}
              onChange={(e) => {
                const targetCourse = selectedCourseFilter !== 'all' ? selectedCourseFilter : allCourses[0]
                handleUploadSyllabus(Array.from(e.target.files), targetCourse)
                e.target.value = ''
              }}
            />
          </label>
        </div>

        {/* Thanh chọn học phần (Tabs lọc) */}
        {allCourses.length > 1 && (
          <div className="picker" style={{ marginBottom: 14 }}>
            <button
              type="button"
              className={selectedCourseFilter === 'all' ? 'on' : ''}
              onClick={() => setSelectedCourseFilter('all')}
            >
              Tất cả học phần ({allCourses.length})
            </button>
            {allCourses.map((c) => {
              const count = syl.filter((f) => getFileCourse(f) === c).length
              return (
                <button
                  type="button"
                  key={c}
                  className={selectedCourseFilter === c ? 'on' : ''}
                  onClick={() => setSelectedCourseFilter(c)}
                >
                  {c} {count > 0 && <span className="chip" style={{ fontSize: 10, padding: '1px 5px', marginLeft: 4 }}>{count}</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Danh sách từng học phần với syllabus tương ứng */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayedCourses.map((courseName) => {
            const courseFiles = syl
              .map((file, originalIndex) => ({ file, originalIndex }))
              .filter(({ file }) => getFileCourse(file) === courseName)

            return (
              <div
                key={courseName}
                style={{
                  background: '#fcfdfd',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '12px 14px',
                }}
              >
                <div className="row between wrap" style={{ gap: 8, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                  <div className="row" style={{ gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--teal-50)', color: 'var(--teal-800)', display: 'grid', placeItems: 'center' }}>
                      <L.BookOpen size={15} />
                    </div>
                    <div>
                      <b style={{ fontSize: 13.5, color: '#0f172a' }}>{courseName}</b>
                      <span className="small muted" style={{ marginLeft: 8 }}>
                        {courseFiles.length ? `(${courseFiles.length} file syllabus)` : '(Chưa có file)'}
                      </span>
                    </div>
                  </div>

                  <label className="btn sm" style={{ cursor: 'pointer', gap: 5, padding: '3px 10px', fontSize: 12 }}>
                    <L.Upload size={13} />
                    Tải syllabus cho môn này
                    <input
                      type="file"
                      multiple
                      hidden
                      disabled={uploading}
                      onChange={(e) => {
                        handleUploadSyllabus(Array.from(e.target.files), courseName)
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>

                {courseFiles.length ? (
                  courseFiles.map(({ file, originalIndex }) => (
                    <div key={originalIndex} className={cx('fileitem-wrap', pv === originalIndex && 'open')} style={{ marginBottom: 6 }}>
                      <div className="fileitem">
                        <L.FileText size={16} color="#c62828" />
                        <span className="grow ellipsis">{file.name}</span>
                        {file.size && <span className="faint small">{fmtSize(file.size)}</span>}

                        {allCourses.length > 1 && (
                          <select
                            className="select sm"
                            style={{ maxWidth: 170, fontSize: 11.5, padding: '2px 6px', height: 26 }}
                            value={getFileCourse(file)}
                            onChange={(e) => handleUpdateFileCourse(originalIndex, e.target.value)}
                            title="Gán syllabus này sang học phần khác"
                          >
                            {allCourses.map((c) => (
                              <option key={c} value={c}>Môn: {c}</option>
                            ))}
                          </select>
                        )}

                        {(isPdf(file) || isImage(file)) && (
                          <button
                            type="button"
                            className={cx('btn sm', pv === originalIndex ? 'primary' : 'ghost')}
                            onClick={() => setPv(pv === originalIndex ? -1 : originalIndex)}
                          >
                            {pv === originalIndex ? <L.EyeOff size={14} /> : <L.Eye size={14} />}
                            {pv === originalIndex ? 'Ẩn' : 'Xem trước'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="iconbtn"
                          onClick={() => openFile(file).catch((e) => toast(e.message))}
                          title="Mở trong tab mới"
                        >
                          <L.ExternalLink size={14} />
                        </button>
                        <button
                          type="button"
                          className="iconbtn"
                          onClick={() => handleRemoveSyllabus(originalIndex)}
                          title="Gỡ syllabus"
                        >
                          <L.Trash2 size={14} />
                        </button>
                      </div>
                      {pv === originalIndex && <FilePreview file={file} height={460} />}
                    </div>
                  ))
                ) : (
                  <div className="faint small" style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6 }}>
                    Chưa có syllabus đính kèm cho học phần này. Bấm nút <b>“Tải syllabus cho môn này”</b> để tải lên trực tiếp.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------- Lịch giảng theo giảng viên / trường (đồng bộ theo danh sách lọc bên trái) ---------- */
const PROBLEM = ['Hủy', 'Dời lịch']
function Schedule({ lecs, total, title, subtitle, focusedLec, totalInList, onClearFocus, sessionsOf, colorOf }) {
  const [off, setOff] = useState(0)
  const chosen = lecs
  const all = chosen.flatMap((x) => sessionsOf(x).map((s) => ({ ...s, _lec: x })))
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + off)
  const y = base.getFullYear(), mo = base.getMonth()
  const start = new Date(y, mo, 1 - ((new Date(y, mo, 1).getDay() + 6) % 7))
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
  const by = {}; all.forEach((s) => s.date && (by[s.date] ||= []).push(s))
  const upcoming = all.filter((s) => s.date >= todayStr() && s.status !== 'Hủy').sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).slice(0, 12)
  const issues = all.filter((s) => PROBLEM.includes(s.status)).length
  return (
    <div className="card lec-sched">
      <div className="card-head" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, display: 'flex', alignItems: 'center', gap: 7 }}>
            <L.CalendarDays size={18} color="var(--teal-700)" />
            {title}
          </h3>
          <span className="small muted" style={{ marginTop: 2, display: 'block' }}>{subtitle}</span>
        </div>
        {focusedLec && (
          <button className="btn sm" onClick={onClearFocus} style={{ marginLeft: 'auto' }}>
            <L.Users size={14} /> Xem tất cả ({totalInList} GV)
          </button>
        )}
      </div>
      <div className="row between" style={{ padding: '6px 16px 10px' }}>
        <div className="row" style={{ gap: 6 }}>
          <button className="iconbtn" onClick={() => setOff(off - 1)} aria-label="Tháng trước"><L.ChevronLeft size={18} /></button>
          <button className="btn sm" onClick={() => setOff(0)}>Tháng này</button>
          <button className="iconbtn" onClick={() => setOff(off + 1)} aria-label="Tháng sau"><L.ChevronRight size={18} /></button>
          <b style={{ marginLeft: 6, textTransform: 'capitalize' }}>{base.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</b>
        </div>
        <span className="row small muted" style={{ gap: 12 }}><span className="row" style={{ gap: 5 }}><i className="dot-issue" style={{ position: 'static' }} />Có vấn đề (hủy / dời): {issues}</span><span className="row" style={{ gap: 5 }}><i className="lg" style={{ background: '#cfd6d8' }} />Đã qua</span><span>{all.length} buổi</span></span>
      </div>
      <div className="cal">
        {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((d) => <div key={d} className="dow">{d}</div>)}
        {cells.map((d, ci) => {
          const wkEmpty = cells.slice(ci - (ci % 7), ci - (ci % 7) + 7).every((x) => !(by[toISODate(x)] || []).length)
          const iso = toISODate(d)
          const list = (by[iso] || []).sort((a, b) => (a.start || '').localeCompare(b.start || ''))
          return (
            <div key={iso} className={cx('cell', d.getMonth() !== mo && 'out', iso === todayStr() && 'today', wkEmpty && 'wk-empty')}>
              <span className="dn">{d.getDate()}</span>
              {list.map((s) => (
                <div key={s.id} className={cx('ev', 'sess', s.date < todayStr() && 'past', PROBLEM.includes(s.status) && 'issue')} style={{ borderLeftColor: colorOf(s._lec.id), background: colorOf(s._lec.id) + '1f', textDecoration: s.status === 'Hủy' ? 'line-through' : 'none' }}
                  title={`${s._lec.fullName} · ${s.course} · ${s.start}–${s.end} · P.${s.room || '—'}${PROBLEM.includes(s.status) ? ' · ⚠ ' + s.status + (s.note ? ': ' + s.note : '') : ''}`}>
                  {PROBLEM.includes(s.status) && <i className="dot-issue" />}
                  <b>{s.start}</b> {s.course}<div className="sess-sub">{s.room ? 'P.' + s.room : ''}{chosen.length > 1 ? ' · ' + s._lec.fullName.split(' ').slice(-1) : ''}</div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <div className="card-pad">
        <h4 className="lec-h"><L.Clock size={16} />Buổi giảng sắp tới</h4>
        {upcoming.length ? upcoming.map((s) => (
          <div key={s.id} className="up-row">
            <i style={{ background: colorOf(s._lec.id) }} />
            <b style={{ minWidth: 92 }}>{fmtDate(s.date)}</b><span style={{ minWidth: 96 }}>{s.start}–{s.end}</span>
            <span className="grow">{s.course} <span className="faint">· {s.className} · P.{s.room || '—'}{chosen.length > 1 ? ' · ' + s._lec.fullName : ''}</span></span>
            <Pill v={s.status} />
          </div>
        )) : <div className="faint small">Không có buổi nào sắp tới.</div>}
      </div>
    </div>
  )
}

/* ---------- Chuyến công tác & vé ---------- */
function Trips({ l, trips, goWork }) {
  const toast = useToast()
  const [pv, setPv] = useState(null)
  if (!trips.length) return <div className="card"><Empty icon="Plane" text={l.side === 'Rennes' ? 'Chưa có chuyến công tác nào cho giảng viên này.' : 'Giảng viên UEH – không có chuyến công tác.'} /></div>
  return (
    <div className="stack" style={{ gap: 12 }}>
      {trips.sort((a, b) => (b.arriveAt || '').localeCompare(a.arriveAt || '')).map((t) => {
        const c = tripCalc(t)
        return (
          <div key={t.id} className="card card-pad">
            <div className="row between wrap" style={{ gap: 8 }}>
              <div><b style={{ fontSize: 15 }}>{t.course}</b><div className="small muted">{t.className} · giảng {fmtDate(t.teachFrom)} → {fmtDate(t.teachTo)} · {t.teachHours || 0} giờ</div></div>
              <div className="row" style={{ gap: 6 }}><Pill v={t.status} /><Pill v={t.payStatus} /><button className="btn sm" onClick={() => goWork(t)}><L.ArrowRight size={13} />Mở chuyến</button></div>
            </div>
            <div className="trip-legs">
              <div><L.PlaneLanding size={16} color="var(--teal-700)" /><div><b>{t.outFlight || '—'}</b><div className="small muted">Khởi hành {fmtDT(t.departAt)} → đến {fmtDT(t.arriveAt)}</div></div></div>
              <div><L.PlaneTakeoff size={16} color="var(--orange-600)" /><div><b>{t.returnFlight || '—'}</b><div className="small muted">Bay về {fmtDT(t.returnAt)}</div></div></div>
              <div><L.Hotel size={16} color="var(--teal-700)" /><div><b>{t.hotel || '—'}</b><div className="small muted">{fmtDate(t.checkIn)} → {fmtDate(t.checkOut)} {t.bookingCode ? '· ' + t.bookingCode : ''} · <Pill v={t.hotelStatus} /></div></div></div>
            </div>
            <div className="row wrap small" style={{ gap: 16, marginTop: 8 }}>
              <span>Thù lao thực nhận <b>{eur(c.net)}</b></span><span>Tổng EUR <b>{eur(c.eurTotal)}</b></span><span>Quy VND <b>{money(c.vnd)} ₫</b></span>
              {t.advanceEur ? <span>Tạm ứng <b>{eur(t.advanceEur)}</b> ({t.advanceStatus})</span> : null}
            </div>
            {(t.files || []).length > 0 && (
              <div style={{ marginTop: 10 }}>
                {t.files.map((f, i) => {
                  const k = t.id + i
                  return (
                    <div key={i} className={cx('fileitem-wrap', pv === k && 'open')} style={{ marginBottom: 6 }}>
                      <div className="fileitem"><L.Ticket size={16} color="var(--orange-600)" /><span className="grow ellipsis">{f.name}</span>
                        {isPdf(f) && <button className={cx('btn sm', pv === k ? 'primary' : 'ghost')} onClick={() => setPv(pv === k ? null : k)}>{pv === k ? 'Ẩn' : 'Xem vé'}</button>}
                        <button className="iconbtn" onClick={() => openFile(f).catch((e) => toast(e.message))}><L.ExternalLink size={14} /></button></div>
                      {pv === k && <FilePreview file={f} height={420} />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Yêu cầu đặc biệt (ghi nhớ cho mọi lần sau) ---------- */
function Prefs({ l, onSave }) {
  const keys = ['diet', 'allergies', 'fruits', 'drinks', 'hotelPref', 'seatPref', 'otherPrefs']
  const [f, setF] = useState(Object.fromEntries(keys.map((k) => [k, l[k] || ''])))
  const dirty = keys.some((k) => (f[k] || '') !== (l[k] || ''))
  return (
    <div className="card card-pad">
      <div className="callout info" style={{ marginBottom: 14 }}><L.Sparkles size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} /><div>Nhập <b>một lần</b> – hệ thống ghi nhớ và tự hiện trong mọi chuyến công tác, thẻ chuyến bay và email thông tin gửi hậu cần cho giảng viên này.</div></div>
      <div className="form-grid">
        {keys.map((k) => {
          const fd = M.fields.find((x) => x.k === k)
          return (
            <div key={k} className={cx('field', fd.type === 'long' && 'wide')}>
              <label>{fd.label}</label>
              {fd.type === 'select' ? <select className="select" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })}><option value="">—</option>{fd.options.map((o) => <option key={o}>{o}</option>)}</select>
                : fd.type === 'long' ? <textarea className="textarea" rows={3} placeholder={fd.ph} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
                : <input className="input" placeholder={fd.ph} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
            </div>
          )
        })}
      </div>
      <div className="row" style={{ marginTop: 14, gap: 8 }}>
        <button className="btn primary" disabled={!dirty} onClick={() => onSave({ ...l, ...f })}><L.Save size={15} />Lưu yêu cầu</button>
        {dirty && <span className="small muted">Có thay đổi chưa lưu</span>}
      </div>
    </div>
  )
}
