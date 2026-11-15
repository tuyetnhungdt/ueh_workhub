import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore, visibleProjects, visibleTasks } from '../data/store.jsx'
import { canApproveMembers, canManageRoles, getRoleConfig, ROLE_DETAILS, USER_STATUS, normalizeRole, ROLES } from '../data/rbac.js'
import { useUI } from '../App.jsx'
import { WorkloadTable } from '../components/Analytics.jsx'
import { useToast, Avatar, Modal } from '../components/ui.jsx'
import { STATUSES } from '../lib/utils.js'
import UserApprovalModal from '../components/UserApprovalModal.jsx'

export default function Team() {
  const { state, me, addUser, updateUser, mode } = useStore()
  const { newTask } = useUI()
  const toast = useToast()
  const [adding, setAdding] = useState(false)
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [f, setF] = useState({ name: '', email: '', title: '', role: ROLES.PROGRAM_OFFICER })
  const projects = visibleProjects(state, me)
  const tasks = visibleTasks(state, me)
  const ids = new Set(projects.flatMap((p) => p.members?.map((m) => m.userId) || []))
  const isSuper = canManageRoles(me)
  const people = (state.users || []).filter((u) => (!u.status || u.status === USER_STATUS.ACTIVE) && (ids.has(u.id) || isSuper))
  const pendingUsers = (state.users || []).filter((u) => u.status === USER_STATUS.PENDING)

  return (
    <>
      <div className="row between wrap" style={{ marginBottom: 16, gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20 }}>Nhân sự & Phân quyền hệ thống (RBAC)</h2>
          <div className="muted small">Kiểm soát truy cập phân tầng theo 4 vai trò: Super Admin, Academic Admin, Program Officer và Lecturer.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {canApproveMembers(me) && (
            <button
              className="btn"
              style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa', fontWeight: 600 }}
              onClick={() => setApprovalOpen(true)}
            >
              <L.ShieldCheck size={16} />
              Duyệt & Phân quyền
              {pendingUsers.length > 0 && (
                <span className="badge" style={{ background: '#ef4444', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 9 }}>
                  {pendingUsers.length} chờ duyệt
                </span>
              )}
            </button>
          )}
          {isSuper && <button className="btn primary" onClick={() => setAdding(true)}><L.UserPlus size={16} />Thêm nhân sự</button>}
        </div>
      </div>

      {/* Pending requests alert banner for Super Admin */}
      {isSuper && pendingUsers.length > 0 && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div className="row" style={{ gap: 10, alignItems: 'center' }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#fef3c7',
                color: '#d97706',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <L.Clock size={18} />
            </span>
            <div>
              <b style={{ color: '#92400e' }}>Có {pendingUsers.length} yêu cầu đăng ký mới đang chờ phê duyệt</b>
              <div className="small" style={{ color: '#b45309' }}>
                Các thành viên này chưa được gán dự án và chưa xem được dữ liệu nhạy cảm.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn sm primary"
            style={{ background: '#d97706', borderColor: '#d97706' }}
            onClick={() => setApprovalOpen(true)}
          >
            Mở hàng chờ duyệt ngay
          </button>
        </div>
      )}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head"><h3>Tổng hợp khối lượng công việc</h3></div>
        <div style={{ padding: '6px 6px 8px' }}><WorkloadTable tasks={tasks} users={people} /></div>
      </div>

      <div className="proj-grid">
        {people.map((u) => {
          const mt = tasks.filter((t) => t.assigneeIds.includes(u.id))
          const inProj = projects.filter((p) => p.members?.some((m) => m.userId === u.id))
          const role = normalizeRole(u.role)
          const cfg = getRoleConfig(role)

          return (
            <div key={u.id} className="card card-pad">
              <div className="row" style={{ gap: 12 }}>
                <Avatar user={u} size={46} />
                <div className="grow">
                  <b style={{ fontSize: 15 }}>{u.name}</b>
                  <div className="muted small">{u.title}</div>
                  <div className="faint small">{u.email}</div>
                </div>
              </div>

              {/* RBAC Role Selector / Badge */}
              <div className="row between" style={{ marginTop: 12, alignItems: 'center' }}>
                {isSuper && u.id !== me.id ? (
                  <select
                    className="select sm"
                    value={role}
                    onChange={(e) => {
                      updateUser(u.id, { role: e.target.value })
                      toast(`Đã đổi vai trò của ${u.name} thành ${getRoleConfig(e.target.value).viName}`)
                    }}
                    style={{ fontWeight: 600, minWidth: 160 }}
                  >
                    {Object.values(ROLE_DETAILS).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.shortName})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className="badge"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.borderColor}`, fontWeight: 600 }}
                  >
                    {cfg.name} ({cfg.shortName})
                  </span>
                )}
                {mode === 'supabase' && <span className="small" style={{ color: u.authId ? 'var(--success)' : 'var(--faint)' }}>{u.authId ? '● Đã kích hoạt' : '○ Chưa đăng nhập'}</span>}
              </div>

              <div className="load-bar" style={{ margin: '14px 0 8px' }}>
                {STATUSES.map((s) => { const n = mt.filter((t) => t.status === s.id).length; return n ? <i key={s.id} title={`${s.label}: ${n}`} style={{ width: (n / mt.length) * 100 + '%', background: s.chart }} /> : null })}
              </div>
              <div className="row wrap small muted" style={{ gap: 12 }}>
                {STATUSES.map((s) => <span key={s.id}><b style={{ color: s.color }}>{mt.filter((t) => t.status === s.id).length}</b> {s.short}</span>)}
              </div>
              <div className="row wrap" style={{ gap: 6, marginTop: 12 }}>
                {inProj.map((p) => <span key={p.id} className="chip">{p.code}</span>)}
                {inProj.length === 0 && <span className="faint small">Chưa vào dự án nào</span>}
              </div>
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
            addUser({ ...f, email }); setAdding(false); setF({ name: '', email: '', title: '', role: ROLES.PROGRAM_OFFICER }); toast('Đã thêm nhân sự. Hãy phân quyền dự án ở màn hình Duyệt & Phân quyền.')
          }}>Thêm nhân sự</button>
        </>}>
          <div className="field"><label>Họ tên *</label><input className="input" autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid2">
            <div className="field"><label>Email đăng nhập{mode === 'supabase' ? ' *' : ''}</label><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div className="field"><label>Chức danh</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          </div>
          <div className="field">
            <label>Vai trò phân quyền (RBAC Role)</label>
            <select
              className="select"
              value={f.role}
              onChange={(e) => setF({ ...f, role: e.target.value })}
            >
              {Object.values(ROLE_DETAILS).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.viName}
                </option>
              ))}
            </select>
            <div className="faint small" style={{ marginTop: 4 }}>
              {getRoleConfig(f.role).desc}
            </div>
          </div>
          {mode === 'supabase' && <div className="callout info"><L.Info size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} /><div>Hãy tạo tài khoản đăng nhập với <b>đúng email này</b> trong Supabase → Authentication → Users → <b>Add user</b>. Lần đầu người đó đăng nhập, hệ thống tự gắn đúng hồ sơ và quyền đã khai báo.</div></div>}
        </Modal>
      )}

      {approvalOpen && <UserApprovalModal onClose={() => setApprovalOpen(false)} />}
    </>
  )
}
