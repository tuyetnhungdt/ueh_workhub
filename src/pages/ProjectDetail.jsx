import { useState, useMemo } from 'react'
import * as L from 'lucide-react'
import { useStore, projectRole } from '../data/store.jsx'
import { canAccessProjectTab, canApproveMembers, getRoleConfig, USER_STATUS } from '../data/rbac.js'
import { useUI } from '../App.jsx'
import { ListView, BoardView, TimelineView } from '../components/TaskViews.jsx'
import { DeadlineHeatmap, CreatedCompleted, WorkloadTable, StatusDonut } from '../components/Analytics.jsx'
import { useToast, Avatar, AvatarStack, Empty, Icon, Progress } from '../components/ui.jsx'
import { cx, daysUntil, fmtDate, isOverdue, isDueSoon, normalize, progressOf, timeAgo, TAG_COLORS, uid } from '../lib/utils.js'
import ProjectForm from '../components/ProjectForm.jsx'
import Workspace from '../modules/Workspace.jsx'
import WorkflowsView from '../components/WorkflowsView.jsx'
import CurriculumView from '../components/CurriculumView.jsx'
import ChecklistReconciliation from '../components/ChecklistReconciliation.jsx'
import DocTemplateStudio from '../components/DocTemplateStudio.jsx'
import FlightLogisticsWorkflow from '../components/FlightLogisticsWorkflow.jsx'
import UserApprovalModal from '../components/UserApprovalModal.jsx'
import { JoinCodeCard } from '../components/JoinProject.jsx'

export function FilterBar({ f, setF, members, project, extra }) {
  return (
    <div className="filterbar">
      <div className="search sm"><L.Search size={15} /><input className="input" placeholder="Lọc theo tên…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} /></div>
      <select className="select sm" value={f.show} onChange={(e) => setF({ ...f, show: e.target.value })}>
        <option value="active">Việc đang mở</option><option value="all">Tất cả</option><option value="overdue">Quá hạn</option><option value="review">Chờ duyệt</option><option value="done">Đã hoàn thành</option>
      </select>
      <select className="select sm" value={f.cohort || ''} onChange={(e) => setF({ ...f, cohort: e.target.value })}>
        <option value="">Mọi khóa / Nhóm lớp</option>
        <option value="K50–K51">Nhóm K50–K51 (Ghép khóa)</option>
        <option value="K50">Khóa K50</option>
        <option value="K51">Khóa K51</option>
        <option value="K52">Khóa K52 (Độc lập)</option>
      </select>
      {members && (
        <select className="select sm" value={f.who} onChange={(e) => setF({ ...f, who: e.target.value })}>
          <option value="">Mọi người phụ trách</option>
          {members.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      )}
      <select className="select sm" value={f.prio} onChange={(e) => setF({ ...f, prio: e.target.value })}>
        <option value="">Mọi mức ưu tiên</option><option value="urgent">Khẩn</option><option value="high">Cao</option><option value="medium">Trung bình</option><option value="low">Thấp</option>
      </select>
      {project?.tags?.length > 0 && (
        <select className="select sm" value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })}>
          <option value="">Mọi nhãn</option>{project.tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}
      {extra}
    </div>
  )
}
export const emptyFilter = { q: '', show: 'active', who: '', prio: '', tag: '', cohort: '' }
export function applyFilter(tasks, f) {
  const q = normalize(f.q.trim())
  return tasks.filter((t) => {
    const matchQ = !q || normalize(t.title).includes(q)
    const matchShow = f.show === 'all' || (f.show === 'active' && t.status !== 'done') || (f.show === 'done' && t.status === 'done') || (f.show === 'overdue' && isOverdue(t)) || (f.show === 'review' && t.status === 'review')
    const matchWho = !f.who || t.assigneeIds.includes(f.who)
    const matchPrio = !f.prio || t.priority === f.prio
    const matchTag = !f.tag || (t.tagIds || []).includes(f.tag)
    let matchCohort = true
    if (f.cohort) {
      if (f.cohort === 'K50–K51') {
        matchCohort = t.teachingGroup === 'K50–K51' || (t.cohortScope || '').includes('K50') || (t.cohortScope || '').includes('K51') || (t.title || '').includes('K50–K51') || (t.title || '').includes('K50') || (t.title || '').includes('K51')
      } else if (f.cohort === 'K52') {
        matchCohort = t.teachingGroup === 'K52' || (t.cohortScope || '').includes('K52') || (t.title || '').includes('K52')
      } else {
        matchCohort = (t.cohortScope || '').includes(f.cohort) || (t.title || '').includes(f.cohort)
      }
    }
    return matchQ && matchShow && matchWho && matchPrio && matchTag && matchCohort
  })
}

const TABS = [
  { id: 'work', label: 'Bàn làm việc', icon: 'Briefcase' },
  { id: 'list', label: 'Danh sách', icon: 'ListTree' },
  { id: 'board', label: 'Bảng Kanban', icon: 'Columns3' },
  { id: 'timeline', label: 'Timeline', icon: 'GanttChart' },
  { id: 'progress', label: 'Tiến độ', icon: 'ChartColumn' },
  { id: 'activity', label: 'Hoạt động', icon: 'Activity' },
]

export default function ProjectDetail({ id, tab, sub }) {
  const { state, me } = useStore()
  const { go, newTask } = useUI()
  const [f, setF] = useState(emptyFilter)
  const [editing, setEditing] = useState(false)
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [docStudioOpen, setDocStudioOpen] = useState(false)
  const [flightWorkflowOpen, setFlightWorkflowOpen] = useState(false)
  const p = state.projects.find((x) => x.id === id)
  const role = projectRole(p, me)
  if (!p) return <Empty icon="FolderX" text="Không tìm thấy dự án." />
  if (!role) return <Empty icon="Lock" text="Bạn không phải thành viên của dự án này." />
  const isMgr = role === 'manager'
  const allTasks = state.tasks.filter((t) => t.projectId === p.id)
  const tasks = allTasks.filter((t) => !t.isStream)
  const streams = allTasks.filter((t) => t.isStream)
  const members = p.members.map((m) => state.users.find((u) => u.id === m.userId)).filter(Boolean)
  const pct = progressOf(tasks)
  const filtered = applyFilter(tasks, f)
  const left = daysUntil(p.endDate)
  const pendingCount = (state.users || []).filter((u) => u.status === USER_STATUS.PENDING).length
  const isGiaLai = p.id === 'p3' || p.code?.includes('QDTMH')
  const visibleTabs = TABS.filter((t) => {
    // Chỉ dự án đào tạo Rennes (p1) mới hiển thị 3 tab học thuật đặc thù
    if (['workflows', 'curriculum', 'checklist'].includes(t.id) && p.id !== 'p1') {
      return false
    }
    return canAccessProjectTab(me, t.id)
  })

  return (
    <>
      <div className="card proj-header">
        <span className="bar" style={{ background: p.color }} />
        <div className="grow" style={{ minWidth: 260 }}>
          <div className="row" style={{ gap: 8 }}>
            <span className="proj-code">{p.code}</span>
            <span className={cx('badge')} style={{ background: isMgr ? 'var(--orange-100)' : 'var(--teal-100)', color: isMgr ? 'var(--orange-700)' : 'var(--teal-800)' }}>{isMgr ? 'Bạn là Quản lý' : 'Bạn là Thành viên'}</span>
            {p.id === 'p1' && (
              <>
                <span className="chip" style={{ fontSize: 11, background: 'var(--teal-50)', color: 'var(--teal-800)', fontWeight: 600 }}>Nhóm ghép: K50–K51</span>
                <span className="chip" style={{ fontSize: 11, background: 'rgba(212, 113, 47, 0.1)', color: '#b45309', fontWeight: 600 }}>Khóa riêng: K52</span>
              </>
            )}
            {isGiaLai && (
              <span className="chip" style={{ fontSize: 11, background: '#ecfdf5', color: '#047857', fontWeight: 600 }}>
                🏛️ Tư vấn Đề án Tỉnh · 8 Phân hệ
              </span>
            )}
          </div>
          <h2>{p.name}</h2>
          {p.partner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0f766e', fontWeight: 600, marginTop: 4 }}>
              <L.Landmark size={15} style={{ flexShrink: 0 }} />
              <span>Đơn vị phối hợp: <b>{p.partner}</b></span>
            </div>
          )}
          {p.objective && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: '#334155', marginTop: 3, lineHeight: 1.45 }}>
              <L.Target size={15} style={{ flexShrink: 0, marginTop: 2, color: '#d97706' }} />
              <span>Mục tiêu: <b>{p.objective}</b></span>
            </div>
          )}
          <div className="muted small" style={{ maxWidth: 760, lineHeight: 1.55, marginTop: 4 }}>{p.description}</div>
        </div>
        <div style={{ minWidth: 220 }}>
          <div className="row between small"><span className="muted">Tiến độ</span><b>{pct}%</b></div>
          <div style={{ margin: '6px 0' }}><Progress value={pct} /></div>
          <div className="small faint">{fmtDate(p.startDate)} → {fmtDate(p.endDate)} · {left >= 0 ? `còn ${left} ngày` : 'đã kết thúc'}</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <AvatarStack users={members} size={30} max={5} />
          {canApproveMembers(me) && (
            <button
              className="btn sm"
              style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa', fontWeight: 600 }}
              onClick={() => setApprovalOpen(true)}
              title="Phê duyệt & phân quyền thành viên mới"
            >
              <L.ShieldCheck size={16} />
              <span className="hide-sm">Duyệt thành viên</span>
              {pendingCount > 0 && (
                <span className="badge" style={{ background: '#ef4444', color: '#fff', fontSize: 10, padding: '1px 5px' }}>
                  {pendingCount}
                </span>
              )}
            </button>
          )}
          {isMgr && <button className="btn" onClick={() => setEditing(true)}><L.Settings2 size={16} /><span className="hide-sm">Cài đặt</span></button>}
          <button
            className="btn accent"
            onClick={() => setFlightWorkflowOpen(true)}
            title={isGiaLai ? 'Điều phối đoàn công tác & vé máy bay Pleiku (SGN-PXU)' : 'Quy trình điều phối đợt giảng & tra cứu vé máy bay'}
          >
            <L.PlaneTakeoff size={15} />
            <span className="hide-sm">{isGiaLai ? 'Vé máy bay Pleiku' : 'Điều phối vé máy bay'}</span>
          </button>
          <button className="btn" onClick={() => setDocStudioOpen(true)} title="Tạo biểu mẫu hành chính tự động & xuất file Word/PDF">
            <L.FileSignature size={15} />
            <span className="hide-sm">Biểu mẫu Word/PDF</span>
          </button>
          {isMgr && <button className="btn primary" onClick={() => newTask({ projectId: p.id })}><L.Plus size={16} />Giao việc</button>}
        </div>
      </div>

      <div className="tabs" style={{ marginTop: 16 }}>
        {visibleTabs.map((t) => (
          <button key={t.id} className={cx('tab', tab === t.id && 'active')} onClick={() => go(`/projects/${p.id}/${t.id}`)}>
            <Icon name={t.icon} size={16} />{t.label}
            {t.id === 'workflows' && <span className="n">7</span>}
            {t.id === 'checklist' && <span className="n" style={{ background: '#fdecec', color: '#c62828' }}>18</span>}
            {t.id === 'members' && <span className="n">{members.length}</span>}
          </button>
        ))}
      </div>

      {['list', 'board', 'timeline'].includes(tab) && <FilterBar f={f} setF={setF} members={members} project={p} />}
      {tab === 'work' && <Workspace project={p} moduleId={sub} />}
      {tab === 'workflows' && <WorkflowsView project={p} onOpenFlightWorkflow={() => setFlightWorkflowOpen(true)} />}
      {tab === 'curriculum' && <CurriculumView project={p} />}
      {tab === 'checklist' && <ChecklistReconciliation project={p} />}
      {tab === 'list' && <ListView project={p} tasks={filtered} streams={streams} allTasks={allTasks} />}
      {tab === 'board' && <BoardView project={p} tasks={applyFilter(tasks, f.show === 'active' ? { ...f, show: 'all' } : f)} />}
      {tab === 'timeline' && <TimelineView project={p} tasks={filtered} />}
      {tab === 'overview' && <Overview p={p} tasks={tasks} streams={streams} members={members} />}
      {tab === 'activity' && <ActivityTab p={p} />}
      {tab === 'members' && <MembersTab p={p} isMgr={isMgr} tasks={tasks} onOpenApproval={() => setApprovalOpen(true)} />}
      {editing && <ProjectForm project={p} onClose={() => setEditing(false)} />}
      {docStudioOpen && <DocTemplateStudio initialTemplate={docStudioOpen.template || 'flightReq'} initialItem={docStudioOpen.item || null} project={p} onClose={() => setDocStudioOpen(false)} />}
      {flightWorkflowOpen && <FlightLogisticsWorkflow project={p} onClose={() => setFlightWorkflowOpen(false)} onOpenDocStudio={(opts) => setDocStudioOpen(opts || true)} />}
      {approvalOpen && <UserApprovalModal onClose={() => setApprovalOpen(false)} />}
    </>
  )
}

function Overview({ p, tasks, streams, members }) {
  const { go } = useUI()
  const { openTask } = useUI()
  const risks = tasks.filter((t) => isOverdue(t) || (isDueSoon(t, 3) && t.status === 'todo')).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
  return (
    <div className="stack">
      <div>
        <div className="section-title">{p.categories.length} hạng mục vận hành</div>
        <div className="cat-grid">
          {p.categories.map((c) => {
            const cs = streams.filter((t) => t.categoryId === c.id)
            const ct = cs.length ? cs : tasks.filter((t) => t.categoryId === c.id && !t.parentId)
            const all = tasks.filter((t) => t.categoryId === c.id)
            const pct = progressOf(all)
            const od = all.filter(isOverdue).length
            const owners = [...new Set(all.flatMap((t) => t.assigneeIds))].map((uid_) => members.find((u) => u.id === uid_)).filter(Boolean)
            return (
              <div key={c.id} className="cat-card" onClick={() => { go(`/projects/${p.id}/list`); setTimeout(() => document.getElementById('cat-' + c.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80) }}>
                <div className="cat-left">
                  <span className="cat-no">{c.no}</span>
                  <Icon name={c.icon} size={26} />
                  <div className="nm">{c.name}</div>
                </div>
                <div className="cat-right">
                  {ct.slice(0, 4).map((t) => {
                    const runs = t.isStream ? tasks.filter((r) => r.parentId === t.id) : []
                    const late = t.isStream ? runs.some(isOverdue) : isOverdue(t)
                    const open = runs.filter((r) => r.status !== 'done')
                    const done = t.isStream ? runs.length > 0 && !open.length : t.status === 'done'
                    return (
                      <div key={t.id} className={cx('ln', !t.isStream && done && 'done')} title={t.isStream ? `${open.length} đợt đang mở / ${runs.length} đợt` : ''}>
                        <span className="sq" style={{ background: late ? 'var(--danger)' : done ? 'var(--success)' : open.some((r) => r.status === 'review') ? 'var(--orange-600)' : open.length ? 'var(--teal-500)' : '#c3cfd0' }} />
                        <span className="grow">{t.title}</span>
                        {t.isStream && open.length > 0 && <span className="faint" style={{ whiteSpace: 'nowrap' }}>{open.length} đợt</span>}
                      </div>
                    )
                  })}
                  {!ct.length && <span className="faint small">Chưa có công việc</span>}
                  <div className="cat-foot">
                    <div className="progress grow"><i style={{ width: pct + '%' }} /></div>
                    <span>{all.filter((t) => t.status === 'done').length}/{all.length}</span>
                    {od > 0 && <span className="tone-danger" style={{ fontWeight: 700 }}>{od} trễ</span>}
                    <AvatarStack users={owners} size={20} max={3} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="ov-grid">
        <div className="card card-pad"><h3 style={{ fontSize: 15, marginBottom: 12 }}>Lịch deadline</h3><DeadlineHeatmap tasks={tasks} /></div>
        <div className="card card-pad"><h3 style={{ fontSize: 15, marginBottom: 12 }}>Việc tạo mới vs hoàn thành (theo tuần)</h3><CreatedCompleted tasks={tasks} /></div>
        <div className="card card-pad"><h3 style={{ fontSize: 15, marginBottom: 14 }}>Trạng thái</h3><StatusDonut tasks={tasks} /></div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Khối lượng công việc theo thành viên</h3></div>
        <div style={{ padding: '6px 6px 8px' }}><WorkloadTable tasks={tasks} users={members} /></div>
      </div>

      <div className="card">
        <div className="card-head"><h3><L.TriangleAlert size={16} color="var(--danger)" style={{ verticalAlign: -2, marginRight: 6 }} />Rủi ro tiến độ</h3><span className="small faint">Quá hạn hoặc sắp đến hạn nhưng chưa bắt đầu</span></div>
        <div style={{ padding: '6px 6px 8px' }}>
          {risks.length ? (
            <table className="tbl"><tbody>
              {risks.map((t) => (
                <tr key={t.id} className="click" onClick={() => openTask(t.id)}>
                  <td><div className="task-title">{t.title}</div><div className="task-sub">{p.categories.find((c) => c.id === t.categoryId)?.name}</div></td>
                  <td><AvatarStack users={t.assigneeIds.map((i) => members.find((u) => u.id === i)).filter(Boolean)} size={24} /></td>
                  <td style={{ textAlign: 'right' }}><span className={cx('badge', isOverdue(t) ? 'pill-danger' : 'pill-warn')}>{isOverdue(t) ? `Quá hạn ${-daysUntil(t.dueDate)} ngày` : `Còn ${daysUntil(t.dueDate)} ngày`}</span></td>
                </tr>
              ))}
            </tbody></table>
          ) : <Empty icon="ShieldCheck" text="Không có rủi ro tiến độ." />}
        </div>
      </div>
    </div>
  )
}

function ActivityTab({ p }) {
  const { state } = useStore()
  const { openTask } = useUI()
  const [n, setN] = useState(40)
  const list = state.activities.filter((a) => a.projectId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const groups = {}
  list.slice(0, n).forEach((a) => { const d = a.createdAt.slice(0, 10); (groups[d] ||= []).push(a) })
  return (
    <div className="card card-pad">
      <div className="callout info" style={{ marginBottom: 14 }}><L.Eye size={18} color="var(--teal-700)" />Mọi thay đổi trong dự án (giao việc, đổi hạn, trạng thái, bình luận, duyệt) đều được ghi lại và hiển thị cho tất cả {p.members.length} thành viên.</div>
      {Object.entries(groups).map(([d, items]) => (
        <div key={d}>
          <div className="section-title" style={{ marginTop: 10 }}>{fmtDate(d)}</div>
          <ul className="feed">
            {items.map((a) => {
              const u = state.users.find((x) => x.id === a.userId)
              const ok = a.taskId && state.tasks.some((t) => t.id === a.taskId)
              return <li key={a.id} className={ok ? 'click' : ''} onClick={() => ok && openTask(a.taskId)}><Avatar user={u} size={30} /><div><div className="txt"><b>{u?.name}</b> {a.text}</div><div className="when">{timeAgo(a.createdAt)}</div></div></li>
            })}
          </ul>
        </div>
      ))}
      {!list.length && <Empty text="Chưa có hoạt động" />}
      {list.length > n && <button className="btn" onClick={() => setN(n + 40)}>Xem thêm</button>}
    </div>
  )
}

function MembersTab({ p, isMgr, tasks, onOpenApproval }) {
  const { state, me, setMember, removeMember } = useStore()
  const toast = useToast()
  const [add, setAdd] = useState('')
  const outside = state.users.filter((u) => !p.members.some((m) => m.userId === u.id) && u.status !== USER_STATUS.PENDING && u.status !== USER_STATUS.REJECTED)
  return (
    <div className="card">
      {isMgr && <JoinCodeCard project={p} />}
      {isMgr && (
        <div className="row between wrap" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', gap: 10 }}>
          <div className="row wrap" style={{ gap: 10, alignItems: 'center' }}>
            <select className="select" style={{ maxWidth: 320 }} value={add} onChange={(e) => setAdd(e.target.value)}>
              <option value="">Chọn nhân sự để thêm vào dự án…</option>
              {outside.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.title}</option>)}
            </select>
            <button className="btn primary" disabled={!add} onClick={() => { setMember(p.id, add, 'member'); setAdd(''); toast('Đã thêm thành viên. Họ sẽ thấy toàn bộ thông tin dự án.') }}><L.UserPlus size={16} />Thêm vào dự án</button>
            <span className="small faint">Thành viên mới thấy ngay mọi công việc, thảo luận và lịch sử của dự án.</span>
          </div>
          {onOpenApproval && (
            <button
              type="button"
              className="btn sm"
              style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa', fontWeight: 600 }}
              onClick={onOpenApproval}
            >
              <L.ShieldCheck size={15} />
              Quản lý Phê duyệt & RBAC
            </button>
          )}
        </div>
      )}
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Thành viên</th><th>Vai trò trong dự án</th><th>Đang mở</th><th>Quá hạn</th><th>Hoàn thành</th>{isMgr && <th />}</tr></thead>
          <tbody>
            {p.members.map((m) => {
              const u = state.users.find((x) => x.id === m.userId)
              if (!u) return null
              const mt = tasks.filter((t) => t.assigneeIds.includes(u.id))
              const roleCfg = getRoleConfig(u.role)
              return (
                <tr key={u.id}>
                  <td>
                    <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                      <Avatar user={u} size={36} />
                      <div>
                        <b>{u.name}</b>{u.id === me.id && <span className="faint"> (bạn)</span>}
                        <div className="faint small">{u.title} · {u.email}</div>
                        <div style={{ marginTop: 2 }}>
                          <span
                            className="badge"
                            style={{
                              background: roleCfg.bg,
                              color: roleCfg.color,
                              border: `1px solid ${roleCfg.borderColor}`,
                              fontSize: 10.5,
                              padding: '1px 6px',
                            }}
                          >
                            {roleCfg.name} ({roleCfg.shortName})
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {isMgr && u.id !== me.id ? (
                      <select className="select sm" style={{ width: 150 }} value={m.role} onChange={(e) => setMember(p.id, u.id, e.target.value)}>
                        <option value="manager">Quản lý</option><option value="member">Thành viên</option>
                      </select>
                    ) : <span className="badge" style={{ background: m.role === 'manager' ? 'var(--orange-100)' : 'var(--teal-100)', color: m.role === 'manager' ? 'var(--orange-700)' : 'var(--teal-800)' }}>{m.role === 'manager' ? 'Quản lý' : 'Thành viên'}</span>}
                  </td>
                  <td>{mt.filter((t) => t.status !== 'done').length}</td>
                  <td className={mt.some(isOverdue) ? 'tone-danger' : ''}>{mt.filter(isOverdue).length || '–'}</td>
                  <td>{mt.filter((t) => t.status === 'done').length}</td>
                  {isMgr && <td style={{ textAlign: 'right' }}>{u.id !== me.id && <button className="btn sm danger" onClick={() => confirm(`Xóa ${u.name} khỏi dự án?`) && removeMember(p.id, u.id)}>Xóa</button>}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
