import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import * as L from 'lucide-react'
import { useStore, projectRole } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { useToast, Avatar, Modal } from '../components/ui.jsx'
import { DEFAULT_PROJECT_ROLES, getRoleConfig, getDefaultRolePermissions } from '../data/rbac.js'
import { MODULES } from '../modules/schema.js'
import { isOverdue } from '../lib/utils.js'

/**
 * Trang Workflow Dự án
 * Cấu trúc phân cấp 4 cột dạng nhánh ngang Line of Sight:
 * QUẢN LÝ ➔ NHÂN SỰ CẤP 1 (CHUYÊN VIÊN CHÍNH) ➔ CÁC ĐẦU MỤC CÔNG VIỆC ➔ TRỢ LÝ DỰ ÁN
 * Tự động đồng bộ hai chiều (2-way sync) với vai trò và quyền hạn của dự án.
 */
export default function ProjectWorkflow({ projectId, project: propProject, isEmbedded = false }) {
  const { state, me, setMember, removeMember, updateProject, saveCategories } = useStore()
  const { go, openTask } = useUI()
  const toast = useToast()

  const project = propProject || (state.projects || []).find((p) => p.id === (projectId || propProject?.id))
  const isMgr = projectRole(project, me) === 'manager' || me.role === 'super_admin'

  // Modal states
  const [addMemberModal, setAddMemberModal] = useState(false)
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('')
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('assistant')
  const [scopeMatrixModal, setScopeMatrixModal] = useState(false)
  const [activeTaskMember, setActiveTaskMember] = useState(null)

  const projId = project?.id || projectId

  // Danh sách công việc của dự án này
  const projectTasks = useMemo(() => {
    return (state.tasks || []).filter((t) => t.projectId === projId && !t.isStream)
  }, [state.tasks, projId])

  const members = project?.members || []
  const categories = project?.categories || []
  const assistantAssignments = project?.assistantAssignments || {}

  // Lấy danh sách nhân sự đầy đủ thông tin
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

      return {
        ...m,
        user,
        roleCfg,
        tasksAssigned,
        doingTasks,
        lateTasks,
        doneTasks,
      }
    })
  }, [members, state.users, project, projectTasks])

  // 1. Cấp Quản lý (Manager / Trưởng dự án)
  const managers = enrichedMembers.filter((m) => m.role === 'manager')
  const primaryManager = managers[0] || enrichedMembers[0]

  // 2. Nhân sự cấp 1 (Chuyên viên / Admin chính)
  const specialists = enrichedMembers.filter(
    (m) => m.role === 'academic_admin' || m.role === 'program_officer'
  )

  // 3. Cấp Trợ lý / Thành viên hỗ trợ
  const assistants = enrichedMembers.filter(
    (m) => m.role === 'assistant' || m.role === 'member'
  )
  const defaultAssistant = assistants[0] || null

  // Đổi vai trò 2 chiều (Cập nhật tức thì vào Store & RBAC)
  const handleRoleChange = (userId, newRole) => {
    setMember(projId, userId, newRole)
    const targetUser = (state.users || []).find((u) => u.id === userId)
    const roleCfg = DEFAULT_PROJECT_ROLES.find((r) => r.id === newRole)
    toast(`Đã cập nhật vai trò của ${targetUser?.name || 'nhân sự'} thành “${roleCfg?.name || newRole}”`)
  }

  // Đổi người phụ trách đầu mục công việc (Category Owner)
  const handleCategoryOwnerChange = (categoryId, newOwnerId) => {
    const updatedCats = categories.map((c) =>
      c.id === categoryId ? { ...c, ownerId: newOwnerId } : c
    )
    saveCategories(projId, updatedCats)
    const targetUser = (state.users || []).find((u) => u.id === newOwnerId)
    toast(`Đã gán đầu mục cho ${targetUser?.name || 'chuyên viên'}`)
  }

  // Đổi trợ lý hỗ trợ đầu mục công việc
  const handleAssistantAssignmentChange = (categoryId, newAssistantId) => {
    const updated = {
      ...assistantAssignments,
      [categoryId]: newAssistantId || null,
    }
    updateProject(projId, { assistantAssignments: updated })
    toast('Đã cập nhật phân công trợ lý cho đầu mục')
  }

  // Thêm nhân sự mới vào sơ đồ
  const handleAddMember = () => {
    if (!selectedUserToAdd) return
    setMember(projId, selectedUserToAdd, selectedRoleToAdd)
    const targetUser = (state.users || []).find((u) => u.id === selectedUserToAdd)
    toast(`Đã thêm ${targetUser?.name || 'thành viên'} vào sơ đồ dự án`)
    setSelectedUserToAdd('')
    setAddMemberModal(false)
  }

  // Nhóm các đầu mục công việc theo từng nhân sự cấp 1 (Specialist)
  const specialistGroups = useMemo(() => {
    return specialists.map((s) => {
      const ownedCats = categories.filter((c) => c.ownerId === s.userId)
      return {
        specialist: s,
        categories: ownedCats,
      }
    })
  }, [specialists, categories])

  // Các đầu mục do Quản lý phụ trách trực tiếp (như Báo cáo tổng hợp c10)
  const managerOwnedCats = useMemo(() => {
    return categories.filter(
      (c) => c.ownerId === primaryManager?.userId || !specialists.some((s) => s.userId === c.ownerId)
    )
  }, [categories, primaryManager, specialists])

  // Đường nối động (Dynamic Bézier Connector Lines) dựa theo tọa độ thực tế của cổng nối (Ports)
  const containerRef = useRef(null)
  const [connectorPaths, setConnectorPaths] = useState([])

  const updateConnectorPaths = useCallback(() => {
    if (!containerRef.current) return
    const cRect = containerRef.current.getBoundingClientRect()

    const getPortPos = (id) => {
      const el = document.getElementById(id)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: r.left - cRect.left + r.width / 2,
        y: r.top - cRect.top + r.height / 2,
      }
    }

    const paths = []

    // 1. Quản lý ➔ Nhân sự cấp 1
    const mgrPort = getPortPos('port-mgr-out')
    if (mgrPort) {
      specialists.forEach((s) => {
        const specIn = getPortPos(`port-spec-in-${s.userId}`)
        if (specIn) {
          const dx = Math.abs(specIn.x - mgrPort.x) * 0.5
          paths.push({
            id: `line-mgr-spec-${s.userId}`,
            d: `M ${mgrPort.x} ${mgrPort.y} C ${mgrPort.x + dx} ${mgrPort.y}, ${specIn.x - dx} ${specIn.y}, ${specIn.x} ${specIn.y}`,
            color: '#ea580c',
          })
        }
      })

      // Quản lý ➔ Đầu mục trực tiếp (như Báo cáo c10)
      managerOwnedCats.forEach((cat) => {
        const catIn = getPortPos(`port-cat-in-${cat.id}`)
        if (catIn) {
          const dx = Math.abs(catIn.x - mgrPort.x) * 0.5
          paths.push({
            id: `line-mgr-cat-${cat.id}`,
            d: `M ${mgrPort.x} ${mgrPort.y} C ${mgrPort.x + dx} ${mgrPort.y}, ${catIn.x - dx} ${catIn.y}, ${catIn.x} ${catIn.y}`,
            color: '#ea580c',
          })
        }
      })
    }

    // 2. Nhân sự cấp 1 ➔ Các đầu mục công việc
    specialists.forEach((s) => {
      const specOut = getPortPos(`port-spec-out-${s.userId}`)
      if (!specOut) return
      const sCats = categories.filter((c) => c.ownerId === s.userId)
      sCats.forEach((cat) => {
        const catIn = getPortPos(`port-cat-in-${cat.id}`)
        if (catIn) {
          const dx = Math.abs(catIn.x - specOut.x) * 0.5
          paths.push({
            id: `line-spec-${s.userId}-cat-${cat.id}`,
            d: `M ${specOut.x} ${specOut.y} C ${specOut.x + dx} ${specOut.y}, ${catIn.x - dx} ${catIn.y}, ${catIn.x} ${catIn.y}`,
            color: '#0d9488',
          })
        }
      })
    })

    // 3. Các đầu mục công việc ➔ Trợ lý dự án
    specialists.forEach((s) => {
      const sCats = categories.filter((c) => c.ownerId === s.userId)
      const astIn = getPortPos(`port-ast-in-${s.userId}`)
      if (!astIn) return
      sCats.forEach((cat) => {
        const catOut = getPortPos(`port-cat-out-${cat.id}`)
        if (catOut) {
          const dx = Math.abs(astIn.x - catOut.x) * 0.5
          paths.push({
            id: `line-cat-${cat.id}-ast-${s.userId}`,
            d: `M ${catOut.x} ${catOut.y} C ${catOut.x + dx} ${catOut.y}, ${astIn.x - dx} ${astIn.y}, ${astIn.x} ${astIn.y}`,
            color: '#38bdf8',
          })
        }
      })
    })

    // 4. Đầu mục quản lý ➔ Trợ lý (nếu có)
    const mgrAstIn = getPortPos('port-ast-in-mgr')
    if (mgrAstIn) {
      managerOwnedCats.forEach((cat) => {
        const catOut = getPortPos(`port-cat-out-${cat.id}`)
        if (catOut) {
          const dx = Math.abs(mgrAstIn.x - catOut.x) * 0.5
          paths.push({
            id: `line-mgr-cat-${cat.id}-ast`,
            d: `M ${catOut.x} ${catOut.y} C ${catOut.x + dx} ${catOut.y}, ${mgrAstIn.x - dx} ${mgrAstIn.y}, ${mgrAstIn.x} ${mgrAstIn.y}`,
            color: '#38bdf8',
          })
        }
      })
    }

    setConnectorPaths(paths)
  }, [specialists, categories, managerOwnedCats])

  useEffect(() => {
    const timer = setTimeout(updateConnectorPaths, 60)
    window.addEventListener('resize', updateConnectorPaths)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateConnectorPaths)
    }
  }, [updateConnectorPaths])

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
      {/* 1. Header Banner: Tiêu đề "Workflow" + Nút thao tác (Không có tag hay mô tả rườm rà) */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: 14,
          background: '#ffffff',
          border: '1px solid var(--border)',
        }}
      >
        <div className="row between wrap" style={{ gap: 12, alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--teal-950, #042f2e)' }}>
              Workflow: {project.name}
            </h2>
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
      </div>

      {/* 2. Sơ đồ Luồng phân cấp 4 tầng dạng Line of Sight: Quản lý ➔ Nhân sự cấp 1 ➔ Các đầu mục công việc ➔ Trợ lý */}
      <div
        className="card"
        style={{
          padding: '24px 22px',
          borderRadius: 14,
          background: '#ffffff',
          border: '1px solid var(--border)',
          overflowX: 'auto',
        }}
      >
        {/* Header 4 cột tương ứng */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '270px 50px 280px 50px 340px 50px 270px',
            gap: 0,
            marginBottom: 20,
            alignItems: 'center',
            minWidth: 1310,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            1. Quản lý dự án
          </div>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}><L.ArrowRight size={15} /></div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--teal-800)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            2. Nhân sự chính
          </div>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}><L.ArrowRight size={15} /></div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3. Đầu mục công việc ({categories.length} mục)
          </div>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}><L.ArrowRight size={15} /></div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            4. Trợ lý
          </div>
        </div>

        {/* Khung sơ đồ cây dạng nhánh ngang Line of Sight */}
        <div
          ref={containerRef}
          style={{
            minWidth: 1310,
            position: 'relative',
          }}
        >
          {/* Lớp SVG vẽ đường nhánh cong (Bézier Lines) kết nối cổng các thẻ */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
              overflow: 'visible',
            }}
          >
            {connectorPaths.map((p) => (
              <path
                key={p.id}
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Cấu trúc cây 4 tầng */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 0,
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* CỘT 1: QUẢN LÝ DỰ ÁN */}
            <div style={{ width: 270, flexShrink: 0, alignSelf: 'center' }}>
              {primaryManager && (
                <div
                  style={{
                    padding: '16px 14px',
                    borderRadius: 12,
                    background: '#fff7ed',
                    border: '1.5px solid #fdba74',
                    boxShadow: '0 3px 10px rgba(234, 88, 12, 0.08)',
                    position: 'relative',
                  }}
                >
                  <div className="row" style={{ gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <Avatar user={primaryManager.user} size={42} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#9a3412', lineHeight: 1.25 }}>
                        {primaryManager.user.name}
                      </div>
                      <div className="small faint" style={{ fontSize: 11 }}>
                        {primaryManager.user.title || 'Quản lý dự án'}
                      </div>
                    </div>
                  </div>

                  <div className="row between" style={{ alignItems: 'center' }}>
                    <span
                      className="chip"
                      style={{
                        background: '#ffedd5',
                        color: '#c2410c',
                        fontSize: 10.5,
                        fontWeight: 700,
                        border: '1px solid #fed7aa',
                      }}
                    >
                      Quản lý dự án
                    </span>
                    <span className="badge" style={{ background: '#ffffff', color: '#c2410c', fontSize: 10, fontWeight: 700 }}>
                      {categories.length}/{categories.length} đầu mục
                    </span>
                  </div>

                  <div className="small faint" style={{ marginTop: 8, fontSize: 11, borderTop: '1px dashed #fed7aa', paddingTop: 6 }}>
                    Chỉ đạo toàn diện & Ký duyệt đề án
                  </div>

                  {/* Cổng xuất (Output Port) nối sang Nhân sự cấp 1 */}
                  <div
                    id="port-mgr-out"
                    style={{
                      position: 'absolute',
                      right: -5,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '2px solid #ea580c',
                      boxShadow: '0 0 0 2px rgba(234, 88, 12, 0.15)',
                      zIndex: 3,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Khoảng trống luồng nối Cột 1 sang Cột 2 */}
            <div style={{ width: 50, flexShrink: 0 }} />

            {/* CỘT 2, 3, 4: NHÂN SỰ CẤP 1 ➔ ĐẦU MỤC CÔNG VIỆC ➔ TRỢ LÝ */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {specialistGroups.map(({ specialist, categories: specCats }) => {
                const rowCats = specCats.length > 0 ? specCats : [
                  { id: `empty_${specialist.userId}`, no: '··', name: 'Đang tiếp nhận phân công đầu mục', icon: 'FolderKanban', unassigned: true }
                ]

                return (
                  <div
                    key={specialist.userId}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '280px 50px 340px 50px 270px',
                      alignItems: 'center',
                      background: '#fafbfc',
                      padding: '14px 16px',
                      borderRadius: 14,
                      border: '1px solid #f1f5f9',
                      position: 'relative',
                    }}
                  >
                    {/* CỘT 2: THẺ NHÂN SỰ CẤP 1 */}
                    <div
                      style={{
                        borderRadius: 10,
                        background: '#ffffff',
                        border: '1px solid var(--teal-200, #ccfbf1)',
                        borderLeft: '4px solid var(--teal-700)',
                        padding: '12px 14px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        position: 'relative',
                      }}
                    >
                      {/* Cổng nhập từ Quản lý */}
                      <div
                        id={`port-spec-in-${specialist.userId}`}
                        style={{
                          position: 'absolute',
                          left: -5,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#ffffff',
                          border: '2px solid var(--teal-700)',
                          boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.15)',
                          zIndex: 3,
                        }}
                      />

                      <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
                        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                          <Avatar user={specialist.user} size={34} />
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
                              {specialist.user.name}
                            </div>
                            <div className="small faint" style={{ fontSize: 11 }}>
                              {specialist.user.title || 'Nhân sự chính'}
                            </div>
                          </div>
                        </div>

                        {/* Dropdown đổi vai trò nhanh (2-way sync) */}
                        <select
                          className="select sm"
                          style={{
                            fontSize: 10.5,
                            height: 24,
                            padding: '0 4px',
                            fontWeight: 700,
                            color: specialist.roleCfg.color,
                            background: specialist.roleCfg.bg,
                            border: `1px solid ${specialist.roleCfg.borderColor}`,
                          }}
                          value={specialist.role}
                          disabled={!isMgr}
                          onChange={(e) => handleRoleChange(specialist.userId, e.target.value)}
                          title="Đổi vai trò nhân sự trong dự án"
                        >
                          {DEFAULT_PROJECT_ROLES.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.shortName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="row between" style={{ alignItems: 'center', paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                        <span className="badge" style={{ background: 'var(--teal-50)', color: 'var(--teal-800)', fontSize: 10.5, fontWeight: 700 }}>
                          {specCats.length} đầu mục phụ trách
                        </span>
                        <button
                          type="button"
                          className="btn sm ghost"
                          style={{ padding: '1px 5px', fontSize: 10.5, color: 'var(--teal-800)', fontWeight: 600 }}
                          onClick={() => setActiveTaskMember(specialist)}
                          title="Xem danh sách công việc"
                        >
                          {specialist.doingTasks.length} việc
                        </button>
                      </div>

                      {/* Cổng xuất nối sang Cột 3 (Đầu mục công việc) */}
                      <div
                        id={`port-spec-out-${specialist.userId}`}
                        style={{
                          position: 'absolute',
                          right: -5,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#ffffff',
                          border: '2px solid var(--teal-700)',
                          boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.15)',
                          zIndex: 3,
                        }}
                      />
                    </div>

                    {/* Khoảng trống luồng nối Cột 2 sang Cột 3 */}
                    <div style={{ width: 50 }} />

                    {/* CỘT 3: CÁC ĐẦU MỤC CÔNG VIỆC CỦA NHÂN SỰ NÀY */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {rowCats.map((cat) => {
                        const catTasks = projectTasks.filter((t) => t.categoryId === cat.id)
                        const catDone = catTasks.filter((t) => t.status === 'done').length
                        const catRate = catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0
                        const hasLate = catTasks.some((t) => isOverdue(t))

                        return (
                          <div
                            key={cat.id}
                            style={{
                              borderRadius: 9,
                              background: '#ffffff',
                              border: `1px solid ${hasLate ? '#fca5a5' : '#e2e8f0'}`,
                              borderLeft: `3px solid ${hasLate ? 'var(--danger)' : '#0284c7'}`,
                              padding: '9px 12px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                              position: 'relative',
                            }}
                          >
                            {/* Cổng nhập từ Chuyên viên */}
                            <div
                              id={`port-cat-in-${cat.id}`}
                              style={{
                                position: 'absolute',
                                left: -5,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: '#ffffff',
                                border: '2px solid #0284c7',
                                boxShadow: '0 0 0 2px rgba(2, 132, 199, 0.15)',
                                zIndex: 3,
                              }}
                            />

                            <div className="row between" style={{ alignItems: 'center' }}>
                              <div className="row" style={{ gap: 7, alignItems: 'center' }}>
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 800,
                                    color: '#0284c7',
                                    background: '#e0f2fe',
                                    padding: '1px 5px',
                                    borderRadius: 4,
                                  }}
                                >
                                  {cat.no}
                                </span>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>
                                  {cat.name}
                                </span>
                              </div>

                              <span
                                className="badge"
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  background: catRate === 100 ? '#dcfce7' : hasLate ? '#fee2e2' : '#f1f5f9',
                                  color: catRate === 100 ? '#166534' : hasLate ? '#991b1b' : '#334155',
                                }}
                              >
                                {catDone}/{catTasks.length} việc ({catRate}%)
                              </span>
                            </div>

                            {/* Dropdown chuyển quyền sở hữu đầu mục (2-way sync) */}
                            {isMgr && !cat.unassigned && (
                              <div className="row between" style={{ marginTop: 6, paddingTop: 4, borderTop: '1px dashed #f1f5f9', fontSize: 11 }}>
                                <span className="faint">Phụ trách chính:</span>
                                <select
                                  className="select sm"
                                  style={{ fontSize: 10, height: 20, padding: '0 3px' }}
                                  value={cat.ownerId || specialist.userId}
                                  onChange={(e) => handleCategoryOwnerChange(cat.id, e.target.value)}
                                >
                                  {specialists.concat(managers).map((sp) => (
                                    <option key={sp.userId} value={sp.userId}>
                                      {sp.user.name} ({sp.roleCfg.shortName})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Cổng xuất nối sang Cột 4 (Trợ lý) */}
                            <div
                              id={`port-cat-out-${cat.id}`}
                              style={{
                                position: 'absolute',
                                right: -5,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: '#ffffff',
                                border: '2px solid #0284c7',
                                boxShadow: '0 0 0 2px rgba(2, 132, 199, 0.15)',
                                zIndex: 3,
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>

                    {/* Khoảng trống luồng nối Cột 3 sang Cột 4 */}
                    <div style={{ width: 50 }} />

                    {/* CỘT 4: TRỢ LÝ DỰ ÁN HỖ TRỢ ĐẦU MỤC NÀY */}
                    <div style={{ position: 'relative' }}>
                      {/* Cổng nhập nhận từ các đầu mục */}
                      <div
                        id={`port-ast-in-${specialist.userId}`}
                        style={{
                          position: 'absolute',
                          left: -5,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#ffffff',
                          border: '2px solid #0891b2',
                          boxShadow: '0 0 0 2px rgba(8, 145, 178, 0.15)',
                          zIndex: 3,
                        }}
                      />

                      {defaultAssistant ? (
                        <div
                          style={{
                            borderRadius: 10,
                            background: '#ffffff',
                            border: '1px solid #bae6fd',
                            borderLeft: '4px solid #0891b2',
                            padding: '11px 13px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          }}
                        >
                          <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 6 }}>
                            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                              <Avatar user={defaultAssistant.user} size={32} />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                                  {defaultAssistant.user.name}
                                </div>
                                <div className="small faint" style={{ fontSize: 10.5 }}>
                                  {defaultAssistant.user.title || 'Trợ lý dự án'}
                                </div>
                              </div>
                            </div>

                            <span
                              className="chip"
                              style={{
                                background: defaultAssistant.roleCfg.bg,
                                color: defaultAssistant.roleCfg.color,
                                fontSize: 10,
                                fontWeight: 700,
                                border: `1px solid ${defaultAssistant.roleCfg.borderColor}`,
                              }}
                            >
                              Trợ lý
                            </span>
                          </div>

                          <div className="small faint" style={{ fontSize: 11, lineHeight: 1.35 }}>
                            Hỗ trợ biểu mẫu, đối soát checklist và tổng hợp tiến độ các đầu mục trên.
                          </div>

                          {/* Phân công trợ lý khác nếu có nhiều trợ lý */}
                          {assistants.length > 1 && isMgr && (
                            <div className="row between" style={{ marginTop: 6, paddingTop: 4, borderTop: '1px dashed #e2e8f0', fontSize: 10.5 }}>
                              <span className="faint">Đổi trợ lý:</span>
                              <select
                                className="select sm"
                                style={{ fontSize: 10, height: 20, padding: '0 3px' }}
                                value={defaultAssistant.userId}
                                onChange={(e) => handleAssistantAssignmentChange(rowCats[0]?.id, e.target.value)}
                              >
                                {assistants.map((ast) => (
                                  <option key={ast.userId} value={ast.userId}>
                                    {ast.user.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: '12px 14px',
                            border: '1px dashed #cbd5e1',
                            borderRadius: 8,
                            textAlign: 'center',
                            color: '#94a3b8',
                            fontSize: 11.5,
                          }}
                        >
                          Chưa có Trợ lý hỗ trợ
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Nhóm đầu mục Báo cáo / Chỉ đạo của Quản lý (nếu có) */}
              {managerOwnedCats.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '280px 50px 340px 50px 270px',
                    alignItems: 'center',
                    background: '#fffbf5',
                    padding: '12px 16px',
                    borderRadius: 14,
                    border: '1px solid #fed7aa',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      borderRadius: 10,
                      background: '#ffffff',
                      border: '1.5px solid #fdba74',
                      borderLeft: '4px solid #ea580c',
                      padding: '10px 12px',
                    }}
                  >
                    <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                      <Avatar user={primaryManager.user} size={30} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>
                          {primaryManager.user.name}
                        </div>
                        <div className="small faint" style={{ fontSize: 10.5 }}>
                          Trực tiếp chủ trì & Tổng hợp
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', color: '#ea580c' }}>
                    <L.ArrowRight size={14} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {managerOwnedCats.map((cat) => (
                      <div
                        key={cat.id}
                        style={{
                          padding: '8px 12px',
                          background: '#ffffff',
                          border: '1px solid #fed7aa',
                          borderLeft: '3px solid #ea580c',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'relative',
                        }}
                      >
                        {/* Cổng nhập từ Quản lý */}
                        <div
                          id={`port-cat-in-${cat.id}`}
                          style={{
                            position: 'absolute',
                            left: -5,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: '#ffffff',
                            border: '2px solid #ea580c',
                            boxShadow: '0 0 0 2px rgba(234, 88, 12, 0.15)',
                            zIndex: 3,
                          }}
                        />

                        <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 10.5, fontWeight: 800, color: '#c2410c', background: '#ffedd5', padding: '1px 5px', borderRadius: 4 }}>
                            {cat.no}
                          </span>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>
                            {cat.name}
                          </span>
                        </div>
                        <span className="badge" style={{ background: '#ffedd5', color: '#c2410c', fontSize: 10, fontWeight: 700 }}>
                          Chỉ đạo
                        </span>

                        {/* Cổng xuất sang Trợ lý */}
                        <div
                          id={`port-cat-out-${cat.id}`}
                          style={{
                            position: 'absolute',
                            right: -5,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: '#ffffff',
                            border: '2px solid #ea580c',
                            boxShadow: '0 0 0 2px rgba(234, 88, 12, 0.15)',
                            zIndex: 3,
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', color: '#ea580c' }}>
                    <L.ArrowRight size={14} />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div
                      id="port-ast-in-mgr"
                      style={{
                        position: 'absolute',
                        left: -5,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '2px solid #0891b2',
                        boxShadow: '0 0 0 2px rgba(8, 145, 178, 0.15)',
                        zIndex: 3,
                      }}
                    />
                    {defaultAssistant && (
                      <div style={{ padding: '8px 12px', background: '#ffffff', borderRadius: 8, border: '1px solid #bae6fd', fontSize: 11 }}>
                        <b>{defaultAssistant.user.name}</b> hỗ trợ thu thập & tổng hợp số liệu báo cáo
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
