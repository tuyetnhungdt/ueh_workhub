import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { ROLES, USER_STATUS, ROLE_DETAILS, getRoleConfig, normalizeRole, getDefaultRolePermissions } from '../data/rbac.js'
import { Avatar, Modal, useToast } from './ui.jsx'
import { timeAgo, fmtDate } from '../lib/utils.js'

export default function UserApprovalModal({ onClose }) {
  const { state, me, approveUserRegistration, rejectUserRegistration, registerUser, setUserProjects, updateUser } = useStore()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'approved' | 'rejected' | 'simulate'
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedRoles, setSelectedRoles] = useState({})
  const [selectedProjects, setSelectedProjects] = useState({})
  const [selectedProjectRoles, setSelectedProjectRoles] = useState({}) // { [userId]: { [projectId]: role } }
  const [editingUserProjectsModal, setEditingUserProjectsModal] = useState(null)
  const [editProjectsState, setEditProjectsState] = useState({})

  // Form mô phỏng đăng ký mới
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    title: '',
    requestedRole: ROLES.PROGRAM_OFFICER,
    requestedProjectIds: ['p1'],
    note: '',
  })

  const users = state?.users || []
  const projects = state?.projects || []

  const pendingUsers = users.filter((u) => u.status === USER_STATUS.PENDING)
  const approvedUsers = users.filter((u) => !u.status || u.status === USER_STATUS.ACTIVE)
  const rejectedUsers = users.filter((u) => u.status === USER_STATUS.REJECTED)

  // Khởi tạo role & project đã chọn cho mỗi pending user nếu chưa có
  const getSelectedRole = (u) => selectedRoles[u.id] || u.requestedRole || u.role || ROLES.PROGRAM_OFFICER
  const getSelectedProjects = (u) => selectedProjects[u.id] || u.requestedProjectIds || ['p1']

  const getSelectedProjectRole = (u, projectId) => {
    if (selectedProjectRoles[u.id]?.[projectId]) {
      return selectedProjectRoles[u.id][projectId]
    }
    return u.requestedRole || u.role || ROLES.PROGRAM_OFFICER
  }

  const handleRoleSelect = (userId, role) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }))
  }

  const handleProjectToggle = (userId, projectId, currentList) => {
    const list = selectedProjects[userId] || currentList || ['p1']
    const next = list.includes(projectId) ? list.filter((p) => p !== projectId) : [...list, projectId]
    setSelectedProjects((prev) => ({ ...prev, [userId]: next }))
  }

  const handleProjectRoleChange = (userId, projectId, role) => {
    setSelectedProjectRoles((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [projectId]: role,
      },
    }))
  }

  const handleApprove = (u) => {
    const mainRole = getSelectedRole(u)
    const projectIds = getSelectedProjects(u)
    const projectRoles = {}
    projectIds.forEach((pid) => {
      projectRoles[pid] = selectedProjectRoles[u.id]?.[pid] || mainRole
    })
    approveUserRegistration(u.id, { role: mainRole, projectIds, projectRoles })
    toast(`Đã phê duyệt và gán vai trò theo từng dự án cho ${u.name}!`)
  }

  const handleConfirmReject = () => {
    if (!rejectingId) return
    const reason = rejectReason.trim() || 'Hồ sơ chưa đạt tiêu chuẩn tham gia dự án'
    const targetUser = users.find((u) => u.id === rejectingId)
    rejectUserRegistration(rejectingId, reason)
    setRejectingId(null)
    setRejectReason('')
    toast(`Đã từ chối yêu cầu của ${targetUser?.name || 'thành viên'}.`)
  }

  const openEditUserProjects = (u) => {
    const initial = {}
    projects.forEach((p) => {
      const member = p.members?.find((m) => m.userId === u.id)
      initial[p.id] = {
        checked: !!member,
        role: member?.role || u.role || 'member',
      }
    })
    setEditProjectsState(initial)
    setEditingUserProjectsModal(u)
  }

  const saveEditUserProjects = () => {
    if (!editingUserProjectsModal) return
    const targetPids = []
    const projectRoles = {}
    Object.entries(editProjectsState).forEach(([pid, val]) => {
      if (val.checked) {
        targetPids.push(pid)
        projectRoles[pid] = val.role
      }
    })
    setUserProjects(editingUserProjectsModal.id, targetPids, projectRoles)
    toast(`Đã cập nhật dự án và vai trò cho ${editingUserProjectsModal.name}`)
    setEditingUserProjectsModal(null)
  }

  const handleSimulateSubmit = (e) => {
    e.preventDefault()
    if (!regForm.name.trim() || !regForm.email.trim()) {
      toast('Vui lòng nhập họ tên và email')
      return
    }
    registerUser(regForm)
    toast('Đã gửi yêu cầu đăng ký thành công! Đơn đã vào hàng chờ phê duyệt.')
    setRegForm({
      name: '',
      email: '',
      title: '',
      requestedRole: ROLES.PROGRAM_OFFICER,
      requestedProjectIds: ['p1'],
      note: '',
    })
    setActiveTab('pending')
  }

  return (
    <Modal
      title={
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          <L.ShieldCheck size={20} color="var(--orange-600)" />
          <span>Quản lý Phê duyệt & Phân quyền Thành viên</span>
          {pendingUsers.length > 0 && (
            <span
              className="badge"
              style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}
            >
              {pendingUsers.length} chờ duyệt
            </span>
          )}
        </div>
      }
      onClose={onClose}
      width={900}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div className="seg" style={{ alignSelf: 'flex-start' }}>
          <button
            type="button"
            className={activeTab === 'pending' ? 'on' : ''}
            onClick={() => setActiveTab('pending')}
          >
            <L.Clock size={14} style={{ marginRight: 6 }} />
            Yêu cầu chờ duyệt ({pendingUsers.length})
          </button>
          <button
            type="button"
            className={activeTab === 'approved' ? 'on' : ''}
            onClick={() => setActiveTab('approved')}
          >
            <L.Users size={14} style={{ marginRight: 6 }} />
            Đã kích hoạt ({approvedUsers.length})
          </button>
          <button
            type="button"
            className={activeTab === 'rejected' ? 'on' : ''}
            onClick={() => setActiveTab('rejected')}
          >
            <L.UserX size={14} style={{ marginRight: 6 }} />
            Đã từ chối ({rejectedUsers.length})
          </button>
          <button
            type="button"
            className={activeTab === 'simulate' ? 'on' : ''}
            onClick={() => setActiveTab('simulate')}
          >
            <L.UserPlus size={14} style={{ marginRight: 6 }} />
            + Thử đăng ký tài khoản mới
          </button>
        </div>

        {/* TAB 1: PENDING APPROVAL QUEUE */}
        {activeTab === 'pending' && (
          <div>
            {pendingUsers.length === 0 ? (
              <div className="card card-pad empty" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <L.CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 6px' }}>Hàng chờ trống!</h4>
                <p className="muted small">Không có tài khoản nào đang chờ phê duyệt. Bạn có thể thử nghiệm tạo đơn đăng ký ở tab "Thử đăng ký tài khoản mới".</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {pendingUsers.map((u) => {
                  const assignedRole = getSelectedRole(u)
                  const assignedPids = getSelectedProjects(u)
                  const cfg = getRoleConfig(assignedRole)

                  return (
                    <div
                      key={u.id}
                      className="card card-pad"
                      style={{
                        borderLeft: '4px solid var(--orange-500)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div className="row between wrap" style={{ gap: 12, alignItems: 'flex-start' }}>
                        <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                          <Avatar user={u} size={46} />
                          <div>
                            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                              <b style={{ fontSize: 16 }}>{u.name}</b>
                              <span
                                className="badge"
                                style={{ background: '#fff4e0', color: '#b45309', border: '1px solid #fed7aa', fontSize: 11 }}
                              >
                                ⏳ Chờ duyệt
                              </span>
                            </div>
                            <div className="muted small" style={{ marginTop: 2 }}>{u.title} · <b>{u.email}</b></div>
                            {u.registeredAt && (
                              <div className="faint small" style={{ marginTop: 2 }}>
                                Đăng ký lúc: {fmtDate(u.registeredAt.slice(0, 10))} ({timeAgo(u.registeredAt)})
                              </div>
                            )}
                            {u.note && (
                              <div
                                style={{
                                  marginTop: 8,
                                  background: '#f8fafc',
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  fontSize: 12.5,
                                  color: '#334155',
                                  border: '1px dashed #cbd5e1',
                                }}
                              >
                                💬 <i>"{u.note}"</i>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 1-Click Action Buttons */}
                        <div className="row" style={{ gap: 8 }}>
                          <button
                            type="button"
                            className="btn sm danger"
                            onClick={() => {
                              setRejectingId(u.id)
                              setRejectReason('')
                            }}
                          >
                            <L.X size={14} />
                            Từ chối
                          </button>
                          <button
                            type="button"
                            className="btn sm primary"
                            onClick={() => handleApprove(u)}
                            style={{ background: '#059669', borderColor: '#059669' }}
                          >
                            <L.Check size={14} />
                            Phê duyệt & Kích hoạt
                          </button>
                        </div>
                      </div>

                      {/* Phân quyền RBAC Selector & Project Scope Assignment */}
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 12,
                          borderTop: '1px solid #f1f5f9',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14,
                        }}
                      >
                        {/* 1. Chọn Vai trò chính (System Profile Role) */}
                        <div style={{ maxWidth: 460 }}>
                          <label className="small muted" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>
                            1. Vai trò chính trên hệ thống (Profile Role):
                          </label>
                          <select
                            className="select sm"
                            style={{ width: '100%', fontWeight: 600 }}
                            value={assignedRole}
                            onChange={(e) => handleRoleSelect(u.id, e.target.value)}
                          >
                            {Object.values(ROLE_DETAILS).map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} — {r.viName}
                              </option>
                            ))}
                          </select>
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: cfg.color,
                              background: cfg.bg,
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: `1px solid ${cfg.borderColor}`,
                            }}
                          >
                            <b>Quyền mặc định:</b> {cfg.desc}
                          </div>
                        </div>

                        {/* 2. Chỉ định Dự án & Gán vai trò riêng cho từng dự án */}
                        <div>
                          <div className="row between wrap" style={{ gap: 6, alignItems: 'center', marginBottom: 8 }}>
                            <label className="small muted" style={{ fontWeight: 600 }}>
                              2. Chỉ định dự án & Gán vai trò riêng cho từng dự án (UserProjectMapping):
                            </label>
                            <span className="small faint" style={{ fontSize: 11 }}>
                              Mỗi dự án có vai trò và đề mục phân quyền riêng biệt
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {projects.map((p) => {
                              const checked = assignedPids.includes(p.id)
                              const pRole = getSelectedProjectRole(u, p.id)
                              const pRoleCfg = getRoleConfig(pRole, p)
                              const projPerms = p.rolePermissions || getDefaultRolePermissions(p)
                              const rolePerm = projPerms[pRole] || {}
                              const accessibleTabsCount = (rolePerm.tabs || []).length
                              const accessibleModsCount = rolePerm.modules?.includes('*')
                                ? 'Toàn bộ'
                                : (rolePerm.modules || []).length

                              return (
                                <div
                                  key={p.id}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    background: checked ? '#f0fdf4' : '#fafafa',
                                    border: checked ? '1px solid #86efac' : '1px solid #e2e8f0',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <div className="row between wrap" style={{ gap: 10, alignItems: 'center' }}>
                                    <label
                                      className="row"
                                      style={{
                                        gap: 8,
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        alignItems: 'center',
                                        userSelect: 'none',
                                        minWidth: 220,
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => handleProjectToggle(u.id, p.id, assignedPids)}
                                      />
                                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                                      <span style={{ fontWeight: checked ? 700 : 400 }}>{p.name}</span>
                                      <span className="chip" style={{ fontSize: 10, padding: '1px 5px' }}>{p.code}</span>
                                    </label>

                                    {checked ? (
                                      <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
                                        <span className="small muted" style={{ fontWeight: 600, fontSize: 11.5 }}>
                                          Vai trò trong dự án:
                                        </span>
                                        <select
                                          className="select sm"
                                          style={{ fontWeight: 600, minWidth: 200, borderColor: '#86efac', background: '#fff' }}
                                          value={pRole}
                                          onChange={(e) => handleProjectRoleChange(u.id, p.id, e.target.value)}
                                        >
                                          {Object.entries(projPerms).map(([rKey, rVal]) => (
                                            <option key={rKey} value={rKey}>
                                              {rVal.name || getRoleConfig(rKey, p).viName}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    ) : (
                                      <span className="small faint">Chưa tham gia</span>
                                    )}
                                  </div>

                                  {checked && (
                                    <div
                                      className="row between wrap"
                                      style={{
                                        marginTop: 6,
                                        paddingTop: 6,
                                        borderTop: '1px dashed #bbf7d0',
                                        fontSize: 11,
                                        gap: 8,
                                      }}
                                    >
                                      <div style={{ color: pRoleCfg.color || '#0369a1' }}>
                                        <b>Quyền hạn tại {p.code}:</b> {pRoleCfg.desc || rolePerm.desc || 'Xem và thực hiện công việc được giao'}
                                      </div>
                                      <div className="row" style={{ gap: 6 }}>
                                        <span className="chip" style={{ fontSize: 10, background: '#dcfce7', color: '#166534' }}>
                                          {accessibleTabsCount} tab
                                        </span>
                                        <span className="chip" style={{ fontSize: 10, background: '#dbeafe', color: '#1e40af' }}>
                                          {accessibleModsCount} phân hệ
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE APPROVED MEMBERS */}
        {activeTab === 'approved' && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nhân sự</th>
                  <th>Vai trò (RBAC Role)</th>
                  <th>Dự án được gán (UserProjectMapping)</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {approvedUsers.map((u) => {
                  const role = normalizeRole(u.role)
                  const cfg = getRoleConfig(role)
                  const userProjects = projects.filter((p) => p.members?.some((m) => m.userId === u.id))

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                          <Avatar user={u} size={34} />
                          <div>
                            <b>{u.name}</b>
                            {u.id === me.id && <span className="faint small"> (bạn)</span>}
                            <div className="faint small">{u.title} · {u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {u.id !== me.id ? (
                          <select
                            className="select sm"
                            value={role}
                            onChange={(e) => {
                              updateUser(u.id, { role: e.target.value })
                              toast(`Đã cập nhật vai trò của ${u.name} thành ${getRoleConfig(e.target.value).viName}`)
                            }}
                            style={{ fontWeight: 600, minWidth: 150 }}
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
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.borderColor}` }}
                          >
                            {cfg.viName}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="row wrap" style={{ gap: 4 }}>
                          {userProjects.length > 0 ? (
                            userProjects.map((p) => {
                              const mem = p.members?.find((m) => m.userId === u.id)
                              const rCfg = getRoleConfig(mem?.role || u.role, p)
                              return (
                                <span
                                  key={p.id}
                                  className="chip"
                                  style={{
                                    fontSize: 11,
                                    background: '#f1f5f9',
                                    color: '#1e293b',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                  title={`${p.name} — Vai trò: ${rCfg.viName}`}
                                >
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
                                  <b>{p.code}</b> ({rCfg.shortName || rCfg.viName})
                                </span>
                              )
                            })
                          ) : (
                            <span className="faint small">Chưa gán</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: '#e2f4e9', color: '#1e8a4c' }}>
                          ✓ Hoạt động
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {u.id !== me.id && (
                          <button
                            type="button"
                            className="btn sm ghost"
                            onClick={() => openEditUserProjects(u)}
                          >
                            <L.Layers size={13} style={{ marginRight: 4 }} />
                            Gán dự án & Vai trò
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: REJECTED QUEUE */}
        {activeTab === 'rejected' && (
          <div>
            {rejectedUsers.length === 0 ? (
              <div className="card card-pad empty" style={{ textAlign: 'center', padding: '30px' }}>
                <p className="muted small">Không có tài khoản nào bị từ chối.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rejectedUsers.map((u) => (
                  <div key={u.id} className="card card-pad row between wrap" style={{ background: '#fff5f5', borderLeft: '4px solid #ef4444' }}>
                    <div className="row" style={{ gap: 12 }}>
                      <Avatar user={u} size={40} />
                      <div>
                        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                          <b>{u.name}</b>
                          <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>Đã từ chối</span>
                        </div>
                        <div className="muted small">{u.title} · {u.email}</div>
                        {u.rejectionReason && (
                          <div className="small" style={{ color: '#b91c1c', marginTop: 4 }}>
                            <b>Lý do:</b> {u.rejectionReason}
                          </div>
                        )}
                        {u.rejectedAt && (
                          <div className="faint small" style={{ marginTop: 2 }}>
                            Thời gian: {fmtDate(u.rejectedAt.slice(0, 10))} ({timeAgo(u.rejectedAt)})
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => {
                        approveUserRegistration(u.id, { role: u.requestedRole || ROLES.PROGRAM_OFFICER, projectIds: ['p1'] })
                        toast(`Đã kích hoạt lại tài khoản cho ${u.name}.`)
                      }}
                    >
                      <L.RotateCcw size={14} />
                      Xem xét lại & Duyệt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SIMULATE NEW REGISTRATION */}
        {activeTab === 'simulate' && (
          <form onSubmit={handleSimulateSubmit} className="card card-pad" style={{ background: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 8px' }}>Mô phỏng nhân sự mới đăng ký tài khoản</h4>
            <p className="muted small" style={{ marginBottom: 16 }}>
              Nhập thông tin nhân sự để kiểm tra luồng: <b>Đăng ký → Tài khoản trạng thái Chờ duyệt (Pending) → Admin duyệt & phân quyền dự án.</b>
            </p>

            <div className="grid2">
              <div className="field">
                <label>Họ và tên *</label>
                <input
                  className="input"
                  required
                  placeholder="VD: TS. Pierre Dupont"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Email liên hệ *</label>
                <input
                  className="input"
                  type="email"
                  required
                  placeholder="VD: pierre.dupont@univ-rennes.fr"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid2" style={{ marginTop: 10 }}>
              <div className="field">
                <label>Chức danh / Đơn vị</label>
                <input
                  className="input"
                  placeholder="VD: Giảng viên Thỉnh giảng Rennes"
                  value={regForm.title}
                  onChange={(e) => setRegForm({ ...regForm, title: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Vai trò đề xuất (Requested Role)</label>
                <select
                  className="select"
                  value={regForm.requestedRole}
                  onChange={(e) => setRegForm({ ...regForm, requestedRole: e.target.value })}
                >
                  {Object.values(ROLE_DETAILS).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.viName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: 10 }}>
              <label>Dự án muốn tham gia</label>
              <div className="row wrap" style={{ gap: 14 }}>
                {projects.map((p) => (
                  <label key={p.id} className="row" style={{ gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={regForm.requestedProjectIds.includes(p.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...regForm.requestedProjectIds, p.id]
                          : regForm.requestedProjectIds.filter((x) => x !== p.id)
                        setRegForm({ ...regForm, requestedProjectIds: next })
                      }}
                    />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginTop: 10 }}>
              <label>Ghi chú / Lý do đăng ký</label>
              <input
                className="input"
                placeholder="VD: Được phân công giảng dạy học phần Tài chính quốc tế đợt 2"
                value={regForm.note}
                onChange={(e) => setRegForm({ ...regForm, note: e.target.value })}
              />
            </div>

            <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end', gap: 10 }}>
              <button type="submit" className="btn primary">
                <L.Send size={15} />
                Gửi yêu cầu đăng ký
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modal xác nhận Từ chối */}
      {rejectingId && (
        <Modal
          title="Xác nhận từ chối yêu cầu đăng ký"
          onClose={() => setRejectingId(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setRejectingId(null)}>Hủy</button>
              <button className="btn danger" onClick={handleConfirmReject}>
                Xác nhận từ chối
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="muted small">
              Vui lòng nhập lý do từ chối để hệ thống thông báo minh bạch cho người đăng ký:
            </p>
            <div className="field">
              <label>Lý do từ chối *</label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="VD: Chưa có hợp đồng thỉnh giảng chính thức hoặc thông tin email không khớp danh sách đối tác."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        </Modal>
      )}

      {/* DIALOG CHỈNH SỬA DỰ ÁN & VAI TRÒ CHO NHÂN SỰ ĐÃ KÍCH HOẠT */}
      {editingUserProjectsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="card card-pad"
            style={{
              width: '100%',
              maxWidth: 580,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
            }}
          >
            <div className="row between" style={{ alignItems: 'center', marginBottom: 12 }}>
              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <Avatar user={editingUserProjectsModal} size={30} />
                <div>
                  <b style={{ fontSize: 14 }}>Phân quyền dự án & vai trò: {editingUserProjectsModal.name}</b>
                  <div className="faint small">{editingUserProjectsModal.email}</div>
                </div>
              </div>
              <button
                type="button"
                className="iconbtn"
                onClick={() => setEditingUserProjectsModal(null)}
              >
                <L.X size={16} />
              </button>
            </div>

            <p className="small muted" style={{ marginBottom: 12 }}>
              Chọn các dự án nhân sự được phép tham gia và thiết lập vai trò cụ thể cho nhân sự tại từng dự án đó:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
              {projects.map((p) => {
                const itemState = editProjectsState[p.id] || { checked: false, role: 'member' }
                const projPerms = p.rolePermissions || getDefaultRolePermissions(p)

                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 6,
                      background: itemState.checked ? '#f0fdf4' : '#fafafa',
                      border: itemState.checked ? '1px solid #86efac' : '1px solid #e2e8f0',
                    }}
                  >
                    <div className="row between wrap" style={{ gap: 10, alignItems: 'center' }}>
                      <label className="row" style={{ gap: 8, cursor: 'pointer', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={itemState.checked}
                          onChange={(e) => {
                            setEditProjectsState((prev) => ({
                              ...prev,
                              [p.id]: {
                                ...itemState,
                                checked: e.target.checked,
                              },
                            }))
                          }}
                        />
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                        <span style={{ fontWeight: itemState.checked ? 700 : 500 }}>{p.name}</span>
                        <span className="chip" style={{ fontSize: 10 }}>{p.code}</span>
                      </label>

                      {itemState.checked && (
                        <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                          <span className="small muted" style={{ fontSize: 11 }}>Vai trò:</span>
                          <select
                            className="select sm"
                            style={{ fontWeight: 600, minWidth: 180, borderColor: '#86efac' }}
                            value={itemState.role}
                            onChange={(e) => {
                              setEditProjectsState((prev) => ({
                                ...prev,
                                [p.id]: {
                                  ...itemState,
                                  role: e.target.value,
                                },
                              }))
                            }}
                          >
                            {Object.entries(projPerms).map(([rKey, rVal]) => (
                              <option key={rKey} value={rKey}>
                                {rVal.name || getRoleConfig(rKey, p).viName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="row end" style={{ gap: 8, marginTop: 16 }}>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setEditingUserProjectsModal(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={saveEditUserProjects}
              >
                Lưu phân quyền dự án
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
