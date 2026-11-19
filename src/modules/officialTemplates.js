// Biểu mẫu chính thức dựng lại từ file mẫu gốc của Khoa (giữ bố cục & lời văn song ngữ).
//  - contractInfo : Hợp đồng thỉnh giảng (Rennes/Hợp đồng thỉnh giảng.PDF)
//  - payTable     : Bảng kê thanh toán VIE-ENG (Tài chính và Quyết toán/…/BẢNG KÊ THANH TOÁN VIE-ENG.docx)
//  - hotelReq     : Phiếu đặt phòng UEH Boutique Hotel (Tài chính và Quyết toán/…/PHIẾU ĐẶT PHÒNG UEH BOUTIQUE HOTEL.docx)
// Mỗi giá trị biến trong văn bản được bọc <span data-f="khóa"> để liên kết 2 chiều với ô nhập liệu.
import { vnWords, enWords } from './docs.js'

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const pad = (n) => String(n).padStart(2, '0')
const parseISO = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? { y: +m[1], m: +m[2], d: +m[3] } : null }
export const dmy = (s) => { const p = parseISO(s); return p ? `${pad(p.d)}/${pad(p.m)}/${p.y}` : '' }
// Thể thức NĐ 30/2020: ngày < 10 và tháng 1, 2 ghi thêm số 0
export const viLong = (s) => { const p = parseISO(s); return p ? `ngày ${p.d < 10 ? '0' + p.d : p.d} tháng ${p.m <= 2 ? '0' + p.m : p.m} năm ${p.y}` : 'ngày …… tháng …… năm ……' }
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const enLong = (s) => { const p = parseISO(s); return p ? `${MONTHS[p.m - 1]} ${p.d}, ${p.y}` : '……………' }
const addYears = (s, n) => { const p = parseISO(s); return p ? `${p.y + n}-${pad(p.m)}-${pad(p.d)}` : '' }
const ascii = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
export const enName = (s) => ascii(s).replace(/^PGS\.\s*TS\.\s*/i, 'Assoc. Prof. Dr. ').replace(/^TS\.\s*/i, 'Dr. ').replace(/^ThS\.\s*/i, 'MSc. ').replace(/^GS\.\s*/i, 'Prof. ')
export const cleanName = (s) => String(s || '').replace(/^((GS|PGS|TS|ThS|Prof|Dr)\.\s*)+/i, '').trim()
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1)
const title = (x) => x.split(' ').map((w) => (w === 'and' ? w : cap(w))).join(' ')
const num = (n) => (+n || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })
const r2 = (n) => Math.round((+n || 0) * 100) / 100

/* Giá trị biến trong văn bản */
const tf = (d, k, fmt) => {
  const raw = d[k]
  const s = fmt ? fmt(raw) : raw
  const empty = s == null || String(s).trim() === ''
  return `<span data-f="${k}"${empty ? ' class="tf-empty"' : ''}>${empty ? '……………………' : esc(s)}</span>`
}
const box = (on) => (on ? '&#9746;' : '&#9744;') // ☒ / ☐
const NB = 'border:none;padding:0;vertical-align:top'
const lineUnder = '<div style="width:38%;margin:3px auto 0;border-top:1px solid #111"></div>'

/* ======================================================================
   1. HỢP ĐỒNG THỈNH GIẢNG
   ====================================================================== */
const JOB_EN = { 'Giảng dạy': 'Teaching', 'Hướng dẫn khóa luận': 'Thesis supervision', 'Chấm thi': 'Examination grading', 'Biên soạn học liệu': 'Developing teaching materials', 'Giảng dạy & chấm thi': 'Teaching and examination grading' }

function contractDefaults(auto, ctx) {
  const lec = auto.rawLecturer || {}
  const trip = auto.rawTrip || {}
  const sign = lec.contractFrom || ctx.today
  const t = String(lec.academicTitle || '')
  return {
    docNumber: lec.contractNo || trip.contractNo || '1150/HĐTG-ĐHKT-TC',
    signDate: sign,
    // Bên A – mặc định theo mẫu gốc
    aName: 'Lê Đạt Chí',
    aTitle: 'Trưởng khoa',
    aUnit: 'KD - Khoa Tài chính',
    aOrg: 'Đại học Kinh tế Thành phố Hồ Chí Minh',
    aAddress: '64/2 đường 12, P.Cát Lái, Tp.Thủ Đức, Tp. Hồ Chí Minh',
    aPhone: '0974131177',
    aContact: 'Vũ Thị Kim Dung',
    aContactPhone: '0913075335',
    // Bên B – lấy từ hồ sơ giảng viên, phần còn thiếu để trống cho người lập điền
    bName: cleanName(lec.fullName || trip.lecturer || auto.lecturerName),
    bDob: lec.dob || '',
    bTitle: /assistant|associate|phó/i.test(t) ? 'Phó Giáo sư' : /professor|giáo sư/i.test(t) ? 'Giáo sư' : 'Giảng viên',
    bDegree: /phd|tiến sĩ|dr\b|hdr/i.test(t) || !t ? 'Tiến sĩ' : 'Thạc sĩ',
    bSpecialization: lec.specialization || '',
    bEmail: lec.email || '',
    bPhone: lec.phone || '',
    bAddress: lec.address || '',
    bBankAccount: lec.bankAccount || '',
    bBankName: lec.bankName || '',
    bBankBranch: '',
    bTaxCode: lec.taxCode || 'CHƯA CÓ MÃ SỐ THUẾ TẠI VIỆT NAM',
    bPassport: lec.passport || '',
    bPassportDate: '',
    bPassportPlace: lec.passportIssued || '',
    bYears: 0,
    // Điều khoản
    jobType: 'Giảng dạy',
    validFrom: lec.contractFrom || sign,
    validTo: lec.contractTo || addYears(sign, 1),
    payMethod: 'transfer',
    payDays: 30,
    copies: 5,
    hrTitle: 'TRƯỞNG BAN PHÁT TRIỂN TỔ CHỨC - NHÂN LỰC',
    hrTitleEn: 'Head of Human Resources and Organisation Development Department',
    hrName: '',
  }
}

const CONTRACT_FORM = [
  { title: 'Thông tin hợp đồng', fields: [
    { k: 'docNumber', label: 'Số / No hợp đồng', req: true, span: 6, ph: 'VD: 1150/HĐTG-ĐHKT-TC' },
    { k: 'signDate', label: 'Ngày ký hợp đồng', type: 'date', req: true, span: 3 },
    { k: 'jobType', label: 'Công việc thỉnh giảng', type: 'select', noEmpty: true, options: Object.keys(JOB_EN), span: 3 },
    { k: 'validFrom', label: 'Hiệu lực từ ngày', type: 'date', req: true },
    { k: 'validTo', label: 'Đến ngày', type: 'date', req: true, after: 'validFrom',
      check: (v, d) => (d.validFrom && +String(v).slice(0, 4) - +String(d.validFrom).slice(0, 4) > 5 ? 'Thời hạn hợp đồng vượt quá 5 năm' : '') },
  ] },
  { title: 'Bên A – Đại học Kinh tế TP.HCM', desc: 'Đã điền sẵn theo mẫu gốc, có thể sửa', fields: [
    { k: 'aName', label: 'Ông/Bà (đại diện)', req: true, span: 5 },
    { k: 'aTitle', label: 'Chức vụ', span: 3 },
    { k: 'aUnit', label: 'Khoa/Ban', span: 4 },
    { k: 'aOrg', label: 'Đại diện cho', span: 12 },
    { k: 'aAddress', label: 'Địa chỉ', span: 12 },
    { k: 'aPhone', label: 'Điện thoại', type: 'phone' },
    { k: 'aContact', label: 'Người liên hệ công việc', span: 5 },
    { k: 'aContactPhone', label: 'ĐT người liên hệ', type: 'phone', span: 4 },
  ] },
  { title: 'Bên B – Giảng viên thỉnh giảng', desc: 'Tự điền từ hồ sơ giảng viên', fields: [
    { k: 'bName', label: 'Ông/Bà (họ tên theo hộ chiếu)', req: true, span: 6 },
    { k: 'bDob', label: 'Ngày sinh', type: 'date' },
    { k: 'bYears', label: 'Số năm đã thỉnh giảng tại UEH', type: 'number', max: 60, int: true, suffix: 'năm' },
    { k: 'bTitle', label: 'Chức danh', type: 'select', options: ['Giáo sư', 'Phó Giáo sư', 'Giảng viên cao cấp', 'Giảng viên chính', 'Giảng viên'] },
    { k: 'bDegree', label: 'Học vị', type: 'select', options: ['Tiến sĩ', 'Thạc sĩ', 'Cử nhân'] },
    { k: 'bSpecialization', label: 'Chuyên môn nghiệp vụ', span: 12 },
    { k: 'bEmail', label: 'E-mail', type: 'email', span: 6 },
    { k: 'bPhone', label: 'Điện thoại', type: 'phone', span: 6, ph: 'VD: +33 6 79 59 54 55' },
    { k: 'bAddress', label: 'Địa chỉ liên lạc', span: 12 },
  ] },
  { title: 'Bên B – Tài khoản, thuế & giấy tờ', fields: [
    { k: 'bBankAccount', label: 'Số tài khoản ngân hàng (IBAN)', span: 6, ph: 'VD: FR76 1007 1350 …' },
    { k: 'bBankName', label: 'Tại Ngân hàng', span: 6 },
    { k: 'bBankBranch', label: 'Chi nhánh / BIC', span: 6, ph: 'VD: BIC: TRPUFRP1' },
    { k: 'bTaxCode', label: 'Mã số thuế TNCN', span: 6 },
    { k: 'bPassport', label: 'Số Passport / CCCD', span: 4 },
    { k: 'bPassportDate', label: 'Ngày cấp', type: 'date', span: 3 },
    { k: 'bPassportPlace', label: 'Nơi cấp', span: 5 },
  ] },
  { title: 'Thanh toán, số bản & ký', fields: [
    { k: 'payMethod', label: 'Hình thức thanh toán', type: 'radio', options: [{ value: 'transfer', label: 'Chuyển khoản' }, { value: 'cash', label: 'Tiền mặt' }], span: 6 },
    { k: 'payDays', label: 'Thời hạn thanh toán', type: 'number', min: 1, max: 365, int: true, suffix: 'ngày' },
    { k: 'copies', label: 'Số bản hợp đồng', type: 'number', min: 2, max: 20, int: true, suffix: 'bản' },
    { k: 'hrTitle', label: 'Chức vụ người ký (TL. Giám đốc)', span: 8 },
    { k: 'hrName', label: 'Họ tên người ký', span: 4, ph: 'Để trống nếu ký tay' },
  ] },
]

function renderContract(d) {
  const vi = (t) => `<p style="margin:0;text-align:justify;text-indent:1cm">${t}</p>`
  const en = (t) => `<p style="margin:0 0 6px;text-align:justify;text-indent:1cm;font-style:italic">${t}</p>`
  const li = (t, it) => `<li style="margin:0 0 2px;text-align:justify${it ? ';font-style:italic' : ''}">${t}</li>`
  const row = (label, val) => `<div style="margin:2px 0">${label}: <b>${val}</b></div>`
  const jobEn = JOB_EN[d.jobType] || d.jobType
  const copies = Math.max(2, +d.copies || 5)
  const rest = copies - 2
  const transfer = d.payMethod !== 'cash'
  return `
<div style="font-size:13pt;line-height:1.42">
<table style="width:100%;border-collapse:collapse;font-size:12pt;line-height:1.3;margin-bottom:10px"><tr>
  <td style="${NB};width:44%;text-align:center">BỘ GIÁO DỤC VÀ ĐÀO TẠO<br><i style="font-size:10pt">MINISTRY OF EDUCATION AND TRAINING</i><br><b>ĐẠI HỌC KINH TẾ<br>THÀNH PHỐ HỒ CHÍ MINH</b><br><i style="font-size:10pt">UNIVERSITY OF ECONOMICS HCMC</i>${lineUnder}
    <div style="margin-top:8px">Số/<i>No</i>: <b>${tf(d, 'docNumber')}</b></div></td>
  <td style="${NB};width:56%;text-align:center"><b>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><i style="font-size:10pt">THE SOCIALIST REPUBLIC OF VIETNAM</i><br><b>Độc lập - Tự do - Hạnh phúc</b><br><i style="font-size:11pt">Independence - Freedom - Happiness</i>${lineUnder}</td>
</tr></table>
<div style="text-align:center;margin:18px 0 12px"><b style="font-size:14pt">HỢP ĐỒNG GIẢNG DẠY /<br>VISITING LECTURER AGREEMENT</b><br><i>(Theo chế độ thỉnh giảng)</i></div>
${vi('Căn cứ Bộ luật Dân sự nước Cộng hòa xã hội chủ nghĩa Việt Nam;')}${en('Pursuant to the Civil Code 2015 and relevant laws of Vietnam;')}
${vi('Căn cứ Bộ luật Lao động nước Cộng hòa xã hội chủ nghĩa Việt Nam;')}${en('Pursuant to the Labor Code of the Socialist Republic of Vietnam;')}
${vi('Căn cứ Luật Giáo dục đại học số 125/2025/QH15 ngày 10 tháng 12 năm 2025 và Luật sửa đổi, bổ sung một số điều của Luật Giáo dục số 123/2025/QH15 ngày 10 tháng 12 năm 2025;')}
${en('Pursuant to the Law on Higher Education dated December 10, 2025 and the Law amending and supplementing a number of articles of the Law on Higher Education dated December 10, 2025;')}
${vi('Căn cứ Quy định về chế độ thỉnh giảng ban hành theo Thông tư số 44/2011/TT-BGDĐT ngày 10/10/2011 của Bộ trưởng Bộ Giáo dục và Đào tạo, Thông tư số 11/2013/TT-BGDĐT ngày 29/3/2013 và Quy định về chế độ thỉnh giảng của Trường Đại học Kinh tế TP. Hồ Chí Minh số 2434/QĐ-ĐHKT-TCHC ngày 17 tháng 10/2011,')}
${en('Pursuant to the Regulation on visiting lecturers promulgated under Circular No. 44/2011/TT-BGDDT dated October 10, 2011 of the Minister of Education and Training, Circular No. 11/2013/TT-BGDDT dated March 29, 2013 and Regulations on visiting lecturers of University of Economics Ho Chi Minh City No. 2434/QD-ĐHKT-TCHC dated October 17, 2011,')}
${vi(`Hôm nay, <span data-f="signDate">${viLong(d.signDate)}</span>, tại Đại học Kinh tế Thành phố Hồ Chí Minh, chúng tôi gồm:`)}
${en(`Today <span data-f="signDate">${enLong(d.signDate)}</span>, at the University of Economics Ho Chi Minh City, we are:`)}
<div style="margin-top:8px"><b>Bên A</b>: Ông/Bà/<i>Mr/Mrs</i>: <b>${tf(d, 'aName')}</b></div>
<!--PAGE-->
<div style="padding-left:1cm">
<div>Chức vụ/<i>Title</i>: <b>${tf(d, 'aTitle')}</b>&emsp;&emsp;&emsp;Khoa/Ban/<i>Unit/ Faculty</i>: <b>${tf(d, 'aUnit')}</b></div>
<div>Đại diện cho: <b>${tf(d, 'aOrg')}</b></div>
<div><i>Representing the University of Economics Ho Chi Minh City (UEH in abbreviation)</i></div>
${row('Địa chỉ/<i>Address</i>', tf(d, 'aAddress'))}
${row('Điện thoại/<i>Phone number</i>', tf(d, 'aPhone'))}
${row('Người liên hệ công việc/ <i>Point of Contact</i>', tf(d, 'aContact'))}
${row('Điện thoại/ <i>Point of Contact’s Phone Number</i>', tf(d, 'aContactPhone'))}
</div>
<div style="margin-top:10px"><b>Bên B<sup>1</sup></b>: Ông/Bà/<i>Mr/Mrs</i>: <b>${tf(d, 'bName')}</b></div>
<div style="padding-left:1cm">
${row('Sinh ngày/<i>Date of birth</i>', tf(d, 'bDob', dmy))}
<div>Chức danh/ <i>Professional Title</i>: <b>${tf(d, 'bTitle')}</b>&emsp;&emsp;&emsp;Học vị / <i>Academic Degree</i>: <b>${tf(d, 'bDegree')}</b></div>
${row('Chuyên môn nghiệp vụ / <i>Specialization</i>', tf(d, 'bSpecialization'))}
${row('E-mail', tf(d, 'bEmail'))}
${row('Điện thoại/<i>Phone Number</i>', tf(d, 'bPhone'))}
${row('Địa chỉ liên lạc / <i>Address</i>', tf(d, 'bAddress'))}
${row('Số tài khoản ngân hàng / <i>Bank Account number</i>', tf(d, 'bBankAccount'))}
${row('Tại Ngân hàng/<i>Bank</i>', tf(d, 'bBankName'))}
${row('Chi nhánh/ <i>Branch Name</i>', tf(d, 'bBankBranch'))}
${row('Mã số thuế thu nhập cá nhân / <i>Personal income tax code</i>', tf(d, 'bTaxCode'))}
${row('Số CMND/CCCD/ Passport/<i>ID No</i>', tf(d, 'bPassport'))}
<div>Ngày cấp/<i>Issue date</i>: <b>${tf(d, 'bPassportDate', dmy)}</b>&emsp;&emsp;&emsp;Nơi cấp/ <i>Issuing authority</i>: <b>${tf(d, 'bPassportPlace')}</b></div>
<div>Số năm đã tham gia thỉnh giảng tại Đại học Kinh tế Thành phố Hồ Chí Minh / <i>Years of Experience as a Visiting Lecturer at UEH</i>: <b>${tf(d, 'bYears')}</b> (năm/<i>year(s)</i>)</div>
</div>
<div style="margin:12px 0 0">${vi('Sau khi bàn bạc, hai bên thỏa thuận ký Hợp đồng giảng dạy theo chế độ thỉnh giảng và cam kết làm đúng những điều khoản sau đây:')}${en('After discussion, the two parties agree to sign the visiting lecturer Agreement and commit to abide by the following provisions:')}</div>
<p style="margin:10px 0 4px"><b>Điều 1. Nội dung hợp đồng/<i>Article 1: Subject of the Agreement</i></b></p>
${vi(`Bên A hợp đồng với bên B để thực hiện những công việc thỉnh giảng <b>${tf(d, 'jobType')}</b> theo khoản 1 điều 2 trong Quy định về chế độ thỉnh giảng của Đại học Kinh tế Thành phố Hồ Chí Minh. Khối lượng công việc cụ thể sẽ được thể hiện trong từng phụ lục của hợp đồng.`)}
${vi(`Thời hạn hợp đồng từ ngày <b><span data-f="validFrom">${dmy(d.validFrom) || '……/……/……'}</span></b> đến ngày <b><span data-f="validTo">${dmy(d.validTo) || '……/……/……'}</span></b>`)}
${en(`Party A agrees on Party B’s performance of visiting lecturer jobs for <span data-f="jobType">${esc(jobEn)}</span> according to Article 4 of the Regulations on visiting lecturers of UEH. Specific workload will be shown in each appendix of the contract.`)}
${en(`The Agreement is valid from <span data-f="validFrom">${enLong(d.validFrom)}</span> to <span data-f="validTo">${enLong(d.validTo)}</span>`)}
<div style="font-size:10.5pt;border-top:1px solid #999;width:40%;margin-top:14px;padding-top:2px"><sup>1</sup> Bên B phải điền đầy đủ thông tin trong mẫu hợp đồng.</div>
<!--PAGE-->
<p style="margin:0 0 4px"><b>Điều 2. Trách nhiệm của các bên/<i>Article 2: Obligations of the two parties</i></b></p>
<p style="margin:2px 0"><b>Bên A:</b></p>
<ul style="margin:0 0 6px;padding-left:1.4cm">
${li('Khi có vụ việc phát sinh, bên A sẽ thông báo và trao đổi với bên B để thống nhất về nội dung, cách thức và thời gian thực hiện;')}
${li('Có trách nhiệm đôn đốc các bên thực hiện đúng tiến độ, lịch trình và yêu cầu của vụ việc theo đúng thỏa thuận của từng vụ việc;')}
${li('Bảo đảm các điều kiện thực hiện hợp đồng và thực hiện đầy đủ những điều đã cam kết trong Hợp đồng và các phụ lục đính kèm;')}
${li('Thanh toán đầy đủ, đúng thời hạn các chế độ và quyền lợi cho bên B theo từng vụ việc được thể hiện trong từng phụ lục của hợp đồng.')}
</ul>
<p style="margin:2px 0"><b><i>Party A shall:</i></b></p>
<ul style="margin:0 0 6px;padding-left:1.4cm">
${li('Notify and discuss with Party B in order to reach a consensus on contents, methods and time of solution if any problem arises;', 1)}
${li('Take responsibility for urging both parties to ensure the process, schedule and requirements in compliance with the Agreement;', 1)}
${li('Secure the requirements for implementing the Agreement and fulfill the commitments stated in the Agreement and the attached appendix; and', 1)}
${li('Make adequate and timely payments to Party B in accordance with each job indicated in the Agreement Appendix.', 1)}
</ul>
<p style="margin:2px 0"><b>Bên B:</b></p>
<ul style="margin:0 0 6px;padding-left:1.4cm">
${li('Hoàn thành khối lượng công việc theo thỏa thuận ký kết trong các phụ lục của hợp đồng.')}
${li('Chấp hành nội quy, quy định của Đại học Kinh tế Thành phố Hồ Chí Minh, quy chế của Bộ Giáo dục và Đào tạo;')}
</ul>
<p style="margin:2px 0"><b><i>Party B shall:</i></b></p>
<ul style="margin:0 0 6px;padding-left:1.4cm">
${li('Finish the job in compliance with the commitments stated in the Agreement Appendix; and', 1)}
${li('Respect the relevant regulations by UEH and those by the Ministry of Education and Training.', 1)}
</ul>
<p style="margin:10px 0 4px"><b>Điều 3. Phương thức thanh toán/<i>Article 3: Payment method</i></b></p>
<ul style="margin:0 0 4px;padding-left:1.4cm">
${li('Việc thanh toán và đơn giá thanh toán sẽ được áp dụng cho từng công việc được thể hiện trong các phụ lục của hợp đồng;')}
${li('Đơn giá thanh toán theo Quy chế chi tiêu nội bộ của Đại học Kinh tế Thành phố Hồ Chí Minh;')}
${li('Đại học Kinh tế Thành phố Hồ Chí Minh sẽ khấu trừ thuế thu nhập cá nhân của bên B đúng theo Luật Thuế thu nhập cá nhân;')}
${li(`Hình thức thanh toán: <span data-f="payMethod">${box(!transfer)} Tiền mặt &nbsp;&nbsp;&nbsp; ${box(transfer)} Chuyển khoản</span>`)}
${li(`Thời hạn thanh toán trong vòng <b>${tf(d, 'payDays')}</b> ngày sau khi kết thúc vụ việc theo từng phụ lục và thực tế thực hiện.`)}
</ul>
<ul style="margin:0 0 4px;padding-left:1.4cm">
${li('Remuneration and pay rate will be applied to each job indicated in the Appendix to the Agreement;', 1)}
${li('UEH will deduct the personal income tax from payments to Party B in compliance with the Law on Personal Income Tax;', 1)}
${li(`Mode of payment: <span data-f="payMethod">${box(!transfer)} Cash &nbsp;&nbsp;&nbsp; ${box(transfer)} Bank transfer</span>`, 1)}
${li(`Payments must be made within <span data-f="payDays">${esc(d.payDays || 30)}</span> days from the completion of job in compliance with the Appendix and actual performance.`, 1)}
</ul>
<!--PAGE-->
<p style="margin:0 0 4px"><b>Điều 4. Những trách nhiệm và quyền lợi khác / <i>Article 4: Other obligations and rights</i></b></p>
${vi('Ngoài trách nhiệm của các bên theo điều 2 của hợp đồng, các bên phải thực hiện đầy đủ các quyền và nghĩa vụ được quy định tại Quy định về chế độ thỉnh giảng của Đại học Kinh tế Thành phố Hồ Chí Minh.')}
${vi('Bên B được hưởng các quyền lợi đối với giảng viên thỉnh giảng theo quy định của Đại học Kinh tế Thành phố Hồ Chí Minh.')}
${en('In addition to the obligations pursuant to Article 2 of the Agreement, both parties shall fulfill adequate rights and obligations stated in the regulations on visiting lecturer jobs by UEH.')}
${en('Party B has full rights of a visiting lecturer as regulated by UEH.')}
<p style="margin:10px 0 4px"><b>Điều 5. Điều khoản thi hành/ <i>Article 5: General Provisions</i></b></p>
${vi('Hai bên có trách nhiệm thực hiện đầy đủ các điều khoản của hợp đồng và các thỏa thuận khác theo phụ lục kèm theo hợp đồng, trong quá trình thực hiện nếu có vấn đề phát sinh liên quan đến hợp đồng, hai bên cùng bàn bạc thống nhất giải quyết;')}
${vi(`Hợp đồng có hiệu lực kể từ ngày ký và lập thành <span data-f="copies"><b>${copies} (${vnWords(copies)})</b></span> bản có giá trị ngang nhau, bên A giữ 1 (một) bản, bên B giữ 1 (một) bản, ${rest} (${vnWords(rest)}) bản nộp cho Ban Phát triển Tổ chức - Nhân lực, Ban Tài chính - Kế hoạch đầu tư và Ban Đào tạo./-`)}
${en('Both parties are responsible for implementing all articles and clauses of the Agreement and other commitments indicated in the Appendix attached to the Agreement. In case of problems arising from the Agreement implementation, both parties shall discuss to arrive at a shared solution.')}
${en(`The Agreement shall be effective since the date of signature and made in <span data-f="copies">${copies} (${enWords(copies)})</span> copies of equal legal validity. Party A keeps one copy, Party B keeps one copy, and the rest ${enWords(rest)} copies are submitted to the Human Resources and Organisation Development Department, Department of Finance and Investment Planning, and Department of Training./-`)}
<table style="width:100%;border-collapse:collapse;margin-top:18px;text-align:center;page-break-inside:avoid"><tr>
  <td style="${NB};width:50%"><b>BÊN B/ <i>PARTY B</i></b><div style="height:90px"></div><b>${tf(d, 'bName')}</b></td>
  <td style="${NB};width:50%"><b>BÊN A/ <i>PARTY A</i></b><div style="height:90px"></div><b>${tf(d, 'aName')}</b></td>
</tr></table>
<div style="text-align:center;margin-top:22px;page-break-inside:avoid">
  <i>Thành phố Hồ Chí Minh/Ho Chi Minh City, <span data-f="signDate">${viLong(d.signDate)}</span></i><br>
  <b>TL. GIÁM ĐỐC</b><br><i>By order of UEH President</i><br>
  <b>${tf(d, 'hrTitle')}</b><br><i>${esc(d.hrTitleEn || '')}</i>
  <div style="height:90px"></div><b>${d.hrName ? tf(d, 'hrName') : '<span data-f="hrName">……………………</span>'}</b>
</div>
</div>`
}

/* ======================================================================
   2. BẢNG KÊ THANH TOÁN (VIE – ENG)
   ====================================================================== */
const BASIS_VI = [
  'Căn cứ Kế hoạch số 2277/KH-ĐHKT-NCPTGKTC ngày 07 tháng 10 năm 2025 của Giám đốc Đại học Kinh tế Thành phố Hồ Chí Minh về việc triển khai Đề án chính sách khuyến khích phát triển chương trình liên kết đào tạo quốc tế tại Đại học Kinh tế Thành phố Hồ Chí Minh giai đoạn 2026-2030;',
  'Căn cứ Quyết định số 510/QĐ-ĐHKT-NCPTGKTC ngày 25 tháng 02 năm 2026 của Giám đốc Đại học Kinh tế Thành phố Hồ Chí Minh về việc đồng ý cho phép thực hiện chương trình liên kết đào tạo cử nhân song bằng quốc tế ngành Tài chính - Ngân hàng giữa Khoa Tài chính, Trường Kinh doanh thuộc Đại học Kinh tế Thành phố Hồ Chí Minh và Đại học Rennes, Cộng hòa Pháp;',
  'Căn cứ tờ trình số 125/TTr-KD-TC ngày 17 tháng 4 năm 2026 của Giám đốc Đại học Kinh tế Thành phố Hồ Chí Minh V/v phê duyệt chủ trương triển khai và thu học phí tăng thêm đối với sinh viên khóa 50 và 51 đăng ký tham gia chương trình liên kết đào tạo cử nhân song bằng quốc tế ngành Tài chính - Ngân hàng giữa Khoa Tài chính, Trường Kinh doanh, Đại học Kinh tế TP. Hồ Chí Minh và Đại học Rennes, Cộng hòa Pháp;',
].join('\n')
const BASIS_EN = [
  'Pursuant to Plan No. 2277/KH-ĐHKT-NCPTGKTC dated October 07th, 2025 of the Director of the University of Economics Ho Chi Minh City on the implementation of the Proposal on policies to promote the development of international joint training programs for the period 2026 - 2030;',
  'Pursuant to Decision No. 510/QĐ-ĐHKT-NCPTGKTC dated February 25th, 2026 of the Director of the University of Economics Ho Chi Minh City approving the implementation of the International Dual-Degree Bachelor\'s Program in Finance - Banking between the School of Finance, College of Business, University of Economics Ho Chi Minh City, and the University of Rennes, French Republic;',
  'Pursuant to Report No. 125/TTr-KD-TC dated April 17th, 2026 of the School of Finance regarding the approval of the policy for implementation plan and collection of additional tuition fees for Cohort 50 and 51 students registered in the International Dual Degree Bachelor\'s Program in Finance - Banking between the School of Finance, College of Business, University of Economics Ho Chi Minh City and the University of Rennes, French Republic;',
].join('\n')

export const payLine = (r) => {
  const amount = r2((+r.qty || 0) * (+r.price || 0))
  const tax = r2(amount * (+r.tax || 0) / 100)
  return { amount, tax, net: r2(amount - tax) }
}

function payDefaults(auto, ctx) {
  const trip = auto.rawTrip || {}
  const lec = auto.rawLecturer || {}
  return {
    docDate: ctx.today,
    lecturerName: cleanName(trip.lecturer || lec.fullName || auto.lecturerName),
    basisVi: BASIS_VI,
    basisEn: BASIS_EN,
    estimateNo: 'DC2604-029',
    contractNo: trip.contractNo || lec.contractNo || '',
    currency: 'Euro',
    items: [
      { desc: 'Sinh hoạt phí', descEn: 'Daily allowance', unit: 'Ngày', unitEn: 'Day', qty: +trip.perDiemDays || 7, price: +trip.perDiemRate || 150, tax: +trip.taxRate || 20 },
    ],
    preparerName: 'Nguyễn Văn Thiện Tâm',
    preparerNameEn: '',
    headName: 'TS. LÊ ĐẠT CHÍ',
    headNameEn: '',
  }
}

const PAY_FORM = [
  { title: 'Thông tin bảng kê', fields: [
    { k: 'docDate', label: 'Ngày lập bảng kê', type: 'date', req: true },
    { k: 'lecturerName', label: 'Người nhận (ký nhận)', req: true, span: 5 },
    { k: 'currency', label: 'Đơn vị tính', type: 'select', noEmpty: true, options: ['Euro', 'VNĐ'] },
    { k: 'estimateNo', label: 'Căn cứ dự toán chi số', span: 6, ph: 'VD: DC2604-029' },
    { k: 'contractNo', label: 'Căn cứ hợp đồng giảng dạy số', span: 6, ph: 'VD: 1150/HĐTG-ĐHKT-TC' },
  ] },
  { title: 'Nội dung thanh toán', desc: 'Thành tiền, thuế TNCN và thực nhận tự tính', fields: [
    { k: 'items', label: 'Các khoản', type: 'rows', cards: true, addLabel: 'Thêm khoản', columns: [
      { k: 'desc', label: 'Nội dung', ph: 'Sinh hoạt phí', def: '', span: 6, req: true },
      { k: 'descEn', label: 'Description (EN)', ph: 'Daily allowance', def: '', span: 6 },
      { k: 'unit', label: 'ĐVT', ph: 'Ngày', def: 'Ngày', span: 2 },
      { k: 'unitEn', label: 'Unit', ph: 'Day', def: 'Day', span: 2 },
      { k: 'qty', label: 'Số lượng', type: 'number', def: 1, span: 2, req: true, check: (v) => (+v > 0 ? '' : 'Phải lớn hơn 0') },
      { k: 'price', label: 'Đơn giá', type: 'number', def: 0, span: 2, req: true, check: (v) => (+v > 0 ? '' : 'Phải lớn hơn 0') },
      { k: 'tax', label: 'Thuế TNCN %', type: 'number', def: 20, max: 100, span: 2 },
    ], total: { label: 'Thực nhận', span: 2, fn: (r) => num(payLine(r).net) } },
  ] },
  { title: 'Căn cứ pháp lý', desc: 'Mỗi dòng là một căn cứ', fields: [
    { k: 'basisVi', label: 'Căn cứ (tiếng Việt)', type: 'long', rows: 5 },
    { k: 'basisEn', label: 'Pursuant to (English)', type: 'long', rows: 5 },
  ] },
  { title: 'Ký duyệt', fields: [
    { k: 'preparerName', label: 'Người lập bảng', span: 6 },
    { k: 'preparerNameEn', label: 'Prepared by (EN)', span: 6, ph: 'Để trống: tự bỏ dấu' },
    { k: 'headName', label: 'Lãnh đạo Khoa Tài chính', span: 6 },
    { k: 'headNameEn', label: 'School of Finance (EN)', span: 6, ph: 'Để trống: tự chuyển TS. → Dr.' },
  ] },
]

function renderPayTable(d) {
  const items = Array.isArray(d.items) ? d.items : []
  const lines = items.map((r) => ({ ...r, ...payLine(r) }))
  const sum = (k) => r2(lines.reduce((a, x) => a + x[k], 0))
  const tot = { amount: sum('amount'), tax: sum('tax'), net: sum('net') }
  const isEur = d.currency !== 'VNĐ'
  const whole = Math.floor(tot.net)
  const cents = Math.round((tot.net - whole) * 100)
  const wordsVi = cap(vnWords(whole)) + (isEur ? ' Euro' + (cents ? ' và ' + vnWords(cents) + ' cent' : '') : ' đồng') + '.'
  const wordsEn = (isEur ? 'Euro ' : 'Vietnamese Dong ') + title(enWords(whole)) + (cents ? ' and ' + title(enWords(cents)) + ' Cents' : '') + ' Only.'
  const prepEn = d.preparerNameEn || enName(d.preparerName)
  const headEn = d.headNameEn || enName(d.headName).replace(/^Dr\.\s*/, 'Dr. ')
  const th = 'border:1px solid #222;padding:5px 4px;text-align:center;font-weight:bold;vertical-align:middle'
  const td = 'border:1px solid #222;padding:5px 6px;vertical-align:middle'
  const tdn = td + ';text-align:right;white-space:nowrap'
  const p = (t) => `<p style="margin:0 0 4px;text-align:justify;text-indent:1cm">${t}</p>`

  const page = (L) => {
    const vi = L === 'vi'
    const head = vi
      ? `<td style="${NB};width:42%;text-align:center">ĐẠI HỌC KINH TẾ<br>THÀNH PHỐ HỒ CHÍ MINH<br><b>KHOA TÀI CHÍNH</b>${lineUnder}</td>
         <td style="${NB};width:58%;text-align:center"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><b>Độc lập - Tự do - Hạnh phúc</b>${lineUnder}<div style="margin-top:8px"><i>Thành phố Hồ Chí Minh, <span data-f="docDate">${viLong(d.docDate)}</span></i></div></td>`
      : `<td style="${NB};width:42%;text-align:center">UNIVERSITY OF ECONOMICS HCMC<br><b>SCHOOL OF FINANCE</b>${lineUnder}</td>
         <td style="${NB};width:58%;text-align:center"><b>SOCIALIST REPUBLIC OF VIETNAM</b><br><b>Independence – Freedom - Happiness</b>${lineUnder}<div style="margin-top:8px"><i>Ho Chi Minh City, <span data-f="docDate">${enLong(d.docDate)}</span></i></div></td>`
    const basis = String((vi ? d.basisVi : d.basisEn) || '').split('\n').map((x) => x.trim()).filter(Boolean)
    const cols = vi
      ? ['STT', 'Nội dung', 'ĐVT', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Thuế TNCN', 'Thực nhận', 'Ký nhận']
      : ['No', 'Description', 'Unit', 'Quantity', 'Unit price', 'Amount', 'Personal income tax', 'Net amount', 'Signature']
    const body = lines.map((r, i) => `<tr>
        <td style="${td};text-align:center">${i + 1}</td>
        <td style="${td}"><span data-f="items">${esc(vi ? r.desc : r.descEn || r.desc)}</span></td>
        <td style="${td};text-align:center">${esc(vi ? r.unit : r.unitEn || r.unit)}</td>
        <td style="${tdn};text-align:center">${num(r.qty)}</td>
        <td style="${tdn}">${num(r.price)}</td>
        <td style="${tdn}">${num(r.amount)}</td>
        <td style="${tdn}">${num(r.tax)}</td>
        <td style="${tdn}">${num(r.net)}</td>
        ${i === 0 ? `<td style="${td};text-align:center;vertical-align:bottom;font-size:10pt;font-style:italic" rowspan="${lines.length + 1}"><span data-f="lecturerName">${esc(d.lecturerName || '')}</span></td>` : ''}
      </tr>`).join('')
    return `
<div style="font-size:13pt;line-height:1.4">
<table style="width:100%;border-collapse:collapse;font-size:12.5pt;line-height:1.3"><tr>${head}</tr></table>
<div style="text-align:center;font-weight:bold;font-size:14pt;margin:22px 0 12px">${vi ? 'BẢNG KÊ THANH TOÁN' : 'PAYMENT STATEMENT'}</div>
<div data-f="${vi ? 'basisVi' : 'basisEn'}">${basis.map((x) => p(esc(x))).join('')}</div>
${p(vi ? `Căn cứ dự toán chi số ${tf(d, 'estimateNo')};` : `Pursuant to the expenditure estimate No. ${tf(d, 'estimateNo')};`)}
${p(vi ? `Căn cứ hợp đồng giảng dạy số ${tf(d, 'contractNo')}` : `Pursuant to the Teaching Agreement No. ${tf(d, 'contractNo')}`)}
<div style="text-align:right;font-style:italic;margin:6px 0 4px">${vi ? 'Đơn vị tính' : 'Unit'}: <span data-f="currency">${esc(d.currency || 'Euro')}</span></div>
<table style="width:100%;border-collapse:collapse;font-size:12pt">
  <tr>${cols.map((c, i) => `<th style="${th}${i === 1 ? ';width:24%' : ''}${i === 8 ? ';width:13%' : ''}">${c}</th>`).join('')}</tr>
  ${body || `<tr><td colspan="9" style="${td};text-align:center;color:#999" data-f="items">${vi ? '(chưa có khoản thanh toán)' : '(no items)'}</td></tr>`}
  <tr style="font-weight:bold">
    <td style="${td}"></td><td style="${td};text-align:center">${vi ? 'Tổng  cộng' : 'Total'}</td><td style="${td}"></td><td style="${td}"></td><td style="${td}"></td>
    <td style="${tdn}">${num(tot.amount)}</td><td style="${tdn}">${num(tot.tax)}</td><td style="${tdn}">${num(tot.net)}</td>
    ${lines.length ? '' : `<td style="${td}"></td>`}
  </tr>
</table>
<p style="margin:8px 0"><i>${vi ? 'Số tiền bằng chữ' : 'Amount in words'}</i>: <b data-f="items">${esc(vi ? wordsVi : wordsEn)}</b></p>
<table style="width:100%;border-collapse:collapse;margin-top:16px;text-align:center;page-break-inside:avoid"><tr>
  <td style="${NB};width:50%"><b>${vi ? 'LẬP BẢNG' : 'PREPARED BY'}</b>${vi ? '' : '<br><i>(signature)</i>'}<div style="height:80px"></div><b>${vi ? tf(d, 'preparerName') : `<span data-f="preparerNameEn">${esc(prepEn)}</span>`}</b></td>
  <td style="${NB};width:50%"><b>${vi ? 'KHOA TÀI CHÍNH' : 'SCHOOL OF FINANCE'}</b>${vi ? '' : '<br><i>(signature)</i>'}<div style="height:80px"></div><b>${vi ? tf(d, 'headName') : `<span data-f="headNameEn">${esc(headEn)}</span>`}</b></td>
</tr></table>
</div>`
  }
  return page('vi') + '\n<!--NEWPAGE-->\n' + page('en')
}

/* ======================================================================
   3. PHIẾU ĐẶT PHÒNG UEH BOUTIQUE HOTEL
   ====================================================================== */
function hotelDefaults(auto, ctx) {
  const trip = auto.rawTrip || {}
  const lec = auto.rawLecturer || {}
  const name = cleanName(trip.lecturer || lec.fullName || auto.lecturerName)
  return {
    department: 'Khoa Tài Chính',
    purpose: 'giảng viên nước ngoài giảng dạy tại UEH',
    basis: 'Căn cứ mục b khoản 3.2.2 của đề án số 2272/ĐHKT-NCPTGKTC ngày 06 tháng 10 năm 2025 và Quyết định số 510/QĐ-ĐHKT-NCPTGKTC ngày 25 tháng 02 năm 2026.',
    budget: '',
    guests: 1,
    rooms: 1,
    roomNote: 'triple (lầu 3)',
    checkIn: trip.checkIn || '',
    checkOut: trip.checkOut || '',
    service: 'room',
    contactName: 'Hoàng Thị Phương Anh',
    contactPhone: '0973.607.230',
    docDate: ctx.today,
    headName: 'TS. Lê Đạt Chí',
    officeName: 'Đặng Thị Ngọc Hưng',
    guestList: [{ name }],
  }
}
const nights = (d) => {
  const a = parseISO(d.checkIn), b = parseISO(d.checkOut)
  if (!a || !b) return ''
  const n = Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 864e5)
  return n > 0 ? `${n} đêm` : ''
}

const HOTEL_FORM = [
  { title: 'Đơn vị & căn cứ', fields: [
    { k: 'department', label: 'Đơn vị', req: true, span: 5 },
    { k: 'purpose', label: 'Mục đích lưu trú', span: 7 },
    { k: 'basis', label: 'Kế hoạch / Tờ trình / Hợp đồng', type: 'long', rows: 3 },
    { k: 'budget', label: 'Dự toán kinh phí (nếu có)', span: 12, ph: 'VD: DC2604-029' },
  ] },
  { title: 'Phòng & thời gian lưu trú', fields: [
    { k: 'guests', label: 'Số lượng khách', type: 'number', min: 1, max: 50, int: true, req: true, suffix: 'khách', help: 'Khớp với danh sách khách bên dưới',
      check: (v, d) => { const n = (d.guestList || []).filter((g) => (g.name || '').trim()).length; return n && +v !== n ? `Khác danh sách khách (${n} người)` : '' } },
    { k: 'rooms', label: 'Số lượng phòng', type: 'number', min: 1, max: 50, int: true, req: true, suffix: 'phòng' },
    { k: 'roomNote', label: 'Loại phòng / tầng', span: 6, ph: 'VD: triple (lầu 3)' },
    { k: 'checkIn', label: 'Ngày đến (Check-in)', type: 'date', req: true, span: 4 },
    { k: 'checkOut', label: 'Ngày đi (Check-out)', type: 'date', req: true, span: 4, after: 'checkIn', hintFn: nights },
    { k: 'docDate', label: 'Ngày lập phiếu', type: 'date', span: 4 },
    { k: 'service', label: 'Nội dung dịch vụ (chọn 1)', type: 'radio', span: 12, options: [{ value: 'full', label: 'Toàn bộ dịch vụ (phòng, minibar, giặt ủi…)' }, { value: 'room', label: 'Phòng ở (Room only)' }] },
  ] },
  { title: 'Danh sách khách lưu trú', desc: 'In ở trang 2 của phiếu', fields: [
    { k: 'guestList', label: 'Khách', type: 'rows', addLabel: 'Thêm khách', columns: [{ k: 'name', label: 'Họ và tên / Full name', ph: 'VD: Christophe Andre TAVERA', def: '', req: true }] },
  ] },
  { title: 'Liên hệ & ký duyệt', fields: [
    { k: 'contactName', label: 'Người liên hệ', span: 6 },
    { k: 'contactPhone', label: 'Điện thoại', type: 'phone', span: 6 },
    { k: 'headName', label: 'Lãnh đạo đơn vị', span: 6 },
    { k: 'officeName', label: 'Văn phòng Đại học', span: 6 },
  ] },
]

function renderHotel(d) {
  const row = (vi, en, val) => `<div style="margin:6px 0">${vi}/<i>${en}</i>: ${val}</div>`
  const pad2 = (n) => (n === '' || n == null ? '' : String(n).padStart(2, '0'))
  const full = d.service === 'full'
  const guests = (Array.isArray(d.guestList) ? d.guestList : []).filter((g) => (g.name || '').trim())
  const td = 'border:1px solid #222;padding:6px 8px'
  return `
<div style="font-size:13pt;line-height:1.45">
<div style="text-align:center;margin:6px 0 18px"><b style="font-size:14pt">PHIẾU ĐẶT PHÒNG UEH BOUTIQUE HOTEL</b><br><i>UEH Boutique Hotel Reservation Form</i></div>
${row('Đơn vị', 'Department', `<b>${tf(d, 'department')}</b>`)}
${row('Mục đích lưu trú', 'Purpose of stay', tf(d, 'purpose'))}
${row('Kế hoạch/Tờ trình/Hợp đồng', 'Plan/Proposal/Contract', tf(d, 'basis'))}
${row('Dự toán kinh phí (đính kèm nếu có)', 'Budget estimate (Attached if applicable)', d.budget ? tf(d, 'budget') : '<span data-f="budget"></span>')}
${row('Số lượng khách', 'Number of guests', `<b>${tf(d, 'guests', pad2)}</b>`)}
${row('Số lượng phòng', 'Number of rooms', `<b>${tf(d, 'rooms', pad2)}</b>${d.roomNote ? ` – <span data-f="roomNote">${esc(d.roomNote)}</span>` : ''}`)}
${row('Ngày đến', 'Check-in date', `<b>${tf(d, 'checkIn', dmy)}</b>`)}
${row('Ngày đi', 'Check-out date', `<b>${tf(d, 'checkOut', dmy)}</b>`)}
<div style="margin:6px 0">Nội dung dịch vụ (Vui lòng chỉ chọn 1 trong 2 mục)/<i>Service information (Please select only one of the two options)</i>:</div>
<div data-f="service" style="padding-left:1cm">
  <div>${box(full)} Toàn bộ dịch vụ (Phòng ở, minibar, giặt ủi…)/<i>Full services (Room, minibar, laundry, etc.)</i></div>
  <div>${box(!full)} Phòng ở/<i>Room Only</i></div>
</div>
${row('Người liên hệ', 'Contact Person', tf(d, 'contactName'))}
${row('Điện thoại', 'Phone Number', tf(d, 'contactPhone'))}
<div style="text-align:right;margin:16px 0 4px"><i>TP. Hồ Chí Minh/Ho Chi Minh City, <span data-f="docDate">${dmy(d.docDate) || '……/……/……'}</span></i></div>
<table style="width:100%;border-collapse:collapse;text-align:center;margin-top:8px;page-break-inside:avoid"><tr>
  <td style="${NB};width:50%"><b>LÃNH ĐẠO ĐƠN VỊ</b><br><i>HEAD OF DEPARTMENT</i><div style="height:85px"></div><b>${tf(d, 'headName')}</b></td>
  <td style="${NB};width:50%"><b>VĂN PHÒNG ĐẠI HỌC</b><br><i>UNIVERSITY OFFICE</i><div style="height:85px"></div><b>${tf(d, 'officeName')}</b></td>
</tr></table>
</div>
<!--NEWPAGE-->
<div style="font-size:13pt;line-height:1.45">
<div style="text-align:center;margin:6px 0 16px"><b style="font-size:13.5pt">DANH SÁCH KHÁCH LƯU TRÚ TẠI KHÁCH SẠN UEH</b><br><i>UEH Boutique Hotel Guest List</i></div>
<table style="width:100%;border-collapse:collapse" data-f="guestList">
  <tr><th style="${td};width:18%">STT/<i>No.</i></th><th style="${td}">Họ và tên/<i>Full name</i></th></tr>
  ${(guests.length ? guests : [{ name: '' }]).map((g, i) => `<tr><td style="${td};text-align:center">${i + 1}</td><td style="${td}">${esc(g.name) || '<span class="tf-empty">……………………</span>'}</td></tr>`).join('')}
</table>
</div>`
}

export const OFFICIAL_TEMPLATES = {
  contractInfo: {
    id: 'contractInfo',
    name: 'Hợp đồng thỉnh giảng (Visiting Lecturer Agreement)',
    category: 'Pháp lý & Hợp đồng',
    icon: 'FileText',
    source: 'Hợp đồng thỉnh giảng.PDF',
    desc: 'Hợp đồng giảng dạy theo chế độ thỉnh giảng song ngữ Việt – Anh, đúng mẫu UEH.',
    fileName: (d) => `Hop_dong_thinh_giang_${ascii(d.bName || 'GV').replace(/\W+/g, '_')}`,
    titleOf: (d) => `Hợp đồng thỉnh giảng – ${d.bName || 'GV'}`,
    form: CONTRACT_FORM,
    defaults: contractDefaults,
    render: renderContract,
  },
  payTable: {
    id: 'payTable',
    name: 'Bảng kê thanh toán (VIE – ENG)',
    category: 'Tài chính & Quyết toán',
    icon: 'Receipt',
    source: 'BẢNG KÊ THANH TOÁN VIE-ENG.docx',
    desc: 'Bảng kê thanh toán song ngữ: tự tính thành tiền, thuế TNCN, thực nhận và số tiền bằng chữ.',
    fileName: (d) => `Bang_ke_thanh_toan_${ascii(d.lecturerName || 'GV').replace(/\W+/g, '_')}`,
    titleOf: (d) => `Bảng kê thanh toán – ${d.lecturerName || 'GV'}`,
    form: PAY_FORM,
    defaults: payDefaults,
    render: renderPayTable,
  },
  hotelReq: {
    id: 'hotelReq',
    name: 'Phiếu đặt phòng UEH Boutique Hotel',
    category: 'Hậu cần & Lưu trú',
    icon: 'Hotel',
    source: 'PHIẾU ĐẶT PHÒNG UEH BOUTIQUE HOTEL.docx',
    desc: 'Phiếu đặt phòng song ngữ kèm danh sách khách lưu trú.',
    fileName: (d) => `Phieu_dat_phong_${ascii((d.guestList || [])[0]?.name || 'GV').replace(/\W+/g, '_')}`,
    titleOf: (d) => `Phiếu đặt phòng – ${(d.guestList || [])[0]?.name || 'GV'}`,
    form: HOTEL_FORM,
    defaults: hotelDefaults,
    render: renderHotel,
  },
}
