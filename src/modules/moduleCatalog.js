import { MODULES, MODULE } from './schema.js'

/**
 * Thư viện Phân hệ Chuẩn (Module Catalog) của hệ thống UEH WorkHub
 * Phân chia theo: Phân hệ Lõi (Dùng chung) và Phân hệ Đặc thù (Đào tạo / Tuyển sinh / Quỹ đầu tư)
 */
export const MODULE_CATALOG = [
  // --- Phân hệ Lõi (Core / Universal) ---
  {
    key: 'docs',
    baseId: 'docs',
    category: 'core',
    defaultTitle: 'Văn bản & hồ sơ',
    defaultIcon: 'FileText',
    defaultDesc: 'Hợp đồng, thỏa thuận, quyết định, công văn đi/đến, biên bản họp và tài liệu pháp lý.',
    badgeQuery: 'pendingDocs',
    supportsTemplates: true,
  },
  {
    key: 'expenses',
    baseId: 'expenses',
    category: 'core',
    defaultTitle: 'Chi phí & quyết toán',
    defaultIcon: 'Calculator',
    defaultDesc: 'Theo dõi từng khoản chi, hóa đơn chứng từ, tạm ứng và quyết toán ngân sách dự án.',
    badgeQuery: 'pendingExpenses',
  },
  {
    key: 'trips',
    baseId: 'trips',
    category: 'core',
    defaultTitle: 'Đoàn công tác & di chuyển',
    defaultIcon: 'Plane',
    defaultDesc: 'Lịch trình công tác, đặt vé máy bay, phòng khách sạn, xe đưa đón và tạm ứng công tác phí.',
    badgeQuery: 'pendingTrips',
    supportsFlightEngine: true,
  },
  {
    key: 'tickets',
    baseId: 'tickets',
    category: 'core',
    defaultTitle: 'Hộp thư & tiếp nhận yêu cầu',
    defaultIcon: 'Mail',
    defaultDesc: 'Tiếp nhận email, hotline phản ánh, phân công chuyên viên xử lý và theo dõi hạn phản hồi.',
    badgeQuery: 'openTickets',
  },
  {
    key: 'report',
    baseId: 'report',
    category: 'core',
    defaultTitle: 'Báo cáo tổng hợp',
    defaultIcon: 'FileBarChart',
    defaultDesc: 'Thống kê tổng hợp số liệu tiến độ, tài chính, nhân sự và biểu đồ KPI của dự án.',
    badgeQuery: 'alwaysVisible',
  },

  // --- Phân hệ Đào tạo & Học thuật (Academic Modules) ---
  {
    key: 'students',
    baseId: 'students',
    category: 'academic',
    defaultTitle: 'Sinh viên / Thí sinh',
    defaultIcon: 'GraduationCap',
    defaultDesc: 'Danh sách hồ sơ nhân sự, tình trạng học tập / hồ sơ dự tuyển, học phí và tài khoản LMS.',
    badgeQuery: 'unpaidOrPending',
  },
  {
    key: 'sessions',
    baseId: 'sessions',
    category: 'academic',
    defaultTitle: 'Kế hoạch & lịch giảng',
    defaultIcon: 'CalendarDays',
    defaultDesc: 'Lịch từng buổi học, phòng học, hình thức trực tiếp/online và đối soát xác nhận hai bên.',
    badgeQuery: 'unconfirmedSessions',
  },
  {
    key: 'exams',
    baseId: 'exams',
    category: 'academic',
    defaultTitle: 'Khảo thí & tổ chức thi',
    defaultIcon: 'ClipboardCheck',
    defaultDesc: 'Lịch thi giữa kỳ, cuối kỳ, danh sách phòng thi, cán bộ coi thi và tình trạng nộp bài.',
    badgeQuery: 'upcomingExams',
  },
  {
    key: 'lecturers',
    baseId: 'lecturers',
    category: 'academic',
    defaultTitle: 'Giảng viên & chuyên gia',
    defaultIcon: 'Presentation',
    defaultDesc: 'Hồ sơ chuyên gia, học vị, thù lao theo giờ, hợp đồng thỉnh giảng và syllabus môn học.',
    badgeQuery: 'unsignedContracts',
  },
  {
    key: 'grades',
    baseId: 'grades',
    category: 'academic',
    defaultTitle: 'Điểm số & chuẩn tốt nghiệp',
    defaultIcon: 'Award',
    defaultDesc: 'Điểm học phần theo thang 20, tự động quy đổi thang 10 và xét điều kiện tốt nghiệp bằng kép.',
    badgeQuery: 'missingGrades',
  },
  {
    key: 'transfers',
    baseId: 'transfers',
    category: 'academic',
    defaultTitle: 'Học phí chuyển đối tác',
    defaultIcon: 'Coins',
    defaultDesc: 'Đối soát số lượng sinh viên, đề nghị chuyển tiền quốc tế và công nợ theo học kỳ.',
    badgeQuery: 'pendingTransfers',
  },

  // --- Phân hệ Quỹ Đầu tư Mạo hiểm tỉnh Gia Lai / Khánh Hòa ---
  {
    key: 'gl_docs',
    baseId: 'gl_docs',
    category: 'venture_fund',
    defaultTitle: 'Văn bản & Pháp lý Sở Ngành',
    defaultIcon: 'FileText',
    defaultDesc: 'Công văn đi/đến (Sở KH&CN, Sở Tài chính, Cục Thuế, Sở Công thương), Tờ trình, Quyết định giao nhiệm vụ.',
    badgeQuery: 'pendingDocs',
  },
  {
    key: 'gl_surveys',
    baseId: 'gl_surveys',
    category: 'venture_fund',
    defaultTitle: 'Khảo sát & Dữ liệu Đầu vào',
    defaultIcon: 'Database',
    defaultDesc: 'Phiếu đề nghị cung cấp thông tin, chỉ số PII, báo cáo KTXH Gia Lai, số liệu DN & HTX.',
    badgeQuery: 'pendingSurveys',
  },
  {
    key: 'gl_drafts',
    baseId: 'gl_drafts',
    category: 'venture_fund',
    defaultTitle: 'Soạn thảo & Biên tập Đề án',
    defaultIcon: 'BookOpenCheck',
    defaultDesc: 'Phiên bản đề cương, Dự thảo Đề án v1.0, v6.3, Bản tóm tắt rút gọn, Bản chuẩn format UEH.',
    badgeQuery: 'pendingDrafts',
  },
  {
    key: 'gl_meetings',
    baseId: 'gl_meetings',
    category: 'venture_fund',
    defaultTitle: 'Lịch làm việc & Hội thảo Thống nhất',
    defaultIcon: 'CalendarClock',
    defaultDesc: 'Lịch làm việc trực tiếp tại Tỉnh, trao đổi kỹ thuật với Tổ chuyên viên Sở KH&CN, Hội thảo tham vấn chuyên gia.',
    badgeQuery: 'upcomingMeetings',
  },
  {
    key: 'gl_trips',
    baseId: 'gl_trips',
    category: 'venture_fund',
    defaultTitle: 'Đoàn công tác & Khảo sát Địa phương',
    defaultIcon: 'PlaneTakeoff',
    defaultDesc: 'Hậu cần công tác Pleiku/Gia Lai: Đề xuất & đặt vé máy bay đoàn chuyên gia UEH, khách sạn, xe đưa đón; tích hợp luồng vé máy bay & phiếu đề nghị.',
    badgeQuery: 'pendingTrips',
  },
  {
    key: 'gl_experts',
    baseId: 'gl_experts',
    category: 'venture_fund',
    defaultTitle: 'Nhóm Chuyên gia & Phân công Biên soạn',
    defaultIcon: 'UsersRound',
    defaultDesc: 'Danh sách chuyên gia tư vấn UEH, phân công phụ trách phần đề án: Cơ sở pháp lý, Mô hình vận hành quỹ, Cơ chế thoái vốn...',
    badgeQuery: 'pendingExperts',
  },
  {
    key: 'gl_legal_lib',
    baseId: 'gl_legal_lib',
    category: 'venture_fund',
    defaultTitle: 'Thư viện Pháp lý & Tham khảo',
    defaultIcon: 'Library',
    defaultDesc: 'Nghị định 365, Nghị định 366, Luật Doanh nghiệp, Nghị quyết HĐND tỉnh, mô hình Quỹ ĐTMH TP.HCM / quốc tế.',
    badgeQuery: 'alwaysVisible',
  },
  {
    key: 'gl_finance',
    baseId: 'gl_finance',
    category: 'venture_fund',
    defaultTitle: 'Chi phí & Quyết toán Hợp đồng Tư vấn',
    defaultIcon: 'Calculator',
    defaultDesc: 'Tạm ứng, thù lao viết chuyên đề, công tác phí khảo sát, hồ sơ thanh quyết toán với Sở KH&CN.',
    badgeQuery: 'pendingExpenses',
  },
]

/**
 * Các mẫu dự án chuẩn (Project Workspace Templates)
 */
export const PROJECT_TEMPLATES = {
  academic_partnership: {
    id: 'academic_partnership',
    name: 'Chương trình Đào tạo Song bằng Quốc tế',
    desc: 'Đầy đủ 10 phân hệ vận hành đào tạo quốc tế: sinh viên, lịch giảng, thi cử, bảng điểm, giảng viên, công tác, chuyển tiền và văn bản MOA.',
    icon: 'GraduationCap',
    modules: [
      { moduleKey: 'docs', isEnabled: true, customTitle: 'Văn bản & hồ sơ', sortOrder: 1 },
      { moduleKey: 'students', isEnabled: true, customTitle: 'Sinh viên song bằng', sortOrder: 2 },
      { moduleKey: 'sessions', isEnabled: true, customTitle: 'Kế hoạch & lịch giảng', sortOrder: 3 },
      { moduleKey: 'exams', isEnabled: true, customTitle: 'Khảo thí & điểm', sortOrder: 4 },
      { moduleKey: 'lecturers', isEnabled: true, customTitle: 'Giảng viên & hợp đồng', sortOrder: 5 },
      { moduleKey: 'trips', isEnabled: true, customTitle: 'Đoàn công tác GV Rennes', sortOrder: 6 },
      { moduleKey: 'transfers', isEnabled: true, customTitle: 'Học phí chuyển Rennes', sortOrder: 7 },
      { moduleKey: 'expenses', isEnabled: true, customTitle: 'Chi phí & quyết toán', sortOrder: 8 },
      { moduleKey: 'grades', isEnabled: true, customTitle: 'Điểm học phần Rennes', sortOrder: 9 },
      { moduleKey: 'tickets', isEnabled: true, customTitle: 'Hộp thư sinh viên', sortOrder: 10 },
      { moduleKey: 'report', isEnabled: true, customTitle: 'Báo cáo tổng hợp', sortOrder: 11 },
    ],
  },
  admissions_campaign: {
    id: 'admissions_campaign',
    name: 'Chiến dịch Tuyển sinh & Truyền thông',
    desc: 'Tinh gọn cho tuyển sinh: Quản lý đề án tuyển sinh, ngân sách MKT, hồ sơ thí sinh đăng ký, hộp thư tư vấn và báo cáo tuyển sinh.',
    icon: 'Megaphone',
    modules: [
      { moduleKey: 'docs', isEnabled: true, customTitle: 'Đề án & tài liệu tuyển sinh', customDesc: 'Đề án tuyển sinh, thông báo xét tuyển, biểu mẫu hồ sơ và quy định học phí.', sortOrder: 1 },
      { moduleKey: 'students', isEnabled: true, customTitle: 'Hồ sơ thí sinh & nhập học', customDesc: 'Theo dõi danh sách thí sinh nộp hồ sơ, tình trạng xét tuyển, học phí nhập học.', sortOrder: 2 },
      { moduleKey: 'expenses', isEnabled: true, customTitle: 'Ngân sách & chi phí MKT', customDesc: 'Chi phí quảng cáo đa kênh, tổ chức Open Day, in ấn tài liệu và chi sự kiện.', sortOrder: 3 },
      { moduleKey: 'tickets', isEnabled: true, customTitle: 'Hộp thư tư vấn & Hotline', customDesc: 'Tiếp nhận câu hỏi từ phụ huynh/thí sinh qua fanpage, email và phân công tư vấn viên.', sortOrder: 4 },
      { moduleKey: 'report', isEnabled: true, customTitle: 'Báo cáo tuyển sinh', customDesc: 'Phễu chuyển đổi tuyển sinh, tiến độ chỉ tiêu và tổng hợp chi phí tuyển sinh.', sortOrder: 5 },
      // Tắt các module đào tạo
      { moduleKey: 'sessions', isEnabled: false, customTitle: 'Kế hoạch & lịch giảng', sortOrder: 6 },
      { moduleKey: 'exams', isEnabled: false, customTitle: 'Khảo thí & tổ chức thi', sortOrder: 7 },
      { moduleKey: 'lecturers', isEnabled: false, customTitle: 'Giảng viên & chuyên gia', sortOrder: 8 },
      { moduleKey: 'trips', isEnabled: false, customTitle: 'Đoàn công tác', sortOrder: 9 },
      { moduleKey: 'transfers', isEnabled: false, customTitle: 'Chuyển tiền đối tác', sortOrder: 10 },
      { moduleKey: 'grades', isEnabled: false, customTitle: 'Điểm số học phần', sortOrder: 11 },
    ],
  },
  investment_fund: {
    id: 'investment_fund',
    name: 'Quỹ Đầu tư & Thẩm định Dự án',
    desc: 'Dành cho các quỹ phát triển, quỹ nghiên cứu: Quản lý hồ sơ pháp lý, ngân sách giải ngân, đoàn công tác khảo sát thực địa và báo cáo.',
    icon: 'Briefcase',
    modules: [
      { moduleKey: 'docs', isEnabled: true, customTitle: 'Hồ sơ pháp lý & thỏa thuận đầu tư', customDesc: 'Hợp đồng đầu tư, thỏa thuận cổ đông, biên bản thẩm định và nghị quyết HĐQL.', sortOrder: 1 },
      { moduleKey: 'expenses', isEnabled: true, customTitle: 'Giải ngân & chi phí thẩm định', customDesc: 'Theo dõi các đợt giải ngân, chi phí thẩm định pháp lý (DD) và tài chính.', sortOrder: 2 },
      { moduleKey: 'trips', isEnabled: true, customTitle: 'Đoàn công tác & khảo sát thực địa', customDesc: 'Lịch công tác của ban điều hành, vé máy bay, khách sạn khi khảo sát dự án.', sortOrder: 3 },
      { moduleKey: 'tickets', isEnabled: true, customTitle: 'Tiếp nhận hồ sơ đề án', customDesc: 'Hòm thư tiếp nhận pitch deck từ doanh nghiệp/dự án cần gọi vốn.', sortOrder: 4 },
      { moduleKey: 'report', isEnabled: true, customTitle: 'Báo cáo danh mục & ROI', customDesc: 'Tổng hợp danh mục giải ngân, tiến độ thoái vốn và tỷ suất sinh lời.', sortOrder: 5 },
      { moduleKey: 'students', isEnabled: false, customTitle: 'Sinh viên', sortOrder: 6 },
      { moduleKey: 'sessions', isEnabled: false, customTitle: 'Lịch trình', sortOrder: 7 },
      { moduleKey: 'exams', isEnabled: false, customTitle: 'Khảo thí', sortOrder: 8 },
      { moduleKey: 'lecturers', isEnabled: false, customTitle: 'Chuyên gia', sortOrder: 9 },
      { moduleKey: 'transfers', isEnabled: false, customTitle: 'Chuyển tiền', sortOrder: 10 },
      { moduleKey: 'grades', isEnabled: false, customTitle: 'Điểm số', sortOrder: 11 },
    ],
  },
  consulting_research: {
    id: 'consulting_research',
    name: 'Dự án Tư vấn Doanh nghiệp & Đề tài Nghiên cứu',
    desc: 'Dành cho viện nghiên cứu, trung tâm tư vấn: Quản lý hợp đồng dịch vụ, chuyên gia tư vấn, chi phí đề tài và lịch phỏng vấn doanh nghiệp.',
    icon: 'FolderKanban',
    modules: [
      { moduleKey: 'docs', isEnabled: true, customTitle: 'Hợp đồng & báo cáo nghiệm thu', customDesc: 'Hợp đồng tư vấn, đề cương nghiên cứu, báo cáo chuyên đề và biên bản nghiệm thu.', sortOrder: 1 },
      { moduleKey: 'lecturers', isEnabled: true, customTitle: 'Chuyên gia & cộng tác viên', customDesc: 'Danh sách chuyên gia phụ trách từng chuyên đề, học hàm, thù lao tư vấn.', sortOrder: 2 },
      { moduleKey: 'sessions', isEnabled: true, customTitle: 'Lịch làm việc & phỏng vấn sâu', customDesc: 'Lịch làm việc với doanh nghiệp, hội thảo chuyên đề và lịch thu thập dữ liệu.', sortOrder: 3 },
      { moduleKey: 'trips', isEnabled: true, customTitle: 'Công tác & khảo sát doanh nghiệp', customDesc: 'Vé máy bay, khách sạn, di chuyển của đoàn chuyên gia khảo sát tại nhà máy/tỉnh thành.', sortOrder: 4 },
      { moduleKey: 'expenses', isEnabled: true, customTitle: 'Chi phí đề tài & hội thảo', customDesc: 'Chi phí điều tra khảo sát, thù lao viết chuyên đề, chi phí xuất bản và hội thảo.', sortOrder: 5 },
      { moduleKey: 'report', isEnabled: true, customTitle: 'Tiến độ & báo cáo đề tài', customDesc: 'Tổng hợp tiến độ hoàn thành các mốc milestone và ngân sách còn lại.', sortOrder: 6 },
      { moduleKey: 'students', isEnabled: false, customTitle: 'Sinh viên', sortOrder: 7 },
      { moduleKey: 'exams', isEnabled: false, customTitle: 'Khảo thí', sortOrder: 8 },
      { moduleKey: 'grades', isEnabled: false, customTitle: 'Điểm số', sortOrder: 9 },
      { moduleKey: 'transfers', isEnabled: false, customTitle: 'Chuyển tiền', sortOrder: 10 },
      { moduleKey: 'tickets', isEnabled: false, customTitle: 'Hộp thư', sortOrder: 11 },
    ],
  },
}

/**
 * Trả về danh sách phân hệ được cấu hình cho một dự án cụ thể.
 * Tự động hợp nhất Base Module Schema + Project Custom Configuration.
 */
export function getProjectConfiguredModules(project) {
  if (!project) return MODULES

  // Nếu dự án đã có cấu hình `modulesConfig`:
  let configList = project.modulesConfig

  // Nếu chưa có cấu hình riêng (dữ liệu cũ hoặc dự án mới tạo):
  if (!configList || !configList.length) {
    if (project.id === 'p2' || project.code?.includes('TS') || /tuyển sinh|admissions/i.test(project.name || '')) {
      configList = PROJECT_TEMPLATES.admissions_campaign.modules
    } else {
      configList = PROJECT_TEMPLATES.academic_partnership.modules
    }
  }

  // Lọc chỉ lấy các module đang được BẬT (isEnabled !== false)
  const enabledConfigs = configList
    .filter((c) => c.isEnabled !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  // Map sang schema module đầy đủ
  const result = []
  enabledConfigs.forEach((cfg, idx) => {
    const baseMod = MODULE[cfg.moduleKey]
    if (baseMod) {
      result.push({
        ...baseMod,
        customKey: cfg.moduleKey,
        name: cfg.customTitle || baseMod.name,
        icon: cfg.customIcon || baseMod.icon,
        desc: cfg.customDesc || baseMod.desc,
        sortOrder: cfg.sortOrder ?? idx,
      })
    }
  })

  return result.length > 0 ? result : MODULES
}
