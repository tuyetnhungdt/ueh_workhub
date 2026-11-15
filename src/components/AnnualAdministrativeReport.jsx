import { useState, useMemo } from 'react'
import * as L from 'lucide-react'
import { fmtDate, todayStr, money } from '../lib/utils.js'
import { tripCalc, MOA, MODULE } from '../modules/schema.js'
import { useStore } from '../data/store.jsx'
import { useToast } from './ui.jsx'

export default function AnnualAdministrativeReport({ project, items, onBackToDashboard }) {
  const { me } = useStore()
  const toast = useToast()
  const [viewMode, setViewMode] = useState('preview') // 'preview' | 'edit'

  // Trích xuất số liệu tự động từ các phân hệ Bàn làm việc
  const by = (id) => items.filter((x) => x.module === id)
  const st = by('students')
  const ses = by('sessions')
  const tk = by('tickets')
  const ex = by('expenses')
  const tr = by('trips')
  const tf = by('transfers')
  const dc = by('docs')
  const lc = by('lecturers')

  const paidCount = st.filter((s) => s.tuitionStatus === 'Đã đóng' || s.tuitionStatus === 'Miễn giảm').length
  const dualCount = st.filter((s) => s.dualDegree === 'Có').length
  const accCount = st.filter((s) => ['Đã cấp', 'Đã kích hoạt'].includes(s.accountStatus)).length
  const tuitionPercent = st.length ? Math.round((paidCount / st.length) * 100) : 0

  const taughtSes = ses.filter((s) => s.status === 'Đã dạy').length
  const courseCount = new Set(ses.map((s) => s.course)).size

  const totalExpVnd = ex.reduce((s, r) => s + (+r.amount || 0), 0)
  const paidExpVnd = ex.filter((e) => ['Đã chi', 'Đã quyết toán'].includes(e.status)).reduce((s, r) => s + (+r.amount || 0), 0)

  const exCat = ex.reduce((a, r) => {
    const k = r.category || 'Khác'
    a[k] = (a[k] || 0) + (+r.amount || 0)
    return a
  }, {})

  const transfersEur = tf.filter((t) => ['Đã chuyển', 'Rennes đã xác nhận'].includes(t.status)).reduce((x, t) => x + (MODULE.transfers?.computed?.totalEur?.fn(t) || 0), 0)
  const totalDebtEur = tf.reduce((s, r) => s + (+r.debt || 0), 0)

  const isP2 = project?.id === 'p2' || /tuyển sinh|admissions/i.test(project?.name || '')
  const isP3 = project?.id === 'p3' || /gia lai|quỹ đầu tư|venture/i.test(project?.name || '')

  const getInitialFormData = () => {
    if (isP2) {
      return {
        senderDept: 'TRƯỜNG KINH DOANH\nBAN TUYỂN SINH & TRUYỀN THÔNG QUỐC TẾ\nTỔ TƯ VẤN CỬ NHÂN SONG BẰNG K53',
        docNumber: '86/BC-TS-K53',
        locationDate: `TP. Hồ Chí Minh, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
        reportTitle: `BÁO CÁO TỔNG KẾT & TIẾN ĐỘ CHIẾN DỊCH TUYỂN SINH ${(project?.name || '').toUpperCase()}`,
        academicYear: 'Niên khóa Tuyển sinh 2026 – 2027',
        recipient: 'Kính gửi: Hội đồng Tuyển sinh Đại học UEH;\nĐồng kính gửi: Ban Giám hiệu Trường Kinh doanh UEH; Ban Đào tạo; Ban Tài chính - Kế toán; Viện Đào tạo Quốc tế ISB.',
        basis: 'Căn cứ Đề án tuyển sinh Cử nhân Quốc tế Khóa K53 ban hành theo Quyết định số 2150/QĐ-ĐHKT;\nCăn cứ Quy chế tuyển sinh đại học chính quy của Đại học Kinh tế TP. Hồ Chí Minh (UEH);\nCăn cứ tình hình thu nhận hồ sơ, đối soát dữ liệu và phân bổ ngân sách truyền thông đa kênh.',
        studentOverview: `Chiến dịch tuyển sinh K53 hiện đã thu hút ${st.length} thí sinh nộp hồ sơ xét tuyển. Trong đó có ${paidCount} thí sinh đã hoàn thành thủ tục cọc giữ chỗ và xác nhận nhập học chính thức. Hội đồng đã thẩm định chứng chỉ tiếng Anh, đa số thí sinh đạt chuẩn năng lực ngoại ngữ từ IELTS 6.5 đến 8.0, đủ điều kiện xét tuyển thẳng vào giai đoạn 1.`,
        academicOverview: `Ban Tuyển sinh đã ban hành và phổ biến 11 đề án, thông báo xét tuyển và quy định liên quan. Tổ chức thành công Ngày hội Open Day tuyển sinh quốc tế với sự tham gia của hơn 200 lượt phụ huynh và thí sinh tại UEH Cơ sở B.`,
        logisticsOverview: `Hộp thư tư vấn và Hotline đã tiếp nhận và giải quyết ${tk.length} yêu cầu hỗ trợ và thắc mắc của thí sinh và phụ huynh. Tỷ lệ phản hồi đúng hạn đạt 100%, bảo đảm thông tin thông suốt và kịp thời hỗ trợ các trường hợp đăng ký sớm.`,
        financeOverview: `Tổng ngân sách triển khai công tác truyền thông đa kênh, sự kiện và tư vấn tuyển sinh đạt ${money(totalExpVnd)} ₫, trong đó kinh phí đã thanh toán và hoàn tất chứng từ là ${money(paidExpVnd)} ₫. Các khoản chi chạy Digital Ads, in cẩm nang và thù lao tư vấn đều được kiểm tra đúng định mức quy định.`,
        pros: '1. Sự phối hợp chặt chẽ giữa Ban Đào tạo, Ban Truyền thông và Ban Tuyển sinh quốc tế ISB.\n2. Nội dung đề án và chính sách học bổng đầu vào hấp dẫn, thu hút nhiều học sinh giỏi từ các trường THPT chuyên hàng đầu.\n3. Công tác tư vấn trực tuyến và trực tiếp diễn ra thông suốt, nhận được sự đánh giá cao từ phụ huynh.',
        cons: '1. Mức độ cạnh tranh giữa các chương trình đào tạo quốc tế trên địa bàn TP.HCM ngày càng cao.\n2. Một số thí sinh trường quốc tế cần thêm thời gian để hoàn tất thủ tục chứng thực văn bằng tú tài quốc tế (IB, A-Level).',
        overallAssessment: 'Chiến dịch tuyển sinh Cử nhân Song bằng K53 đang bám sát tiến độ đề ra, dự kiến hoàn thành và vượt chỉ tiêu tuyển sinh với chất lượng đầu vào đạt chuẩn quốc tế.',
        recommendations: '1. Đề xuất Ban Giám hiệu phê duyệt mở thêm 01 đợt phỏng vấn học bổng tài năng đợt 2 cho các thí sinh có IELTS ≥ 7.5.\n2. Kính đề nghị Ban Truyền thông tiếp tục hỗ trợ đẩy mạnh các bài viết giới thiệu cựu sinh viên tiêu biểu trên các kênh truyền thông chính thức của UEH.\n3. Ban Tài chính - Kế toán tiếp tục hỗ trợ phê duyệt nhanh các đợt tạm ứng phục vụ các sự kiện hướng nghiệp trực tiếp tại trường THPT.',
        recipientsList: 'Như kính gửi;\nLưu: Văn thư, Ban Tuyển sinh.',
        reporterName: me?.name || 'ThS. Nguyễn Văn Thiện Tâm',
        reporterTitle: 'Tổ trưởng Tổ Tư vấn Tuyển sinh K53',
        approverName: 'TS. Tô Công Nguyên Bảo',
        approverTitle: 'Phó Chủ tịch Hội đồng Tuyển sinh K53\nTrưởng Khoa Tài chính – Trường Kinh doanh UEH',
      }
    }

    if (isP3) {
      return {
        senderDept: 'ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH (UEH)\nVIỆN PHÁT TRIỂN CHÍNH SÁCH & QUẢN TRỊ\nNHÓM CHUYÊN GIA TƯ VẤN ĐỀ ÁN GIA LAI',
        docNumber: '15/BC-QDTMH-GL',
        locationDate: `TP. Hồ Chí Minh, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
        reportTitle: `BÁO CÁO TIẾN ĐỘ THỰC HIỆN DỰ ÁN TƯ VẤN XÂY DỰNG ĐỀ ÁN ${(project?.name || '').toUpperCase()}`,
        academicYear: 'Giai đoạn 2026 – 2027',
        recipient: 'Kính gửi: Ủy ban Nhân dân tỉnh Gia Lai;\nĐồng kính gửi: Sở Khoa học & Công nghệ tỉnh Gia Lai; Sở Tài chính tỉnh Gia Lai; Ban Giám hiệu UEH.',
        basis: 'Căn cứ Quyết định số 0440/QĐ-TTKPKH về việc giao nhiệm vụ tư vấn xây dựng Đề án Quỹ ĐTMH tỉnh Gia Lai;\nCăn cứ Thỏa thuận hợp tác dịch vụ tư vấn giữa Sở KH&CN tỉnh Gia Lai và Đại học UEH;\nCăn cứ tiến độ thu thập dữ liệu đầu vào, khảo sát thực địa và biên soạn các dự thảo đề án.',
        studentOverview: `Công tác khảo sát & dữ liệu đầu vào: Nhóm tư vấn đã xây dựng và phát hành 8 phiếu đề nghị cung cấp dữ liệu đến các Sở, Ban ngành địa phương. Thu thập toàn diện dữ liệu về chỉ số Đổi mới sáng tạo (PII), hiện trạng hơn 3.200 doanh nghiệp và 150 HTX nông nghiệp công nghệ cao trên địa bàn tỉnh Gia Lai.`,
        academicOverview: `Công tác biên soạn Đề án: Đội ngũ chuyên gia UEH đã hoàn thiện Dự thảo Đề án phiên bản v6.3, Dự thảo Tờ trình UBND tỉnh và Dự thảo Nghị quyết của HĐND tỉnh về cơ chế thành lập và vận hành Quỹ theo tinh thần Nghị định 365/2025/NĐ-CP và Nghị định 366/2025/NĐ-CP.`,
        logisticsOverview: `Hậu cần & Đoàn công tác: Đã tổ chức thành công 3 đợt công tác khảo sát thực địa tại TP. Pleiku và các địa bàn trọng điểm. Tổ chức 2 buổi hội thảo tham vấn chuyên gia và các buổi làm việc kỹ thuật với Thường trực UBND tỉnh và Tổ chuyên viên Sở Tài chính.`,
        financeOverview: `Tài chính & Quyết toán: Tổng giá trị hợp đồng tư vấn và công tác phí là ${money(totalExpVnd)} ₫, đã nghiệm thu và hoàn tất hồ sơ giải ngân đợt 1 với Sở KH&CN và Kho bạc Nhà nước tỉnh Gia Lai đúng quy định.`,
        pros: '1. Nhận được sự quan tâm chỉ đạo sát sao của Lãnh đạo UBND tỉnh Gia Lai và sự phối hợp tích cực của Sở KH&CN.\n2. Nhóm chuyên gia tư vấn UEH giàu kinh nghiệm thực tiễn về tài chính công và đầu tư khởi nghiệp ĐMST.\n3. Nguồn tài liệu pháp lý và dữ liệu khảo sát thực tế tại địa phương được cập nhật phong phú, đáp ứng tiêu chuẩn thẩm định.',
        cons: '1. Thời gian tổng hợp số liệu từ một số sở ngành chuyên môn đôi lúc còn kéo dài do tính chất phức tạp của số liệu thống kê.\n2. Cơ chế sử dụng vốn ngân sách nhà nước làm vốn mồi đầu tư mạo hiểm là vấn đề mới, đòi hỏi giải trình kỹ lưỡng với các cơ quan quản lý tài chính.',
        overallAssessment: 'Dự án tư vấn Đề án Quỹ ĐTMH tỉnh Gia Lai đang triển khai đúng lộ trình và đạt chất lượng chuyên môn cao, sẵn sàng phục vụ các phiên họp thẩm định của Hội đồng Khoa học và Ban Thường vụ Tỉnh ủy.',
        recommendations: '1. Kính đề nghị UBND tỉnh sớm có văn bản chỉ đạo các sở ngành hoàn tất trả lời phiếu khảo sát phục vụ báo cáo hoàn thiện.\n2. Đề xuất Sở KH&CN phối hợp cùng UEH tổ chức Hội thảo phản biện khoa học mở rộng với sự tham gia của các quỹ đầu tư tư nhân trong tháng 12/2026.\n3. Ban Giám hiệu UEH tiếp tục tạo điều kiện bố trí chuyên gia cao cấp tham gia các phiên giải trình với HĐND tỉnh Gia Lai.',
        recipientsList: 'Như kính gửi;\nLưu: Văn thư, Nhóm Tư vấn UEH.',
        reporterName: me?.name || 'ThS. Nguyễn Văn Thiện Tâm',
        reporterTitle: 'Thư ký Nhóm Chuyên gia Tư vấn UEH',
        approverName: 'TS. Tô Công Nguyên Bảo',
        approverTitle: 'Trưởng Nhóm Chuyên gia Tư vấn UEH\nGiảng viên Cao cấp – Trường Kinh doanh UEH',
      }
    }

    return {
      senderDept: 'TRƯỜNG KINH DOANH\nKHOA TÀI CHÍNH\nBAN ĐIỀU PHỐI CHƯƠNG TRÌNH SONG BẰNG',
      docNumber: '128/BC-KTC-ĐH',
      locationDate: `TP. Hồ Chí Minh, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
      reportTitle: `BÁO CÁO THƯỜNG NIÊN TỔNG KẾT CÔNG TÁC VẬN HÀNH & ĐIỀU PHỐI CHƯƠNG TRÌNH ${(project?.name || '').toUpperCase()}`,
      academicYear: 'Năm học 2026 – 2027',
      recipient: 'Kính gửi: Ban Giám hiệu Đại học Kinh tế TP. Hồ Chí Minh (UEH);\nĐồng kính gửi: Ban Giám hiệu Trường Kinh doanh UEH; Ban Đào tạo; Ban Tài chính - Kế toán; Ban Hợp tác Quốc tế.',
      basis: 'Căn cứ Thỏa thuận hợp tác đào tạo (MOA) ký kết giữa Đại học Kinh tế TP. Hồ Chí Minh và đối tác quốc tế;\nCăn cứ Quy chế quản lý các chương trình liên kết đào tạo quốc tế của UEH;\nCăn cứ tình hình thực tế triển khai công tác vận hành, giảng dạy, tài chính và công tác sinh viên của Ban Điều phối.',
      studentOverview: `Chương trình hiện có tổng số ${st.length} sinh viên đang theo học. Trong đó có ${dualCount} sinh viên theo học chính thức lộ trình song bằng quốc tế. Tỷ lệ sinh viên hoàn thành học phí đạt ${tuitionPercent}%. Hệ thống đã cấp tài khoản học tập LMS/Email cho ${accCount}/${st.length} sinh viên, bảo đảm 100% sinh viên được tiếp cận tài nguyên học thuật trực tuyến.`,
      academicOverview: `Trong niên độ vừa qua, chương trình đã tổ chức thành công ${ses.length} buổi giảng với ${courseCount} học phần chuyên ngành. Đội ngũ giảng viên quốc tế và giảng viên cơ hữu UEH đã hoàn thành ${taughtSes}/${ses.length} buổi học đúng tiến độ. Các đợt khảo thí giữa kỳ và cuối kỳ được tổ chức nghiêm túc, tuân thủ chặt chẽ tiêu chuẩn kiểm định của hai trường đại học.`,
      logisticsOverview: `Ban Điều phối đã tổ chức đón tiếp và phục vụ hậu cần cho ${tr.length} đoàn công tác của các Giáo sư, Giảng viên quốc tế sang giảng dạy trực tiếp tại cơ sở UEH. Toàn bộ thủ tục vé máy bay khứ hồi, đặt phòng khách sạn lưu trú, xe đưa đón sân bay và chế độ tạm ứng công tác phí đều được thực hiện chu đáo, an toàn và đúng quy chuẩn MOA.`,
      financeOverview: `Tổng kinh phí triển khai các hạng mục hoạt động đạt ${money(totalExpVnd)} ₫, trong đó kinh phí đã thanh toán và quyết toán chứng từ là ${money(paidExpVnd)} ₫. Tổng học phí đã chuyển đối tác quốc tế là € ${transfersEur.toLocaleString('vi-VN')} (công nợ hiện tại: € ${totalDebtEur.toLocaleString('vi-VN')}). Công tác hạch toán thu - chi được thực hiện minh bạch, đối soát đầy đủ định kỳ với Ban Tài chính - Kế toán UEH.`,
      pros: '1. Nhận được sự quan tâm chỉ đạo thường xuyên, kịp thời của Ban Giám hiệu UEH và sự phối hợp trách nhiệm từ Ban Lãnh đạo trường đối tác quốc tế.\n2. Đội ngũ chuyên viên điều phối chương trình năng động, có năng lực ngoại ngữ và chuyên môn tốt.\n3. Sinh viên chủ động, chấp hành tốt nội quy và tích cực tham gia các buổi học chuyên đề.',
      cons: '1. Chi phí vé máy bay quốc tế và nội địa có xu hướng tăng cao vào các mùa cao điểm du lịch.\n2. Một số đợt thi cần điều phối phòng thi đặc thù đạt chuẩn quốc tế tại cơ sở trung tâm.',
      overallAssessment: 'Chương trình song bằng vận hành đạt hiệu quả rất tốt, bảo đảm chất lượng đào tạo theo chuẩn quốc tế, góp phần nâng cao uy tín thương hiệu học thuật và chiến lược quốc tế hóa của Đại học Kinh tế TP. Hồ Chí Minh.',
      recommendations: '1. Kính đề nghị Ban Giám hiệu UEH phê duyệt gia hạn Phụ lục phân bổ học phần và định mức thù lao giảng viên cho năm học kế tiếp.\n2. Đề xuất Ban Đào tạo tiếp tục ưu tiên bố trí phòng học chất lượng cao tại Cơ sở B cho các đợt giảng trực tiếp của chuyên gia quốc tế.\n3. Kính đề xuất Ban Tài chính - Kế toán phê duyệt quyết toán kinh phí các đợt công tác và hoàn ứng đúng thời hạn hợp đồng.',
      recipientsList: 'Như kính gửi;\nLưu: Văn thư, Khoa Tài chính.',
      reporterName: me?.name || 'ThS. Nguyễn Văn Thiện Tâm',
      reporterTitle: 'Nhân sự chính Điều phối Học vụ & Chương trình',
      approverName: 'TS. Tô Công Nguyên Bảo',
      approverTitle: 'Quản lý Dự án Song bằng Rennes\nTrưởng Khoa Tài chính – Trường Kinh doanh UEH',
    }
  }

  // Khởi tạo state nội dung báo cáo có thể chỉnh sửa
  const [formData, setFormData] = useState(getInitialFormData)

  const setF = (k, v) => setFormData((prev) => ({ ...prev, [k]: v }))

  // Đặt lại số liệu tự động mới nhất
  const handleRefreshAutoData = () => {
    const fresh = getInitialFormData()
    setFormData((prev) => ({
      ...prev,
      studentOverview: fresh.studentOverview,
      academicOverview: fresh.academicOverview,
      logisticsOverview: fresh.logisticsOverview,
      financeOverview: fresh.financeOverview,
    }))
    toast('Đã cập nhật đồng bộ các số liệu mới nhất từ Bàn làm việc vào nội dung báo cáo!')
  }

  // In / Xuất PDF chuẩn văn bản hành chính A4
  const handlePrintPDF = () => {
    const printWin = window.open('', '_blank', 'width=900,height=1000')
    if (!printWin) {
      alert('Trình duyệt đã chặn cửa sổ in pop-up. Vui lòng cho phép pop-up để in/xuất PDF.')
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8">
        <title>Báo cáo Thường niên – ${project?.name || ''}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 20mm 15mm 20mm 25mm; /* Chuẩn căn lề văn bản NĐ 30/2020 */
          }
          * { box-sizing: border-box; }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 13pt;
            line-height: 1.45;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
          }
          .header-tbl { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .header-tbl td { vertical-align: top; border: none; padding: 0; }
          .header-left { text-align: center; width: 45%; }
          .header-right { text-align: center; width: 55%; }
          .sub-line { width: 120px; height: 1px; background: #000; margin: 4px auto 0; }
          .title-section { text-align: center; margin: 25px 0 20px; }
          .title-section h1 { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0 0 6px; }
          .title-section h2 { font-size: 13pt; font-weight: bold; font-style: italic; margin: 0; }
          .recipient-box { margin: 15px 0 20px; font-weight: bold; line-height: 1.5; }
          .section-title { font-weight: bold; text-transform: uppercase; margin: 18px 0 6px; font-size: 13pt; }
          .data-tbl { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12pt; }
          .data-tbl th, .data-tbl td { border: 1px solid #000; padding: 6px 8px; }
          .data-tbl th { background: #f2f2f2; font-weight: bold; text-align: center; }
          .footer-sign { width: 100%; border-collapse: collapse; margin-top: 35px; page-break-inside: avoid; }
          .footer-sign td { vertical-align: top; border: none; padding: 0; }
          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        <table class="header-tbl">
          <tr>
            <td class="header-left">
              <b>ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH</b><br />
              ${formData.senderDept.replace(/\n/g, '<br />')}<br />
              <div class="sub-line"></div>
              <div style="margin-top: 6px; font-size: 12pt;">Số: ${formData.docNumber}</div>
            </td>
            <td class="header-right">
              <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br />
              <b>Độc lập – Tự do – Hạnh phúc</b><br />
              <div class="sub-line" style="width: 160px;"></div>
              <div style="margin-top: 6px; font-style: italic; font-size: 12pt;">${formData.locationDate}</div>
            </td>
          </tr>
        </table>

        <div class="title-section">
          <h1>${formData.reportTitle}</h1>
          <h2>(${formData.academicYear})</h2>
        </div>

        <div class="recipient-box">
          ${formData.recipient.replace(/\n/g, '<br />')}
        </div>

        <div style="font-style: italic; margin-bottom: 16px;">
          ${formData.basis.replace(/\n/g, '<br />')}
        </div>

        <p>Ban Điều phối Chương trình trân trọng báo cáo Ban Giám hiệu Đại học Kinh tế TP. Hồ Chí Minh kết quả triển khai công tác vận hành thường niên với các nội dung chi tiết như sau:</p>

        <div class="section-title">I. TÌNH HÌNH TUYỂN SINH & QUẢN LÝ SINH VIÊN</div>
        <p>${formData.studentOverview.replace(/\n/g, '<br />')}</p>
        <table class="data-tbl">
          <thead>
            <tr>
              <th>Tổng số SV</th>
              <th>Đăng ký song bằng</th>
              <th>Đã hoàn tất học phí</th>
              <th>Đã cấp tài khoản Rennes LMS</th>
            </tr>
          </thead>
          <tbody>
            <tr style="text-align: center;">
              <td><b>${st.length}</b> sinh viên</td>
              <td><b>${dualCount}</b> sinh viên</td>
              <td><b>${paidCount}/${st.length}</b> (${tuitionPercent}%)</td>
              <td><b>${accCount}/${st.length}</b> sinh viên</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">II. KẾ HOẠCH ĐÀO TẠO & HOẠT ĐỘNG GIẢNG DẠY</div>
        <p>${formData.academicOverview.replace(/\n/g, '<br />')}</p>
        <table class="data-tbl">
          <thead>
            <tr>
              <th>Tổng số buổi giảng</th>
              <th>Học phần chuyên ngành</th>
              <th>Số buổi đã giảng dạy</th>
              <th>Tiến độ học phần</th>
            </tr>
          </thead>
          <tbody>
            <tr style="text-align: center;">
              <td><b>${ses.length}</b> buổi</td>
              <td><b>${courseCount}</b> môn học</td>
              <td><b>${taughtSes}</b> buổi</td>
              <td><b>${ses.length ? Math.round((taughtSes / ses.length) * 100) : 0}%</b> đạt chuẩn</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">III. CÔNG TÁC HẬU CẦN ĐOÀN CÔNG TÁC GIẢNG VIÊN</div>
        <p>${formData.logisticsOverview.replace(/\n/g, '<br />')}</p>

        <div class="section-title">IV. BÁO CÁO QUẢN LÝ TÀI CHÍNH, CHI TIÊU & QUYẾT TOÁN</div>
        <p>${formData.financeOverview.replace(/\n/g, '<br />')}</p>
        <table class="data-tbl">
          <thead>
            <tr>
              <th>Hạng mục kinh phí</th>
              <th>Giá trị quyết toán (VNĐ)</th>
              <th>Tình trạng chứng từ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1. Chi phí vé máy bay & di chuyển quốc tế/nội địa</td>
              <td style="text-align: right;"><b>${money(exCat['Vé máy bay'] || 0)} ₫</b></td>
              <td>Hóa đơn & cuống vé đầy đủ</td>
            </tr>
            <tr>
              <td>2. Lưu trú khách sạn chuyên gia nước ngoài</td>
              <td style="text-align: right;"><b>${money(exCat['Khách sạn'] || 0)} ₫</b></td>
              <td>Hóa đơn VAT & phiếu đặt phòng</td>
            </tr>
            <tr>
              <td>3. Thù lao giảng dạy & công tác phí giảng viên</td>
              <td style="text-align: right;"><b>${money(exCat['Thù lao'] || 0)} ₫</b></td>
              <td>Hợp đồng thỉnh giảng & phiếu tính thù lao</td>
            </tr>
            <tr>
              <td>4. Tiếp khách, ăn uống & hậu cần khảo sát</td>
              <td style="text-align: right;"><b>${money(exCat['Ăn uống, tiếp khách'] || 0)} ₫</b></td>
              <td>Hóa đơn hợp lệ theo định mức UEH</td>
            </tr>
            <tr style="background: #fafafa;">
              <td><b>TỔNG CỘNG KINH PHÍ ĐÃ CHI (VNĐ)</b></td>
              <td style="text-align: right;"><b>${money(totalExpVnd)} ₫</b></td>
              <td><b>Đã đối soát Ban TC-KT</b></td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">V. ĐÁNH GIÁ CHUNG & HIỆU QUẢ HOẠT ĐỘNG</div>
        <p><b>1. Thuận lợi:</b><br />${formData.pros.replace(/\n/g, '<br />')}</p>
        <p><b>2. Khó khăn, vướng mắc:</b><br />${formData.cons.replace(/\n/g, '<br />')}</p>
        <p><b>3. Đánh giá tổng thể:</b><br />${formData.overallAssessment.replace(/\n/g, '<br />')}</p>

        <div class="section-title">VI. KIẾN NGHỊ & ĐỀ XUẤT CHO NĂM HỌC TIẾP THEO</div>
        <p>${formData.recommendations.replace(/\n/g, '<br />')}</p>

        <p>Ban Điều phối kính trình Ban Giám hiệu Đại học Kinh tế TP. Hồ Chí Minh xem xét, chỉ đạo và tạo điều kiện để chương trình tiếp tục triển khai thắng lợi các mục tiêu trong giai đoạn tiếp theo./.</p>

        <table class="footer-sign">
          <tr>
            <td style="width: 50%;">
              <b><i>Nơi nhận:</i></b><br />
              ${formData.recipientsList.replace(/\n/g, '<br />')}
            </td>
            <td style="width: 50%; text-align: center;">
              <b>TM. BAN ĐIỀU PHỐI CHƯƠNG TRÌNH</b><br />
              <b>TRƯỞNG BAN / LÃNH ĐẠO ĐƠN VỊ</b><br />
              <br /><br /><br /><br />
              <b>${formData.approverName}</b><br />
              <span style="font-size: 11pt; font-style: italic;">(Ký, ghi rõ họ tên và đóng dấu)</span>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
    printWin.document.write(htmlContent)
    printWin.document.close()
    printWin.onload = function () {
      printWin.print()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Navigation & Action Bar */}
      <div className="card card-pad row between wrap" style={{ gap: 10, alignItems: 'center' }}>
        <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
          <div className="seg">
            <button
              type="button"
              className={viewMode === 'preview' ? 'on' : ''}
              onClick={() => setViewMode('preview')}
            >
              <L.FileCheck2 size={14} style={{ marginRight: 6 }} />
              Xem trước Thể thức Văn bản In (A4)
            </button>
            <button
              type="button"
              className={viewMode === 'edit' ? 'on' : ''}
              onClick={() => setViewMode('edit')}
            >
              <L.Edit3 size={14} style={{ marginRight: 6 }} />
              Chỉnh sửa Nội dung Báo cáo
            </button>
          </div>

          <button
            type="button"
            className="btn sm ghost"
            onClick={onBackToDashboard}
            title="Xem bảng thống kê số liệu dạng thẻ dashboard"
          >
            <L.LayoutGrid size={14} />
            Bảng số liệu tổng hợp (Dashboard)
          </button>
        </div>

        <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="btn sm"
            style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}
            onClick={handleRefreshAutoData}
            title="Lấy lại số liệu tự động mới nhất từ các phân hệ Bàn làm việc"
          >
            <L.RotateCw size={14} />
            Đồng bộ số liệu từ Bàn làm việc
          </button>

          <button
            type="button"
            className="btn sm primary"
            style={{ background: 'var(--teal-700)', borderColor: 'var(--teal-700)' }}
            onClick={handlePrintPDF}
          >
            <L.Printer size={15} />
            In / Xuất Văn bản PDF
          </button>
        </div>
      </div>

      {/* VIEW 1: CHẾ ĐỘ XEM TRƯỚC VĂN BẢN HÀNH CHÍNH (PREVIEW A4) */}
      {viewMode === 'preview' && (
        <div
          style={{
            background: '#525659',
            padding: '30px 16px',
            borderRadius: 12,
            display: 'flex',
            justifyContent: 'center',
            overflowX: 'auto',
          }}
        >
          <div
            style={{
              width: '210mm',
              minHeight: '297mm',
              background: '#ffffff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              padding: '20mm 15mm 20mm 25mm',
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: '13pt',
              lineHeight: 1.45,
              color: '#111827',
            }}
          >
            {/* Header Quốc hiệu / Tiêu ngữ */}
            <div style={{ display: 'grid', gridTemplateColumns: '45% 55%', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <b style={{ fontSize: '12pt', display: 'block' }}>ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH</b>
                <div style={{ whiteSpace: 'pre-line', fontSize: '11.5pt', fontWeight: 600 }}>
                  {formData.senderDept}
                </div>
                <div style={{ width: 110, height: 1, background: '#000', margin: '4px auto 6px' }} />
                <div style={{ fontSize: '11.5pt' }}>Số: {formData.docNumber}</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <b style={{ fontSize: '12pt', display: 'block' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b>
                <b style={{ fontSize: '12pt', display: 'block' }}>Độc lập – Tự do – Hạnh phúc</b>
                <div style={{ width: 140, height: 1, background: '#000', margin: '4px auto 6px' }} />
                <div style={{ fontStyle: 'italic', fontSize: '11.5pt' }}>{formData.locationDate}</div>
              </div>
            </div>

            {/* Tiêu đề Báo cáo */}
            <div style={{ textAlign: 'center', margin: '24px 0 18px' }}>
              <h1 style={{ fontSize: '15pt', fontWeight: 'bold', margin: '0 0 6px', textTransform: 'uppercase' }}>
                {formData.reportTitle}
              </h1>
              <h2 style={{ fontSize: '13pt', fontWeight: 'bold', fontStyle: 'italic', margin: 0 }}>
                ({formData.academicYear})
              </h2>
            </div>

            {/* Kính gửi */}
            <div style={{ fontWeight: 'bold', margin: '16px 0', whiteSpace: 'pre-line' }}>
              {formData.recipient}
            </div>

            {/* Căn cứ */}
            <div style={{ fontStyle: 'italic', margin: '0 0 16px', whiteSpace: 'pre-line', fontSize: '12pt' }}>
              {formData.basis}
            </div>

            <p style={{ textIndent: 28, margin: '0 0 14px' }}>
              Ban Điều phối Chương trình trân trọng báo cáo Ban Giám hiệu Đại học Kinh tế TP. Hồ Chí Minh kết quả triển khai công tác vận hành thường niên với các nội dung chi tiết như sau:
            </p>

            {/* Phần I: Tuyển sinh & Sinh viên */}
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: '18px 0 6px', fontSize: '13pt' }}>
              I. TÌNH HÌNH TUYỂN SINH & QUẢN LÝ SINH VIÊN
            </div>
            <p style={{ textIndent: 28, margin: '0 0 10px', whiteSpace: 'pre-line' }}>
              {formData.studentOverview}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0 16px', fontSize: '11.5pt' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ border: '1px solid #333', padding: '6px 8px' }}>Tổng số SV</th>
                  <th style={{ border: '1px solid #333', padding: '6px 8px' }}>Đăng ký song bằng</th>
                  <th style={{ border: '1px solid #333', padding: '6px 8px' }}>Đã hoàn tất học phí</th>
                  <th style={{ border: '1px solid #333', padding: '6px 8px' }}>Đã cấp tài khoản Rennes LMS</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ textAlign: 'center' }}>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}><b>{st.length}</b> sinh viên</td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}><b>{dualCount}</b> sinh viên</td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}><b>{paidCount}/{st.length}</b> ({tuitionPercent}%)</td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}><b>{accCount}/{st.length}</b> sinh viên</td>
                </tr>
              </tbody>
            </table>

            {/* Phần II: Đào tạo & Giảng dạy */}
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: '18px 0 6px', fontSize: '13pt' }}>
              II. KẾ HOẠCH ĐÀO TẠO & HOẠT ĐỘNG GIẢNG DẠY
            </div>
            <p style={{ textIndent: 28, margin: '0 0 10px', whiteSpace: 'pre-line' }}>
              {formData.academicOverview}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0 16px', fontSize: '11.5pt' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ border: '1px solid #333', padding: '6px 8px' }}>Tổng số buổi giảng</th>
                  <th style={{ border: '1px solid #333', padding: '6px 8px' }}>Học phần chuyên ngành</th>
                  <th style={{ border: '1px solid #333', padding: '6px 8px' }}>Số buổi đã hoàn thành</th>
                  <th style={{ border: '1px solid #333', padding: '6px 8px' }}>Tỷ lệ tiến độ</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ textAlign: 'center' }}>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}><b>{ses.length}</b> buổi</td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}><b>{courseCount}</b> môn học</td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}><b>{taughtSes}</b> buổi</td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}><b>{ses.length ? Math.round((taughtSes / ses.length) * 100) : 0}%</b> hoàn tất</td>
                </tr>
              </tbody>
            </table>

            {/* Phần III: Hậu cần đoàn công tác */}
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: '18px 0 6px', fontSize: '13pt' }}>
              III. CÔNG TÁC HẬU CẦN ĐOÀN CÔNG TÁC GIẢNG VIÊN
            </div>
            <p style={{ textIndent: 28, margin: '0 0 14px', whiteSpace: 'pre-line' }}>
              {formData.logisticsOverview}
            </p>

            {/* Phần IV: Tài chính & Chi tiêu */}
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: '18px 0 6px', fontSize: '13pt' }}>
              IV. BÁO CÁO QUẢN LÝ TÀI CHÍNH, CHI TIÊU & QUYẾT TOÁN
            </div>
            <p style={{ textIndent: 28, margin: '0 0 10px', whiteSpace: 'pre-line' }}>
              {formData.financeOverview}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0 16px', fontSize: '11.5pt' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ border: '1px solid #333', padding: '6px 8px' }}>Hạng mục kinh phí</th>
                  <th style={{ border: '1px solid #333', padding: '6px 8px', textAlign: 'right' }}>Giá trị quyết toán (VNĐ)</th>
                  <th style={{ border: '1px solid #333', padding: '6px 8px' }}>Ghi chú tình trạng chứng từ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}>1. Chi phí vé máy bay & di chuyển quốc tế/nội địa</td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px', textAlign: 'right' }}><b>{money(exCat['Vé máy bay'] || 0)} ₫</b></td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}>Hóa đơn điện tử & cuống vé đầy đủ</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}>2. Lưu trú khách sạn chuyên gia nước ngoài</td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px', textAlign: 'right' }}><b>{money(exCat['Khách sạn'] || 0)} ₫</b></td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}>Hóa đơn VAT & phiếu đặt phòng khách sạn</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}>3. Thù lao giảng dạy & công tác phí giảng viên</td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px', textAlign: 'right' }}><b>{money(exCat['Thù lao'] || 0)} ₫</b></td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}>Hợp đồng thỉnh giảng & phiếu thanh toán</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}>4. Tiếp khách, ăn uống & hậu cần khảo sát</td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px', textAlign: 'right' }}><b>{money(exCat['Ăn uống, tiếp khách'] || 0)} ₫</b></td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}>Hóa đơn hợp lệ theo định mức UEH</td>
                </tr>
                <tr style={{ background: '#f1f5f9' }}>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}><b>TỔNG CỘNG KINH PHÍ ĐÃ CHI (VNĐ)</b></td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px', textAlign: 'right' }}><b>{money(totalExpVnd)} ₫</b></td>
                  <td style={{ border: '1px solid #333', padding: '6px 8px' }}><b>Đã đối soát Ban TC-KT</b></td>
                </tr>
              </tbody>
            </table>

            {/* Phần V: Đánh giá chung */}
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: '18px 0 6px', fontSize: '13pt' }}>
              V. ĐÁNH GIÁ HIỆU QUẢ HOẠT ĐỘNG
            </div>
            <div style={{ margin: '0 0 8px' }}>
              <b>1. Thuận lợi:</b>
              <div style={{ whiteSpace: 'pre-line', textIndent: 28 }}>{formData.pros}</div>
            </div>
            <div style={{ margin: '0 0 8px' }}>
              <b>2. Khó khăn, vướng mắc:</b>
              <div style={{ whiteSpace: 'pre-line', textIndent: 28 }}>{formData.cons}</div>
            </div>
            <div style={{ margin: '0 0 14px' }}>
              <b>3. Đánh giá tổng kết:</b>
              <div style={{ whiteSpace: 'pre-line', textIndent: 28 }}>{formData.overallAssessment}</div>
            </div>

            {/* Phần VI: Kiến nghị & Đề xuất */}
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase', margin: '18px 0 6px', fontSize: '13pt' }}>
              VI. KIẾN NGHỊ & ĐỀ XUẤT CHO NĂM HỌC TIẾP THEO
            </div>
            <div style={{ whiteSpace: 'pre-line', textIndent: 28, margin: '0 0 16px' }}>
              {formData.recommendations}
            </div>

            <p style={{ textIndent: 28, margin: '0 0 30px' }}>
              Ban Điều phối kính trình Ban Giám hiệu Đại học Kinh tế TP. Hồ Chí Minh xem xét, chỉ đạo và tạo điều kiện để chương trình tiếp tục triển khai thắng lợi các mục tiêu trong giai đoạn tiếp theo./.
            </p>

            {/* Khối chữ ký hai bên */}
            <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', marginTop: 20 }}>
              <div>
                <b><i>Nơi nhận:</i></b>
                <div style={{ whiteSpace: 'pre-line', fontSize: '11pt', marginTop: 4 }}>
                  {formData.recipientsList}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <b>TM. BAN ĐIỀU PHỐI CHƯƠNG TRÌNH</b><br />
                <b>TRƯỞNG BAN / LÃNH ĐẠO ĐƠN VỊ</b><br />
                <div style={{ height: 60 }} />
                <b>{formData.approverName}</b><br />
                <span style={{ fontSize: '10.5pt', fontStyle: 'italic' }}>(Ký, ghi rõ họ tên và đóng dấu)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CHẾ ĐỘ CHỈNH SỬA NỘI DUNG (EDIT FORM) */}
      {viewMode === 'edit' && (
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="row between" style={{ alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
            <div>
              <b style={{ fontSize: 15 }}>Chỉnh sửa thông tin & Số liệu Báo cáo Thường niên</b>
              <div className="small muted">Mọi thay đổi sẽ được phản ánh trực tiếp vào văn bản mẫu in A4</div>
            </div>
            <button className="btn sm primary" onClick={() => setViewMode('preview')}>
              <L.Eye size={14} />
              Xem bản in A4
            </button>
          </div>

          {/* Form Fields: Thể thức đầu văn bản */}
          <div className="grid2">
            <div className="field">
              <label>Đơn vị gửi báo cáo</label>
              <textarea
                className="textarea"
                rows={2}
                value={formData.senderDept}
                onChange={(e) => setF('senderDept', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Số hiệu văn bản & Ngày tháng</label>
              <input
                className="input"
                style={{ marginBottom: 6 }}
                value={formData.docNumber}
                onChange={(e) => setF('docNumber', e.target.value)}
                placeholder="Số: .../BC-KTC-ĐH"
              />
              <input
                className="input"
                value={formData.locationDate}
                onChange={(e) => setF('locationDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label>Tiêu đề báo cáo</label>
              <input
                className="input"
                style={{ fontWeight: 600 }}
                value={formData.reportTitle}
                onChange={(e) => setF('reportTitle', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Niên độ / Năm học</label>
              <input
                className="input"
                value={formData.academicYear}
                onChange={(e) => setF('academicYear', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Nơi nhận (Kính gửi: gửi cho ai?)</label>
            <textarea
              className="textarea"
              rows={2}
              value={formData.recipient}
              onChange={(e) => setF('recipient', e.target.value)}
              placeholder="VD: Ban Giám hiệu UEH; Ban Đào tạo; Ban Tài chính - Kế toán..."
            />
          </div>

          <div className="field">
            <label>Căn cứ pháp lý & Văn bản liên quan</label>
            <textarea
              className="textarea"
              rows={2}
              value={formData.basis}
              onChange={(e) => setF('basis', e.target.value)}
            />
          </div>

          {/* Phần I & II */}
          <div className="field">
            <label>I. Tình hình Tuyển sinh & Quản lý Sinh viên (Nội dung & Số liệu)</label>
            <textarea
              className="textarea"
              rows={3}
              value={formData.studentOverview}
              onChange={(e) => setF('studentOverview', e.target.value)}
            />
          </div>

          <div className="field">
            <label>II. Kế hoạch Đào tạo & Hoạt động Giảng dạy</label>
            <textarea
              className="textarea"
              rows={3}
              value={formData.academicOverview}
              onChange={(e) => setF('academicOverview', e.target.value)}
            />
          </div>

          {/* Phần III & IV */}
          <div className="field">
            <label>III. Công tác Hậu cần Đoàn Công tác Giảng viên (Vé máy bay, khách sạn, đón tiễn)</label>
            <textarea
              className="textarea"
              rows={3}
              value={formData.logisticsOverview}
              onChange={(e) => setF('logisticsOverview', e.target.value)}
            />
          </div>

          <div className="field">
            <label>IV. Báo cáo Chi tiêu & Quyết toán Kinh phí (Chi bao nhiêu, chuyển tiền đối tác)</label>
            <textarea
              className="textarea"
              rows={3}
              value={formData.financeOverview}
              onChange={(e) => setF('financeOverview', e.target.value)}
            />
          </div>

          {/* Phần V: Đánh giá hiệu quả hoạt động */}
          <div className="field">
            <label>V.1. Thuận lợi trong quá trình triển khai</label>
            <textarea
              className="textarea"
              rows={2}
              value={formData.pros}
              onChange={(e) => setF('pros', e.target.value)}
            />
          </div>

          <div className="field">
            <label>V.2. Khó khăn, vướng mắc phát sinh</label>
            <textarea
              className="textarea"
              rows={2}
              value={formData.cons}
              onChange={(e) => setF('cons', e.target.value)}
            />
          </div>

          <div className="field">
            <label>V.3. Đánh giá chung về hiệu quả hoạt động</label>
            <textarea
              className="textarea"
              rows={2}
              value={formData.overallAssessment}
              onChange={(e) => setF('overallAssessment', e.target.value)}
            />
          </div>

          {/* Phần VI: Kiến nghị & Ký tên */}
          <div className="field">
            <label>VI. Kiến nghị & Đề xuất với Ban Giám hiệu UEH</label>
            <textarea
              className="textarea"
              rows={3}
              value={formData.recommendations}
              onChange={(e) => setF('recommendations', e.target.value)}
            />
          </div>

          <div className="grid2">
            <div className="field">
              <label>Họ tên Lãnh đạo phê duyệt báo cáo</label>
              <input
                className="input"
                value={formData.approverName}
                onChange={(e) => setF('approverName', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Chức danh Lãnh đạo</label>
              <input
                className="input"
                value={formData.approverTitle}
                onChange={(e) => setF('approverTitle', e.target.value)}
              />
            </div>
          </div>

          <div className="row end" style={{ gap: 8, marginTop: 10 }}>
            <button className="btn primary" onClick={() => setViewMode('preview')}>
              <L.Check size={15} />
              Hoàn tất chỉnh sửa & Xem bản in
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
