import { DEFAULT_CATEGORIES, DEFAULT_TAGS, addDays } from '../lib/utils.js'
import { RENNES_STREAMS, CURRENT_TASKS, LEGACY_CHECKLIST, COHORTS, TEACHING_GROUPS } from './rennes.js'
import { buildItems, buildGiaLaiItems } from '../modules/seedItems.js'
import { ROLES, USER_STATUS, getDefaultRolePermissions } from './rbac.js'

// Dữ liệu mẫu (nhân sự là tên giả định) – ngày được tính tương đối theo hôm nay để demo luôn "sống".
export const SEED_USERS = [
  { id: 'u1', name: 'Trần Minh Anh', email: 'minhanh@ueh.demo', role: ROLES.SUPER_ADMIN, status: USER_STATUS.ACTIVE, title: 'Trưởng chương trình (Super Admin)', color: '#03616a' },
  { id: 'u2', name: 'Nguyễn Thu Hà', email: 'thuha@ueh.demo', role: ROLES.ACADEMIC_ADMIN, status: USER_STATUS.ACTIVE, title: 'Điều phối học vụ (Academic Admin)', color: '#d4712f' },
  { id: 'u3', name: 'Lê Quốc Bảo', email: 'quocbao@ueh.demo', role: ROLES.PROGRAM_OFFICER, status: USER_STATUS.ACTIVE, title: 'Chuyên viên tài chính', color: '#2563eb' },
  { id: 'u4', name: 'Phạm Ngọc Lan', email: 'ngoclan@ueh.demo', role: ROLES.ACADEMIC_ADMIN, status: USER_STATUS.ACTIVE, title: 'Chuyên viên khảo thí & học vụ', color: '#7c3aed' },
  { id: 'u5', name: 'Võ Thanh Tùng', email: 'thanhtung@ueh.demo', role: ROLES.PROGRAM_OFFICER, status: USER_STATUS.ACTIVE, title: 'Chuyên viên hậu cần & vé máy bay', color: '#0891b2' },
  { id: 'u6', name: 'Đặng Mai Phương', email: 'maiphuong@ueh.demo', role: ROLES.PROGRAM_OFFICER, status: USER_STATUS.ACTIVE, title: 'Chuyên viên công tác sinh viên', color: '#db2777' },
  { id: 'u7', name: 'Hoàng Gia Huy', email: 'giahuy@ueh.demo', role: ROLES.PROGRAM_OFFICER, status: USER_STATUS.ACTIVE, title: 'Chuyên viên dữ liệu & truyền thông', color: '#16a34a' },
  { id: 'u8', name: 'Đỗ Minh Hạnh', email: 'minhhanh.do@ueh.demo', role: ROLES.ASSISTANT, status: USER_STATUS.ACTIVE, title: 'Trợ lý dự án', color: '#0891b2' },
  {
    id: 'u9',
    name: 'Phan Văn Nam',
    email: 'nam.phan@ueh.demo',
    role: ROLES.PROGRAM_OFFICER,
    status: USER_STATUS.PENDING,
    title: 'Chuyên viên điều phối mới',
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
    title: 'Chuyên viên Hậu cần mới',
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
    title: 'Cộng tác viên tư vấn ngoài',
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

export const SEED_V = 21 // tăng khi dữ liệu mẫu đổi cấu trúc → bản demo tự làm mới

export function buildSeed() {
  const now = Date.now()
  const iso = (minsAgo) => new Date(now - minsAgo * 60000).toISOString()
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
        { userId: 'u4', role: 'academic_admin' },
        { userId: 'u5', role: 'program_officer' },
        { userId: 'u6', role: 'program_officer' },
        { userId: 'u7', role: 'program_officer' },
        { userId: 'u8', role: 'assistant' },
      ],
      rolePermissions: getDefaultRolePermissions({ id: 'p1' }),
      categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, ownerId: { c01: 'u1', c02: 'u2', c03: 'u2', c04: 'u4', c05: 'u2', c06: 'u5', c07: 'u3', c08: 'u3', c09: 'u6', c10: 'u7' }[c.id] })),
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
      name: 'Đề án Quỹ Đầu tư Mạo hiểm tỉnh Gia Lai',
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
        { id: 'gl01', no: '01', name: 'Văn bản & Pháp lý Sở Ngành', icon: 'FileText', ownerId: 'u1' },
        { id: 'gl02', no: '02', name: 'Khảo sát & Dữ liệu Đầu vào', icon: 'Database', ownerId: 'u7' },
        { id: 'gl03', no: '03', name: 'Soạn thảo & Biên tập Đề án', icon: 'BookOpenCheck', ownerId: 'u2' },
        { id: 'gl04', no: '04', name: 'Lịch làm việc & Hội thảo Thống nhất', icon: 'CalendarClock', ownerId: 'u1' },
        { id: 'gl05', no: '05', name: 'Đoàn công tác & Khảo sát Địa phương', icon: 'PlaneTakeoff', ownerId: 'u5' },
        { id: 'gl06', no: '06', name: 'Nhóm Chuyên gia & Phân công Biên soạn', icon: 'UsersRound', ownerId: 'u1' },
        { id: 'gl07', no: '07', name: 'Thư viện Pháp lý & Tham khảo', icon: 'Library', ownerId: 'u2' },
        { id: 'gl08', no: '08', name: 'Chi phí & Quyết toán Hợp đồng Tư vấn', icon: 'Calculator', ownerId: 'u3' },
      ],
      joinCode: 'GLVF-2026',
      tags: [
        { id: 'glt1', name: 'Pháp lý', color: '#0284c7' },
        { id: 'glt2', name: 'Vốn mồi', color: '#d97706' },
        { id: 'glt3', name: 'Hậu cần Pleiku', color: '#059669' },
        { id: 'glt4', name: 'PII Gia Lai', color: '#7c3aed' },
      ],
      modulesConfig: [
        { moduleKey: 'gl_docs', isEnabled: true, customTitle: 'Văn bản & Pháp lý Sở Ngành', customDesc: 'Công văn đi/đến (Sở KH&CN, Sở Tài chính, Cục Thuế, Sở Công thương), Tờ trình, Quyết định giao nhiệm vụ.', customIcon: 'FileText', sortOrder: 1 },
        { moduleKey: 'gl_surveys', isEnabled: true, customTitle: 'Khảo sát & Dữ liệu Đầu vào', customDesc: 'Phiếu đề nghị cung cấp thông tin, chỉ số PII, báo cáo KTXH Gia Lai, số liệu DN & HTX.', customIcon: 'Database', sortOrder: 2 },
        { moduleKey: 'gl_drafts', isEnabled: true, customTitle: 'Soạn thảo & Biên tập Đề án', customDesc: 'Phiên bản đề cương, Dự thảo Đề án v1.0, v6.3, Bản tóm tắt rút gọn, Bản chuẩn format UEH.', customIcon: 'BookOpenCheck', sortOrder: 3 },
        { moduleKey: 'gl_meetings', isEnabled: true, customTitle: 'Lịch làm việc & Hội thảo Thống nhất', customDesc: 'Lịch làm việc trực tiếp tại Tỉnh, trao đổi kỹ thuật với Tổ chuyên viên Sở KH&CN, Hội thảo tham vấn chuyên gia.', customIcon: 'CalendarClock', sortOrder: 4 },
        { moduleKey: 'gl_trips', isEnabled: true, customTitle: 'Đoàn công tác & Khảo sát Địa phương', customDesc: 'Hậu cần công tác Pleiku/Gia Lai: Đề xuất & đặt vé máy bay đoàn chuyên gia UEH, khách sạn, xe đưa đón; tích hợp luồng vé máy bay & phiếu đề nghị.', customIcon: 'PlaneTakeoff', sortOrder: 5 },
        { moduleKey: 'gl_experts', isEnabled: true, customTitle: 'Nhóm Chuyên gia & Phân công Biên soạn', customDesc: 'Danh sách chuyên gia tư vấn UEH, phân công phụ trách phần đề án: Cơ sở pháp lý, Mô hình vận hành quỹ, Cơ chế thoái vốn...', customIcon: 'UsersRound', sortOrder: 6 },
        { moduleKey: 'gl_legal_lib', isEnabled: true, customTitle: 'Thư viện Pháp lý & Tham khảo', customDesc: 'Nghị định 365, Nghị định 366, Luật Doanh nghiệp, Nghị quyết HĐND tỉnh, mô hình Quỹ ĐTMH TP.HCM / quốc tế.', customIcon: 'Library', sortOrder: 7 },
        { moduleKey: 'gl_finance', isEnabled: true, customTitle: 'Chi phí & Quyết toán Hợp đồng Tư vấn', customDesc: 'Tạm ứng, thù lao viết chuyên đề, công tác phí khảo sát, hồ sơ thanh quyết toán với Sở KH&CN.', customIcon: 'Calculator', sortOrder: 8 },
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
        tasks.push({
          id: rid, projectId: 'p1', categoryId: cat, title: rt, parentId: sid,
          description: '', assigneeIds: [who], createdBy: ['u1', 'u2'].includes(owner) ? 'u1' : 'u2',
          priority, status, startDate: addDays(due - 5 - ((n + j) % 8)), dueDate: addDays(due),
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
  const T_DASH = byTitle('Cập nhật dashboard tháng 11')
  tasks.find((t) => t.id === T_ACC).description = 'Tạo tài khoản LMS và email Rennes cho toàn bộ SV K52 đã đăng ký song bằng. Gửi file danh sách theo mẫu của Rennes, kiểm tra lại các trường hợp sai thông tin.'
  tasks.find((t) => t.id === T_TRIP).description = 'Đoàn 2 giảng viên Rennes sang giảng học phần Marketing quốc tế. Chốt vé khứ hồi, khách sạn gần cơ sở B và thư mời phục vụ xin visa.'
  tasks.find((t) => t.id === T_CONTRACT).description = 'Hoàn thiện hồ sơ giảng viên đợt 2 (CV, bằng cấp, hộ chiếu) và trình ký hợp đồng thỉnh giảng.'

  // ---- 34 công việc thực tế từ gói bàn giao Rennes v1.0 (27 việc vận hành + 7 hành chính) ----
  CURRENT_TASKS.forEach((t, i) => {
    const id = 'task_' + (t.external_ref ? t.external_ref.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'op_' + (i + 1))
    const catId = 'c' + String(t.category_code).padStart(2, '0')
    const ownerId = { c01: 'u1', c02: 'u2', c03: 'u2', c04: 'u4', c05: 'u2', c06: 'u5', c07: 'u3', c08: 'u3', c09: 'u6', c10: 'u7' }[catId] || 'u1'
    const p = t.priority === 'P0' ? 'urgent' : t.priority === 'P1' ? 'high' : t.priority === 'P2' ? 'medium' : 'low'
    const st = t.status === 'Hoàn tất' ? 'done' : t.status === 'Đang thực hiện' ? 'doing' : t.status === 'Chờ duyệt' ? 'review' : 'todo'
    const tag = t.teaching_group === 'K50–K51' ? 'tg5' : t.teaching_group === 'K52' ? 'tg1' : null
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
      assigneeIds: [ownerId],
      createdBy: 'u1',
      priority: p,
      status: st,
      startDate: addDays(-10),
      dueDate: t.status === 'Hoàn tất' ? addDays(-3) : addDays(7 + (i % 24)),
      checklist: [],
      tagIds: tag ? [tag] : [],
      parentId: null,
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
    ['k1', 'Lên kế hoạch truyền thông đa kênh K53', 'u7', 'doing', 3, 'high', ['tg1']],
    ['k1', 'Sản xuất video giới thiệu chương trình', 'u7', 'todo', 12, 'medium', ['tg1', 'tg3']],
    ['k2', 'Tổ chức Open Day song bằng', 'u6', 'todo', 20, 'high', ['tg2']],
    ['k2', 'Trả lời tư vấn fanpage & hotline', 'u6', 'doing', 1, 'medium', []],
    ['k3', 'Chuẩn bị bộ hồ sơ nhập học', 'u6', 'todo', 40, 'medium', []],
  ]
  k.forEach(([cat, title, a, status, due, priority, tagIds], i) => {
    tasks.push({
      id: 'k' + (i + 1), projectId: 'p2', categoryId: cat, title, description: '', assigneeIds: [a], createdBy: 'u1',
      priority, status, startDate: addDays(due - 7), dueDate: addDays(due), checklist: [], tagIds, parentId: null,
      createdAt: iso(60 * 24 * 7), updatedAt: iso(60 * 24), completedAt: null,
    })
  })

  // ---- p3: Dự án tư vấn Quỹ ĐTMH Gia Lai ----
  const glTasksData = [
    ['gl01', 'Phúc đáp công văn 11578/STC của Sở Tài chính về phương án vốn mồi', 'u1', 'doing', 3, 'urgent', ['glt1', 'glt2']],
    ['gl01', 'Hoàn thiện dự thảo Tờ trình UBND tỉnh trình HĐND ban hành Nghị quyết', 'u1', 'doing', 6, 'high', ['glt1']],
    ['gl02', 'Đôn đốc thu thập đủ 120 phiếu khảo sát DN/HTX và làm sạch số liệu PII', 'u7', 'doing', 4, 'high', ['glt4']],
    ['gl02', 'Rà soát danh sách nhà đầu tư hạt giống A1–A3 với Hội Doanh nhân trẻ', 'u7', 'todo', 5, 'medium', ['glt2']],
    ['gl03', 'Hoàn thiện tích hợp Dự thảo Đề án v1.0 từ 5 chuyên đề chuyên gia UEH', 'u2', 'doing', 4, 'urgent', ['glt1']],
    ['gl03', 'Biên tập bản tóm tắt rút gọn phục vụ báo cáo Thường trực Tỉnh ủy', 'u2', 'todo', 8, 'medium', []],
    ['gl04', 'Chuẩn bị nội dung làm việc trực tiếp với Thường trực UBND Tỉnh tại Pleiku', 'u1', 'doing', 5, 'high', ['glt3']],
    ['gl04', 'Lên kế hoạch và gửi thư mời Hội thảo tham vấn chuyên gia cuối tháng 11', 'u1', 'todo', 12, 'medium', []],
    ['gl05', 'Xác nhận vé máy bay SGN-PXU và phòng khách sạn Pleiku Đoàn công tác Đợt 2', 'u5', 'doing', 2, 'urgent', ['glt3']],
    ['gl05', 'Trình phê duyệt phiếu đề nghị vé máy bay và xe đưa đón Đoàn công tác Đợt 3', 'u5', 'todo', 14, 'medium', ['glt3']],
    ['gl06', 'Đôn đốc ThS. Đỗ Thị Quyên nộp chuyên đề Đánh giá hiện trạng KTXH & PII', 'u1', 'doing', 1, 'urgent', ['glt4']],
    ['gl06', 'Rà soát tính đồng bộ giữa phần Điều lệ Quỹ (ThS. Vi) và Mô hình vận hành', 'u2', 'doing', 6, 'high', ['glt1']],
    ['gl07', 'Hệ thống hóa quy định cơ chế bảo toàn vốn nhà nước theo NĐ 366/2025', 'u2', 'done', -3, 'medium', ['glt1']],
    ['gl07', 'Tổng hợp mô hình Quỹ ĐTMH TP.HCM (HCM VIF v6.3) làm phụ lục tham chiếu', 'u2', 'done', -5, 'low', []],
    ['gl08', 'Hoàn tất hồ sơ tạm ứng Đợt 1 (30%) với Kho bạc Nhà nước tỉnh Gia Lai', 'u3', 'done', -10, 'high', ['glt2']],
    ['gl08', 'Thẩm định hồ sơ công tác phí Pleiku Đợt 1 và dự toán công tác phí Đợt 2', 'u3', 'doing', 3, 'medium', ['glt3']],
  ]
  glTasksData.forEach(([cat, title, a, status, due, priority, tagIds], i) => {
    tasks.push({
      id: 'gl_t' + (i + 1), projectId: 'p3', categoryId: cat, title, description: '', assigneeIds: [a], createdBy: 'u1',
      priority, status, startDate: addDays(due - 7), dueDate: addDays(due), checklist: [], tagIds, parentId: null,
      createdAt: iso(60 * 24 * 10), updatedAt: iso(60 * 24), completedAt: status === 'done' ? iso(60 * 24 * 2) : null,
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
    { id: 'a6', projectId: 'p1', taskId: T_CONTRACT, userId: 'u2', text: 'giao “Hợp đồng thỉnh giảng đợt 2 – 2 GV Rennes” cho Lê Quốc Bảo', createdAt: iso(60 * 24 * 4) },
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
        cc: 'academic.rennes@isb.edu.vn, thuha@ueh.demo',
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
        cc: 'quocbao@ueh.demo',
        bcc: '',
        subject: '[UEH-ISB] Nhắc hoàn thiện hồ sơ & Ký Hợp đồng thỉnh giảng - TS. Jean-Luc Prigent',
      },
    },
  ]

  const notifications = [
    { id: 'n1', userId: 'u1', projectId: 'p1', taskId: T_TRIP, text: 'Võ Thanh Tùng gửi duyệt “Đoàn GV Rennes tháng 12: vé, khách sạn, visa”', read: false, createdAt: iso(95) },
    { id: 'n2', userId: 'u1', projectId: 'p1', taskId: T_PLAN, text: 'Nguyễn Thu Hà gửi duyệt “Kế hoạch đào tạo năm học 2026–2027”', read: false, createdAt: iso(300) },
    { id: 'n3', userId: 'u7', projectId: 'p1', taskId: T_ACC, text: 'Trần Minh Anh bình luận trong “Cấp tài khoản LMS & email Rennes cho K52”', read: false, createdAt: iso(240) },
    { id: 'n4', userId: 'u3', projectId: 'p1', taskId: T_CONTRACT, text: 'Nguyễn Thu Hà giao cho bạn “Hợp đồng thỉnh giảng đợt 2 – 2 GV Rennes”', read: false, createdAt: iso(60 * 24 * 4) },
    { id: 'n5', userId: 'u2', projectId: 'p1', reminderId: 'er1', text: '📧 [Duyệt gửi Email]: Nhắc hạn nộp bảng điểm học phần Kinh tế lượng tài chính (còn 3 ngày)', read: false, createdAt: iso(180) },
    { id: 'n6', userId: 'u5', projectId: 'p1', reminderId: 'er2', text: '📧 [Duyệt gửi Email]: Xác nhận thông tin chuyến bay & xe đón tiễn GV Rennes đợt tháng 12', read: false, createdAt: iso(90) },
  ]

  return { v: SEED_V, users: SEED_USERS, projects, tasks, comments, activities, notifications, items: [...buildItems('p1'), ...buildGiaLaiItems('p3')], checklist, emailReminders }
}
