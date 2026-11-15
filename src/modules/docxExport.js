import {
  Document, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, Packer
} from 'docx'

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'auto' }
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: '333333' }
const cellPadding = { top: 120, bottom: 120, left: 160, right: 160 }

const noTableBorders = {
  top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
  insideHorizontal: noBorder, insideVertical: noBorder
}
const standardTableBorders = {
  top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder,
  insideHorizontal: thinBorder, insideVertical: thinBorder
}

const FONT = 'Times New Roman'

// Helper tạo đoạn văn bản chuẩn
const p = (text, opts = {}) => new Paragraph({
  alignment: opts.align || AlignmentType.LEFT,
  spacing: { before: opts.before ?? 60, after: opts.after ?? 60, line: 276 },
  children: [
    new TextRun({
      text: String(text ?? ''),
      font: FONT,
      size: opts.size || 24, // 12pt
      bold: !!opts.bold,
      italics: !!opts.italic,
      underline: opts.underline ? {} : undefined,
      color: opts.color || '111111'
    })
  ]
})

// Header hành chính chuẩn (Cơ quan ban hành + Quốc hiệu tiêu ngữ)
function createAdminHeader(orgTop, orgMain, docNo, cityDate) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              p(orgTop, { align: AlignmentType.CENTER, size: 21 }),
              p(orgMain, { align: AlignmentType.CENTER, bold: true, size: 22 }),
              p(docNo ? `Số: ${docNo}` : 'Số: ……/PĐN-ISB', { align: AlignmentType.CENTER, size: 21, italic: true }),
            ]
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              p('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { align: AlignmentType.CENTER, bold: true, size: 21 }),
              p('Độc lập – Tự do – Hạnh phúc', { align: AlignmentType.CENTER, bold: true, size: 22, underline: true }),
              p(cityDate || 'TP. Hồ Chí Minh, ngày …… tháng …… năm 2026', { align: AlignmentType.CENTER, italic: true, size: 20 }),
            ]
          }),
        ]
      })
    ]
  })
}

// Bảng chữ ký 3 bên
function createThreeSigns(title1, name1, title2, name2, title3, name3) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noTableBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              p(title1, { align: AlignmentType.CENTER, bold: true, size: 22 }),
              p('(Ký, ghi rõ họ tên)', { align: AlignmentType.CENTER, italic: true, size: 19 }),
              new Paragraph({ spacing: { before: 1200, after: 60 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: name1 || '', font: FONT, size: 22, bold: true })] })
            ]
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              p(title2, { align: AlignmentType.CENTER, bold: true, size: 22 }),
              p('(Ký, ghi rõ họ tên)', { align: AlignmentType.CENTER, italic: true, size: 19 }),
              new Paragraph({ spacing: { before: 1200, after: 60 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: name2 || '', font: FONT, size: 22, bold: true })] })
            ]
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              p(title3, { align: AlignmentType.CENTER, bold: true, size: 22 }),
              p('(Ký, đóng dấu)', { align: AlignmentType.CENTER, italic: true, size: 19 }),
              new Paragraph({ spacing: { before: 1200, after: 60 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: name3 || '', font: FONT, size: 22, bold: true })] })
            ]
          }),
        ]
      })
    ]
  })
}

// Bảng Key-Value 2 cột
function createKeyValueTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: standardTableBorders,
    rows: rows.map(([label, val, isHeader]) => new TableRow({
      children: [
        new TableCell({
          width: { size: 36, type: WidthType.PERCENTAGE },
          margins: cellPadding,
          shading: { fill: 'F8FAFC' },
          children: [p(label, { bold: true, size: 22 })]
        }),
        new TableCell({
          width: { size: 64, type: WidthType.PERCENTAGE },
          margins: cellPadding,
          children: [p(val, { bold: !!isHeader, size: 22 })]
        }),
      ]
    }))
  })
}

/* ================= BUILDER CHO CÁC MẪU VĂN BẢN ================= */

export async function exportDocx(templateId, data) {
  let docChildren = []
  let fileName = `Van_Ban_${templateId}.docx`

  const dateStr = data.docDate || `ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`
  const cityDate = `TP. Hồ Chí Minh, ${dateStr}`

  if (templateId === 'flightReq') {
    fileName = `Phieu_De_Nghi_Dat_Ve_May_Bay_${(data.lecturerName || 'GV').replace(/\s+/g, '_')}.docx`
    docChildren = [
      createAdminHeader('ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH', 'KHOA TÀI CHÍNH – VIỆN ISB', data.docNumber, cityDate),
      new Paragraph({ spacing: { before: 240, after: 80 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: 'PHIẾU ĐỀ NGHỊ ĐẶT VÉ MÁY BAY', font: FONT, bold: true, size: 28 }),
      ]}),
      p('(Phục vụ giảng viên quốc tế giảng dạy chương trình cử nhân song bằng UEH – Université de Rennes)', { align: AlignmentType.CENTER, italic: true, size: 21, after: 180 }),
      p(`Kính gửi: ${data.recipients || 'Ban Giám hiệu UEH; Phòng Tài chính – Kế toán; Đại lý vé máy bay đối tác.'}`, { italic: true, bold: true, size: 22, after: 140 }),
      p('1. THÔNG TIN GIẢNG VIÊN VÀ HỌC PHẦN', { bold: true, size: 23, before: 140, after: 80 }),
      createKeyValueTable([
        ['Họ và tên giảng viên', data.lecturerName || '—', true],
        ['Chức danh / Học vị', data.lecturerTitle || 'Giảng viên'],
        ['Quốc tịch', data.nationality || 'Cộng hòa Pháp'],
        ['Số hộ chiếu (Passport)', `${data.passport || '—'} · Nơi cấp: ${data.passportIssued || 'Cộng hòa Pháp'}`],
        ['Đơn vị công tác', data.organization || 'Đại học Rennes (Université de Rennes, France)'],
        ['Học phần giảng dạy', `${data.courseName || '—'} (Mã HP: ${data.courseCode || '—'})`],
        ['Lớp / Khóa sinh viên', `${data.className || '—'} · Khóa ${data.cohort || 'K51'} (Giai đoạn 2 song bằng)`],
        ['Thời gian giảng dạy', `Từ ${data.teachFrom || '……'} đến ${data.teachTo || '……'} (Tổng cộng: ${data.teachHours || 0} giờ)`],
      ]),
      p('2. LỊCH TRÌNH VÀ YÊU CẦU ĐẶT VÉ MÁY BAY', { bold: true, size: 23, before: 200, after: 80 }),
      createKeyValueTable([
        ['Hành trình bay đề xuất', data.flightRoute || 'Rennes / Paris (CDG) ⇄ TP. Hồ Chí Minh (SGN)'],
        ['Chặng đi (Paris/Rennes → SGN)', `Ngày đi: ${data.departAt || '……'} · Chuyến bay dự kiến: ${data.outFlight || '—'} · Đến SGN lúc: ${data.arriveAt || '……'}`],
        ['Chặng về (SGN → Paris/Rennes)', `Ngày về: ${data.returnAt || '……'} · Chuyến bay dự kiến: ${data.returnFlight || '—'}`],
        ['Hạng vé đề xuất', data.flightClass || 'Phổ thông linh hoạt (Economy Flex) theo MOA'],
        ['Tiêu chuẩn hành lý', data.baggageAllowance || '02 kiện ký gửi 23kg/kiện + 01 kiện xách tay 12kg'],
        ['Chỗ ngồi & Suất ăn yêu cầu', `${data.seatPreference || 'Cạnh lối đi'} · ${data.dietPreference || 'Không yêu cầu'}`],
        ['Dự toán chi phí vé máy bay', data.ticketCost ? `${(+data.ticketCost).toLocaleString('vi-VN')} VNĐ` : 'Theo hóa đơn thực tế của hãng'],
        ['Ghi chú bổ sung', data.notes || 'Cần xe đón sân bay Tân Sơn Nhất và xuất hóa đơn VAT tên UEH.'],
      ]),
      p('Kính đề nghị Ban Giám hiệu và Phòng Tài chính – Kế toán xem xét phê duyệt để Khoa tiến hành đặt vé theo đúng lịch trình.', { italic: true, size: 22, before: 140, after: 200 }),
      createThreeSigns(
        'Người lập phiếu', data.creatorName || 'Nguyễn Thu Hà',
        'Ban điều hành chương trình', data.verifierName || 'Trần Minh Anh',
        'Trưởng khoa phê duyệt', data.signatoryName || 'TS. Lê Đạt Chí'
      ),
    ]
  } else if (templateId === 'hotelReq') {
    fileName = `Phieu_Dat_Phong_Khach_San_${(data.lecturerName || 'GV').replace(/\s+/g, '_')}.docx`
    docChildren = [
      createAdminHeader('ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH', 'KHOA TÀI CHÍNH – BAN ĐIỀU HÀNH RENNES', data.docNumber, cityDate),
      new Paragraph({ spacing: { before: 240, after: 80 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: 'PHIẾU ĐĂNG KÝ & DUYỆT ĐẶT PHÒNG KHÁCH SẠN', font: FONT, bold: true, size: 28 }),
      ]}),
      p('(Lưu trú cho giảng viên Đại học Rennes giảng dạy chương trình cử nhân song bằng)', { align: AlignmentType.CENTER, italic: true, size: 21, after: 180 }),
      p(`Kính gửi: Bộ phận Lễ tân / Đặt phòng Khách sạn ${data.hotelName || 'đối tác'}; Phòng TC-KT UEH.`, { italic: true, bold: true, size: 22, after: 140 }),
      p('1. THÔNG TIN KHÁCH LƯU TRÚ (GIẢNG VIÊN)', { bold: true, size: 23, before: 140, after: 80 }),
      createKeyValueTable([
        ['Họ tên khách lưu trú', data.lecturerName || '—', true],
        ['Chức danh / Quốc tịch', `${data.lecturerTitle || 'Giảng viên'} · Quốc tịch: ${data.nationality || 'Pháp'}`],
        ['Số hộ chiếu', data.passport || '—'],
        ['Email / Số điện thoại', `${data.email || '—'} · ${data.phone || '—'}`],
      ]),
      p('2. CHI TIẾT ĐẶT PHÒNG VÀ TIÊU CHUẨN DỊCH VỤ', { bold: true, size: 23, before: 200, after: 80 }),
      createKeyValueTable([
        ['Khách sạn lưu trú', `${data.hotelName || 'Khách sạn Novotel Saigon Centre'} – ${data.hotelAddress || 'TP. Hồ Chí Minh'}`],
        ['Hạng phòng yêu cầu', data.roomType || 'Phòng Superior / Deluxe King Bed (không hút thuốc, tầng cao)'],
        ['Ngày nhận phòng (Check-in)', `${data.checkIn || '……'} (sau 14:00)`],
        ['Ngày trả phòng (Check-out)', `${data.checkOut || '……'} (trước 12:00)`],
        ['Tổng số đêm lưu trú', `${data.nights || '……'} đêm`],
        ['Dịch vụ bao gồm', 'Buffet sáng hàng ngày cho 01 người; Wifi tốc độ cao; nước suối miễn phí.'],
        ['Dự toán chi phí tiền phòng', data.hotelCost ? `${(+data.hotelCost).toLocaleString('vi-VN')} VNĐ` : 'Theo thỏa thuận khung đối tác'],
        ['Mã xác nhận (Booking code)', data.bookingCode || 'Chờ khách sạn cấp'],
        ['Phương thức thanh toán', data.billingInstruction || 'Khoa Tài chính UEH thanh toán chuyển khoản sau khi kết thúc đợt lưu trú và nhận hóa đơn VAT.'],
        ['Ghi chú & Yêu cầu riêng', data.notes || 'Giảng viên tự thanh toán chi phí phát sinh cá nhân (mini-bar, giặt ủi...).'],
      ]),
      p('3. THÔNG TIN XUẤT HÓA ĐƠN GTGT', { bold: true, size: 23, before: 200, after: 80 }),
      createKeyValueTable([
        ['Tên đơn vị', 'Đại học Kinh tế Thành phố Hồ Chí Minh'],
        ['Địa chỉ', '59C Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh'],
        ['Mã số thuế', '0302213615'],
      ]),
      p('Kính đề nghị Bộ phận Lễ tân khách sạn chuẩn bị chu đáo để đón tiếp giảng viên.', { italic: true, size: 22, before: 140, after: 200 }),
      createThreeSigns(
        'Người lập phiếu', data.creatorName || 'Võ Thanh Tùng',
        'Bộ phận Kế toán', data.verifierName || 'Lê Quốc Bảo',
        'Trưởng đơn vị phê duyệt', data.signatoryName || 'TS. Lê Đạt Chí'
      ),
    ]
  } else if (templateId === 'missionOrder') {
    fileName = `Cong_Lenh_Cong_Tac_${(data.lecturerName || 'GV').replace(/\s+/g, '_')}.docx`
    docChildren = [
      createAdminHeader('BỘ GIÁO DỤC VÀ ĐÀO TẠO', 'ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH', data.docNumber, cityDate),
      new Paragraph({ spacing: { before: 240, after: 80 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: 'CÔNG LỆNH CÔNG TÁC & TIẾP NHẬN GIẢNG VIÊN', font: FONT, bold: true, size: 28 }),
      ]}),
      p('(V/v tiếp nhận giảng viên quốc tế giảng dạy chương trình cử nhân song bằng UEH – Université de Rennes)', { align: AlignmentType.CENTER, italic: true, size: 21, after: 180 }),
      p('Căn cứ Biên bản ghi nhớ hợp tác (MOA) ký kết giữa Đại học Kinh tế TP. Hồ Chí Minh và Université de Rennes;', { italic: true, size: 22 }),
      p('Căn cứ Kế hoạch đào tạo và thỏa thuận giảng dạy năm học 2026–2027 chương trình cử nhân song bằng;', { italic: true, size: 22 }),
      p('Xét đề nghị của Trưởng Khoa Tài chính và Viện trưởng Viện ISB,', { italic: true, size: 22, after: 140 }),
      p('HIỆU TRƯỞNG ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH TIẾP NHẬN & PHÂN CÔNG:', { bold: true, size: 24, align: AlignmentType.CENTER, before: 100, after: 140 }),
      p(`Điều 1. Tiếp nhận và phân công công tác đối với Ông/Bà:`, { bold: true, size: 23 }),
      p(`- Họ và tên: ${data.lecturerName || '………………………………'}`, { size: 22, before: 40 }),
      p(`- Chức vụ / Đơn vị: Giảng viên Đại học Rennes, Cộng hòa Pháp`, { size: 22 }),
      p(`- Hộ chiếu số: ${data.passport || '……………'} do cơ quan có thẩm quyền của Pháp cấp`, { size: 22, after: 100 }),
      p(`Điều 2. Nhiệm vụ chuyên môn:`, { bold: true, size: 23 }),
      p(`- Giảng dạy học phần: ${data.courseName || '…………………………………………'} (${data.teachHours || 0} giờ)`, { size: 22 }),
      p(`- Khóa / Lớp phụ trách: ${data.className || 'ISB-K51-01'} (Chương trình song bằng Rennes)`, { size: 22 }),
      p(`- Thực hiện ra đề kiểm tra, chấm thi và chuyển bảng điểm chính thức theo quy định MOA.`, { size: 22, after: 100 }),
      p(`Điều 3. Thời gian và địa điểm công tác:`, { bold: true, size: 23 }),
      p(`- Thời gian: Từ ngày ${data.teachFrom || '……'} đến ngày ${data.teachTo || '……'}`, { size: 22 }),
      p(`- Địa điểm: Cơ sở B UEH (279 Nguyễn Tri Phương, Phường 5, Quận 10, TP. Hồ Chí Minh).`, { size: 22, after: 100 }),
      p(`Điều 4. Chế độ và kinh phí:`, { bold: true, size: 23 }),
      p(`- Thù lao giảng dạy và phụ cấp lưu trú chi trả theo đúng quy định tại Phụ lục tài chính MOA.`, { size: 22 }),
      p(`- Vé máy bay quốc tế và phòng khách sạn do UEH đài thọ từ nguồn kinh phí chương trình.`, { size: 22, after: 100 }),
      p(`Điều 5. Khoa Tài chính, Ban Đào tạo, Ban Kế hoạch – Tài chính và Ông/Bà có tên tại Điều 1 chịu trách nhiệm thi hành công lệnh này./.`, { bold: true, size: 23, before: 80, after: 200 }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noTableBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 45, type: WidthType.PERCENTAGE },
                margins: cellPadding,
                children: [
                  p('Nơi nhận:', { bold: true, size: 20, italic: true }),
                  p('- Như Điều 5;\n- Ban Giám hiệu (để b/c);\n- Lưu: VT, BĐH CT.', { size: 19, italic: true }),
                ]
              }),
              new TableCell({
                width: { size: 55, type: WidthType.PERCENTAGE },
                margins: cellPadding,
                children: [
                  p('TL. HIỆU TRƯỞNG', { align: AlignmentType.CENTER, bold: true, size: 22 }),
                  p('TRƯỞNG KHOA TÀI CHÍNH', { align: AlignmentType.CENTER, bold: true, size: 23 }),
                  p('(Ký, đóng dấu)', { align: AlignmentType.CENTER, italic: true, size: 19 }),
                  new Paragraph({ spacing: { before: 1400, after: 60 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: data.signatoryName || 'TS. Lê Đạt Chí', font: FONT, size: 23, bold: true })] })
                ]
              }),
            ]
          })
        ]
      })
    ]
  } else {
    // Mẫu chung / Bảng kê chi phí
    fileName = `Bieu_Mau_${templateId}.docx`
    docChildren = [
      createAdminHeader('ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH', 'KHOA TÀI CHÍNH – BAN ĐIỀU HÀNH RENNES', data.docNumber, cityDate),
      new Paragraph({ spacing: { before: 240, after: 80 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: data.title || 'VĂN BẢN HÀNH CHÍNH', font: FONT, bold: true, size: 28 }),
      ]}),
      p(data.subtitle || 'Chương trình cử nhân song bằng UEH – Université de Rennes', { align: AlignmentType.CENTER, italic: true, size: 21, after: 180 }),
      createKeyValueTable([
        ['Giảng viên', data.lecturerName || '—', true],
        ['Học phần', data.courseName || '—'],
        ['Thời gian công tác', `${data.teachFrom || '……'} – ${data.teachTo || '……'}`],
        ['Ghi chú bổ sung', data.notes || '—'],
      ]),
      createThreeSigns(
        'Người lập biểu', data.creatorName || 'Nguyễn Thu Hà',
        'Ban điều hành chương trình', data.verifierName || 'Trần Minh Anh',
        'Trưởng khoa', data.signatoryName || 'TS. Lê Đạt Chí'
      )
    ]
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4 210mm x 297mm
          margin: { top: 1134, bottom: 1134, left: 1417, right: 850 } // VN standard margins
        }
      },
      children: docChildren
    }]
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return fileName
}
