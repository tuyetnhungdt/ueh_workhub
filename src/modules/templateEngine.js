// Dynamic Document Templates & Export Engine
import { tripCalc, MOA, prefsText, sameName } from './schema.js'
import { eurInWords, vndInWords } from './docs.js'

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const d = (s) => (s ? s.slice(0, 10).split('-').reverse().join('/') : '……/……/……')
const dt = (s) => (s ? `${d(s)} ${s.slice(11, 16)}` : '……')
const vnd = (n) => (+n || 0).toLocaleString('vi-VN')
const eur = (n) => '€ ' + (+n || 0).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const TEMPLATES = {
  flightReq: {
    id: 'flightReq',
    name: 'Phiếu đề nghị đặt vé máy bay',
    category: 'Hậu cần & Di chuyển',
    icon: 'Plane',
    desc: 'Lập phiếu trình BGH & Phòng KHTC đặt vé máy bay khứ hồi cho giảng viên quốc tế Đại học Rennes.',
    defaultBlankFields: {
      docNumber: '1152/PĐN-ISB-2026',
      docDate: '',
      flightClass: 'Phổ thông linh hoạt (Economy Flex theo MOA)',
      baggageAllowance: '02 kiện ký gửi 23kg/kiện + 01 kiện xách tay 12kg',
      seatPreference: 'Cạnh lối đi (Aisle seat)',
      dietPreference: 'Không yêu cầu (suất ăn tiêu chuẩn)',
      creatorName: 'Võ Thanh Tùng',
      creatorTitle: 'Chuyên viên hậu cần',
      verifierName: 'Trần Minh Anh',
      verifierTitle: 'Trưởng chương trình',
      signatoryName: 'TS. Lê Đạt Chí',
      signatoryTitle: 'Trưởng Khoa Tài chính',
      recipients: 'Ban Giám hiệu UEH (để báo cáo); Phòng KHTC; Đại lý vé máy bay; Lưu: VP Khoa.',
      notes: 'Giảng viên đến Tân Sơn Nhất cần xe của trường đón về khách sạn; đề nghị đại lý xuất hóa đơn VAT tên UEH.',
    }
  },
  hotelReq: {
    id: 'hotelReq',
    name: 'Phiếu booking / đặt phòng khách sạn',
    category: 'Hậu cần & Lưu trú',
    icon: 'Hotel',
    desc: 'Đăng ký phòng khách sạn tiêu chuẩn cho giảng viên Rennes trong suốt đợt công tác tại TP.HCM.',
    defaultBlankFields: {
      docNumber: '408/ĐKKS-TC-2026',
      docDate: '',
      hotelName: 'Khách sạn Novotel Saigon Centre',
      hotelAddress: '167 Hai Bà Trưng, Phường 6, Quận 3, TP. Hồ Chí Minh',
      roomType: 'Superior / Deluxe King Bed (phòng không hút thuốc, tầng cao)',
      bookingCode: 'NOV-UEH-RN26',
      billingInstruction: 'Khoa Tài chính UEH thanh toán chuyển khoản sau khi kết thúc đợt lưu trú và nhận hóa đơn VAT hợp lệ.',
      creatorName: 'Võ Thanh Tùng',
      creatorTitle: 'Chuyên viên hậu cần',
      verifierName: 'Lê Quốc Bảo',
      verifierTitle: 'Chuyên viên tài chính',
      signatoryName: 'TS. Lê Đạt Chí',
      signatoryTitle: 'Trưởng Khoa Tài chính',
      notes: 'Đã bao gồm ăn sáng buffet hàng ngày và wifi; chi phí giặt ủi và quầy bar mini do giảng viên tự thanh toán.',
    }
  },
  missionOrder: {
    id: 'missionOrder',
    name: 'Công lệnh công tác & giảng dạy (Mission Order)',
    category: 'Hành chính & Nhân sự',
    icon: 'FileBadge',
    desc: 'Văn bản quyết định chính thức tiếp nhận và phân công giảng viên Đại học Rennes sang giảng dạy tại UEH.',
    defaultBlankFields: {
      docNumber: '1892/CL-ĐHKT-ISB',
      docDate: '',
      assignmentBasis: 'Biên bản ghi nhớ hợp tác (MOA/2024/UEH-UR) và Kế hoạch đào tạo năm học 2026–2027.',
      missionLocation: 'Cơ sở B UEH (279 Nguyễn Tri Phương, Phường 5, Quận 10, TP. Hồ Chí Minh)',
      signatoryName: 'TS. Lê Đạt Chí',
      signatoryTitle: 'TL. HIỆU TRƯỞNG – TRƯỞNG KHOA TÀI CHÍNH',
      creatorName: 'Nguyễn Thu Hà',
      verifierName: 'Trần Minh Anh',
      recipients: 'Như Điều 5; Ban Giám hiệu (để b/c); Giảng viên; Lưu: VT, BĐH CT.',
      notes: 'Công lệnh này là căn cứ để làm thủ tục hải quan, hỗ trợ visa và thanh quyết toán chế độ giảng dạy.',
    }
  },
  payTable: {
    id: 'payTable',
    name: 'Bảng kê thanh toán thù lao & chi phí GV',
    category: 'Tài chính & Quyết toán',
    icon: 'Receipt',
    desc: 'Bảng kê chi tiết thù lao giảng dạy, thuế TNCN 20%, phụ cấp lưu trú và vé TGV theo quy định MOA.',
    defaultBlankFields: {
      docNumber: 'BK-08/2026/TC-RENNES',
      docDate: '',
      creatorName: 'Lê Quốc Bảo',
      creatorTitle: 'Chuyên viên tài chính',
      verifierName: 'Trần Minh Anh',
      verifierTitle: 'Ban điều hành chương trình',
      signatoryName: 'TS. Lê Đạt Chí',
      signatoryTitle: 'Trưởng Khoa Tài chính',
      notes: 'Thanh toán chuyển khoản vào tài khoản IBAN của giảng viên tại Pháp sau khi hoàn tất nghĩa vụ thuế.',
    }
  },
  advanceReq: {
    id: 'advanceReq',
    name: 'Giấy đề nghị tạm ứng kinh phí',
    category: 'Tài chính & Quyết toán',
    icon: 'Coins',
    desc: 'Lập đề nghị tạm ứng thù lao hoặc phụ cấp cho đợt giảng của giảng viên quốc tế.',
    defaultBlankFields: {
      docNumber: 'TU-05/2026/ISB',
      docDate: '',
      creatorName: 'Lê Quốc Bảo',
      creatorTitle: 'Người đề nghị tạm ứng',
      verifierName: 'Trần Minh Anh',
      verifierTitle: 'Ban điều hành chương trình',
      signatoryName: 'TS. Lê Đạt Chí',
      signatoryTitle: 'Trưởng Khoa Tài chính',
      notes: 'Thời hạn hoàn ứng trong vòng 30 ngày sau khi kết thúc đợt giảng theo quy chế chi tiêu nội bộ của UEH.',
    }
  },
  contractInfo: {
    id: 'contractInfo',
    name: 'Hợp đồng thỉnh giảng & Phụ lục khối lượng',
    category: 'Pháp lý & Hợp đồng',
    icon: 'FileText',
    desc: 'Phiếu thông tin hợp đồng thỉnh giảng song ngữ Việt – Anh điền sẵn từ hồ sơ giảng viên.',
    defaultBlankFields: {
      docNumber: '1150/HĐTG-ĐHKT-TC',
      docDate: '',
      signatoryName: 'TS. Lê Đạt Chí',
      signatoryTitle: 'BÊN A – TRƯỞNG KHOA TÀI CHÍNH',
      creatorName: 'Nguyễn Thu Hà',
      verifierName: 'Trần Minh Anh',
      notes: 'Hợp đồng lập thành 05 bản có giá trị pháp lý như nhau; bên B giữ 01 bản.',
    }
  },
}

/* ---------- Tự động trích xuất thông tin (Auto-fill Data Extraction) ---------- */
export function extractAutoFillData(item = {}, allItems = [], users = []) {
  // item có thể là chuyến công tác (trips), giảng viên (lecturers), buổi học (sessions), hoặc văn bản (docs)
  const isTrip = item.module === 'trips' || item.teachHours != null || item.outFlight != null
  const isLecturer = item.module === 'lecturers' || item.fullName != null
  const isSession = item.module === 'sessions'

  let trip = isTrip ? item : null
  let lecturer = null

  if (isTrip) {
    lecturer = allItems.find((x) => x.module === 'lecturers' && sameName(x.fullName, item.lecturer))
  } else if (isLecturer) {
    lecturer = item
    trip = allItems.find((x) => x.module === 'trips' && sameName(x.lecturer, item.fullName))
  } else if (isSession) {
    lecturer = allItems.find((x) => x.module === 'lecturers' && sameName(x.fullName, item.lecturer))
    trip = allItems.find((x) => x.module === 'trips' && sameName(x.lecturer, item.lecturer))
  }

  // Tên và chức danh
  const lecturerName = trip?.lecturer || lecturer?.fullName || item.lecturer || 'Jean-Christophe Poutineau'
  const lecturerTitle = lecturer?.academicTitle || 'Giáo sư (Professeur des Universités)'
  const nationality = 'Cộng hòa Pháp (France)'
  const passport = lecturer?.passport || '21AF89104'
  const passportIssued = lecturer?.passportIssued || 'Préfecture d’Ille-et-Vilaine, France'
  const organization = 'Đại học Rennes (Université de Rennes, France)'
  const email = lecturer?.email || 'poutineau@univ-rennes.fr'
  const phone = lecturer?.phone || '+33 2 23 23 35 45'

  // Học phần & lớp
  const courseName = trip?.course || item.course || 'Tiền tệ, Ngân hàng và Thị trường tài chính'
  const courseCode = item.courseCode || (courseName.includes('Kinh tế vĩ mô') ? 'RN-S3-02' : 'RN-S3-01')
  const className = trip?.className || item.className || 'ISB-K51-01'
  const cohort = item.cohort || 'K51'
  const teachHours = trip?.teachHours || item.teachHours || 30

  // Lịch công tác
  const teachFrom = trip?.teachFrom ? d(trip.teachFrom) : '15/10/2026'
  const teachTo = trip?.teachTo ? d(trip.teachTo) : '24/10/2026'
  const departAt = trip?.departAt ? dt(trip.departAt) : '13/10/2026 23:25'
  const arriveAt = trip?.arriveAt ? dt(trip.arriveAt) : '14/10/2026 16:50'
  const returnAt = trip?.returnAt ? dt(trip.returnAt) : '25/10/2026 08:30'
  const outFlight = trip?.outFlight || 'VN10 (CDG–SGN)'
  const returnFlight = trip?.returnFlight || 'VN11 (SGN–CDG)'
  const flightRoute = 'Rennes (TGV) / Paris Charles de Gaulle (CDG) ⇄ TP. Hồ Chí Minh (SGN)'

  // Khách sạn
  const hotelName = trip?.hotel || 'Khách sạn Novotel Saigon Centre'
  const hotelAddress = '167 Hai Bà Trưng, Phường 6, Quận 3, TP. Hồ Chí Minh'
  const checkIn = trip?.checkIn ? d(trip.checkIn) : '14/10/2026'
  const checkOut = trip?.checkOut ? d(trip.checkOut) : '25/10/2026'
  const nights = trip?.checkIn && trip?.checkOut ? Math.max(1, Math.round((new Date(trip.checkOut) - new Date(trip.checkIn)) / 864e5)) : 11
  const roomType = 'Phòng Superior King Bed (tầng cao, không hút thuốc)'

  // Chi phí
  const calc = trip ? tripCalc(trip) : { net: 3120, gross: 3900, taxAmt: 780, perDiem: 1540, eurTotal: 5590, vnd: 153725000 }
  const ticketCost = trip?.ticketCost || 32500000
  const hotelCost = trip?.hotelCost || 22000000

  // Người phụ trách / ký
  const creatorUser = users.find((u) => u.id === item.createdBy) || users.find((u) => u.id === 'u2')
  const creatorName = creatorUser?.name || 'Nguyễn Thu Hà'
  const verifierName = 'Trần Minh Anh'
  const signatoryName = 'TS. Lê Đạt Chí'

  return {
    lecturerName,
    lecturerTitle,
    nationality,
    passport,
    passportIssued,
    organization,
    email,
    phone,
    courseName,
    courseCode,
    className,
    cohort,
    teachHours,
    teachFrom,
    teachTo,
    departAt,
    arriveAt,
    returnAt,
    outFlight,
    returnFlight,
    flightRoute,
    hotelName,
    hotelAddress,
    checkIn,
    checkOut,
    nights,
    roomType,
    ticketCost,
    hotelCost,
    creatorName,
    verifierName,
    signatoryName,
    calc,
    rawTrip: trip,
    rawLecturer: lecturer,
  }
}

/* ---------- HTML Render Engine (Cho Preview trực quan & In PDF) ---------- */
export function renderTemplateHtml(templateId, data = {}) {
  const dateStr = data.docDate || `ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`
  const cityDate = `TP. Hồ Chí Minh, ${dateStr}`

  const headerHtml = (orgTop, orgMain, docNo) => `
    <div style="display:flex;justify-content:space-between;text-align:center;font-size:12pt;line-height:1.35;margin-bottom:14px">
      <div style="width:48%">
        <div style="font-size:11.5pt">${esc(orgTop)}</div>
        <div style="font-weight:bold;font-size:12pt">${esc(orgMain)}</div>
        <div style="font-style:italic;font-size:11.5pt;margin-top:2px">Số: <b>${esc(docNo || '……/PĐN-ISB')}</b></div>
      </div>
      <div style="width:52%">
        <div style="font-weight:bold;font-size:12pt">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div style="font-weight:bold;font-size:12.5pt;border-bottom:1.5px solid #222;display:inline-block;padding-bottom:1px">Độc lập – Tự do – Hạnh phúc</div>
        <div style="font-style:italic;font-size:11.5pt;margin-top:4px">${cityDate}</div>
      </div>
    </div>
  `

  const tableCss = `style="width:100%;border-collapse:collapse;margin:12px 0;font-size:12pt"`
  const tdCss = `style="border:1px solid #333;padding:6px 10px;vertical-align:top"`
  const tdKeyCss = `style="border:1px solid #333;padding:6px 10px;width:34%;background:#f8fafc;font-weight:600;vertical-align:top"`

  if (templateId === 'flightReq') {
    return `
      ${headerHtml('ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH', 'KHOA TÀI CHÍNH – VIỆN ISB', data.docNumber)}
      <h1 style="font-size:15pt;text-align:center;text-transform:uppercase;margin:20px 0 4px">PHIẾU ĐỀ NGHỊ ĐẶT VÉ MÁY BAY</h1>
      <div style="text-align:center;font-style:italic;font-size:11.5pt;margin-bottom:16px">(Phục vụ giảng viên quốc tế giảng dạy chương trình cử nhân song bằng UEH – Université de Rennes)</div>
      
      <p style="font-size:12pt;font-style:italic;margin:10px 0"><b>Kính gửi:</b> ${esc(data.recipients || 'Ban Giám hiệu UEH; Phòng Tài chính – Kế toán; Đại lý vé máy bay.')}</p>

      <div style="font-weight:bold;font-size:12.5pt;margin-top:14px;color:#03616a">1. THÔNG TIN GIẢNG VIÊN VÀ HỌC PHẦN</div>
      <table ${tableCss}>
        <tr><td ${tdKeyCss}>Họ và tên giảng viên</td><td ${tdCss}><b>${esc(data.lecturerName)}</b></td></tr>
        <tr><td ${tdKeyCss}>Chức danh / Quốc tịch</td><td ${tdCss}>${esc(data.lecturerTitle)} · Quốc tịch: ${esc(data.nationality)}</td></tr>
        <tr><td ${tdKeyCss}>Số hộ chiếu (Passport)</td><td ${tdCss}><b>${esc(data.passport)}</b> (Nơi cấp: ${esc(data.passportIssued)})</td></tr>
        <tr><td ${tdKeyCss}>Đơn vị công tác</td><td ${tdCss}>${esc(data.organization)}</td></tr>
        <tr><td ${tdKeyCss}>Học phần giảng dạy</td><td ${tdCss}><b>${esc(data.courseName)}</b> (Mã HP: ${esc(data.courseCode)})</td></tr>
        <tr><td ${tdKeyCss}>Khóa / Lớp phụ trách</td><td ${tdCss}>${esc(data.className)} (Khóa ${esc(data.cohort)}, Giai đoạn 2 song bằng)</td></tr>
        <tr><td ${tdKeyCss}>Thời gian giảng dạy</td><td ${tdCss}>Từ <b>${esc(data.teachFrom)}</b> đến <b>${esc(data.teachTo)}</b> (Tổng số: <b>${esc(data.teachHours)}</b> giờ)</td></tr>
      </table>

      <div style="font-weight:bold;font-size:12.5pt;margin-top:14px;color:#03616a">2. LỊCH TRÌNH VÀ YÊU CẦU ĐẶT VÉ MÁY BAY</div>
      <table ${tableCss}>
        <tr><td ${tdKeyCss}>Hành trình bay đề xuất</td><td ${tdCss}><b>${esc(data.flightRoute)}</b></td></tr>
        <tr><td ${tdKeyCss}>Chặng đi (Paris/Rennes → SGN)</td><td ${tdCss}>Ngày đi: <b>${esc(data.departAt)}</b> · Chuyến bay dự kiến: <b>${esc(data.outFlight)}</b> · Đến SGN: ${esc(data.arriveAt)}</td></tr>
        <tr><td ${tdKeyCss}>Chặng về (SGN → Paris/Rennes)</td><td ${tdCss}>Ngày về: <b>${esc(data.returnAt)}</b> · Chuyến bay dự kiến: <b>${esc(data.returnFlight)}</b></td></tr>
        <tr><td ${tdKeyCss}>Hạng vé đề xuất</td><td ${tdCss}>${esc(data.flightClass)}</td></tr>
        <tr><td ${tdKeyCss}>Tiêu chuẩn hành lý</td><td ${tdCss}>${esc(data.baggageAllowance)}</td></tr>
        <tr><td ${tdKeyCss}>Chỗ ngồi & Suất ăn yêu cầu</td><td ${tdCss}>Ghế: ${esc(data.seatPreference)} · Suất ăn: ${esc(data.dietPreference)}</td></tr>
        <tr><td ${tdKeyCss}>Dự toán chi phí vé</td><td ${tdCss}><b>${data.ticketCost ? vnd(data.ticketCost) + ' VNĐ' : 'Theo báo giá thực tế'}</b></td></tr>
        <tr><td ${tdKeyCss}>Ghi chú bổ sung</td><td ${tdCss}>${esc(data.notes || '—')}</td></tr>
      </table>

      <p style="font-size:12pt;font-style:italic;margin-top:14px">Kính đề nghị Ban Giám hiệu và Phòng KHTC xem xét phê duyệt để Khoa tiến hành đặt vé theo đúng lịch trình.</p>

      <div style="display:flex;justify-content:space-between;text-align:center;margin-top:30px">
        <div style="width:32%">
          <b>${esc(data.creatorTitle || 'Người lập phiếu')}</b>
          <i style="display:block;font-size:10.5pt;margin-bottom:60px">(Ký, ghi rõ họ tên)</i>
          <b>${esc(data.creatorName)}</b>
        </div>
        <div style="width:34%">
          <b>${esc(data.verifierTitle || 'Ban điều hành CT')}</b>
          <i style="display:block;font-size:10.5pt;margin-bottom:60px">(Ký, ghi rõ họ tên)</i>
          <b>${esc(data.verifierName)}</b>
        </div>
        <div style="width:32%">
          <b>${esc(data.signatoryTitle || 'Trưởng khoa phê duyệt')}</b>
          <i style="display:block;font-size:10.5pt;margin-bottom:60px">(Ký, đóng dấu)</i>
          <b>${esc(data.signatoryName)}</b>
        </div>
      </div>
    `
  }

  if (templateId === 'hotelReq') {
    return `
      ${headerHtml('ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH', 'KHOA TÀI CHÍNH – BAN ĐIỀU HÀNH RENNES', data.docNumber)}
      <h1 style="font-size:15pt;text-align:center;text-transform:uppercase;margin:20px 0 4px">PHIẾU ĐĂNG KÝ & DUYỆT ĐẶT PHÒNG KHÁCH SẠN</h1>
      <div style="text-align:center;font-style:italic;font-size:11.5pt;margin-bottom:16px">(Lưu trú cho giảng viên Đại học Rennes giảng dạy chương trình cử nhân song bằng)</div>

      <p style="font-size:12pt;font-style:italic;margin:10px 0"><b>Kính gửi:</b> Bộ phận Lễ tân / Đặt phòng Khách sạn ${esc(data.hotelName)}; Phòng TC-KT UEH.</p>

      <div style="font-weight:bold;font-size:12.5pt;margin-top:14px;color:#03616a">1. THÔNG TIN KHÁCH LƯU TRÚ (GIẢNG VIÊN)</div>
      <table ${tableCss}>
        <tr><td ${tdKeyCss}>Họ và tên khách</td><td ${tdCss}><b>${esc(data.lecturerName)}</b></td></tr>
        <tr><td ${tdKeyCss}>Chức danh / Quốc tịch</td><td ${tdCss}>${esc(data.lecturerTitle)} · Quốc tịch: ${esc(data.nationality)}</td></tr>
        <tr><td ${tdKeyCss}>Số hộ chiếu</td><td ${tdCss}><b>${esc(data.passport)}</b></td></tr>
        <tr><td ${tdKeyCss}>Liên hệ</td><td ${tdCss}>Email: ${esc(data.email)} · ĐT: ${esc(data.phone)}</td></tr>
      </table>

      <div style="font-weight:bold;font-size:12.5pt;margin-top:14px;color:#03616a">2. CHI TIẾT ĐẶT PHÒNG VÀ TIÊU CHUẨN DỊCH VỤ</div>
      <table ${tableCss}>
        <tr><td ${tdKeyCss}>Khách sạn lưu trú</td><td ${tdCss}><b>${esc(data.hotelName)}</b><br><span style="font-size:11pt;color:#555">${esc(data.hotelAddress)}</span></td></tr>
        <tr><td ${tdKeyCss}>Hạng phòng yêu cầu</td><td ${tdCss}>${esc(data.roomType)}</td></tr>
        <tr><td ${tdKeyCss}>Ngày nhận phòng (Check-in)</td><td ${tdCss}><b>${esc(data.checkIn)}</b> (sau 14:00)</td></tr>
        <tr><td ${tdKeyCss}>Ngày trả phòng (Check-out)</td><td ${tdCss}><b>${esc(data.checkOut)}</b> (trước 12:00)</td></tr>
        <tr><td ${tdKeyCss}>Tổng số đêm lưu trú</td><td ${tdCss}><b>${esc(data.nights)}</b> đêm</td></tr>
        <tr><td ${tdKeyCss}>Mã đặt phòng (Booking Code)</td><td ${tdCss}><b>${esc(data.bookingCode || 'NOV-UEH-RN26')}</b></td></tr>
        <tr><td ${tdKeyCss}>Dự toán chi phí tiền phòng</td><td ${tdCss}><b>${data.hotelCost ? vnd(data.hotelCost) + ' VNĐ' : 'Theo thỏa thuận đối tác'}</b></td></tr>
        <tr><td ${tdKeyCss}>Hình thức thanh toán</td><td ${tdCss}>${esc(data.billingInstruction)}</td></tr>
        <tr><td ${tdKeyCss}>Ghi chú & Yêu cầu riêng</td><td ${tdCss}>${esc(data.notes || '—')}</td></tr>
      </table>

      <div style="font-weight:bold;font-size:12.5pt;margin-top:14px;color:#03616a">3. THÔNG TIN XUẤT HÓA ĐƠN GTGT (VAT)</div>
      <table ${tableCss}>
        <tr><td ${tdKeyCss}>Tên đơn vị</td><td ${tdCss}><b>Đại học Kinh tế Thành phố Hồ Chí Minh</b></td></tr>
        <tr><td ${tdKeyCss}>Địa chỉ</td><td ${tdCss}>59C Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh</td></tr>
        <tr><td ${tdKeyCss}>Mã số thuế</td><td ${tdCss}><b>0302213615</b></td></tr>
      </table>

      <div style="display:flex;justify-content:space-between;text-align:center;margin-top:30px">
        <div style="width:32%">
          <b>${esc(data.creatorTitle || 'Người lập phiếu')}</b>
          <i style="display:block;font-size:10.5pt;margin-bottom:60px">(Ký, ghi rõ họ tên)</i>
          <b>${esc(data.creatorName)}</b>
        </div>
        <div style="width:34%">
          <b>${esc(data.verifierTitle || 'Bộ phận Kế toán')}</b>
          <i style="display:block;font-size:10.5pt;margin-bottom:60px">(Ký, ghi rõ họ tên)</i>
          <b>${esc(data.verifierName)}</b>
        </div>
        <div style="width:32%">
          <b>${esc(data.signatoryTitle || 'Trưởng khoa phê duyệt')}</b>
          <i style="display:block;font-size:10.5pt;margin-bottom:60px">(Ký, đóng dấu)</i>
          <b>${esc(data.signatoryName)}</b>
        </div>
      </div>
    `
  }

  if (templateId === 'missionOrder') {
    return `
      ${headerHtml('BỘ GIÁO DỤC VÀ ĐÀO TẠO', 'ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH', data.docNumber)}
      <h1 style="font-size:15pt;text-align:center;text-transform:uppercase;margin:20px 0 4px">CÔNG LỆNH CÔNG TÁC & TIẾP NHẬN GIẢNG VIÊN</h1>
      <div style="text-align:center;font-style:italic;font-size:11.5pt;margin-bottom:16px">(V/v tiếp nhận giảng viên quốc tế giảng dạy chương trình cử nhân song bằng UEH – Université de Rennes)</div>

      <p style="font-size:12pt;font-style:italic;line-height:1.45;margin:8px 0">
        - Căn cứ Biên bản ghi nhớ hợp tác (MOA) ký kết giữa Đại học Kinh tế TP. Hồ Chí Minh và Université de Rennes;<br>
        - Căn cứ Kế hoạch đào tạo và thỏa thuận phân công giảng dạy năm học 2026–2027;<br>
        - Xét đề nghị của Trưởng Khoa Tài chính và Viện trưởng Viện ISB,
      </p>

      <p style="font-weight:bold;text-align:center;font-size:13pt;margin:16px 0">HIỆU TRƯỞNG ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH QUYẾT ĐỊNH:</p>

      <p style="font-size:12pt;margin:6px 0"><b>Điều 1.</b> Tiếp nhận và phân công công tác đối với:</p>
      <div style="margin-left:24px;font-size:12pt;line-height:1.5">
        - Ông/Bà: <b>${esc(data.lecturerName)}</b><br>
        - Chức vụ / Đơn vị: Giảng viên Đại học Rennes, Cộng hòa Pháp.<br>
        - Số hộ chiếu: <b>${esc(data.passport)}</b> do cơ quan có thẩm quyền của Pháp cấp.
      </div>

      <p style="font-size:12pt;margin:12px 0 6px"><b>Điều 2. Nhiệm vụ chuyên môn:</b></p>
      <div style="margin-left:24px;font-size:12pt;line-height:1.5">
        - Giảng dạy trực tiếp học phần: <b>${esc(data.courseName)}</b> (Khối lượng: <b>${esc(data.teachHours)}</b> giờ giảng).<br>
        - Khóa / Lớp phụ trách: <b>${esc(data.className)}</b> (Khóa ${esc(data.cohort)}, Giai đoạn 2 song bằng Rennes).<br>
        - Thực hiện ra đề kiểm tra, chấm thi và chuyển bảng điểm chính thức theo quy định của MOA.
      </div>

      <p style="font-size:12pt;margin:12px 0 6px"><b>Điều 3. Thời gian và địa điểm công tác:</b></p>
      <div style="margin-left:24px;font-size:12pt;line-height:1.5">
        - Thời gian: Từ ngày <b>${esc(data.teachFrom)}</b> đến ngày <b>${esc(data.teachTo)}</b>.<br>
        - Địa điểm: ${esc(data.missionLocation || 'Cơ sở B UEH (279 Nguyễn Tri Phương, Phường 5, Quận 10, TP. Hồ Chí Minh)')}.
      </div>

      <p style="font-size:12pt;margin:12px 0 6px"><b>Điều 4. Chế độ và kinh phí:</b></p>
      <div style="margin-left:24px;font-size:12pt;line-height:1.5">
        - Thù lao giảng dạy và phụ cấp lưu trú chi trả theo đúng quy định tại Phụ lục tài chính MOA.<br>
        - Vé máy bay quốc tế và phòng khách sạn do UEH đài thọ từ nguồn kinh phí chương trình.
      </div>

      <p style="font-size:12pt;margin:12px 0 6px"><b>Điều 5.</b> Khoa Tài chính, Ban Đào tạo, Ban KHTC và Ông/Bà có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.</p>

      <div style="display:flex;justify-content:space-between;margin-top:30px">
        <div style="width:45%;font-size:11pt;font-style:italic">
          <b>Nơi nhận:</b><br>
          - Như Điều 5;<br>
          - Ban Giám hiệu (để b/c);<br>
          - Lưu: VT, BĐH CT.
        </div>
        <div style="width:50%;text-align:center">
          <b style="font-size:12pt">TL. HIỆU TRƯỞNG</b><br>
          <b style="font-size:12.5pt">TRƯỞNG KHOA TÀI CHÍNH</b><br>
          <i style="display:block;font-size:10.5pt;margin-bottom:65px">(Ký, đóng dấu)</i>
          <b>${esc(data.signatoryName || 'TS. Lê Đạt Chí')}</b>
        </div>
      </div>
    `
  }

  // Fallback / Mẫu chung
  return `
    ${headerHtml('ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH', 'KHOA TÀI CHÍNH – BAN ĐIỀU HÀNH RENNES', data.docNumber)}
    <h1 style="font-size:15pt;text-align:center;text-transform:uppercase;margin:20px 0 4px">${esc(data.name || 'BIỂU MẪU HÀNH CHÍNH')}</h1>
    <div style="text-align:center;font-style:italic;font-size:11.5pt;margin-bottom:16px">Chương trình cử nhân song bằng UEH – Université de Rennes</div>
    <table ${tableCss}>
      <tr><td ${tdKeyCss}>Giảng viên</td><td ${tdCss}><b>${esc(data.lecturerName)}</b></td></tr>
      <tr><td ${tdKeyCss}>Học phần</td><td ${tdCss}>${esc(data.courseName)}</td></tr>
      <tr><td ${tdKeyCss}>Thời gian</td><td ${tdCss}>${esc(data.teachFrom)} – ${esc(data.teachTo)}</td></tr>
      <tr><td ${tdKeyCss}>Ghi chú</td><td ${tdCss}>${esc(data.notes || '—')}</td></tr>
    </table>
  `
}
