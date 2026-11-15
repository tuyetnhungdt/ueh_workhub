/**
 * Hệ thống Phân quyền theo vai trò (RBAC - Role-Based Access Control)
 * Dành cho hệ thống UEH WorkHub điều phối chương trình đào tạo quốc tế
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ACADEMIC_ADMIN: 'academic_admin',
  PROGRAM_OFFICER: 'program_officer',
  LECTURER: 'lecturer',
  MANAGER: 'manager',
  MEMBER: 'member',
}

export const USER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
}

export const PROJECT_TABS_METADATA = [
  { id: 'work', label: 'Bàn làm việc', icon: 'Briefcase', desc: 'Các phân hệ nghiệp vụ số hóa của dự án' },
  { id: 'list', label: 'Danh sách công việc', icon: 'ListTree', desc: 'Xem và lọc danh sách task theo cây hạng mục' },
  { id: 'board', label: 'Bảng Kanban', icon: 'Columns3', desc: 'Kéo thả quản lý trạng thái công việc' },
  { id: 'timeline', label: 'Timeline Gantt', icon: 'GanttChart', desc: 'Biểu đồ tiến độ thời gian và mốc quan trọng' },
  { id: 'progress', label: 'Báo cáo & Tiến độ', icon: 'ChartColumn', desc: 'Thống kê KPI, khối lượng và quản lý thành viên' },
  { id: 'activity', label: 'Lịch sử hoạt động', icon: 'Activity', desc: 'Nhật ký toàn bộ thay đổi trong dự án' },
]

export const ROLE_DETAILS = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    viName: 'Quản trị viên tối cao',
    shortName: 'Super Admin',
    color: '#c2410c',
    bg: '#ffedd5',
    borderColor: '#fed7aa',
    icon: 'ShieldCheck',
    desc: 'Toàn quyền quản trị hệ thống, phê duyệt thành viên mới, phân quyền vai trò, gán dự án và truy cập tất cả các phân hệ dữ liệu.',
    modules: ['docs', 'students', 'sessions', 'exams', 'lecturers', 'trips', 'transfers', 'expenses', 'grades', 'tickets', 'report'],
    tabs: ['work', 'list', 'board', 'timeline', 'progress', 'activity', 'overview', 'members'],
    canApproveMembers: true,
    canManageProjects: true,
    canManageRoles: true,
    canEditCurriculum: true,
    canEditFinance: true,
    canEditGrades: true,
    canManageFlights: true,
    isManager: true,
  },
  manager: {
    id: 'manager',
    name: 'Project Manager',
    viName: 'Quản lý dự án',
    shortName: 'Quản lý',
    color: '#c2410c',
    bg: '#ffedd5',
    borderColor: '#fed7aa',
    icon: 'ShieldAlert',
    desc: 'Toàn quyền quản trị trong phạm vi dự án, duyệt công việc, cấu hình đề mục và phân quyền thành viên.',
    modules: ['*'],
    tabs: ['work', 'list', 'board', 'timeline', 'progress', 'activity'],
    canApproveMembers: false,
    canManageProjects: true,
    canManageRoles: true,
    canEditCurriculum: true,
    canEditFinance: true,
    canEditGrades: true,
    canManageFlights: true,
    isManager: true,
  },
  academic_admin: {
    id: 'academic_admin',
    name: 'Academic Admin',
    viName: 'Quản trị đào tạo (Học vụ & Khảo thí)',
    shortName: 'Quản trị đào tạo',
    color: '#03616a',
    bg: '#e1f1f2',
    borderColor: '#99f6e4',
    icon: 'GraduationCap',
    desc: 'Quản lý sinh viên, khung chương trình đào tạo, phân công giảng dạy, khảo thí, điểm số, hồ sơ giảng viên và đối soát checklist.',
    modules: ['docs', 'students', 'sessions', 'exams', 'lecturers', 'grades', 'report'],
    tabs: ['work', 'list', 'board', 'timeline', 'progress', 'activity', 'overview', 'members'],
    canApproveMembers: false,
    canManageProjects: false,
    canManageRoles: false,
    canEditCurriculum: true,
    canEditFinance: false,
    canEditGrades: true,
    canManageFlights: false,
    isManager: false,
  },
  program_officer: {
    id: 'program_officer',
    name: 'Program Officer',
    viName: 'Điều phối viên / Hậu cần',
    shortName: 'Điều phối viên',
    color: '#0284c7',
    bg: '#e0f2fe',
    borderColor: '#bae6fd',
    icon: 'Plane',
    desc: 'Phụ trách hậu cần đoàn công tác, tra cứu & đề xuất vé máy bay, booking khách sạn, chi phí, tạm ứng, tiếp nhận ticket SV và văn bản điều phối.',
    modules: ['docs', 'sessions', 'lecturers', 'trips', 'transfers', 'expenses', 'tickets', 'report'],
    tabs: ['work', 'list', 'board', 'timeline', 'progress', 'activity', 'overview', 'members'],
    canApproveMembers: false,
    canManageProjects: false,
    canManageRoles: false,
    canEditCurriculum: false,
    canEditFinance: true,
    canEditGrades: false,
    canManageFlights: true,
    isManager: false,
  },
  lecturer: {
    id: 'lecturer',
    name: 'Lecturer',
    viName: 'Giảng viên / Chuyên gia',
    shortName: 'Giảng viên',
    color: '#7c3aed',
    bg: '#f3e8ff',
    borderColor: '#ddd6fe',
    icon: 'BookOpen',
    desc: 'Xem lịch giảng cá nhân, thông tin chuyến công tác & đón tiễn, tải đề cương/tài liệu và nhập/gửi bảng điểm học phần phụ trách.',
    modules: ['sessions', 'trips', 'grades', 'docs'],
    tabs: ['work', 'list', 'progress', 'overview'],
    canApproveMembers: false,
    canManageProjects: false,
    canManageRoles: false,
    canEditCurriculum: false,
    canEditFinance: false,
    canEditGrades: true,
    canManageFlights: false,
    isManager: false,
  },
  member: {
    id: 'member',
    name: 'Team Member',
    viName: 'Thành viên dự án',
    shortName: 'Thành viên',
    color: '#059669',
    bg: '#ecfdf5',
    borderColor: '#a7f3d0',
    icon: 'UserCheck',
    desc: 'Xem công việc được phân công, tham gia trao đổi thảo luận, tra cứu tài liệu và báo cáo tiến độ.',
    modules: ['docs', 'report'],
    tabs: ['work', 'list', 'board', 'timeline', 'progress'],
    canApproveMembers: false,
    canManageProjects: false,
    canManageRoles: false,
    canEditCurriculum: false,
    canEditFinance: false,
    canEditGrades: false,
    canManageFlights: false,
    isManager: false,
  },
}

export const DEFAULT_PROJECT_ROLES = [
  { id: 'manager', name: 'Quản lý dự án', shortName: 'Quản lý', color: '#c2410c', bg: '#ffedd5', borderColor: '#fed7aa', isManager: true },
  { id: 'academic_admin', name: 'Quản trị đào tạo / Học vụ', shortName: 'Quản trị đào tạo', color: '#03616a', bg: '#e1f1f2', borderColor: '#99f6e4', isManager: false },
  { id: 'program_officer', name: 'Điều phối viên / Hậu cần', shortName: 'Điều phối viên', color: '#0284c7', bg: '#e0f2fe', borderColor: '#bae6fd', isManager: false },
  { id: 'lecturer', name: 'Giảng viên / Chuyên gia', shortName: 'Giảng viên', color: '#7c3aed', bg: '#f3e8ff', borderColor: '#ddd6fe', isManager: false },
  { id: 'member', name: 'Thành viên dự án', shortName: 'Thành viên', color: '#059669', bg: '#ecfdf5', borderColor: '#a7f3d0', isManager: false },
]

/**
 * Khởi tạo cấu hình phân quyền đề mục mặc định cho từng vai trò trong dự án
 */
export function getDefaultRolePermissions(project) {
  const baseMods = [
    'docs', 'students', 'sessions', 'exams', 'lecturers', 'trips',
    'transfers', 'expenses', 'grades', 'tickets', 'report',
    'gl_docs', 'gl_surveys', 'gl_drafts', 'gl_meetings', 'gl_trips', 'gl_experts', 'gl_legal_lib', 'gl_finance'
  ]
  const projMods = project?.modulesConfig?.filter((m) => m.isEnabled !== false).map((m) => m.moduleKey) || baseMods

  return {
    manager: {
      roleId: 'manager',
      name: 'Quản lý dự án',
      tabs: ['work', 'list', 'board', 'timeline', 'progress', 'activity'],
      modules: ['*'],
      isManager: true,
    },
    academic_admin: {
      roleId: 'academic_admin',
      name: 'Quản trị đào tạo (Học vụ & Khảo thí)',
      tabs: ['work', 'list', 'board', 'timeline', 'progress', 'activity'],
      modules: projMods.filter((k) => ['docs', 'students', 'sessions', 'exams', 'lecturers', 'grades', 'report', 'gl_docs', 'gl_surveys', 'gl_drafts', 'gl_meetings', 'gl_experts', 'gl_legal_lib'].includes(k)),
      isManager: false,
    },
    program_officer: {
      roleId: 'program_officer',
      name: 'Điều phối viên / Hậu cần',
      tabs: ['work', 'list', 'board', 'timeline', 'progress', 'activity'],
      modules: projMods.filter((k) => ['docs', 'sessions', 'lecturers', 'trips', 'transfers', 'expenses', 'tickets', 'report', 'gl_docs', 'gl_meetings', 'gl_trips', 'gl_finance'].includes(k)),
      isManager: false,
    },
    lecturer: {
      roleId: 'lecturer',
      name: 'Giảng viên / Chuyên gia',
      tabs: ['work', 'list', 'progress'],
      modules: projMods.filter((k) => ['sessions', 'trips', 'grades', 'docs', 'gl_drafts', 'gl_meetings', 'gl_experts', 'gl_legal_lib'].includes(k)),
      isManager: false,
    },
    member: {
      roleId: 'member',
      name: 'Thành viên dự án',
      tabs: ['work', 'list', 'board', 'timeline', 'progress'],
      modules: projMods.filter((k) => ['docs', 'report', 'gl_docs', 'gl_legal_lib'].includes(k)),
      isManager: false,
    },
  }
}

/**
 * Chuẩn hóa role từ dữ liệu cũ sang hệ thống mới
 */
export function normalizeRole(role) {
  if (!role) return ROLES.PROGRAM_OFFICER
  if (role === 'admin' || role === 'super_admin') return ROLES.SUPER_ADMIN
  if (role === 'academic_admin') return ROLES.ACADEMIC_ADMIN
  if (role === 'program_officer') return ROLES.PROGRAM_OFFICER
  if (role === 'lecturer') return ROLES.LECTURER
  if (role === 'manager') return ROLES.MANAGER
  if (role === 'member') return ROLES.MEMBER
  return role
}

/**
 * Lấy cấu hình chi tiết vai trò
 */
export function getRoleConfig(role, project = null) {
  if (project?.rolePermissions && project.rolePermissions[role]) {
    const pRole = project.rolePermissions[role]
    const base = ROLE_DETAILS[role] || ROLE_DETAILS.member
    return {
      ...base,
      ...pRole,
      viName: pRole.name || base.viName,
      name: pRole.name || base.name,
      shortName: pRole.shortName || base.shortName || pRole.name,
    }
  }
  const norm = normalizeRole(role)
  return ROLE_DETAILS[norm] || ROLE_DETAILS.program_officer
}

/**
 * Lấy vai trò cụ thể của user trong một dự án
 */
export function getUserProjectRole(project, user) {
  if (!project || !user) return null
  if (user.status === USER_STATUS.PENDING || user.status === USER_STATUS.REJECTED) return null
  if (normalizeRole(user.role) === ROLES.SUPER_ADMIN) return ROLES.SUPER_ADMIN
  const member = project.members?.find((m) => m.userId === user.id)
  if (!member) return null
  return member.role || ROLES.MEMBER
}

/**
 * Kiểm tra xem user có phải Quản lý trong dự án không
 */
export function isProjectManager(project, user) {
  if (!project || !user) return false
  if (user.status === USER_STATUS.PENDING || user.status === USER_STATUS.REJECTED) return false
  if (normalizeRole(user.role) === ROLES.SUPER_ADMIN) return true
  const role = getUserProjectRole(project, user)
  if (role === 'manager') return true
  if (project.rolePermissions?.[role]?.isManager) return true
  return false
}

/**
 * Kiểm tra xem user có quyền truy cập phân hệ (module) nghiệp vụ hay không
 * Hỗ trợ phân quyền linh hoạt theo từng dự án (Project-level RBAC)
 */
export function canAccessModule(user, moduleId, project = null) {
  if (!user) return false
  if (user.status === USER_STATUS.PENDING || user.status === USER_STATUS.REJECTED) return false
  const userGlobalRole = normalizeRole(user.role)
  if (userGlobalRole === ROLES.SUPER_ADMIN) return true

  // Mapping phân hệ tùy biến về phân hệ lõi tương đương
  const baseMapping = {
    gl_docs: 'docs',
    gl_surveys: 'report',
    gl_drafts: 'docs',
    gl_meetings: 'sessions',
    gl_trips: 'trips',
    gl_experts: 'lecturers',
    gl_legal_lib: 'docs',
    gl_finance: 'expenses',
  }
  const baseKey = baseMapping[moduleId] || moduleId

  if (project) {
    const pRole = getUserProjectRole(project, user)
    if (!pRole) return false
    if (pRole === ROLES.SUPER_ADMIN || pRole === 'manager') return true

    const projPermissions = project.rolePermissions || getDefaultRolePermissions(project)
    const roleCfg = projPermissions[pRole]
    if (roleCfg) {
      if (roleCfg.isManager) return true
      const allowedModules = roleCfg.modules || []
      if (allowedModules.includes('*') || allowedModules.includes(moduleId) || (baseKey && allowedModules.includes(baseKey))) {
        return true
      }
      return false
    }
  }

  // Fallback theo vai trò toàn cục nếu không có project hoặc chưa tùy biến
  const cfg = ROLE_DETAILS[userGlobalRole]
  if (!cfg) return false
  if (cfg.modules.includes('*') || cfg.modules.includes(moduleId)) return true
  if (baseKey && cfg.modules.includes(baseKey)) return true
  return false
}

/**
 * Kiểm tra xem user có quyền truy cập tab dự án hay không
 * Hỗ trợ phân quyền linh hoạt theo từng dự án
 */
export function canAccessProjectTab(user, tabId, project = null) {
  if (!user) return false
  if (user.status === USER_STATUS.PENDING || user.status === USER_STATUS.REJECTED) return false
  const userGlobalRole = normalizeRole(user.role)
  if (userGlobalRole === ROLES.SUPER_ADMIN) return true

  if (project) {
    const pRole = getUserProjectRole(project, user)
    if (!pRole) return false
    if (pRole === ROLES.SUPER_ADMIN || pRole === 'manager') return true

    const projPermissions = project.rolePermissions || getDefaultRolePermissions(project)
    const roleCfg = projPermissions[pRole]
    if (roleCfg) {
      if (roleCfg.isManager) return true
      const tabs = roleCfg.tabs || []
      if (tabId === 'progress') return tabs.includes('overview') || tabs.includes('progress')
      return tabs.includes(tabId)
    }
  }

  const cfg = ROLE_DETAILS[userGlobalRole]
  if (!cfg) return false
  if (tabId === 'progress') return cfg.tabs.includes('overview') || cfg.tabs.includes('progress')
  return cfg.tabs.includes(tabId)
}

/**
 * Quyền phê duyệt thành viên đăng ký (chỉ Super Admin)
 */
export function canApproveMembers(user) {
  if (!user) return false
  return normalizeRole(user.role) === ROLES.SUPER_ADMIN && user.status !== USER_STATUS.PENDING
}

/**
 * Quyền quản lý phân quyền và người dùng
 */
export function canManageRoles(user) {
  if (!user) return false
  return normalizeRole(user.role) === ROLES.SUPER_ADMIN && user.status !== USER_STATUS.PENDING
}

/**
 * Quyền chỉnh sửa cấu hình dự án
 */
export function canManageProject(user, project) {
  if (!user || !project) return false
  if (normalizeRole(user.role) === ROLES.SUPER_ADMIN) return true
  return project.members?.some((m) => m.userId === user.id && m.role === 'manager')
}

/**
 * Kiểm tra user có đang ở trạng thái Chờ duyệt
 */
export function isPendingUser(user) {
  return user?.status === USER_STATUS.PENDING
}

/**
 * Kiểm tra user có bị từ chối
 */
export function isRejectedUser(user) {
  return user?.status === USER_STATUS.REJECTED
}
