import React, { useState, useMemo } from 'react'
import * as L from 'lucide-react'
import { useStore, projectRole } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { useToast, Avatar, Modal } from '../components/ui.jsx'
import { DEFAULT_PROJECT_ROLES, getRoleConfig, getDefaultRolePermissions } from '../data/rbac.js'
import { MODULES, MODULE } from '../modules/schema.js'
import { cx, isOverdue } from '../lib/utils.js'

/**
 * Trang Sơ đồ Tổ chức & Workflow Dự án
 * Mô hình phân cấp 3 tầng trực quan: Quản lý -> Admin / Chuyên viên -> Trợ lý
 * Tự động đồng bộ hai chiều (2-way sync) với vai trò và quyền hạn của dự án.
 */
export default function ProjectWorkflow({ projectId }) {
  const { state, me, setMember, removeMember, updateProject } = useStore()
  const { go, openTask } = useUI()
  const toast = useToast()

  const project = (state.projects || []).find((p) => p.id === projectId)
  const isMgr = projectRole(project, me) === 'manager' || me.role === 'super_admin'

  // Modal states
  const [addMemberModal, setAddMemberModal] = useState(false)
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('')
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('assistant')
  const [scopeMatrixModal, setScopeMatrixModal] = useState(false)
  const [activeTaskMember, setActiveTaskMember] = useState(null)

  // Danh sách công việc của dự án này
  const projectTasks = useMemo(() => {
    return (state.tasks || []).filter((t) => t.projectId === projectId && !t.isStream)
  }, [state.tasks, projectId])

  // Map người dùng với vai trò trong dự án
  const members = project?.members || []
  const reportingLines = project?.reportingLines || {}

  // Lấy đầy đủ thông tin nhân sự trong dự án
  const enrichedMembers = useMemo(() => {
    return members.map((m) => {
      const user = (state.users || []).find((u) => u.id === m.userId) || {
        id: m.userId,
        name: 'Thành viên',
        title: 'Chuyên viên',
        email: '',
      }
      const roleCfg = getRoleConfig(m.role, project)
      const tasksAssigned = projectTasks.filter((t) => t.assigneeIds?.includes(m.userId))
      const doingTasks = tasksAssigned.filter((t) => t.status !== 'done')
      const lateTasks = tasksAssigned.filter((t) => isOverdue(t))
      const doneTasks = tasksAssigned.filter((t) => t.status === 'done')

      // Hạng mục mà nhân sự này làm chủ nhiệm (ownerId)
      const ownedCategories = (project?.categories || []).filter((c) => c.ownerId === m.userId)

      return {
        ...m,
        user,
        roleCfg,
        tasksAssigned,
        doingTasks,
        lateTasks,
        doneTasks,
        ownedCategories,
        reportsTo: reportingLines[m.userId] || null,
      }
    })
  }, [members, state.users, project, projectTasks, reportingLines])

  // Phân tầng 3 cấp: Quản lý -> Admin / Chuyên viên -> Trợ lý / Thành viên
  const level1Managers = enrichedMembers.filter((m) => m.role === 'manager')
  const level2Admins = enrichedMembers.filter(
    (m) => m.role === 'academic_admin' || m.role === 'program_officer'
  )
  const level3Assistants = enrichedMembers.filter(
    (m) => m.role === 'assistant' || m.role === 'member'
  )

  // Thống kê tiến độ theo 4 giai đoạn vòng đời công việc
  const flowStats = useMemo(() => {
    const todo = projectTasks.filter((t) => t.status === 'todo').length
    const doing = projectTasks.filter((t) => t.status === 'doing').length
    const review = projectTasks.filter((t) => t.status === 'review').length
    const done = projectTasks.filter((t) => t.status === 'done').length
    return { todo, doing, review, done, total: projectTasks.length }
  }, [projectTasks])

  // Xử lý đổi vai trò 2 chiều (Cập nhật ngay lập tức vào Store & RBAC)
  const handleRoleChange = (userId, newRole) => {
    setMember(projectId, userId, newRole)
    const targetUser = (state.users || []).find((u) => u.id === userId)
    const roleCfg = DEFAULT_PROJECT_ROLES.find((r) => r.id === newRole)
    toast(`Đã cập nhật vai trò của ${targetUser?.name || 'nhân sự'} thành “${roleCfg?.name || newRole}”`)
  }

  // Xử lý đổi người báo cáo (Supervisor)
  const handleReportsToChange = (userId, supervisorId) => {
    const nextReporting = {
      ...reportingLines,
      [userId]: supervisorId || null,
    }
    updateProject(projectId, { reportingLines: nextReporting })
    toast('Đã cập nhật luồng báo cáo công việc')
  }

  // Xử lý thêm nhân sự mới vào sơ đồ
  const handleAddMember = () => {
    if (!selectedUserToAdd) return
    setMember(projectId, selectedUserToAdd, selectedRoleToAdd)
    const targetUser = (state.users || []).find((u) => u.id === selectedUserToAdd)
    toast(`Đã thêm ${targetUser?.name || 'thành viên'} vào sơ đồ dự án`)
    setSelectedUserToAdd('')
    setAddMemberModal(false)
  }

  // Xử lý gỡ nhân sự khỏi dự án
  const handleRemoveMember = (userId, userName) => {
    if (confirm(`Bạn có chắc muốn gỡ ${userName} khỏi dự án?`)) {
      removeMember(projectId, userId)
      toast(`Đã gỡ ${userName} khỏi dự án`)
    }
  }

  if (!project) {
    return (
      <div className="card empty" style={{ padding: 40, textAlign: 'center' }}>
        <h3>Không tìm thấy dự án</h3>
        <button className="btn primary sm" onClick={() => go('/projects')}>
          Về danh sách dự án
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>
      {/* 1. Header Banner & Điều hướng */}
      <div
        className="card"
        style={{
          padding: '18px 22px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
          border: '1px solid var(--teal-200, #ccfbf1)',
        }}
      >
        <div className="row between wrap" style={{ gap: 12, alignItems: 'center' }}>
          <div>
            <div className="row" style={{ gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: project.color || 'var(--teal-700)',
                }}
              />
              <span className="small faint" style={{ fontWeight: 600 }}>
                {project.code} · Dự án
              </span>
              <span
                className="chip"
                style={{
                  fontSize: 11,
                  background: 'var(--teal-100)',
                  color: 'var(--teal-800)',
                  fontWeight: 700,
                }}
              >
                Sơ đồ phân cấp & Luồng công việc
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--teal-950, #042f2e)' }}>
              Sơ đồ Tổ chức & Workflow Phối hợp: {project.name}
            </h2>
            <div className="small muted" style={{ marginTop: 4, maxWidth: 680 }}>
              Cơ cấu 3 cấp quản trị trực quan (<b>Quản lý ➔ Admin / Chuyên viên ➔ Trợ lý</b>).
              Mọi thay đổi vai trò tại đây lập tức tự động đồng bộ sang phân quyền truy cập và phân công công việc.
            </div>
          </div>

          <div className="row wrap" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn sm"
              style={{ background: '#ffffff', border: '1px solid var(--border)' }}
              onClick={() => setScopeMatrixModal(true)}
              title="Xem và chỉnh sửa ma trận phân quyền theo phân hệ"
            >
              <L.SlidersHorizontal size={14} /> Phân quyền phân hệ
            </button>
            {isMgr && (
              <button
                type="button"
                className="btn sm primary"
                onClick={() => setAddMemberModal(true)}
              >
                <L.UserPlus size={15} /> Thêm nhân sự vào sơ đồ
              </button>
            )}
            <button
              type="button"
              className="btn sm ghost"
              onClick={() => go(`/projects/${projectId}`)}
            >
              <L.ArrowLeft size={14} /> Về Bàn làm việc
            </button>
          </div>
        </div>

        {/* Thống kê nhanh cấp bậc */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#ffedd5',
                color: '#c2410c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <L.ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Cấp Quản lý</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#c2410c' }}>
                {level1Managers.length} nhân sự
              </div>
            </div>
          </div>

          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#e0f2fe',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <L.GraduationCap size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Cấp Admin / CV</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0369a1' }}>
                {level2Admins.length} nhân sự
              </div>
            </div>
          </div>

          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#f0fdf4',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <L.Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Cấp Trợ lý / TV</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#15803d' }}>
                {level3Assistants.length} nhân sự
              </div>
            </div>
          </div>

          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#f8fafc',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0',
              }}
            >
              <L.CheckSquare size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Tổng công việc</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                {projectTasks.length} đầu việc
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dải luồng vòng đời phối hợp công việc (Lifecycle Flow Ribbon) */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          borderRadius: 14,
          background: '#ffffff',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <L.GitFork size={15} color="var(--teal-700)" />
          <span>Luồng Phối hợp & Kiểm soát Công việc Dự án</span>
          <span className="small faint" style={{ fontWeight: 500 }}>
            (Phân bổ theo 4 bước chuẩn hóa)
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            position: 'relative',
          }}
        >
          {/* Bước 1 */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderTop: '3px solid #64748b',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>BƯỚC 1: KHỞI TẠO</span>
              <span className="badge" style={{ background: '#e2e8f0', color: '#334155', fontSize: 11, fontWeight: 700 }}>
                {flowStats.todo} việc
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
              Giao việc & Tiếp nhận
            </div>
            <div className="small faint" style={{ marginTop: 4, lineHeight: 1.35 }}>
              Quản lý dự án phê duyệt kế hoạch, phân công đầu việc cho Chuyên viên.
            </div>
          </div>

          {/* Bước 2 */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderTop: '3px solid var(--teal-700)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal-700)' }}>BƯỚC 2: THỰC THI</span>
              <span className="badge" style={{ background: 'var(--teal-100)', color: 'var(--teal-800)', fontSize: 11, fontWeight: 700 }}>
                {flowStats.doing} việc
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal-900)' }}>
              Xử lý & Chuyên môn
            </div>
            <div className="small faint" style={{ marginTop: 4, lineHeight: 1.35 }}>
              Chuyên viên & Trợ lý soạn thảo đề án, thu thập khảo sát, điều phối lịch.
            </div>
          </div>

          {/* Bước 3 */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderTop: '3px solid #f59e0b',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706' }}>BƯỚC 3: KIỂM SOÁT</span>
              <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700 }}>
                {flowStats.review} việc
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
              Đối soát & Trình duyệt
            </div>
            <div className="small faint" style={{ marginTop: 4, lineHeight: 1.35 }}>
              Trợ lý báo cáo Chuyên viên, Chuyên viên trình Quản lý dự án phê duyệt.
            </div>
          </div>

          {/* Bước 4 */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderTop: '3px solid #16a34a',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>BƯỚC 4: HOÀN TẤT</span>
              <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 700 }}>
                {flowStats.done} việc
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>
              Nghiệm thu & Lưu trữ
            </div>
            <div className="small faint" style={{ marginTop: 4, lineHeight: 1.35 }}>
              Ban hành văn bản chính thức, quyết toán chi phí và hoàn tất mốc tiến độ.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sơ đồ Cây Phân cấp & Báo cáo (Line of Sight Tree View) */}
      <div
        className="card"
        style={{
          padding: '20px 22px',
          borderRadius: 14,
          background: '#ffffff',
          border: '1px solid var(--border)',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
              Sơ đồ Nhân sự & Luồng Báo cáo (Line of Sight)
            </h3>
            <span className="small faint">
              Phân cấp từ Quản lý ➔ Admin / Chuyên viên ➔ Trợ lý. Nhấp vào vai trò để đổi quyền trực tiếp.
            </span>
          </div>

          <div className="small muted">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c2410c' }} /> Quản lý
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#03616a' }} /> Admin / Chuyên viên
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0891b2' }} /> Trợ lý
            </span>
          </div>
        </div>

        {/* Container chia 3 cột có đường nối phân cấp */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.3fr) minmax(300px, 1.2fr)',
            gap: 20,
            alignItems: 'start',
            minWidth: 920,
          }}
        >
          {/* CỘT 1: CẤP QUẢN LÝ (MANAGER) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#c2410c',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                paddingBottom: 6,
                borderBottom: '2px solid #fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>1. Cấp Quản lý (Trưởng DA)</span>
              <span className="badge" style={{ background: '#ffedd5', color: '#c2410c', fontSize: 10 }}>
                {level1Managers.length}
              </span>
            </div>

            {level1Managers.length === 0 ? (
              <div className="empty small" style={{ padding: 20, border: '1px dashed #cbd5e1', borderRadius: 8 }}>
                Chưa có Quản lý dự án
              </div>
            ) : (
              level1Managers.map((m) => (
                <MemberNodeCard
                  key={m.userId}
                  m={m}
                  level="manager"
                  allManagers={level1Managers}
                  allAdmins={level2Admins}
                  isMgr={isMgr}
                  onRoleChange={handleRoleChange}
                  onReportsToChange={handleReportsToChange}
                  onRemove={handleRemoveMember}
                  onViewTasks={() => setActiveTaskMember(m)}
                />
              ))
            )}
          </div>

          {/* CỘT 2: CẤP ADMIN / CHUYÊN VIÊN CHUYÊN TRÁCH */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--teal-800)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                paddingBottom: 6,
                borderBottom: '2px solid var(--teal-300)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>2. Cấp Admin / Chuyên viên</span>
              <span className="badge" style={{ background: 'var(--teal-100)', color: 'var(--teal-800)', fontSize: 10 }}>
                {level2Admins.length}
              </span>
            </div>

            {level2Admins.length === 0 ? (
              <div className="empty small" style={{ padding: 20, border: '1px dashed #cbd5e1', borderRadius: 8 }}>
                Chưa có Chuyên viên chuyên trách
              </div>
            ) : (
              level2Admins.map((m) => (
                <MemberNodeCard
                  key={m.userId}
                  m={m}
                  level="admin"
                  allManagers={level1Managers}
                  allAdmins={level2Admins}
                  isMgr={isMgr}
                  onRoleChange={handleRoleChange}
                  onReportsToChange={handleReportsToChange}
                  onRemove={handleRemoveMember}
                  onViewTasks={() => setActiveTaskMember(m)}
                />
              ))
            )}
          </div>

          {/* CỘT 3: CẤP TRỢ LÝ / THÀNH VIÊN THỰC THI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#0891b2',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                paddingBottom: 6,
                borderBottom: '2px solid #a5f3fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>3. Cấp Trợ lý / Thực thi</span>
              <span className="badge" style={{ background: '#ecfeff', color: '#0891b2', fontSize: 10 }}>
                {level3Assistants.length}
              </span>
            </div>

            {level3Assistants.length === 0 ? (
              <div className="empty small" style={{ padding: 20, border: '1px dashed #cbd5e1', borderRadius: 8 }}>
                Chưa có Trợ lý / Thành viên
              </div>
            ) : (
              level3Assistants.map((m) => (
                <MemberNodeCard
                  key={m.userId}
                  m={m}
                  level="assistant"
                  allManagers={level1Managers}
                  allAdmins={level2Admins}
                  isMgr={isMgr}
                  onRoleChange={handleRoleChange}
                  onReportsToChange={handleReportsToChange}
                  onRemove={handleRemoveMember}
                  onViewTasks={() => setActiveTaskMember(m)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal 1: Thêm Nhân sự vào Sơ đồ */}
      {addMemberModal && (
        <Modal
          title="Thêm Nhân sự vào Sơ đồ Dự án"
          onClose={() => setAddMemberModal(false)}
          width={480}
          footer={
            <div className="row end" style={{ gap: 8 }}>
              <button className="btn ghost sm" onClick={() => setAddMemberModal(false)}>
                Hủy
              </button>
              <button
                className="btn primary sm"
                disabled={!selectedUserToAdd}
                onClick={handleAddMember}
              >
                Xác nhận thêm
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Chọn tài khoản nhân sự:</label>
              <select
                className="select"
                value={selectedUserToAdd}
                onChange={(e) => setSelectedUserToAdd(e.target.value)}
              >
                <option value="">-- Chọn nhân sự từ hệ thống --</option>
                {(state.users || [])
                  .filter((u) => !members.some((m) => m.userId === u.id))
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title || u.email})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="label">Vai trò trong phân cấp:</label>
              <select
                className="select"
                value={selectedRoleToAdd}
                onChange={(e) => setSelectedRoleToAdd(e.target.value)}
              >
                {DEFAULT_PROJECT_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="small faint" style={{ marginTop: 4 }}>
                Vai trò này sẽ quyết định quyền hạn phê duyệt và các phân hệ hiển thị trên Bàn làm việc.
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 2: Ma trận phân quyền phân hệ (Scope Matrix) */}
      {scopeMatrixModal && (
        <ScopeMatrixModal
          project={project}
          onClose={() => setScopeMatrixModal(false)}
          onSave={(rolePermissions) => {
            updateProject(projectId, { rolePermissions })
            toast('Đã lưu cấu hình phân quyền phân hệ')
            setScopeMatrixModal(false)
          }}
        />
      )}

      {/* Modal 3: Danh sách công việc của một nhân sự */}
      {activeTaskMember && (
        <Modal
          title={`Công việc của ${activeTaskMember.user.name} (${activeTaskMember.roleCfg.viName})`}
          onClose={() => setActiveTaskMember(null)}
          width={640}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeTaskMember.tasksAssigned.length === 0 ? (
              <div className="empty small">Nhân sự này hiện chưa được giao công việc nào.</div>
            ) : (
              activeTaskMember.tasksAssigned.map((t) => {
                const late = isOverdue(t)
                return (
                  <div
                    key={t.id}
                    className="row between"
                    style={{
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: `1px solid ${late ? '#fca5a5' : '#e2e8f0'}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setActiveTaskMember(null)
                      openTask(t.id)
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                        {t.title}
                      </div>
                      <div className="small faint">Hạn chót: {t.dueDate || 'Chưa đặt'}</div>
                    </div>
                    <div className="row" style={{ gap: 6 }}>
                      {late && (
                        <span className="badge danger" style={{ fontSize: 10.5 }}>
                          Quá hạn
                        </span>
                      )}
                      <span className="badge" style={{ fontSize: 10.5 }}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

/**
 * Thẻ Card Node cho từng nhân sự trong cây phân cấp
 */
function MemberNodeCard({
  m,
  level,
  allManagers,
  allAdmins,
  isMgr,
  onRoleChange,
  onReportsToChange,
  onRemove,
  onViewTasks,
}) {
  const [editingRole, setEditingRole] = useState(false)
  const [editingReportsTo, setEditingReportsTo] = useState(false)

  // Báo cáo cho ai
  const supervisor = (allManagers.concat(allAdmins)).find((s) => s.userId === m.reportsTo)

  // Màu sắc viền theo cấp bậc
  const borderColor =
    level === 'manager'
      ? '#f97316'
      : level === 'admin'
      ? 'var(--teal-600, #0d9488)'
      : '#0891b2'

  const bgHeader =
    level === 'manager'
      ? '#fff7ed'
      : level === 'admin'
      ? '#f0fdfa'
      : '#f8fafc'

  return (
    <div
      style={{
        borderRadius: 12,
        background: '#ffffff',
        border: `1px solid ${level === 'manager' ? '#fdba74' : level === 'admin' ? '#99f6e4' : '#e2e8f0'}`,
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
        transition: 'all 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header node: Avatar + Tên + Badge vai trò */}
      <div style={{ padding: '12px 14px', background: bgHeader, borderBottom: '1px solid #f1f5f9' }}>
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div className="row" style={{ gap: 9, alignItems: 'center' }}>
            <Avatar user={m.user} size={36} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>
                {m.user.name}
              </div>
              <div className="small faint" style={{ fontSize: 11 }}>
                {m.user.title || 'Chuyên viên'}
              </div>
            </div>
          </div>

          {/* Quick role change */}
          {editingRole ? (
            <select
              className="select sm"
              style={{ fontSize: 11, padding: '2px 6px', height: 26 }}
              value={m.role}
              autoFocus
              onBlur={() => setEditingRole(false)}
              onChange={(e) => {
                onRoleChange(m.userId, e.target.value)
                setEditingRole(false)
              }}
            >
              {DEFAULT_PROJECT_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          ) : (
            <button
              type="button"
              className="chip"
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                background: m.roleCfg.bg,
                color: m.roleCfg.color,
                border: `1px solid ${m.roleCfg.borderColor}`,
                cursor: isMgr ? 'pointer' : 'default',
              }}
              title={isMgr ? 'Bấm để đổi vai trò của nhân sự này' : m.roleCfg.name}
              onClick={() => isMgr && setEditingRole(true)}
            >
              {m.roleCfg.shortName}
              {isMgr && <L.ChevronDown size={11} style={{ marginLeft: 3, opacity: 0.6 }} />}
            </button>
          )}
        </div>
      </div>

      {/* Body: Phân hệ phụ trách + Luồng báo cáo + Khối lượng công việc */}
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Dòng báo cáo công việc (Ai báo cáo cho ai) */}
        {level !== 'manager' && (
          <div style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <L.ArrowUpRight size={12} color="var(--teal-700)" />
              Báo cáo:
            </span>
            {editingReportsTo ? (
              <select
                className="select sm"
                style={{ fontSize: 11, height: 24, padding: '0 4px' }}
                value={m.reportsTo || ''}
                autoFocus
                onBlur={() => setEditingReportsTo(false)}
                onChange={(e) => {
                  onReportsToChange(m.userId, e.target.value)
                  setEditingReportsTo(false)
                }}
              >
                <option value="">-- Mặc định cấp trên --</option>
                {allManagers.concat(allAdmins).filter(x => x.userId !== m.userId).map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.user.name} ({s.roleCfg.shortName})
                  </option>
                ))}
              </select>
            ) : (
              <span
                style={{
                  fontWeight: 600,
                  color: supervisor ? 'var(--text)' : 'var(--muted)',
                  cursor: isMgr ? 'pointer' : 'default',
                  textDecoration: isMgr ? 'underline dotted' : 'none',
                }}
                title={isMgr ? 'Bấm để đổi người nhận báo cáo' : ''}
                onClick={() => isMgr && setEditingReportsTo(true)}
              >
                {supervisor ? supervisor.user.name : allManagers[0]?.user.name || 'Quản lý dự án'}
              </span>
            )}
          </div>
        )}

        {/* Các mảng chuyên môn / hạng mục phụ trách */}
        {m.ownedCategories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {m.ownedCategories.map((c) => (
              <span
                key={c.id}
                className="badge"
                style={{ background: '#f1f5f9', color: '#334155', fontSize: 10, fontWeight: 600 }}
              >
                Phụ trách: {c.no}. {c.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Số lượng việc & Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 6,
            borderTop: '1px solid #f1f5f9',
            marginTop: 2,
          }}
        >
          <button
            type="button"
            className="row small"
            style={{ gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--teal-800)', fontWeight: 600 }}
            onClick={onViewTasks}
            title="Bấm để xem danh sách công việc của nhân sự này"
          >
            <L.CheckSquare size={13} />
            <span>{m.doingTasks.length} việc đang làm</span>
            {m.lateTasks.length > 0 && (
              <span className="badge danger" style={{ fontSize: 9.5, padding: '0 4px' }}>
                {m.lateTasks.length} quá hạn
              </span>
            )}
          </button>

          {isMgr && (
            <button
              type="button"
              className="iconbtn"
              style={{ width: 22, height: 22, color: 'var(--muted)' }}
              title={`Gỡ ${m.user.name} khỏi dự án`}
              onClick={() => onRemove(m.userId, m.user.name)}
            >
              <L.Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Modal Ma trận Phân quyền theo Phân hệ (Scope Matrix)
 */
function ScopeMatrixModal({ project, onClose, onSave }) {
  const currentPermissions = project.rolePermissions || getDefaultRolePermissions(project)
  const [perms, setPerms] = useState(JSON.parse(JSON.stringify(currentPermissions)))

  // Lấy các phân hệ được cấu hình trong dự án
  const configuredModules = project.modulesConfig?.length
    ? project.modulesConfig.filter((m) => m.isEnabled !== false)
    : MODULES.filter((m) => ['docs', 'students', 'sessions', 'exams', 'lecturers', 'trips', 'transfers', 'expenses', 'grades', 'tickets', 'report'].includes(m.id))

  const roles = DEFAULT_PROJECT_ROLES

  const handleToggle = (roleId, moduleKey) => {
    if (roleId === 'manager') return // Manager luôn có toàn quyền
    setPerms((prev) => {
      const copy = { ...prev }
      const currentRole = copy[roleId] || { roleId, modules: [] }
      let mods = currentRole.modules || []
      if (mods.includes(moduleKey)) {
        mods = mods.filter((k) => k !== moduleKey)
      } else {
        mods = [...mods, moduleKey]
      }
      copy[roleId] = { ...currentRole, modules: mods }
      return copy
    })
  }

  return (
    <Modal
      title="Ma trận Phân quyền & Phạm vi Phân hệ"
      onClose={onClose}
      width={780}
      footer={
        <div className="row end" style={{ gap: 8 }}>
          <button className="btn ghost sm" onClick={onClose}>
            Hủy
          </button>
          <button className="btn primary sm" onClick={() => onSave(perms)}>
            Lưu thay đổi phân quyền
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="small faint">
          Đánh dấu phân hệ mà từng vai trò được quyền xem và cập nhật dữ liệu.
          Thay đổi sẽ có hiệu lực tức thì cho toàn bộ nhân sự giữ vai trò đó.
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          <table className="table" style={{ fontSize: 12.5, margin: 0 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: 180 }}>Vai trò</th>
                {configuredModules.map((m) => (
                  <th key={m.moduleKey || m.id} style={{ textAlign: 'center', minWidth: 90 }}>
                    {m.customTitle || m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => {
                const rolePerm = perms[r.id] || { modules: [] }
                const isAll = r.id === 'manager' || rolePerm.modules?.includes('*')
                return (
                  <tr key={r.id}>
                    <td>
                      <span className="chip" style={{ background: r.bg, color: r.color, fontWeight: 700, fontSize: 11 }}>
                        {r.shortName}
                      </span>
                    </td>
                    {configuredModules.map((m) => {
                      const modKey = m.moduleKey || m.id
                      const hasAccess = isAll || (rolePerm.modules || []).includes(modKey)
                      return (
                        <td key={modKey} style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={hasAccess}
                            disabled={r.id === 'manager'}
                            onChange={() => handleToggle(r.id, modKey)}
                            style={{ cursor: r.id === 'manager' ? 'not-allowed' : 'pointer' }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}
