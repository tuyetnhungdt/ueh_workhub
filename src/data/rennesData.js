// Dữ liệu đồng bộ từ gói bàn giao UEH-Rennes v1.0 (14/11/2026)

export const RENNES_META = {
  "package": "UEH-Rennes Program Operations - Web Handover",
  "version": "v1.0-draft",
  "export_date": "2026-11-14",
  "basis": "10 approved workstreams + live Airtable Rennes schema + attached Checklist - Vận hành.xlsx",
  "scope": "Sanitized vendor handover; not a student/financial/contract production data export",
  "counts": {
    "workstreams": 10,
    "teaching_groups": 2,
    "cohorts": 3,
    "current_tasks": 34,
    "source_checklist_rows": 56,
    "source_progress_conflicts": 18
  },
  "statuses_note": "34 task statuses are snapshot; 56 historical checklist rows all require reconciliation. No student-level details, payment amounts, credentials or private links included."
};

export const APPROVED_WORKSTREAMS = [
  {
    "code": "01",
    "name": "Quản trị chương trình, hành chính và văn bản",
    "scope": "MOA, phụ lục hợp tác, công văn, xác nhận đối tác, phân công trách nhiệm, họp điều hành",
    "domain": "Quản trị – học vụ"
  },
  {
    "code": "02",
    "name": "Quản lý khóa và hồ sơ sinh viên",
    "scope": "Khóa K50–K51 & K52; danh sách SV, đăng ký, tình trạng học tập, tài khoản Rennes, chuyển danh sách SV song bằng",
    "domain": "Quản trị – học vụ"
  },
  {
    "code": "03",
    "name": "Kế hoạch đào tạo và lịch giảng",
    "scope": "Học phần UEH/Rennes, lịch giảng, xác nhận hai phía, xung đột lịch, phòng học, pre-course",
    "domain": "Quản trị – học vụ"
  },
  {
    "code": "04",
    "name": "Khảo thí, chuyển đổi điểm và tốt nghiệp",
    "scope": "Kiểm tra/thi, bảng điểm, phúc khảo, quy đổi điểm, công nhận tín chỉ, điều kiện cấp hai bằng",
    "domain": "Học thuật – chất lượng"
  },
  {
    "code": "05",
    "name": "Giảng viên, đợt công tác và hợp đồng",
    "scope": "Phân công GV Rennes/UEH, số giờ giảng, hồ sơ GV, hợp đồng, xác nhận hoàn thành giảng dạy",
    "domain": "Giảng viên – hậu cần"
  },
  {
    "code": "06",
    "name": "Hậu cần giảng viên Rennes",
    "scope": "Vé máy bay, khách sạn, visa, đón tiễn, lịch công tác, thay đổi chuyến bay",
    "domain": "Giảng viên – hậu cần"
  },
  {
    "code": "07",
    "name": "Học phí và thanh toán cho Rennes",
    "scope": "Nghĩa vụ học phí SV, đối soát số SV, căn cứ tính tiền, đề nghị chuyển tiền, xác nhận Rennes đã nhận",
    "domain": "Tài chính"
  },
  {
    "code": "08",
    "name": "Chi phí vận hành và quyết toán tài chính",
    "scope": "Dự toán, thù lao GV, vé máy bay, khách sạn, chứng từ, thanh toán chi phí, quyết toán theo kỳ",
    "domain": "Tài chính"
  },
  {
    "code": "09",
    "name": "Công tác sinh viên, truyền thông và đảm bảo chất lượng",
    "scope": "Hỗ trợ SV, định hướng, phản hồi học vụ, khảo sát môn học, đánh giá GV, tuyển sinh, truyền thông",
    "domain": "Sinh viên – truyền thông"
  },
  {
    "code": "10",
    "name": "Quản trị dữ liệu, báo cáo và kiểm soát tiến độ",
    "scope": "Dashboard, lưu trữ hồ sơ, báo cáo định kỳ, deadline, đầu việc chờ xác nhận và cảnh báo phát sinh",
    "domain": "Dữ liệu – kiểm soát"
  }
];

export const COHORTS = [
  {
    "code": "K50–K51",
    "teaching_group": "K50–K51"
  },
  {
    "code": "K52",
    "teaching_group": "K52"
  }
];

export const TEACHING_GROUPS = [
  {
    "code": "K50–K51",
    "cohorts": [
      "K50–K51"
    ],
    "is_shared": false
  },
  {
    "code": "K52",
    "cohorts": [
      "K52"
    ],
    "is_shared": false
  }
];

export const CURRENT_TASKS = [
  {
    "external_ref": "OP-001",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Xác nhận đề cương học phần Rennes và bản dịch tiếng Việt",
    "category_code": "03",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-002",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Đối chiếu mapping tín chỉ UEH–Rennes",
    "category_code": "04",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-003",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Số hóa hồ sơ giảng viên, hợp đồng và biên bản",
    "category_code": "10",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-004",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Đối chiếu nghĩa vụ học phí sinh viên song bằng",
    "category_code": "07",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-005",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Chuẩn bị và đối chiếu hồ sơ hợp đồng giảng dạy",
    "category_code": "05",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-006",
    "source_table": "Công việc vận hành",
    "title": "[K52] Chuẩn bị và đối chiếu hồ sơ hợp đồng giảng dạy",
    "category_code": "05",
    "teaching_group": "K52",
    "cohort_scope": "K52",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-007",
    "source_table": "Công việc vận hành",
    "title": "[K52] Kiểm tra tiến độ thanh toán, chứng từ và quyết toán",
    "category_code": "08",
    "teaching_group": "K52",
    "cohort_scope": "K52",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-008",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Rà soát và đặt vé máy bay giảng viên",
    "category_code": "06",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-009",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Xác nhận phân công giảng viên UEH theo học kỳ",
    "category_code": "05",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-010",
    "source_table": "Công việc vận hành",
    "title": "[K52] Rà soát và đặt vé máy bay giảng viên",
    "category_code": "06",
    "teaching_group": "K52",
    "cohort_scope": "K52",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-011",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Sắp xếp khách sạn và hậu cần lưu trú",
    "category_code": "06",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-012",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Khảo sát SV và đánh giá giảng viên sau mỗi học phần",
    "category_code": "09",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-013",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Rà soát kế hoạch học thuật năm học 2026–2027",
    "category_code": "03",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-014",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Hoàn thiện sổ tay sinh viên song bằng VI–EN",
    "category_code": "09",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-015",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Kiểm tra tiến độ thanh toán, chứng từ và quyết toán",
    "category_code": "08",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-016",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Đối chiếu học phần và lịch giảng do Rennes cung cấp",
    "category_code": "03",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-017",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Tổ chức họp Ban điều phối UEH–Rennes định kỳ",
    "category_code": "01",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-018",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Rà soát, cải tiến chương trình sau học kỳ 1",
    "category_code": "09",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-019",
    "source_table": "Công việc vận hành",
    "title": "[K52] Sắp xếp khách sạn và hậu cần lưu trú",
    "category_code": "06",
    "teaching_group": "K52",
    "cohort_scope": "K52",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-020",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Thiết lập và đối soát tiến độ tích lũy tín chỉ từng sinh viên",
    "category_code": "10",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-021",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Xác nhận danh sách SV song bằng",
    "category_code": "02",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-022",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Rà soát nội dung, hình thức và tài liệu pre-course",
    "category_code": "03",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-023",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Kiểm tra tài khoản LMS Rennes cho sinh viên",
    "category_code": "02",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-024",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Gửi và lưu xác nhận lịch giảng chính thức",
    "category_code": "03",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-025",
    "source_table": "Công việc vận hành",
    "title": "[K52] Đối chiếu học phần và lịch giảng do Rennes cung cấp",
    "category_code": "03",
    "teaching_group": "K52",
    "cohort_scope": "K52",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-026",
    "source_table": "Công việc vận hành",
    "title": "[K50–K51] Lập báo cáo tiến độ học kỳ gửi UEH và Rennes",
    "category_code": "10",
    "teaching_group": "K50–K51",
    "cohort_scope": "K50–K51",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "OP-027",
    "source_table": "Công việc vận hành",
    "title": "[K52] Gửi và lưu xác nhận lịch giảng chính thức",
    "category_code": "03",
    "teaching_group": "K52",
    "cohort_scope": "K52",
    "status": "Chờ dữ liệu",
    "priority": "P2",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Chưa xác nhận tiến độ thực tế"
  },
  {
    "external_ref": "ADM-001",
    "source_table": "Hành chính và văn bản",
    "title": "Rà soát kế hoạch học kỳ 2027 và tuyển sinh K53",
    "category_code": "03",
    "teaching_group": "",
    "cohort_scope": "Chưa xác minh/Toàn chương trình",
    "status": "Đang thực hiện",
    "priority": "",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Giữ nguyên trạng thái Airtable tại thời điểm đối chiếu; không xuất người phụ trách riêng"
  },
  {
    "external_ref": "ADM-002",
    "source_table": "Hành chính và văn bản",
    "title": "Xử lý trường hợp SV K50 học phần Kinh tế lượng chuỗi thời gian",
    "category_code": "09",
    "teaching_group": "",
    "cohort_scope": "Chưa xác minh/Toàn chương trình",
    "status": "Hoàn tất",
    "priority": "",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Giữ nguyên trạng thái Airtable tại thời điểm đối chiếu; không xuất người phụ trách riêng"
  },
  {
    "external_ref": "ADM-003",
    "source_table": "Hành chính và văn bản",
    "title": "Theo dõi chăm sóc sinh viên và phản hồi học vụ",
    "category_code": "09",
    "teaching_group": "",
    "cohort_scope": "Chưa xác minh/Toàn chương trình",
    "status": "Đang thực hiện",
    "priority": "",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Giữ nguyên trạng thái Airtable tại thời điểm đối chiếu; không xuất người phụ trách riêng"
  },
  {
    "external_ref": "ADM-004",
    "source_table": "Hành chính và văn bản",
    "title": "Chuyển tiền và gửi danh sách sinh viên năm 3 cho phía Rennes",
    "category_code": "07",
    "teaching_group": "",
    "cohort_scope": "Chưa xác minh/Toàn chương trình",
    "status": "Chưa bắt đầu",
    "priority": "",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Giữ nguyên trạng thái Airtable tại thời điểm đối chiếu; không xuất người phụ trách riêng"
  },
  {
    "external_ref": "ADM-005",
    "source_table": "Hành chính và văn bản",
    "title": "Rà soát vận hành học vụ và kế hoạch các học phần Rennes",
    "category_code": "03",
    "teaching_group": "",
    "cohort_scope": "Chưa xác minh/Toàn chương trình",
    "status": "Hoàn tất",
    "priority": "",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Giữ nguyên trạng thái Airtable tại thời điểm đối chiếu; không xuất người phụ trách riêng"
  },
  {
    "external_ref": "ADM-006",
    "source_table": "Hành chính và văn bản",
    "title": "Xác nhận quy định và bảng chuyển đổi điểm UEH–Rennes",
    "category_code": "04",
    "teaching_group": "",
    "cohort_scope": "Chưa xác minh/Toàn chương trình",
    "status": "Chưa bắt đầu",
    "priority": "",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Giữ nguyên trạng thái Airtable tại thời điểm đối chiếu; không xuất người phụ trách riêng"
  },
  {
    "external_ref": "ADM-007",
    "source_table": "Hành chính và văn bản",
    "title": "Kiểm tra biểu mẫu song bằng gửi Đại sứ quán Pháp",
    "category_code": "01",
    "teaching_group": "",
    "cohort_scope": "Chưa xác minh/Toàn chương trình",
    "status": "Hoàn tất",
    "priority": "",
    "deadline": "",
    "follow_up": "",
    "owner": "",
    "verification": "Giữ nguyên trạng thái Airtable tại thời điểm đối chiếu; không xuất người phụ trách riêng"
  }
];

export const LEGACY_CHECKLIST = [
  {
    "source_task_code": "T001",
    "legacy_group": "Học Vụ & Đào Tạo",
    "task_title": "Thông báo đóng học phí",
    "detail": "Học phí UEH và song bằng [mức học phí cần xác minh]. Chốt thời gian đóng tiền",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "Ngay",
    "source_status": "Đã triển khai",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "07",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T002",
    "legacy_group": "Học Vụ & Đào Tạo",
    "task_title": "Xác nhận sinh viên đã hoàn tất nghĩa vụ tài chính",
    "detail": "Kiểm tra danh sách SV đã hoàn tấn nghĩa vụ tài chính",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "Sau hạn đóng HP",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "07",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T003",
    "legacy_group": "Học Vụ & Đào Tạo",
    "task_title": "Xác nhận danh sách sinh viên tham gia song bằng từ UEH và Rennes",
    "detail": "Xác nhận và tách line quản lý riêng cho K50 và K51 theo chương trình thường và song bằng. Chuyển đổi chương trình cho sinh viên đăng ký song bằng, riêng từng khoá. Xác nhận của Rennes và phụ lục MOA.",
    "legacy_owner_role": "PD",
    "timeline_original": "Theo danh sách ĐK",
    "source_status": "Đã triển khai",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 50,
    "category_code": "02",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T004",
    "legacy_group": "Học Vụ & Đào Tạo",
    "task_title": "Gửi thông báo lịch học cập nhật",
    "detail": "Gửi lịch chính thức sau khi điều chỉnh. Các môn có GS Pháp sẽ học trong 1 tuần.",
    "legacy_owner_role": "PD",
    "timeline_original": "Sau khi tách line quản lý",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T004b",
    "legacy_group": "Học Vụ & Đào Tạo",
    "task_title": "Mở lớp học phần trên hệ thống UEH",
    "detail": "Tạo mã lớp cho tất cả môn HK1",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T7/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T004c",
    "legacy_group": "Học Vụ & Đào Tạo",
    "task_title": "Cấp tài khoản LMS Rennes cho sinh viên",
    "detail": "SV có access tài liệu và portal Rennes",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "Trước khai giảng",
    "source_status": "Chờ xử lý",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "02",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T005",
    "legacy_group": "Money and Banking",
    "task_title": "Rà soát lịch K50",
    "detail": "Trùng 24/08 môn SQL K51 – cần dời",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T006",
    "legacy_group": "Money and Banking",
    "task_title": "Rà soát lịch K51",
    "detail": "Trùng 28/08 môn TCDN NC K50 – cần dời; 2 môn Sản phẩm phải sinh & KTL dữ liệu bảng hoán đổi cho kỳ sau",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T007",
    "legacy_group": "Money and Banking",
    "task_title": "Gom lớp K50+K51 (>86 SV)",
    "detail": "Gộp 2 chương trình, tổng >80 SV theo đề xuất Dean & Rennes",
    "legacy_owner_role": "PD, SOF",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T008",
    "legacy_group": "Money and Banking",
    "task_title": "Kiểm tra & đặt phòng học",
    "detail": "Chuyển về cơ sở B, phòng đủ 86 SV",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T009",
    "legacy_group": "Money and Banking",
    "task_title": "Chốt lịch với Rennes",
    "detail": "26/07 – 02/08/2026. Dời lịch học UEH tuần đó",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "Đã chốt",
    "source_status": "Đã triển khai",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T010",
    "legacy_group": "Macroeconomics",
    "task_title": "Rà soát lịch K50",
    "detail": "Kiểm tra trùng lịch chính khóa K50 tuần 24-29/8",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T011",
    "legacy_group": "Macroeconomics",
    "task_title": "Rà soát lịch K51",
    "detail": "Kiểm tra trùng lịch chính khóa K51 tuần 24-29/8",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T012",
    "legacy_group": "Macroeconomics",
    "task_title": "Đề xuất tách riêng khỏi chương trình AF",
    "detail": "Quyết định K50+K51 học chung, tách riêng AF",
    "legacy_owner_role": "PD, SOF",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T013",
    "legacy_group": "Macroeconomics",
    "task_title": "Bố trí phòng học",
    "detail": "Đặt phòng phù hợp số lượng SV",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T014",
    "legacy_group": "Macroeconomics",
    "task_title": "Chốt lịch với Rennes",
    "detail": "24/08 – 29/08/2026. Dời lịch học UEH tuần đó",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "Đã chốt",
    "source_status": "Đã triển khai",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T015",
    "legacy_group": "Pre-Course",
    "task_title": "Xác định nội dung pre-course",
    "detail": "Xác định kiến thức nền cần ôn trước Money&Banking và Macro",
    "legacy_owner_role": "PD",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T016",
    "legacy_group": "Pre-Course",
    "task_title": "Quyết định hình thức online/offline",
    "detail": "Xác định hình thức tổ chức tuần học pre",
    "legacy_owner_role": "PD",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T017",
    "legacy_group": "Pre-Course",
    "task_title": "Xây dựng tài liệu pre-course",
    "detail": "Slide, reading list, bài tập chuẩn bị",
    "legacy_owner_role": "PD",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T018",
    "legacy_group": "Pre-Course",
    "task_title": "Bố trí lịch học pre-course",
    "detail": "Xếp lịch cụ thể cho từng buổi pre (giảng viên UEH giảng)",
    "legacy_owner_role": "PD",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T019",
    "legacy_group": "Pre-Course",
    "task_title": "Tuyển trợ giảng hỗ trợ",
    "detail": "Tuyển TA hỗ trợ GV trong tuần pre-course",
    "legacy_owner_role": "PD",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "05",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T020",
    "legacy_group": "Pre-Course",
    "task_title": "Thống nhất Rennes chi trả trợ giảng",
    "detail": "Rennes xác nhận chi trả thù lao trợ giảng pre-course",
    "legacy_owner_role": "AF",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "08",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T021",
    "legacy_group": "Tài Chính & Thanh Toán",
    "task_title": "Xác định cơ chế chi trả GV Rennes",
    "detail": "Ký hợp đồng thỉnh giảng, thù lao, quy trình",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "05",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T022",
    "legacy_group": "Tài Chính & Thanh Toán",
    "task_title": "Quy trình thanh toán",
    "detail": "Xây dựng quy trình thanh toán chi phí Đề án",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "08",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T022b",
    "legacy_group": "Tài Chính & Thanh Toán",
    "task_title": "Dự toán chi phí HK1 tổng thể",
    "detail": "Lập dự toán: GV, hậu cần, in ấn, vé, KS",
    "legacy_owner_role": "PD",
    "timeline_original": "T6/2026",
    "source_status": "Chờ lập",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "08",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T022c",
    "legacy_group": "Tài Chính & Thanh Toán",
    "task_title": "Dự toán ngân sách vận hành cả năm",
    "detail": "Kế hoạch tài chính 2026-2027 toàn bộ 7 HK",
    "legacy_owner_role": "PD",
    "timeline_original": "T7/2026",
    "source_status": "Đã triển khai",
    "priority_source": "Cao",
    "semester_source": "Toàn CT",
    "progress_source_pct": 100,
    "category_code": "08",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T023",
    "legacy_group": "Hậu Cần & Tiếp Đón",
    "task_title": "Đặt khách sạn GV Rennes đợt 1",
    "detail": "Khách sạn UEH cho đợt Money&Banking + Macro",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "06",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T024",
    "legacy_group": "Hậu Cần & Tiếp Đón",
    "task_title": "Đặt vé máy bay Air France",
    "detail": "Vé cho GV Rennes: Poutineau, Casteuble (đợt 1)",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Khẩn",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "06",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T025",
    "legacy_group": "Hậu Cần & Tiếp Đón",
    "task_title": "Kế hoạch ăn uống & làm việc",
    "detail": "Lịch lunch/dinner, văn phòng làm việc cho GV Rennes",
    "legacy_owner_role": "Admin Đề án + AF",
    "timeline_original": "T7/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "06",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T025b",
    "legacy_group": "Hậu Cần & Tiếp Đón",
    "task_title": "Hỗ trợ thủ tục nhập cảnh GV",
    "detail": "Thư mời, hỗ trợ visa nếu cần cho GV Rennes",
    "legacy_owner_role": "Hành chính",
    "timeline_original": "T6/2026",
    "source_status": "Chưa cần",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "06",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T025c",
    "legacy_group": "Hậu Cần & Tiếp Đón",
    "task_title": "Đặt vé + KS đợt 2 (T11-12/2026)",
    "detail": "Hậu cần đợt Int. Finance, Derivatives, Time Series",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T9/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Thấp",
    "semester_source": "HK2",
    "progress_source_pct": 0,
    "category_code": "06",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T025d",
    "legacy_group": "Hậu Cần & Tiếp Đón",
    "task_title": "Đặt vé + KS đợt 3 (T5-6/2027)",
    "detail": "Hậu cần đợt Panel Data, Fin. Econometrics",
    "legacy_owner_role": "AdminaĐề án",
    "timeline_original": "T3/2027",
    "source_status": "Chờ xử lý",
    "priority_source": "Thấp",
    "semester_source": "HK3-7",
    "progress_source_pct": 0,
    "category_code": "06",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T026",
    "legacy_group": "Giảng Viên & Hợp Đồng",
    "task_title": "Hợp đồng GV Rennes đợt 1 (Money&Banking + Macro)",
    "detail": "Soạn thảo và ký HĐ thỉnh giảng đợt 26/7 và 24/8",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T6/2026",
    "source_status": "Đang xử lý",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 30,
    "category_code": "05",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T027",
    "legacy_group": "Giảng Viên & Hợp Đồng",
    "task_title": "Phân công GV UEH HK1",
    "detail": "Xác nhận GV dạy: SQL, VBA, KTL, Kế toán TC...",
    "legacy_owner_role": "PD",
    "timeline_original": "T6/2026",
    "source_status": "Đang xử lý",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 50,
    "category_code": "05",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T028",
    "legacy_group": "Giảng Viên & Hợp Đồng",
    "task_title": "Hợp đồng GV Rennes đợt 2 (HK4+5)",
    "detail": "HĐ cho Int. Finance, Derivatives, Time Series (T11-12/2026)",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T9/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK2",
    "progress_source_pct": 0,
    "category_code": "05",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T029",
    "legacy_group": "Giảng Viên & Hợp Đồng",
    "task_title": "Hợp đồng GV Rennes đợt 3 (HK6)",
    "detail": "HĐ cho Panel Data, Fin. Econometrics (T5-6/2027)",
    "legacy_owner_role": "Admin Đề án",
    "timeline_original": "T3/2027",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK3-7",
    "progress_source_pct": 0,
    "category_code": "05",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T030",
    "legacy_group": "Giảng Viên & Hợp Đồng",
    "task_title": "Phân công GV UEH HK2 và sau",
    "detail": "Xác nhận GV các HK tiếp theo",
    "legacy_owner_role": "PD",
    "timeline_original": "T10/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK2",
    "progress_source_pct": 0,
    "category_code": "05",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T031",
    "legacy_group": "Giảng Viên & Hợp Đồng",
    "task_title": "Đánh giá GV sau mỗi kỳ",
    "detail": "Thu thập phản hồi SV, tổng hợp và gửi Rennes",
    "legacy_owner_role": "PD",
    "timeline_original": "Sau mỗi HK",
    "source_status": "Định kỳ",
    "priority_source": "Trung bình",
    "semester_source": "Toàn CT",
    "progress_source_pct": 0,
    "category_code": "09",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T032",
    "legacy_group": "Chương Trình & Học Thuật",
    "task_title": "Xác nhận đề cương 8 môn UR với Rennes",
    "detail": "Nhận, xem xét và ký duyệt syllabus từng môn UR",
    "legacy_owner_role": "PD",
    "timeline_original": "T6/2026",
    "source_status": "Đang xử lý",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 40,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T033",
    "legacy_group": "Chương Trình & Học Thuật",
    "task_title": "Dịch đề cương sang tiếng Việt",
    "detail": "Biên dịch syllabus gửi SV và nộp Phòng ĐT",
    "legacy_owner_role": "PD",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T034",
    "legacy_group": "Chương Trình & Học Thuật",
    "task_title": "Mapping tín chỉ UEH ↔ Rennes",
    "detail": "Đối chiếu đảm bảo công nhận tín chỉ đủ 2 phía",
    "legacy_owner_role": "PD",
    "timeline_original": "T6/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "04",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T035",
    "legacy_group": "Chương Trình & Học Thuật",
    "task_title": "Quy trình công nhận kết quả học tập UR",
    "detail": "Xây dựng quy trình chuyển điểm, xét tốt nghiệp",
    "legacy_owner_role": "PD",
    "timeline_original": "T7/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "04",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T036",
    "legacy_group": "Chương Trình & Học Thuật",
    "task_title": "Kế hoạch học thuật cả năm 2026-2027",
    "detail": "Lịch học, lịch thi, đợt UR, deadline toàn năm",
    "legacy_owner_role": "PD",
    "timeline_original": "T7/2026",
    "source_status": "Chờ lập",
    "priority_source": "Cao",
    "semester_source": "Toàn CT",
    "progress_source_pct": 0,
    "category_code": "03",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T037",
    "legacy_group": "Chương Trình & Học Thuật",
    "task_title": "Sổ tay sinh viên chương trình UR (VI+EN)",
    "detail": "Biên soạn hướng dẫn song ngữ cho SV",
    "legacy_owner_role": "PD",
    "timeline_original": "T7/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "09",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T038",
    "legacy_group": "Chương Trình & Học Thuật",
    "task_title": "Review & điều chỉnh chương trình sau HK1",
    "detail": "Đánh giá, cải tiến sau học kỳ đầu tiên",
    "legacy_owner_role": "PD",
    "timeline_original": "T1/2027",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK2",
    "progress_source_pct": 0,
    "category_code": "09",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T039",
    "legacy_group": "Truyền Thông & SV",
    "task_title": "Thông báo khai giảng và định hướng SV",
    "detail": "Gửi thông tin lộ trình, lịch học, yêu cầu CT",
    "legacy_owner_role": "PD",
    "timeline_original": "T7/2026",
    "source_status": "Đã triển khai",
    "priority_source": "Cao",
    "semester_source": "HK1",
    "progress_source_pct": 100,
    "category_code": "09",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": true,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T040",
    "legacy_group": "Truyền Thông & SV",
    "task_title": "Sự kiện khai giảng chính thức",
    "detail": "Tổ chức lễ khai giảng có GV Rennes tham dự",
    "legacy_owner_role": "PD",
    "timeline_original": "T8/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "09",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T041",
    "legacy_group": "Truyền Thông & SV",
    "task_title": "Bài viết truyền thông khai giảng",
    "detail": "Đăng bài website, mạng xã hội, hình ảnh GV Rennes",
    "legacy_owner_role": "PD",
    "timeline_original": "T8/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "09",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T042",
    "legacy_group": "Truyền Thông & SV",
    "task_title": "Khảo sát SV sau mỗi môn UR",
    "detail": "Thu thập phản hồi, gửi báo cáo cho Rennes",
    "legacy_owner_role": "PD",
    "timeline_original": "Sau mỗi đợt",
    "source_status": "Định kỳ",
    "priority_source": "Trung bình",
    "semester_source": "Toàn CT",
    "progress_source_pct": 0,
    "category_code": "09",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T043",
    "legacy_group": "Truyền Thông & SV",
    "task_title": "Họp ban điều phối UEH-Rennes định kỳ",
    "detail": "Cuộc họp hàng quý giữa 2 trường",
    "legacy_owner_role": "SOF",
    "timeline_original": "Hàng quý",
    "source_status": "Định kỳ",
    "priority_source": "Trung bình",
    "semester_source": "Toàn CT",
    "progress_source_pct": 0,
    "category_code": "01",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T044",
    "legacy_group": "Truyền Thông & SV",
    "task_title": "Báo cáo tiến độ định kỳ gửi BGH & Rennes",
    "detail": "Báo cáo số SV, kết quả, vấn đề phát sinh",
    "legacy_owner_role": "SOF",
    "timeline_original": "Cuối mỗi HK",
    "source_status": "Định kỳ",
    "priority_source": "Trung bình",
    "semester_source": "Toàn CT",
    "progress_source_pct": 0,
    "category_code": "10",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T045",
    "legacy_group": "Truyền Thông & SV",
    "task_title": "Chuẩn bị tài liệu tuyển sinh K52+",
    "detail": "Brochure, video giới thiệu CT cho khóa mới",
    "legacy_owner_role": "PD",
    "timeline_original": "T1/2027",
    "source_status": "Chờ lập",
    "priority_source": "Trung bình",
    "semester_source": "HK2",
    "progress_source_pct": 0,
    "category_code": "09",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T046",
    "legacy_group": "Hệ Thống & Dữ Liệu",
    "task_title": "Hệ thống theo dõi tiến độ học tập SV",
    "detail": "Tool theo dõi tín chỉ tích lũy từng SV",
    "legacy_owner_role": "PD",
    "timeline_original": "T7/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "10",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T047",
    "legacy_group": "Hệ Thống & Dữ Liệu",
    "task_title": "File master quản lý vận hành CT",
    "detail": "Bộ file chuẩn theo dõi toàn bộ chương trình",
    "legacy_owner_role": "PD",
    "timeline_original": "T7/2026",
    "source_status": "Đang làm",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 50,
    "category_code": "10",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T048",
    "legacy_group": "Hệ Thống & Dữ Liệu",
    "task_title": "Lưu trữ số hóa hồ sơ GV và HĐ",
    "detail": "Số hóa và lưu toàn bộ hợp đồng, hồ sơ GV",
    "legacy_owner_role": "PD",
    "timeline_original": "T7/2026",
    "source_status": "Chờ xử lý",
    "priority_source": "Trung bình",
    "semester_source": "HK1",
    "progress_source_pct": 0,
    "category_code": "10",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  },
  {
    "source_task_code": "T049",
    "legacy_group": "Hệ Thống & Dữ Liệu",
    "task_title": "Lưu biên bản họp và quyết định",
    "detail": "Lưu đầy đủ biên bản các cuộc họp CT",
    "legacy_owner_role": "PD",
    "timeline_original": "Liên tục",
    "source_status": "Định kỳ",
    "priority_source": "Trung bình",
    "semester_source": "Toàn CT",
    "progress_source_pct": 0,
    "category_code": "01",
    "verification_status": "Chờ đối chiếu",
    "progress_conflict": false,
    "source_type": "Lịch sử / chỉ tham khảo",
    "related_live_task": "Cần đối chiếu",
    "share_note": "Thông tin liên hệ cá nhân, tài khoản, chứng từ và đường dẫn nội bộ không có trong gói bàn giao."
  }
];

export const WORKFLOWS_DEF = [
  {
    "code": "WF01",
    "name": "Xác nhận lịch giảng song phương",
    "input": "Rennes đề xuất dự thảo lịch giảng các học phần quốc tế",
    "checkSteps": [
      "UEH kiểm tra xung đột phòng học và thời khóa biểu",
      "Đại diện UEH ký xác nhận",
      "Đại diện Rennes ký xác nhận"
    ],
    "output": "Chốt phiên bản lịch giảng chính thức (v1.0 / v1.1) và lưu chứng cứ",
    "businessRule": "Chỉ hiển thị \"Đã xác nhận hai phía\" khi cả UEH và Rennes cùng xác nhận. Sửa lịch đã chốt lập tức chuyển trạng thái về \"Cần xác nhận lại\".",
    "icon": "CalendarDays",
    "categoryCode": "03",
    "owner": "ThS. Nguyễn Văn Thiện Tâm (Nhân sự chính - Học vụ)"
  },
  {
    "code": "WF02",
    "name": "Tổ chức đợt công tác và hậu cần GV Rennes",
    "input": "Lịch giảng đã được thống nhất sơ bộ",
    "checkSteps": [
      "Xác nhận danh sách GV và khoảng thời gian lưu trú",
      "Đặt vé máy bay khứ hồi (TGV + máy bay)",
      "Đặt khách sạn và chuẩn bị thư mời visa",
      "Soạn và trình ký HĐ thỉnh giảng + cam kết khấu trừ thuế TNCN 20%"
    ],
    "output": "Vé máy bay, voucher khách sạn, visa đã cấp, HĐ thỉnh giảng đã ký, hoàn thành giảng dạy và chứng từ",
    "businessRule": "Booking khách sạn/vé máy bay không được coi là đã thanh toán. Phải thu thập đủ boarding pass, hóa đơn VAT và xác nhận giờ giảng.",
    "icon": "Plane",
    "categoryCode": "06",
    "owner": "ThS. Hoàng Thị Phương Anh (Nhân sự chính) & Đào Thị Tuyết Nhung (Trợ lý)"
  },
  {
    "code": "WF03",
    "name": "Học phí và thanh toán chuyển tiền cho Rennes",
    "input": "Danh sách sinh viên chính thức thuộc diện tính phí theo học kỳ",
    "checkSteps": [
      "Đối soát số lượng SV thực tế và căn cứ tính học phí (€900/SV/năm)",
      "Lập tờ trình và dự thảo lệnh chuyển tiền quốc tế",
      "Ban Giám hiệu / KHTC duyệt lệnh chuyển tiền"
    ],
    "output": "Điện chuyển tiền (SWIFT MT103), xác nhận Rennes đã nhận tiền và đối chiếu công nợ",
    "businessRule": "Dòng tiền học phí chuyển đối tác Rennes là luồng tài chính độc lập, KHÔNG gộp vào chi phí vận hành UEH. Lưu trữ tỷ giá hối đoái EUR/VND tại thời điểm giao dịch.",
    "icon": "Coins",
    "categoryCode": "07",
    "owner": "ThS. Hoàng Thị Phương Anh (Nhân sự chính - Tài chính)"
  },
  {
    "code": "WF04",
    "name": "Chi phí vận hành và quyết toán tài chính",
    "input": "Dự toán kinh phí năm học / học kỳ đã được phê duyệt",
    "checkSteps": [
      "Tập hợp hợp đồng, phiếu đặt dịch vụ, phát sinh thực tế",
      "Kiểm tra tính hợp lệ của chứng từ, hóa đơn VAT, biên lai thuế",
      "Phê duyệt thanh toán"
    ],
    "output": "Phiếu chi / lệnh chi đã thực hiện, bảng tổng hợp quyết toán định kỳ",
    "businessRule": "Tuyệt đối không cộng nguyên tệ khác loại (EUR + VND) khi chưa quy đổi theo tỷ giá lưu trữ. Quản lý hạn mức thù lao 104 EUR/giờ và công tác phí 120 EUR/ngày.",
    "icon": "Calculator",
    "categoryCode": "08",
    "owner": "ThS. Hoàng Thị Phương Anh (Nhân sự chính - Tài chính)"
  },
  {
    "code": "WF05",
    "name": "Khảo thí, quy đổi điểm và công nhận tín chỉ",
    "input": "Đề cương học phần, kỳ thi kết thúc học phần Rennes",
    "checkSteps": [
      "Giảng viên Rennes nhập và nộp bảng điểm gốc (thang điểm 20)",
      "Áp dụng chính sách quy đổi điểm đã được Hội đồng UEH phê duyệt",
      "Hội đồng Khảo thí phê duyệt kết quả quy đổi"
    ],
    "output": "Bảng điểm quy đổi thang 10 và thang chữ, cập nhật hệ thống quản lý đào tạo UEH",
    "businessRule": "Chính sách quy đổi điểm phải có phiên bản (Version). Thay đổi chính sách phải tạo version mới và lưu audit log đối chiếu điểm cũ.",
    "icon": "GraduationCap",
    "categoryCode": "04",
    "owner": "ThS. Nguyễn Văn Thiện Tâm (Nhân sự chính - Khảo thí)"
  },
  {
    "code": "WF06",
    "name": "Chuyển danh sách sinh viên năm 3 sang Rennes",
    "input": "Danh sách sinh viên hoàn thành năm 2 đủ điều kiện học tiếp giai đoạn 2",
    "checkSteps": [
      "Rà soát tích lũy tín chỉ và chứng chỉ ngoại ngữ",
      "Đối soát dữ liệu UEH và form đăng ký Rennes yêu cầu",
      "Quản lý dự án phê duyệt danh sách chính thức"
    ],
    "output": "Gói hồ sơ sinh viên gửi qua kênh an toàn, Rennes xác nhận tiếp nhận và cấp tài khoản LMS",
    "businessRule": "Truyền tệp qua kênh bảo mật. Kiểm tra tài khoản Rennes (email @etudiant.univ-rennes.fr và LMS) cho từng sinh viên.",
    "icon": "Users",
    "categoryCode": "02",
    "owner": "ThS. Nguyễn Văn Thiện Tâm (Nhân sự chính - Học vụ)"
  },
  {
    "code": "WF07",
    "name": "Vận hành công việc và kiểm soát tiến độ",
    "input": "Phân rã mục tiêu từ 10 hạng mục vận hành và checklist nguồn",
    "checkSteps": [
      "Gán người chịu trách nhiệm chính (owner) và deadline",
      "Theo dõi định kỳ, cảnh báo việc sắp hạn / quá hạn thực tế",
      "Nghiệm thu đầu việc với chứng cứ đính kèm"
    ],
    "output": "Đầu việc hoàn tất có bằng chứng lưu vết, báo cáo tiến độ tuần/tháng/kỳ",
    "businessRule": "Tiến độ 100% ở checklist nguồn không đồng nghĩa với hoàn tất; phải qua bước xác minh thực tế. Mọi thay đổi trạng thái phải lưu audit log.",
    "icon": "CheckSquare",
    "categoryCode": "10",
    "owner": "TS. Tô Công Nguyên Bảo (Quản lý dự án) & Toàn ban điều hành"
  }
];

export const CURRICULUM_COURSES = [
  {
    "sem": "HỌC KỲ 1  ·  17 Tín chỉ",
    "stt": 1,
    "typeVi": "Chính trị",
    "nameVi": "Triết học Mác – Lê nin",
    "credits": "3",
    "typeEn": "Politics",
    "nameEn": "Marxist-Leninist Philosophy",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 1  ·  17 Tín chỉ",
    "stt": 2,
    "typeVi": "Bắt buộc",
    "nameVi": "Luật kinh doanh",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Business Law",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 1  ·  17 Tín chỉ",
    "stt": 3,
    "typeVi": "Bắt buộc",
    "nameVi": "Toán dành cho nhà quản trị",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Mathematics for Managers",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 1  ·  17 Tín chỉ",
    "stt": 4,
    "typeVi": "Bắt buộc",
    "nameVi": "Kinh tế vi mô",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Microeconomics",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 1  ·  17 Tín chỉ",
    "stt": 5,
    "typeVi": "Bắt buộc",
    "nameVi": "Nguyên lý kế toán",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Principles of Accounting",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 1  ·  17 Tín chỉ",
    "stt": 6,
    "typeVi": "Bắt buộc",
    "nameVi": "Nhập môn tâm lý học",
    "credits": "2",
    "typeEn": "Required",
    "nameEn": "Introduction to Psychology",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 2  ·  21 Tín chỉ",
    "stt": 7,
    "typeVi": "Chính trị",
    "nameVi": "Kinh tế chính trị Mác – Lê nin",
    "credits": "2",
    "typeEn": "Politics",
    "nameEn": "Marxist-Leninist Political Economy",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 2  ·  21 Tín chỉ",
    "stt": 8,
    "typeVi": "Bắt buộc",
    "nameVi": "Luật doanh nghiệp",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Enterprise Law",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 2  ·  21 Tín chỉ",
    "stt": 9,
    "typeVi": "Bắt buộc",
    "nameVi": "Thống kê ứng dụng trong KT & KD",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Applied Statistics in Economics & Business",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 2  ·  21 Tín chỉ",
    "stt": 10,
    "typeVi": "Tự chọn (1/3)",
    "nameVi": "Quản trị học",
    "credits": "3",
    "typeEn": "Elective (1/3)",
    "nameEn": "Management",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 2  ·  21 Tín chỉ",
    "stt": 11,
    "typeVi": "Tự chọn (1/3)",
    "nameVi": "Marketing",
    "credits": "3",
    "typeEn": "Elective (1/3)",
    "nameEn": "Marketing",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 2  ·  21 Tín chỉ",
    "stt": 12,
    "typeVi": "Tự chọn (1/3)",
    "nameVi": "Kinh doanh quốc tế",
    "credits": "3",
    "typeEn": "Elective (1/3)",
    "nameEn": "International Business",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 2  ·  21 Tín chỉ",
    "stt": 13,
    "typeVi": "Bắt buộc",
    "nameVi": "Phát triển bền vững",
    "credits": "2",
    "typeEn": "Required",
    "nameEn": "Sustainable Development",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 2  ·  21 Tín chỉ",
    "stt": 14,
    "typeVi": "Bắt buộc",
    "nameVi": "Giới thiệu về Python",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Introduction to Python",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 2  ·  21 Tín chỉ",
    "stt": 15,
    "typeVi": "Bắt buộc",
    "nameVi": "Kỹ năng mềm",
    "credits": "2",
    "typeEn": "Required",
    "nameEn": "Soft Skills",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 2  ·  21 Tín chỉ",
    "stt": 16,
    "typeVi": "UR Song Bằng",
    "nameVi": "Kinh tế vĩ mô",
    "credits": "3",
    "typeEn": "UR Dual Degree",
    "nameEn": "Macroeconomics",
    "isRennes": true
  },
  {
    "sem": "HỌC KỲ 3  ·  18 Tín chỉ",
    "stt": 17,
    "typeVi": "Chính trị",
    "nameVi": "Chủ nghĩa xã hội khoa học",
    "credits": "2",
    "typeEn": "Politics",
    "nameEn": "Scientific Socialism",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 3  ·  18 Tín chỉ",
    "stt": 18,
    "typeVi": "Bắt buộc",
    "nameVi": "Tư duy thiết kế",
    "credits": "2",
    "typeEn": "Required",
    "nameEn": "Design Thinking",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 3  ·  18 Tín chỉ",
    "stt": 19,
    "typeVi": "Bắt buộc",
    "nameVi": "Khởi nghiệp kinh doanh",
    "credits": "2",
    "typeEn": "Required",
    "nameEn": "Entrepreneurship",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 3  ·  18 Tín chỉ",
    "stt": 20,
    "typeVi": "Bắt buộc",
    "nameVi": "VBA – Visual Basic for Applications",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "VBA – Visual Basic for Applications",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 3  ·  18 Tín chỉ",
    "stt": 21,
    "typeVi": "Bắt buộc",
    "nameVi": "Kinh tế lượng",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Econometrics",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 3  ·  18 Tín chỉ",
    "stt": 22,
    "typeVi": "Bắt buộc",
    "nameVi": "Kế toán tài chính",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Financial Accounting",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 3  ·  18 Tín chỉ",
    "stt": 23,
    "typeVi": "UR Song Bằng",
    "nameVi": "Tiền tệ, NH & Thị trường Tài chính",
    "credits": "3",
    "typeEn": "UR Dual Degree",
    "nameEn": "Money, Banking & Financial Markets",
    "isRennes": true
  },
  {
    "sem": "HỌC KỲ 4  ·  17 Tín chỉ",
    "stt": 24,
    "typeVi": "Chính trị",
    "nameVi": "Lịch sử Đảng Cộng sản VN",
    "credits": "2",
    "typeEn": "Politics",
    "nameEn": "History of the Communist Party of Vietnam",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 4  ·  17 Tín chỉ",
    "stt": 25,
    "typeVi": "Bắt buộc",
    "nameVi": "Đầu tư tài chính",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Financial Investment",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 4  ·  17 Tín chỉ",
    "stt": 26,
    "typeVi": "Bắt buộc",
    "nameVi": "Tài chính doanh nghiệp",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Corporate Finance",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 4  ·  17 Tín chỉ",
    "stt": 27,
    "typeVi": "Bắt buộc",
    "nameVi": "Ngân hàng thương mại",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Commercial Banking",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 4  ·  17 Tín chỉ",
    "stt": 28,
    "typeVi": "UR Song Bằng",
    "nameVi": "Tài chính quốc tế",
    "credits": "3",
    "typeEn": "UR Dual Degree",
    "nameEn": "International Finance",
    "isRennes": true
  },
  {
    "sem": "HỌC KỲ 4  ·  17 Tín chỉ",
    "stt": 29,
    "typeVi": "UR Song Bằng",
    "nameVi": "KTL chuỗi thời gian",
    "credits": "3",
    "typeEn": "UR Dual Degree",
    "nameEn": "Econometrics of Time Series",
    "isRennes": true
  },
  {
    "sem": "HỌC KỲ 5  ·  20 Tín chỉ",
    "stt": 30,
    "typeVi": "Chính trị",
    "nameVi": "Tư tưởng Hồ Chí Minh",
    "credits": "2",
    "typeEn": "Politics",
    "nameEn": "Ho Chi Minh Ideology",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 5  ·  20 Tín chỉ",
    "stt": 31,
    "typeVi": "Bắt buộc",
    "nameVi": "SQL và Databases",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "SQL and Databases",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 5  ·  20 Tín chỉ",
    "stt": 32,
    "typeVi": "Bắt buộc",
    "nameVi": "Khoa học dữ liệu trong Tài chính",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Data Science in Finance",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 5  ·  20 Tín chỉ",
    "stt": 33,
    "typeVi": "Bắt buộc",
    "nameVi": "Tài chính doanh nghiệp nâng cao",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Advanced Corporate Finance",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 5  ·  20 Tín chỉ",
    "stt": 34,
    "typeVi": "Bắt buộc",
    "nameVi": "Hoạch định ngân sách vốn đầu tư",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Capital Budgeting",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 5  ·  20 Tín chỉ",
    "stt": 35,
    "typeVi": "UR Song Bằng",
    "nameVi": "Sản phẩm phái sinh",
    "credits": "3",
    "typeEn": "UR Dual Degree",
    "nameEn": "Derivatives",
    "isRennes": true
  },
  {
    "sem": "HỌC KỲ 5  ·  20 Tín chỉ",
    "stt": 36,
    "typeVi": "UR Song Bằng",
    "nameVi": "KTL dữ liệu bảng",
    "credits": "3",
    "typeEn": "UR Dual Degree",
    "nameEn": "Panel Data Econometrics",
    "isRennes": true
  },
  {
    "sem": "HỌC KỲ 6  ·  21 Tín chỉ",
    "stt": 37,
    "typeVi": "Bắt buộc",
    "nameVi": "Python lập mô hình TC & định giá",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Python for Financial Modeling & Valuation",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 6  ·  21 Tín chỉ",
    "stt": 38,
    "typeVi": "Bắt buộc",
    "nameVi": "Phân tích tài chính",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Financial Analysis",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 6  ·  21 Tín chỉ",
    "stt": 39,
    "typeVi": "Bắt buộc",
    "nameVi": "Tài chính hành vi",
    "credits": "3",
    "typeEn": "Required",
    "nameEn": "Behavioral Finance",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 6  ·  21 Tín chỉ",
    "stt": 40,
    "typeVi": "Tự chọn (3/6)",
    "nameVi": "Tài chính công ty đa quốc gia",
    "credits": "3",
    "typeEn": "Elective (3/6)",
    "nameEn": "Multinational Corporate Finance",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 6  ·  21 Tín chỉ",
    "stt": 41,
    "typeVi": "Tự chọn (3/6)",
    "nameVi": "Quản trị rủi ro tài chính",
    "credits": "3",
    "typeEn": "Elective (3/6)",
    "nameEn": "Financial Risk Management",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 6  ·  21 Tín chỉ",
    "stt": 42,
    "typeVi": "Tự chọn (3/6)",
    "nameVi": "Quản trị rủi ro doanh nghiệp",
    "credits": "3",
    "typeEn": "Elective (3/6)",
    "nameEn": "Enterprise Risk Management",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 6  ·  21 Tín chỉ",
    "stt": 43,
    "typeVi": "Tự chọn (3/6)",
    "nameVi": "Điều hành công ty CP đại chúng",
    "credits": "3",
    "typeEn": "Elective (3/6)",
    "nameEn": "Public Company Governance",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 6  ·  21 Tín chỉ",
    "stt": 44,
    "typeVi": "Tự chọn (3/6)",
    "nameVi": "Tài chính khởi nghiệp",
    "credits": "3",
    "typeEn": "Elective (3/6)",
    "nameEn": "Startup Finance",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 6  ·  21 Tín chỉ",
    "stt": 45,
    "typeVi": "Tự chọn (3/6)",
    "nameVi": "Kế toán quản trị",
    "credits": "3",
    "typeEn": "Elective (3/6)",
    "nameEn": "Managerial Accounting",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 6  ·  21 Tín chỉ",
    "stt": 46,
    "typeVi": "UR Song Bằng",
    "nameVi": "KTL tài chính & mô hình TC",
    "credits": "3",
    "typeEn": "UR Dual Degree",
    "nameEn": "Financial Econometrics & Financial Modeling",
    "isRennes": true
  },
  {
    "sem": "HỌC KỲ 7  ·  10 Tín chỉ",
    "stt": 47,
    "typeVi": "Tốt nghiệp",
    "nameVi": "Thực tập tốt nghiệp & Khóa luận",
    "credits": "10",
    "typeEn": "Graduation",
    "nameEn": "Internship & Graduation Thesis",
    "isRennes": false
  },
  {
    "sem": "HỌC KỲ 7  ·  10 Tín chỉ",
    "stt": 48,
    "typeVi": "UR Song Bằng",
    "nameVi": "Thực tập & Tốt nghiệp UR",
    "credits": "–",
    "typeEn": "UR Dual Degree",
    "nameEn": "UR Internship & Graduation",
    "isRennes": true
  }
];

export const LECTURERS_ALL = [
  {
    "stt": 1,
    "fullName": "Đào Nguyên Anh",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 2,
    "fullName": "Hồ Hoàng Anh",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 3,
    "fullName": "Nguyễn Ngọc Trâm Anh",
    "degree": "NCS, Thạc sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 4,
    "fullName": "Huỳnh Ngọc Quang Anh",
    "degree": "NCS, Thạc sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 5,
    "fullName": "Nguyễn Quốc Anh",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 6,
    "fullName": "Phùng Thanh Bình",
    "degree": "Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 7,
    "fullName": "Đỗ Ngọc Bích",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 8,
    "fullName": "Tô Công Nguyên Bảo",
    "degree": "Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 9,
    "fullName": "Cécile Casteuble",
    "degree": "GS, Tiến sĩ",
    "lang": "C2",
    "side": "Rennes",
    "coursesCount": 1
  },
  {
    "stt": 10,
    "fullName": "Đinh Khương Duy",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 11,
    "fullName": "Mai Nguyễn Dũng",
    "degree": "NCS, Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 12,
    "fullName": "Nguyễn Thị Diễm Em",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 13,
    "fullName": "Trương Nữ Tô Giang",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 14,
    "fullName": "Ngô Quang Huy",
    "degree": "Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 15,
    "fullName": "Bùi Quốc Huy",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 16,
    "fullName": "Hoàng Việt Huy",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 17,
    "fullName": "Bùi Thị Huyền",
    "degree": "Tiến sĩ",
    "lang": "Cử nhân",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 18,
    "fullName": "Đặng Thị Mỹ Hạnh",
    "degree": "NCS, Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 2
  },
  {
    "stt": 19,
    "fullName": "Đinh Thị Thu Hồng",
    "degree": "PGS, Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 20,
    "fullName": "Dương Kha",
    "degree": "NCS, Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 21,
    "fullName": "Lê Thùy Khanh",
    "degree": "NCS, Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 2
  },
  {
    "stt": 22,
    "fullName": "Trần Trung Kiên",
    "degree": "Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 23,
    "fullName": "Lê Thanh Loan",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 24,
    "fullName": "Nguyễn Hoàng Long",
    "degree": "NCS, Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 3
  },
  {
    "stt": 25,
    "fullName": "Hoàng Cửu Long",
    "degree": "PGS, Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 26,
    "fullName": "Phạm Thị Lý",
    "degree": "Tiến sĩ",
    "lang": "Cử nhân",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 27,
    "fullName": "Trần Thị Hải Lý",
    "degree": "PGS, Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 4
  },
  {
    "stt": 28,
    "fullName": "Franck Martin",
    "degree": "GS, Tiến sĩ",
    "lang": "C2",
    "side": "Rennes",
    "coursesCount": 4
  },
  {
    "stt": 29,
    "fullName": "Lê Thị Hồng Minh",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 2
  },
  {
    "stt": 30,
    "fullName": "Nguyễn Thị Ngọc Miên",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 31,
    "fullName": "Phùng Đức Nam",
    "degree": "PGS, Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 5
  },
  {
    "stt": 32,
    "fullName": "Trần Hoài Nam",
    "degree": "Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 33,
    "fullName": "Quách Doanh Nghiệp",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 34,
    "fullName": "Thang Nguyen",
    "degree": "PGS, Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 2
  },
  {
    "stt": 35,
    "fullName": "Nguyễn Thị Thảo Nguyên",
    "degree": "Thạc sĩ",
    "lang": "B2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 36,
    "fullName": "Đỗ Thị Hải Ninh",
    "degree": "PGS, Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 2
  },
  {
    "stt": 37,
    "fullName": "Lê Hoàng Oanh",
    "degree": "Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 38,
    "fullName": "Jean-Christophe Poutineau",
    "degree": "GS, Tiến sĩ",
    "lang": "C2",
    "side": "Rennes",
    "coursesCount": 2
  },
  {
    "stt": 39,
    "fullName": "Nguyễn Quang",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 40,
    "fullName": "Trần Thị Thảo Quyên",
    "degree": "Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 41,
    "fullName": "Vũ Việt Quảng",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 4
  },
  {
    "stt": 42,
    "fullName": "Tovonony Razafindrabe",
    "degree": "GS, Tiến sĩ",
    "lang": "C2",
    "side": "Rennes",
    "coursesCount": 2
  },
  {
    "stt": 43,
    "fullName": "Fabien Rondeau",
    "degree": "GS, Tiến sĩ",
    "lang": "C2",
    "side": "Rennes",
    "coursesCount": 2
  },
  {
    "stt": 44,
    "fullName": "Nguyễn Văn Sáng",
    "degree": "Tiến sĩ",
    "lang": "B2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 45,
    "fullName": "Hoàng Xuân Sơn",
    "degree": "Tiến sĩ",
    "lang": "Cử nhân",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 46,
    "fullName": "Christophe Tavera",
    "degree": "GS, Tiến sĩ",
    "lang": "C2",
    "side": "Rennes",
    "coursesCount": 3
  },
  {
    "stt": 47,
    "fullName": "Bùi Xuân Thanh",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 48,
    "fullName": "Đỗ Thị Kim Thanh",
    "degree": "Thạc sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 49,
    "fullName": "Trần Thị Phương Thanh",
    "degree": "NCS, Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 50,
    "fullName": "Từ Thị Kim Thoa",
    "degree": "Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 3
  },
  {
    "stt": 51,
    "fullName": "Đặng Văn Thạc",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 2
  },
  {
    "stt": 52,
    "fullName": "Nguyễn Kim Thảo",
    "degree": "Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 53,
    "fullName": "Đặng Thái Thịnh",
    "degree": "Thạc sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 2
  },
  {
    "stt": 54,
    "fullName": "Bùi Thị Lệ Thủy",
    "degree": "NCS, Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 2
  },
  {
    "stt": 55,
    "fullName": "Hoàng Cẩm Trang",
    "degree": "PGS, Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 56,
    "fullName": "Nguyễn Thị Đài Trang",
    "degree": "Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 57,
    "fullName": "Đỗ Lâm Hoàng Trang",
    "degree": "Tiến sĩ",
    "lang": "Cử nhân",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 58,
    "fullName": "Nguyễn Lê Ngân Trang",
    "degree": "Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 3
  },
  {
    "stt": 59,
    "fullName": "Nguyễn Văn Thiện Tâm",
    "degree": "Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 2
  },
  {
    "stt": 60,
    "fullName": "Huỳnh Thiên Tứ",
    "degree": "NCS, Thạc sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 61,
    "fullName": "Đỗ Minh Tứ",
    "degree": "Tiến sĩ",
    "lang": "Cử nhân",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 62,
    "fullName": "Cao Quốc Việt",
    "degree": "Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 63,
    "fullName": "Lê Thị Phương Vy",
    "degree": "PGS, Tiến sĩ",
    "lang": "C2",
    "side": "UEH",
    "coursesCount": 4
  },
  {
    "stt": 64,
    "fullName": "Nguyễn Khánh Vân",
    "degree": "Tiến sĩ",
    "lang": "B2",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 65,
    "fullName": "Ngô Minh Vũ",
    "degree": "Tiến sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 1
  },
  {
    "stt": 66,
    "fullName": "Nguyễn Triều Đông",
    "degree": "NCS, Thạc sĩ",
    "lang": "C1",
    "side": "UEH",
    "coursesCount": 2
  }
];

export const LEGAL_DOSSIER = [
  {
    "fileName": "0. BÌA.pdf",
    "size": 150109,
    "category": "01"
  },
  {
    "fileName": "0. DANH MỤC HỒ SƠ.pdf",
    "size": 155410,
    "category": "01"
  },
  {
    "fileName": "1a. Tờ trình - VIE.pdf",
    "size": 283022,
    "category": "01"
  },
  {
    "fileName": "1b. Đơn đề nghị  ENG-VIE.pdf",
    "size": 1216508,
    "category": "01"
  },
  {
    "fileName": "2. Thỏa thuận hợp tác.pdf",
    "size": 221543,
    "category": "01"
  },
  {
    "fileName": "2.1. MOA - UEH & Rennes - ENG.pdf",
    "size": 9811846,
    "category": "01"
  },
  {
    "fileName": "2.1. MOA - UEH & Rennes - VIE.pdf",
    "size": 407127,
    "category": "01"
  },
  {
    "fileName": "2.1a Thoa thuan dieu chinh  MOA - Eng.pdf",
    "size": 1529689,
    "category": "01"
  },
  {
    "fileName": "2.1a Thoa thuan dieu chinh  MOA - Viet.pdf",
    "size": 963904,
    "category": "01"
  },
  {
    "fileName": "2.1a Thoa thuan dieu chinh MOA - Fr.pdf",
    "size": 981534,
    "category": "01"
  },
  {
    "fileName": "3. Van ban phap ly cua cac Ben.pdf",
    "size": 229480,
    "category": "01"
  },
  {
    "fileName": "3.1. QĐ chuyen doi UEH.pdf",
    "size": 739289,
    "category": "01"
  },
  {
    "fileName": "3.2. QĐ thành lập - đổi tên Khoa Tài chính.pdf",
    "size": 792181,
    "category": "01"
  },
  {
    "fileName": "3.3. Nghi Dinh thanh lap DH Rennes.pdf",
    "size": 324989,
    "category": "01"
  },
  {
    "fileName": "4. Minh chứng được phép đào tạo.pdf",
    "size": 230610,
    "category": "01"
  },
  {
    "fileName": "4.1a. UEH - QĐ Ban hanh CTDT Tai chinh-Ngan hang_trinh do dai hoc.pdf",
    "size": 61695691,
    "category": "01"
  },
  {
    "fileName": "4.1b. UEH - Kiểm định FIBAA ngành Tài chính.pdf",
    "size": 71073,
    "category": "04"
  },
  {
    "fileName": "4.1c. UEH - Kiểm định FIBAA ngành Ngân hàng.pdf",
    "size": 70923,
    "category": "04"
  },
  {
    "fileName": "4.2.a UR1 - Cong nhan cua Bo va Nganh duoc phep dao tao (French).pdf",
    "size": 903520,
    "category": "01"
  },
  {
    "fileName": "4.2.b UR1 - Cong nhan cua Bo va Nganh duoc phep dao tao (Viet).pdf",
    "size": 436592,
    "category": "01"
  },
  {
    "fileName": "5. Đề án.pdf",
    "size": 220678,
    "category": "01"
  },
  {
    "fileName": "5a. Đề án chương trình.pdf",
    "size": 445389,
    "category": "01"
  },
  {
    "fileName": "5b. Chương trình đào tạo chi tiết.pdf",
    "size": 2597808,
    "category": "01"
  },
  {
    "fileName": "6. Quá trình hợp tác.pdf",
    "size": 281913,
    "category": "01"
  },
  {
    "fileName": "7. Danh sách ban điều hành chương trình.pdf",
    "size": 310018,
    "category": "01"
  },
  {
    "fileName": "PL1. Đề cương chi tiết các học phần (Syllabus).pdf",
    "size": 252597,
    "category": "03"
  },
  {
    "fileName": "PL1.1. SYLLABUS_EN (QAIC & SOF).pdf",
    "size": 44801210,
    "category": "01"
  },
  {
    "fileName": "PL2. Mẫu văn bằng.pdf",
    "size": 207660,
    "category": "01"
  },
  {
    "fileName": "PL2.1. Mẫu văn bằng - UR.pdf",
    "size": 2195866,
    "category": "01"
  },
  {
    "fileName": "PL2.2 - Mẫu văn bằng - UEH.pdf",
    "size": 4901159,
    "category": "01"
  },
  {
    "fileName": "PL3. Phương án tài chính cho khóa đầu tiên (K52).pdf",
    "size": 421869,
    "category": "01"
  },
  {
    "fileName": "PL4. Đội ngũ giảng viên dự kiến từ Đại học Rennes và UEH.pdf",
    "size": 257394,
    "category": "01"
  },
  {
    "fileName": "PL4.1. Xác nhận năng lực GV từ UR .pdf",
    "size": 398296,
    "category": "01"
  },
  {
    "fileName": "PL4.2. Xác nhận năng lực GV từ UEH.pdf",
    "size": 2858240,
    "category": "01"
  },
  {
    "fileName": "PL4.3. LLKH 06 giảng viên UR.pdf",
    "size": 1430809,
    "category": "05"
  },
  {
    "fileName": "PL4.3. LLKH 58 giảng viên UEH (QAIC).pdf",
    "size": 96877198,
    "category": "05"
  }
];

export const GRADE_CONVERSION_POLICIES = [
  {
    id: "pol_v2",
    version: "v2.0 (Áp dụng từ 03/2026)",
    status: "active",
    approvedDate: "2026-03-15",
    authority: "Hội đồng Khoa học & Đào tạo UEH",
    passMark20: 10,
    mapping: [
      { frMin: 16.0, frMax: 20.0, ueh10: "9.0 – 10.0", letter: "A+", rank: "Xuất sắc" },
      { frMin: 14.0, frMax: 15.9, ueh10: "8.0 – 8.9", letter: "A", rank: "Giỏi" },
      { frMin: 12.0, frMax: 13.9, ueh10: "7.0 – 7.9", letter: "B+", rank: "Khá" },
      { frMin: 11.0, frMax: 11.9, ueh10: "6.5 – 6.9", letter: "B", rank: "Trung bình khá" },
      { frMin: 10.0, frMax: 10.9, ueh10: "5.5 – 6.4", letter: "C", rank: "Trung bình (Đạt)" },
      { frMin: 0.0, frMax: 9.9, ueh10: "< 5.0", letter: "F", rank: "Không đạt (Thi lại)" }
    ]
  },
  {
    id: "pol_v1",
    version: "v1.0 (Quy định ban đầu 2024)",
    status: "archived",
    approvedDate: "2024-09-01",
    authority: "MOA 2024",
    passMark20: 10,
    mapping: [
      { frMin: 15.0, frMax: 20.0, ueh10: "8.5 – 10.0", letter: "A", rank: "Giỏi/Xuất sắc" },
      { frMin: 13.0, frMax: 14.9, ueh10: "7.0 – 8.4", letter: "B", rank: "Khá" },
      { frMin: 10.0, frMax: 12.9, ueh10: "5.5 – 6.9", letter: "C", rank: "Trung bình" },
      { frMin: 0.0, frMax: 9.9, ueh10: "< 5.0", letter: "F", rank: "Không đạt" }
    ]
  }
];
