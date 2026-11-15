/**
 * Thư viện Mẫu Email Thông báo & Nhắc việc Hành chính
 * Chuẩn hóa nhận diện UEH-ISB, hỗ trợ song ngữ (Anh - Việt)
 */

export const EMAIL_TEMPLATES = {
  grade_reminder: {
    id: 'grade_reminder',
    name: 'Nhắc hạn nộp bảng điểm học phần',
    category: 'academic',
    subjectPattern: '[UEH-ISB] Nhắc hạn nộp bảng điểm học phần [HỌC PHẦN] - Lớp [LỚP]',
    build({
      lecturerName = 'Prof. Franck Martin',
      courseName = 'Kinh tế lượng tài chính và Mô hình hóa tài chính',
      className = 'ISB-K51-01',
      deadline = '18/11/2026',
      portalUrl = 'https://ueh-workhub.vercel.app/#/projects/p1/work?module=grades',
      coordinatorName = 'Nguyễn Thu Hà',
      coordinatorTitle = 'Điều phối Học vụ UEH-ISB',
      coordinatorEmail = 'thuha@ueh.demo',
      coordinatorPhone = '(+84) 28 3920 9999',
    }) {
      const subject = `[UEH-ISB] Nhắc hạn nộp bảng điểm học phần ${courseName} - Lớp ${className}`
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #03616a; padding: 24px; text-align: center; color: #ffffff; }
    .header h2 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 28px 24px; }
    .alert-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #92400e; }
    .info-table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13.5px; }
    .info-table td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; }
    .info-table td.label { font-weight: 600; color: #64748b; width: 35%; }
    .btn-container { text-align: center; margin: 28px 0 20px; }
    .btn { display: inline-block; background: #03616a; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { background: #f8fafc; padding: 20px 24px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>UEH – VIỆN ISB · BAN ĐÀO TẠO QUỐC TẾ</h2>
      <p>Chương trình Cử nhân Song bằng UEH – Université de Rennes</p>
    </div>
    <div class="content">
      <p>Kính gửi <b>${lecturerName}</b> / <i>Dear Professor ${lecturerName}</i>,</p>
      <p>Ban Đào tạo Quốc tế UEH-ISB xin gửi lời chào trân trọng và cảm ơn Thầy/Cô đã hoàn thành đợt giảng dạy học phần vừa qua.</p>
      
      <div class="alert-box">
        ⏰ <b>THỜI HẠN NỘP BẢNG ĐIỂM / GRADE SUBMISSION DEADLINE:</b><br>
        Hạn chót nộp bảng điểm chính thức theo Thỏa thuận hợp tác (MOA) là <b>${deadline}</b>.
      </div>

      <table class="info-table">
        <tr><td class="label">Học phần / Course:</td><td><b>${courseName}</b></td></tr>
        <tr><td class="label">Lớp / Cohort:</td><td>${className}</td></tr>
        <tr><td class="label">Thang điểm / Grading Scale:</td><td>Thang điểm 20 (Hệ thống tự động quy đổi thang điểm 10 theo MOA)</td></tr>
        <tr><td class="label">Thời hạn / Deadline:</td><td><b style="color: #dc2626;">${deadline}</b></td></tr>
      </table>

      <p>Thầy/Cô vui lòng truy cập Cổng điều phối điểm trực tuyến để nhập điểm hoặc đính kèm file Excel/PDF bảng điểm có chữ ký:</p>

      <div class="btn-container">
        <a href="${portalUrl}" class="btn">Truy cập Cổng Nộp Điểm / Grade Submission Portal →</a>
      </div>

      <p style="font-size: 13px; color: #475569;">Nếu Thầy/Cô cần hỗ trợ thêm thông tin hoặc gia hạn đặc biệt, xin vui lòng phản hồi trực tiếp qua email này hoặc liên hệ điều phối viên phụ trách.</p>
      
      <p style="margin-top: 24px;">Trân trọng,<br>
      <b>${coordinatorName}</b><br>
      <span style="font-size: 12.5px; color: #64748b;">${coordinatorTitle}<br>Email: ${coordinatorEmail} · Hotline: ${coordinatorPhone}</span></p>
    </div>
    <div class="footer">
      Văn phòng Viện ISB – Đại học Kinh tế TP. Hồ Chí Minh (UEH)<br>
      17 Phạm Ngọc Thạch, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh · Website: isb.edu.vn
    </div>
  </div>
</body>
</html>
      `
      return { subject, html }
    },
  },

  contract_reminder: {
    id: 'contract_reminder',
    name: 'Nhắc hoàn thiện hồ sơ & Hợp đồng thỉnh giảng',
    category: 'academic',
    build({
      lecturerName = 'Prof. Franck Martin',
      contractNo = '1150/HĐTG-ĐHKT-TC',
      courses = 'Kinh tế lượng chuỗi thời gian',
      deadline = '25/11/2026',
      coordinatorName = 'Võ Thanh Tùng',
      coordinatorTitle = 'Chuyên viên Hậu cần & Nhân sự UEH-ISB',
      coordinatorEmail = 'thanhtung@ueh.demo',
      coordinatorPhone = '(+84) 903 123 456',
    }) {
      const subject = `[UEH-ISB] Nhắc hoàn thiện hồ sơ & Ký Hợp đồng thỉnh giảng - ${lecturerName}`
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 20px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0891b2; padding: 24px; text-align: center; color: #ffffff; }
    .content { padding: 28px 24px; }
    .checklist { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin: 18px 0; font-size: 13.5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; font-size: 20px;">HỒ SƠ GIẢNG VIÊN & HỢP ĐỒNG THỈNH GIẢNG</h2>
      <p style="margin: 4px 0 0; font-size: 13px;">Chương trình Cử nhân Song bằng UEH – Université de Rennes</p>
    </div>
    <div class="content">
      <p>Kính gửi <b>${lecturerName}</b>,</p>
      <p>Để hoàn tất thủ tục mời giảng và thanh toán thù lao theo Hợp đồng số <b>${contractNo}</b> cho học phần <b>${courses}</b>, Ban Điều phối kính nhờ Thầy/Cô kiểm tra và gửi lại các chứng từ sau trước ngày <b>${deadline}</b>:</p>
      
      <div class="checklist">
        <b>Danh mục chứng từ cần ký & nộp:</b>
        <ul style="margin: 8px 0 0; padding-left: 20px;">
          <li>Hợp đồng thỉnh giảng (bản in có chữ ký tươi hoặc chữ ký số)</li>
          <li>Bản cam kết khấu trừ thuế TNCN 20% (theo biểu mẫu của UEH)</li>
          <li>Bản sao Hộ chiếu (Passport) còn hạn trên 6 tháng</li>
          <li>Lý lịch khoa học (CV) và Bản sao bằng Tiến sĩ/Thạc sĩ</li>
        </ul>
      </div>

      <p>Thầy/Cô có thể gửi bản scan chất lượng cao qua email này. Bản gốc sẽ được gửi thu lại khi Thầy/Cô sang giảng dạy tại cơ sở UEH.</p>

      <p style="margin-top: 24px;">Trân trọng,<br>
      <b>${coordinatorName}</b><br>
      <span style="font-size: 12.5px; color: #64748b;">${coordinatorTitle}<br>Email: ${coordinatorEmail} · SĐT: ${coordinatorPhone}</span></p>
    </div>
  </div>
</body>
</html>
      `
      return { subject, html }
    },
  },

  flight_pickup_reminder: {
    id: 'flight_pickup_reminder',
    name: 'Thông tin chuyến bay, phòng khách sạn & xe đón tiễn',
    category: 'logistics',
    build({
      lecturerName = 'Prof. Franck Martin',
      flightCode = 'AF 258 (Paris CDG → SGN)',
      arriveTime = '06:30 Ngày 05/12/2026',
      hotelName = 'Novotel Saigon Centre (gần UEH cơ sở B)',
      hotelBooking = 'BK4744',
      hotelAddress = '167 Hai Bà Trưng, Quận 3, TP. Hồ Chí Minh',
      driverName = 'Nguyễn Văn Hùng',
      driverPhone = '(+84) 912 345 678',
      coordinatorName = 'Võ Thanh Tùng',
      coordinatorPhone = '(+84) 903 123 456',
    }) {
      const subject = `[UEH-ISB] Thông tin Đón tiễn Sân bay & Khách sạn - GV ${lecturerName}`
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 20px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0284c7; padding: 24px; text-align: center; color: #ffffff; }
    .content { padding: 28px 24px; }
    .card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px 16px; margin: 14px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; font-size: 20px;">LỊCH ĐÓN TIỄN SÂN BAY & LƯU TRÚ</h2>
      <p style="margin: 4px 0 0; font-size: 13px;">Đoàn Giảng viên Đại học Rennes công tác tại UEH</p>
    </div>
    <div class="content">
      <p>Kính gửi <b>${lecturerName}</b> / <i>Dear Professor ${lecturerName}</i>,</p>
      <p>Ban Hậu cần UEH-ISB xin gửi thông tin chi tiết về chuyến bay, xe đón tiễn và khách sạn cho đợt công tác sắp tới:</p>

      <div class="card">
        <h4 style="margin: 0 0 8px; color: #0369a1;">✈️ Chuyến bay đến & Đón sân bay Tân Sơn Nhất:</h4>
        <div style="font-size: 13.5px;">
          • Chuyến bay: <b>${flightCode}</b><br>
          • Thời gian hạ cánh dự kiến: <b>${arriveTime}</b><br>
          • Điểm đón: <b>Cột số 10 – Ga Quốc tế Đến (Sân bay Tân Sơn Nhất)</b><br>
          • Tài xế đón tiễn: <b>${driverName}</b> (SĐT: <b>${driverPhone}</b> - có bảng đón tên Thầy)
        </div>
      </div>

      <div class="card">
        <h4 style="margin: 0 0 8px; color: #0369a1;">🏨 Thông tin Khách sạn:</h4>
        <div style="font-size: 13.5px;">
          • Khách sạn: <b>${hotelName}</b><br>
          • Mã đặt phòng: <b>${hotelBooking}</b> (đã bao gồm ăn sáng & hóa đơn thanh toán trực tiếp từ UEH)<br>
          • Địa chỉ: ${hotelAddress}
        </div>
      </div>

      <p style="font-size: 13px; color: #475569;">Hotline hỗ trợ 24/7 khi hạ cánh hoặc cần đón sớm: <b>${coordinatorPhone}</b> (Mr. ${coordinatorName}). Chúc Thầy có một chuyến bay êm ái!</p>

      <p style="margin-top: 24px;">Trân trọng,<br>
      <b>${coordinatorName}</b><br>
      Ban Hậu cần & Đón tiếp Đoàn quốc tế · UEH-ISB</p>
    </div>
  </div>
</body>
</html>
      `
      return { subject, html }
    },
  },
}
