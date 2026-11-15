/**
 * Hệ thống Phân quyền theo vai trò (RBAC - Role-Based Access Control)
 * Dành cho hệ thống UEH WorkHub điều phối chương trình đào tạo quốc tế
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ACADEMIC_ADMIN: 'academic_admin',
  PROGRAM_OFFICER: 'program_officer',
  LECTURER: 'lecturer',
}

export const USER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
}

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
    tabs: ['work', 'workflows', 'curriculum', 'checklist', 'list', 'board', 'timeline', 'overview', 'activity', 'members'],
    canApproveMembers: true,
    canManageProjects: true,
    canManageRoles: true,
    canEditCurriculum: true,
    canEditFinance: true,
    canEditGrades: true,
    canManageFlights: true,
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
    tabs: ['work', 'workflows', 'curriculum', 'checklist', 'list', 'board', 'timeline', 'overview', 'activity', 'members'],
    canApproveMembers: false,
    canManageProjects: false,
    canManageRoles: false,
    canEditCurriculum: true,
    canEditFinance: false,
    canEditGrades: true,
    canManageFlights: false,
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
    tabs: ['work', 'workflows', 'list', 'board', 'timeline', 'overview', 'activity', 'members'],
    canApproveMembers: false,
    canManageProjects: false,
    canManageRoles: false,
    canEditCurriculum: false,
    canEditFinance: true,
    canEditGrades: false,
    canManageFlights: true,
  },
  lecturer: {
    id: 'lecturer',
    name: 'Lecturer',
    viName: 'Giảng viên',
    shortName: 'Giảng viên',
    color: '#7c3aed',
    bg: '#f3e8ff',
    borderColor: '#ddd6fe',
    icon: 'BookOpen',
    desc: 'Xem lịch giảng cá nhân, thông tin chuyến công tác & đón tiễn, tải đề cương/tài liệu và nhập/gửi bảng điểm học phần phụ trách.',
    modules: ['sessions', 'trips', 'grades', 'docs'],
    tabs: ['work', 'list', 'overview'],
    canApproveMembers: false,
    canManageProjects: false,
    canManageRoles: false,
    canEditCurriculum: false,
    canEditFinance: false,
    canEditGrades: true, // Chỉ nhập điểm học phần
    canManageFlights: false,
  },
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
  if (role === 'member') return ROLES.PROGRAM_OFFICER
  return role
}

/**
 * Lấy cấu hình chi tiết vai trò
 */
export function getRoleConfig(role) {
  const norm = normalizeRole(role)
  return ROLE_DETAILS[norm] || ROLE_DETAILS.program_officer
}

/**
 * Kiểm tra xem user có quyền truy cập phân hệ (module) nghiệp vụ hay không
 */
export function canAccessModule(user, moduleId) {
  if (!user) return false
  if (user.status === USER_STATUS.PENDING || user.status === USER_STATUS.REJECTED) return false
  const role = normalizeRole(user.role)
  if (role === ROLES.SUPER_ADMIN) return true
  const cfg = ROLE_DETAILS[role]
  if (!cfg) return false
  if (cfg.modules.includes(moduleId)) return true

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
  const baseKey = baseMapping[moduleId]
  if (baseKey && cfg.modules.includes(baseKey)) return true
  return false
}

/**
 * Kiểm tra xem user có quyền truy cập tab dự án hay không
 */
export function canAccessProjectTab(user, tabId) {
  if (!user) return false
  if (user.status === USER_STATUS.PENDING || user.status === USER_STATUS.REJECTED) return false
  const role = normalizeRole(user.role)
  const cfg = ROLE_DETAILS[role]
  if (!cfg) return false
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
