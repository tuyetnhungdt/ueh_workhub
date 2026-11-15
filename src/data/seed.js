import { DEFAULT_CATEGORIES, DEFAULT_TAGS, addDays } from '../lib/utils.js'
import { RENNES_STREAMS, CURRENT_TASKS, LEGACY_CHECKLIST, COHORTS, TEACHING_GROUPS } from './rennes.js'
import { buildItems } from '../modules/seedItems.js'

// Dữ liệu mẫu (nhân sự là tên giả định) – ngày được tính tương đối theo hôm nay để demo luôn "sống".
export const SEED_USERS = [
  { id: 'u1', name: 'Trần Minh Anh', email: 'minhanh@ueh.demo', role: 'admin', title: 'Trưởng chương trình', color: '#03616a' },
  { id: 'u2', name: 'Nguyễn Thu Hà', email: 'thuha@ueh.demo', role: 'member', title: 'Điều phối học vụ', color: '#d4712f' },
  { id: 'u3', name: 'Lê Quốc Bảo', email: 'quocbao@ueh.demo', role: 'member', title: 'Chuyên viên tài chính', color: '#2563eb' },
  { id: 'u4', name: 'Phạm Ngọc Lan', email: 'ngoclan@ueh.demo', role: 'member', title: 'Chuyên viên khảo thí', color: '#7c3aed' },
  { id: 'u5', name: 'Võ Thanh Tùng', email: 'thanhtung@ueh.demo', role: 'member', title: 'Chuyên viên hậu cần', color: '#0891b2' },
  { id: 'u6', name: 'Đặng Mai Phương', email: 'maiphuong@ueh.demo', role: 'member', title: 'Chuyên viên công tác SV', color: '#db2777' },
  { id: 'u7', name: 'Hoàng Gia Huy', email: 'giahuy@ueh.demo', role: 'member', title: 'Chuyên viên dữ liệu & truyền thông', color: '#16a34a' },
  { id: 'u8', name: 'Franck Martin', email: 'franck.martin@univ-rennes.fr', role: 'member', title: 'Đầu mối học thuật Đại học Rennes', color: '#b45309' },
]

export const SEED_V = 12 // tăng khi dữ liệu mẫu đổi cấu trúc → bản demo tự làm mới

export function buildSeed() {
  const now = Date.now()
  const iso = (minsAgo) => new Date(now - minsAgo * 60000).toISOString()
  const projects = [
    {
      id: 'p1',
      name: 'Song bằng UEH – Rennes',
      code: 'UEH-RENNES',
      description: 'Cử nhân song bằng UEH – Université de Rennes. Điều phối 10 hạng mục vận hành: hành chính, học vụ, khảo thí, giảng viên, hậu cần, tài chính, công tác sinh viên và dữ liệu.',
      color: '#03616a',
      startDate: addDays(-60),
      endDate: addDays(120),
      createdBy: 'u1',
      createdAt: iso(60 * 24 * 60),
      cohorts: COHORTS,
      teachingGroups: TEACHING_GROUPS,
      members: [
        { userId: 'u1', role: 'manager' },
        { userId: 'u2', role: 'manager' },
        { userId: 'u3', role: 'member' },
        { userId: 'u4', role: 'member' },
        { userId: 'u5', role: 'member' },
        { userId: 'u6', role: 'member' },
        { userId: 'u7', role: 'member' },
        { userId: 'u8', role: 'member' },
      ],
      categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, ownerId: { c01: 'u1', c02: 'u2', c03: 'u2', c04: 'u4', c05: 'u2', c06: 'u5', c07: 'u3', c08: 'u3', c09: 'u6', c10: 'u7' }[c.id] })),
      tags: DEFAULT_TAGS.map((t) => ({ ...t })),
      joinCode: 'RNS6-K7QA',
    },
    {
      id: 'p2',
      name: 'Tuyển sinh K53 – Song bằng',
      code: 'TS-K53',
      description: 'Chiến dịch tuyển sinh khóa K53 chương trình cử nhân song bằng: truyền thông, tư vấn, hồ sơ và nhập học.',
      color: '#d4712f',
      startDate: addDays(-20),
      endDate: addDays(75),
      createdBy: 'u1',
      createdAt: iso(20 * 24 * 60),
      members: [
        { userId: 'u1', role: 'manager' },
        { userId: 'u6', role: 'member' },
        { userId: 'u7', role: 'member' },
      ],
      categories: [
        { id: 'k1', no: '01', name: 'Truyền thông tuyển sinh', icon: 'Megaphone' },
        { id: 'k2', no: '02', name: 'Tư vấn & sự kiện', icon: 'MessagesSquare' },
        { id: 'k3', no: '03', name: 'Hồ sơ & nhập học', icon: 'FileText' },
      ],
      joinCode: 'K53T-2M9X',
      tags: [{ id: 'tg1', name: 'MKT', color: '#16a34a' }, { id: 'tg2', name: 'Sự kiện', color: '#d4712f' }, { id: 'tg3', name: 'Thiết kế', color: '#ca8a04' }],
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

  const notifications = [
    { id: 'n1', userId: 'u1', projectId: 'p1', taskId: T_TRIP, text: 'Võ Thanh Tùng gửi duyệt “Đoàn GV Rennes tháng 12: vé, khách sạn, visa”', read: false, createdAt: iso(95) },
    { id: 'n2', userId: 'u1', projectId: 'p1', taskId: T_PLAN, text: 'Nguyễn Thu Hà gửi duyệt “Kế hoạch đào tạo năm học 2026–2027”', read: false, createdAt: iso(300) },
    { id: 'n3', userId: 'u7', projectId: 'p1', taskId: T_ACC, text: 'Trần Minh Anh bình luận trong “Cấp tài khoản LMS & email Rennes cho K52”', read: false, createdAt: iso(240) },
    { id: 'n4', userId: 'u3', projectId: 'p1', taskId: T_CONTRACT, text: 'Nguyễn Thu Hà giao cho bạn “Hợp đồng thỉnh giảng đợt 2 – 2 GV Rennes”', read: false, createdAt: iso(60 * 24 * 4) },
  ]

  return { v: SEED_V, users: SEED_USERS, projects, tasks, comments, activities, notifications, items: buildItems("p1"), checklist }
}
