import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import * as L from 'lucide-react'
import { useStore, projectRole } from '../data/store.jsx'
import { canAccessModule, getRoleConfig, getUserProjectRole } from '../data/rbac.js'
import { getProjectConfiguredModules } from './moduleCatalog.js'
import { useUI } from '../App.jsx'
import { useToast, Avatar, Icon, Modal, Empty } from '../components/ui.jsx'
import { MODULES, MODULE, STATUS_TONE, columnsOf, fieldOf, valueOf, workTarget, tripCalc, MOA, matchItem, prefsText, sameName, getLegalRank } from './schema.js'
import { DOC_TEMPLATES, openDoc } from './docs.js'
import DocComments from '../components/DocComments.jsx'
import DocTemplateStudio from '../components/DocTemplateStudio.jsx'
import FlightLogisticsWorkflow from '../components/FlightLogisticsWorkflow.jsx'
import GiaLaiDashboard from '../components/GiaLaiDashboard.jsx'
import CurriculumView, { CurriculumCoursesTab, CurriculumGradingTab } from '../components/CurriculumView.jsx'
import AnnualAdministrativeReport from '../components/AnnualAdministrativeReport.jsx'
import { parseEml, parsePasted, toCSV, parseCSV, download, normDate, uploadFile, openFile, removeFile, fmtSize, fileUrl, isPdf, isImage } from './io.js'
import { cx, fmtDate, normalize, toISODate, todayStr, daysUntil, timeAgo } from '../lib/utils.js'

/* ---------- định dạng ---------- */
export const money = (v) => (v === '' || v == null || isNaN(+v) ? '' : (+v).toLocaleString('vi-VN'))
const fmtDT = (s) => (s ? `${fmtDate(s.slice(0, 10))} ${s.slice(11, 16)}` : '')
const TONE = { ok: ['#1e8a4c', '#e2f4e9'], warn: ['#b45309', '#fff4e0'], danger: ['#c62828', '#fdecec'], info: ['#03616a', '#e1f1f2'], muted: ['#64748b', '#eef2f6'] }
export const Pill = ({ v }) => { if (!v) return null; const [c, b] = TONE[STATUS_TONE[v] || 'muted']; return <span className="badge" style={{ color: c, background: b }}>{v}</span> }

function Cell({ m, f, r, users }) {
  const v = valueOf(m, r, f.k)
  if (v === '' || v == null || (Array.isArray(v) && !v.length)) {
    if (['docs', 'gl_docs', 'gl_drafts'].includes(m?.id) && f.k === 'note' && (r.docComments || []).length > 0) {
      // Cho phép hiển thị badge góp ý
    } else {
      return <span className="faint">—</span>
    }
  }
  if (f.k === 'uehConfirmed' || f.k === 'rennesConfirmed') {
    const isOk = v === true || v === 'Đã xác nhận' || v === 'true'
    return <span className="badge" style={{ background: isOk ? '#e2f4e9' : '#fff4e0', color: isOk ? '#1e8a4c' : '#b45309', fontSize: 11 }}>{isOk ? '✓ Đã xác nhận' : '○ Chờ xác nhận'}</span>
  }
  if (f.k === 'teachingGroup') {
    return <span className="chip" style={{ fontSize: 11, background: v === 'K50–K51' ? 'var(--teal-50)' : 'rgba(212, 113, 47, 0.1)', color: v === 'K50–K51' ? 'var(--teal-800)' : '#b45309' }}>{v}</span>
  }
  if (['docs', 'gl_docs', 'gl_drafts'].includes(m?.id) && (f.k === 'title' || f.k === 'docTitle')) {
    const comments = r.docComments || []
    const openCount = comments.filter((c) => !c.resolved).length
    const totalCount = comments.length
    return (
      <span className="row" style={{ gap: 6, alignItems: 'center' }}>
        <span>{String(v)}</span>
        {openCount > 0 ? (
          <span
            className="badge"
            style={{
              background: '#fff4e0',
              color: '#b45309',
              border: '1px solid #fde68a',
              fontSize: 11,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            title={`${openCount} góp ý cần xử lý`}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <L.MessageSquare size={11} /> {openCount}
          </span>
        ) : totalCount > 0 ? (
          <span
            className="badge"
            style={{
              background: '#e2f4e9',
              color: '#1e8a4c',
              border: '1px solid #bbf7d0',
              fontSize: 11,
              padding: '1px 5px',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
            title={`Đã xử lý xong (${totalCount} góp ý)`}
          >
            <L.CheckCircle2 size={11} /> {totalCount}
          </span>
        ) : null}
      </span>
    )
  }
  if (m?.id === 'docs' && f.k === 'files') {
    const comments = r.docComments || []
    const openCount = comments.filter((c) => !c.resolved).length
    return (
      <span className="row small" style={{ gap: 6, color: 'var(--teal-700)', position: 'relative' }}>
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <L.Paperclip size={13} />
          {openCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -4,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 0 1px #fff',
              }}
              title={`${openCount} bình luận trên tài liệu`}
            />
          )}
        </span>
        {v.length}
      </span>
    )
  }
  if (m?.id === 'docs' && f.k === 'note') {
    const comments = r.docComments || []
    const openCount = comments.filter((c) => !c.resolved).length
    const totalCount = comments.length
    if (totalCount > 0) {
      return openCount > 0 ? (
        <span className="badge" style={{ background: '#fff4e0', color: '#b45309', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
          <L.MessageSquare size={12} /> {openCount} góp ý mở
        </span>
      ) : (
        <span className="badge" style={{ background: '#e2f4e9', color: '#1e8a4c', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <L.CheckCircle2 size={12} /> Đã xử lý ({totalCount})
        </span>
      )
    }
  }
  switch (f.type) {
    case 'date': return fmtDate(v)
    case 'datetime': return fmtDT(v)
    case 'money': return <span className="num">{money(v)} ₫</span>
    case 'eur': return <span className="num">€ {(+v).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    case 'checklist': { const d = v.filter((x) => x.done).length; return <span className={cx('ckcell', d === v.length && 'full')} title={v.map((x) => (x.done ? '✓ ' : '○ ') + x.text).join('\n')}><span className="bar"><i style={{ width: (d / v.length) * 100 + '%' }} /></span><b>{d}/{v.length}</b></span> }
    case 'number': return <span className="num">{f.cur === 'EUR' ? '€ ' : ''}{(+v).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}{f.cur === 'VND/EUR' ? ' ₫/€' : ''}</span>
    case 'select': return f.k === 'yearLevel' || f.k === 'cohort' || f.k === 'docType' || f.k === 'topic' || f.k === 'category' || f.k === 'side' || f.k === 'mode' || f.k === 'examType' || f.k === 'gender' ? <span className="chip">{v}</span> : <Pill v={v} />
    case 'user': { const u = users.find((x) => x.id === v); return u ? <span className="row" style={{ gap: 6 }}><Avatar user={u} size={20} />{u.name.split(' ').slice(-1)}</span> : '—' }
    case 'file': return <span className="row small" style={{ gap: 4, color: 'var(--teal-700)' }}><L.Paperclip size={13} />{v.length}</span>
    case 'email': return <a href={'mailto:' + v} onClick={(e) => e.stopPropagation()}>{v}</a>
    case 'long': return <span className="ellipsis" style={{ maxWidth: 260, display: 'inline-block' }}>{v}</span>
    default: return String(v)
  }
}

/* ================= WORKSPACE ================= */
export default function Workspace({ project, moduleId }) {
  const { state, me } = useStore()
  const { go } = useUI()
  const [docStudio, setDocStudio] = useState(null)
  const [flightWorkflowOpen, setFlightWorkflowOpen] = useState(false)
  const items = state.items.filter((x) => x.projectId === project.id)
  const count = (id) => items.filter((x) => x.module === id).length
  // số việc CỦA TÔI còn phải làm, theo phân hệ nơi thực hiện
  const todo = {}
  state.tasks.filter((t) => t.projectId === project.id && !t.isStream && t.status !== 'done' && t.assigneeIds.includes(me.id)).forEach((t) => {
    const w = workTarget(t, state.tasks)
    if (!w) return
    const o = (todo[w.module] ||= { n: 0, late: 0 })
    o.n++
    if (t.dueDate && daysUntil(t.dueDate) < 0) o.late++
  })
  const Badge = ({ id }) => {
    const o = todo[id]
    return o ? <span className={cx('n', 'todo', o.late && 'late')} title={`${o.n} việc của bạn cần làm${o.late ? ` (${o.late} quá hạn)` : ''}`}>{o.n}</span> : null
  }
  const cats = project.categories
  const nav = (id) => go(`/projects/${project.id}/work/${id}`)
  const current = moduleId || 'home'
  const qs = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const taskId = qs.get('task')
  const task = taskId && state.tasks.find((t) => t.id === taskId)
  const configuredModules = getProjectConfiguredModules(project)
  const allowedModules = configuredModules.filter((m) => canAccessModule(me, m.id, project))
  const isAllowedCurrent = current === 'home' || (current === 'report' ? canAccessModule(me, 'report', project) : allowedModules.some((m) => m.id === current))

  return (
    <>
    {task && <ApproveBar task={task} />}
    {task && <TaskBar task={task} onClose={() => nav(current)} />}
    <div className="ws">
      <aside className="ws-nav card">
        <button className={cx('ws-link', current === 'home' && 'on')} onClick={() => nav('home')}><L.LayoutGrid size={16} /><span className="grow">Tổng quan bàn làm việc</span></button>
        {allowedModules.map((m) => {
          const c = cats.find((x) => x.id === m.cat)
          const openDocComments = m.id === 'docs'
            ? items.filter((x) => x.module === 'docs').reduce((sum, it) => sum + (it.docComments || []).filter((c) => !c.resolved).length, 0)
            : 0
          return (
            <button key={m.id} className={cx('ws-link', current === m.id && 'on')} onClick={() => nav(m.id)}>
              <span className="ws-no">{c?.no || '··'}</span><Icon name={m.icon} size={16} /><span className="grow ellipsis" title={`${m.name} · ${count(m.id)} ${m.item}`}>{m.name}</span>
              {openDocComments > 0 && (
                <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 9, marginRight: 4 }} title={`${openDocComments} góp ý văn bản cần xử lý`}>
                  {openDocComments}
                </span>
              )}
              <Badge id={m.id} />
            </button>
          )
        })}
        {canAccessModule(me, 'report', project) && (
          <button className={cx('ws-link', current === 'report' && 'on')} onClick={() => nav('report')}>
            <span className="ws-no">10</span><L.FileBarChart size={16} /><span className="grow">Báo cáo tổng hợp</span><Badge id="report" />
          </button>
        )}
      </aside>
      <section className="ws-main">
        {!isAllowedCurrent ? (
          <div className="card card-pad empty" style={{ padding: '50px 20px', textAlign: 'center' }}>
            <L.ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 8px' }}>Truy cập bị giới hạn theo vai trò (RBAC)</h3>
            <p className="muted small" style={{ maxWidth: 480, margin: '0 auto 16px', lineHeight: 1.5 }}>
              Vai trò của bạn trong dự án <b>{project.name}</b> là <b>{getRoleConfig(getUserProjectRole(project, me), project).viName}</b>. Phân hệ <b>"{MODULE[current]?.name || current}"</b> chưa được mở quyền truy cập cho vai trò này trong mục Cài đặt của dự án.
            </p>
            <button className="btn sm primary" onClick={() => nav('home')}>Quay lại Bàn làm việc</button>
          </div>
        ) : (
          <>
            {current === 'home' && <Home project={project} items={items} nav={nav} allowedModules={allowedModules} onOpenDocStudio={setDocStudio} onOpenFlightWorkflow={() => setFlightWorkflowOpen(true)} />}
            {current === 'report' && <Report project={project} items={items} />}
            {current === 'lecturers' ? (
              <CurriculumView
                project={project}
                items={items.filter((x) => x.module === 'lecturers')}
                onOpenDocStudio={setDocStudio}
                onOpenFlightWorkflow={() => setFlightWorkflowOpen(true)}
              />
            ) : (
              MODULE[current] && <ModuleView key={current + (qs.get('view') || '') + (task?.id || '')} project={project} m={MODULE[current]} initialView={qs.get('view')} task={task} items={items.filter((x) => x.module === current)} onOpenDocStudio={setDocStudio} onOpenFlightWorkflow={() => setFlightWorkflowOpen(true)} />
            )}
          </>
        )}
      </section>
    </div>
    {docStudio && <DocTemplateStudio initialTemplate={docStudio.template} initialItem={docStudio.item} project={project} onClose={() => setDocStudio(null)} />}
    {flightWorkflowOpen && <FlightLogisticsWorkflow project={project} onClose={() => setFlightWorkflowOpen(false)} onOpenDocStudio={setDocStudio} />}
    </>
  )
}


/* Thanh duyệt cho quản lý khi việc đang Chờ duyệt (dùng trong trang sản phẩm) */
export function ApproveBar({ task, compact }) {
  const { state, me, updateTask } = useStore()
  const toast = useToast()
  const p = state.projects.find((x) => x.id === task?.projectId)
  if (!task || task.status !== 'review' || projectRole(p, me) !== 'manager') return null
  const who = task.assigneeIds.map((id) => state.users.find((u) => u.id === id)?.name).filter(Boolean).join(', ')
  const approve = () => { updateTask(task.id, { status: 'done' }); toast('Đã duyệt hoàn thành') }
  const reject = () => {
    const note = prompt('Nội dung cần chỉnh sửa (gửi cho người phụ trách):')
    if (note && note.trim()) { updateTask(task.id, { status: 'doing' }, { returnNote: note.trim() }); toast('Đã trả lại để chỉnh sửa') }
  }
  return (
    <div className={cx('approve-bar', compact && 'compact')}>
      <L.BadgeCheck size={20} />
      <div className="grow" style={{ minWidth: 0 }}>
        <b>Chờ bạn duyệt</b>
        <div className="small">{who ? who + ' đã gửi duyệt' : 'Đã gửi duyệt'} · “{task.title}”. Kiểm tra sản phẩm bên dưới.</div>
      </div>
      <button className="btn success" onClick={approve}><L.Check size={16} />Duyệt hoàn thành</button>
      <button className="btn" onClick={reject}><L.Undo2 size={16} />Yêu cầu chỉnh sửa</button>
    </div>
  )
}

/* Thanh "Đang thực hiện" khi mở bàn làm việc từ một công việc */
function TaskBar({ task, onClose }) {
  const { state, me, updateTask } = useStore()
  const { openTask } = useUI()
  const toast = useToast()
  const parent = task.parentId && state.tasks.find((x) => x.id === task.parentId)
  const ck = task.checklist || []
  const mine = task.assigneeIds.includes(me.id)
  const d = task.dueDate ? daysUntil(task.dueDate) : null
  const setS = (s, msg) => { updateTask(task.id, { status: s }); toast(msg) }
  const ST = { todo: 'Chưa bắt đầu', doing: 'Đang thực hiện', review: 'Chờ duyệt', done: 'Hoàn thành' }
  const [showCk, setShowCk] = useState(ck.length > 0 && task.status !== 'done')
  const canTick = mine || projectRole(state.projects.find((p) => p.id === task.projectId), me) === 'manager'
  const tick = (i) => {
    const next = ck.map((x, j) => (j === i ? { ...x, done: !x.done } : x))
    const patch = { checklist: next }
    if (task.status === 'todo' && next.some((x) => x.done)) patch.status = 'doing' // tick bước đầu tiên → tự chuyển Đang thực hiện
    updateTask(task.id, patch)
    if (next.every((x) => x.done) && task.status === 'doing') toast('Đã xong mọi bước – bấm “Gửi duyệt” để quản lý duyệt')
  }
  return (
    <div className="taskbar">
      <L.Hammer size={18} />
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="small" style={{ opacity: .85 }}>Đang thực hiện{parent ? ' · ' + parent.title : ''}</div>
        <b className="ellipsis" style={{ display: 'block' }}>{task.title}</b>
      </div>
      <span className="tb-chip">{ST[task.status]}</span>
      {d != null && task.status !== 'done' && <span className={cx('tb-chip', d < 0 && 'late')}><L.CalendarClock size={13} />{d < 0 ? `Quá hạn ${-d} ngày` : d === 0 ? 'Hạn hôm nay' : `Còn ${d} ngày`}</span>}
      {ck.length > 0 && <button type="button" className={cx('tb-chip', showCk && 'on')} onClick={() => setShowCk(!showCk)} title="Hiện / ẩn các bước"><L.CheckSquare size={13} />{ck.filter((x) => x.done).length}/{ck.length} bước<L.ChevronDown size={13} style={{ transform: showCk ? 'rotate(180deg)' : 'none' }} /></button>}
      {mine && task.status === 'todo' && <button className="btn sm accent" onClick={() => setS('doing', 'Đã bắt đầu thực hiện')}><L.Play size={14} />Bắt đầu</button>}
      {mine && task.status === 'doing' && <button className="btn sm accent" onClick={() => setS('review', 'Đã gửi duyệt cho quản lý')}><L.Send size={14} />Gửi duyệt</button>}
      <button className="btn sm" onClick={() => openTask(task.id)}><L.MessagesSquare size={14} />Chi tiết & trao đổi</button>
      <button className="iconbtn" style={{ color: '#fff' }} onClick={onClose} aria-label="Đóng"><L.X size={16} /></button>
      {showCk && ck.length > 0 && (
        <div className="tb-ck">
          {ck.map((x, i) => (
            <label key={i} className={cx('check', x.done && 'done')}>
              <input type="checkbox" checked={!!x.done} disabled={!canTick} onChange={() => tick(i)} />
              <span className="grow">{i + 1}. {x.text}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Cấu hình quy trình & to-do list thông minh cho từng phân hệ ---------- */
const MODULE_WORKFLOWS_CONFIG = {
  sessions: {
    wfCode: 'WF01',
    getBatch: (items) => {
      const active = items.find((x) => x.course && x.lecturer) || items[0]
      if (active) {
        return `${active.lecturer || 'Prof. Franck Martin'} · ${active.course || 'Kinh tế lượng tài chính'} · Tuần 18–24/10/2026 (${active.teachingGroup || 'K50–K51'})`
      }
      return 'Prof. Franck Martin · Kinh tế lượng tài chính · Tuần 18–24/10/2026'
    },
    steps: [
      {
        id: 'ueh_check',
        text: 'UEH kiểm tra xung đột phòng học và thời khóa biểu',
        evalDone: (items) => items.length > 0 && items.some((s) => s.room && s.date),
      },
      {
        id: 'ueh_sign',
        text: 'Đại diện UEH ký xác nhận',
        evalDone: (items) => items.some((s) => s.uehConfirmed === 'Đã xác nhận' || s.status === 'Đã xác nhận' || s.status === 'Đã dạy'),
      },
      {
        id: 'rennes_sign',
        text: 'Đại diện Rennes ký xác nhận',
        evalDone: (items) => items.some((s) => s.rennesConfirmed === 'Đã xác nhận'),
      },
    ],
  },
  trips: {
    wfCode: 'WF02',
    getBatch: (items) => {
      const active = items.find((x) => x.lecturer) || items[0]
      return active ? `${active.lecturer} · ${active.course || 'Học phần Rennes'} · Đợt công tác tháng 12/2026` : 'Prof. Franck Martin · Kinh tế lượng tài chính · Đợt công tác tháng 12/2026'
    },
    steps: [
      {
        id: 'confirm_stay',
        text: 'Xác nhận danh sách GV & khoảng thời gian lưu trú',
        evalDone: (items) => items.some((t) => t.teachFrom && t.teachTo),
      },
      {
        id: 'book_flights',
        text: 'Đặt vé máy bay khứ hồi (TGV + chặng bay)',
        evalDone: (items) => items.some((t) => t.outFlight || t.ticketCost > 0),
      },
      {
        id: 'hotel_visa',
        text: 'Đặt khách sạn và chuẩn bị thư mời visa',
        evalDone: (items) => items.some((t) => ['Đã duyệt', 'Đã xác nhận'].includes(t.hotelStatus) || t.visa === 'Đã cấp visa'),
      },
      {
        id: 'sign_contract',
        text: 'Soạn & ký HĐ thỉnh giảng + cam kết thuế TNCN 20%',
        evalDone: (items) => items.some((t) => t.contractNo || t.payStatus === 'Đã thanh toán'),
      },
    ],
  },
  transfers: {
    wfCode: 'WF03',
    getBatch: (items) => {
      const active = items[0]
      return active ? `${active.term || 'HK1 2026–2027'} · Khóa K50–K51 (€27,000 / ${active.studentCount || 30} SV)` : 'HK1 2026–2027 · Khóa K50–K51 (€27,000 / 30 SV)'
    },
    steps: [
      {
        id: 'student_audit',
        text: 'Đối soát số lượng SV thực tế và mức phí (€900/SV)',
        evalDone: (items) => items.some((t) => t.studentCount > 0),
      },
      {
        id: 'draft_order',
        text: 'Lập tờ trình & dự thảo lệnh chuyển tiền quốc tế',
        evalDone: (items) => items.some((t) => ['Đã duyệt', 'Đã chuyển', 'Rennes đã xác nhận'].includes(t.status)),
      },
      {
        id: 'leader_approve',
        text: 'Ban Giám hiệu / KHTC duyệt lệnh chuyển tiền',
        evalDone: (items) => items.some((t) => ['Đã chuyển', 'Rennes đã xác nhận'].includes(t.status)),
      },
    ],
  },
  expenses: {
    wfCode: 'WF04',
    getBatch: () => 'Quyết toán Đợt 1 – Học phần S3 (Thù lao GV + Vé máy bay + KS)',
    steps: [
      {
        id: 'collect_docs',
        text: 'Tập hợp hợp đồng, hóa đơn VAT, vé máy bay & KS',
        evalDone: (items) => items.some((e) => e.voucher || (e.files && e.files.length > 0)),
      },
      {
        id: 'audit_tax',
        text: 'Kiểm tra tính hợp lệ của chứng từ & biên lai thuế',
        evalDone: (items) => items.some((e) => (e.checks || []).length > 0 && e.checks.slice(0, 5).every((c) => c.done)),
      },
      {
        id: 'bgh_payment',
        text: 'Ban Giám hiệu duyệt lệnh chi & quyết toán',
        evalDone: (items) => items.some((e) => ['Đã chi', 'Đã quyết toán'].includes(e.status)),
      },
    ],
  },
  exams: {
    wfCode: 'WF05',
    getBatch: (items) => {
      const active = items[0]
      return active ? `Kỳ thi HP ${active.course || 'Kinh tế lượng'} · ${active.className || 'ISB-K51-01'} (${active.date ? fmtDate(active.date) : 'Đợt 1'})` : 'Kỳ thi kết thúc học phần S3 – Khóa K50–K51 (Kinh tế lượng tài chính)'
    },
    steps: [
      {
        id: 'exam_schedule',
        text: 'Đề thi & phòng thi được phê duyệt',
        evalDone: (items) => items.some((e) => ['Đã duyệt đề', 'Đã in & niêm phong'].includes(e.paperStatus) && e.room && e.proctor),
      },
      {
        id: 'grades_submitted',
        text: 'GV Rennes chấm và nộp bảng điểm gốc thang 20',
        evalDone: (items) => items.some((e) => e.gradesReceivedAt || e.status === 'Đã có kết quả'),
      },
      {
        id: 'convert_passed',
        text: 'Quy đổi thang 10 & Hội đồng Khảo thí phê duyệt',
        evalDone: (items) => items.some((e) => e.councilStatus === 'Đã duyệt'),
      },
    ],
  },
  students: {
    wfCode: 'WF06',
    getBatch: () => 'Khóa K50–K51 – Xét chuyển tiếp Giai đoạn 2 cấp song bằng',
    steps: [
      {
        id: 'credit_audit',
        text: 'Rà soát tích lũy tín chỉ & chuẩn ngoại ngữ B2',
        evalDone: (items) => items.some((s) => s.b2Status === 'Đạt B2' && +s.credits > 0),
      },
      {
        id: 'form_reconciliation',
        text: 'Đối soát dữ liệu UEH và form đăng ký Rennes',
        evalDone: (items) => items.some((s) => s.rennesForm === 'Khớp dữ liệu UEH'),
      },
      {
        id: 'lms_issued',
        text: 'Rennes tiếp nhận & cấp tài khoản email/LMS',
        evalDone: (items) => items.some((s) => ['Đã cấp', 'Đã kích hoạt'].includes(s.accountStatus)),
      },
    ],
  },
  docs: {
    wfCode: 'WF07',
    getBatch: (items) => {
      const moa = items.find((d) => (d.title || '').includes('MOA') || (d.title || '').includes('Phụ lục'))
      return moa ? `${moa.title} (Hiệu lực: ${moa.expiry ? fmtDate(moa.expiry) : '2026–2030'})` : 'Thỏa thuận điều chỉnh MOA UEH – Rennes (Hiệu lực 2026–2030)'
    },
    steps: [
      {
        id: 'legal_review',
        text: 'Rà soát nội dung & đối chiếu pháp lý MOA',
        evalDone: (items) => items.some((d) => (d.title || '').includes('MOA')),
      },
      {
        id: 'dean_sign',
        text: 'Trưởng khoa KHTC rà soát & ký nháy',
        evalDone: (items) => items.some((d) => ['Đang trình ký', 'Đã ký', 'Đã gửi'].includes(d.status)),
      },
      {
        id: 'official_sign',
        text: 'Đại diện Rennes & BGH UEH ký chính thức',
        evalDone: (items) => items.some((d) => ['Đã ký', 'Đã gửi'].includes(d.status)),
      },
    ],
  },
  lecturers: {
    wfCode: 'GV-HĐ',
    getBatch: () => 'Đợt 2 – 2 Giảng viên Rennes (Prof. Franck Martin & Dr. Dubois)',
    steps: [
      {
        id: 'cv_syllabus',
        text: 'Tiếp nhận CV khoa học & Syllabus học phần',
        evalDone: (items) => items.some((l) => l.courses),
      },
      {
        id: 'sign_contract',
        text: 'Ký HĐ thỉnh giảng & cam kết thuế TNCN 20%',
        evalDone: (items) => items.some((l) => l.contractStatus === 'Đã ký HĐ'),
      },
      {
        id: 'teaching_audit',
        text: 'Nghiệm thu giờ giảng thực tế & thanh toán thù lao',
        evalDone: (items) => items.some((l) => l.acceptance === 'Đã ký biên bản nghiệm thu'),
      },
    ],
  },
  grades: {
    wfCode: 'KT-KQ',
    getBatch: () => 'Học phần Kinh tế lượng tài chính – S3 (30 Sinh viên Khóa K50–K51)',
    steps: [
      {
        id: 'get_grades',
        text: 'Thu thập bảng điểm gốc thang 20 từ ĐH Rennes',
        evalDone: (items) => items.some((g) => g.score20 !== '' && g.score20 != null),
      },
      {
        id: 'scale_convert',
        text: 'Tự động quy đổi sang thang điểm 10 (hệ số chia 2)',
        evalDone: (items) => items.some((g) => g.score20 !== '' && g.score20 != null),
      },
      {
        id: 'degree_eval',
        text: 'Xét điều kiện bằng Rennes (TB ≥ 10/20 & không môn < 10)',
        evalDone: (items) => items.some((g) => g.score20 !== '' && +g.score20 >= 10),
      },
    ],
  },
  tickets: {
    wfCode: 'CS-SV',
    getBatch: () => 'Hỗ trợ SV: Học vụ, Học phí & Tài khoản LMS Rennes (SLA 48h)',
    steps: [
      {
        id: 'email_triage',
        text: 'Tiếp nhận & phân loại email SV theo chuyên môn',
        evalDone: (items) => items.length > 0,
      },
      {
        id: 'officer_assigned',
        text: 'Phân công chuyên viên xử lý theo hạn SLA 48h',
        evalDone: (items) => items.some((t) => t.handler),
      },
      {
        id: 'case_closed',
        text: 'Phản hồi và hoàn tất giải quyết ticket',
        evalDone: (items) => items.some((t) => t.status === 'Đã giải quyết'),
      },
    ],
  },
}

function CardWorkflowBox({ moduleId, items = [] }) {
  const cfg = MODULE_WORKFLOWS_CONFIG[moduleId]
  if (!cfg || !cfg.steps || !cfg.steps.length) return null

  return (
    <div className="wf-box" onClick={(e) => e.stopPropagation()}>
      <ul className="wf-bullet-list">
        {cfg.steps.map((s, idx) => (
          <li key={s.id || idx} className={cx('wf-bullet-item', s.evalDone && s.evalDone(items) && 'done')}>
            {s.evalDone && s.evalDone(items) ? <L.CheckCircle2 size={14} className="wf-ok" /> : <span className="wf-bullet-dot" />}
            <span className="wf-bullet-text">{s.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- Trang chủ bàn làm việc ---------- */
function Home({ project, items, nav, allowedModules = MODULES, onOpenDocStudio, onOpenFlightWorkflow }) {
  const { state } = useStore()
  const allTasks = state.tasks.filter((t) => t.projectId === project?.id)
  const isGiaLai = project?.id === 'p3' || project?.code?.includes('QDTMH') || project?.modulesConfig?.some((m) => m.moduleKey.startsWith('gl_'))

  if (isGiaLai) {
    return (
      <GiaLaiDashboard
        project={project}
        items={items}
        nav={nav}
        onOpenFlightWorkflow={onOpenFlightWorkflow}
        onOpenDocStudio={onOpenDocStudio}
      />
    )
  }

  return (
    <div>
      <div className="callout info" style={{ marginBottom: 14 }}><L.Info size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} /><div>Bàn làm việc là nơi <b>làm và lưu kết quả công việc</b>: văn bản, danh sách sinh viên, lịch giảng, email, chuyến công tác, chi phí… Mọi thành viên dự án đều xem được dữ liệu và lịch sử thay đổi theo đúng vai trò được phân quyền (RBAC).</div></div>
      <div className="ws-grid">
        {allowedModules.map((m) => {
          const list = items.filter((x) => x.module === m.id)
          const c = project.categories.find((x) => x.id === m.cat)
          const counts = {}; if (m.status) list.forEach(r => { if (r[m.status]) counts[r[m.status]] = (counts[r[m.status]] || 0) + 1; }); const st = Object.entries(counts).slice(0, 4);
          return (
            <div key={m.id} className="card ws-card" onClick={() => nav(m.id)}>
              <div className="row" style={{ gap: 10 }}>
                <span className="ws-ic"><Icon name={m.icon} size={19} /></span>
                <div className="grow"><div className="small faint">{c?.no} · {c?.name}</div><b>{m.name}</b></div>
                <span className="ws-count">{list.length}</span>
              </div>
              <div className="row wrap" style={{ gap: 6, margin: '10px 0 2px' }}>{st.map(([k, v]) => <span key={k} className="row" style={{ gap: 4 }}><Pill v={k} /><b className="small">{v}</b></span>)}</div>
              <CardWorkflowBox moduleId={m.id} items={list} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Phân hệ dạng bảng ---------- */
function ModuleView({ project, m, items, initialView, task, onOpenDocStudio, onOpenFlightWorkflow }) {
  const store = useStore()
  const { state, me, saveItem, saveItems, deleteItems } = store
  const toast = useToast()
  const isMgr = projectRole(project, me) === 'manager'
  const users = (project.members || []).map((x) => state.users.find((u) => u.id === x.userId)).filter(Boolean)
  const views = m.views ? Object.keys(m.views) : null
  const specials = m.special === 'sessions' ? ['Timeline học phần', 'Lịch tháng', 'Kiểm tra trùng lịch', 'Khung đào tạo FBDPF1'] : m.id === 'exams' ? ['Lịch thi & Kết quả', 'Tiến độ khảo thí', 'Quy đổi điểm & Tín chỉ'] : m.special === 'inbox' ? ['Hộp thư', 'Bảng'] : m.special === 'grades' ? ['Xét bằng Rennes', 'Quy đổi điểm & Tín chỉ', 'Bảng'] : null
  const [view, setView] = useState((initialView && (views || specials || []).includes(initialView) && initialView) || views?.[0] || specials?.[0] || (m.special === 'trips' ? 'Thẻ chuyến' : 'Bảng'))
  const [tripAddModal, setTripAddModal] = useState(false)
  const [q, setQ] = useState('')
  const [flt, setFlt] = useState(() => {
    const o = {}
    const k = task && (task.title.match(/\bK(4\d|5\d)\b/) || [])[0]
    if (k && m.fields.some((f) => f.k === 'cohort')) o.cohort = k // việc nói về khóa nào → lọc khóa đó
    return o
  })
  const [sel, setSel] = useState([])
  // Mở từ một công việc → tự mở đúng bản ghi cần làm (đã gắn, hoặc khớp theo tên việc)
  const match = task && m.recordWork ? matchItem(task, items, m) : null
  const [edit, setEdit] = useState(() => {
    if (match) return match.item
    if (task && m.recordWork && m.newOnNoMatch) { const o = newItem(m); if (m.title) o[m.title] = task.title; return o }
    return null
  })
  const [pendingOnly, setPendingOnly] = useState(!!m.pending)
  const linkTask = (itemId) => { if (task && itemId && task.links?.[m.id] !== itemId) store.updateTask(task.id, { links: { ...(task.links || {}), [m.id]: itemId } }) }
  const newForTask = () => { const o = newItem(m); if (m.title) o[m.title] = task.title; setEdit(o) }
  const [importing, setImporting] = useState(false)
  const [pasting, setPasting] = useState(false)
  const [ticketImp, setTicketImp] = useState(false)
  const emlRef = useRef()
  const [fltComments, setFltComments] = useState(false)

  const filterFields = [...new Set([m.status, ...(m.groupBy || [])].filter(Boolean))].map((k) => fieldOf(m, k)).filter((f) => f?.type === 'select' || f?.type === 'user')
  const rows = useMemo(() => {
    const nq = normalize(q.trim())
    let r = items.filter((x) => (!nq || normalize(Object.values(x).filter((v) => typeof v === 'string').join(' ')).includes(nq)) && Object.entries(flt).every(([k, v]) => !v || valueOf(m, x, k) === v))
    // lọc "cần xử lý"; nếu không còn dòng nào thì hiện đủ để vẫn có chỗ làm việc
    if (pendingOnly && m.pending) { r = r.filter((x) => m.pending(x, view)) }
    if (m.id === 'docs' && fltComments) {
      r = r.filter((x) => (x.docComments || []).some((c) => !c.resolved))
    }
    if (m.id === 'gl_legal_lib') {
      if (view === 'Văn bản pháp lý') {
        r = r.filter((x) => getLegalRank(x) < 100)
      } else if (view === 'Tài liệu tham khảo') {
        r = r.filter((x) => getLegalRank(x) >= 100)
      }
    }
    return [...r].sort(m.sort || ((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')))
  }, [items, q, flt, m, pendingOnly, view, fltComments])
  const cols = (views ? m.views[view] : columnsOf(m)).map((k) => fieldOf(m, k)).filter(Boolean)
  const allFields = [...m.fields, ...Object.entries(m.computed || {}).map(([k, c]) => ({ k, ...c }))]
  const label = (r) => `${m.item} “${r[m.title] || ''}”`

  const exportCSV = () => {
    const csv = toCSV(rows, allFields.filter((f) => f.type !== 'file').map((f) => ({ label: f.label, get: (r) => (f.type === 'user' ? state.users.find((u) => u.id === r[f.k])?.name || '' : valueOf(m, r, f.k)) })))
    download(`${m.id}-${project.code}-${todayStr()}.csv`, csv)
  }
  const template = () => download(`mau-${m.id}.csv`, toCSV([], m.fields.filter((f) => !['file', 'user'].includes(f.type)).map((f) => ({ label: f.label, get: () => '' }))))

  const onEml = async (e) => {
    const files = [...e.target.files]; e.target.value = ''
    const list = []
    for (const file of files) {
      try {
        const p = parseEml(await file.text())
        let att = []
        try { att = [await uploadFile(project.id, file)] } catch (er) { toast(er.message) }
        list.push({ subject: p.subject, fromName: p.fromName, fromEmail: p.fromEmail, receivedAt: p.receivedAt, body: p.body + (p.attachments.length ? `\n\n[Đính kèm trong email: ${p.attachments.join(', ')}]` : ''), status: 'Mới', topic: guessTopic(p.subject + ' ' + p.body), due: addD(2), files: att, log: [] })
      } catch (er) { toast('Không đọc được ' + file.name) }
    }
    if (list.length) { saveItems(project.id, m.id, list, `tải lên ${list.length} email sinh viên`); toast(`Đã nhập ${list.length} email`) }
  }

  const bulkSet = (k, v) => { saveItems(project.id, m.id, items.filter((x) => sel.includes(x.id)).map((x) => ({ ...x, [k]: v })), `cập nhật “${fieldOf(m, k).label}” = ${v} cho ${sel.length} ${m.item}`); toast(`Đã cập nhật ${sel.length} ${m.item}`); setSel([]) }
  const promote = () => {
    const next = { 'Năm 1': 'Năm 2', 'Năm 2': 'Năm 3', 'Năm 3': 'Năm 4' }
    const list = items.filter((x) => sel.includes(x.id) && next[x.yearLevel])
    if (!list.length) { toast('Không có SV nào chuyển năm được'); return }
    if (!confirm(`Chuyển ${list.length} sinh viên lên năm tiếp theo?`)) return
    saveItems(project.id, m.id, list.map((x) => ({ ...x, yearLevel: next[x.yearLevel], note: [x.note, `${todayStr().split('-').reverse().join('/')}: chuyển ${x.yearLevel} → ${next[x.yearLevel]}`].filter(Boolean).join('\n') })), `chuyển ${list.length} sinh viên lên năm tiếp theo`)
    toast(`Đã chuyển ${list.length} SV lên năm tiếp theo`); setSel([])
  }

  const statusField = m.status && fieldOf(m, m.status)
  const sums = (m.sums || []).map((k) => [fieldOf(m, k), rows.reduce((s, r) => s + (+r[k] || 0), 0)])
  const computedTotal = m.computed ? Object.entries(m.computed).map(([k, c]) => [c, rows.reduce((s, r) => s + (+c.fn(r) || 0), 0)]) : []

  return (
    <div>
      <div className="ws-head">
        <div className="grow" style={{ minWidth: 240 }}>
          <h3 style={{ margin: 0 }}><Icon name={m.icon} size={19} color="var(--teal-700)" style={{ verticalAlign: -3, marginRight: 8 }} />{m.name}</h3>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          {['docs', 'lecturers', 'gl_docs', 'gl_drafts'].includes(m.id) && (
            <button
              type="button"
              className="btn accent"
              onClick={() => onOpenDocStudio && onOpenDocStudio({
                template: ['docs', 'gl_docs'].includes(m.id) ? 'missionOrder' : 'flightReq',
                item: items[0] || null
              })}
              title="Mở hệ thống biểu mẫu động & xuất file Word/PDF"
            >
              <L.FileSignature size={15} />
              Mẫu biểu & Xuất Word/PDF
            </button>
          )}
          {m.id === 'tickets' && <>
            <input ref={emlRef} type="file" accept=".eml,message/rfc822" multiple hidden onChange={onEml} />
            <button className="btn accent" onClick={() => emlRef.current.click()}><L.MailPlus size={16} />Tải email (.eml)</button>
            <button className="btn" onClick={() => setPasting(true)}><L.ClipboardPaste size={16} />Dán nội dung email</button>
          </>}
          {['trips', 'gl_trips'].includes(m.id) ? (
            <button
              type="button"
              className="btn primary"
              onClick={() => setTripAddModal(true)}
              title="Thêm chuyến công tác (Điều phối chuyến, Nhập vé máy bay, Mẫu biểu hoặc Nhập thủ công)"
            >
              <L.Plus size={16} />Thêm {m.item}
            </button>
          ) : (
            <button className="btn primary" onClick={() => setEdit(newItem(m))}><L.Plus size={16} />Thêm {m.item}</button>
          )}
          {!['trips', 'gl_trips'].includes(m.id) && (
            <>
              <button className="btn" onClick={() => setImporting(true)} title="Nhập từ Excel/CSV"><L.Upload size={15} /><span className="hide-sm">Nhập</span></button>
              <button className="btn" onClick={exportCSV} title="Xuất Excel (CSV)"><L.Download size={15} /><span className="hide-sm">Xuất</span></button>
            </>
          )}
        </div>
      </div>

      {task && m.recordWork && (() => {
        const cur = match?.item
        return (
          <div className={cx('rec-link', !cur && 'empty')}>
            <L.Link2 size={16} />
            {cur ? <span className="grow">Việc <b>“{task.title}”</b> {match.sure ? 'gắn với' : 'khớp với'} {m.item} <b>“{cur[m.title]}”</b>{!match.sure && <span className="faint"> (tự nhận diện – lưu để gắn)</span>}</span>
              : <span className="grow">Việc <b>“{task.title}”</b> chưa gắn {m.item} nào.</span>}
            {cur && <button className="btn sm primary" onClick={() => setEdit(cur)}><L.PencilLine size={14} />Mở {m.item}</button>}
            <button className="btn sm" onClick={newForTask}><L.Plus size={14} />Tạo {m.item} mới cho việc này</button>
            <select className="select sm" value="" onChange={(e) => { const it = items.find((x) => x.id === e.target.value); if (it) { linkTask(it.id); setEdit(it) } }}>
              <option value="">Chọn {m.item} khác…</option>{items.map((x) => <option key={x.id} value={x.id}>{x[m.title]}</option>)}
            </select>
          </div>
        )
      })()}
      <div className="filterbar">
        {m.pending && (() => {
          const pendingCount = items.filter((x) => m.pending(x)).length
          return (
            <button
              type="button"
              className={cx('btn sm', pendingOnly ? 'accent' : '')}
              onClick={() => setPendingOnly(!pendingOnly)}
              title={pendingOnly ? 'Đang lọc các mục cần xử lý. Bấm để hiển thị toàn bộ (xem full)' : 'Bấm để chỉ lọc các mục cần xử lý'}
            >
              <L.ListTodo size={14} />
              {`Cần xử lý (${pendingCount})`}
            </button>
          )
        })()}
        {m.id === 'docs' && (
          <button
            type="button"
            className={cx('btn sm', fltComments ? 'accent' : '')}
            onClick={() => setFltComments(!fltComments)}
            title="Lọc nhanh các văn bản có bình luận/góp ý chưa xử lý"
          >
            <L.MessageSquare size={14} />
            {fltComments ? 'Đang lọc: có góp ý' : 'Chỉ hiện văn bản có góp ý'}
          </button>
        )}
        {(views || specials) && (views || specials).length > 1 && <div className="seg">{(views || specials).map((v) => <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v}</button>)}</div>}
        <div className="search sm"><L.Search size={15} /><input className="input" placeholder={`Tìm ${m.item}…`} value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {filterFields.map((f) => (
          <select key={f.k} className="select sm" value={flt[f.k] || ''} onChange={(e) => setFlt({ ...flt, [f.k]: e.target.value })}>
            <option value="">{f.label}: tất cả</option>
            {f.type === 'user' ? users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>) : f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {sel.length > 0 && (
        <div className="bulkbar">
          <b>Đã chọn {sel.length}</b>
          {m.id === 'students' && <button className="btn sm accent" onClick={promote}><L.ArrowUpCircle size={14} />Chuyển lên năm tiếp theo</button>}
          {m.fields.filter((f) => f.type === 'select').slice(0, 6).map((f) => (
            <select key={f.k} className="select sm" value="" onChange={(e) => e.target.value && bulkSet(f.k, e.target.value)}>
              <option value="">Đặt {f.label.toLowerCase()}…</option>{f.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
          {isMgr && <button className="btn sm danger" onClick={() => { if (confirm(`Xóa ${sel.length} ${m.item}?`)) { deleteItems(project.id, sel, `xóa ${sel.length} ${m.item}`); setSel([]) } }}><L.Trash2 size={14} />Xóa</button>}
          <button className="btn sm ghost" onClick={() => setSel([])}>Bỏ chọn</button>
        </div>
      )}

      {m.special === 'sessions' && view === 'Lịch tháng' ? <SessionCalendar rows={rows} project={project} onOpen={setEdit} />
        : m.special === 'sessions' && view === 'Timeline học phần' ? <CourseTimeline rows={rows} project={project} onOpen={setEdit} />
        : m.special === 'sessions' && view === 'Khung đào tạo FBDPF1' ? <CurriculumCoursesTab />
        : view === 'Hộp thư' ? <Inbox project={project} m={m} rows={rows} users={users} />
        : (view === 'Thẻ chuyến' || m.special === 'trips') ? <TripCards m={m} rows={rows} onOpen={setEdit} lecturers={store.state.items.filter((x) => x.projectId === project.id && x.module === 'lecturers')} />
        : view === 'Xét bằng Rennes' ? <Eligibility rows={rows} students={store.state.items.filter((x) => x.projectId === project.id && x.module === 'students')} />
        : view === 'Quy đổi điểm & Tín chỉ' ? <CurriculumGradingTab />
        : m.id === 'exams' && view === 'Tiến độ khảo thí' ? <ExamPipeline rows={rows} onOpen={setEdit} />
        : m.special === 'sessions' && view === 'Kiểm tra trùng lịch' ? <ConflictCheck rows={rows} onOpen={setEdit} />
        : (
          <div className="card tbl-wrap">
            {rows.length ? (
              <table className="tbl ws-tbl">
                <thead><tr>
                  <th style={{ width: 34 }}><input type="checkbox" checked={sel.length === rows.length} onChange={(e) => setSel(e.target.checked ? rows.map((r) => r.id) : [])} /></th>
                  {cols.map((f) => <th key={f.k} style={{ minWidth: f.w || undefined, textAlign: ['money', 'number'].includes(f.type) ? 'right' : undefined }}>{f.label}</th>)}
                </tr></thead>
                <tbody>
                  {(() => {
                    const renderRow = (r) => (
                      <tr key={r.id} className={cx('click', sel.includes(r.id) && 'selrow')} onClick={() => setEdit(r)}>
                        <td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} /></td>
                        {cols.map((f) => <td key={f.k} data-l={f.label} className={f.k === m.title ? 'td-title' : ''} style={{ textAlign: ['money', 'number'].includes(f.type) ? 'right' : undefined, fontWeight: f.k === m.title ? 600 : undefined }}><Cell m={m} f={f} r={r} users={state.users} /></td>)}
                      </tr>
                    )

                    if (m.id === 'gl_legal_lib') {
                      const legalList = rows.filter((x) => getLegalRank(x) < 100)
                      const refList = rows.filter((x) => getLegalRank(x) >= 100)
                      return (
                        <>
                          {legalList.length > 0 && (
                            <>
                              <tr className="grp-row ws-grp-row">
                                <td colSpan={cols.length + 1} style={{ background: '#f0fdf4', borderTop: '2px solid #16a34a', borderBottom: '1px solid #bbf7d0', padding: '10px 14px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                      <span style={{ background: '#16a34a', color: '#fff', fontWeight: 800, fontSize: 11, padding: '2px 8px', borderRadius: 4, letterSpacing: 0.5 }}>PHẦN I</span>
                                      <b style={{ color: '#14532d', fontSize: 13.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>Văn bản quy phạm pháp lý các cấp</b>
                                      <span className="faint small" style={{ color: '#166534', opacity: 0.9, fontSize: 12 }}>
                                        · Sắp xếp theo thứ bậc hiệu lực pháp lý (Luật → Nghị định → Nghị quyết cấp tỉnh)
                                      </span>
                                    </div>
                                    <span style={{ fontSize: 11.5, fontWeight: 700, background: '#fff', color: '#15803d', border: '1px solid #86efac', padding: '2px 10px', borderRadius: 99 }}>
                                      {legalList.length} văn bản
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              {legalList.map(renderRow)}
                            </>
                          )}
                          {refList.length > 0 && (
                            <>
                              <tr className="grp-row ws-grp-row">
                                <td colSpan={cols.length + 1} style={{ background: '#fefce8', borderTop: legalList.length ? '2px solid #ca8a04' : 'none', borderBottom: '1px solid #fef08a', padding: '10px 14px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                      <span style={{ background: '#ca8a04', color: '#fff', fontWeight: 800, fontSize: 11, padding: '2px 8px', borderRadius: 4, letterSpacing: 0.5 }}>PHẦN II</span>
                                      <b style={{ color: '#713f12', fontSize: 13.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>Các tài liệu tham khảo khác</b>
                                      <span className="faint small" style={{ color: '#854d0e', opacity: 0.9, fontSize: 12 }}>
                                        · Đề án thực tiễn địa phương, Báo cáo nghiên cứu & Mô hình quốc tế
                                      </span>
                                    </div>
                                    <span style={{ fontSize: 11.5, fontWeight: 700, background: '#fff', color: '#a16207', border: '1px solid #fde047', padding: '2px 10px', borderRadius: 99 }}>
                                      {refList.length} tài liệu
                                    </span>
                                  </div>
                                </td>
                              </tr>
                              {refList.map(renderRow)}
                            </>
                          )}
                        </>
                      )
                    }

                    return rows.map(renderRow)
                  })()}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <Empty
                  icon={m.icon}
                  text={
                    pendingOnly && items.length > 0
                      ? `Tất cả ${items.length} ${m.item} đều đã hoàn tất hoặc không có mục nào cần xử lý.`
                      : items.length
                      ? 'Không có kết quả phù hợp bộ lọc.'
                      : `Chưa có ${m.item} nào. Bấm “Thêm” hoặc “Nhập” từ file Excel/CSV.`
                  }
                />
                {pendingOnly && items.length > 0 && (
                  <button
                    type="button"
                    className="btn primary sm"
                    style={{ marginTop: 12 }}
                    onClick={() => setPendingOnly(false)}
                  >
                    <L.Eye size={14} /> Hiển thị toàn bộ ({items.length} {m.item})
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      <div className="small faint" style={{ marginTop: 8 }}>{rows.length} / {items.length} {m.item} · Bấm vào một dòng để xem & chỉnh sửa · Mọi thay đổi được ghi vào tab Hoạt động của dự án.</div>

      {edit && <ItemForm project={project} m={m} item={edit} task={task} users={users} isMgr={isMgr} allItems={store.state.items.filter((x) => x.projectId === project.id)} onOpenDocStudio={onOpenDocStudio} onOpenFlightWorkflow={onOpenFlightWorkflow} onOpenTicketImport={() => setTicketImp(true)} onClose={() => setEdit(null)} onSave={(d) => { const id = saveItem(project.id, m.id, d, label(d)); if (task && m.recordWork) linkTask(id); toast(task && m.recordWork ? 'Đã lưu & gắn vào công việc' : 'Đã lưu'); setEdit(null) }}
        onDelete={() => { deleteItems(project.id, [edit.id], `xóa ${label(edit)}`); setEdit(null) }} />}
      {tripAddModal && (
        <AddTripModal
          onClose={() => setTripAddModal(false)}
          onOpenFlightWorkflow={() => onOpenFlightWorkflow && onOpenFlightWorkflow()}
          onOpenTicketImport={() => setTicketImp(true)}
          onOpenDocStudio={() => onOpenDocStudio && onOpenDocStudio({
            template: ['trips', 'gl_trips'].includes(m.id) ? 'flightReq' : 'missionOrder',
            item: items[0] || null
          })}
          onManualAdd={() => setEdit(newItem(m))}
        />
      )}
      {ticketImp && <TicketImport project={project} m={m} items={items} onClose={() => setTicketImp(false)} onDone={(r) => { setTicketImp(false); setEdit(r) }} />}
      {importing && <ImportModal project={project} m={m} items={items} onClose={() => setImporting(false)} template={template} />}
      {pasting && <PasteEmail onClose={() => setPasting(false)} onSave={(p) => { saveItem(project.id, m.id, { ...p, status: 'Mới', topic: guessTopic(p.subject + ' ' + p.body), due: addD(2), files: [], log: [] }, `email “${p.subject}”`); setPasting(false); toast('Đã thêm email') }} />}
    </div>
  )
}
export const newItem = (m) => {
  const o = { ...(m.defaults || {}) }
  m.fields.filter((f) => f.type === 'checklist' && f.defaults).forEach((f) => { o[f.k] = f.defaults.map((text) => ({ text, done: false })) })
  return o
}
const addD = (n) => toISODate(new Date(Date.now() + n * 864e5))
const guessTopic = (t) => {
  const s = normalize(t)
  if (/hoc phi|dong tien|chuyen khoan|hoa don|tuition/.test(s)) return 'Học phí'
  if (/tai khoan|mat khau|lms|email rennes|dang nhap|password|account/.test(s)) return 'Tài khoản Rennes'
  if (/visa|du hoc|nam 3|sang phap|campus france/.test(s)) return 'Du học / visa'
  if (/diem|thi|phuc khao|exam|grade/.test(s)) return 'Khảo thí'
  if (/lich|dang ky|hoc phan|bao luu|lop/.test(s)) return 'Học vụ'
  return 'Khác'
}

/* ---------- Form một bản ghi ---------- */
export function ItemForm({ project, m, item, task, users, isMgr, allItems, onOpenDocStudio, onOpenFlightWorkflow, onOpenTicketImport, onClose, onSave, onDelete }) {
  const { state: st, me, saveItem } = useStore()
  const [ckNew, setCkNew] = useState({})
  const toast = useToast()
  const [f, setF] = useState({ ...item })
  const [busy, setBusy] = useState(false)
  // tự mở xem trước file PDF/ảnh đầu tiên
  const [preview, setPreview] = useState(() => {
    for (const fd of m.fields.filter((x) => x.type === 'file')) {
      const i = (item[fd.k] || []).findIndex((x) => isPdf(x) || isImage(x))
      if (i >= 0) return fd.k + i
    }
    return null
  })
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const missing = m.fields.filter((x) => x.req && !String(f[x.k] ?? '').trim())
  const addFiles = async (k, list) => {
    setBusy(true)
    try { const up = []; for (const file of list) up.push(await uploadFile(project.id, file)); set(k, [...(f[k] || []), ...up]); toast(`Đã tải lên ${up.length} file`) }
    catch (e) { toast(e.message) } finally { setBusy(false) }
  }
  const input = (fd) => {
    const v = f[fd.k] ?? ''
    switch (fd.type) {
      case 'checklist': {
        const list = f[fd.k] || []
        const upd = (l) => set(fd.k, l)
        return (
          <div className="cklist">
            {list.map((x, i) => (
              <label key={i} className={cx('check', x.done && 'done')}>
                <input type="checkbox" checked={!!x.done} onChange={() => upd(list.map((y, j) => (j === i ? { ...y, done: !y.done, by: !y.done ? me.name : '', at: !y.done ? new Date().toISOString() : '' } : y)))} />
                <span className="grow">{x.text}</span>
                {x.done && x.by && <span className="faint small">{x.by} · {fmtDate((x.at || '').slice(0, 10))}</span>}
                <button type="button" className="iconbtn" onClick={(e) => { e.preventDefault(); upd(list.filter((_, j) => j !== i)) }} aria-label="Xóa"><L.X size={13} /></button>
              </label>
            ))}
            <div className="row" style={{ marginTop: 4 }}>
              <input className="input sm" placeholder={fd.ph || 'Thêm mục…'} value={ckNew[fd.k] || ''} onChange={(e) => setCkNew({ ...ckNew, [fd.k]: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter' && (ckNew[fd.k] || '').trim()) { e.preventDefault(); upd([...list, { text: ckNew[fd.k].trim(), done: false }]); setCkNew({ ...ckNew, [fd.k]: '' }) } }} />
            </div>
          </div>
        )
      }
      case 'long':
        if (['docs', 'gl_docs', 'gl_drafts'].includes(m.id) && fd.k === 'note') {
          return (
            <DocComments
              item={f}
              onUpdate={(updated) => {
                setF(updated)
                if (item.id) {
                  saveItem(project.id, m.id, updated, `góp ý văn bản “${updated.title || updated.docTitle || ''}”`)
                }
              }}
            />
          )
        }
        return <textarea className="textarea" rows={fd.k === 'body' ? 9 : 3} value={v} onChange={(e) => set(fd.k, e.target.value)} />
      case 'select': return <select className="select" value={v} onChange={(e) => set(fd.k, e.target.value)}><option value="">—</option>{fd.options.map((o) => <option key={o}>{o}</option>)}</select>
      case 'user': return <select className="select" value={v} onChange={(e) => set(fd.k, e.target.value)}><option value="">—</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
      case 'date': return <input className="input" type="date" value={v} onChange={(e) => set(fd.k, e.target.value)} />
      case 'time': return <input className="input" type="time" value={v} onChange={(e) => set(fd.k, e.target.value)} />
      case 'datetime': return <input className="input" type="datetime-local" value={v} onChange={(e) => set(fd.k, e.target.value)} />
      case 'money': return <MoneyInput value={v} cur="VND" onChange={(x) => set(fd.k, x)} />
      case 'number': return fd.cur ? <MoneyInput value={v} cur={fd.cur} onChange={(x) => set(fd.k, x)} /> : <input className="input" type="number" value={v} onChange={(e) => set(fd.k, e.target.value === '' ? '' : +e.target.value)} />
      case 'file': return (
        <div className="filebox">
          {(f[fd.k] || []).map((x, i) => {
            const can = isPdf(x) || isImage(x)
            const key = fd.k + i
            const shown = preview === key
            return (
              <div key={i} className={cx('fileitem-wrap', shown && 'open')}>
                <div className="fileitem">
                  {isPdf(x) ? <L.FileText size={16} color="#c62828" /> : isImage(x) ? <L.Image size={16} color="var(--teal-700)" /> : <L.File size={16} color="var(--teal-700)" />}
                  <span className="grow ellipsis" style={{ cursor: can ? 'pointer' : 'default' }} onClick={() => can && setPreview(shown ? null : key)}>{x.name}</span>
                  <span className="faint small">{x.size ? fmtSize(x.size) : ''}</span>
                  {can && <button type="button" className={cx('btn sm', shown ? 'primary' : 'ghost')} onClick={() => setPreview(shown ? null : key)}>{shown ? <L.EyeOff size={14} /> : <L.Eye size={14} />}{shown ? 'Ẩn' : 'Xem trước'}</button>}
                  <button type="button" className="iconbtn" title="Mở trong tab mới" onClick={() => openFile(x).catch((e) => toast(e.message))}><L.ExternalLink size={14} /></button>
                  <button type="button" className="iconbtn" title="Gỡ file" onClick={() => { if (confirm('Gỡ file này?')) { removeFile(x).catch(() => {}); set(fd.k, f[fd.k].filter((_, j) => j !== i)); if (shown) setPreview(null) } }}><L.X size={14} /></button>
                </div>
                {shown && (
                  <FilePreview
                    file={x}
                    item={f}
                    onUpdate={(updated) => {
                      setF(updated)
                      if (item.id) {
                        saveItem(project.id, m.id, updated, `góp ý trên file “${x.name}”`)
                      }
                    }}
                  />
                )}
              </div>
            )
          })}
          <label className="btn sm" style={{ alignSelf: 'flex-start' }}><L.Upload size={14} />{busy ? 'Đang tải…' : 'Tải file lên'}<input type="file" multiple hidden onChange={(e) => { addFiles(fd.k, [...e.target.files]); e.target.value = '' }} /></label>
        </div>
      )
      default: return <input className="input" type={fd.type === 'email' ? 'email' : fd.type === 'phone' ? 'tel' : 'text'} placeholder={fd.ph || ''} value={v} onChange={(e) => set(fd.k, e.target.value)} />
    }
  }
  const wide = (fd) => ['long', 'file', 'checklist'].includes(fd.type) || fd.w >= 220
  const fmtC = (c, v) => (c.type === 'eur' ? '€ ' + (+v || 0).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : c.type === 'money' ? money(v) + ' ₫' : v === '' ? '—' : String(v))
  return (
    <Modal title={item.id ? `${m.name}: ${item[m.title] || ''}` : `Thêm ${m.item}`} onClose={onClose} width={760}
      footer={<>
        {item.id && isMgr && <button className="btn danger" style={{ marginRight: 'auto' }} onClick={() => confirm('Xóa bản ghi này?') && onDelete()}><L.Trash2 size={15} />Xóa</button>}
        {item.updatedAt && <span className="small faint" style={{ marginRight: 'auto' }}>Cập nhật {timeAgo(item.updatedAt)}</span>}
        <button className="btn ghost" onClick={onClose}>Hủy</button>
        <button className="btn primary" disabled={busy || missing.length > 0} title={missing.length ? 'Thiếu: ' + missing.map((x) => x.label).join(', ') : ''} onClick={() => onSave(f)}>Lưu</button>
      </>}>
      {['trips', 'gl_trips'].includes(m.id) && (
        <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-900)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <L.PlaneTakeoff size={15} color="var(--teal-700)" />
            Công cụ hỗ trợ chuyến công tác:
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn sm primary"
              style={{ background: '#0f766e', color: '#fff', border: 'none' }}
              onClick={() => { onClose(); onOpenFlightWorkflow && onOpenFlightWorkflow(); }}
            >
              <L.PlaneTakeoff size={14} /> Điều phối chuyến & Tìm vé
            </button>
            <button
              type="button"
              className="btn sm accent"
              onClick={() => { onClose(); onOpenTicketImport && onOpenTicketImport(); }}
            >
              <L.TicketsPlane size={14} /> Nhập vé máy bay (PDF)
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={() => { onClose(); onOpenDocStudio && onOpenDocStudio({ template: 'flightReq', item: f }); }}
            >
              <L.FileSignature size={14} /> Mẫu biểu & Xuất Word/PDF
            </button>
          </div>
        </div>
      )}
      {task && <ApproveBar task={task} compact />}
      {m.docs && (
        <div className="doc-bar">
          <L.FileOutput size={16} color="var(--teal-700)" /><span className="small" style={{ fontWeight: 600 }}>Tạo biểu mẫu & xuất Word/PDF:</span>
          {m.docs.map((k) => (
            <button
              key={k}
              type="button"
              className="btn sm"
              onClick={() => onOpenDocStudio ? onOpenDocStudio({ template: k, item: f }) : openDoc(k, f, { users: st.users, items: allItems || [] })}
            >
              {DOC_TEMPLATES[k]?.label || k}
            </button>
          ))}
        </div>
      )}
      {m.computed && ['trips', 'transfers'].includes(m.id) && (
        <div className="calc-box">
          <div className="small muted" style={{ marginBottom: 6 }}><L.Calculator size={13} style={{ verticalAlign: -2 }} /> {m.id === 'trips' ? 'Tự tính theo MOA Phụ lục 2 – thay đổi số giờ, ngày, tỷ giá ở dưới là cập nhật ngay' : 'Tự tính: số SV × phí/SV (MOA: €900/SV năm 3 = €175 lệ phí + €725 quản lý văn bằng) × tỷ giá'}</div>
          <div className="calc-grid">{Object.entries(m.computed).map(([k, c]) => <div key={k}><span>{c.label}</span><b>{fmtC(c, c.fn(f))}</b></div>)}</div>
        </div>
      )}
      <div className="form-grid">
        {m.fields.map((fd) => (
          <div key={fd.k} className={cx('field', wide(fd) && 'wide')}><label>{fd.label}{fd.req && ' *'}</label>{input(fd)}</div>
        ))}
        {m.computed && !['trips', 'transfers'].includes(m.id) && Object.entries(m.computed).map(([k, c]) => <div key={k} className="field"><label>{c.label}</label><div className="input" style={{ background: '#f7fafa', fontWeight: 700 }}>{fmtC(c, c.fn(f))}</div></div>)}
      </div>
    </Modal>
  )
}

/* ---------- Xem trước file (PDF nhúng, cuộn độc lập; ảnh; bình luận cộng tác) ---------- */
export function FilePreview({ file, height = 560, item, onUpdate }) {
  const [url, setUrl] = useState(null)
  const [err, setErr] = useState('')
  const [showComments, setShowComments] = useState(false)

  const comments = item?.docComments || []
  const openCount = comments.filter((c) => !c.resolved).length

  useEffect(() => {
    let revoke, alive = true
    setUrl(null); setErr('')
    fileUrl(file).then((r) => { if (alive) { setUrl(r.url); revoke = r.revoke } else r.revoke?.() }).catch((e) => alive && setErr(e.message))
    return () => { alive = false; revoke?.() }
  }, [file.path, file.dataUrl, file.name])

  if (err) return <div className="preview-box msg"><L.FileWarning size={22} />{err}</div>
  if (!url) return <div className="preview-box msg" style={{ height: 120 }}><span className="spin" />Đang tải bản xem trước…</div>

  return (
    <div className="file-preview-wrap" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: '#fff', marginTop: 8 }}>
      {item && onUpdate && (
        <div className="row between" style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
          <div className="row" style={{ gap: 6, fontWeight: 600, color: 'var(--teal-900)' }}>
            <L.FileText size={15} color="var(--teal-700)" />
            <span className="ellipsis" style={{ maxWidth: 280 }}>{file.name}</span>
            {openCount > 0 && (
              <span className="badge" style={{ background: '#fff4e0', color: '#b45309', fontSize: 11, fontWeight: 700, gap: 4, display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                {openCount} góp ý
              </span>
            )}
          </div>
          <button
            type="button"
            className={cx('btn sm', showComments ? 'primary' : 'ghost')}
            style={{ fontSize: 12, padding: '4px 10px', gap: 6 }}
            onClick={() => setShowComments(!showComments)}
          >
            <L.MessageSquare size={13} />
            {showComments ? 'Ẩn bình luận' : `Bình luận & Góp ý (${comments.length})`}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: showComments && item && onUpdate ? '1fr 340px' : '1fr', minHeight: height }}>
        <div className="preview-box" style={{ height, margin: 0, border: 'none', borderRadius: 0 }}>
          {isImage(file) ? (
            <img src={url} alt={file.name} style={{ maxHeight: height, width: '100%', objectFit: 'contain' }} />
          ) : (
            <iframe src={url + '#view=FitH&toolbar=1&navpanes=0'} title={'Xem trước ' + file.name} style={{ width: '100%', height: '100%', border: 'none' }} />
          )}
        </div>
        {showComments && item && onUpdate && (
          <div style={{ borderLeft: '1px solid var(--border)', padding: 12, background: '#fafbfc', overflowY: 'auto', maxHeight: height }}>
            <DocComments item={item} onUpdate={onUpdate} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Nhập vé máy bay từ PDF ---------- */
/* ---------- Modal chọn phương thức thêm chuyến công tác ---------- */
function AddTripModal({ onClose, onOpenFlightWorkflow, onOpenTicketImport, onOpenDocStudio, onManualAdd }) {
  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620, width: '92%' }}>
        <div className="modal-head">
          <div>
            <h3 style={{ margin: 0, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
              <L.PlaneTakeoff size={20} color="var(--teal-700)" />
              Thêm chuyến công tác
            </h3>
            <div className="small muted" style={{ marginTop: 2 }}>
              Chọn phương thức tạo đợt công tác và bố trí hậu cần
            </div>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Đóng"><L.X size={18} /></button>
        </div>

        <div className="modal-body" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 1. Điều phối chuyến & Tìm vé */}
          <div
            className="card click"
            style={{
              padding: '14px 16px',
              border: '2px solid var(--teal-600)',
              background: 'linear-gradient(180deg, #f0fdfa 0%, #fff 100%)',
              borderRadius: 12,
              cursor: 'pointer',
            }}
            onClick={() => { onClose(); onOpenFlightWorkflow?.(); }}
          >
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div className="row" style={{ gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-700)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <L.PlaneTakeoff size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <b style={{ fontSize: 15, color: 'var(--teal-900)' }}>Điều phối chuyến & Tìm vé</b>
                    <span className="badge" style={{ background: 'var(--teal-700)', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 99 }}>Khuyến nghị</span>
                  </div>
                  <div className="small muted" style={{ marginTop: 4, lineHeight: 1.45 }}>
                    Quy trình 5 bước tự động: chọn giảng viên, tra cứu chuyến bay (VNA, Bamboo, Vietjet, Air France), xếp phòng khách sạn và xuất phiếu đề xuất.
                  </div>
                </div>
              </div>
              <span className="small bold" style={{ color: 'var(--teal-700)', display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8, marginTop: 4 }}>
                Bắt đầu điều phối <L.ChevronRight size={14} />
              </span>
            </div>
          </div>

          {/* 2. Nhập vé máy bay (PDF) */}
          <div
            className="card click"
            style={{
              padding: '14px 16px',
              border: '1px solid var(--border)',
              borderRadius: 12,
              cursor: 'pointer',
            }}
            onClick={() => { onClose(); onOpenTicketImport?.(); }}
          >
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div className="row" style={{ gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <L.TicketsPlane size={22} />
                </div>
                <div>
                  <b style={{ fontSize: 14.5 }}>Nhập vé máy bay (PDF / E-ticket)</b>
                  <div className="small muted" style={{ marginTop: 3, lineHeight: 1.45 }}>
                    Tải file vé điện tử PDF, hệ thống tự động bóc tách mã đặt chỗ PNR, số hiệu chuyến bay, chặng bay, giờ bay và chi phí vé.
                  </div>
                </div>
              </div>
              <span className="small bold" style={{ color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8, marginTop: 4 }}>
                Nhập file PDF <L.ChevronRight size={14} />
              </span>
            </div>
          </div>

          {/* 3. Mẫu biểu & Xuất Word/PDF */}
          <div
            className="card click"
            style={{
              padding: '14px 16px',
              border: '1px solid var(--border)',
              borderRadius: 12,
              cursor: 'pointer',
            }}
            onClick={() => { onClose(); onOpenDocStudio?.(); }}
          >
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div className="row" style={{ gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', color: '#15803d', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <L.FileSignature size={22} />
                </div>
                <div>
                  <b style={{ fontSize: 14.5 }}>Mẫu biểu & Xuất Word/PDF</b>
                  <div className="small muted" style={{ marginTop: 3, lineHeight: 1.45 }}>
                    Lập văn bản đề xuất đặt vé máy bay, giấy đi đường, kế hoạch công tác theo chuẩn mẫu hành chính UEH.
                  </div>
                </div>
              </div>
              <span className="small bold" style={{ color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8, marginTop: 4 }}>
                Mở biểu mẫu <L.ChevronRight size={14} />
              </span>
            </div>
          </div>

          {/* 4. Nhập thủ công */}
          <div
            className="card click"
            style={{
              padding: '14px 16px',
              border: '1px solid var(--border)',
              borderRadius: 12,
              cursor: 'pointer',
            }}
            onClick={() => { onClose(); onManualAdd?.(); }}
          >
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div className="row" style={{ gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', color: '#4b5563', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <L.PencilLine size={22} />
                </div>
                <div>
                  <b style={{ fontSize: 14.5 }}>Nhập thông tin thủ công</b>
                  <div className="small muted" style={{ marginTop: 3, lineHeight: 1.45 }}>
                    Mở form để tự điền chi tiết giảng viên, lịch trình đi/về, khách sạn, chi phí và tài liệu đính kèm.
                  </div>
                </div>
              </div>
              <span className="small bold" style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8, marginTop: 4 }}>
                Điền form <L.ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>

        <div className="modal-foot" style={{ justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}

function TicketImport({ project, m, items, onClose, onDone }) {
  const { saveItem } = useStore()
  const toast = useToast()
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [f, setF] = useState(null)
  const [raw, setRaw] = useState('')
  const [target, setTarget] = useState('new')
  const [showRaw, setShowRaw] = useState(false)
  const nz = (x) => normalize(x || '').replace(/^(prof|dr|mr|mrs|ms)\.?\s+/, '')
  const read = async (fl) => {
    setFile(fl); setErr(''); setBusy(true); setF(null)
    try {
      const { pdfText, parseTicket } = await import('./ticket.js')
      const text = await pdfText(fl)
      setRaw(text)
      if (text.replace(/\s/g, '').length < 30) { setErr('PDF này là ảnh scan, không có chữ để đọc. Hãy dùng file e-ticket gốc do hãng/đại lý gửi, hoặc nhập tay.'); return }
      const t = parseTicket(text)
      const fx = MOA.fx
      setF({ lecturer: t.lecturer, outFlight: t.outFlight, departAt: t.departAt, arriveAt: t.arriveAt, returnFlight: t.returnFlight, returnAt: t.returnAt, pnr: t.pnr, ticketNo: t.ticketNo,
        price: t.price || '', currency: t.currency || 'VND', fx, legs: t.flights })
      // tự khớp với chuyến có sẵn theo tên GV
      const key = nz(t.lecturer).split(' ').filter((w) => w.length > 2)
      const hit = items.find((x) => key.length && key.filter((w) => nz(x.lecturer).includes(w)).length >= Math.min(2, key.length))
      setTarget(hit ? hit.id : 'new')
      if (!t.flights.length) setErr('Không tìm thấy số hiệu chuyến bay trong file – kiểm tra lại các ô bên dưới hoặc xem “Nội dung đọc được”.')
    } catch (e) { setErr('Không đọc được PDF: ' + e.message) } finally { setBusy(false) }
  }
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const save = async () => {
    setBusy(true)
    try {
      let att = null
      try { att = await uploadFile(project.id, file) } catch (e) { toast(e.message) }
      const base = target === 'new' ? newItem(m) : items.find((x) => x.id === target)
      const ticketVnd = f.price ? (f.currency === 'EUR' ? Math.round(+f.price * (+f.fx || MOA.fx)) : +f.price) : base.ticketCost
      const pick = (k) => (f[k] ? f[k] : base[k])
      const rec = {
        ...base, lecturer: pick('lecturer') || base.lecturer || 'Giảng viên', outFlight: pick('outFlight'), departAt: pick('departAt'), arriveAt: pick('arriveAt'),
        returnFlight: pick('returnFlight'), returnAt: pick('returnAt'), ticketCost: ticketVnd,
        checkIn: base.checkIn || (f.arriveAt || '').slice(0, 10), checkOut: base.checkOut || (f.returnAt || '').slice(0, 10),
        steps: (base.steps || []).map((x) => (/vé máy bay/i.test(x.text) ? { ...x, done: true, at: new Date().toISOString() } : x)),
        files: [...(base.files || []), ...(att ? [att] : [])],
        note: [base.note, `Vé: ${[f.pnr && 'mã đặt chỗ ' + f.pnr, f.ticketNo && 'số vé ' + f.ticketNo, f.price && `giá ${(+f.price).toLocaleString('vi-VN')} ${f.currency}`].filter(Boolean).join(', ')} (đọc từ ${file.name})`].filter(Boolean).join('\n'),
      }
      const id = saveItem(project.id, m.id, rec, `vé máy bay của ${rec.lecturer} (đọc từ PDF)`)
      toast(target === 'new' ? 'Đã tạo chuyến công tác từ vé' : 'Đã cập nhật thông tin vé vào chuyến')
      onDone({ ...rec, id })
    } finally { setBusy(false) }
  }
  const row = (k, label, type = 'text') => (
    <div className="field"><label>{label}</label><input className="input" type={type} value={f[k] || ''} onChange={(e) => set(k, e.target.value)} /></div>
  )
  return (
    <Modal title="Nhập vé máy bay từ PDF" onClose={onClose} width={760}
      footer={<><button className="btn ghost" onClick={onClose}>Hủy</button><button className="btn primary" disabled={!f || busy} onClick={save}><L.Check size={15} />{target === 'new' ? 'Tạo chuyến công tác' : 'Cập nhật vào chuyến đã chọn'}</button></>}>
      <label className="dropzone">
        <L.TicketsPlane size={28} color="var(--teal-600)" />
        <span>{file ? file.name : 'Bấm để chọn file vé máy bay (PDF e-ticket / itinerary)'}</span>
        <span className="small faint" style={{ fontWeight: 400 }}>Đọc được vé Air France, Vietnam Airlines và hầu hết vé điện tử có chữ (không phải ảnh scan)</span>
        <input type="file" accept="application/pdf,.pdf" hidden onChange={(e) => e.target.files[0] && read(e.target.files[0])} />
      </label>
      {busy && <div className="preview-box msg" style={{ height: 60 }}><span className="spin" />Đang đọc vé…</div>}
      {err && <div className="callout review"><L.CircleAlert size={18} color="var(--orange-600)" style={{ flexShrink: 0 }} />{err}</div>}
      {f && (
        <>
          <div className="callout info"><L.ScanText size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} /><div>Đã đọc được <b>{f.legs.length}</b> chặng bay{f.pnr ? <> · mã đặt chỗ <b>{f.pnr}</b></> : ''}. Kiểm tra lại các ô bên dưới trước khi lưu.</div></div>
          {f.legs.length > 0 && (
            <table className="tbl" style={{ fontSize: 13 }}>
              <thead><tr><th>Chuyến</th><th>Chặng</th><th>Khởi hành</th><th>Đến</th></tr></thead>
              <tbody>{f.legs.map((l) => <tr key={l.code}><td><b>{l.code}</b></td><td>{l.from || '?'} → {l.to || '?'}</td><td>{fmtDT(l.depart)}</td><td>{fmtDT(l.arrive)}</td></tr>)}</tbody>
            </table>
          )}
          <div className="field"><label>Lưu vào</label>
            <select className="select" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="new">➕ Tạo chuyến công tác mới</option>
              {items.map((x) => <option key={x.id} value={x.id}>Cập nhật chuyến: {x.lecturer} – {x.course || ''}</option>)}
            </select>
          </div>
          <div className="form-grid">
            {row('lecturer', 'Giảng viên (tên hành khách)')}
            <div />
            {row('outFlight', 'Chuyến bay đến')}
            {row('returnFlight', 'Chuyến bay về')}
            {row('departAt', 'Khởi hành', 'datetime-local')}
            {row('arriveAt', 'Đến SGN', 'datetime-local')}
            {row('returnAt', 'Giờ bay về', 'datetime-local')}
            {row('pnr', 'Mã đặt chỗ (PNR)')}
            <div className="field"><label>Giá vé</label>
              <div className="row"><MoneyInput value={f.price} cur={f.currency === 'EUR' ? 'EUR' : 'VND'} onChange={(v) => set('price', v)} />
                <select className="select" style={{ width: 90 }} value={f.currency} onChange={(e) => set('currency', e.target.value)}><option>VND</option><option>EUR</option></select></div>
            </div>
            {f.currency === 'EUR' && <div className="field"><label>Tỷ giá quy đổi (VND/EUR)</label><MoneyInput value={f.fx} cur="VND" onChange={(v) => set('fx', v)} /></div>}
          </div>
          <button type="button" className="btn sm ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setShowRaw(!showRaw)}><L.FileText size={14} />{showRaw ? 'Ẩn' : 'Xem'} nội dung đọc được từ PDF</button>
          {showRaw && <pre className="rawtext">{raw}</pre>}
        </>
      )}
    </Modal>
  )
}

/* ---------- Ô nhập tiền: có đơn vị & phân cách hàng nghìn ---------- */
export function MoneyInput({ value, onChange, cur = 'VND', placeholder }) {
  const [focus, setFocus] = useState(false)
  const [txt, setTxt] = useState('')
  const dec = cur === 'EUR'
  const fmt = (v) => (v === '' || v == null || isNaN(+v) ? '' : (+v).toLocaleString('vi-VN', { maximumFractionDigits: dec ? 2 : 0 }))
  const parse = (s) => {
    const t = s.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
    return t === '' ? '' : dec ? Math.round(+t * 100) / 100 : Math.round(+t)
  }
  return (
    <div className="money-in">
      <input className="input" inputMode="decimal" placeholder={placeholder || '0'} value={focus ? txt : fmt(value)}
        onFocus={() => { setFocus(true); setTxt(fmt(value)) }} onBlur={() => setFocus(false)}
        onChange={(e) => { setTxt(e.target.value); const v = parse(e.target.value); onChange(v === '' || !isNaN(v) ? v : value) }} />
      <span className="cur">{cur === 'EUR' ? '€' : cur === 'VND/EUR' ? 'VND/€' : '₫'}</span>
    </div>
  )
}

/* ---------- Nhập từ CSV/Excel ---------- */
function ImportModal({ project, m, items, onClose, template }) {
  const { saveItems } = useStore()
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const keyField = m.id === 'students' ? 'studentId' : null
  const onFile = async (file) => {
    setErr('')
    if (/\.xlsx?$/i.test(file.name)) { setErr('Hãy lưu file Excel dưới dạng CSV (File → Save As → CSV UTF-8) rồi tải lên.'); return }
    const data = parseCSV(await file.text())
    if (data.length < 2) { setErr('File không có dữ liệu.'); return }
    const head = data[0].map((h) => normalize(h.trim()))
    const map = head.map((h) => m.fields.find((f) => normalize(f.label) === h || normalize(f.k) === h || normalize(f.label).startsWith(h) && h.length > 2))
    if (!map.some(Boolean)) { setErr('Không nhận ra cột nào. Hãy dùng file mẫu (dòng đầu là tên cột).'); return }
    const out = data.slice(1).map((r) => {
      const o = {}
      map.forEach((f, i) => {
        if (!f || r[i] == null || r[i] === '') return
        let v = r[i].trim()
        if (f.type === 'date') v = normDate(v)
        if (f.type === 'money' || f.type === 'number') v = +v.replace(/[^\d.-]/g, '') || 0
        if (f.type === 'select') v = f.options.find((x) => normalize(x) === normalize(v)) || v
        o[f.k] = v
      })
      return o
    }).filter((o) => Object.keys(o).length)
    setRows({ list: out, cols: map.filter(Boolean).map((f) => f.label) })
  }
  const commit = () => {
    let upd = 0
    const list = rows.list.map((o) => {
      const ex = keyField && o[keyField] && items.find((x) => x[keyField] === o[keyField])
      if (ex) { upd++; return { ...ex, ...o } }
      return o
    })
    saveItems(project.id, m.id, list, `nhập ${list.length} ${m.item} từ file (${upd} cập nhật, ${list.length - upd} mới)`)
    toast(`Đã nhập ${list.length} ${m.item}`)
    onClose()
  }
  return (
    <Modal title={`Nhập ${m.name} từ Excel/CSV`} onClose={onClose} width={640}
      footer={<><button className="btn ghost" onClick={onClose}>Hủy</button><button className="btn primary" disabled={!rows?.list.length} onClick={commit}><L.Upload size={15} />Nhập {rows?.list.length || ''} dòng</button></>}>
      <ol className="small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
        <li>Tải <a href="#" onClick={(e) => { e.preventDefault(); template() }}>file mẫu CSV</a> (mở bằng Excel), điền dữ liệu, lưu lại dạng <b>CSV UTF-8</b>.</li>
        <li>Dòng đầu là tên cột (giống file mẫu). Ngày dạng dd/mm/yyyy hoặc yyyy-mm-dd.</li>
        {keyField && <li>Nếu <b>MSSV</b> đã có trong hệ thống → dòng đó sẽ <b>cập nhật</b> thay vì tạo mới.</li>}
      </ol>
      <label className="dropzone">
        <L.FileSpreadsheet size={28} color="var(--teal-600)" />
        <span>Bấm để chọn file CSV</span>
        <input type="file" accept=".csv,.txt,.tsv,.xlsx,.xls" hidden onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      </label>
      {err && <div className="callout review"><L.CircleAlert size={18} color="var(--orange-600)" />{err}</div>}
      {rows && <div className="callout info"><L.CheckCircle2 size={18} color="var(--teal-700)" /><div>Đọc được <b>{rows.list.length}</b> dòng · cột nhận diện: {rows.cols.join(', ')}</div></div>}
    </Modal>
  )
}

function PasteEmail({ onClose, onSave }) {
  const [t, setT] = useState('')
  return (
    <Modal title="Dán nội dung email" onClose={onClose} width={640}
      footer={<><button className="btn ghost" onClick={onClose}>Hủy</button><button className="btn primary" disabled={!t.trim()} onClick={() => onSave(parsePasted(t))}>Thêm vào hộp thư</button></>}>
      <div className="small muted">Mở email trong Outlook/Gmail → chọn toàn bộ (kể cả dòng Từ/From, Tiêu đề/Subject) → sao chép và dán vào đây. Hệ thống tự tách người gửi, tiêu đề và nội dung.</div>
      <textarea className="textarea" rows={12} autoFocus value={t} onChange={(e) => setT(e.target.value)} placeholder={'From: Nguyễn Văn A <a.nguyen@st.ueh.edu.vn>\nSubject: Xin hỗ trợ tài khoản LMS Rennes\n\nEm chào thầy cô, …'} />
    </Modal>
  )
}

/* ---------- Xét điều kiện bằng Rennes ---------- */
function Eligibility({ rows, students }) {
  const by = {}
  rows.forEach((r) => { if (r.studentId) (by[r.studentId] ||= []).push(r) })
  const list = Object.entries(by).map(([sid, g]) => {
    const scored = g.filter((x) => x.score20 !== '' && x.score20 != null)
    const avg = scored.length ? scored.reduce((s, x) => s + +x.score20, 0) / scored.length : null
    const low = scored.filter((x) => +x.score20 < MOA.passMark20)
    const stu = students.find((x) => x.studentId === sid)
    const ok = scored.length > 0 && avg >= MOA.passMark20 && !low.length
    return { sid, name: stu?.fullName || g[0].fullName, cls: stu?.className || '', dual: stu?.dualDegree || '', n: scored.length, total: g.length, avg, low, ok }
  }).sort((a, b) => (a.ok === b.ok ? (a.name || '').localeCompare(b.name || '') : a.ok ? 1 : -1))
  if (!list.length) return <div className="card"><Empty icon="Award" text="Chưa có điểm. Nhập điểm từ bảng điểm Rennes (CSV) ở nút “Nhập”." /></div>
  const okN = list.filter((x) => x.ok).length
  return (
    <div className="card tbl-wrap">
      <div className="callout info" style={{ margin: 12 }}><L.Info size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} /><div>Điều kiện (MOA Điều 9): điểm TB các học phần GV Rennes giảng năm 2–3 <b>≥ 10/20</b> và <b>không học phần nào &lt; 10/20</b>. Hiện <b>{okN}/{list.length}</b> SV đang đủ điều kiện.</div></div>
      <table className="tbl ws-tbl">
        <thead><tr><th>MSSV</th><th>Họ tên</th><th>Lớp</th><th>Song bằng</th><th style={{ textAlign: 'right' }}>Số HP có điểm</th><th style={{ textAlign: 'right' }}>TB /20</th><th style={{ textAlign: 'right' }}>TB /10</th><th>Học phần dưới 10/20</th><th>Kết quả</th></tr></thead>
        <tbody>{list.map((x) => (
          <tr key={x.sid}>
            <td>{x.sid}</td><td style={{ fontWeight: 600 }}>{x.name}</td><td>{x.cls}</td><td>{x.dual && <Pill v={x.dual} />}</td>
            <td className="num" style={{ textAlign: 'right' }}>{x.n}/{x.total}</td>
            <td className="num" style={{ textAlign: 'right', fontWeight: 700 }}>{x.avg == null ? '—' : x.avg.toFixed(2)}</td>
            <td className="num" style={{ textAlign: 'right' }}>{x.avg == null ? '—' : (x.avg / 2).toFixed(2)}</td>
            <td className="tone-danger small">{x.low.map((l) => `${l.course} (${l.score20})`).join('; ') || '—'}</td>
            <td><Pill v={x.ok ? 'Đủ điều kiện' : 'Chưa đủ điều kiện'} /></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

/* ---------- Modal Cập nhật nhanh trạng thái Buổi học (Hoàn thành / Hủy) ---------- */
function SessionQuickModal({ session, project, sessNo, onClose, onEditFull }) {
  const { saveItem } = useStore()
  const toast = useToast()

  const setStatus = (statusLabel) => {
    saveItem(
      project?.id || 'p1',
      'sessions',
      { ...session, status: statusLabel },
      `cập nhật trạng thái buổi ${sessNo} môn “${session.course}” thành “${statusLabel}”`
    )
    toast(statusLabel === 'Đã dạy' ? 'Đã hoàn thành buổi học' : statusLabel === 'Hủy' ? 'Đã đánh dấu hủy buổi học' : `Đã chuyển sang “${statusLabel}”`)
    onClose()
  }

  const cls = session.teachingGroup || session.className || (session.cohort?.includes('52') ? 'ISB-K52-01' : 'ISB-K51-01')
  const isDone = session.status === 'Đã dạy'
  const isCancel = session.status === 'Hủy'

  return (
    <Modal title={`Buổi học: ${session.course} (${sessNo})`} onClose={onClose} width={480}>
      <div className="stack" style={{ gap: 14 }}>
        <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            {session.course} <span style={{ color: 'var(--teal-700)' }}>({sessNo})</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginTop: 10 }}>
            <div><span className="muted">📅 Ngày:</span> <b>{fmtDate(session.date)}</b></div>
            <div><span className="muted">⏰ Giờ:</span> <b>{session.start} – {session.end}</b></div>
            <div><span className="muted">🎓 Lớp:</span> <b>{cls}</b></div>
            <div><span className="muted">📍 Phòng:</span> <b>{session.room ? `P.${session.room}` : 'Chưa xếp'}</b></div>
            <div style={{ gridColumn: 'span 2' }}>
              <span className="muted">👨‍🏫 Giảng viên:</span> <b>{session.lecturer || 'Chưa phân công'} ({session.side || 'UEH'})</b>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span className="muted">Trạng thái hiện tại:</span>
              <span className={cx('badge', isDone ? 'pill-success' : isCancel ? 'pill-danger' : 'pill-info')}>
                {session.status || 'Dự kiến'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: 8 }}>
            Cập nhật tình trạng buổi học:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              className="btn"
              style={{
                background: isDone ? '#15803d' : '#16a34a',
                color: '#fff',
                borderColor: '#15803d',
                justifyContent: 'center',
                fontWeight: 700,
                padding: '10px 14px',
                gap: 6,
              }}
              onClick={() => setStatus('Đã dạy')}
            >
              <L.CheckCircle2 size={16} />
              Hoàn thành (Đã dạy)
            </button>

            <button
              type="button"
              className="btn"
              style={{
                background: isCancel ? '#991b1b' : '#dc2626',
                color: '#fff',
                borderColor: '#b91c1c',
                justifyContent: 'center',
                fontWeight: 700,
                padding: '10px 14px',
                gap: 6,
              }}
              onClick={() => setStatus('Hủy')}
            >
              <L.XCircle size={16} />
              Hủy buổi học
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              type="button"
              className="btn sm"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setStatus('Dời lịch')}
            >
              <L.CalendarClock size={14} /> Dời lịch
            </button>
            <button
              type="button"
              className="btn sm"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setStatus('Đã xác nhận')}
            >
              <L.Clock size={14} /> Đã xác nhận
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 4 }}>
          <button
            type="button"
            className="btn sm ghost"
            onClick={() => { onClose(); onEditFull && onEditFull(session); }}
          >
            <L.Pencil size={13} /> Sửa thông tin chi tiết
          </button>
          <button type="button" className="btn sm ghost" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </Modal>
  )
}

/* Helper lấy lớp / khóa của buổi học */
const getSessionCohort = (r) => {
  if (r.teachingGroup && r.teachingGroup.includes('52')) return 'K52'
  if (r.className && r.className.includes('52')) return 'K52'
  if (r.cohort && r.cohort.includes('52')) return 'K52'
  return 'K50–K51'
}

/* Helper map số thứ tự buổi học theo môn */
const computeSessionIndexMap = (allRows) => {
  const map = {}
  const byCourse = {}
  allRows.forEach((r) => {
    if (!r.course) return
    const grp = getSessionCohort(r)
    const key = r.course + '__' + grp
    ;(byCourse[key] ||= []).push(r)
  })
  Object.values(byCourse).forEach((list) => {
    list.sort((a, b) => ((a.date || '') + (a.start || '')).localeCompare((b.date || '') + (b.start || '')))
    list.forEach((r, idx) => {
      map[r.id] = idx + 1
    })
  })
  return map
}

/* ---------- Lịch giảng dạng lịch tháng ---------- */
function SessionCalendar({ rows, project, onOpen }) {
  const [off, setOff] = useState(0)
  const [cohortFilter, setCohortFilter] = useState('all') // 'all' | 'K50–K51' | 'K52'
  const [quickSess, setQuickSess] = useState(null)

  const sessionIndexMap = useMemo(() => computeSessionIndexMap(rows), [rows])

  const filteredRows = useMemo(() => {
    if (cohortFilter === 'all') return rows
    return rows.filter((r) => getSessionCohort(r) === cohortFilter)
  }, [rows, cohortFilter])

  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + off)
  const y = base.getFullYear(), mo = base.getMonth()
  const start = new Date(y, mo, 1 - ((new Date(y, mo, 1).getDay() + 6) % 7))
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
  const by = {}; filteredRows.forEach((r) => r.date && (by[r.date] ||= []).push(r))
  const isRennes = (r) => {
    if (r.side === 'Rennes') return true
    if (r.side === 'UEH') return false
    const rennesNames = ['Franck Martin', 'Fabien Rondeau', 'Jean-Christophe Poutineau', 'Christophe Tavera', 'Cécile Casteuble', 'Tovonony Razafindrabe', 'Tovonony Razafindramary', 'Eric Avenel', 'Yvon Rocaboy', 'Thomas Vendryes', 'David Masclet', 'Benoit Le Maux', 'Maurice Baslé']
    if (r.lecturer && rennesNames.some((n) => sameName(r.lecturer, n))) return true
    return false
  }
  const color = (r) => (isRennes(r) ? '#d4712f' : '#03616a')

  const k50Count = rows.filter((r) => getSessionCohort(r) === 'K50–K51').length
  const k52Count = rows.filter((r) => getSessionCohort(r) === 'K52').length

  return (
    <div className="card">
      <div className="row between wrap" style={{ padding: '12px 16px', gap: 10 }}>
        <div className="row" style={{ gap: 6 }}>
          <button className="iconbtn" onClick={() => setOff(off - 1)} aria-label="Tháng trước"><L.ChevronLeft size={18} /></button>
          <button className="btn sm" onClick={() => setOff(0)}>Tháng này</button>
          <button className="iconbtn" onClick={() => setOff(off + 1)} aria-label="Tháng sau"><L.ChevronRight size={18} /></button>
          <b style={{ marginLeft: 8, textTransform: 'capitalize' }}>{base.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</b>
        </div>

        {/* Lọc theo lớp: K50–K51 và K52 */}
        <div className="row" style={{ gap: 12 }}>
          <div className="seg sm">
            <button className={cohortFilter === 'all' ? 'on' : ''} onClick={() => setCohortFilter('all')}>
              Tất cả các lớp ({rows.length})
            </button>
            <button className={cohortFilter === 'K50–K51' ? 'on' : ''} onClick={() => setCohortFilter('K50–K51')}>
              Lớp K50–K51 ({k50Count})
            </button>
            <button className={cohortFilter === 'K52' ? 'on' : ''} onClick={() => setCohortFilter('K52')}>
              Lớp K52 ({k52Count})
            </button>
          </div>
          <span className="row small muted hide-sm" style={{ gap: 10 }}>
            <span className="row" style={{ gap: 4 }}><i className="lg" style={{ background: '#d4712f' }} />GV Rennes</span>
            <span className="row" style={{ gap: 4 }}><i className="lg" style={{ background: '#03616a' }} />GV UEH</span>
          </span>
        </div>
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
              {list.map((r) => {
                const sessNo = sessionIndexMap[r.id] || 1
                const isDone = r.status === 'Đã dạy'
                const isCancel = r.status === 'Hủy'
                const isPostponed = r.status === 'Dời lịch'
                const sideColor = color(r)
                return (
                  <div
                    key={r.id}
                    className={cx('ev sess', isCancel && 'past')}
                    onClick={() => setQuickSess(r)}
                    style={{
                      borderLeftColor: sideColor,
                      background: sideColor + '14',
                      textDecoration: isCancel ? 'line-through' : 'none',
                      opacity: isCancel ? 0.6 : 1,
                      cursor: 'pointer',
                    }}
                    title={`Buổi (${sessNo}): ${r.start || ''}–${r.end || ''} · ${r.course} · ${r.lecturer || ''} · ${isRennes(r) ? 'Đại học Rennes' : 'UEH'} · Bấm để đổi Hoàn thành / Hủy`}
                  >
                    <b>{r.start}</b> {r.course} ({sessNo})
                    <div className="sess-sub">
                      {r.room ? 'P.' + r.room : ''}{r.lecturer ? ' · ' + r.lecturer : ''}
                      {isDone && <span style={{ color: '#16a34a', marginLeft: 4, fontWeight: 700 }}>✓ Đã dạy</span>}
                      {isPostponed && <span style={{ color: '#b45309', marginLeft: 4, fontWeight: 700 }}>⚠ Dời lịch</span>}
                      {isCancel && <span style={{ color: '#dc2626', marginLeft: 4, fontWeight: 700 }}>✕ Đã hủy</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {quickSess && (
        <SessionQuickModal
          session={quickSess}
          project={project}
          sessNo={sessionIndexMap[quickSess.id] || 1}
          onClose={() => setQuickSess(null)}
          onEditFull={onOpen}
        />
      )}
    </div>
  )
}

/* ---------- Timeline từng học phần (chia theo lớp K50-K51 & K52) ---------- */
/* ---------- 04 Khảo thí: tiến độ đề thi → phòng thi → gửi bài Rennes chấm → bảng điểm → HĐ Khảo thí ---------- */
function ExamPipeline({ rows, onOpen }) {
  const stage = (r) => [
    { k: 'Đề thi', done: ['Đã duyệt đề', 'Đã in & niêm phong'].includes(r.paperStatus), info: r.paperStatus || 'Chưa nhận đề' },
    { k: 'Phòng & coi thi', done: !!r.room && !!r.proctor && r.roomStatus !== 'Chưa đăng ký', info: [r.room && 'P.' + r.room, r.proctor].filter(Boolean).join(' · ') || 'Chưa bố trí' },
    { k: 'Gửi bài Rennes chấm', done: !!r.scriptsSentAt, info: r.scriptsSentAt ? `${fmtDate(r.scriptsSentAt)} · ${r.scriptsCount || '?'} bài · ${r.sendMethod || ''}` : 'Chưa gửi' },
    { k: 'Bảng điểm thang 20', done: !!r.gradesReceivedAt, info: r.gradesReceivedAt ? 'Nhận ' + fmtDate(r.gradesReceivedAt) : r.scriptsSentAt ? `Chờ ${Math.max(0, -daysUntil(r.scriptsSentAt))} ngày` : '—' },
    { k: 'HĐ Khảo thí', done: r.councilStatus === 'Đã duyệt', info: r.councilStatus === 'Đã duyệt' ? 'Duyệt ' + fmtDate(r.councilDate) : r.councilStatus || 'Chưa họp' },
  ]
  if (!rows.length) return <div className="card"><Empty icon="ClipboardCheck" text="Chưa có kỳ thi." /></div>
  return (
    <div className="card tbl-wrap">
      <table className="tbl ws-tbl exam-pipe">
        <thead><tr><th>Kỳ thi</th><th>Đề thi</th><th>Phòng & coi thi</th><th>Gửi bài Rennes chấm</th><th>Bảng điểm thang 20</th><th>HĐ Khảo thí</th></tr></thead>
        <tbody>{rows.map((r) => {
          const st = stage(r)
          const waitLong = r.scriptsSentAt && !r.gradesReceivedAt && -daysUntil(r.scriptsSentAt) > 14
          return (
            <tr key={r.id} className="click" onClick={() => onOpen(r)}>
              <td className="td-title"><b>{r.course}</b><div className="small muted">{r.examType} · {r.className} · {fmtDate(r.date)} {r.start || ''}</div></td>
              {st.map((x, i) => (
                <td key={i} data-l={x.k}><div className={cx('pipe-cell', x.done && 'ok', i === 3 && waitLong && 'late')}>{x.done ? <L.CheckCircle2 size={15} /> : <L.Circle size={15} />}<span>{x.info}</span></div></td>
              ))}
            </tr>
          )
        })}</tbody>
      </table>
      <div className="small faint" style={{ padding: '8px 14px' }}>Ô đỏ: đã gửi bài cho Rennes chấm quá 14 ngày mà chưa nhận bảng điểm. Bấm một dòng để cập nhật.</div>
    </div>
  )
}

/* ---------- 03 Lịch giảng: tự kiểm tra trùng phòng / trùng giảng viên / trùng lớp ---------- */
function ConflictCheck({ rows, onOpen }) {
  const [type, setType] = useState('all')
  const toMinX = (t) => { if (!t) return null; const [h, mi] = t.split(':').map(Number); return h * 60 + mi }
  const live = rows.filter((r) => r.date && r.start && r.end && !['Hủy', 'Dời lịch'].includes(r.status))
  const noRoom = live.filter((r) => !r.room)
  // Gom các buổi đè giờ nhau theo cùng 1 khóa (lớp / GV / phòng) trong cùng ngày → mỗi cụm là 1 xung đột
  const TYPES = [
    { id: 'class', label: 'Lớp học 2 môn cùng lúc', key: (s) => s.className, valid: (g) => new Set(g.map((s) => s.course)).size > 1, desc: (k, g) => `Lớp ${k} có ${new Set(g.map((s) => s.course)).size} môn cùng lúc` },
    { id: 'lecturer', label: 'GV dạy 2 lớp cùng lúc', key: (s) => s.lecturer, valid: (g) => new Set(g.map((s) => s.className + '|' + s.course)).size > 1, desc: (k, g) => `${k} dạy ${g.length} buổi cùng lúc` },
    { id: 'room', label: 'Trùng phòng học', key: (s) => s.room, valid: (g) => new Set(g.map((s) => s.className + '|' + s.course)).size > 1, desc: (k, g) => `Phòng ${k} có ${g.length} buổi cùng lúc` },
  ]
  const clusters = []
  TYPES.forEach((T) => {
    const by = {}
    live.forEach((s) => { const k = T.key(s); if (k) (by[s.date + '§' + k] ||= []).push(s) })
    Object.entries(by).forEach(([dk, list]) => {
      const [date, k] = dk.split('§')
      const sorted = [...list].sort((a, b) => toMinX(a.start) - toMinX(b.start))
      let cur = [], end = -1
      const flush = () => { if (cur.length > 1 && T.valid(cur)) clusters.push({ type: T.id, label: T.label, date, k, list: cur, desc: T.desc(k, cur) }); cur = [] }
      sorted.forEach((s) => {
        if (cur.length && toMinX(s.start) < end) { cur.push(s); end = Math.max(end, toMinX(s.end)) }
        else { flush(); cur = [s]; end = toMinX(s.end) }
      })
      flush()
    })
  })
  clusters.sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type))
  const count = (id) => clusters.filter((c) => c.type === id).length
  const shown = clusters.filter((c) => type === 'all' || c.type === type)
  const TONE_C = { class: 'pill-danger', lecturer: 'pill-warn', room: 'pill-danger' }
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className={cx('callout', clusters.length ? 'review' : 'info')}>
        {clusters.length ? <L.TriangleAlert size={18} color="var(--danger)" style={{ flexShrink: 0 }} /> : <L.ShieldCheck size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} />}
        <div>{clusters.length
          ? <><b>{clusters.length} khung giờ bị trùng</b> trong {live.length} buổi đang hiệu lực: {count('class')} lớp học 2 môn cùng lúc · {count('lecturer')} GV dạy 2 lớp cùng lúc · {count('room')} trùng phòng. Xử lý trước khi gửi UEH và Rennes ký xác nhận.</>
          : <><b>Không có xung đột</b> trong {live.length} buổi đang hiệu lực.</>}
          {noRoom.length ? ` · ${noRoom.length} buổi chưa có phòng.` : ''}
          <div className="small muted" style={{ marginTop: 4 }}>Quy tắc: báo trùng khi 1 lớp học 2 môn cùng lúc, 1 giảng viên dạy 2 lớp/buổi cùng lúc, hoặc 2 lớp dùng chung 1 phòng cùng lúc. Buổi đồng giảng (cùng học phần, cùng lớp) không tính.</div>
        </div>
      </div>
      {clusters.length > 0 && (
        <div className="seg" style={{ alignSelf: 'flex-start', flexWrap: 'wrap' }}>
          {[['all', 'Tất cả', clusters.length], ['class', 'Lớp học 2 môn cùng lúc', count('class')], ['lecturer', 'GV dạy 2 lớp cùng lúc', count('lecturer')], ['room', 'Trùng phòng', count('room')]].map(([id, t, n]) => (
            <button key={id} className={type === id ? 'on' : ''} onClick={() => setType(id)}>{t} ({n})</button>
          ))}
        </div>
      )}
      {shown.length > 0 && (
        <div className="card tbl-wrap"><table className="tbl ws-tbl conflict-tbl">
          <thead><tr><th>Ngày</th><th>Xung đột</th><th>Các buổi đè giờ nhau</th></tr></thead>
          <tbody>{shown.map((c, i) => (
            <tr key={i}>
              <td data-l="Ngày"><b>{fmtDate(c.date)}</b></td>
              <td data-l="Xung đột"><span className={cx('badge', TONE_C[c.type])}>{c.label}</span><div className="small muted" style={{ marginTop: 4 }}>{c.desc}</div></td>
              <td data-l="Các buổi" className="td-title">
                {c.list.map((s) => (
                  <div key={s.id} className="cf-sess click" onClick={() => onOpen(s)}>
                    <b>{s.start}–{s.end}</b> {s.course}
                    <span className="muted"> · {s.lecturer || '—'} · {s.className || '—'} · P.{s.room || '—'}</span>
                  </div>
                ))}
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {noRoom.length > 0 && (
        <div className="card card-pad">
          <h4 className="lec-h"><L.DoorOpen size={16} />Buổi chưa có phòng học</h4>
          {noRoom.slice(0, 20).map((s) => <div key={s.id} className="up-row click" onClick={() => onOpen(s)}><b style={{ minWidth: 92 }}>{fmtDate(s.date)}</b><span style={{ minWidth: 96 }}>{s.start}–{s.end}</span><span className="grow">{s.course} <span className="faint">· {s.lecturer} · {s.className}</span></span></div>)}
        </div>
      )}
    </div>
  )
}

function CourseTimeline({ rows, project, onOpen }) {
  const [cohortFilter, setCohortFilter] = useState('all') // 'all' | 'K50–K51' | 'K52'
  const [quickSess, setQuickSess] = useState(null)

  const sessionIndexMap = useMemo(() => computeSessionIndexMap(rows), [rows])

  if (!rows.length) return <div className="card"><Empty text="Chưa có buổi học." /></div>

  const dates = rows.map((r) => r.date).filter(Boolean).sort()
  const min = new Date(dates[0]), max = new Date(dates[dates.length - 1])
  const span = Math.max(1, (max - min) / 864e5)
  const pos = (d) => ((new Date(d) - min) / 864e5 / span) * 100
  const tpos = Math.min(100, Math.max(0, pos(todayStr())))

  // Nhóm theo lớp: K50–K51 và K52
  const classSections = [
    { id: 'K50–K51', label: 'Khóa K50–K51 (ISB-K51-01)', color: '#03616a' },
    { id: 'K52', label: 'Khóa K52 (ISB-K52-01)', color: '#d4712f' },
  ]

  const activeSections = cohortFilter === 'all'
    ? classSections
    : classSections.filter((s) => s.id === cohortFilter)

  const k50Count = rows.filter((r) => getSessionCohort(r) === 'K50–K51').length
  const k52Count = rows.filter((r) => getSessionCohort(r) === 'K52').length

  return (
    <div className="card card-pad">
      {/* Thanh lọc lớp */}
      <div className="row between wrap" style={{ marginBottom: 14, gap: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          <div className="seg sm">
            <button className={cohortFilter === 'all' ? 'on' : ''} onClick={() => setCohortFilter('all')}>
              Tất cả các lớp ({rows.length})
            </button>
            <button className={cohortFilter === 'K50–K51' ? 'on' : ''} onClick={() => setCohortFilter('K50–K51')}>
              Lớp K50–K51 ({k50Count})
            </button>
            <button className={cohortFilter === 'K52' ? 'on' : ''} onClick={() => setCohortFilter('K52')}>
              Lớp K52 ({k52Count})
            </button>
          </div>
        </div>
        <div className="row small muted" style={{ gap: 12 }}>
          <span>{fmtDate(dates[0])}</span>
          <span>Hôm nay</span>
          <span>{fmtDate(dates[dates.length - 1])}</span>
        </div>
      </div>

      {activeSections.map((sec) => {
        const secRows = rows.filter((r) => getSessionCohort(r) === sec.id)
        if (!secRows.length) return null

        const courses = Object.values(secRows.reduce((a, r) => ((a[r.course] ||= { course: r.course, list: [] }).list.push(r), a), {}))

        return (
          <div key={sec.id} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, borderLeft: `4px solid ${sec.color}`, marginBottom: 10 }}>
              <L.GraduationCap size={16} color={sec.color} />
              <b style={{ fontSize: 13, color: '#1e293b' }}>{sec.label}</b>
              <span className="badge" style={{ marginLeft: 'auto', background: '#e2e8f0', color: '#475569', fontSize: 11 }}>
                {secRows.length} buổi học · {courses.length} môn
              </span>
            </div>

            {courses.map((c) => {
              const l = c.list.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
              const done = l.filter((r) => r.status === 'Đã dạy').length
              const live = l.filter((r) => r.status !== 'Hủy')
              const hours = live.reduce((s, r) => s + (r.start && r.end ? (toMin(r.end) - toMin(r.start)) / 60 : 0), 0)

              return (
                <div key={c.course} className="ct-row">
                  <div className="ct-info">
                    <b>{c.course} ({l.length} buổi)</b>
                    <div className="small muted">{[...new Set(l.map((r) => r.lecturer).filter(Boolean))].join(', ')} · {live.length} buổi · {hours.toFixed(1).replace('.0', '')} giờ</div>
                    <div className="small faint">{fmtDate(l[0].date)} → {fmtDate(l[l.length - 1].date)} · Phòng {[...new Set(l.map((r) => r.room).filter(Boolean))].join(', ') || '—'}</div>
                  </div>
                  <div className="ct-track">
                    <div className="ct-today" style={{ left: tpos + '%' }} />
                    {l.map((r) => {
                      const sessNo = sessionIndexMap[r.id] || 1
                      return (
                        <span
                          key={r.id}
                          className={cx('ct-dot', r.status === 'Đã dạy' && 'done', r.status === 'Hủy' && 'cancel')}
                          style={{
                            left: pos(r.date) + '%',
                            cursor: 'pointer',
                            borderColor: (r.side === 'Rennes' || (r.lecturer && ['Franck Martin', 'Fabien Rondeau', 'Jean-Christophe Poutineau', 'Christophe Tavera', 'Cécile Casteuble', 'Tovonony Razafindrabe', 'Tovonony Razafindramary'].some((n) => sameName(r.lecturer, n)))) ? '#d4712f' : '#03616a'
                          }}
                          title={`Buổi (${sessNo}): ${fmtDate(r.date)} ${r.start || ''} · ${r.lecturer || ''} · ${r.status || 'Dự kiến'} · Bấm để đổi Hoàn thành / Hủy`}
                          onClick={() => setQuickSess(r)}
                        />
                      )
                    })}
                  </div>
                  <div className="ct-prog">
                    <b>{done}/{live.length}</b>
                    <span className="small faint">đã dạy</span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {quickSess && (
        <SessionQuickModal
          session={quickSess}
          project={project}
          sessNo={sessionIndexMap[quickSess.id] || 1}
          onClose={() => setQuickSess(null)}
          onEditFull={onOpen}
        />
      )}
    </div>
  )
}
const toMin = (t) => { const [h, mi] = t.split(':').map(Number); return h * 60 + mi }

/* ---------- Mẫu trả lời email SV ---------- */
const SIGN = '\n\nTrân trọng,\nBan Điều hành chương trình cử nhân song bằng UEH – Rennes\nKhoa Tài chính – Đại học Kinh tế TP. Hồ Chí Minh'
const REPLIES = {
  received: { label: 'Đã tiếp nhận – đang xử lý', body: 'Chào {ten},\n\nBan Điều hành chương trình đã nhận được email của em và đang phối hợp các đơn vị liên quan để xử lý. Chúng tôi sẽ phản hồi em trong thời gian sớm nhất.' + SIGN },
  rennesCourse: { label: 'Học phần do GV Rennes giảng (không chuyển đổi)', body: 'Chào {ten},\n\nTheo định hướng quốc tế hóa, các học phần do giảng viên Đại học Rennes đảm nhiệm được tổ chức học chung giữa sinh viên song bằng và không song bằng. Nội dung giảng dạy và đánh giá do phía Rennes thiết kế, bảo đảm chất lượng.\n\nViệc mở học phần thay thế theo chương trình UEH chỉ có thể xem xét khi có học phần tương đương và đáp ứng đủ điều kiện tổ chức lớp theo quy định. Em vui lòng liên hệ Ban Điều hành chương trình – Khoa Tài chính để được tư vấn cụ thể.' + SIGN },
  meeting: { label: 'Mời lên Văn phòng Khoa trao đổi', body: 'Chào {ten},\n\nĐể nắm rõ khó khăn và tìm phương án phù hợp nhất, Ban Điều hành mời em lên Văn phòng Khoa Tài chính (B1.902) vào …… lúc ……. Em vui lòng xác nhận thời gian qua email này.' + SIGN },
  account: { label: 'Hỗ trợ tài khoản LMS/email Rennes', body: 'Chào {ten},\n\nChúng tôi đã gửi yêu cầu kiểm tra/đặt lại tài khoản của em cho bộ phận IT Đại học Rennes. Em vui lòng kiểm tra cả hộp thư Spam trong 2–3 ngày tới. Nếu vẫn chưa đăng nhập được, em phản hồi lại email này kèm ảnh chụp màn hình lỗi.' + SIGN },
  tuition: { label: 'Gia hạn học phí – cần đơn', body: 'Chào {ten},\n\nĐể được xem xét gia hạn học phí, em vui lòng gửi đơn đề nghị gia hạn (ghi rõ lý do, thời hạn xin gia hạn) có xác nhận của phụ huynh về email này. Ban Điều hành sẽ phản hồi sau khi nhận đủ hồ sơ.' + SIGN },
}

/* ---------- Hộp thư sinh viên ---------- */
function Inbox({ project, m, rows, users }) {
  const { state, me, saveItem, notifyUser } = useStore()
  const toast = useToast()
  const [cur, setCur] = useState(rows[0]?.id)
  const [note, setNote] = useState('')
  const r = rows.find((x) => x.id === cur) || rows[0]
  const studs = state.items.filter((x) => x.projectId === project.id && x.module === 'students')
  const findStudent = (x) => {
    if (!x) return null
    const txt = `${x.subject} ${x.body}`
    const ids = txt.match(/\b\d{8,11}\b/g) || []
    return studs.find((s) => s.email && x.fromEmail && s.email.toLowerCase() === x.fromEmail.toLowerCase()) || studs.find((s) => s.studentId && ids.includes(s.studentId)) || null
  }
  const stu = findStudent(r)
  const reply = (tpl) => {
    const name = (r.fromName || '').split(' ').slice(-1)[0] || 'em'
    const body = REPLIES[tpl].body.replace(/\{ten\}/g, name).replace(/\{chuongtrinh\}/g, 'cử nhân song bằng UEH – Rennes')
    navigator.clipboard?.writeText(body)
    window.location.href = `mailto:${r.fromEmail}?subject=${encodeURIComponent('Re: ' + r.subject)}&body=${encodeURIComponent(body)}`
    upd({ status: r.status === 'Mới' ? 'Đang xử lý' : r.status }, `trả lời theo mẫu “${REPLIES[tpl].label}”`)
  }
  const upd = (patch, log) => {
    const entry = log ? [{ userId: me.id, text: log, at: new Date().toISOString() }] : []
    saveItem(project.id, m.id, { ...r, ...patch, log: [...(r.log || []), ...entry] }, `email “${r.subject}”${log ? ': ' + log : ''}`)
  }
  const statusColor = (s) => TONE[STATUS_TONE[s] || 'muted'][0]
  if (!rows.length) return <div className="card"><Empty icon="Mail" text="Chưa có email. Bấm “Tải email (.eml)” – trong Outlook: kéo email ra màn hình/thư mục để có file .eml; Gmail: ⋮ → Tải thư xuống." /></div>
  return (
    <div className="inbox card">
      <div className="ib-list">
        {rows.map((x) => {
          const late = x.status !== 'Đã giải quyết' && x.due && daysUntil(x.due) < 0
          const h = state.users.find((u) => u.id === x.handler)
          return (
            <div key={x.id} className={cx('ib-item', r?.id === x.id && 'on', x.status === 'Mới' && 'unread')} onClick={() => setCur(x.id)}>
              <div className="row between"><b className="ellipsis">{x.fromName || x.fromEmail}</b><span className="small faint" style={{ whiteSpace: 'nowrap' }}>{x.receivedAt ? fmtDT(x.receivedAt).slice(0, 10) : ''}</span></div>
              <div className="ellipsis small" style={{ fontWeight: 600 }}>{x.subject}</div>
              <div className="row small" style={{ gap: 6, marginTop: 4 }}>
                <span className="dot-s" style={{ background: statusColor(x.status) }} /><span style={{ color: statusColor(x.status) }}>{x.status}</span>
                {x.topic && <span className="chip" style={{ fontSize: 11, padding: '1px 6px' }}>{x.topic}</span>}
                {late && <span className="tone-danger" style={{ fontWeight: 700 }}>trễ hạn</span>}
                <span className="grow" />{h && <Avatar user={h} size={18} />}
              </div>
            </div>
          )
        })}
      </div>
      {r && (
        <div className="ib-view">
          <h3 style={{ fontSize: 18 }}>{r.subject}</h3>
          <div className="row wrap small" style={{ gap: 8, margin: '8px 0 14px' }}>
            <span className="avatar" style={{ width: 30, height: 30, background: '#94a3b8', fontSize: 12 }}>{(r.fromName || '?').split(' ').slice(-1)[0][0]}</span>
            <div><b>{r.fromName}</b> <span className="muted">&lt;{r.fromEmail}&gt;</span><div className="faint">{fmtDT(r.receivedAt)}</div></div>
          </div>
          <div className="ib-ctrl">
            <label>Tiến độ<select className="select sm" value={r.status || ''} onChange={(e) => upd({ status: e.target.value }, `chuyển sang “${e.target.value}”`)}>{fieldOf(m, 'status').options.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Người xử lý<select className="select sm" value={r.handler || ''} onChange={(e) => { const u = users.find((x) => x.id === e.target.value); upd({ handler: e.target.value, status: r.status === 'Mới' ? 'Đang xử lý' : r.status }, `giao cho ${u?.name || '—'}`); if (u) notifyUser(u.id, project.id, `${me.name} giao bạn xử lý email “${r.subject}”`) }}><option value="">— Chưa giao —</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
            <label>Nhóm<select className="select sm" value={r.topic || ''} onChange={(e) => upd({ topic: e.target.value })}>{fieldOf(m, 'topic').options.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Hạn phản hồi<input className="input sm" type="date" value={r.due || ''} onChange={(e) => upd({ due: e.target.value })} /></label>
          </div>
          {stu ? (
            <div className="stu-card">
              <L.GraduationCap size={18} color="var(--teal-700)" />
              <div className="grow"><b>{stu.fullName}</b> · MSSV {stu.studentId} · {stu.className} · {stu.cohort} · {stu.yearLevel}<div className="small muted">Song bằng: <b>{stu.dualDegree || '—'}</b> · Học phí: {stu.tuitionStatus || '—'} · TK Rennes: {stu.accountStatus || '—'} · {stu.phone || ''}</div></div>
              <span className="small faint">Tự nhận diện từ email/MSSV</span>
            </div>
          ) : <div className="small faint" style={{ marginBottom: 8 }}>Chưa khớp sinh viên nào trong danh sách (theo email hoặc MSSV trong thư).</div>}
          <div className="ib-body">{r.body || <span className="faint">(Không có nội dung)</span>}</div>
          {(r.files || []).length > 0 && (
            <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
              {r.files.map((x, i) => <button key={i} className="btn sm" onClick={() => openFile(x).catch((e) => toast(e.message))}><L.Paperclip size={13} />{x.name}</button>)}
            </div>
          )}
          <div className="section-title" style={{ marginTop: 18 }}>Tiến độ xử lý</div>
          <ul className="feed">
            {(r.log || []).map((l, i) => { const u = state.users.find((x) => x.id === l.userId); return <li key={i}><Avatar user={u} size={24} /><div><div className="txt"><b>{u?.name}</b> {l.text}</div><div className="when">{timeAgo(l.at)}</div></div></li> })}
            {!(r.log || []).length && <li className="faint small">Chưa có cập nhật.</li>}
          </ul>
          <div className="row" style={{ marginTop: 8 }}>
            <input className="input" placeholder="Ghi chú xử lý (VD: đã gọi điện SV, đã gửi IT Rennes…)" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && note.trim()) { upd({}, note.trim()); setNote('') } }} />
            <button className="btn primary" disabled={!note.trim()} onClick={() => { upd({}, note.trim()); setNote('') }}>Ghi</button>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 12 }}>
            <a className="btn sm" href={`mailto:${r.fromEmail}?subject=${encodeURIComponent('Re: ' + r.subject)}`}><L.Reply size={14} />Trả lời bằng email</a>
            <select className="select sm" value="" onChange={(e) => e.target.value && reply(e.target.value)} title="Mở email trả lời với nội dung soạn sẵn (đã sao chép vào clipboard)">
              <option value="">Trả lời theo mẫu…</option>{Object.entries(REPLIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {r.status !== 'Đã giải quyết' && <button className="btn sm success" onClick={() => upd({ status: 'Đã giải quyết' }, 'đánh dấu đã giải quyết')}><L.Check size={14} />Đã giải quyết</button>}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Thẻ chuyến công tác ---------- */
function TripCards({ m, rows, onOpen, lecturers = [] }) {
  if (!rows.length) return <div className="card"><Empty icon="Plane" text="Chưa có chuyến công tác." /></div>
  return (
    <div className="trip-grid">
      {rows.map((r) => {
        const total = m.computed.total.fn(r)
        return (
          <div key={r.id} className="card trip" onClick={() => onOpen(r)}>
            <div className="row between"><div><b style={{ fontSize: 15 }}>{r.lecturer}</b><div className="small muted">{r.course}</div></div><Pill v={r.status} /></div>
            <div className="flight">
              <L.PlaneLanding size={16} color="var(--teal-700)" />
              <div className="grow"><b>{r.outFlight || '—'}</b><div className="small muted">Khởi hành {fmtDT(r.departAt) || '—'} → đến {fmtDT(r.arriveAt) || '—'}</div></div>
            </div>
            <div className="flight">
              <L.PlaneTakeoff size={16} color="var(--orange-600)" />
              <div className="grow"><b>{r.returnFlight || '—'}</b><div className="small muted">Bay về {fmtDT(r.returnAt) || '—'}</div></div>
            </div>
            <div className="flight">
              <L.Hotel size={16} color="var(--teal-700)" />
              <div className="grow"><b>{r.hotel || '—'}</b><div className="small muted">{fmtDate(r.checkIn)} → {fmtDate(r.checkOut)} · Visa: {r.visa || '—'}</div></div>
            </div>
            {r.pickup && <div className="small muted" style={{ margin: '4px 0 0 26px' }}>🚗 {r.pickup}</div>}
            {(() => { const lec = lecturers.find((x) => sameName(x.fullName, r.lecturer)); const t = prefsText(lec); return t ? <div className="pref-line" style={{ marginTop: 8 }}><L.Utensils size={14} />{t}</div> : null })()}
            <div className="trip-cost">
              {(() => { const c = tripCalc(r); return <>
                <span>Thù lao (thực nhận) <b>€ {c.net.toLocaleString('vi-VN')}</b></span><span>Thuế TNCN <b>€ {c.taxAmt.toLocaleString('vi-VN')}</b></span>
                <span>Phụ cấp lưu trú <b>€ {c.perDiem.toLocaleString('vi-VN')}</b></span><span>TGV <b>€ {(+r.tgvEur || 0).toLocaleString('vi-VN')}</b></span>
                <span>Vé máy bay <b>{money(r.ticketCost) || 0}</b></span><span>Khách sạn <b>{money(r.hotelCost) || 0}</b></span>
              </> })()}
            </div>
            <div className="row wrap small" style={{ gap: 6, marginTop: 8 }}><span className="muted">Đặt phòng:</span><Pill v={r.hotelStatus} />{r.bookingCode && <span className="chip">{r.bookingCode}</span>}{(r.steps || []).length > 0 && <span className="muted" style={{ marginLeft: 'auto' }}>Việc cần làm {(r.steps || []).filter((x) => x.done).length}/{r.steps.length}</span>}</div>
            <div className="row between" style={{ marginTop: 10 }}><span className="small muted">Tổng (VND)</span><b style={{ fontSize: 17, color: 'var(--teal-800)' }}>{money(total)}</b></div>
            <div className="row between small" style={{ marginTop: 6 }}><Pill v={r.payStatus} />{(r.files || []).length > 0 && <span className="row" style={{ gap: 4, color: 'var(--teal-700)' }}><L.Paperclip size={13} />{r.files.length} file</span>}</div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Báo cáo tổng hợp ---------- */
function Report({ project, items }) {
  const { state } = useStore()
  const [reportView, setReportView] = useState('doc')
  const by = (id) => items.filter((x) => x.module === id)
  const count = (list, k) => list.reduce((a, r) => (r[k] && (a[r[k]] = (a[r[k]] || 0) + 1), a), {})
  const sum = (list, k) => list.reduce((s, r) => s + (+r[k] || 0), 0)
  const st = by('students'), ses = by('sessions'), tk = by('tickets'), ex = by('expenses'), tr = by('trips'), tf = by('transfers'), dc = by('docs'), lc = by('lecturers')
  const tasks = state.tasks.filter((t) => t.projectId === project.id && !t.isStream)
  const month = todayStr().slice(0, 7)
  const Box = ({ title, icon, children }) => <div className="card card-pad rp-box"><h4><Icon name={icon} size={16} color="var(--teal-700)" />{title}</h4>{children}</div>
  const Line = ({ k, v, tone }) => <div className="rp-line"><span>{k}</span><b className={tone ? 'tone-' + tone : ''}>{v}</b></div>
  const Dist = ({ obj }) => <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>{Object.entries(obj).map(([k, v]) => <span key={k} className="row" style={{ gap: 4 }}><Pill v={k} /><b className="small">{v}</b></span>)}</div>
  const paid = st.filter((s) => s.tuitionStatus === 'Đã đóng' || s.tuitionStatus === 'Miễn giảm').length
  const acc = st.filter((s) => ['Đã cấp', 'Đã kích hoạt'].includes(s.accountStatus)).length
  const exCat = ex.reduce((a, r) => ((a[r.category || 'Khác'] = (a[r.category || 'Khác'] || 0) + (+r.amount || 0)), a), {})

  if (reportView === 'doc') {
    return (
      <AnnualAdministrativeReport
        project={project}
        items={items}
        onBackToDashboard={() => setReportView('dashboard')}
      />
    )
  }

  return (
    <div>
      <div className="row between wrap" style={{ marginBottom: 14, gap: 10 }}>
        <div><h3 style={{ fontSize: 18 }}>Báo cáo vận hành – {project.name}</h3><div className="small muted">Số liệu lấy trực tiếp từ bàn làm việc · {fmtDate(todayStr())}</div></div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn primary" onClick={() => setReportView('doc')}>
            <L.FileText size={15} /> Mở Văn bản Báo cáo Thường niên (A4)
          </button>
          <button className="btn" onClick={() => window.print()}><L.Printer size={15} />In / lưu PDF</button>
        </div>
      </div>
      <div className="rp-grid">
        <Box title="Tiến độ công việc" icon="ListChecks">
          <Line k="Tổng số việc (đợt)" v={tasks.length} />
          <Line k="Hoàn thành" v={tasks.filter((t) => t.status === 'done').length} />
          <Line k="Chờ duyệt" v={tasks.filter((t) => t.status === 'review').length} />
          <Line k="Quá hạn" v={tasks.filter((t) => t.status !== 'done' && t.dueDate && daysUntil(t.dueDate) < 0).length} tone="danger" />
        </Box>
        <Box title="Sinh viên" icon="GraduationCap">
          <Line k="Tổng số SV" v={st.length} />
          <Line k="Đăng ký song bằng" v={st.filter((s) => s.dualDegree === 'Có').length} />
          <Line k="Đã hoàn thành học phí" v={`${paid}/${st.length} (${st.length ? Math.round((paid / st.length) * 100) : 0}%)`} />
          <Line k="Đã có tài khoản Rennes" v={`${acc}/${st.length}`} />
          <Dist obj={count(st, 'cohort')} /><Dist obj={count(st, 'yearLevel')} />
        </Box>
        <Box title="Lịch giảng" icon="CalendarDays">
          <Line k="Tổng số buổi" v={ses.length} />
          <Line k="Buổi trong tháng này" v={ses.filter((s) => (s.date || '').startsWith(month)).length} />
          <Line k="Đã dạy" v={ses.filter((s) => s.status === 'Đã dạy').length} />
          <Line k="Học phần" v={new Set(ses.map((s) => s.course)).size} />
          <Dist obj={count(ses, 'status')} />
        </Box>
        <Box title="Hộp thư sinh viên" icon="Mail">
          <Line k="Tổng email" v={tk.length} />
          <Line k="Chưa giải quyết" v={tk.filter((t) => t.status !== 'Đã giải quyết').length} tone="warn" />
          <Line k="Trễ hạn phản hồi" v={tk.filter((t) => t.status !== 'Đã giải quyết' && t.due && daysUntil(t.due) < 0).length} tone="danger" />
          <Dist obj={count(tk, 'topic')} />
        </Box>
        <Box title="Đoàn công tác GV" icon="Plane">
          <Line k="Số chuyến" v={tr.length} />
          <Line k="Tổng chi phí (VND)" v={money(tr.reduce((s, r) => s + tripCalc(r).vnd, 0))} />
          <Line k="Tổng EUR chi GV" v={'€ ' + tr.reduce((s, r) => s + tripCalc(r).eurTotal, 0).toLocaleString('vi-VN')} />
          <Line k="Phiếu đặt phòng chưa duyệt" v={tr.filter((r) => ['Chưa đặt', 'Đã gửi phiếu'].includes(r.hotelStatus) && r.status !== 'Hủy').length} tone="warn" />
          <Line k="Tạm ứng chưa hoàn" v={'€ ' + tr.filter((r) => r.advanceStatus === 'Đã tạm ứng').reduce((s, r) => s + (+r.advanceEur || 0), 0).toLocaleString('vi-VN')} tone="warn" />
          <Dist obj={count(tr, 'status')} />
        </Box>
        <Box title="Tài chính" icon="Calculator">
          <Line k="Tổng chi (VND)" v={money(sum(ex, 'amount'))} />
          <Line k="Đã chi / quyết toán" v={money(sum(ex.filter((e) => ['Đã chi', 'Đã quyết toán'].includes(e.status)), 'amount'))} />
          {Object.entries(exCat).map(([k, v]) => <Line key={k} k={'· ' + k} v={money(v)} />)}
          <Line k="Học phí đã chuyển Rennes (EUR)" v={'€ ' + tf.filter((t) => ['Đã chuyển', 'Rennes đã xác nhận'].includes(t.status)).reduce((x, t) => x + MODULE.transfers.computed.totalEur.fn(t), 0).toLocaleString('vi-VN')} />
          <Line k="Công nợ còn lại (EUR)" v={sum(tf, 'debt').toLocaleString('vi-VN')} tone={sum(tf, 'debt') ? 'warn' : ''} />
        </Box>
        <Box title="Điểm & điều kiện bằng Rennes" icon="Award">
          {(() => {
            const g = by('grades'); const per = {}
            g.forEach((x) => { if (x.studentId && x.score20 !== '' && x.score20 != null) (per[x.studentId] ||= []).push(+x.score20) })
            const arr = Object.values(per)
            const ok = arr.filter((a) => a.reduce((s, v) => s + v, 0) / a.length >= MOA.passMark20 && a.every((v) => v >= MOA.passMark20)).length
            return <><Line k="Điểm đã nhập" v={g.length} /><Line k="SV đủ điều kiện bằng Rennes" v={`${ok}/${arr.length}`} /><Line k="Điểm dưới 10/20" v={g.filter((x) => x.score20 !== '' && +x.score20 < 10).length} tone="danger" /><Line k="GV Rennes chưa gửi điểm" v={lc.filter((l) => l.side === 'Rennes' && l.gradesSent === 'Chưa gửi điểm').length} tone="warn" /></>
          })()}
        </Box>
        <Box title="Văn bản & giảng viên" icon="FileText">
          <Line k="Văn bản" v={dc.length} />
          <Dist obj={count(dc, 'status')} />
          <Line k="Văn bản chờ ký" v={dc.filter((x) => (x.signers || []).some((c) => !c.done)).length} tone="warn" />
          <Line k="Giảng viên" v={lc.length} />
          <Line k="HĐ thỉnh giảng chưa ký" v={lc.filter((l) => l.side === 'Rennes' && l.contractStatus !== 'Đã ký HĐ').length} tone="warn" />
          <Line k="Giờ giảng đã dạy / kế hoạch" v={`${sum(lc, 'hoursDone')} / ${sum(lc, 'hoursPlanned')}`} />
        </Box>
      </div>
    </div>
  )
}
