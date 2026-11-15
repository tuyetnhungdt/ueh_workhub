import { DEFAULT_CATEGORIES, DEFAULT_TAGS, addDays, toISODate } from '../lib/utils.js'
import { RENNES_STREAMS, CURRENT_TASKS, LEGACY_CHECKLIST, COHORTS, TEACHING_GROUPS } from './rennes.js'
import { buildItems, buildGiaLaiItems, buildAdmissionsItems } from '../modules/seedItems.js'
import { ROLES, USER_STATUS, getDefaultRolePermissions } from './rbac.js'

// Dữ liệu mẫu (nhân sự là tên giả định) – ngày được tính tương đối theo hôm nay để demo luôn "sống".
export const SEED_USERS = [
  { id: 'u1', name: 'TS. Tô Công Nguyên Bảo', email: 'baotcn@ueh.edu.vn', role: ROLES.SUPER_ADMIN, status: USER_STATUS.ACTIVE, title: 'Quản lý dự án', color: '#03616a' },
  { id: 'u2', name: 'ThS. Nguyễn Văn Thiện Tâm', email: 'tamnvt@ueh.edu.vn', role: ROLES.ACADEMIC_ADMIN, status: USER_STATUS.ACTIVE, title: 'Nhân sự chính', color: '#d4712f' },
  { id: 'u3', name: 'ThS. Hoàng Thị Phương Anh', email: 'anhhtp@ueh.edu.vn', role: ROLES.PROGRAM_OFFICER, status: USER_STATUS.ACTIVE, title: 'Nhân sự chính', color: '#2563eb' },
  { id: 'u4', name: 'Đào Thị Tuyết Nhung', email: 'tuyetnhungdt@ueh.edu.vn', role: ROLES.ASSISTANT, status: USER_STATUS.ACTIVE, title: 'Trợ lý', color: '#0891b2' },
  { id: 'u5', name: 'Võ Thanh Tùng', email: 'thanhtung@ueh.demo', role: ROLES.PROGRAM_OFFICER, status: USER_STATUS.ACTIVE, title: 'Nhân sự chính', color: '#0891b2' },
  { id: 'u6', name: 'Đặng Mai Phương', email: 'maiphuong@ueh.demo', role: ROLES.PROGRAM_OFFICER, status: USER_STATUS.ACTIVE, title: 'Nhân sự chính', color: '#db2777' },
  { id: 'u7', name: 'Hoàng Gia Huy', email: 'giahuy@ueh.demo', role: ROLES.PROGRAM_OFFICER, status: USER_STATUS.ACTIVE, title: 'Nhân sự chính', color: '#16a34a' },
  { id: 'u8', name: 'Đỗ Minh Hạnh', email: 'minhhanh.do@ueh.demo', role: ROLES.ASSISTANT, status: USER_STATUS.ACTIVE, title: 'Trợ lý', color: '#0891b2' },
  {
    id: 'u9',
    name: 'Phan Văn Nam',
    email: 'nam.phan@ueh.demo',
    role: ROLES.PROGRAM_OFFICER,
    status: USER_STATUS.PENDING,
    title: 'Nhân sự chính',
    color: '#8b5cf6',
    requestedRole: ROLES.PROGRAM_OFFICER,
    requestedProjectIds: ['p1'],
    registeredAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    note: 'Đăng ký tham gia phụ trách công tác điều phối học vụ song bằng.',
  },
  {
    id: 'u10',
    name: 'Ngô Thanh Vân',
    email: 'thanhvan.ngo@ueh.edu.vn',
    role: ROLES.PROGRAM_OFFICER,
    status: USER_STATUS.PENDING,
    title: 'Nhân sự chính',
    color: '#06b6d4',
    requestedRole: ROLES.PROGRAM_OFFICER,
    requestedProjectIds: ['p1', 'p2'],
    registeredAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    note: 'Tiếp nhận công tác hậu cần, đón tiễn và điều phối khách sạn cho các đoàn công tác.',
  },
  {
    id: 'u11',
    name: 'Lê Hoàng Minh',
    email: 'minh.lh@external.partner.vn',
    role: ROLES.ASSISTANT,
    status: USER_STATUS.REJECTED,
    title: 'Trợ lý',
    color: '#64748b',
    requestedRole: ROLES.ASSISTANT,
    requestedProjectIds: ['p1'],
    registeredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    rejectedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    rejectedBy: 'u1',
    rejectionReason: 'Chưa cung cấp đủ hồ sơ lý lịch khoa học và hợp đồng cộng tác viên theo quy định của UEH-ISB.',
    note: 'Đăng ký hỗ trợ giảng dạy môn Tài chính quốc tế.',
  },
]

export const SEED_V = 40 // tăng khi dữ liệu mẫu đổi cấu trúc → bản demo tự làm mới

export function buildSeed() {
  const now = Date.now()
  const iso = (minsAgo) => new Date(now - minsAgo * 60000).toISOString()

  // Helper tính ngày theo thứ trong tuần hiện tại (0 = Thứ 2, 1 = Thứ 3, ..., 6 = Chủ Nhật)
  const getThisWeekDay = (dayIndex) => {
    const d = new Date(now)
    const currentDayOfWeek = (d.getDay() + 6) % 7 // 0 = Thứ 2, 6 = Chủ Nhật
    d.setDate(d.getDate() - currentDayOfWeek + dayIndex)
    return toISODate(d)
  }
  const getNextWeekDay = (dayIndex) => {
    const d = new Date(now)
    const currentDayOfWeek = (d.getDay() + 6) % 7
    d.setDate(d.getDate() - currentDayOfWeek + 7 + dayIndex)
    return toISODate(d)
  }
  const getLastWeekDay = (dayIndex) => {
    const d = new Date(now)
    const currentDayOfWeek = (d.getDay() + 6) % 7
    d.setDate(d.getDate() - currentDayOfWeek - 7 + dayIndex)
    return toISODate(d)
  }
  const projects = [
    {
      id: 'p1',
      name: 'Song bằng UEH – Rennes',
      code: 'UEHR-2026',
      description: 'Cử nhân song bằng UEH – Université de Rennes. Điều phối 10 hạng mục vận hành: hành chính, học vụ, khảo thí, giảng viên, hậu cần, tài chính, công tác sinh viên và dữ liệu.',
      color: '#ea580c',
      startDate: addDays(-60),
      endDate: addDays(120),
      createdBy: 'u1',
      createdAt: iso(60 * 24 * 60),
      cohorts: COHORTS,
      teachingGroups: TEACHING_GROUPS,
      members: [
        { userId: 'u1', role: 'manager' },
        { userId: 'u2', role: 'academic_admin' },
        { userId: 'u3', role: 'program_officer' },
        { userId: 'u4', role: 'assistant' },
      ],
      rolePermissions: getDefaultRolePermissions({ id: 'p1' }),
      categories: DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        ownerId: {
          c01: 'u2',
          c02: 'u2',
          c03: 'u2',
          c04: 'u2',
          c05: 'u2',
          c06: 'u3',
          c07: 'u3',
          c08: 'u3',
          c09: 'u3',
          c10: 'u3',
        }[c.id] || 'u2',
      })),
      assistantAssignments: {
        c01: 'u4',
        c02: 'u4',
        c03: 'u4',
        c04: 'u4',
        c05: 'u4',
        c06: 'u4',
        c07: 'u4',
        c08: 'u4',
        c09: 'u4',
        c10: 'u4',
      },
      tags: DEFAULT_TAGS.map((t) => ({ ...t })),
      joinCode: 'RNS6-K7QA',
    },
    {
      id: 'p2',
      name: 'Tuyển sinh K53 – Song bằng',
      code: 'TS53-2026',
      description: 'Chiến dịch tuyển sinh khóa K53 chương trình cử nhân song bằng: truyền thông, tư vấn, hồ sơ và nhập học.',
      color: '#ea580c',
      startDate: addDays(-20),
      endDate: addDays(75),
      createdBy: 'u1',
      createdAt: iso(20 * 24 * 60),
      members: [
        { userId: 'u1', role: 'manager' },
        { userId: 'u6', role: 'program_officer' },
        { userId: 'u7', role: 'program_officer' },
      ],
      rolePermissions: getDefaultRolePermissions({ id: 'p2' }),
      categories: [
        { id: 'k1', no: '01', name: 'Truyền thông tuyển sinh', icon: 'Megaphone' },
        { id: 'k2', no: '02', name: 'Tư vấn & sự kiện', icon: 'MessagesSquare' },
        { id: 'k3', no: '03', name: 'Hồ sơ & nhập học', icon: 'FileText' },
      ],
      joinCode: 'K53T-2M9X',
      tags: [{ id: 'tg1', name: 'MKT', color: '#16a34a' }, { id: 'tg2', name: 'Sự kiện', color: '#d4712f' }, { id: 'tg3', name: 'Thiết kế', color: '#ca8a04' }],
    },
    {
      id: 'p3',
      name: 'Đầu tư mạo hiểm Gia Lai',
      code: 'QDTMH-GL1',
      partner: 'UBND Tỉnh Gia Lai – Sở Khoa học & Công nghệ – UEH',
      objective: 'Hoàn thiện hồ sơ Đề án, Tờ trình và dự thảo Nghị quyết thành lập Quỹ.',
      description: 'Dự án Tư vấn: Xây dựng Đề án Thành lập Quỹ Đầu tư Mạo hiểm tỉnh Gia Lai. Đơn vị phối hợp: UBND Tỉnh Gia Lai – Sở Khoa học & Công nghệ – UEH. Mục tiêu: Hoàn thiện hồ sơ Đề án, Tờ trình và dự thảo Nghị quyết thành lập Quỹ.',
      color: '#ea580c',
      startDate: addDays(-30),
      endDate: addDays(60),
      createdBy: 'u1',
      createdAt: iso(30 * 24 * 60),
      members: [
        { userId: 'u1', role: 'manager' },
        { userId: 'u2', role: 'academic_admin' },
        { userId: 'u3', role: 'program_officer' },
        { userId: 'u5', role: 'program_officer' },
        { userId: 'u7', role: 'academic_admin' },
      ],
      rolePermissions: getDefaultRolePermissions({ id: 'p3' }),
      categories: [
        { id: 'gl01', no: '01', name: 'Văn bản & Thư viện Pháp lý', icon: 'FileText', ownerId: 'u1' },
        { id: 'gl02', no: '02', name: 'Khảo sát & Dữ liệu Đầu vào', icon: 'Database', ownerId: 'u7' },
        { id: 'gl03', no: '03', name: 'Soạn thảo & Biên tập Đề án', icon: 'BookOpenCheck', ownerId: 'u2' },
        { id: 'gl04', no: '04', name: 'Lịch làm việc & Đoàn công tác', icon: 'CalendarClock', ownerId: 'u1' },
        { id: 'gl05', no: '05', name: 'Nhóm Chuyên gia & Phân công Biên soạn', icon: 'UsersRound', ownerId: 'u1' },
        { id: 'gl06', no: '06', name: 'Chi phí & Quyết toán Hợp đồng Tư vấn', icon: 'Calculator', ownerId: 'u3' },
      ],
      joinCode: 'GLVF-2026',
      tags: [
        { id: 'glt1', name: 'Pháp lý', color: '#0284c7' },
        { id: 'glt2', name: 'Vốn mồi', color: '#d97706' },
        { id: 'glt3', name: 'Hậu cần Pleiku', color: '#059669' },
        { id: 'glt4', name: 'PII Gia Lai', color: '#7c3aed' },
      ],
      modulesConfig: [
        { moduleKey: 'gl_docs', isEnabled: true, customTitle: 'Văn bản & Thư viện Pháp lý', customDesc: 'Công văn đi/đến (Sở KH&CN, Sở Tài chính), Tờ trình UBND tỉnh, Thư viện pháp lý (Luật, Nghị định 365/366, Nghị quyết HĐND) và tài liệu tham khảo.', customIcon: 'FileText', sortOrder: 1 },
        { moduleKey: 'gl_surveys', isEnabled: true, customTitle: 'Khảo sát & Dữ liệu Đầu vào', customDesc: 'Báo cáo số liệu các sở ngành gửi lại Sở KH&CN, chỉ số PII, báo cáo KTXH Gia Lai, số liệu DN & HTX.', customIcon: 'Database', sortOrder: 2 },
        { moduleKey: 'gl_drafts', isEnabled: true, customTitle: 'Soạn thảo & Biên tập Đề án', customDesc: 'Phiên bản đề cương, Dự thảo Đề án v1.0, v6.3, Bản tóm tắt rút gọn, Bản chuẩn format UEH và link Google Docs trực tuyến.', customIcon: 'BookOpenCheck', sortOrder: 3 },
        { moduleKey: 'gl_meetings', isEnabled: true, customTitle: 'Lịch làm việc & Đoàn công tác', customDesc: 'Lịch làm việc trực tiếp tại Tỉnh, Hội thảo tham vấn chuyên gia và Hậu cần công tác Pleiku (vé máy bay, khách sạn, xe đưa đón).', customIcon: 'CalendarClock', sortOrder: 4 },
        { moduleKey: 'gl_experts', isEnabled: true, customTitle: 'Nhóm Chuyên gia & Phân công Biên soạn', customDesc: 'Danh sách chuyên gia tư vấn UEH, phân công phụ trách phần đề án: Cơ sở pháp lý, Mô hình vận hành quỹ, Cơ chế thoái vốn...', customIcon: 'UsersRound', sortOrder: 5 },
        { moduleKey: 'gl_finance', isEnabled: true, customTitle: 'Chi phí & Quyết toán Hợp đồng Tư vấn', customDesc: 'Tạm ứng, thù lao viết chuyên đề, công tác phí khảo sát, hồ sơ thanh quyết toán với Sở KH&CN.', customIcon: 'Calculator', sortOrder: 6 },
      ],
    },
  ]

  const tasks = []
  // ---- p1: 40 đầu việc thường xuyên (stream) + các đợt thực hiện (run) ----
  let n = 0
  for (const [cat, list] of Object.entries(RENNES_STREAMS)) {
    list.forEach(([title, cadence, owner, tag, sop, runs], i) => {
      n++
      const sid = 's' + String(n).padStart(2, '0')
      tasks.push({
        id: sid, projectId: 'p1', categoryId: cat, title, isStream: true, cadence, ownerId: owner, sop,
        description: '', assigneeIds: [owner], createdBy: 'u1', priority: 'medium', status: 'doing',
        startDate: null, dueDate: null, checklist: [], tagIds: tag ? [tag] : [], parentId: null,
        createdAt: iso(60 * 24 * 60), updatedAt: iso(60 * 24 * (n % 9)), completedAt: null,
      })
      runs.forEach(([rt, who, status, due, priority, doneSteps], j) => {
        const rid = sid + 'r' + (j + 1)
        const targetDue = status === 'done'
          ? (due < 0 ? addDays(due) : getThisWeekDay(j % 2))
          : (due >= 0 && due <= 6 ? getThisWeekDay(due) : (due > 6 && due <= 13 ? getNextWeekDay(due - 7) : addDays(due)))
        tasks.push({
          id: rid, projectId: 'p1', categoryId: cat, title: rt, parentId: sid,
          description: '', assigneeIds: [who], createdBy: ['u1', 'u2'].includes(owner) ? 'u1' : 'u2',
          priority, status, startDate: addDays(due - 5 - ((n + j) % 8)), dueDate: targetDue,
          checklist: sop.map((text, k) => ({ id: rid + 'c' + k, text, done: k < doneSteps })),
          tagIds: tag ? [tag] : [],
          createdAt: iso(60 * 24 * (3 + ((n * 7 + j) % 26))), updatedAt: iso(60 * (n * 3 + j)),
          completedAt: status === 'done' ? iso(60 * 24 * (1 + ((n + j) % 12))) : null,
        })
      })
    })
  }
  const byTitle = (t) => tasks.find((x) => x.title.startsWith(t))?.id
  const T_ACC = byTitle('Cấp tài khoản LMS')
  const T_TRIP = byTitle('Đoàn GV Rennes tháng 12')
  const T_PLAN = byTitle('Kế hoạch đào tạo năm học')
  const T_CONTRACT = byTitle('Hợp đồng thỉnh giảng đợt 2')
  const T_DASH = byTitle('Cập nhật dashboard') || byTitle('Cập nhật số liệu') || 's40r1'
  if (T_ACC) { const it = tasks.find((t) => t.id === T_ACC); if (it) it.description = 'Tạo tài khoản LMS và email Rennes cho toàn bộ SV K52 đã đăng ký song bằng. Gửi file danh sách theo mẫu của Rennes, kiểm tra lại các trường hợp sai thông tin.' }
  if (T_TRIP) { const it = tasks.find((t) => t.id === T_TRIP); if (it) it.description = 'Đoàn 2 giảng viên Rennes sang giảng học phần Marketing quốc tế. Chốt vé khứ hồi, khách sạn gần cơ sở B và thư mời phục vụ xin visa.' }
  if (T_CONTRACT) { const it = tasks.find((t) => t.id === T_CONTRACT); if (it) it.description = 'Hoàn thiện hồ sơ giảng viên đợt 2 (CV, bằng cấp, hộ chiếu) và trình ký hợp đồng thỉnh giảng.' }

  // ---- 34 công việc thực tế từ gói bàn giao Rennes v1.0 (27 việc vận hành + 7 hành chính) ----
  // Phân loại chính xác vào 40 đầu việc thường xuyên (stream s01..s40) theo đúng 10 hạng mục vận hành Fig 3
  const OP_STREAM_MAP = {
    'OP-001': 's09', // Kế hoạch đào tạo
    'OP-002': 's14', // Quy đổi điểm & Tín chỉ
    'OP-003': 's37', // Quản trị dữ liệu
    'OP-004': 's25', // Nghĩa vụ học phí
    'OP-005': 's18', // Hồ sơ & Hợp đồng
    'OP-006': 's18', // Hồ sơ & Hợp đồng
    'OP-007': 's31', // Lưu trữ chứng từ
    'OP-008': 's21', // Vé máy bay, KS & Visa
    'OP-009': 's17', // Phân công giảng viên
    'OP-010': 's21', // Vé máy bay, KS & Visa
    'OP-011': 's21', // Vé máy bay, KS & Visa
    'OP-012': 's34', // Khảo sát & Phản hồi
    'OP-013': 's09', // Kế hoạch đào tạo
    'OP-014': 's33', // Chăm sóc sinh viên
    'OP-015': 's31', // Lưu trữ chứng từ
    'OP-016': 's10', // Lịch giảng & Phòng học
    'OP-017': 's04', // Điều hành và theo dõi
    'OP-018': 's36', // Cải tiến chất lượng
    'OP-019': 's21', // Vé máy bay, KS & Visa
    'OP-020': 's39', // Tiến độ & Rủi ro
    'OP-021': 's06', // Hồ sơ & Đăng ký
    'OP-022': 's11', // Trùng lịch & Pre-course
    'OP-023': 's07', // Tài khoản & Email
    'OP-024': 's10', // Lịch giảng & Phòng học
    'OP-025': 's10', // Lịch giảng & Phòng học
    'OP-026': 's38', // Báo cáo định kỳ
    'OP-027': 's10', // Lịch giảng & Phòng học
    'ADM-001': 's09', // Kế hoạch đào tạo
    'ADM-002': 's33', // Chăm sóc sinh viên
    'ADM-003': 's33', // Chăm sóc sinh viên
    'ADM-004': 's27', // Đề nghị chuyển tiền
    'ADM-005': 's12', // Theo dõi & Điều chỉnh
    'ADM-006': 's14', // Quy đổi điểm & Tín chỉ
    'ADM-007': 's02', // Văn bản xác nhận
  }

  CURRENT_TASKS.forEach((t, i) => {
    const id = 'task_' + (t.external_ref ? t.external_ref.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'op_' + (i + 1))
    const catCodeNum = parseInt(t.category_code, 10) || 1
    const catId = 'c' + String(catCodeNum).padStart(2, '0')
    const ownerId = {
      c01: 'u2',
      c02: 'u2',
      c03: 'u2',
      c04: 'u2',
      c05: 'u2',
      c06: 'u3',
      c07: 'u3',
      c08: 'u3',
      c09: 'u3',
      c10: 'u3',
    }[catId] || 'u2'
    const p = t.priority === 'P0' ? 'urgent' : t.priority === 'P1' ? 'high' : t.priority === 'P2' ? 'medium' : 'low'
    const st = t.status === 'Hoàn tất' ? 'done' : t.status === 'Đang thực hiện' ? 'doing' : t.status === 'Chờ duyệt' ? 'review' : 'todo'
    const tag = t.teaching_group === 'K50–K51' ? 'tg5' : t.teaching_group === 'K52' ? 'tg1' : null
    const parentStreamId = OP_STREAM_MAP[t.external_ref] || ('s' + String((catCodeNum - 1) * 4 + 1).padStart(2, '0'))

    // Quản lý u1 tham gia đồng phân công các đầu việc trọng tâm, Trợ lý u4 hỗ trợ
    const isLeadership = ['c01', 'c03', 'c06', 'c07', 'c10'].includes(catId)
    const assignees = isLeadership && (i % 2 === 0) ? ['u1', ownerId] : [ownerId]
    if (i % 3 === 0 && !assignees.includes('u4')) {
      assignees.push('u4')
    }

    const calculatedDue = st === 'done'
      ? (i % 2 === 0 ? getThisWeekDay(0) : getLastWeekDay(2))
      : (i % 4 === 0 ? getThisWeekDay(i % 7) : (i % 4 === 1 ? getNextWeekDay(i % 7) : addDays(3 + (i % 18))))

    tasks.push({
      id,
      projectId: 'p1',
      externalRef: t.external_ref,
      categoryId: catId,
      title: t.title,
      teachingGroup: t.teaching_group || 'Chung',
      cohortScope: t.cohort_scope || '',
      description: t.verification ? `[Tiến độ/Xác minh]: ${t.verification}${t.follow_up ? `\n[Follow-up]: ${t.follow_up}` : ''}` : '',
      verification: t.verification || '',
      followUp: t.follow_up || '',
      sourceStatus: t.status,
      sourceTable: t.source_table,
      assigneeIds: assignees,
      createdBy: 'u1',
      priority: p,
      status: st,
      startDate: addDays(-10),
      dueDate: calculatedDue,
      checklist: [],
      tagIds: tag ? [tag] : [],
      parentId: parentStreamId,
      createdAt: iso(60 * 24 * 10),
      updatedAt: iso(60 * 24 * 2),
      completedAt: st === 'done' ? iso(60 * 24 * 3) : null,
      isStream: false,
    })
  })

  // ---- 56 đầu việc đối soát từ Checklist K50–K51 (có 18 dòng cờ mâu thuẫn) ----
  const checklist = LEGACY_CHECKLIST.map((c) => ({
    id: c.source_task_code,
    projectId: 'p1',
    sourceCode: c.source_task_code,
    legacyGroup: c.legacy_group,
    title: c.task_title,
    detail: c.detail,
    legacyRole: c.legacy_owner_role,
    timelineOriginal: c.timeline_original,
    sourceStatus: c.source_status,
    priority: c.priority_source,
    semester: c.semester_source,
    sourceProgressPct: c.progress_source_pct,
    categoryCode: c.category_code,
    categoryId: 'c' + String(c.category_code).padStart(2, '0'),
    verificationStatus: c.verification_status, // 'Chờ đối chiếu'
    progressConflict: c.progress_conflict,
    conflictReason: c.progress_conflict ? 'Tiến độ nguồn ghi 100% nhưng cần xác minh tài liệu & chứng từ thực tế theo tiêu chí nghiệm thu' : '',
    sourceType: c.source_type,
    relatedLiveTask: c.related_live_task,
    notes: '',
  }))

  // ---- p2: dự án tuyển sinh (việc lẻ, không theo đầu việc) ----
  const k = [
    ['k1', 'Lên kế hoạch truyền thông đa kênh K53', 'u7', 'done', 0, 'high', ['tg1']],
    ['k1', 'Sản xuất video giới thiệu chương trình song bằng', 'u7', 'doing', 3, 'medium', ['tg1', 'tg3']],
    ['k2', 'Tổ chức Open Day song bằng & tư vấn học bổng', 'u6', 'doing', 5, 'high', ['tg2']],
    ['k2', 'Trả lời tư vấn fanpage & hotline giải đáp hồ sơ', 'u6', 'doing', 1, 'medium', []],
    ['k3', 'Chuẩn bị bộ hồ sơ nhập học và hướng dẫn nộp lệ phí', 'u6', 'doing', 4, 'medium', []],
    ['k3', 'Kiểm tra chứng chỉ ngoại ngữ IELTS thí sinh nộp sớm', 'u8', 'doing', 2, 'medium', ['tg1']],
  ]
  k.forEach(([cat, title, a, status, due, priority, tagIds], i) => {
    const dueDay = status === 'done' ? getThisWeekDay(0) : getThisWeekDay(due % 7)
    tasks.push({
      id: 'k' + (i + 1), projectId: 'p2', categoryId: cat, title, description: '', assigneeIds: [a], createdBy: 'u1',
      priority, status, startDate: addDays(-7), dueDate: dueDay, checklist: [], tagIds, parentId: null,
      createdAt: iso(60 * 24 * 7), updatedAt: iso(60 * 24), completedAt: status === 'done' ? iso(60 * 24 * 5) : null,
    })
  })

  // ---- p3: Dự án tư vấn Quỹ ĐTMH Gia Lai ----
  const glTasksData = [
    ['gl01', 'Phúc đáp công văn 11578/STC của Sở Tài chính về phương án vốn mồi', 'u1', 'doing', 1, 'urgent', ['glt1', 'glt2']],
    ['gl01', 'Hoàn thiện dự thảo Tờ trình UBND tỉnh trình HĐND ban hành Nghị quyết', 'u1', 'done', 0, 'high', ['glt1']],
    ['gl02', 'Đôn đốc thu thập đủ 120 phiếu khảo sát DN/HTX và làm sạch số liệu PII', 'u7', 'doing', 2, 'high', ['glt4']],
    ['gl02', 'Rà soát danh sách nhà đầu tư hạt giống A1–A3 với Hội Doanh nhân trẻ', 'u7', 'todo', 4, 'medium', ['glt2']],
    ['gl03', 'Hoàn thiện tích hợp Dự thảo Đề án v1.0 từ 5 chuyên đề chuyên gia UEH', 'u2', 'review', 3, 'urgent', ['glt1']],
    ['gl03', 'Biên tập bản tóm tắt rút gọn phục vụ báo cáo Thường trực Tỉnh ủy', 'u2', 'doing', 5, 'medium', []],
    ['gl04', 'Chuẩn bị nội dung làm việc trực tiếp với Thường trực UBND Tỉnh tại Pleiku', 'u1', 'doing', 4, 'high', ['glt3']],
    ['gl04', 'Lên kế hoạch và gửi thư mời Hội thảo tham vấn chuyên gia cuối tháng 11', 'u1', 'todo', 9, 'medium', []],
    ['gl04', 'Xác nhận vé máy bay SGN-PXU và phòng khách sạn Pleiku Đoàn công tác Đợt 2', 'u5', 'review', 1, 'urgent', ['glt3']],
    ['gl04', 'Trình phê duyệt phiếu đề nghị vé máy bay và xe đưa đón Đoàn công tác Đợt 3', 'u5', 'todo', 11, 'medium', ['glt3']],
    ['gl05', 'Đôn đốc ThS. Đỗ Thị Quyên nộp chuyên đề Đánh giá hiện trạng KTXH & PII', 'u1', 'todo', 5, 'urgent', ['glt4']],
    ['gl05', 'Rà soát tính đồng bộ giữa phần Điều lệ Quỹ (ThS. Vi) và Mô hình vận hành', 'u2', 'doing', 4, 'high', ['glt1']],
    ['gl01', 'Hệ thống hóa quy định cơ chế bảo toàn vốn nhà nước theo NĐ 366/2025', 'u2', 'done', 0, 'medium', ['glt1']],
    ['gl01', 'Tổng hợp mô hình Quỹ ĐTMH TP.HCM (HCM VIF v6.3) làm phụ lục tham chiếu', 'u2', 'done', -7, 'low', []],
    ['gl06', 'Hoàn tất hồ sơ tạm ứng Đợt 1 (30%) với Kho bạc Nhà nước tỉnh Gia Lai', 'u3', 'done', -10, 'high', ['glt2']],
    ['gl06', 'Thẩm định hồ sơ công tác phí Pleiku Đợt 1 và dự toán công tác phí Đợt 2', 'u3', 'review', 2, 'medium', ['glt3']],
  ]
  glTasksData.forEach(([cat, title, a, status, due, priority, tagIds], i) => {
    const dueDay = status === 'done'
      ? (due < 0 ? addDays(due) : getThisWeekDay(due))
      : (due >= 0 && due <= 6 ? getThisWeekDay(due) : (due > 6 && due <= 13 ? getNextWeekDay(due - 7) : addDays(due)))
    tasks.push({
      id: 'gl_t' + (i + 1), projectId: 'p3', categoryId: cat, title, description: '', assigneeIds: [a], createdBy: 'u1',
      priority, status, startDate: addDays(-7), dueDate: dueDay, checklist: [], tagIds, parentId: null,
      createdAt: iso(60 * 24 * 10), updatedAt: iso(60 * 24), completedAt: status === 'done' ? iso(60 * 24 * 2) : null,
    })
  })

  // ---- ĐẦU VIỆC TRỌNG TÂM THEO TUẦN (WEEKLY FEATURED TASKS) ----
  // Đảm bảo từng ngày trong tuần (Thứ 2 -> Chủ Nhật) và các bộ lọc luôn đầy đủ dữ liệu demo sinh động
  const WEEKLY_FEATURED_TASKS = [
    // --- THỨ 2 ---
    {
      id: 'wf_task_mon_1',
      projectId: 'p1',
      categoryId: 'c01',
      title: 'Họp giao ban điều hành tuần & duyệt kế hoạch đào tạo HK2',
      description: 'Chủ trì họp đầu tuần với toàn bộ ban điều phối học vụ và hậu cần UEH-Rennes.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'high',
      status: 'done',
      startDate: getLastWeekDay(4),
      dueDate: getThisWeekDay(0),
      tagIds: ['tg2', 'tg6'],
      checklist: [{ id: 'c1', text: 'Tổng hợp báo cáo các hạng mục', done: true }, { id: 'c2', text: 'Ban hành kết luận cuộc họp', done: true }],
      completedAt: iso(60 * 24 * 5),
    },
    {
      id: 'wf_task_mon_2',
      projectId: 'p3',
      categoryId: 'gl01',
      title: 'Hoàn thiện dự thảo Tờ trình UBND tỉnh trình HĐND ban hành Nghị quyết Quỹ ĐTMH',
      description: 'Tiếp thu góp ý của Sở Tư pháp và Sở Tài chính, hoàn thiện bản Tờ trình chính thức.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'done',
      startDate: getLastWeekDay(3),
      dueDate: getThisWeekDay(0),
      tagIds: ['glt1'],
      checklist: [{ id: 'c1', text: 'Rà soát căn cứ pháp lý NĐ 365/366', done: true }, { id: 'c2', text: 'Ký nháy bản Tờ trình', done: true }],
      completedAt: iso(60 * 24 * 5),
    },
    {
      id: 'wf_task_mon_3',
      projectId: 'p2',
      categoryId: 'k1',
      title: 'Lên kế hoạch tổng thể truyền thông đa kênh chiến dịch tuyển sinh K53',
      description: 'Phê duyệt phân bổ ngân sách marketing trên Facebook, Google Ads, báo chí và trường THPT.',
      assigneeIds: ['u7'],
      createdBy: 'u1',
      priority: 'high',
      status: 'done',
      startDate: getLastWeekDay(4),
      dueDate: getThisWeekDay(0),
      tagIds: ['tg1'],
      checklist: [{ id: 'c1', text: 'Lập bảng phân bổ chi phí', done: true }, { id: 'c2', text: 'Duyệt key visuals', done: true }],
      completedAt: iso(60 * 24 * 5),
    },

    // --- THỨ 3 ---
    {
      id: 'wf_task_tue_1',
      projectId: 'p1',
      categoryId: 'c01',
      title: 'Ký duyệt phụ lục MOA 2026–2027: phương án điều chỉnh học phí sinh viên',
      description: 'Rà soát mức trần học phí €900/SV/năm và quy chế đồng chi trả, trình BGH ký chính thức.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'doing',
      startDate: getThisWeekDay(0),
      dueDate: getThisWeekDay(1),
      tagIds: ['tg2', 'tg3'],
      checklist: [{ id: 'c1', text: 'Đối chiếu với ĐH Rennes', done: true }, { id: 'c2', text: 'Xin ý kiến Ban Giám hiệu', done: false }],
    },
    {
      id: 'wf_task_tue_2',
      projectId: 'p3',
      categoryId: 'gl01',
      title: 'Phúc đáp công văn 11578/STC của Sở Tài chính về phương án vốn mồi 200 tỷ',
      description: 'Làm rõ cơ chế giải ngân vốn NSNN 30% và phương án bảo toàn vốn theo quy định pháp luật.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'doing',
      startDate: getThisWeekDay(0),
      dueDate: getThisWeekDay(1),
      tagIds: ['glt1', 'glt2'],
      checklist: [{ id: 'c1', text: 'Soạn dự thảo công văn phúc đáp', done: true }, { id: 'c2', text: 'Kèm bảng phụ lục tính toán tài chính', done: false }],
    },
    {
      id: 'wf_task_tue_3',
      projectId: 'p2',
      categoryId: 'k1',
      title: 'Phê duyệt thông điệp truyền thông đa kênh chiến dịch tuyển sinh K53',
      description: 'Chốt thông điệp chính "Cử nhân Song bằng Quốc tế - Bệ phóng Sự nghiệp Toàn cầu".',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'high',
      status: 'doing',
      startDate: getThisWeekDay(0),
      dueDate: getThisWeekDay(1),
      tagIds: ['tg1'],
      checklist: [{ id: 'c1', text: 'Duyệt slogan & thông điệp chính', done: true }, { id: 'c2', text: 'Duyệt layout ấn phẩm', done: false }],
    },
    {
      id: 'wf_task_tue_4',
      projectId: 'p1',
      categoryId: 'c05',
      title: 'Soạn thảo hợp đồng thỉnh giảng đợt 2 cho 03 GV Rennes',
      description: 'Chuẩn bị hợp đồng cho GS. Philippe, TS. Sophie và ThS. Rondeau sang giảng dạy học kỳ 2.',
      assigneeIds: ['u2'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'review',
      startDate: getThisWeekDay(0),
      dueDate: getThisWeekDay(1),
      tagIds: ['tg3', 'tg4'],
      checklist: [{ id: 'c1', text: 'Thu thập thông tin giảng viên', done: true }, { id: 'c2', text: 'Soạn thảo hợp đồng song ngữ', done: true }, { id: 'c3', text: 'Trình quản lý dự án duyệt', done: true }],
    },

    // --- THỨ 4 ---
    {
      id: 'wf_task_wed_1',
      projectId: 'p1',
      categoryId: 'c02',
      title: 'Duyệt danh sách cấp phát tài khoản LMS và email Rennes cho sinh viên K52',
      description: 'Kiểm tra 45 hồ sơ sinh viên đủ điều kiện cấp email @etudiant.univ-rennes.fr và LMS.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'high',
      status: 'doing',
      startDate: getThisWeekDay(1),
      dueDate: getThisWeekDay(2),
      tagIds: ['tg1', 'tg5'],
      checklist: [{ id: 'c1', text: 'Đối chiếu danh sách SV đã đóng học phí', done: true }, { id: 'c2', text: 'Gửi phê duyệt cho IT Rennes', done: false }],
    },
    {
      id: 'wf_task_wed_2',
      projectId: 'p3',
      categoryId: 'gl02',
      title: 'Làm việc với Sở KH&CN Gia Lai về tiến độ thu thập phiếu điều tra PII',
      description: 'Đôn đốc tiến độ 120 phiếu khảo sát doanh nghiệp, hợp tác xã trên địa bàn tỉnh.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'high',
      status: 'doing',
      startDate: getThisWeekDay(1),
      dueDate: getThisWeekDay(2),
      tagIds: ['glt4'],
      checklist: [{ id: 'c1', text: 'Cập nhật tiến độ 92 phiếu đã nộp', done: true }, { id: 'c2', text: 'Đôn đốc 28 phiếu còn lại', done: false }],
    },
    {
      id: 'wf_task_wed_3',
      projectId: 'p3',
      categoryId: 'gl04',
      title: 'Xác nhận vé máy bay SGN-PXU và phòng khách sạn Pleiku Đoàn công tác Đợt 2',
      description: 'Lịch trình đoàn công tác từ 20/11 đến 23/11 làm việc với Thường trực UBND Tỉnh.',
      assigneeIds: ['u5'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'review',
      startDate: getThisWeekDay(0),
      dueDate: getThisWeekDay(2),
      tagIds: ['glt3'],
      checklist: [{ id: 'c1', text: 'Check giá vé máy bay Vietnam Airlines', done: true }, { id: 'c2', text: 'Xác nhận phòng KS Hoàng Anh Gia Lai', done: true }, { id: 'c3', text: 'Trình duyệt phiếu thanh toán', done: true }],
    },

    // --- THỨ 5 ---
    {
      id: 'wf_task_thu_1',
      projectId: 'p1',
      categoryId: 'c07',
      title: 'Rà soát đối soát học phí đợt 1 và thủ tục chuyển tiền SWIFT sang ĐH Rennes',
      description: 'Đối chiếu số dư học phí giai đoạn 2 thu được và lập lệnh chuyển tiền quốc tế.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'high',
      status: 'doing',
      startDate: getThisWeekDay(2),
      dueDate: getThisWeekDay(3),
      tagIds: ['tg3'],
      checklist: [{ id: 'c1', text: 'Chốt danh sách 42 sinh viên đã hoàn thành học phí', done: true }, { id: 'c2', text: 'Lập phiếu đề nghị chuyển tiền qua Agribank/Vietcombank', done: false }],
    },
    {
      id: 'wf_task_thu_2',
      projectId: 'p3',
      categoryId: 'gl03',
      title: 'Họp thẩm định đề cương và tích hợp Dự thảo Đề án Quỹ ĐTMH Gia Lai v1.0',
      description: 'Chủ trì cuộc họp thẩm định 5 chuyên đề chuyên gia UEH, tích hợp thành bản thảo v1.0.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'doing',
      startDate: getThisWeekDay(2),
      dueDate: getThisWeekDay(3),
      tagIds: ['glt1'],
      checklist: [{ id: 'c1', text: 'Tiếp nhận bản thảo 5 chuyên đề', done: true }, { id: 'c2', text: 'Rà soát tính liên kết các chương mục', done: false }],
    },
    {
      id: 'wf_task_thu_3',
      projectId: 'p2',
      categoryId: 'k2',
      title: 'Duyệt kịch bản và kế hoạch tổ chức ngày hội Open Day song bằng quốc tế',
      description: 'Phê duyệt phân công MC, diễn giả, khách mời phụ huynh và sinh viên tiêu biểu.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'medium',
      status: 'doing',
      startDate: getThisWeekDay(1),
      dueDate: getThisWeekDay(3),
      tagIds: ['tg2'],
      checklist: [{ id: 'c1', text: 'Duyệt timeline chương trình', done: true }, { id: 'c2', text: 'Duyệt danh sách quà tặng và tài liệu phát cho HS', done: false }],
    },
    {
      id: 'wf_task_thu_4',
      projectId: 'p1',
      categoryId: 'c07',
      title: 'Đối soát số lượng SV nộp học phí HK1 với ĐH Rennes',
      description: 'ThS. Hoàng Thị Phương Anh lập biên bản đối soát gửi đại diện tài chính Đại học Rennes.',
      assigneeIds: ['u3'],
      createdBy: 'u1',
      priority: 'high',
      status: 'review',
      startDate: getThisWeekDay(1),
      dueDate: getThisWeekDay(3),
      tagIds: ['tg3'],
      checklist: [{ id: 'c1', text: 'Xuất file dữ liệu thu học phí', done: true }, { id: 'c2', text: 'Khớp danh sách theo mã sinh viên', done: true }, { id: 'c3', text: 'Trình Quản lý dự án ký duyệt', done: true }],
    },

    // --- THỨ 6 ---
    {
      id: 'wf_task_fri_1',
      projectId: 'p1',
      categoryId: 'c06',
      title: 'Phê duyệt tờ trình mua vé máy bay, khách sạn và bảo hiểm Đoàn GV Rennes tháng 12',
      description: 'Duyệt chi phí vé máy bay khứ hồi CDG-SGN và khách sạn 14 đêm cho GS. Martin & TS. Sophie.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'doing',
      startDate: getThisWeekDay(3),
      dueDate: getThisWeekDay(4),
      tagIds: ['tg3', 'tg4'],
      checklist: [{ id: 'c1', text: 'Kiểm tra dự toán thù lao và công tác phí theo định mức', done: true }, { id: 'c2', text: 'Trình Ban Giám hiệu phê duyệt', done: false }],
    },
    {
      id: 'wf_task_fri_2',
      projectId: 'p3',
      categoryId: 'gl04',
      title: 'Chuẩn bị nội dung và tài liệu làm việc trực tiếp với Thường trực UBND Tỉnh tại Pleiku',
      description: 'Hoàn thiện slide báo cáo, bản tóm tắt đề án và các kiến nghị tháo gỡ điểm nghẽn.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'high',
      status: 'doing',
      startDate: getThisWeekDay(3),
      dueDate: getThisWeekDay(4),
      tagIds: ['glt3'],
      checklist: [{ id: 'c1', text: 'Soạn slide thuyết trình 15 trang', done: true }, { id: 'c2', text: 'In ấn 20 bộ hồ sơ tài liệu phát tại cuộc họp', done: false }],
    },
    {
      id: 'wf_task_fri_3',
      projectId: 'p1',
      categoryId: 'c08',
      title: 'Kiểm tra dự toán tài chính học kỳ 2 và quyết toán chi phí công tác năm 2026',
      description: 'ThS. Hoàng Thị Phương Anh lập hồ sơ quyết toán chi phí vé, khách sạn và thù lao giảng viên.',
      assigneeIds: ['u1', 'u3'],
      createdBy: 'u1',
      priority: 'high',
      status: 'doing',
      startDate: getThisWeekDay(3),
      dueDate: getThisWeekDay(4),
      tagIds: ['tg3'],
      checklist: [{ id: 'c1', text: 'Kiểm tra chứng từ hóa đơn', done: true }, { id: 'c2', text: 'Đối chiếu số liệu giải ngân', done: false }],
    },
    {
      id: 'wf_task_fri_4',
      projectId: 'p3',
      categoryId: 'gl03',
      title: 'Hoàn thiện tích hợp Dự thảo Đề án Quỹ ĐTMH v1.0 từ 5 chuyên đề chuyên gia UEH',
      description: 'ThS. Nguyễn Văn Thiện Tâm hoàn tất bản thảo v1.0 gồm 3 phần và 12 phụ lục.',
      assigneeIds: ['u2'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'review',
      startDate: getThisWeekDay(2),
      dueDate: getThisWeekDay(4),
      tagIds: ['glt1'],
      checklist: [{ id: 'c1', text: 'Ghép nối các chương', done: true }, { id: 'c2', text: 'Định dạng chuẩn UEH', done: true }, { id: 'c3', text: 'Trình Quản lý dự án xem xét', done: true }],
    },

    // --- THỨ 7 ---
    {
      id: 'wf_task_sat_1',
      projectId: 'p1',
      categoryId: 'c09',
      title: 'Đánh giá chất lượng khảo sát giảng dạy & phản hồi sinh viên chương trình song bằng',
      description: 'Phân tích kết quả khảo sát giữa kỳ của 2 học phần: Kinh tế lượng và Marketing quốc tế.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'medium',
      status: 'todo',
      startDate: getThisWeekDay(4),
      dueDate: getThisWeekDay(5),
      tagIds: ['tg5'],
      checklist: [{ id: 'c1', text: 'Tổng hợp điểm hài lòng sinh viên', done: false }, { id: 'c2', text: 'Ghi nhận các kiến nghị cải tiến', done: false }],
    },
    {
      id: 'wf_task_sat_2',
      projectId: 'p3',
      categoryId: 'gl05',
      title: 'Đôn đốc chuyên gia UEH hoàn thành nộp chuyên đề Đánh giá hiện trạng KTXH & PII',
      description: 'Liên hệ ThS. Đỗ Thị Quyên và ThS. Nguyễn Hoàng Long chốt bản hoàn thiện chuyên đề.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'high',
      status: 'todo',
      startDate: getThisWeekDay(4),
      dueDate: getThisWeekDay(5),
      tagIds: ['glt4'],
      checklist: [{ id: 'c1', text: 'Kiểm tra tiến độ nộp bài', done: false }, { id: 'c2', text: 'Nghiệm thu khối lượng chuyên đề', done: false }],
    },
    {
      id: 'wf_task_sat_3',
      projectId: 'p2',
      categoryId: 'k2',
      title: 'Tổ chức Open Day song bằng và workshop tư vấn học bổng trực tiếp',
      description: 'Đón tiếp hơn 150 học sinh, phụ huynh tại Cơ sở B UEH (279 Nguyễn Tri Phương).',
      assigneeIds: ['u6'],
      createdBy: 'u1',
      priority: 'high',
      status: 'doing',
      startDate: getThisWeekDay(3),
      dueDate: getThisWeekDay(5),
      tagIds: ['tg2'],
      checklist: [{ id: 'c1', text: 'Setup hội trường và âm thanh', done: true }, { id: 'c2', text: 'Tổ chức bàn tư vấn 1-1', done: false }],
    },

    // --- CHỦ NHẬT (HÔM NAY) ---
    {
      id: 'wf_task_sun_1',
      projectId: 'p1',
      categoryId: 'c10',
      title: 'Tổng hợp báo cáo tiến độ tuần 46 và kiểm soát rủi ro vận hành các dự án',
      description: 'Rà soát 10 hạng mục vận hành UEH-Rennes, nhận diện điểm nghẽn và giao nhiệm vụ tuần mới.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'doing',
      startDate: getThisWeekDay(5),
      dueDate: getThisWeekDay(6),
      tagIds: ['tg6'],
      checklist: [{ id: 'c1', text: 'Kiểm tra tỷ lệ hoàn thành KPI tuần', done: true }, { id: 'c2', text: 'Phát hành thông báo điều hành tuần tới', done: false }],
    },
    {
      id: 'wf_task_sun_2',
      projectId: 'p3',
      categoryId: 'gl06',
      title: 'Thẩm định dự toán chi phí tư vấn và hồ sơ giải ngân Đợt 1 Kho bạc Gia Lai',
      description: 'Kiểm tra hồ sơ thanh toán tạm ứng 30% hợp đồng tư vấn xây dựng Đề án Quỹ ĐTMH.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'high',
      status: 'doing',
      startDate: getThisWeekDay(5),
      dueDate: getThisWeekDay(6),
      tagIds: ['glt2'],
      checklist: [{ id: 'c1', text: 'Rà soát bảng kê chi phí chuyên gia', done: true }, { id: 'c2', text: 'Ký phiếu đề nghị giải ngân', done: false }],
    },
    {
      id: 'wf_task_sun_3',
      projectId: 'p2',
      categoryId: 'k3',
      title: 'Rà soát tiến độ đăng ký hồ sơ tuyển sinh sớm đợt 1 chương trình song bằng K53',
      description: 'Tổng hợp 68 hồ sơ nộp trực tuyến, kiểm tra điều kiện ngoại ngữ IELTS và điểm học bạ.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'medium',
      status: 'doing',
      startDate: getThisWeekDay(4),
      dueDate: getThisWeekDay(6),
      tagIds: ['tg1'],
      checklist: [{ id: 'c1', text: 'Thống kê số lượng hồ sơ hợp lệ', done: true }, { id: 'c2', text: 'Gửi email xác nhận tiếp nhận cho thí sinh', done: false }],
    },

    // --- QUÁ HẠN (OVERDUE - Hiện badge đỏ cảnh báo) ---
    {
      id: 'wf_task_od_1',
      projectId: 'p1',
      categoryId: 'c01',
      title: 'Rà soát ma trận RACI và chuẩn hóa quy trình phân công 10 hạng mục',
      description: 'Cần cập nhật lại phân công trách nhiệm chi tiết cho chuyên viên học vụ và hậu cần mới.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'doing',
      startDate: getLastWeekDay(2),
      dueDate: addDays(-2),
      tagIds: ['tg2', 'tg6'],
      checklist: [{ id: 'c1', text: 'Dự thảo bảng RACI mới', done: true }, { id: 'c2', text: 'Họp thống nhất các bên', done: false }],
    },
    {
      id: 'wf_task_od_2',
      projectId: 'p3',
      categoryId: 'gl02',
      title: 'Tổng hợp báo cáo số liệu các sở ngành gửi lại Sở KH&CN phục vụ xây dựng Đề án',
      description: 'Chậm trễ do Cục Thống kê và Sở Công thương gửi văn bản phúc đáp muộn hơn dự kiến.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'high',
      status: 'doing',
      startDate: getLastWeekDay(0),
      dueDate: addDays(-4),
      tagIds: ['glt4'],
      checklist: [{ id: 'c1', text: 'Tổng hợp số liệu GRDP và DN', done: true }, { id: 'c2', text: 'Hoàn thiện bảng ma trận dữ liệu đầu vào', done: false }],
    },

    // --- TUẦN SAU (NEXT WEEK) ---
    {
      id: 'wf_task_nxt_1',
      projectId: 'p1',
      categoryId: 'c01',
      title: 'Hội đàm song phương trực tuyến với Ban Giám hiệu Université de Rennes',
      description: 'Trao đổi kế hoạch mở rộng ngành Đào tạo Tài chính Dữ liệu và chỉ tiêu năm 2027.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'high',
      status: 'todo',
      startDate: getThisWeekDay(5),
      dueDate: getNextWeekDay(1),
      tagIds: ['tg1', 'tg2'],
      checklist: [{ id: 'c1', text: 'Gửi agenda cuộc họp cho Rennes', done: false }, { id: 'c2', text: 'Chuẩn bị phòng họp và đường truyền Zoom', done: false }],
    },
    {
      id: 'wf_task_nxt_2',
      projectId: 'p3',
      categoryId: 'gl04',
      title: 'Chủ trì đoàn công tác làm việc trực tiếp tại TP. Pleiku Đợt 2',
      description: 'Báo cáo trực tiếp Chủ tịch UBND Tỉnh và Ban Chỉ đạo Đề án Quỹ ĐTMH tỉnh Gia Lai.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'urgent',
      status: 'todo',
      startDate: getNextWeekDay(1),
      dueDate: getNextWeekDay(3),
      tagIds: ['glt3'],
      checklist: [{ id: 'c1', text: 'Chốt danh sách đoàn công tác', done: false }, { id: 'c2', text: 'Gửi công văn đăng ký lịch làm việc', done: false }],
    },
    {
      id: 'wf_task_nxt_3',
      projectId: 'p2',
      categoryId: 'k1',
      title: 'Ký hợp đồng tư vấn truyền thông và sản xuất ấn phẩm tuyển sinh đợt 2',
      description: 'Ký kết với đơn vị thiết kế và in ấn 5.000 cẩm nang tuyển sinh song bằng K53.',
      assigneeIds: ['u1'],
      createdBy: 'u1',
      priority: 'medium',
      status: 'todo',
      startDate: getNextWeekDay(2),
      dueDate: getNextWeekDay(4),
      tagIds: ['tg1', 'tg3'],
      checklist: [{ id: 'c1', text: 'Thẩm định 3 báo giá cạnh tranh', done: false }, { id: 'c2', text: 'Trình ký hợp đồng dịch vụ', done: false }],
    },
  ]

  WEEKLY_FEATURED_TASKS.forEach((t) => {
    tasks.push({
      ...t,
      description: t.description || '',
      checklist: t.checklist || [],
      tagIds: t.tagIds || [],
      parentId: null,
      createdAt: iso(60 * 24 * 5),
      updatedAt: iso(60 * 60),
      isStream: false,
    })
  })

  const comments = [
    { id: 'cm1', taskId: T_ACC, projectId: 'p1', userId: 'u7', text: 'Đã gửi file cho IT Rennes, đang chờ phản hồi. Dự kiến trễ 2–3 ngày do bên Rennes nghỉ lễ.', createdAt: iso(300) },
    { id: 'cm2', taskId: T_ACC, projectId: 'p1', userId: 'u1', text: 'OK em, nhớ báo SV trước để các bạn không lo nhé. Cập nhật ngay khi có tài khoản.', createdAt: iso(240) },
    { id: 'cm3', taskId: T_TRIP, projectId: 'p1', userId: 'u5', text: 'Vé và khách sạn đã chốt, chứng từ em đính kèm trong thư mục chung. Nhờ chị duyệt.', createdAt: iso(90) },
  ]

  const activities = [
    { id: 'a1', projectId: 'p1', taskId: T_TRIP, userId: 'u5', text: 'chuyển “Đoàn GV Rennes tháng 12: vé, khách sạn, visa” sang Chờ duyệt', createdAt: iso(95) },
    { id: 'a2', projectId: 'p1', taskId: T_TRIP, userId: 'u5', text: 'bình luận trong “Đoàn GV Rennes tháng 12: vé, khách sạn, visa”', createdAt: iso(90) },
    { id: 'a3', projectId: 'p1', taskId: T_ACC, userId: 'u1', text: 'bình luận trong “Cấp tài khoản LMS & email Rennes cho K52”', createdAt: iso(240) },
    { id: 'a4', projectId: 'p1', taskId: T_DASH, userId: 'u1', text: 'duyệt hoàn thành “Cập nhật dashboard tháng 11”', createdAt: iso(60 * 26) },
    { id: 'a5', projectId: 'p1', taskId: T_PLAN, userId: 'u2', text: 'chuyển “Kế hoạch đào tạo năm học 2026–2027” sang Chờ duyệt', createdAt: iso(60 * 5) },
    { id: 'a6', projectId: 'p1', taskId: T_CONTRACT, userId: 'u2', text: 'giao “Hợp đồng thỉnh giảng đợt 2 – 2 GV Rennes” cho ThS. Hoàng Thị Phương Anh', createdAt: iso(60 * 24 * 4) },
    { id: 'a7', projectId: 'p2', taskId: 'k1', userId: 'u1', text: 'tạo công việc “Lên kế hoạch truyền thông đa kênh K53”', createdAt: iso(60 * 24 * 7) },
  ]

  const emailReminders = [
    {
      id: 'er1',
      projectId: 'p1',
      type: 'grade_reminder',
      title: 'Nhắc hạn nộp bảng điểm học phần Kinh tế lượng tài chính (còn 3 ngày)',
      triggerReason: 'Học phần đã kết thúc giảng dạy ngày 10/11/2026. Hạn nộp điểm theo MOA là ngày 18/11/2026 (còn 3 ngày).',
      targetLecturer: 'Prof. Franck Martin',
      lecturerEmail: 'franck.martin@univ-rennes.fr',
      courseName: 'Kinh tế lượng tài chính và Mô hình hóa tài chính',
      className: 'ISB-K51-01',
      deadline: '18/11/2026',
      assignedTo: 'u2',
      status: 'pending_review',
      createdAt: iso(180),
      preDraft: {
        from: 'UEH-ISB Academic Affairs <academic@isb.edu.vn>',
        to: 'franck.martin@univ-rennes.fr',
        cc: 'academic.rennes@isb.edu.vn, tamnvt@ueh.edu.vn',
        bcc: '',
        subject: '[UEH-ISB] Nhắc hạn nộp bảng điểm học phần Kinh tế lượng tài chính - Lớp ISB-K51-01',
      },
    },
    {
      id: 'er2',
      projectId: 'p1',
      type: 'flight_pickup_reminder',
      title: 'Xác nhận thông tin chuyến bay & xe đón tiễn GV Rennes đợt tháng 12',
      triggerReason: 'Chuyến bay AF 258 dự kiến hạ cánh lúc 06:30 ngày 05/12/2026. Cần gửi thư xác nhận xe đón tiễn và khách sạn.',
      targetLecturer: 'Prof. Franck Martin',
      lecturerEmail: 'franck.martin@univ-rennes.fr',
      courseName: 'Marketing quốc tế',
      className: 'ISB-K51-01',
      deadline: '28/11/2026',
      assignedTo: 'u5',
      status: 'pending_review',
      createdAt: iso(90),
      preDraft: {
        from: 'UEH-ISB Logistics <academic@isb.edu.vn>',
        to: 'franck.martin@univ-rennes.fr',
        cc: 'thanhtung@ueh.demo',
        bcc: '',
        subject: '[UEH-ISB] Thông tin Đón tiễn Sân bay Tân Sơn Nhất & Khách sạn - GV Franck Martin',
      },
    },
    {
      id: 'er3',
      projectId: 'p1',
      type: 'contract_reminder',
      title: 'Nhắc ký Hợp đồng thỉnh giảng đợt 2 cho TS. Jean-Luc Prigent',
      triggerReason: 'Hồ sơ lý lịch khoa học và Hợp đồng thỉnh giảng đợt 2 chưa hoàn tất chữ ký trước đợt công tác.',
      targetLecturer: 'TS. Jean-Luc Prigent',
      lecturerEmail: 'jean-luc.prigent@univ-rennes.fr',
      courseName: 'Kinh tế lượng chuỗi thời gian',
      className: 'ISB-K50-01',
      deadline: '25/11/2026',
      assignedTo: 'u3',
      status: 'pending_review',
      createdAt: iso(300),
      preDraft: {
        from: 'UEH-ISB Administration <academic@isb.edu.vn>',
        to: 'jean-luc.prigent@univ-rennes.fr',
        cc: 'anhhtp@ueh.edu.vn',
        bcc: '',
        subject: '[UEH-ISB] Nhắc hoàn thiện hồ sơ & Ký Hợp đồng thỉnh giảng - TS. Jean-Luc Prigent',
      },
    },
    {
      id: 'er4',
      projectId: 'p3',
      type: 'expert_survey_reminder',
      title: 'Nhắc chuyên gia UEH nộp chuyên đề Đánh giá hiện trạng KTXH & PII tỉnh Gia Lai',
      triggerReason: 'Hạn bàn giao chuyên đề theo Hợp đồng tư vấn là ngày 18/11/2026. Cần đôn đốc nộp bản thảo hoàn chỉnh.',
      targetLecturer: 'ThS. Đỗ Thị Quyên',
      lecturerEmail: 'quyen.do@ueh.edu.vn',
      courseName: 'Chuyên đề Hiện trạng KTXH & PII',
      className: 'Đề án Quỹ ĐTMH Gia Lai',
      deadline: '18/11/2026',
      assignedTo: 'u7',
      status: 'pending_review',
      createdAt: iso(120),
      preDraft: {
        from: 'Nhóm Tư vấn UEH <tuvan.gialai@ueh.edu.vn>',
        to: 'quyen.do@ueh.edu.vn',
        cc: 'baotcn@ueh.edu.vn',
        bcc: '',
        subject: '[UEH-Tư vấn Gia Lai] Đôn đốc hoàn thiện & nộp Chuyên đề PII Đề án Quỹ ĐTMH',
      },
    },
    {
      id: 'er5',
      projectId: 'p1',
      type: 'schedule_announcement',
      title: 'Thông báo thời khóa biểu & phòng học các môn học kỳ 2 chương trình song bằng',
      triggerReason: 'Lịch giảng HK2 đã được Đại học Rennes và Phòng Quản lý đào tạo UEH phê duyệt.',
      targetLecturer: 'Sinh viên Khóa K51, K52',
      lecturerEmail: 'sinhvien.songbang@isb.edu.vn',
      courseName: 'Thời khóa biểu HK2 (2026–2027)',
      className: 'ISB-K51 & ISB-K52',
      deadline: '20/11/2026',
      assignedTo: 'u2',
      status: 'pending_review',
      createdAt: iso(60),
      preDraft: {
        from: 'UEH-ISB Academic Affairs <academic@isb.edu.vn>',
        to: 'sinhvien.songbang@isb.edu.vn',
        cc: 'tamnvt@ueh.edu.vn, baotcn@ueh.edu.vn',
        bcc: '',
        subject: '[UEH-ISB Song bằng Rennes] Công bố Thời khóa biểu & Kế hoạch học tập Học kỳ 2',
      },
    },
  ]

  const notifications = [
    { id: 'n1', userId: 'u1', projectId: 'p1', taskId: T_TRIP, text: 'ThS. Hoàng Thị Phương Anh gửi duyệt “Đoàn GV Rennes tháng 12: vé, khách sạn, visa”', read: false, createdAt: iso(95) },
    { id: 'n2', userId: 'u1', projectId: 'p1', taskId: T_PLAN, text: 'ThS. Nguyễn Văn Thiện Tâm gửi duyệt “Kế hoạch đào tạo năm học 2026–2027”', read: false, createdAt: iso(300) },
    { id: 'n3', userId: 'u7', projectId: 'p1', taskId: T_ACC, text: 'TS. Tô Công Nguyên Bảo bình luận trong “Cấp tài khoản LMS & email Rennes cho K52”', read: false, createdAt: iso(240) },
    { id: 'n4', userId: 'u3', projectId: 'p1', taskId: T_CONTRACT, text: 'ThS. Nguyễn Văn Thiện Tâm giao cho bạn “Hợp đồng thỉnh giảng đợt 2 – 2 GV Rennes”', read: false, createdAt: iso(60 * 24 * 4) },
    { id: 'n5', userId: 'u2', projectId: 'p1', reminderId: 'er1', text: '📧 [Duyệt gửi Email]: Nhắc hạn nộp bảng điểm học phần Kinh tế lượng tài chính (còn 3 ngày)', read: false, createdAt: iso(180) },
    { id: 'n6', userId: 'u3', projectId: 'p1', reminderId: 'er2', text: '📧 [Duyệt gửi Email]: Xác nhận thông tin chuyến bay & xe đón tiễn GV Rennes đợt tháng 12', read: false, createdAt: iso(90) },
    { id: 'n7', userId: 'u1', projectId: 'p3', reminderId: 'er4', text: '📧 [Duyệt gửi Email]: Đôn đốc ThS. Đỗ Thị Quyên nộp chuyên đề PII Gia Lai', read: false, createdAt: iso(120) },
    { id: 'n8', userId: 'u1', projectId: 'p1', reminderId: 'er5', text: '📧 [Duyệt gửi Email]: Công bố Thời khóa biểu & Phòng học HK2 cho sinh viên K51, K52', read: false, createdAt: iso(60) },
  ]

  return { v: SEED_V, users: SEED_USERS, projects, tasks, comments, activities, notifications, items: [...buildItems('p1'), ...buildAdmissionsItems('p2'), ...buildGiaLaiItems('p3')], checklist, emailReminders }
}
