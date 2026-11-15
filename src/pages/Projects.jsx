import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore, visibleProjects, projectRole } from '../data/store.jsx'
import { getRoleConfig } from '../data/rbac.js'
import { useUI } from '../App.jsx'
import { AvatarStack, Empty, Progress } from '../components/ui.jsx'
import { daysUntil, fmtDate, isOverdue, progressOf } from '../lib/utils.js'
import ProjectForm from '../components/ProjectForm.jsx'
import { JoinProjectModal } from '../components/JoinProject.jsx'

export default function Projects() {
  const { state, me } = useStore()
  const { go } = useUI()
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const projects = visibleProjects(state, me)
  return (
    <>
      <div className="row between wrap" style={{ marginBottom: 18, gap: 12 }}>
        <div><h2 style={{ fontSize: 20 }}>Dự án của bạn</h2><div className="muted small">Bạn thấy các dự án mà mình là thành viên. Mọi thành viên trong một dự án đều xem được toàn bộ công việc và cập nhật.</div></div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={() => setJoining(true)}><L.KeyRound size={16} />Tham gia bằng mã</button>
          {me.role === 'admin' && <button className="btn primary" onClick={() => setCreating(true)}><L.FolderPlus size={16} />Tạo dự án</button>}
        </div>
      </div>
      {!projects.length && <div className="card"><Empty icon="FolderKanban" text="Bạn chưa tham gia dự án nào."><button className="btn primary" style={{ marginTop: 12 }} onClick={() => setJoining(true)}><L.KeyRound size={16} />Nhập mã dự án</button></Empty></div>}
      <div className="proj-grid">
        {projects.map((p) => {
          const pt = state.tasks.filter((t) => t.projectId === p.id && !t.isStream)
          const pct = progressOf(pt)
          const od = pt.filter(isOverdue).length
          const review = pt.filter((t) => t.status === 'review').length
          const role = projectRole(p, me)
          return (
            <div key={p.id} className="card proj-card" onClick={() => go('/projects/' + p.id)}>
              <span className="bar" style={{ background: `linear-gradient(90deg, ${p.color}, var(--orange-500))` }} />
              <div className="row between"><span className="proj-code">{p.code}</span><span className="small muted">{role === 'manager' ? 'Quản lý' : 'Thành viên'}</span></div>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="row between small" style={{ marginBottom: 6 }}><span className="muted">Tiến độ</span><b>{pct}%</b></div>
              <Progress value={pct} />
              <div className="proj-meta">
                <span><L.ListTodo size={14} />{pt.filter((t) => t.status !== 'done').length} đang mở</span>
                {od > 0 && <span className="tone-danger"><L.AlarmClock size={14} />{od} quá hạn</span>}
                {review > 0 && <span style={{ color: 'var(--orange-700)' }}><L.BadgeCheck size={14} />{review} chờ duyệt</span>}
              </div>
              <div className="row between" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <AvatarStack users={p.members.map((m) => state.users.find((u) => u.id === m.userId)).filter(Boolean)} size={28} max={5} />
                <span className="small faint"><L.CalendarRange size={13} style={{ verticalAlign: -2 }} /> {fmtDate(p.endDate)} · {daysUntil(p.endDate) >= 0 ? `còn ${daysUntil(p.endDate)} ngày` : 'đã kết thúc'}</span>
              </div>
            </div>
          )
        })}
      </div>
      {creating && <ProjectForm onClose={() => setCreating(false)} />}
      {joining && <JoinProjectModal onClose={() => setJoining(false)} />}
    </>
  )
}
