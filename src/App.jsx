import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as L from 'lucide-react'
import { useStore, visibleProjects, visibleTasks, HAS_SUPABASE, exitDemo } from './data/store.jsx'
import { canApproveMembers, normalizeRole, getRoleConfig, USER_STATUS, ROLES } from './data/rbac.js'
import { Avatar, Icon } from './components/ui.jsx'
import { cx, isOverdue, isDueSoon, normalize, timeAgo, deadlineLabel } from './lib/utils.js'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MyTasks from './pages/MyTasks.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import Team from './pages/Team.jsx'
import Lecturers from './pages/Lecturers.jsx'
import TaskDrawer from './components/TaskDrawer.jsx'
import TaskForm from './components/TaskForm.jsx'
import UserApprovalModal from './components/UserApprovalModal.jsx'
import PendingApprovalView from './components/PendingApprovalView.jsx'
import EmailReviewModal from './components/EmailReviewModal.jsx'

const UICtx = createContext(null)
export const useUI = () => useContext(UICtx)

function useHashRoute() {
  const get = () => (window.location.hash.replace(/^#/, '') || '/').split('?')[0]
  const [path, setPath] = useState(get)
  useEffect(() => {
    const h = () => setPath(get())
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  return path
}

export default function App() {
  const store = useStore()
  const path = useHashRoute()
  const [taskId, setTaskId] = useState(null)
  const [newTask, setNewTask] = useState(null)
  const [navOpen, setNavOpen] = useState(false)
  const [mini, setMini] = useState(() => { try { return localStorage.getItem('ueh_nav_mini') === '1' } catch { return false } })
  const toggleMini = () => setMini((v) => { try { localStorage.setItem('ueh_nav_mini', v ? '0' : '1') } catch {} ; return !v })

  const ui = useMemo(() => ({
    path,
    go: (p) => { window.location.hash = p; setNavOpen(false) },
    openTask: (id) => setTaskId(id),
    closeTask: () => setTaskId(null),
    newTask: (defaults = {}) => setNewTask(defaults),
  }), [path])

  if (store.error) return <div className="empty" style={{ paddingTop: 80 }}>Lỗi tải dữ liệu: {store.error}</div>
  if (!store.authReady) return <Splash />
  if (!store.me && !(store.mode === 'supabase' && store.meId)) return <Login />
  if (!store.state || !store.me) return <Splash />
  if (store.me.status === USER_STATUS.PENDING || store.me.status === USER_STATUS.REJECTED) {
    return <PendingApprovalView />
  }

  const seg = path.split('/').filter(Boolean)
  let page
  if (seg[0] === 'my-tasks') page = <MyTasks />
  else if (seg[0] === 'projects' && seg[1] && seg[2] === 'lecturers') page = <Lecturers projectId={seg[1]} />
  else if (seg[0] === 'projects' && seg[1]) page = <ProjectDetail id={seg[1]} tab={seg[2] || 'work'} sub={seg[3]} />
  else if (seg[0] === 'projects') page = <Projects />
  else if (seg[0] === 'calendar') page = <CalendarPage />
  else if (seg[0] === 'team') page = <Team />
  else if (seg[0] === 'lecturers') page = <Lecturers />
  else page = <Dashboard />

  return (
    <UICtx.Provider value={ui}>
      <div className={cx('app', mini && 'mini')}>
        <Sidebar open={navOpen} mini={mini} onToggle={toggleMini} />
        <div className={cx('scrim', navOpen && 'open')} onClick={() => setNavOpen(false)} />
        <div className="main">
          {store.mode === 'demo' && HAS_SUPABASE && (
            <div className="demo-banner"><L.FlaskConical size={14} />Bạn đang xem <b>BẢN DEMO</b> với dữ liệu mẫu (chỉ lưu trên trình duyệt này, không ảnh hưởng dữ liệu thật).<button onClick={exitDemo}>Thoát demo</button></div>
          )}
          <Topbar onMenu={() => setNavOpen(true)} mini={mini} onToggle={toggleMini} />
          <div className="content">{page}</div>
        </div>
      </div>
      {taskId && store.state.tasks.some((t) => t.id === taskId) && <TaskDrawer id={taskId} onClose={() => setTaskId(null)} />}
      {newTask && <TaskForm defaults={newTask} onClose={() => setNewTask(null)} />}
    </UICtx.Provider>
  )
}

const Splash = () => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
    <img src="/ueh-logo.png" alt="UEH" style={{ height: 64, opacity: 0.85 }} />
  </div>
)

function Sidebar({ open, mini, onToggle }) {
  const { state, me, mode } = useStore()
  const { path, go } = useUI()
  const projects = visibleProjects(state, me)
  const mine = state.tasks.filter((t) => !t.isStream && t.assigneeIds.includes(me.id) && t.status !== 'done')
  const reviewCount = visibleTasks(state, me).filter((t) => t.status === 'review' && (me.role === 'admin' || state.projects.find((p) => p.id === t.projectId)?.members.some((m) => m.userId === me.id && m.role === 'manager'))).length
  const link = (to, icon, label, count, exact) => {
    const active = exact ? path === to : path.startsWith(to)
    return (
      <a href={'#' + to} title={label} className={cx(active && 'active')} onClick={(e) => { e.preventDefault(); go(to) }}>
        <Icon name={icon} size={18} /><span className="lbl">{label}</span>{count ? <span className="count">{count}</span> : null}
      </a>
    )
  }
  return (
    <aside className={cx('sidebar', open && 'open')}>
      <div className="brand">
        <div className="brand-logo"><img src="/ueh-logo.png" alt="UEH University" /></div>
        <div className="brand-text"><b>WorkHub</b><span>Điều phối công việc</span></div>
      </div>
      <div className="sidebar-scroll">
        <nav className="nav">
          {link('/', 'LayoutDashboard', 'Tổng quan', null, true)}
          {link('/my-tasks', 'ListTodo', 'Việc của tôi', mine.length)}
          {link('/projects', 'FolderKanban', 'Dự án', null, true)}
          {link('/calendar', 'CalendarDays', 'Lịch deadline')}
          {link('/team', 'Users', 'Nhân sự & khối lượng')}
          <div className="nav-label">Dự án của tôi</div>
          {projects.map((p) => {
            const inLec = path.startsWith(`/projects/${p.id}/lecturers`)
            return (
              <div key={p.id}>
                <a title={p.name} href={'#/projects/' + p.id} className={cx(path.startsWith('/projects/' + p.id) && !inLec && 'active')}
                  onClick={(e) => { e.preventDefault(); go('/projects/' + p.id) }}>
                  <span className="proj-dot" style={{ background: p.color }} />
                  <span className="proj-name">{p.name}</span>
                </a>
                {/* mục con của dự án: chỉ dự án có hạng mục Giảng viên (05) */}
                {p.categories.some((c) => c.id === 'c05') && <div className="nav-sub">{link(`/projects/${p.id}/lecturers`, 'Presentation', 'Hồ sơ giảng viên')}</div>}
              </div>
            )
          })}
        </nav>
      </div>
      <div className="sidebar-foot">
        <button className="collapse-btn" onClick={onToggle} title={mini ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}>{mini ? <L.PanelLeftOpen size={17} /> : <><L.PanelLeftClose size={17} /><span className="lbl">Thu gọn</span></>}</button>
        <span className="mode"><L.Database size={13} /><span className="lbl">{mode === 'demo' ? 'Chế độ demo · lưu trên trình duyệt' : 'Đồng bộ thời gian thực'}</span></span>
      </div>
    </aside>
  )
}

const TITLES = { '': 'Tổng quan', 'my-tasks': 'Việc của tôi', projects: 'Dự án', calendar: 'Lịch deadline', team: 'Nhân sự & khối lượng công việc', lecturers: 'Hồ sơ giảng viên' }

function Topbar({ onMenu, mini, onToggle }) {
  const { state, me } = useStore()
  const { path } = useUI()
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState(null)
  const seg = path.split('/').filter(Boolean)
  const proj = seg[0] === 'projects' && seg[1] ? state.projects.find((p) => p.id === seg[1]) : null
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
  const pendingCount = (state.users || []).filter((u) => u.status === USER_STATUS.PENDING).length
  const pendingReminders = (state.emailReminders || []).filter((r) => r.status === 'pending_review')
  const isSuper = canApproveMembers(me)

  return (
    <header className="topbar">
      <button className="iconbtn menu-btn" onClick={onMenu} aria-label="Mở menu"><L.Menu size={20} /></button>
      <button className="iconbtn desk-toggle" onClick={onToggle} title={mini ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'} aria-label="Thu gọn / mở rộng thanh bên">{mini ? <L.PanelLeftOpen size={20} /> : <L.PanelLeftClose size={20} />}</button>
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="crumbs">{proj ? 'Dự án' : 'UEH WorkHub'} · <span style={{ textTransform: 'capitalize' }}>{today}</span></div>
        <h1 className="ellipsis">{proj ? proj.name : TITLES[seg[0] || '']}</h1>
      </div>
      {pendingReminders.length > 0 && (
        <button
          type="button"
          className="btn sm"
          style={{
            background: '#eff6ff',
            color: '#1d4ed8',
            borderColor: '#bfdbfe',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
          }}
          onClick={() => setSelectedReminder(pendingReminders[0])}
          title="Xem lại và duyệt gửi email nhắc việc qua Resend"
        >
          <L.MailCheck size={16} />
          <span className="hide-sm">Duyệt gửi email</span>
          <span
            className="badge"
            style={{ background: '#2563eb', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 9 }}
          >
            {pendingReminders.length}
          </span>
        </button>
      )}
      {isSuper && (
        <button
          type="button"
          className="btn sm"
          style={{
            background: pendingCount > 0 ? '#fee2e2' : '#fff7ed',
            color: pendingCount > 0 ? '#b91c1c' : '#c2410c',
            borderColor: pendingCount > 0 ? '#fca5a5' : '#fed7aa',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
          }}
          onClick={() => setApprovalOpen(true)}
          title="Phê duyệt thành viên mới & Phân quyền RBAC"
        >
          <L.ShieldCheck size={16} />
          <span className="hide-sm">Duyệt thành viên</span>
          {pendingCount > 0 && (
            <span
              className="badge"
              style={{ background: '#ef4444', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 9 }}
            >
              {pendingCount}
            </span>
          )}
        </button>
      )}
      <Search />
      <Notifications onSelectReminder={(r) => setSelectedReminder(r)} />
      <UserMenu />
      {approvalOpen && <UserApprovalModal onClose={() => setApprovalOpen(false)} />}
      {selectedReminder && <EmailReviewModal reminder={selectedReminder} onClose={() => setSelectedReminder(null)} />}
    </header>
  )
}

function useOutside(ref, cb) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && cb()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, cb])
}

function Search() {
  const { state, me } = useStore()
  const { openTask, go } = useUI()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useOutside(ref, () => setOpen(false))
  const nq = normalize(q.trim())
  const tasks = nq ? visibleTasks(state, me).filter((t) => normalize(t.title).includes(nq)).slice(0, 8) : []
  const projects = nq ? visibleProjects(state, me).filter((p) => normalize(p.name + ' ' + p.code).includes(nq)).slice(0, 3) : []
  return (
    <div className="search" ref={ref}>
      <L.Search size={16} />
      <input className="input" placeholder="Tìm công việc, dự án…" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} />
      {open && nq && (
        <div className="pop">
          {!tasks.length && !projects.length && <div className="empty small">Không tìm thấy kết quả</div>}
          {projects.map((p) => (
            <div key={p.id} className="sr" onClick={() => { go('/projects/' + p.id); setOpen(false); setQ('') }}>
              <div className="row"><L.FolderKanban size={15} color={p.color} /><b>{p.name}</b></div>
            </div>
          ))}
          {tasks.map((t) => {
            const p = state.projects.find((x) => x.id === t.projectId)
            return (
              <div key={t.id} className="sr" onClick={() => { openTask(t.id); setOpen(false); setQ('') }}>
                <div className="task-title" style={{ fontSize: 13 }}>{t.title}</div>
                <div className="task-sub">{p?.code} · {deadlineLabel(t).text}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Notifications({ onSelectReminder }) {
  const { state, me, markRead } = useStore()
  const { openTask, go } = useUI()
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useOutside(ref, () => setOpen(false))
  const list = state.notifications.filter((n) => n.userId === me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const alerts = state.tasks.filter((t) => !t.isStream && t.assigneeIds.includes(me.id) && (isOverdue(t) || isDueSoon(t, 1)))
  const unread = list.filter((n) => !n.read).length
  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="iconbtn" onClick={() => setOpen(!open)} aria-label="Thông báo">
        <L.Bell size={20} />
        {unread + alerts.length > 0 && <span className="bell-dot">{unread + alerts.length}</span>}
      </button>
      {open && (
        <div className="pop">
          <div className="pop-head">
            <b>Thông báo</b>
            {unread > 0 && <button className="btn sm ghost" onClick={() => markRead(list.map((n) => n.id))}>Đánh dấu đã đọc</button>}
          </div>
          {alerts.map((t) => (
            <div key={'al' + t.id} className="notif unread" onClick={() => { openTask(t.id); setOpen(false) }}>
              <span className="ic" style={{ background: isOverdue(t) ? 'var(--danger-bg)' : 'var(--warn-bg)', color: isOverdue(t) ? 'var(--danger)' : 'var(--warn)' }}><L.AlarmClock size={16} /></span>
              <div><b>{deadlineLabel(t).text}</b> · {t.title}</div>
            </div>
          ))}
          {list.length === 0 && alerts.length === 0 && <div className="empty small">Chưa có thông báo</div>}
          {list.slice(0, 30).map((n) => (
            <div
              key={n.id}
              className={cx('notif', !n.read && 'unread')}
              onClick={() => {
                markRead([n.id])
                if (n.reminderId) {
                  const r = (state.emailReminders || []).find((x) => x.id === n.reminderId)
                  if (r && onSelectReminder) onSelectReminder(r)
                } else if (n.taskId) {
                  openTask(n.taskId)
                } else {
                  go('/projects/' + n.projectId)
                }
                setOpen(false)
              }}
            >
              <span
                className="ic"
                style={{
                  background: n.reminderId ? '#e0f2fe' : 'var(--teal-50)',
                  color: n.reminderId ? '#0284c7' : 'var(--teal-700)',
                }}
              >
                {n.reminderId ? <L.MailCheck size={16} /> : <L.BellRing size={16} />}
              </span>
              <div>{n.text}<div className="faint small">{timeAgo(n.createdAt)}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UserMenu() {
  const store = useStore()
  const { me, state, mode } = store
  const [open, setOpen] = useState(false)
  const [approvalOpen, setApprovalOpen] = useState(false)
  const ref = useRef()
  useOutside(ref, () => setOpen(false))
  const roleCfg = getRoleConfig(me.role)
  const isSuper = canApproveMembers(me)
  const pendingCount = (state.users || []).filter((u) => u.status === USER_STATUS.PENDING).length

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="userbtn" onClick={() => setOpen(!open)}>
        <Avatar user={me} size={36} />
        <span className="who">
          <b>{me.name}</b>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: roleCfg.color, display: 'inline-block' }} />
            {roleCfg.shortName}
          </span>
        </span>
        <L.ChevronDown size={15} className="faint" />
      </button>
      {open && (
        <div className="pop" style={{ width: 310, maxHeight: 520, overflowY: 'auto' }}>
          <div className="pop-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b>{me.name}</b>
              <div className="faint small">{me.email}</div>
            </div>
            <span
              className="badge"
              style={{ background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.borderColor}`, fontSize: 10.5 }}
            >
              {roleCfg.name}
            </span>
          </div>

          {isSuper && (
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn sm"
                style={{
                  width: '100%',
                  background: pendingCount > 0 ? '#fee2e2' : '#fff7ed',
                  color: pendingCount > 0 ? '#b91c1c' : '#c2410c',
                  borderColor: pendingCount > 0 ? '#fca5a5' : '#fed7aa',
                  fontWeight: 600,
                  justifyContent: 'center',
                }}
                onClick={() => {
                  setApprovalOpen(true)
                  setOpen(false)
                }}
              >
                <L.ShieldCheck size={15} />
                Quản lý Phê duyệt & RBAC
                {pendingCount > 0 && <span className="badge" style={{ background: '#ef4444', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 9 }}>{pendingCount}</span>}
              </button>
            </div>
          )}

          {mode === 'demo' && (
            <>
              <div className="nav-label" style={{ color: 'var(--faint)', padding: '10px 14px 4px' }}>
                Chuyển vai trò thử nghiệm (Demo RBAC)
              </div>
              {state.users.filter((u) => u.id !== me.id).map((u) => {
                const uCfg = getRoleConfig(u.role)
                const isPending = u.status === USER_STATUS.PENDING
                return (
                  <button
                    key={u.id}
                    className="menu-item"
                    onClick={() => {
                      store.loginAs(u.id)
                      setOpen(false)
                    }}
                    style={{ padding: '8px 12px' }}
                  >
                    <Avatar user={u} size={26} />
                    <span className="grow" style={{ textAlign: 'left' }}>
                      <div className="row" style={{ gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                        {isPending && (
                          <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: 9.5 }}>
                            Chờ duyệt
                          </span>
                        )}
                      </div>
                      <div className="faint small" style={{ fontSize: 11 }}>{u.title}</div>
                    </span>
                    <span
                      className="chip"
                      style={{ fontSize: 10, background: uCfg.bg, color: uCfg.color, border: `1px solid ${uCfg.borderColor}` }}
                    >
                      {uCfg.shortName}
                    </span>
                  </button>
                )
              })}
              <button
                className="menu-item"
                onClick={() => {
                  if (confirm('Khôi phục dữ liệu mẫu ban đầu? Mọi thay đổi trong trình duyệt này sẽ mất.')) store.resetDemo()
                }}
              >
                <L.RotateCcw size={16} />Khôi phục dữ liệu mẫu
              </button>
            </>
          )}
          <button className="menu-item" style={{ color: 'var(--danger)' }} onClick={() => store.logout()}>
            <L.LogOut size={16} />Đăng xuất
          </button>
        </div>
      )}
      {approvalOpen && <UserApprovalModal onClose={() => setApprovalOpen(false)} />}
    </div>
  )
}
