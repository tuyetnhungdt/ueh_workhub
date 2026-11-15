import { useState, useMemo, useEffect } from 'react'
import * as L from 'lucide-react'
import { useStore, projectRole } from '../data/store.jsx'
import { canAccessProjectTab, canApproveMembers, getRoleConfig, USER_STATUS, isProjectManager, getUserProjectRole, getDefaultRolePermissions } from '../data/rbac.js'
import { useUI } from '../App.jsx'
import { ListView, BoardView, TimelineView } from '../components/TaskViews.jsx'
import { DeadlineHeatmap, CreatedCompleted, WorkloadTable, StatusDonut } from '../components/Analytics.jsx'
import { useToast, Avatar, AvatarStack, Empty, Icon, Progress } from '../components/ui.jsx'
import { cx, daysUntil, fmtDate, isOverdue, isDueSoon, normalize, progressOf, timeAgo, TAG_COLORS, uid, formatProjectCode } from '../lib/utils.js'
import ProjectForm from '../components/ProjectForm.jsx'
import Workspace from '../modules/Workspace.jsx'
import WorkflowsView from '../components/WorkflowsView.jsx'
import CurriculumView from '../components/CurriculumView.jsx'
import ChecklistReconciliation from '../components/ChecklistReconciliation.jsx'
import UserApprovalModal from '../components/UserApprovalModal.jsx'
import { JoinCodeCard } from '../components/JoinProject.jsx'
import ProjectWorkflow from './ProjectWorkflow.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'

export function FilterBar({ f, setF, members, project, extra }) {
  return (
    <div className="filterbar">
      <div className="search sm"><L.Search size={15} /><input className="input" placeholder="Lọc theo tên…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} /></div>
      <select className="select sm" value={f.show} onChange={(e) => setF({ ...f, show: e.target.value })}>
        <option value="active">Việc đang mở</option><option value="all">Tất cả</option><option value="overdue">Quá hạn</option><option value="review">Chờ duyệt</option><option value="done">Đã hoàn thành</option>
      </select>
      <select className="select sm" value={f.cohort || ''} onChange={(e) => setF({ ...f, cohort: e.target.value })}>
        <option value="">Khóa: tất cả</option>
        <option value="K50–K51">Khóa K50–K51</option>
        <option value="K52">Khóa K52</option>
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
  { id: 'list', label: 'Tổng quan', icon: 'ListTree' },
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
  const [editTab, setEditTab] = useState('info')
  const [approvalOpen, setApprovalOpen] = useState(false)
  const p = state.projects.find((x) => x.id === id)
  const userRole = getUserProjectRole(p, me)
  if (!p) return <Empty icon="FolderX" text="Không tìm thấy dự án." />
  if (!userRole) return <Empty icon="Lock" text="Bạn không phải thành viên của dự án này." />
  const isMgr = isProjectManager(p, me)
  const roleCfg = getRoleConfig(userRole, p)
  const allTasks = state.tasks.filter((t) => t.projectId === p.id)
  const tasks = allTasks.filter((t) => !t.isStream)
  const streams = allTasks.filter((t) => t.isStream)
  const members = p.members.map((m) => state.users.find((u) => u.id === m.userId)).filter(Boolean)
  const pct = progressOf(tasks)
  const filtered = applyFilter(tasks, f)
  const left = daysUntil(p.endDate)
  const pendingCount = (state.users || []).filter((u) => u.status === USER_STATUS.PENDING).length
  const isGiaLai = p.id === 'p3' || p.code?.includes('QDTMH')
  const activeTab = useMemo(() => {
    if (['overview', 'members', 'workflow'].includes(tab)) return 'progress'
    if (['workflows', 'curriculum', 'checklist'].includes(tab)) return 'work'
    return tab || 'work'
  }, [tab])
  const visibleTabs = TABS.filter((t) => canAccessProjectTab(me, t.id, p))

  return (
    <>
      <div className="card proj-header">
        <span className="bar" style={{ background: p.color }} />
        <div className="grow" style={{ minWidth: 260 }}>
          <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>{p.name}</h2>
            <span className="chip" style={{ fontWeight: 700, fontSize: 11.5, letterSpacing: '0.04em' }}>{formatProjectCode(p.code)}</span>
          </div>
        </div>
        <div style={{ minWidth: 220 }}>
          <div className="row between small"><span className="muted">Tiến độ</span><b>{pct}%</b></div>
          <div style={{ margin: '6px 0' }}><Progress value={pct} /></div>
          <div className="small faint">{fmtDate(p.startDate)} → {fmtDate(p.endDate)} · {left >= 0 ? `còn ${left} ngày` : 'đã kết thúc'}</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <AvatarStack users={members} size={30} max={5} />
          {(isMgr || me.role === 'admin' || me.role === 'super_admin') && (
            <button className="btn" onClick={() => { setEditTab('info'); setEditing(true); }} title="Cài đặt dự án">
              <L.Settings2 size={16} />
              <span className="hide-sm">Cài đặt</span>
            </button>
          )}
          {isMgr && <button className="btn primary" onClick={() => newTask({ projectId: p.id })}><L.Plus size={16} />Giao việc</button>}
        </div>
      </div>

      <div className="tabs" style={{ marginTop: 16 }}>
        {visibleTabs.map((t) => (
          <button key={t.id} className={cx('tab', activeTab === t.id && 'active')} onClick={() => go(`/projects/${p.id}/${t.id}`)}>
            <Icon name={t.icon} size={16} />{t.label}
          </button>
        ))}
      </div>

      {!visibleTabs.some((t) => t.id === activeTab) ? (
        <div className="card card-pad empty" style={{ textAlign: 'center', padding: '50px 20px', marginTop: 16 }}>
          <L.ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 8px' }}>Đề mục bị giới hạn theo vai trò dự án</h3>
          <p className="muted small" style={{ maxWidth: 460, margin: '0 auto 16px', lineHeight: 1.5 }}>
            Vai trò của bạn trong dự án <b>{p.name}</b> là <b>{roleCfg.viName}</b>. Đề mục này không nằm trong danh sách được phép truy cập theo thiết lập phân quyền của dự án.
          </p>
          {visibleTabs[0] && (
            <button className="btn sm primary" onClick={() => go(`/projects/${p.id}/${visibleTabs[0].id}`)}>
              Chuyển đến đề mục "{visibleTabs[0].label}"
            </button>
          )}
        </div>
      ) : (
        <>
          {['list', 'board', 'timeline'].includes(activeTab) && <FilterBar f={f} setF={setF} members={members} project={p} />}
          {activeTab === 'work' && <Workspace project={p} moduleId={sub} />}
          {activeTab === 'list' && <ListView project={p} tasks={filtered} streams={streams} allTasks={allTasks} />}
          {activeTab === 'board' && <BoardView project={p} tasks={applyFilter(tasks, f.show === 'active' ? { ...f, show: 'all' } : f)} />}
          {activeTab === 'timeline' && <TimelineView project={p} tasks={filtered} />}
          {activeTab === 'progress' && (
            <ProgressTab
              p={p}
              tasks={tasks}
              streams={streams}
              members={members}
              isMgr={isMgr}
              initialSubView={sub || (tab === 'workflow' ? 'workflow' : null)}
              onOpenApproval={() => setApprovalOpen(true)}
              onOpenProjectPermissions={() => { setEditTab('permissions'); setEditing(true); }}
            />
          )}
          {activeTab === 'activity' && <ActivityTab p={p} />}
        </>
      )}
      {editing && <ProjectForm project={p} onClose={() => setEditing(false)} initialTab={editTab} />}
      {approvalOpen && <UserApprovalModal onClose={() => setApprovalOpen(false)} />}
    </>
  )
}

function ProgressTab({ p, tasks, streams, members, isMgr, initialSubView, onOpenApproval, onOpenProjectPermissions }) {
  const { openTask } = useUI()
  const risks = tasks.filter((t) => isOverdue(t) || (isDueSoon(t, 3) && t.status === 'todo')).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const reviewCount = tasks.filter((t) => t.status === 'review').length
  const overdueCount = tasks.filter(isOverdue).length

  const [subView, setSubView] = useState(() => {
    if (initialSubView) return initialSubView
    try {
      return localStorage.getItem('ueh_progress_subview') || 'workflow'
    } catch {
      return 'workflow'
    }
  })

  useEffect(() => {
    if (initialSubView) {
      setSubView(initialSubView)
    }
  }, [initialSubView])

  const handleSubViewChange = (v) => {
    setSubView(v)
    try {
      localStorage.setItem('ueh_progress_subview', v)
    } catch {}
  }

  return (
    <div className="stack">
      {/* Thống kê nhanh chỉ số tiến độ */}
      <div className="row wrap" style={{ gap: 12 }}>
        <div className="card card-pad" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'grid', placeItems: 'center' }}>
            <L.CheckCircle2 size={22} />
          </div>
          <div>
            <div className="small faint">Đã hoàn thành</div>
            <b style={{ fontSize: 19, color: 'var(--teal-800)' }}>{doneCount} / {tasks.length}</b>
            <div className="small muted">đầu việc dự án</div>
          </div>
        </div>
        <div className="card card-pad" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fff7ed', color: '#ea580c', display: 'grid', placeItems: 'center' }}>
            <L.Clock size={22} />
          </div>
          <div>
            <div className="small faint">Chờ phê duyệt</div>
            <b style={{ fontSize: 19, color: '#c2410c' }}>{reviewCount} việc</b>
            <div className="small muted">quản lý cần xem xét</div>
          </div>
        </div>
        <div className="card card-pad" style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fef2f2', color: '#dc2626', display: 'grid', placeItems: 'center' }}>
            <L.AlertTriangle size={22} />
          </div>
          <div>
            <div className="small faint">Quá hạn tiến độ</div>
            <b style={{ fontSize: 19, color: '#b91c1c' }}>{overdueCount} việc</b>
            <div className="small muted">cần ưu tiên giải quyết</div>
          </div>
        </div>
      </div>

      {/* Thanh chuyển chế độ xem trong mục Tiến độ */}
      <div className="row between wrap" style={{ gap: 10, alignItems: 'center', margin: '4px 0 2px' }}>
        <div className="seg" style={{ background: '#ffffff', border: '1px solid var(--border)', padding: 3, borderRadius: 10 }}>
          <button
            type="button"
            className={cx(subView === 'workflow' && 'on')}
            onClick={() => handleSubViewChange('workflow')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, padding: '6px 14px' }}
          >
            <L.GitFork size={15} />
            Sơ đồ & Workflow
          </button>
          <button
            type="button"
            className={cx(subView === 'reports' && 'on')}
            onClick={() => handleSubViewChange('reports')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, padding: '6px 14px' }}
          >
            <L.BarChart3 size={15} />
            Chỉ số & Báo cáo
          </button>
          <button
            type="button"
            className={cx(subView === 'all' && 'on')}
            onClick={() => handleSubViewChange('all')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, padding: '6px 14px' }}
          >
            <L.LayoutGrid size={15} />
            Xem toàn bộ
          </button>
        </div>

        <div className="small faint hide-sm">
          {subView === 'workflow' && 'Sơ đồ luồng phân cấp 4 tầng Line of Sight & phân công đầu việc'}
          {subView === 'reports' && 'Lịch deadline, biểu đồ tạo mới/hoàn thành & rủi ro tiến độ'}
          {subView === 'all' && 'Hiển thị đầy đủ Sơ đồ workflow và toàn bộ báo cáo tiến độ'}
        </div>
      </div>

      {/* 1. Phần Sơ đồ & Workflow */}
      {(subView === 'workflow' || subView === 'all') && (
        <ProjectWorkflow projectId={p.id} project={p} isEmbedded={true} />
      )}

      {/* 2. Phần Chỉ số & Báo cáo tiến độ */}
      {(subView === 'reports' || subView === 'all') && (
        <>
          <div className="ov-grid">
            <div className="card card-pad"><h3 style={{ fontSize: 15, marginBottom: 12 }}>Lịch deadline</h3><DeadlineHeatmap tasks={tasks} /></div>
            <div className="card card-pad"><h3 style={{ fontSize: 15, marginBottom: 12 }}>Việc tạo mới vs hoàn thành (theo tuần)</h3><CreatedCompleted tasks={tasks} /></div>
            <div className="card card-pad"><h3 style={{ fontSize: 15, marginBottom: 14 }}>Trạng thái</h3><StatusDonut tasks={tasks} /></div>
          </div>

          <div className="card">
            <div className="card-head"><h3><L.TriangleAlert size={16} color="var(--danger)" style={{ verticalAlign: -2, marginRight: 6 }} />Rủi ro tiến độ</h3><span className="small faint">Quá hạn hoặc sắp đến hạn nhưng chưa bắt đầu</span></div>
            <div style={{ padding: '6px 6px 8px' }}>
              {risks.length ? (
                <table className="tbl"><tbody>
                  {risks.map((t) => (
                    <tr key={t.id} className="click" onClick={() => openTask(t.id)}>
                      <td><div className="task-title">{t.title}</div><div className="task-sub">{(p?.categories || []).find((c) => c.id === t.categoryId)?.name || 'Chung'}</div></td>
                      <td><AvatarStack users={(t.assigneeIds || []).map((i) => members.find((u) => u.id === i)).filter(Boolean)} size={24} /></td>
                      <td style={{ textAlign: 'right' }}><span className={cx('badge', isOverdue(t) ? 'pill-danger' : 'pill-warn')}>{isOverdue(t) ? `Quá hạn ${-daysUntil(t.dueDate)} ngày` : `Còn ${daysUntil(t.dueDate)} ngày`}</span></td>
                    </tr>
                  ))}
                </tbody></table>
              ) : <Empty icon="ShieldCheck" text="Không có rủi ro tiến độ." />}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Khối lượng công việc theo thành viên</h3></div>
            <div style={{ padding: '6px 6px 8px' }}><WorkloadTable tasks={tasks} users={members} /></div>
          </div>

          <div>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <L.Users size={18} color="var(--teal-700)" />
              Thành viên dự án ({members.length}) & Phân quyền
            </div>
            <MembersTab
              p={p}
              isMgr={isMgr}
              tasks={tasks}
              onOpenApproval={onOpenApproval}
              onOpenProjectPermissions={onOpenProjectPermissions}
            />
          </div>
        </>
      )}
    </div>
  )
}

function ActivityTab({ p }) {
  const { state } = useStore()
  const { openTask } = useUI()
  const [n, setN] = useState(40)
  const list = state.activities.filter((a) => a.projectId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const groups = {}
  list.slice(0, n).forEach((a) => { const d = (a.createdAt || '').slice(0, 10); if (d) (groups[d] ||= []).push(a) })
  return (
    <div className="card card-pad">
      <div className="callout info" style={{ marginBottom: 14 }}><L.Eye size={18} color="var(--teal-700)" />Mọi thay đổi trong dự án (giao việc, đổi hạn, trạng thái, bình luận, duyệt) đều được ghi lại và hiển thị cho tất cả {(p?.members || []).length} thành viên.</div>
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

function MembersTab({ p, isMgr, tasks, onOpenApproval, onOpenProjectPermissions }) {
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
            <button className="btn primary" disabled={!add} onClick={() => { setMember(p.id, add, 'member'); setAdd(''); toast('Đã thêm thành viên vào dự án.') }}><L.UserPlus size={16} />Thêm vào dự án</button>
            <span className="small faint">Thành viên mới thấy ngay các đề mục được phân quyền trong dự án.</span>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            {onOpenApproval && (
              <button
                type="button"
                className="btn sm"
                style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa', fontWeight: 600 }}
                onClick={onOpenApproval}
              >
                <L.ShieldCheck size={15} />
                Quản lý phê duyệt & phân quyền
              </button>
            )}
            {isMgr && onOpenProjectPermissions && (
              <button
                type="button"
                className="btn sm"
                style={{ background: '#f0fdfa', color: 'var(--teal-700)', borderColor: '#99f6e4', fontWeight: 600 }}
                onClick={onOpenProjectPermissions}
              >
                <L.SlidersHorizontal size={15} />
                Cài đặt phân quyền đề mục dự án
              </button>
            )}
          </div>
        </div>
      )}
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Thành viên</th><th>Vai trò</th><th>Đang mở</th><th>Quá hạn</th><th>Hoàn thành</th>{isMgr && <th />}</tr></thead>
          <tbody>
            {p.members.map((m) => {
              const u = state.users.find((x) => x.id === m.userId)
              if (!u) return null
              const mt = tasks.filter((t) => t.assigneeIds.includes(u.id))
              const roleCfg = getRoleConfig(m.role || u.role, p)
              const projPerms = p.rolePermissions || getDefaultRolePermissions(p)

              return (
                <tr key={u.id}>
                  <td>
                    <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                      <Avatar user={u} size={36} />
                      <div>
                        <b>{u.name}</b>{u.id === me.id && <span className="faint"> (bạn)</span>}
                        <div className="faint small">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {isMgr && u.id !== me.id ? (
                      <select
                        className="select sm"
                        style={{ minWidth: 170, fontWeight: 600 }}
                        value={m.role || 'member'}
                        onChange={(e) => setMember(p.id, u.id, e.target.value)}
                      >
                        {Object.entries(projPerms)
                          .filter(([rKey]) => rKey !== 'lecturer')
                          .map(([rKey, rVal]) => (
                            <option key={rKey} value={rKey}>
                              {rVal.name || getRoleConfig(rKey, p).viName}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <span
                        className="badge"
                        style={{
                          background: roleCfg.bg,
                          color: roleCfg.color,
                          border: `1px solid ${roleCfg.borderColor || '#cbd5e1'}`,
                          fontWeight: 600,
                        }}
                      >
                        {roleCfg.viName || roleCfg.name || m.role}
                      </span>
                    )}
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
