// Dữ liệu mẫu cho bàn làm việc (toàn bộ là thông tin giả định để demo)
import { addDays } from '../lib/utils.js'
import { LECTURERS_ALL, LEGAL_DOSSIER } from '../data/rennesData.js'

export function buildItems(pid = 'p1') {
  const out = []
  let n = 0
  const push = (module, data, by = 'u2') => out.push({ id: `i_${module}_${++n}`, projectId: pid, module, createdBy: by, updatedBy: by, createdAt: new Date(Date.now() - n * 36e5).toISOString(), updatedAt: new Date(Date.now() - n * 18e5).toISOString(), ...data })
  const dt = (d, t) => `${addDays(d)}T${t}`

  /* ---- Sinh viên ---- */
  const ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Huỳnh']
  const dem = ['Minh', 'Thị', 'Gia', 'Ngọc', 'Quốc', 'Thanh', 'Hoài', 'Khánh', 'Bảo', 'Phương']
  const ten = ['An', 'Bình', 'Châu', 'Dung', 'Giang', 'Hân', 'Khoa', 'Linh', 'My', 'Nam', 'Oanh', 'Phúc', 'Quân', 'Trâm', 'Vy']
  const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
  const cohorts = [['K50–K51', 'Năm 2 – Năm 3', 'ISB-K51-01', 2006], ['K52', 'Năm 1', 'ISB-K52-01', 2008]]
  for (let i = 0; i < 30; i++) {
    const [cohort, year, cls, by] = i < 20 ? cohorts[0] : cohorts[1]
    const name = `${ho[i % 10]} ${dem[(i * 3) % 10]} ${ten[(i * 7) % 15]}`
    const sid = cohort === 'K50–K51' ? `35100${String(1001 + i).slice(-3)}` : `35200${String(1001 + i).slice(-3)}`
    const tu = i % 7 === 0 ? 'Chưa đóng' : i % 9 === 0 ? 'Nợ một phần' : i % 13 === 0 ? 'Miễn giảm' : 'Đã đóng'
    const acc = cohort === 'K52' ? (i % 4 === 0 ? 'Chưa cấp' : i % 4 === 1 ? 'Đã yêu cầu' : 'Đã cấp') : 'Đã kích hoạt'
    const short = plain(ten[(i * 7) % 15]) + '.' + plain(ho[i % 10])
    push('students', {
      studentId: sid, fullName: name, dob: `${by}-${String((i % 12) + 1).padStart(2, '0')}-${String((i * 5) % 27 + 1).padStart(2, '0')}`,
      gender: i % 2 ? 'Nam' : 'Nữ', email: `${short}${i}@st.ueh.demo`, phone: `09${String(10000000 + i * 734521).slice(0, 8)}`,
      className: cls, cohort, yearLevel: year, dualDegree: i % 6 === 5 ? 'Chờ duyệt song bằng' : i % 11 === 10 ? 'Không' : 'Có',
      academicStatus: i === 17 ? 'Bảo lưu' : 'Đang học', tuitionStatus: tu, tuitionAmount: 85000000, tuitionPaid: tu === 'Đã đóng' || tu === 'Miễn giảm' ? 85000000 : tu === 'Nợ một phần' ? 40000000 : 0,
      tuitionNote: tu === 'Nợ một phần' ? 'Xin gia hạn đến cuối tháng' : '', rennesId: acc === 'Chưa cấp' ? '' : `RN${cohort === 'K50–K51' ? '51' : '52'}${String(200 + i)}`,
      rennesEmail: acc === 'Chưa cấp' || acc === 'Đã yêu cầu' ? '' : `${short}@etudiant.univ-rennes.demo`, lmsAccount: acc.startsWith('Đã c') || acc === 'Đã kích hoạt' ? `${short}${i}` : '',
      accountStatus: acc, accountDate: acc === 'Đã kích hoạt' ? addDays(-200 - i) : acc === 'Đã cấp' ? addDays(-3) : '', note: '',
    }, 'u2')
  }

  /* ---- Lịch giảng ---- */
  const courses = [
    ['Tiền tệ, Ngân hàng và Thị trường tài chính', 'RN-S3-01', 'Jean-Christophe Poutineau', 'Rennes', 'ISB-K51-01', 'B1.205', '08:00', '14:00', -12, 1],
    ['Kinh tế vĩ mô', 'RN-S3-02', 'Christophe Tavera', 'Rennes', 'ISB-K51-01', 'B1.207', '08:00', '14:00', 3, 1],
    ['Tài chính doanh nghiệp', 'FIN201', 'TS. Lê Hoàng Phúc', 'UEH', 'ISB-K51-01', 'A.302', '08:00', '11:30', -20, 7],
    ['Tiếng Pháp chuyên ngành', 'FRA102', 'ThS. Nguyễn Thu Trang', 'UEH', 'ISB-K52-01', 'B2.101', '18:00', '20:30', -14, 3],
  ]
  courses.forEach(([course, code, lec, side, cls, room, s, e, startOff, every]) => {
    for (let k = 0; k < 8; k++) {
      const d = startOff + k * every
      const status = d < 0 ? 'Đã dạy' : k === 5 ? 'Dời lịch' : d < 10 ? 'Đã xác nhận' : 'Dự kiến'
      const uehConfirmed = d < 10 && k !== 5
      const rennesConfirmed = d < 10 && k !== 4 && k !== 5
      const grp = cls === 'ISB-K52-01' ? 'K52' : 'K50–K51'
      push('sessions', {
        course, courseCode: code, lecturer: lec, side, className: cls,
        date: addDays(d), start: s, end: e, room,
        mode: k === 6 && side === 'UEH' ? 'Online' : 'Trực tiếp',
        status,
        uehConfirmed,
        rennesConfirmed,
        scheduleVersion: 'v1.0',
        teachingGroup: grp,
        cohort: cls === 'ISB-K52-01' ? 'K52' : 'K50–K51',
        note: status === 'Dời lịch' ? 'GV bận hội thảo, dời sang tuần sau' : ''
      }, 'u2')
    }
  })

  /* ---- Văn bản ---- */
  ;[
    ['Biên bản ghi nhớ hợp tác (MOA) UEH – Université de Rennes', 'MOA', 'MOA/2024/UEH-UR', -420, 'Université de Rennes', 'Đã ký', addDays(680), 'u1', [
      {
        id: 'dc_moa_1', authorId: 'u2', authorName: 'Nguyễn Thu Hà', authorRole: 'Điều phối học vụ',
        text: 'Đã hoàn tất rà soát 8 học phần song bằng thuộc giai đoạn 2. Điều khoản học phí €900/SV/năm đã được hai bên thống nhất.',
        createdAt: new Date(Date.now() - 30 * 864e5).toISOString(), resolved: true, resolvedAt: new Date(Date.now() - 25 * 864e5).toISOString(), resolvedBy: 'u1',
        replies: [{ id: 'dc_moa_1_r1', authorId: 'u1', authorName: 'Trần Minh Anh', authorRole: 'Trưởng chương trình', text: 'Rất tốt, lưu bản gốc có chữ ký hai Hiệu trưởng vào hồ sơ chương trình.', createdAt: new Date(Date.now() - 26 * 864e5).toISOString() }]
      }
    ]],
    ['Thỏa thuận điều chỉnh MOA: Rennes phụ trách 8 học phần', 'Phụ lục hợp tác', 'PL02/2026', -5, 'Université de Rennes', 'Đang trình ký', '', 'u1', [
      {
        id: 'dc_pl_1', authorId: 'u3', authorName: 'Lê Quốc Bảo', authorRole: 'Chuyên viên tài chính',
        text: 'Phòng KHTC yêu cầu làm rõ phương thức khấu trừ thuế TNCN 20% cho giảng viên Rennes thỉnh giảng (thực nhận net 104 EUR/h hay gross).',
        createdAt: new Date(Date.now() - 4 * 864e5).toISOString(), resolved: false,
        replies: [
          { id: 'dc_pl_1_r1', authorId: 'u8', authorName: 'Franck Martin', authorRole: 'Đầu mối Rennes', text: 'We agreed that UEH withholds 20% personal income tax in Vietnam. The 104 EUR per teaching hour is net to the visiting professor.', createdAt: new Date(Date.now() - 3 * 864e5).toISOString() },
          { id: 'dc_pl_1_r2', authorId: 'u1', authorName: 'Trần Minh Anh', authorRole: 'Trưởng chương trình', text: 'Đã cập nhật công thức tính gross trong dự toán thù lao để trình ký BGH.', createdAt: new Date(Date.now() - 2 * 864e5).toISOString() }
        ]
      },
      {
        id: 'dc_pl_2', authorId: 'u2', authorName: 'Nguyễn Thu Hà', authorRole: 'Điều phối học vụ',
        text: 'Kiểm tra lại phụ lục danh mục 8 học phần: đảm bảo khớp tên tiếng Anh giữa đề án và hệ thống quản lý đào tạo.',
        createdAt: new Date(Date.now() - 2 * 864e5).toISOString(), resolved: false, replies: []
      }
    ]],
    ['Công văn xác nhận danh sách SV K52 gửi Rennes', 'Công văn đi', '1254/ĐHKT-ISB', -2, 'Université de Rennes', 'Đã gửi', '', 'u2', []],
    ['Công văn Rennes thông báo lịch giảng HK2', 'Công văn đến', 'UR-IGR-2026-118', -9, 'Université de Rennes', 'Đã ký', '', 'u2', []],
    ['Quyết định phân công nhiệm vụ năm học 2026–2027', 'Quyết định', '2087/QĐ-ĐHKT', -20, 'Nội bộ', 'Đã ký', '', 'u1', []],
    ['Biên bản họp điều hành tháng 10', 'Biên bản họp', 'BB-10/2026', -26, 'Nội bộ', 'Đã ký', '', 'u2', []],
    ['Kế hoạch đào tạo năm học 2026–2027', 'Kế hoạch', 'KH-ISB-2026', -3, 'Nội bộ', 'Dự thảo', '', 'u2', []],
    ['Brochure tuyển sinh song bằng 2026 (bản VIE & FR)', 'Khác', 'BRO-2026', -1, 'Truyền thông', 'Chờ góp ý', '', 'u7', [
      {
        id: 'dc_bro_1', authorId: 'u7', authorName: 'Hoàng Gia Huy', authorRole: 'Chuyên viên dữ liệu & truyền thông',
        text: 'Em đã cập nhật bản thiết kế mới nhất. Nhờ chị Hà kiểm tra lại thông tin học phí song bằng và chuẩn đầu vào tiếng Pháp/Anh.',
        createdAt: new Date(Date.now() - 1 * 864e5).toISOString(), resolved: false, replies: []
      }
    ]],
  ].forEach(([title, docType, number, d, partner, status, expiry, owner, docComments = []]) =>
    push('docs', { title, docType, number, date: addDays(d), partner, status, expiry, owner, docComments, signers: status === 'Đang trình ký' ? [{ text: 'Rà soát nội dung', done: true, by: 'Nguyễn Thu Hà' }, { text: 'Trưởng khoa ký', done: false }, { text: 'Đối tác Rennes ký', done: false }] : status === 'Dự thảo' ? [{ text: 'Góp ý của Ban điều hành', done: false }, { text: 'Trưởng khoa ký', done: false }] : [{ text: 'Rà soát nội dung', done: true }, { text: 'Trưởng khoa ký', done: true }], files: [{ name: number.replace(/\//g, '_') + '.pdf', size: 245000 + d * -800, type: 'application/pdf', at: new Date().toISOString() }], note: '' }, owner))

  // Bổ sung các văn bản pháp lý chính thức từ thư mục 'Các mục chi tiết'
  LEGAL_DOSSIER.slice(0, 18).forEach((f, idx) => {
    const isSigned = !f.fileName.includes('Thoa thuan dieu chinh') || f.fileName.includes('Eng')
    push('docs', {
      title: f.fileName.replace(/\.pdf$/i, ''),
      docType: f.fileName.includes('MOA') ? 'MOA' : f.fileName.includes('QĐ') ? 'Quyết định' : f.fileName.includes('FIBAA') ? 'Khác' : f.fileName.includes('Syllabus') ? 'Kế hoạch' : 'Công văn đi',
      number: `HS-RENNES-${String(idx + 1).padStart(2, '0')}`,
      date: addDays(-300 + idx * 12),
      partner: f.fileName.includes('UEH') ? 'UEH' : f.fileName.includes('UR') || f.fileName.includes('Rennes') ? 'Université de Rennes' : 'Bộ GD&ĐT / FIBAA',
      status: isSigned ? 'Đã ký' : 'Dự thảo',
      expiry: '',
      owner: 'u1',
      signers: [{ text: 'Ban điều hành kiểm tra', done: true }, { text: 'Trưởng chương trình phê duyệt', done: isSigned }],
      files: [{ name: f.fileName, size: f.size, type: 'application/pdf', at: new Date().toISOString() }],
      note: 'Tài liệu nguồn từ hồ sơ chương trình UEH–Rennes (Các mục chi tiết)'
    }, 'u1')
  })

  /* ---- Khảo thí ---- */
  ;[
    ['Marketing quốc tế', 'Giữa kỳ', 'ISB-K50-01', 7, '08:00', 'B1.205', 'Phạm Ngọc Lan', 32, 'Đã xác nhận'],
    ['Tài chính doanh nghiệp', 'Cuối kỳ', 'ISB-K51-01', 21, '13:30', 'A.302', 'Phạm Ngọc Lan', 35, 'Dự kiến'],
    ['Tài chính doanh nghiệp', 'Phúc khảo', 'ISB-K51-01', -2, '', '', 'Phạm Ngọc Lan', 3, 'Đã thi'],
    ['Học kỳ 2 năm 2025–2026 (Rennes)', 'Quy đổi điểm', 'ISB-K50-01', -10, '', '', '', 30, 'Đã có kết quả'],
  ].forEach(([course, examType, className, d, start, room, proctor, count, status]) => push('exams', { course, examType, className, date: addDays(d), start, room, proctor, count, status, files: [], note: '' }, 'u4'))

  /* ---- Giảng viên Đại học Rennes (theo Đề án 5a & LLKH PL4.3 của hồ sơ chương trình) ----
     Chỉ thông tin nghề nghiệp công khai; thông tin cá nhân (ngày sinh, hộ chiếu, tài khoản) KHÔNG đưa vào bản demo. */
  const DOCS = ['CV / LLKH', 'Bản sao bằng cấp', 'Hộ chiếu', 'HĐ thỉnh giảng đã ký', 'Bảng trừ thuế TNCN 20% đã ký', 'Bảng điểm đã gửi']
  const ADDR = 'Faculté des Sciences Économiques, 7 place Hoche, CS 86514, 35065 Rennes Cedex, France'
  ;[
    ['Franck Martin', 'Professor of Economics, PhD (Paris 1), Agrégation', 'franck.martin@univ-rennes.fr', '',
      'Kinh tế lượng chuỗi thời gian; Kinh tế lượng dữ liệu bảng; Sản phẩm phái sinh; Kinh tế lượng tài chính và Mô hình hóa tài chính',
      'K50, K51 (ISB-K50-01, ISB-K51-01)', 'Kinh tế lượng tài chính, Quản trị rủi ro, Kinh tế vĩ mô, Tài chính định lượng', 144, 0,
      '1150/HĐTG-ĐHKT-TC', 'Đang trình ký', 'Chưa gửi điểm', [1, 1, 1, 0, 0, 0],
      'Điều phối học thuật phía Đại học Rennes (MOA). Đồng trưởng Master Economic & Financial Engineering và Master Finance Data. HĐ 10/09/2026–10/09/2027 – GV chưa ký (cập nhật 11/11).'],
    ['Fabien Rondeau', 'Full Professor, PhD (Rennes 1), HDR', 'fabien.rondeau@univ-rennes.fr', '+33 (0)2 23 23 33 66',
      'Kinh tế vĩ mô; Tài chính quốc tế', 'K51 (ISB-K51-01)', 'Kinh tế vĩ mô, Kinh tế quốc tế, Thương mại & hội nhập, Liên minh châu Âu', 72, 0,
      '', 'Đã ký HĐ', 'Chưa gửi điểm', [1, 1, 1, 1, 0, 0], 'HĐ đã ký, đã lưu trên Drive (cập nhật 04/11). Phiếu đặt phòng BK4744.'],
    ['Jean-Christophe Poutineau', 'Full Professor (Professeur des Universités), Classe exceptionnelle', 'jean-christophe.poutineau@univ-rennes.fr', '',
      'Tiền tệ, Ngân hàng và Thị trường tài chính; Tài chính quốc tế', 'K51 (ISB-K51-01)', 'Kinh tế vĩ mô, Tài chính quốc tế, Chính sách tiền tệ, Chu kỳ kinh doanh', 72, 36,
      '', 'Chưa có', 'Chưa gửi điểm', [1, 1, 0, 0, 0, 0], 'Chưa ký HĐ, chưa gửi điểm (cập nhật 04/11). Văn bản kê thanh toán cần ghi rõ căn cứ HĐ khi có.'],
    ['Christophe Tavera', 'Full Professor in Economics, PhD, HDR', 'christophe.tavera@univ-rennes.fr', '',
      'Kinh tế vĩ mô; Kinh tế lượng chuỗi thời gian; Kinh tế lượng dữ liệu bảng', 'K51 (ISB-K51-01)', 'Kinh tế lượng ứng dụng, Dự báo, Hội tụ kinh tế', 108, 0,
      '', 'Chưa có', 'Chưa gửi điểm', [1, 1, 0, 0, 0, 0], 'Phó Trưởng khoa phụ trách Quan hệ quốc tế, Khoa Kinh tế – Đại học Rennes.'],
    ['Cécile Casteuble', 'Assistant Professor in Economics, PhD (Limoges)', 'cecile.casteuble@univ-rennes.fr', '+33 (0)2 23 23 34 28',
      'Tiền tệ, Ngân hàng và Thị trường tài chính', 'K51 (ISB-K51-01)', 'Ngân hàng & tài chính: thị trường vốn, quản trị ngân hàng, rủi ro', 36, 0,
      '', 'Chưa có', 'Chưa gửi điểm', [1, 0, 0, 0, 0, 0], ''],
    ['Tovonony Razafindrabe', 'Associate Professor (tenure, HDR)', 'tovonony.razafindrabe@univ-rennes.fr', '',
      'Sản phẩm phái sinh; Kinh tế lượng tài chính và Mô hình hóa tài chính', 'K50 (ISB-K50-01)', 'Kinh tế vĩ mô hàng hóa & năng lượng, Biến đổi khí hậu, Tài chính quốc tế, Tỷ giá', 72, 0,
      '', 'Chưa có', 'Chưa gửi điểm', [1, 0, 0, 0, 0, 0], 'Phụ trách sư phạm Master 2 Finance-Data (từ 09/2025).'],
  ].forEach(([fullName, academicTitle, email, phone, courses, cohorts, specialization, hp, hd, contractNo, contractStatus, gradesSent, ck, note]) => {
    const slug = fullName.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z]+/g, '_')
    push('lecturers', {
      fullName, side: 'Rennes', academicTitle, email, phone, courses, cohorts, specialization, address: ADDR,
      hoursPlanned: hp, hoursDone: hd, contractNo, contractStatus, gradesSent, rateEur: 104,
      contractFrom: contractNo ? '2026-09-10' : '', contractTo: contractNo ? '2027-09-10' : '',
      docs: DOCS.map((text, k) => ({ text, done: !!ck[k] })),
      syllabi: courses.split('; ').map((c) => ({ name: `Syllabus_${c.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^A-Za-z0-9]+/g, '_').slice(0, 45)}.pdf`, course: c, size: 230000, type: 'application/pdf', at: new Date().toISOString() })),
      files: [{ name: `CV_${slug}.pdf`, size: 190000, type: 'application/pdf', at: new Date().toISOString() }],
      note,
    }, 'u3')
  })

  // Bổ sung Giảng viên UEH từ Danh sách giảng viên song bằng (PL4.2 / QAIC)
  LECTURERS_ALL.filter((l) => l.side === 'UEH').forEach((l, idx) => {
    push('lecturers', {
      fullName: l.fullName,
      side: 'UEH',
      academicTitle: l.degree || 'Giảng viên',
      email: `${l.fullName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '.')}@ueh.edu.vn`,
      phone: `028 3829 5299 (Ext ${101 + idx})`,
      courses: `Học phần chuyên ngành UEH (${l.coursesCount} môn)`,
      cohorts: 'K50–K51, K52',
      specialization: `Tài chính – Ngân hàng (Ngoại ngữ: ${l.lang || 'C1'})`,
      address: 'Đại học Kinh tế TP.HCM (UEH), 59C Nguyễn Đình Chiểu, Q.3, TP.HCM',
      hoursPlanned: l.coursesCount * 45,
      hoursDone: l.coursesCount * 15,
      contractNo: `HĐ-UEH-${202600 + idx}`,
      contractStatus: 'Đã ký HĐ',
      gradesSent: 'Đã gửi điểm',
      rateEur: 0,
      contractFrom: '2026-09-01',
      contractTo: '2027-08-31',
      docs: [
        { text: 'Lý lịch khoa học (LLKH)', done: true },
        { text: 'Văn bằng / Chứng chỉ chuyên môn', done: true },
        { text: 'Chứng chỉ ngoại ngữ C1/C2', done: !!l.lang },
        { text: 'Phân công giảng dạy của Khoa', done: true },
      ],
      syllabi: [],
      files: [],
      note: `Trình độ: ${l.degree} · Trình độ ngoại ngữ: ${l.lang}. Đã được thẩm định năng lực theo PL4.2 hồ sơ chương trình.`,
    }, 'u2')
  })

  /* ---- Đoàn công tác (chi phí tự tính theo MOA) ---- */
  const ck = (labels, n) => labels.map((text, i) => ({ text, done: i < n, by: i < n ? 'Võ Thanh Tùng' : '', at: i < n ? new Date(Date.now() - (9 - i) * 864e5).toISOString() : '' }))
  const STEPS = ['HĐ thỉnh giảng đã ký', 'Thư mời / hồ sơ visa', 'Đặt vé máy bay', 'Phiếu đặt phòng được duyệt', 'Gửi thông tin chuyến cho GV', 'Đặt xe đón tiễn', 'GV ký bảng trừ thuế 20%', 'Lập đề nghị thanh toán', 'Hoàn ứng / hoàn quỹ Khoa']
  const base = { teachHours: 36, rateEur: 104, taxRate: 20, perDiemDays: 7, perDiemRate: 120, tgvEur: 150, fx: 28000 }
  push('trips', { ...base, lecturer: 'Jean-Christophe Poutineau', course: 'Tiền tệ, Ngân hàng và Thị trường tài chính', className: 'ISB-K51-01', teachFrom: addDays(-12), teachTo: addDays(-7), contractNo: '', outFlight: 'AF 258 · CDG → SGN', departAt: dt(-14, '22:45'), arriveAt: dt(-13, '17:30'), returnFlight: 'AF 257 · SGN → CDG', returnAt: dt(-5, '23:15'), hotel: 'UEH Boutique Hotel (giảm 50%)', bookingCode: '', hotelStatus: 'Đã xác nhận', checkIn: addDays(-13), checkOut: addDays(-5), visa: 'Đã cấp visa', pickup: 'Xe 7 chỗ – anh Hùng 0903 xxx 112', ticketCost: 32500000, hotelCost: 9900000, otherCost: 1500000, advanceBy: 'u3', advanceEur: 2100, advanceStatus: 'Đã tạm ứng', status: 'Hoàn tất', payStatus: 'Đã tạm ứng', steps: ck(STEPS, 7), files: [{ name: 'E-ticket_AF258.pdf', size: 98000, type: 'application/pdf', at: new Date().toISOString() }, { name: 'Booking_Poutineau.pdf', size: 140000, type: 'application/pdf', at: new Date().toISOString() }], note: 'Chưa ký HĐ thỉnh giảng, chưa gửi điểm. Chờ lập đề nghị thanh toán và hoàn ứng.' }, 'u5')
  push('trips', { ...base, lecturer: 'Fabien Rondeau', course: 'Tài chính quốc tế', className: 'ISB-K51-01', teachFrom: addDays(22), teachTo: addDays(27), contractNo: '', outFlight: 'AF 258 · CDG → SGN', departAt: dt(19, '22:45'), arriveAt: dt(20, '17:30'), returnFlight: 'AF 257 · SGN → CDG', returnAt: dt(28, '23:15'), hotel: 'UEH Boutique Hotel (giảm 50%)', bookingCode: 'BK4744', hotelStatus: 'Đã xác nhận', checkIn: addDays(20), checkOut: addDays(29), visa: 'Không cần', pickup: 'Chưa đặt xe', ticketCost: 31200000, hotelCost: 9000000, otherCost: 0, advanceStatus: 'Không tạm ứng', status: 'Đã xác nhận', payStatus: 'Chưa thanh toán', steps: ck(STEPS, 4), files: [{ name: 'BK4744_FabienRondeau.pdf', size: 140000, type: 'application/pdf', at: new Date().toISOString() }], note: 'HĐ đã ký. Phòng do chị Kiều đặt (phiếu BK4744) – chờ gửi thông tin phòng cho GV.' }, 'u5')
  push('trips', { ...base, lecturer: 'Franck Martin', course: 'Sản phẩm phái sinh', className: 'ISB-K50-01', teachFrom: addDays(29), teachTo: addDays(34), contractNo: '1150/HĐTG-ĐHKT-TC', outFlight: 'VN 10 · CDG → SGN', departAt: dt(26, '13:20'), arriveAt: dt(27, '07:05'), returnFlight: 'VN 11 · SGN → CDG', returnAt: dt(35, '23:50'), hotel: 'UEH Boutique Hotel (giảm 50%)', bookingCode: 'BK4949', hotelStatus: 'Đã gửi phiếu', checkIn: addDays(27), checkOut: addDays(36), visa: 'Không cần', pickup: 'Chưa đặt xe', ticketCost: 0, hotelCost: 9000000, otherCost: 0, advanceStatus: 'Không tạm ứng', status: 'Đã xác nhận', payStatus: 'Chưa thanh toán', steps: ck(STEPS, 1), files: [{ name: 'BK4949_FranckPierreMartin.pdf', size: 141000, type: 'application/pdf', at: new Date().toISOString() }], note: 'HĐ 10/09/2026–10/09/2027 chưa ký. Phiếu phòng BK4949 chưa được duyệt – cần đẩy lên.' }, 'u5')

  /* ---- Điểm học phần Rennes (thang 20) ---- */
  out.filter((x) => x.module === 'students' && x.cohort === 'K50–K51').forEach((st, i) => {
    ;['Tiền tệ, Ngân hàng và Thị trường tài chính', 'Kinh tế vĩ mô', 'Tài chính quốc tế'].forEach((course, j) => {
      const sc = Math.round((9 + ((i * 7 + j * 5) % 9) + (j === 1 ? 0.5 : 0.25 * j)) * 100) / 100
      push('grades', { studentId: st.studentId, fullName: st.fullName, course, term: j < 2 ? 'S3 2025–2026' : 'S4 2025–2026', score20: Math.min(19.5, sc), note: '' }, 'u4')
    })
  })

  /* ---- Học phí chuyển Rennes ---- */
  ;[
    ['Năm 3 – K50–K51 bổ sung (2025–2026)', 2, 900, -120, -100, 'Rennes đã xác nhận', 0],
    ['HK1 2026–2027 – Khóa K50–K51', 30, 900, -4, '', 'Đề nghị', 27000],
  ].forEach(([term, sc, fee, rq, tf, status, debt]) => push('transfers', { term, studentCount: sc, feePerStudent: fee, fx: 28000, requestDate: addDays(rq), transferDate: tf === '' ? '' : addDays(tf), status, debt, files: [], note: '' }, 'u3'))

  /* ---- Chi phí ---- */
  ;[
    [-13, 'Vé máy bay khứ hồi GV Poutineau', 'Vé máy bay', 32500000, 'Air France (đại lý)', 'PC-0912', 'Đã chi'],
    [-13, 'Khách sạn GV Poutineau', 'Khách sạn', 19800000, 'Liberty Central', 'PC-0913', 'Đã duyệt'],
    [-10, 'Tiếp đoàn giảng viên Rennes', 'Ăn uống, tiếp khách', 4200000, 'Nhà hàng Hoa Túc', 'PC-0920', 'Đã chi'],
    [-6, 'Thù lao giảng dạy đợt 1 – GV UEH', 'Thù lao giảng viên', 56000000, 'GV UEH (5 người)', 'PC-0931', 'Đã quyết toán'],
    [-2, 'Taxi đón tiễn sân bay', 'Đi lại', 1500000, 'Taxi Mai Linh', 'PC-0940', 'Đề nghị'],
    [-1, 'In tài liệu pre-course tiếng Pháp', 'Văn phòng phẩm', 2300000, 'Cửa hàng in Q.3', 'PC-0941', 'Đề nghị'],
  ].forEach(([d, item, category, amount, payee, voucher, status]) => push('expenses', { date: addDays(d), item, category, amount, payee, voucher, status, files: [], note: '' }, 'u3'))

  /* ---- Hộp thư sinh viên ---- */
  ;[
    ['Xin hỗ trợ đăng nhập LMS Rennes', 'Nguyễn Minh An', 'an.nguyen0@st.ueh.demo', -1, '09:12', 'Tài khoản Rennes', 'Đang xử lý', 'u7', 1,
      'Em chào thầy cô,\n\nEm là Nguyễn Minh An, lớp ISB-K52-01. Em đã nhận được email tài khoản Rennes nhưng khi đăng nhập LMS thì báo "invalid credentials". Em đã thử đặt lại mật khẩu nhưng không nhận được email.\n\nNhờ thầy cô hỗ trợ giúp em ạ. Em cảm ơn!', [['u7', 'đã gửi yêu cầu reset cho IT Rennes']]],
    ['Xin gia hạn đóng học phí HK1', 'Đỗ Khánh Phúc', 'phuc.do8@st.ueh.demo', -2, '15:40', 'Học phí', 'Chờ SV phản hồi', 'u3', 3,
      'Kính gửi Phòng Đào tạo,\n\nGia đình em đang gặp khó khăn tài chính, em xin phép được gia hạn đóng phần học phí còn lại của HK1 đến ngày 30 tháng này.\n\nEm xin cảm ơn.', [['u3', 'đã yêu cầu SV nộp đơn có xác nhận của phụ huynh']]],
    ['Hỏi về thủ tục visa du học năm 3', 'Lê Ngọc Linh', 'linh.le4@st.ueh.demo', -4, '20:05', 'Du học / visa', 'Mới', '', 2,
      'Dạ em chào thầy cô,\n\nEm là SV Khóa K50–K51, em muốn hỏi khi nào trường gửi thư nhập học của Rennes để em làm hồ sơ Campus France và visa du học ạ?\n\nEm cảm ơn ạ.', []],
    ['Đề nghị phúc khảo môn Tài chính doanh nghiệp', 'Trần Thanh Quân', 'quan.tran1@st.ueh.demo', -6, '10:30', 'Khảo thí', 'Đã giải quyết', 'u4', -3,
      'Em xin phúc khảo bài thi cuối kỳ môn Tài chính doanh nghiệp, mã SV 3510012. Em nghĩ phần tự luận câu 3 bị chấm thiếu.', [['u4', 'đã chuyển GV chấm lại'], ['u4', 'điểm sau phúc khảo tăng 0,5 – đã báo SV']]],
    ['Xin bảo lưu kết quả học tập', 'Bùi Hoài Trâm', 'tram.bui7@st.ueh.demo', 0, '08:15', 'Học vụ', 'Mới', '', 3,
      'Em chào thầy cô, em muốn xin bảo lưu 1 học kỳ vì lý do sức khỏe. Thủ tục cần những giấy tờ gì ạ?', []],
  ].forEach(([subject, fromName, fromEmail, d, t, topic, status, handler, due, body, log]) =>
    push('tickets', { subject, fromName, fromEmail, receivedAt: dt(d, t), topic, status, handler, due: addDays(due), body, files: [], log: log.map(([u, text], k) => ({ userId: u, text, at: new Date(Date.now() - (k ? 2 : 5) * 36e5).toISOString() })) }, 'u6'))

  return out
}

/* ================= DỮ LIỆU BÀN LÀM VIỆC DỰ ÁN QUỸ ĐẦU TƯ MẠO HIỂM GIA LAI ================= */
export function buildGiaLaiItems(pid = 'p3') {
  const out = []
  let n = 0
  const push = (module, data, by = 'u1') =>
    out.push({
      id: `i_${module}_${++n}`,
      projectId: pid,
      module,
      createdBy: by,
      updatedBy: by,
      createdAt: new Date(Date.now() - n * 36e5).toISOString(),
      updatedAt: new Date(Date.now() - n * 18e5).toISOString(),
      ...data,
    })

  /* ---- Card 01: Văn bản & Pháp lý Sở Ngành (gl_docs) ---- */
  // Thống kê: Đã ký: 5 | Đang phúc đáp: 2 | Chờ ý kiến Sở ngành: 2
  const glDocs = [
    {
      number: '0440/QĐ-TTKPKH',
      title: 'Quyết định thành lập Tổ chuyên viên và giao nhiệm vụ xây dựng Đề án Quỹ ĐTMH tỉnh Gia Lai',
      agency: 'Trung tâm Khởi nghiệp & ĐMST',
      docType: 'Quyết định giao nhiệm vụ',
      issueDate: '2026-11-06',
      status: 'Đã ký',
      files: [{ name: '0440_QĐ-TTKPKH_06112026-signed_01.pdf', size: 345000 }],
      note: 'Giao Trung tâm phối hợp cùng Nhóm chuyên gia tư vấn UEH xây dựng hoàn thiện hồ sơ Đề án, Tờ trình và dự thảo Nghị quyết HĐND tỉnh.',
    },
    {
      number: '11578/STC-DNKTTT',
      title: 'Ý kiến của Sở Tài chính về nguồn vốn ngân sách và cơ chế tài chính cho Quỹ ĐTMH',
      agency: 'Sở Tài chính Gia Lai',
      docType: 'Công văn đến',
      issueDate: '2026-11-06',
      status: 'Chờ ý kiến Sở ngành',
      files: [{ name: '11578_STC-DNKTTT_06112026-signed_01.pdf', size: 420000 }],
      note: 'Sở Tài chính đề nghị rà soát kỹ tính tương thích với Luật NSNN và tỷ lệ góp vốn điều lệ ngân sách tỉnh tối đa 30%.',
    },
    {
      number: '5961/SCT-VP',
      title: 'Góp ý dự thảo Đề án và danh sách doanh nghiệp khởi nghiệp ĐMST tiềm năng',
      agency: 'Sở Công thương Gia Lai',
      docType: 'Công văn đến',
      issueDate: '2026-11-06',
      status: 'Đã ký',
      files: [{ name: '5961_SCT-VP_06112026-signed_01.pdf', size: 280000 }],
      note: 'Đề xuất bổ sung nhóm ngành chế biến nông sản xuất khẩu và năng lượng tái tạo vào danh mục ưu tiên đầu tư của Quỹ.',
    },
    {
      number: 'CV/CT-TTHT',
      title: 'Chính sách ưu đãi thuế TNDN, TNCN đối với hoạt động đầu tư mạo hiểm địa phương',
      agency: 'Cục Thuế tỉnh Gia Lai',
      docType: 'Công văn đến',
      issueDate: '2026-11-08',
      status: 'Đã ký',
      files: [{ name: 'Thuế - Cong van phoi hop So KHCN.pdf', size: 310000 }],
      note: 'Hướng dẫn điều kiện áp dụng ưu đãi thuế theo Nghị định 365/2025/NĐ-CP và Nghị định 366/2025/NĐ-CP.',
    },
    {
      number: '13057/SNNMT-KHTC',
      title: 'Danh mục dự án nông nghiệp công nghệ cao tiềm năng kêu gọi đầu tư mạo hiểm',
      agency: 'Sở NN&PTNT Gia Lai',
      docType: 'Công văn đến',
      issueDate: '2026-11-10',
      status: 'Đã ký',
      files: [{ name: '13057_SNNMT-KHTC_Phu_luc_I-II.pdf', size: 520000 }],
      note: 'Cung cấp phụ lục 15 HTX và doanh nghiệp nông nghiệp tuần hoàn, giống cà phê Robusta đặc sản và dược liệu Chư Prông.',
    },
    {
      number: 'CV-UEH/GL-01',
      title: 'Công văn phúc đáp Sở KH&CN tỉnh Gia Lai về tiếp thu góp ý và điều chỉnh đề cương Đề án',
      agency: 'Nhóm Tư vấn UEH',
      docType: 'Công văn đi',
      issueDate: '2026-11-11',
      status: 'Đang phúc đáp',
      files: [{ name: 'Công văn phúc đáp Sở KHCN tỉnh Gia Lai.docx', size: 190000 }, { name: 'Công văn phúc đáp Sở KHCN tỉnh Gia Lai.pdf', size: 260000 }],
      note: 'Giải trình 04 nhóm vấn đề trọng tâm và kế hoạch làm việc thực tế tại tỉnh Pleiku.',
    },
    {
      number: 'CV-UEH/STC-02',
      title: 'Đề xuất nội dung phúc đáp Sở Tài chính tỉnh Gia Lai về phương án vốn và bảo toàn vốn mồi',
      agency: 'Nhóm Tư vấn UEH',
      docType: 'Công văn đi',
      issueDate: '2026-11-12',
      status: 'Đang phúc đáp',
      files: [{ name: 'CV de xuat noi dung phuc dap So Tai chinh - dieu chinh signed.pdf', size: 380000 }],
      note: 'Đề xuất phương án vốn điều lệ 100 tỷ VNĐ (NSNN 30 tỷ + Cổ đông tư nhân 70 tỷ), cơ chế phân chia rủi ro theo chuẩn mực quốc tế.',
    },
    {
      number: 'TTr-UBND/QDTMH',
      title: 'Dự thảo Tờ trình UBND tỉnh Gia Lai trình HĐND tỉnh ban hành Nghị quyết thành lập Quỹ',
      agency: 'UBND Tỉnh Gia Lai',
      docType: 'Tờ trình UBND tỉnh',
      issueDate: '2026-11-14',
      status: 'Chờ ý kiến Sở ngành',
      files: [{ name: 'TTr DA Thanh lap Quy dau tu mao hiem.signed.pdf', size: 450000 }],
      note: 'Tờ trình hoàn thiện kèm Dự thảo Nghị quyết cơ chế đặc thù, đang xin ý kiến thành viên UBND tỉnh.',
    },
    {
      number: 'CV-DNT/GL-03',
      title: 'Ý kiến góp ý của Hội Doanh nhân trẻ tỉnh Gia Lai về cơ chế thoái vốn và khẩu vị đầu tư',
      agency: 'Trung tâm Khởi nghiệp & ĐMST',
      docType: 'Công văn đến',
      issueDate: '2026-11-09',
      status: 'Đã ký',
      files: [{ name: 'CV DNT gop y De an Quy DTMH gui SKHCN.pdf', size: 240000 }],
      note: 'Khẳng định sự ủng hộ của cộng đồng doanh nghiệp địa phương và đề xuất các điều khoản thoái vốn linh hoạt.',
    },
  ]
  glDocs.forEach((doc) => push('gl_docs', doc, 'u1'))

  /* ---- Card 02: Khảo sát & Dữ liệu Đầu vào (gl_surveys) ---- */
  // Thống kê: Đã gửi phiếu: 1 | Đã nhận số liệu: 4 | Cần thu thập thêm: 1
  const glSurveys = [
    {
      code: 'KS-DN-01',
      dataTitle: 'Phiếu khảo sát nhu cầu vốn và thực trạng ĐMST của 120 DN & HTX tỉnh Gia Lai',
      source: 'Cộng đồng DN/HTX tỉnh Gia Lai',
      dataType: 'Khảo sát nhu cầu vốn DN/HTX',
      status: 'Đã gửi phiếu',
      sampleCount: '48/120 phiếu (40%)',
      updatedDate: '2026-11-12',
      files: [{ name: 'Phieu_de_nghi_cung_cap_thong_tin_DeAn_QuyDTMH_GiaLai.docx', size: 140000 }],
      note: 'Đã gửi phiếu điện tử và trực tiếp đến 120 DN/HTX. Đã thu về 48 phiếu hợp lệ, dự kiến kết thúc đợt khảo sát vào 20/11.',
    },
    {
      code: 'PII-GL-2026',
      dataTitle: 'Bộ chỉ số Đổi mới sáng tạo cấp địa phương PII 2026 tỉnh Gia Lai (52 chỉ số thành phần)',
      source: 'Bộ KH&CN & Sở KH&CN Gia Lai',
      dataType: 'Chỉ số PII địa phương',
      status: 'Đã nhận số liệu',
      sampleCount: '52/52 chỉ số (100%)',
      updatedDate: '2026-11-05',
      files: [{ name: 'PII2026.pdf', size: 2800000 }, { name: 'muc_tieu_pii2026.pdf', size: 680000 }],
      note: 'Điểm sáng ở Thể chế và Tri thức & Sáng tạo; điểm nghẽn là Vốn tín dụng cho ĐMST và Cơ sở hạ tầng vườn ươm.',
    },
    {
      code: 'KTXH-Q3',
      dataTitle: 'Báo cáo Tình hình Kinh tế – Xã hội Quý III và 9 tháng đầu năm 2026 tỉnh Gia Lai',
      source: 'Cục Thống kê tỉnh Gia Lai',
      dataType: 'Báo cáo KTXH tỉnh',
      status: 'Đã nhận số liệu',
      sampleCount: '1 báo cáo chuyên sâu',
      updatedDate: '2026-10-25',
      files: [{ name: 'TÌNH HÌNH KINH TẾ - XÃ HỘI QUÝ III 2026.pdf', size: 1950000 }],
      note: 'Tăng trưởng GRDP ước đạt 6.85%; thế mạnh hàng đầu là nông sản xuất khẩu, dược liệu và du lịch sinh thái.',
    },
    {
      code: 'CD-TN-A13',
      dataTitle: 'Danh sách nhà đầu tư tiềm năng (Nhóm A1–A3) & Doanh nghiệp đầu ngành cam kết góp vốn',
      source: 'Hội Doanh nhân trẻ & Sở KH&CN',
      dataType: 'Dữ liệu cổ đông tư nhân (A1-A3)',
      status: 'Cần thu thập thêm',
      sampleCount: '3/10 doanh nghiệp cam kết',
      updatedDate: '2026-11-13',
      files: [{ name: 'Đề xuất cung cấp dữ liệu_bản rút gọn_định dạng UEH.docx', size: 210000 }],
      note: 'Bà Lê Uyên Chi (Sở KH&CN) đang đôn đốc hoàn thiện danh sách cam kết góp vốn tư nhân trước ngày 18/11.',
    },
    {
      code: 'NN-CNC-15',
      dataTitle: 'Danh mục 15 dự án khởi nghiệp nông nghiệp công nghệ cao trọng điểm tỉnh Gia Lai',
      source: 'Sở NN&PTNT tỉnh Gia Lai',
      dataType: 'Danh mục nông nghiệp CNC',
      status: 'Đã nhận số liệu',
      sampleCount: '15/15 dự án tiềm năng',
      updatedDate: '2026-11-08',
      files: [{ name: 'Phu luc DS cac doan cong tac & du an nong nghiep.pdf', size: 340000 }],
      note: 'Bao gồm cà phê đặc sản, hồ tiêu hữu cơ, mắc ca, sâm Ngọc Linh và chăn nuôi đại gia súc công nghệ cao.',
    },
    {
      code: 'THUE-DN-26',
      dataTitle: 'Thống kê nghĩa vụ thuế và doanh thu của khối doanh nghiệp khởi nghiệp ĐMST Gia Lai',
      source: 'Cục Thuế tỉnh Gia Lai',
      dataType: 'Số liệu ngành Thuế',
      status: 'Đã nhận số liệu',
      sampleCount: '250 doanh nghiệp',
      updatedDate: '2026-11-09',
      files: [{ name: 'Thuế - Cong van phoi hop So KHCN.pdf', size: 310000 }],
      note: 'Dữ liệu phục vụ đánh giá tác động ngân sách và chính sách miễn giảm thuế khi Quỹ đi vào hoạt động.',
    },
  ]
  glSurveys.forEach((s) => push('gl_surveys', s, 'u7'))

  /* ---- Card 03: Soạn thảo & Biên tập Đề án (gl_drafts) ---- */
  // Thống kê: Bản thảo: 1 | Đang phản biện: 2 | Bản hoàn thiện: 3
  const glDrafts = [
    {
      versionCode: 'DC-CT-01',
      docTitle: 'Đề cương nội dung chi tiết – Đề án thành lập Quỹ Đầu tư Mạo hiểm tỉnh Gia Lai',
      leadAuthor: 'u1',
      docType: 'Đề cương chi tiết',
      status: 'Bản hoàn thiện',
      updatedAt: '2026-11-08',
      files: [{ name: 'Đề cương nội dung - Đề án thành lập Quỹ _ Gia Lai.docx', size: 160000 }, { name: 'Đề cương nội dung - Đề án thành lập Quỹ _ Gia Lai.pdf', size: 280000 }],
      reviewFeedback: 'Đã tiếp thu toàn bộ góp ý của Sở KH&CN và Thường trực Tổ chuyên viên. Khung 3 phần chuẩn hóa.',
    },
    {
      versionCode: 'DA-GL-v1.0',
      docTitle: 'Dự thảo Đề án thành lập Quỹ Đầu tư Mạo hiểm tỉnh Gia Lai (Phiên bản v1.0 tích hợp)',
      leadAuthor: 'u1',
      docType: 'Dự thảo Đề án',
      status: 'Bản thảo',
      updatedAt: '2026-11-13',
      files: [{ name: 'DeAn_QuyDTMH_GiaLai_PhanNhung.docx', size: 420000 }],
      reviewFeedback: 'Đã ghép các phần của ThS. Nhung, ThS. Quyên, ThS. Vi. Đang rà soát số liệu Bảng X vốn đầu tư.',
    },
    {
      versionCode: 'REF-HCM-v6.3',
      docTitle: 'Dự thảo Đề án Thành lập Quỹ Đầu tư Mạo hiểm TP.HCM (Phiên bản v6.3 chuẩn)',
      leadAuthor: 'u2',
      docType: 'Dự thảo Đề án',
      status: 'Bản hoàn thiện',
      updatedAt: '2026-10-30',
      files: [{ name: '02. Du thao DA Thanh lap Quy dau tu mao hiem TPHCM - v6.3.signed.pdf', size: 1200000 }],
      reviewFeedback: 'Tài liệu tham chiếu chuẩn mô hình quỹ đầu tiên tại Việt Nam để tùy biến phù hợp với địa phương.',
    },
    {
      versionCode: 'TT-RG-01',
      docTitle: 'Bản tóm tắt rút gọn Đề án phục vụ báo cáo Thường trực UBND tỉnh và Tỉnh ủy',
      leadAuthor: 'u2',
      docType: 'Bản tóm tắt rút gọn',
      status: 'Đang phản biện',
      updatedAt: '2026-11-12',
      files: [{ name: 'Đề xuất cung cấp dữ liệu_bản rút gọn.docx', size: 180000 }, { name: 'Đề xuất cung cấp dữ liệu_bản rút gọn.pdf', size: 310000 }],
      reviewFeedback: 'Gồm 8 trang infographic và bảng tổng hợp cơ chế vốn mồi, dự kiến trình lãnh đạo tỉnh xem trước.',
    },
    {
      versionCode: 'PUB-UEH-STD',
      docTitle: 'Thuyết minh Đề án & Tài liệu trình ký định dạng chuẩn nhận diện thương hiệu UEH',
      leadAuthor: 'u7',
      docType: 'Định dạng chuẩn UEH',
      status: 'Bản hoàn thiện',
      updatedAt: '2026-11-14',
      files: [{ name: 'Đề xuất cung cấp dữ liệu_bản rút gọn_định dạng UEH.docx', size: 240000 }, { name: 'Đề xuất cung cấp dữ liệu_bản rút gọn_định dạng UEH.pdf', size: 480000 }],
      reviewFeedback: 'Ấn phẩm thiết kế chuẩn UEH với dải băng nhận diện, ornament và typography hành chính trang trọng.',
    },
    {
      versionCode: 'NQ-HDND-DFT',
      docTitle: 'Dự thảo Nghị quyết HĐND tỉnh về chính sách phát triển Quỹ ĐTMH tỉnh Gia Lai',
      leadAuthor: 'u1',
      docType: 'Dự thảo Tờ trình & Nghị quyết',
      status: 'Đang phản biện',
      updatedAt: '2026-11-11',
      files: [{ name: 'TTr DA Thanh lap Quy dau tu mao hiem TPHCM.signed.signed.signed.pdf', size: 680000 }],
      reviewFeedback: 'Đang lấy ý kiến pháp lý từ Sở Tư pháp tỉnh Gia Lai về thẩm quyền ban hành chính sách đặc thù.',
    },
  ]
  glDrafts.forEach((d) => push('gl_drafts', d, d.leadAuthor))

  /* ---- Card 04: Lịch làm việc & Hội thảo Thống nhất (gl_meetings) ---- */
  // Thống kê: Sắp diễn ra: 2 | Đã hoàn thành: 1 | Có biên bản họp: 2
  const glMeetings = [
    {
      meetingTitle: 'Buổi làm việc & Trao đổi kỹ thuật với Tổ chuyên viên Sở KH&CN Gia Lai và HCM VIF',
      meetingDate: '2026-11-12T10:30',
      location: 'SIHUB TP.HCM (123 Trương Định, Q.3)',
      participants: 'Lãnh đạo Sở KH&CN Gia Lai (bà Lê Uyên Chi), Đại diện HCM VIF, Nhóm tư vấn UEH (TS. Anh, ThS. Nhung)',
      status: 'Có biên bản họp',
      minutesFile: [{ name: 'Trao_doi_DeAn_QuyDTMH_GiaLai_12112026_UEH.docx', size: 85000 }],
      outcomes: 'Thống nhất 12 câu hỏi trọng tâm về mô hình quản lý, chi phí vận hành và cơ chế thu hút cổ đông tư nhân.',
    },
    {
      meetingTitle: 'Họp trực tuyến với Sở Tài chính Gia Lai về phương án vốn điều lệ và cơ chế vốn mồi',
      meetingDate: '2026-11-09T14:00',
      location: 'Online qua Zoom / Google Meet',
      participants: 'Đại diện Sở Tài chính Gia Lai, Phòng QLNS, Nhóm tài chính UEH (Lê Quốc Bảo, ThS. Nhung)',
      status: 'Có biên bản họp',
      minutesFile: [{ name: 'CV de xuat noi dung phuc dap So Tai chinh - dieu chinh signed.pdf', size: 380000 }],
      outcomes: 'Đồng thuận phương án NSNN góp 30% làm vốn mồi, 70% từ khối tư nhân; cơ chế quản lý vốn theo Luật Doanh nghiệp.',
    },
    {
      meetingTitle: 'Đoàn chuyên gia UEH làm việc trực tiếp tại UBND Tỉnh Gia Lai & Sở KH&CN',
      meetingDate: '2026-11-21T08:30',
      location: 'Trụ sở UBND Tỉnh Gia Lai (TP. Pleiku)',
      participants: 'Thường trực UBND tỉnh, Giám đốc Sở KH&CN, Sở Tài chính, Sở Kế hoạch & Đầu tư, Đoàn chuyên gia UEH',
      status: 'Sắp diễn ra',
      minutesFile: [],
      outcomes: 'Báo cáo tiến độ hoàn thiện Đề án, thông qua đề xuất vốn mồi và xin ý kiến định hướng trước khi trình HĐND.',
    },
    {
      meetingTitle: 'Hội thảo tham vấn chuyên gia & Hiệp hội Doanh nghiệp trẻ tỉnh Gia Lai',
      meetingDate: '2026-11-28T09:00',
      location: 'Hội trường Khách sạn HAGL Pleiku',
      participants: 'Đoàn tư vấn UEH, Hội Doanh nhân trẻ Gia Lai, 40 doanh nghiệp và HTX tiêu biểu trên địa bàn',
      status: 'Sắp diễn ra',
      minutesFile: [],
      outcomes: 'Khảo sát khẩu vị rủi ro, cam kết góp vốn của các nhà đầu tư hạt giống A1–A3 và tiếp thu ý kiến hoàn thiện.',
    },
    {
      meetingTitle: 'Tọa đàm chuyên đề: Kinh nghiệm thành lập Quỹ đầu tư mạo hiểm địa phương',
      meetingDate: '2026-10-22T09:00',
      location: 'Hội trường Viện Đổi mới sáng tạo UEH',
      participants: 'Các chuyên gia tài chính UEH, đại diện Sở KH&CN Khánh Hòa & Gia Lai, chuyên gia quỹ quốc tế',
      status: 'Đã hoàn thành',
      minutesFile: [{ name: 'vietnam-innovation-and-private-capital-report-2026.pdf', size: 3400000 }],
      outcomes: 'Tổng kết bài học kinh nghiệm quốc tế (Singapore, Israel) về thu hút dòng vốn tư nhân vào ĐMST.',
    },
  ]
  glMeetings.forEach((m) => push('gl_meetings', m, 'u1'))

  /* ---- Card 05: Đoàn công tác & Khảo sát Địa phương (gl_trips) ---- */
  // Thống kê: Chờ duyệt vé: 1 | Đã đặt: 1 | Quyết toán xong: 1
  const glTrips = [
    {
      tripName: 'Đoàn khảo sát thực địa & Tiếp cận doanh nghiệp tại Pleiku – Đợt 1',
      delegation: 'TS. Trần Minh Anh, ThS. Đỗ Thị Quyên, ThS. Trần Tường Vi, CV. Hoàng Gia Huy (4 người)',
      route: 'TP.HCM (SGN) ⇄ Pleiku (PXU)',
      flightDetails: 'Vietnam Airlines: VN 1424 (SGN-PXU) / VN 1425 (PXU-SGN)',
      hotel: 'Khách sạn Hoàng Anh Gia Lai (TP. Pleiku)',
      startDate: '2026-10-18',
      endDate: '2026-10-21',
      cost: 28500000,
      status: 'Quyết toán xong',
      files: [{ name: 'Vé máy bay VNA SGN-PXU khứ hồi - Đoàn 1.pdf', size: 310000 }, { name: 'Hóa đơn khách sạn HAGL Pleiku.pdf', size: 180000 }],
      note: 'Khảo sát 6 nông trường cà phê Chư Prông, HTX dược liệu An Khê và làm việc bước đầu với Sở KH&CN.',
    },
    {
      tripName: 'Đoàn làm việc trực tiếp với Thường trực UBND Tỉnh & Tổ chuyên viên – Đợt 2',
      delegation: 'TS. Trần Minh Anh, ThS. Nguyễn Hồng Nhung, ThS. Đỗ Thị Quyên (3 người)',
      route: 'TP.HCM (SGN) ⇄ Pleiku (PXU)',
      flightDetails: 'Vietnam Airlines: VN 1424 (SGN 07:15) / VN 1425 (PXU 10:20)',
      hotel: 'Khách sạn Tre Xanh Pleiku',
      startDate: '2026-11-20',
      endDate: '2026-11-22',
      cost: 26500000,
      status: 'Đã đặt',
      files: [{ name: 'Phiếu đề nghị đặt vé máy bay SGN-PXU Đợt 2.pdf', size: 195000 }, { name: 'Xác nhận booking VNA VN1424.pdf', size: 220000 }],
      note: 'Vé máy bay và khách sạn đã hoàn tất đặt chỗ. Lịch làm việc chính thức tại UBND tỉnh sáng 21/11.',
    },
    {
      tripName: 'Đoàn chuyên gia tham dự Hội thảo tham vấn & Báo cáo nghiệm thu – Đợt 3',
      delegation: 'PGS.TS. Bùi Quang Hùng, TS. Trần Minh Anh, ThS. Nguyễn Hồng Nhung, ThS. Trần Tường Vi, CV. Lê Quốc Bảo (5 người)',
      route: 'TP.HCM (SGN) ⇄ Pleiku (PXU)',
      flightDetails: 'Dự kiến Vietjet Air: VJ 392 / VJ 393 hoặc Vietnam Airlines VN 1424',
      hotel: 'Khách sạn Hoàng Anh Gia Lai',
      startDate: '2026-12-05',
      endDate: '2026-12-08',
      cost: 38000000,
      status: 'Chờ duyệt vé',
      files: [{ name: 'Phiếu trình phê duyệt đợt công tác Hội thảo Pleiku.pdf', size: 160000 }],
      note: 'Đang trình lãnh đạo UEH phê duyệt công lệnh công tác và đề xuất phương án vé máy bay tối ưu.',
    },
  ]
  glTrips.forEach((t) => push('gl_trips', t, 'u5'))

  /* ---- Card 06: Nhóm Chuyên gia & Phân công Biên soạn (gl_experts) ---- */
  // Thống kê: Đúng hạn: 4 | Cần đôn đốc: 1
  const glExperts = [
    {
      fullName: 'TS. Trần Minh Anh',
      academicTitle: 'Tiến sĩ Kinh tế',
      role: 'Trưởng nhóm Tư vấn UEH',
      topicAssigned: 'Chủ trì tổng thể Đề án, Tờ trình UBND tỉnh, Thuyết minh Đề án và giải trình Tỉnh ủy',
      deadline: '2026-11-25',
      progress: '85%',
      status: 'Đúng hạn',
      email: 'minhanh@ueh.demo',
      phone: '0903 124 567',
      note: 'Điều phối toàn bộ các nhóm chuyên môn, chịu trách nhiệm chất lượng hồ sơ trình ký.',
    },
    {
      fullName: 'ThS. Nguyễn Hồng Nhung',
      academicTitle: 'Thạc sĩ Tài chính – Ngân hàng',
      role: 'Chuyên gia Tài chính & Quỹ đầu tư',
      topicAssigned: 'Mục tiêu Đề án, Nguồn vốn, Chức năng nhiệm vụ, Cơ chế phân bổ vốn đầu tư mạo hiểm theo ngành',
      deadline: '2026-11-18',
      progress: '90%',
      status: 'Đúng hạn',
      email: 'nhung.nguyen@ueh.demo',
      phone: '0918 345 678',
      note: 'Đã hoàn thiện tài liệu DeAn_QuyDTMH_GiaLai_PhanNhung.docx, đang đối soát Bảng X với nhóm chị Quyên.',
    },
    {
      fullName: 'ThS. Đỗ Thị Quyên',
      academicTitle: 'Thạc sĩ Kinh tế phát triển',
      role: 'Chuyên gia Kinh tế vùng & ĐMST',
      topicAssigned: 'Đánh giá hiện trạng KTXH Gia Lai, Phân tích chỉ số PII 2026, Danh mục dự án nông nghiệp công nghệ cao',
      deadline: '2026-11-15',
      progress: '65%',
      status: 'Cần đôn đốc',
      email: 'quyen.do@ueh.demo',
      phone: '0982 456 789',
      note: 'Cần đẩy nhanh hoàn thiện phân tích bảng số liệu 52 chỉ số PII và dữ liệu GRDP quý 3 để ghép vào bản thảo chung.',
    },
    {
      fullName: 'ThS. Trần Tường Vi',
      academicTitle: 'Thạc sĩ Luật kinh tế',
      role: 'Chuyên gia Pháp lý & Quản trị quỹ',
      topicAssigned: 'Mô hình tổ chức vận hành quỹ (AMC / Quản lý nội bộ), Cơ chế thoái vốn, Quản trị rủi ro & giải thể',
      deadline: '2026-11-20',
      progress: '80%',
      status: 'Đúng hạn',
      email: 'vi.tran@ueh.demo',
      phone: '0973 567 890',
      note: 'Đang hoàn tất dự thảo Điều lệ Quỹ bám sát Nghị định 365/2025/NĐ-CP và Luật Doanh nghiệp 2020.',
    },
    {
      fullName: 'PGS.TS. Bùi Quang Hùng',
      academicTitle: 'Phó Giáo sư, Tiến sĩ',
      role: 'Cố vấn Chiến lược & Phản biện độc lập',
      topicAssigned: 'Phản biện tính khả thi, thẩm định cơ chế vốn mồi và sự đồng bộ với các nghị quyết trung ương',
      deadline: '2026-11-28',
      progress: '70%',
      status: 'Đúng hạn',
      email: 'hung.bui@ueh.demo',
      phone: '0908 678 901',
      note: 'Sẽ chủ trì phản biện trực tiếp tại Hội thảo tham vấn Pleiku vào cuối tháng 11.',
    },
  ]
  glExperts.forEach((e) => push('gl_experts', e, 'u1'))

  /* ---- Card 07: Thư viện Pháp lý & Tham khảo (gl_legal_lib) ---- */
  // Thống kê: Tài liệu TW: 4 | Văn bản Tỉnh: 2 | Tài liệu quốc tế: 1
  const glLegalLib = [
    {
      number: 'Nghị định 365/2025/NĐ-CP',
      docTitle: 'Nghị định quy định chi tiết về thành lập, tổ chức quản lý và hoạt động của Quỹ đầu tư mạo hiểm',
      legalScope: 'Tài liệu TW',
      issuer: 'Chính phủ',
      yearIssued: '2025',
      keyApplication: 'Khung pháp lý cao nhất cho việc thành lập quỹ, cơ chế góp vốn, quản lý danh mục và điều kiện đầu tư.',
      files: [{ name: 'Nghị định 365-2025.pdf', size: 1850000 }],
      note: 'Chương II quy định chi tiết về mô hình công ty cổ phần hoặc công ty TNHH thực hiện chức năng quỹ đầu tư mạo hiểm.',
    },
    {
      number: 'Nghị định 366/2025/NĐ-CP',
      docTitle: 'Nghị định về cơ chế tài chính, ưu đãi thuế và cơ chế bảo toàn vốn nhà nước trong hoạt động ĐMST',
      legalScope: 'Tài liệu TW',
      issuer: 'Chính phủ',
      yearIssued: '2025',
      keyApplication: 'Cơ sở quan trọng giải trình với Sở Tài chính về việc chấp nhận rủi ro đầu tư và không coi là làm thất thoát NSNN.',
      files: [{ name: 'Nghị định 366-2025.pdf', size: 1420000 }],
      note: 'Khoản 3 Điều 14: Đánh giá hiệu quả vốn nhà nước trên toàn bộ danh mục đầu tư thay vì từng dự án đơn lẻ.',
    },
    {
      number: 'Luật số 59/2020/QH14',
      docTitle: 'Luật Doanh nghiệp năm 2020 (sửa đổi, bổ sung)',
      legalScope: 'Tài liệu TW',
      issuer: 'Quốc hội',
      yearIssued: '2020',
      keyApplication: 'Quy định quyền và nghĩa vụ của cổ đông sáng lập, quyền biểu quyết của phần vốn nhà nước và chuyển nhượng cổ phần.',
      files: [{ name: 'Luật Doanh nghiệp.pdf', size: 2100000 }],
      note: 'Căn cứ xác lập loại hình doanh nghiệp cho Quỹ và cơ chế ủy quyền đại diện phần vốn nhà nước.',
    },
    {
      number: 'Báo cáo NIC & Do Ventures',
      docTitle: 'Báo cáo Đổi mới sáng tạo và Vốn đầu tư tư nhân Việt Nam giai đoạn 2022–2025',
      legalScope: 'Tài liệu TW',
      issuer: 'Trung tâm Đổi mới sáng tạo Quốc gia (NIC)',
      yearIssued: '2026',
      keyApplication: 'Cung cấp số liệu vĩ mô về vốn đầu tư mạo hiểm tại Việt Nam (Bảng X trong dự thảo Đề án).',
      files: [{ name: 'vietnam-innovation-and-private-capital-report-2026.pdf', size: 3400000 }],
      note: 'Tỷ trọng vốn đầu tư mạo hiểm vào dịch vụ tài chính 23.4%, y tế 21.1%, nông nghiệp công nghệ cao đang tăng nhanh.',
    },
    {
      number: 'Nghị quyết 60/NQ-HĐND',
      docTitle: 'Nghị quyết HĐND tỉnh Gia Lai về kế hoạch phát triển KTXH và các cơ chế khuyến khích ĐMST',
      legalScope: 'Văn bản Tỉnh',
      issuer: 'HĐND Tỉnh Gia Lai',
      yearIssued: '2024',
      keyApplication: 'Căn cứ thực tiễn địa phương về mục tiêu bố trí nguồn lực ngân sách cho ĐMST giai đoạn 2026–2030.',
      files: [{ name: 'NQ_GiaLai.pdf', size: 780000 }],
      note: 'Nêu rõ định hướng ưu tiên hình thành các thiết chế tài chính hỗ trợ hệ sinh thái khởi nghiệp vùng Tây Nguyên.',
    },
    {
      number: 'DA-HCM-VIF-v6.3',
      docTitle: 'Đề án Thành lập Quỹ Đầu tư Mạo hiểm TP.HCM (HCM VIF) và dự thảo Điều lệ Quỹ',
      legalScope: 'Văn bản Tỉnh',
      issuer: 'UBND TP.HCM – Sở KH&CN TP.HCM',
      yearIssued: '2026',
      keyApplication: 'Mô hình thực tiễn đầu tiên của cả nước để Gia Lai học tập kinh nghiệm về điều lệ, hợp đồng góp vốn.',
      files: [{ name: '02. Du thao DA Thanh lap Quy dau tu mao hiem TPHCM - v6.3.signed.pdf', size: 1200000 }],
      note: 'Mô hình quỹ kết hợp vốn nhà nước mồi (30%) và cổ đông tư nhân (70%), đặt trụ sở tại không gian ĐMST SIHUB.',
    },
    {
      number: 'INT-YOZMA-SG',
      docTitle: 'Mô hình Quỹ Khởi nghiệp Israel (Yozma Program) & Quỹ Đầu tư ĐMST Singapore (SEEDS)',
      legalScope: 'Tài liệu quốc tế',
      issuer: 'Viện Đổi mới sáng tạo UEH tổng hợp',
      yearIssued: '2025',
      keyApplication: 'Kinh nghiệm quốc tế về cơ chế Matching Fund và quyền mua lại cổ phần ưu đãi cho đối tác tư nhân.',
      files: [{ name: 'Financial development and innovation models.pdf', size: 1650000 }],
      note: 'Bài học đắt giá về việc Nhà nước chấp nhận chịu rủi ro cao hơn để kích hoạt nguồn vốn tư nhân vào công nghệ mới.',
    },
  ]
  glLegalLib.forEach((l) => push('gl_legal_lib', l, 'u2'))

  /* ---- Card 08: Chi phí & Quyết toán Hợp đồng Tư vấn (gl_finance) ---- */
  // Thống kê: Đã chi: 2 | Đang giải ngân: 2 | Chứng từ chờ duyệt: 2
  const glFinance = [
    {
      code: 'TU-01-30%',
      title: 'Tạm ứng Đợt 1 Hợp đồng Tư vấn xây dựng Đề án (30% giá trị hợp đồng)',
      category: 'Tạm ứng hợp đồng',
      amount: 135000000,
      beneficiary: 'Trường Đại học Kinh tế TP. Hồ Chí Minh (UEH)',
      requestDate: '2026-11-02',
      status: 'Đã chi',
      receiptFiles: [{ name: 'Giấy báo có Tạm ứng Đợt 1 Kho bạc Gia Lai.pdf', size: 210000 }],
      note: 'Kho bạc Nhà nước tỉnh Gia Lai đã giải ngân tạm ứng Đợt 1 vào tài khoản UEH theo Hợp đồng số 18/HĐ-SKHCN.',
    },
    {
      code: 'TL-CD-05',
      title: 'Thù lao viết 05 chuyên đề chuyên gia tư vấn UEH (Mục tiêu, Nguồn vốn, PII, Thoái vốn, Thể chế)',
      category: 'Thù lao viết chuyên đề',
      amount: 180000000,
      beneficiary: 'Nhóm chuyên gia tư vấn UEH (5 chuyên gia)',
      requestDate: '2026-11-10',
      status: 'Đang giải ngân',
      receiptFiles: [{ name: 'Bảng kê phân bổ thù lao chuyên gia Đề án Gia Lai.pdf', size: 190000 }],
      note: 'Đang chi trả theo tiến độ giao nộp bản thảo chuyên đề của TS. Anh, ThS. Nhung, ThS. Quyên, ThS. Vi.',
    },
    {
      code: 'CTP-D1-PL',
      title: 'Công tác phí & Di chuyển Đoàn chuyên gia UEH khảo sát thực địa Pleiku Đợt 1 (18–21/10/2026)',
      category: 'Công tác phí khảo sát',
      amount: 28500000,
      beneficiary: 'Đoàn công tác UEH (TS. Anh đại diện)',
      requestDate: '2026-10-24',
      status: 'Đã chi',
      receiptFiles: [{ name: 'Bộ chứng từ quyết toán vé máy bay & khách sạn Pleiku Đ1.pdf', size: 580000 }],
      note: 'Đã thanh quyết toán đầy đủ hóa đơn vé máy bay Vietnam Airlines và hóa đơn khách sạn Hoàng Anh Gia Lai.',
    },
    {
      code: 'CTP-D2-PL',
      title: 'Dự toán công tác phí Đoàn chuyên gia làm việc tại UBND Tỉnh Gia Lai Đợt 2 (20–22/11/2026)',
      category: 'Công tác phí khảo sát',
      amount: 26500000,
      beneficiary: 'Đoàn chuyên gia UEH (3 người)',
      requestDate: '2026-11-14',
      status: 'Chứng từ chờ duyệt',
      receiptFiles: [{ name: 'Dự toán chi tiết đoàn công tác Pleiku Đợt 2.pdf', size: 145000 }],
      note: 'Gồm vé máy bay khứ hồi SGN-PXU (3 người), 2 đêm khách sạn Tre Xanh, xe đưa đón và phụ cấp lưu trú.',
    },
    {
      code: 'KS-PII-120',
      title: 'Chi phí điều tra khảo sát 120 DN/HTX, in ấn biểu mẫu và phân tích dữ liệu PII Gia Lai',
      category: 'Khảo sát số liệu PII',
      amount: 35000000,
      beneficiary: 'Tổ khảo sát & điều tra thực địa',
      requestDate: '2026-11-11',
      status: 'Chứng từ chờ duyệt',
      receiptFiles: [{ name: 'Hợp đồng cộng tác viên khảo sát số liệu PII.pdf', size: 230000 }],
      note: 'Thù lao phát phiếu khảo sát và nhập liệu làm sạch dữ liệu 120 phiếu điều tra doanh nghiệp trên địa bàn.',
    },
    {
      code: 'NT-D2-40%',
      title: 'Kinh phí Nghiệm thu Đề án và Quyết toán Đợt 2 Hợp đồng (Phần kinh phí còn lại)',
      category: 'Nghiệm thu thanh lý',
      amount: 135000000,
      beneficiary: 'Trường Đại học Kinh tế TP. Hồ Chí Minh (UEH)',
      requestDate: '2026-12-15',
      status: 'Đang giải ngân',
      receiptFiles: [],
      note: 'Sở KH&CN tỉnh Gia Lai sẽ thanh toán sau khi hoàn tất nghiệm thu chính thức và bàn giao hồ sơ Tờ trình.',
    },
  ]
  glFinance.forEach((f) => push('gl_finance', f, 'u3'))

  return out
}

