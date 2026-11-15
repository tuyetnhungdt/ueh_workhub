import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore, visibleProjects, visibleTasks } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { WorkloadTable } from '../components/Analytics.jsx'
import { useToast, Avatar, Modal } from '../components/ui.jsx'
import { STATUSES } from '../lib/utils.js'

export default function Team() {
  const { state, me, addUser, updateUser, mode } = useStore()
  const { newTask } = useUI()
  const toast = useToast()
  const [adding, setAdding] = useState(false)
  const [f, setF] = useState({ name: '', email: '', title: '', role: 'member' })
  const projects = visibleProjects(state, me)
  const tasks = visibleTasks(state, me)
  const ids = new Set(projects.flatMap((p) => p.members.map((m) => m.userId)))
  const people = state.users.filter((u) => ids.has(u.id) || me.role === 'admin')

  return (
    <>
      <div className="row between wrap" style={{ marginBottom: 16, gap: 10 }}>
        <div><h2 style={{ fontSize: 20 }}>Nhân sự & khối lượng công việc</h2><div className="muted small">Theo dõi ai đang gánh bao nhiêu việc để phân công cân bằng.</div></div>
        {me.role === 'admin' && <button className="btn primary" onClick={() => setAdding(true)}><L.UserPlus size={16} />Thêm nhân sự</button>}
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head"><h3>Tổng hợp khối lượng</h3></div>
        <div style={{ padding: '6px 6px 8px' }}><WorkloadTable tasks={tasks} users={people} /></div>
      </div>

      <div className="proj-grid">
        {people.map((u) => {
          const mt = tasks.filter((t) => t.assigneeIds.includes(u.id))
          const inProj = projects.filter((p) => p.members.some((m) => m.userId === u.id))
          return (
            <div key={u.id} className="card card-pad">
              <div className="row" style={{ gap: 12 }}>
                <Avatar user={u} size={46} />
                <div className="grow"><b style={{ fontSize: 15 }}>{u.name}</b><div className="muted small">{u.title}</div><div className="faint small">{u.email}</div></div>
              </div>
              <div className="row between" style={{ marginTop: 12 }}>
                {me.role === 'admin' && u.id !== me.id ? (
                  <select className="select sm" value={u.role} onChange={(e) => { updateUser(u.id, { role: e.target.value }); toast(`Đã đổi quyền của ${u.name}`) }}>
                    <option value="member">Nhân sự</option><option value="admin">Quản trị hệ thống</option>
                  </select>
                ) : <span className="badge" style={{ background: u.role === 'admin' ? 'var(--orange-100)' : 'var(--teal-100)', color: u.role === 'admin' ? 'var(--orange-700)' : 'var(--teal-800)' }}>{u.role === 'admin' ? 'Quản trị hệ thống' : 'Nhân sự'}</span>}
                {mode === 'supabase' && <span className="small" style={{ color: u.authId ? 'var(--success)' : 'var(--faint)' }}>{u.authId ? '● Đã kích hoạt' : '○ Chưa đăng nhập lần nào'}</span>}
              </div>
              <div className="load-bar" style={{ margin: '14px 0 8px' }}>
                {STATUSES.map((s) => { const n = mt.filter((t) => t.status === s.id).length; return n ? <i key={s.id} title={`${s.label}: ${n}`} style={{ width: (n / mt.length) * 100 + '%', background: s.chart }} /> : null })}
              </div>
              <div className="row wrap small muted" style={{ gap: 12 }}>
                {STATUSES.map((s) => <span key={s.id}><b style={{ color: s.color }}>{mt.filter((t) => t.status === s.id).length}</b> {s.short}</span>)}
              </div>
              <div className="row wrap" style={{ gap: 6, marginTop: 12 }}>{inProj.map((p) => <span key={p.id} className="chip">{p.code}</span>)}</div>
              <button className="btn sm" style={{ marginTop: 14, width: '100%' }} onClick={() => newTask({ assigneeIds: [u.id] })}><L.Send size={14} />Giao việc cho {u.name.split(' ').slice(-1)[0]}</button>
            </div>
          )
        })}
      </div>

      {adding && (
        <Modal title="Thêm nhân sự vào hệ thống" onClose={() => setAdding(false)} footer={<>
          <button className="btn ghost" onClick={() => setAdding(false)}>Hủy</button>
          <button className="btn primary" disabled={!f.name.trim() || (mode === 'supabase' && !/^\S+@\S+\.\S+$/.test(f.email.trim()))} onClick={() => {
            const email = f.email.trim().toLowerCase()
            if (email && state.users.some((u) => (u.email || '').toLowerCase() === email)) { toast('Email này đã có trong hệ thống'); return }
            addUser({ ...f, email }); setAdding(false); setF({ name: '', email: '', title: '', role: 'member' }); toast('Đã thêm nhân sự. Hãy thêm họ vào dự án ở tab Thành viên.')
          }}>Thêm</button>
        </>}>
          <div className="field"><label>Họ tên *</label><input className="input" autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid2">
            <div className="field"><label>Email đăng nhập{mode === 'supabase' ? ' *' : ''}</label><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div className="field"><label>Chức danh</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          </div>
          <div className="field"><label>Quyền</label>
            <div className="seg" style={{ alignSelf: 'flex-start' }}>
              <button type="button" className={f.role === 'member' ? 'on' : ''} onClick={() => setF({ ...f, role: 'member' })}>Nhân sự</button>
              <button type="button" className={f.role === 'admin' ? 'on' : ''} onClick={() => setF({ ...f, role: 'admin' })}>Quản trị hệ thống</button>
            </div>
          </div>
          {mode === 'supabase' && <div className="callout info"><L.Info size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} /><div>Hãy tạo tài khoản đăng nhập với <b>đúng email này</b> trong Supabase → Authentication → Users → <b>Add user</b>. Lần đầu người đó đăng nhập, hệ thống tự gắn đúng hồ sơ và quyền đã khai báo.</div></div>}
        </Modal>
      )}
    </>
  )
}
