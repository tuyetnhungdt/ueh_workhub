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
  const cohorts = [['K50', 'Năm 3', 'ISB-K50-01', 2006], ['K51', 'Năm 2', 'ISB-K51-01', 2007], ['K52', 'Năm 1', 'ISB-K52-01', 2008]]
  for (let i = 0; i < 30; i++) {
    const [cohort, year, cls, by] = cohorts[i % 3]
    const name = `${ho[i % 10]} ${dem[(i * 3) % 10]} ${ten[(i * 7) % 15]}`
    const sid = `3${cohort.slice(1)}${String(1001 + i).slice(1)}`
    const tu = i % 7 === 0 ? 'Chưa đóng' : i % 9 === 0 ? 'Nợ một phần' : i % 13 === 0 ? 'Miễn giảm' : 'Đã đóng'
    const acc = cohort === 'K52' ? (i % 4 === 0 ? 'Chưa cấp' : i % 4 === 1 ? 'Đã yêu cầu' : 'Đã cấp') : 'Đã kích hoạt'
    const short = plain(ten[(i * 7) % 15]) + '.' + plain(ho[i % 10])
    push('students', {
      studentId: sid, fullName: name, dob: `${by}-${String((i % 12) + 1).padStart(2, '0')}-${String((i * 5) % 27 + 1).padStart(2, '0')}`,
      gender: i % 2 ? 'Nam' : 'Nữ', email: `${short}${i}@st.ueh.demo`, phone: `09${String(10000000 + i * 734521).slice(0, 8)}`,
      className: cls, cohort, yearLevel: year, dualDegree: i % 6 === 5 ? 'Chờ duyệt song bằng' : i % 11 === 10 ? 'Không' : 'Có',
      academicStatus: i === 17 ? 'Bảo lưu' : 'Đang học', tuitionStatus: tu, tuitionAmount: 85000000, tuitionPaid: tu === 'Đã đóng' || tu === 'Miễn giảm' ? 85000000 : tu === 'Nợ một phần' ? 40000000 : 0,
      tuitionNote: tu === 'Nợ một phần' ? 'Xin gia hạn đến cuối tháng' : '', rennesId: acc === 'Chưa cấp' ? '' : `RN${cohort.slice(1)}${String(200 + i)}`,
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
        cohort: cls === 'ISB-K52-01' ? 'K52' : 'K51',
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
      syllabi: courses.split('; ').map((c) => ({ name: `Syllabus_${c.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^A-Za-z0-9]+/g, '_').slice(0, 45)}.pdf`, size: 230000, type: 'application/pdf', at: new Date().toISOString() })),
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
      cohorts: 'K50, K51, K52',
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
  out.filter((x) => x.module === 'students' && x.cohort === 'K50').forEach((st, i) => {
    ;['Tiền tệ, Ngân hàng và Thị trường tài chính', 'Kinh tế vĩ mô', 'Tài chính quốc tế'].forEach((course, j) => {
      const sc = Math.round((9 + ((i * 7 + j * 5) % 9) + (j === 1 ? 0.5 : 0.25 * j)) * 100) / 100
      push('grades', { studentId: st.studentId, fullName: st.fullName, course, term: j < 2 ? 'S3 2025–2026' : 'S4 2025–2026', score20: Math.min(19.5, sc), note: '' }, 'u4')
    })
  })

  /* ---- Học phí chuyển Rennes ---- */
  ;[
    ['Năm 3 – K49 (2025–2026)', 28, 900, -300, -280, 'Rennes đã xác nhận', 0],
    ['Năm 3 – K50 bổ sung (2025–2026)', 2, 900, -120, -100, 'Rennes đã xác nhận', 0],
    ['HK1 2026–2027 – Năm 3 K50', 30, 900, -4, '', 'Đề nghị', 27000],
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
      'Dạ em chào thầy cô,\n\nEm là SV K50, em muốn hỏi khi nào trường gửi thư nhập học của Rennes để em làm hồ sơ Campus France và visa du học ạ?\n\nEm cảm ơn ạ.', []],
    ['Đề nghị phúc khảo môn Tài chính doanh nghiệp', 'Trần Thanh Quân', 'quan.tran1@st.ueh.demo', -6, '10:30', 'Khảo thí', 'Đã giải quyết', 'u4', -3,
      'Em xin phúc khảo bài thi cuối kỳ môn Tài chính doanh nghiệp, mã SV 3510012. Em nghĩ phần tự luận câu 3 bị chấm thiếu.', [['u4', 'đã chuyển GV chấm lại'], ['u4', 'điểm sau phúc khảo tăng 0,5 – đã báo SV']]],
    ['Xin bảo lưu kết quả học tập', 'Bùi Hoài Trâm', 'tram.bui7@st.ueh.demo', 0, '08:15', 'Học vụ', 'Mới', '', 3,
      'Em chào thầy cô, em muốn xin bảo lưu 1 học kỳ vì lý do sức khỏe. Thủ tục cần những giấy tờ gì ạ?', []],
  ].forEach(([subject, fromName, fromEmail, d, t, topic, status, handler, due, body, log]) =>
    push('tickets', { subject, fromName, fromEmail, receivedAt: dt(d, t), topic, status, handler, due: addDays(due), body, files: [], log: log.map(([u, text], k) => ({ userId: u, text, at: new Date(Date.now() - (k ? 2 : 5) * 36e5).toISOString() })) }, 'u6'))

  return out
}
