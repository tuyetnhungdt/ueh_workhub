import * as L from 'lucide-react'
import { useStore, visibleProjects, visibleTasks, projectRole } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { Icon, Avatar, AvatarStack, Deadline, PriorityIcon, StatusBadge, Progress, Empty } from '../components/ui.jsx'
import { JoinProjectModal } from '../components/JoinProject.jsx'
import { workHref } from '../modules/schema.js'
import { useState } from 'react'
import { StatusDonut, DeadlineHeatmap } from '../components/Analytics.jsx'
import { isOverdue, isDueSoon, daysUntil, progressOf, timeAgo, byUrgency } from '../lib/utils.js'

export default function Dashboard() {
  const { state, me } = useStore()
  const { go, openTask, newTask } = useUI()
  const [joining, setJoining] = useState(false)
  const [reviewProject, setReviewProject] = useState('all')
  const [donutProject, setDonutProject] = useState('all')
  const projects = visibleProjects(state, me)
  const tasks = visibleTasks(state, me)
  const managed = projects.filter((p) => projectRole(p, me) === 'manager')
  const isManager = managed.length > 0
  const mine = tasks.filter((t) => t.assigneeIds.includes(me.id))
  const scope = isManager ? tasks : mine
  const open = scope.filter((t) => t.status !== 'done')
  const overdue = scope.filter(isOverdue)
  const soon = scope.filter((t) => isDueSoon(t, 7))
  const toReview = tasks.filter((t) => t.status === 'review' && managed.some((p) => p.id === t.projectId)).sort(byUrgency)
  const filteredToReview = toReview.filter((t) => reviewProject === 'all' || t.projectId === reviewProject)
  const donutScope = isManager ? tasks.filter((t) => managed.some((p) => p.id === t.projectId)) : mine
  const donutTasks = donutProject === 'all' ? donutScope : donutScope.filter((t) => t.projectId === donutProject)
  const pendingReminders = (state.emailReminders || []).filter((r) => !r.sentAt)
  const isSuper = me.role === 'super_admin'
  const pendingUsers = isSuper ? (state.users || []).filter((u) => u.status === 'pending') : []
  const totalReview = toReview.length + pendingReminders.length + pendingUsers.length
  const doneWeek = scope.filter((t) => t.completedAt && Date.now() - new Date(t.completedAt) < 7 * 864e5).length

  const h = new Date().getHours()
  const greet = h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const upcoming = mine.filter((t) => t.status !== 'done').sort(byUrgency).slice(0, 10)
  const feed = state.activities.filter((a) => projects.some((p) => p.id === a.projectId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 9)
  const projName = (id) => state.projects.find((p) => p.id === id)

  const kpis = [
    { lbl: isManager ? 'Việc đang mở' : 'Việc của tôi', val: open.length, sub: `${scope.length} tổng`, ic: 'ListTodo', c: '#03616a', bg: 'var(--teal-100)', to: '/my-tasks' },
    { lbl: 'Quá hạn', val: overdue.length, sub: overdue.length ? 'Cần xử lý ngay' : 'Không có', ic: 'AlarmClock', c: '#c62828', bg: '#fdecec', to: '/my-tasks?f=overdue' },
    { lbl: 'Đến hạn 7 ngày', val: soon.length, sub: 'Sắp tới', ic: 'CalendarClock', c: '#b45309', bg: '#fff4e0', to: '/calendar' },
    {
      lbl: 'Chờ tôi duyệt',
      val: totalReview,
      sub: totalReview > 0
        ? `${toReview.length} việc${pendingReminders.length ? ` · ${pendingReminders.length} email` : ''}${pendingUsers.length ? ` · ${pendingUsers.length} TV` : ''}`
        : (isManager || isSuper) ? 'Không có mục chờ duyệt' : 'Chỉ dành cho quản lý',
      ic: 'BadgeCheck',
      c: '#d4712f',
      bg: 'var(--orange-100)',
      to: '/my-tasks?f=review',
    },
    { lbl: 'Hoàn thành 7 ngày', val: doneWeek, sub: `${progressOf(scope)}% tổng tiến độ`, ic: 'Trophy', c: '#1e8a4c', bg: '#e2f4e9', to: '/my-tasks' },
  ]

  return (
    <>
      <div className="hero">
        <div className="row between wrap" style={{ position: 'relative', zIndex: 1, gap: 20 }}>
          <div>
            <div className="hello">{greet} 👋</div>
            <h2>{me.name}</h2>
            <p>{overdue.length ? `Có ${overdue.length} công việc quá hạn cần ưu tiên xử lý.` : 'Mọi việc đang đúng tiến độ. Tiếp tục phát huy!'}{toReview.length ? ` ${toReview.length} việc đang chờ bạn duyệt.` : ''}</p>
            <div className="row" style={{ marginTop: 16, gap: 8 }}>
              {isManager && <button className="btn accent" onClick={() => newTask({})}><L.Plus size={16} />Giao việc mới</button>}
              <button className="btn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', borderColor: 'rgba(255,255,255,.25)' }} onClick={() => go('/my-tasks')}><L.ListTodo size={16} />Việc của tôi</button>
            </div>
          </div>
          <div className="hero-stats">
            <div><b>{projects.length}</b><span>Dự án tham gia</span></div>
            <div><b>{mine.filter((t) => t.status !== 'done').length}</b><span>Việc được giao</span></div>
            <div><b>{progressOf(mine)}%</b><span>Tiến độ cá nhân</span></div>
          </div>
        </div>
      </div>

      {projects.length === 0 && (
        <div className="card card-pad row wrap" style={{ marginTop: 18, gap: 14, borderColor: 'var(--orange-500)', background: 'var(--orange-50)' }}>
          <L.KeyRound size={28} color="var(--orange-600)" />
          <div className="grow"><b>Bạn chưa thuộc dự án nào</b><div className="muted small">Nhập mã dự án do quản lý gửi để bắt đầu xem và nhận việc.</div></div>
          <button className="btn accent" onClick={() => setJoining(true)}><L.LogIn size={16} />Nhập mã dự án</button>
        </div>
      )}
      {joining && <JoinProjectModal onClose={() => setJoining(false)} />}
      <div className="kpis">
        {kpis.map((k) => (
          <div key={k.lbl} className="card kpi" onClick={() => go(k.to)}>
            <div className="ic" style={{ background: k.bg, color: k.c }}><Icon name={k.ic} size={21} /></div>
            <div><div className="lbl">{k.lbl}</div><div className="val">{k.val}</div><div className="sub" style={{ color: k.c }}>{k.sub}</div></div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="stack">
          {toReview.length > 0 && (
            <div className="card">
              <div className="card-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <h3 style={{ margin: 0 }}>
                  <L.BadgeCheck size={17} color="var(--orange-600)" style={{ verticalAlign: -3, marginRight: 6 }} />
                  Đang chờ bạn duyệt ({filteredToReview.length})
                </h3>
                <select
                  className="select sm"
                  style={{ maxWidth: 180, fontSize: 12, padding: '3px 8px' }}
                  value={reviewProject}
                  onChange={(e) => setReviewProject(e.target.value)}
                >
                  <option value="all">Tất cả dự án</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="tbl-wrap" style={{ padding: '6px 6px 8px' }}>
                {filteredToReview.length > 0 ? (
                  <table className="tbl"><tbody>
                    {filteredToReview.map((t) => (
                      <tr key={t.id} className="click" onClick={() => { const h = workHref(t, state.tasks); h ? go(h) : openTask(t.id) }}>
                        <td><div className="task-title" style={{ fontWeight: 400 }}>{t.title}</div><div className="task-sub">{projName(t.projectId)?.code}</div></td>
                        <td><AvatarStack users={t.assigneeIds.map((id) => state.users.find((u) => u.id === id)).filter(Boolean)} /></td>
                        <td><Deadline task={t} /></td>
                        <td style={{ textAlign: 'right' }}><span className="btn sm accent">Xem & duyệt</span></td>
                      </tr>
                    ))}
                  </tbody></table>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                    Không có công việc chờ duyệt cho dự án đã chọn.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-head"><h3>Việc của tôi sắp đến hạn</h3><button className="link" onClick={() => go('/my-tasks')}>Xem tất cả</button></div>
            <div className="tbl-wrap" style={{ padding: '6px 6px 8px' }}>
              {upcoming.length ? (
                <table className="tbl tbl-grouped">
                  <thead><tr><th>Công việc</th><th>Trạng thái</th><th>Hạn</th></tr></thead>
                  <tbody>
                    {(() => {
                      // chia theo hạng mục (01 → 10), trong mỗi mục giữ thứ tự hạn gần → xa, ưu tiên cao → thấp
                      const groups = []
                      upcoming.forEach((t) => {
                        const p = projName(t.projectId)
                        const c = p?.categories.find((x) => x.id === t.categoryId)
                        const key = t.projectId + '|' + (c?.id || '-')
                        let g = groups.find((x) => x.key === key)
                        if (!g) groups.push((g = { key, p, c, list: [] }))
                        g.list.push(t)
                      })
                      groups.sort((x, y) => (x.p?.name || '').localeCompare(y.p?.name || '') || (x.c?.no || '99').localeCompare(y.c?.no || '99'))
                      const many = new Set(groups.map((g) => g.p?.id)).size > 1
                      return groups.map((g) => [
                        <tr key={g.key} className="grp-row"><td colSpan={3}>
                          <span className="no">{g.c?.no || '··'}</span><b>{g.c?.name || 'Khác'}</b>{many && <span className="chip" style={{ marginLeft: 8 }}>{g.p?.code}</span>}<span className="faint small" style={{ marginLeft: 'auto' }}>{g.list.length} việc</span>
                        </td></tr>,
                        ...g.list.map((t) => (
                          <tr key={t.id} className="click" onClick={() => { const h = workHref(t, state.tasks); h ? go(h) : openTask(t.id) }}>
                            <td><div className="row" style={{ gap: 8 }}><PriorityIcon priority={t.priority} /><span className="task-title" style={{ fontWeight: 400 }}>{t.title}</span></div></td>
                            <td><StatusBadge status={t.status} /></td>
                            <td><Deadline task={t} /></td>
                          </tr>
                        )),
                      ])
                    })()}
                  </tbody>
                </table>
              ) : <Empty icon="PartyPopper" text="Bạn không có việc nào đang mở." />}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Dự án đang tham gia</h3><button className="link" onClick={() => go('/projects')}>Tất cả dự án</button></div>
            <div style={{ padding: '10px 20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {projects.map((p) => {
                const pt = state.tasks.filter((t) => t.projectId === p.id && !t.isStream)
                const pct = progressOf(pt)
                const od = pt.filter(isOverdue).length
                return (
                  <div key={p.id} className="row" style={{ cursor: 'pointer', gap: 14 }} onClick={() => go('/projects/' + p.id)}>
                    <span className="pcode lg" style={{ background: p.color }}>{p.code.slice(0, 2)}</span>
                    <div className="grow">
                      <div className="row between"><b className="ellipsis">{p.name}</b><span className="small muted">{pct}%</span></div>
                      <div style={{ margin: '6px 0 4px' }}><Progress value={pct} /></div>
                      <div className="small faint">{pt.length} việc · {pt.filter((t) => t.status !== 'done').length} đang mở{od ? <span className="tone-danger"> · {od} quá hạn</span> : null} · còn {Math.max(0, daysUntil(p.endDate))} ngày</div>
                    </div>
                    <AvatarStack users={p.members.map((m) => state.users.find((u) => u.id === m.userId)).filter(Boolean)} size={26} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card card-pad">
            <div className="row between wrap" style={{ gap: 8, marginBottom: 14, alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, margin: 0 }}>
                {isManager ? 'Trạng thái công việc (các dự án tôi quản lý)' : 'Trạng thái việc của tôi'}
              </h3>
              <select
                className="select sm"
                style={{ maxWidth: 180, fontSize: 12, padding: '3px 8px' }}
                value={donutProject}
                onChange={(e) => setDonutProject(e.target.value)}
              >
                <option value="all">Tất cả dự án</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <StatusDonut tasks={donutTasks} />
          </div>
          <div className="card card-pad">
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Lịch deadline</h3>
            <DeadlineHeatmap tasks={scope} />
          </div>
          <div className="card">
            <div className="card-head"><h3>Cập nhật mới nhất</h3></div>
            <ul className="feed" style={{ padding: '4px 20px 12px' }}>
              {feed.map((a) => {
                const u = state.users.find((x) => x.id === a.userId)
                return (
                  <li key={a.id} className={a.taskId ? 'click' : ''} onClick={() => a.taskId && state.tasks.some((t) => t.id === a.taskId) && openTask(a.taskId)}>
                    <Avatar user={u} size={30} />
                    <div><div className="txt"><b>{u?.name}</b> {a.text}</div><div className="when">{projName(a.projectId)?.code} · {timeAgo(a.createdAt)}</div></div>
                  </li>
                )
              })}
              {!feed.length && <Empty text="Chưa có hoạt động" />}
            </ul>
          </div>

        </div>
      </div>
    </>
  )
}
