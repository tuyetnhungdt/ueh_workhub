// Tạo văn bản tự động từ dữ liệu bàn làm việc (mở cửa sổ in / lưu PDF / sao chép)
import { tripCalc, MOA, prefsText, sameName } from './schema.js'

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const d = (s) => (s ? s.slice(0, 10).split('-').reverse().join('/') : '……/……/……')
const dt = (s) => (s ? `${d(s)} ${s.slice(11, 16)}` : '……')
const vnd = (n) => (+n || 0).toLocaleString('vi-VN')
const eur = (n) => '€ ' + (+n || 0).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const today = () => { const t = new Date(); return `ngày ${t.getDate()} tháng ${t.getMonth() + 1} năm ${t.getFullYear()}` }


/* ---------- Số tiền bằng chữ ---------- */
const VN = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
function vn3(n, full) {
  const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), u = n % 10
  const out = []
  if (h || full) out.push(VN[h] + ' trăm')
  if (t > 1) out.push(VN[t] + ' mươi')
  else if (t === 1) out.push('mười')
  else if (u && (h || full)) out.push('linh')
  if (u) out.push(u === 1 && t > 1 ? 'mốt' : u === 5 && t ? 'lăm' : u === 4 && t > 1 ? 'tư' : VN[u])
  return out.join(' ')
}
export function vnWords(num) {
  num = Math.floor(Math.abs(+num || 0))
  if (!num) return 'không'
  const units = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ']
  const groups = []
  while (num > 0) { groups.push(num % 1000); num = Math.floor(num / 1000) }
  const parts = []
  for (let i = groups.length - 1; i >= 0; i--) {
    if (!groups[i]) continue
    parts.push(vn3(groups[i], i < groups.length - 1) + units[i])
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}
const EN1 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const EN10 = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
function en3(n) {
  const h = Math.floor(n / 100), r = n % 100, out = []
  if (h) out.push(EN1[h] + ' hundred')
  if (r) out.push(r < 20 ? EN1[r] : EN10[Math.floor(r / 10)] + (r % 10 ? '-' + EN1[r % 10] : ''))
  return out.join(' and ')
}
export function enWords(num) {
  num = Math.floor(Math.abs(+num || 0))
  if (!num) return 'zero'
  const units = ['', ' thousand', ' million', ' billion']
  const parts = []
  let i = 0
  while (num > 0) { const g = num % 1000; if (g) parts.unshift(en3(g) + units[i]); num = Math.floor(num / 1000); i++ }
  return parts.join(' ')
}
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1)
export function eurInWords(amount) {
  const a = Math.round((+amount || 0) * 100) / 100
  const e = Math.floor(a), c = Math.round((a - e) * 100)
  return {
    vi: cap(vnWords(e)) + ' euro' + (c ? ' và ' + vnWords(c) + ' xu' : ' chẵn') + '.',
    en: cap(enWords(e)) + ' euro' + (e === 1 ? '' : 's') + (c ? ' and ' + enWords(c) + ' cent' + (c === 1 ? '' : 's') : ' only') + '.',
  }
}
export function vndInWords(amount) {
  const v = Math.round(+amount || 0)
  return { vi: cap(vnWords(v)) + ' đồng.', en: cap(enWords(v)) + ' Vietnamese dong.' }
}

const CSS = `
*{box-sizing:border-box} body{font-family:'Times New Roman',Times,serif;font-size:13.5pt;color:#111;margin:0;background:#eef2f3}
.page{width:210mm;min-height:297mm;margin:16px auto;background:#fff;padding:18mm 18mm 20mm;box-shadow:0 2px 12px rgba(0,0,0,.12)}
.hdr{display:flex;justify-content:space-between;text-align:center;font-size:12pt;line-height:1.35}
.hdr b{display:block} .hdr .r{font-weight:bold}
h1{font-size:15pt;text-align:center;margin:22px 0 4px;text-transform:uppercase} .sub{text-align:center;font-style:italic;margin-bottom:16px}
table{width:100%;border-collapse:collapse;margin:10px 0} td,th{border:1px solid #333;padding:6px 8px;vertical-align:top;font-size:12.5pt} th{background:#f2f2f2}
td.n{text-align:right;white-space:nowrap} tr.tot td{font-weight:bold;background:#fafafa}
.kv td:first-child{width:38%;background:#f7f7f7}
.sign{display:flex;justify-content:space-between;text-align:center;margin-top:30px} .sign div{width:32%} .sign i{display:block;font-size:11pt;margin-bottom:70px}
.note{font-size:11.5pt;color:#444;margin-top:8px}
.words{margin-top:10px} .words .en{font-size:10.5pt;font-style:italic;color:#555;margin-top:2px}
.bar{position:sticky;top:0;background:#03616a;color:#fff;padding:10px 16px;display:flex;gap:10px;align-items:center;font-family:system-ui,sans-serif;font-size:14px;z-index:5}
.bar button{background:#fff;color:#03616a;border:0;border-radius:8px;padding:7px 14px;font-weight:700;cursor:pointer} .bar span{flex:1}
pre{white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;margin:0}
@media print{.bar{display:none} body{background:#fff} .page{box-shadow:none;margin:0;width:auto;min-height:0}}
`
const header = `<div class="hdr"><div>ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH<b>KHOA TÀI CHÍNH</b>Chương trình song bằng UEH – Rennes</div><div class="r">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>Độc lập – Tự do – Hạnh phúc</div></div>`
const signs = (a, b, c) => `<div class="sign"><div><b>${a}</b><i>(Ký, ghi rõ họ tên)</i></div><div><b>${b}</b><i>(Ký, ghi rõ họ tên)</i></div><div><b>${c}</b><i>(Ký, ghi rõ họ tên)</i></div></div>`

export const DOC_TEMPLATES = {
  payTable: {
    label: 'Bảng kê thanh toán thù lao & chi phí GV',
    build: (r) => {
      const c = tripCalc(r)
      const adv = +r.advanceEur || 0
      return `${header}
<h1>Bảng kê thanh toán thù lao và chi phí giảng viên</h1>
<div class="sub">Giảng viên Đại học Rennes giảng dạy chương trình cử nhân song bằng UEH – Rennes</div>
<table class="kv">
<tr><td>Giảng viên</td><td><b>${esc(r.lecturer)}</b></td></tr>
<tr><td>Căn cứ</td><td>Hợp đồng giảng dạy số <b>${esc(r.contractNo || '……………')}</b> giữa ${esc(r.lecturer)} và Đại học Kinh tế TP. Hồ Chí Minh về việc giảng dạy học phần <b>${esc(r.course || '……')}</b>; MOA UEH – Đại học Rennes, Phụ lục 2 (Điều khoản tài chính).</td></tr>
<tr><td>Học phần / lớp</td><td>${esc(r.course)} · ${esc(r.className || '')}</td></tr>
<tr><td>Thời gian giảng dạy</td><td>Từ ${d(r.teachFrom)} đến ${d(r.teachTo)} · <b>${r.teachHours || 0} giờ</b></td></tr>
<tr><td>Thời gian công tác tại Việt Nam</td><td>Đến ${dt(r.arriveAt)} (${esc(r.outFlight || '')}) – Về ${dt(r.returnAt)} (${esc(r.returnFlight || '')})</td></tr>
</table>
<table>
<tr><th>STT</th><th>Nội dung</th><th>Cách tính</th><th>EUR</th></tr>
<tr><td>1</td><td>Thù lao giảng dạy (thực nhận, sau thuế)</td><td>${r.teachHours || 0} giờ × ${eur(r.rateEur)}</td><td class="n">${eur(c.net)}</td></tr>
<tr><td>2</td><td>Thuế TNCN khấu trừ (${r.taxRate || 0}%)</td><td>Quy đổi trước thuế: ${eur(c.net)} / (1 − ${r.taxRate || 0}%)</td><td class="n">${eur(c.taxAmt)}</td></tr>
<tr class="tot"><td></td><td>Thù lao trước thuế (1 + 2)</td><td></td><td class="n">${eur(c.gross)}</td></tr>
<tr><td>3</td><td>Phụ cấp lưu trú (khách sạn, ăn uống, taxi)</td><td>${r.perDiemDays || 0} ngày × ${eur(r.perDiemRate)}</td><td class="n">${eur(c.perDiem)}</td></tr>
<tr><td>4</td><td>Tàu TGV Rennes – Paris CDG</td><td>Tối đa ${eur(MOA.tgvMaxEur)}</td><td class="n">${eur(r.tgvEur)}</td></tr>
<tr class="tot"><td></td><td>TỔNG EUR (trước thuế + 3 + 4)</td><td></td><td class="n">${eur(c.eurTotal)}</td></tr>
<tr><td>5</td><td>Tạm ứng đã chi</td><td></td><td class="n">${adv ? '− ' + eur(adv) : '—'}</td></tr>
<tr class="tot"><td></td><td>CÒN PHẢI THANH TOÁN</td><td></td><td class="n">${eur(c.eurTotal - adv)}</td></tr>
</table>
<table>
<tr><th>Chi phí UEH chi trả trực tiếp</th><th>VND</th></tr>
<tr><td>Vé máy bay khứ hồi ${esc(r.outFlight || '')} / ${esc(r.returnFlight || '')}</td><td class="n">${vnd(r.ticketCost)}</td></tr>
<tr><td>Khách sạn ${esc(r.hotel || '')} ${r.bookingCode ? '(phiếu ' + esc(r.bookingCode) + ')' : ''} · ${d(r.checkIn)} – ${d(r.checkOut)}</td><td class="n">${vnd(r.hotelCost)}</td></tr>
<tr><td>Chi phí khác</td><td class="n">${vnd(r.otherCost)}</td></tr>
<tr class="tot"><td>Tổng chi phí chuyến công tác quy VND (tỷ giá ${vnd(r.fx)} VND/EUR)</td><td class="n">${vnd(c.vnd)}</td></tr>
</table>
<div class="words"><div>Số tiền còn phải thanh toán bằng chữ: <b>${eurInWords(c.eurTotal - adv).vi}</b></div><div class="en">Amount due in words: ${eurInWords(c.eurTotal - adv).en}</div></div>
<div class="words"><div>Tổng chi phí chuyến công tác quy VND bằng chữ: <b>${vndInWords(c.vnd).vi}</b></div><div class="en">Total mission cost in words: ${vndInWords(c.vnd).en}</div></div>
<p style="text-align:right;font-style:italic">TP. Hồ Chí Minh, ${today()}</p>
${signs('Người lập biểu', 'Ban điều hành chương trình', 'Trưởng khoa')}
<div style="page-break-before:always"></div>
${header}
<h1>Bảng khấu trừ thuế thu nhập cá nhân</h1>
<div class="sub">Personal income tax deduction statement</div>
<table class="kv">
<tr><td>Họ tên / Full name</td><td><b>${esc(r.lecturer)}</b></td></tr>
<tr><td>Nội dung / Description</td><td>Thù lao giảng dạy học phần ${esc(r.course)} (${r.teachHours || 0} giờ, ${d(r.teachFrom)} – ${d(r.teachTo)})</td></tr>
<tr><td>Thu nhập trước thuế / Gross income</td><td>${eur(c.gross)}</td></tr>
<tr><td>Thuế TNCN ${r.taxRate}% / PIT withheld</td><td>${eur(c.taxAmt)}</td></tr>
<tr><td>Thực nhận / Net received</td><td><b>${eur(c.net)}</b></td></tr>
</table>
<p>Tôi xác nhận đã nhận đủ số tiền thực nhận nêu trên và đồng ý để UEH khấu trừ thuế TNCN theo quy định.<br><i>I confirm that I have received the net amount above and agree to the withholding of Vietnamese personal income tax.</i></p>
<div class="sign"><div></div><div></div><div><b>Giảng viên / Lecturer</b><i>(Ký, ghi rõ họ tên / Signature)</i></div></div>`
    },
  },
  advanceReq: {
    label: 'Giấy đề nghị tạm ứng',
    build: (r, ctx) => {
      const who = ctx.users.find((u) => u.id === r.advanceBy)?.name || '……………………'
      const c = tripCalc(r)
      return `${header}
<h1>Giấy đề nghị tạm ứng</h1>
<table class="kv">
<tr><td>Người đề nghị tạm ứng</td><td><b>${esc(who)}</b> – Ban điều hành chương trình song bằng UEH – Rennes</td></tr>
<tr><td>Số tiền đề nghị tạm ứng</td><td><b>${eur(r.advanceEur || c.eurTotal)}</b> (≈ ${vnd((+r.advanceEur || c.eurTotal) * (+r.fx || 0))} VND)<div class="words" style="margin-top:4px"><div>Bằng chữ: ${eurInWords(r.advanceEur || c.eurTotal).vi}</div><div class="en">In words: ${eurInWords(r.advanceEur || c.eurTotal).en}</div></div></td></tr>
<tr><td>Lý do tạm ứng</td><td>Chi trả thù lao giảng dạy và phụ cấp lưu trú cho ${esc(r.lecturer)} – giảng viên Đại học Rennes giảng dạy học phần ${esc(r.course)} từ ${d(r.teachFrom)} đến ${d(r.teachTo)} (${r.teachHours || 0} giờ), theo HĐ số ${esc(r.contractNo || '……')}.</td></tr>
<tr><td>Thời hạn hoàn ứng</td><td>Trong vòng 30 ngày sau khi kết thúc đợt giảng</td></tr>
</table>
<p style="text-align:right;font-style:italic">TP. Hồ Chí Minh, ${today()}</p>
${signs('Người đề nghị', 'Ban điều hành chương trình', 'Trưởng khoa')}`
    },
  },
  tripEmail: {
    label: 'Email thông tin chuyến công tác gửi GV (EN)',
    text: true,
    build: (r, ctx) => {
      const sess = ctx.items.filter((x) => x.module === 'sessions' && x.course && r.course && x.course.toLowerCase() === r.course.toLowerCase()).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
      const last = (r.lecturer || '').split(' ').slice(-1)[0]
      return `Subject: Your teaching mission at UEH – ${r.course || ''} (${d(r.teachFrom)} – ${d(r.teachTo)})

Dear Professor ${last},

Thank you for teaching "${r.course || ''}" in the UEH – Université de Rennes double degree programme. Please find the practical information for your mission below.

FLIGHTS
• Arrival: ${r.outFlight || 'TBC'} – arriving Ho Chi Minh City (SGN) on ${dt(r.arriveAt)}
• Departure: ${r.returnFlight || 'TBC'} – ${dt(r.returnAt)}

AIRPORT PICK-UP
• ${r.pickup || 'Details will be sent before your arrival.'}

ACCOMMODATION
• ${r.hotel || 'TBC'}${r.bookingCode ? ' – booking ref. ' + r.bookingCode : ''}
• Check-in ${d(r.checkIn)} – check-out ${d(r.checkOut)}

TEACHING SCHEDULE (${r.teachHours || 0} hours, class ${r.className || ''})
${sess.length ? sess.map((x) => `• ${d(x.date)}  ${x.start || ''}–${x.end || ''}  Room ${x.room || 'TBC'}${x.mode && x.mode !== 'Trực tiếp' ? ' (' + x.mode + ')' : ''}`).join('\n') : '• From ' + d(r.teachFrom) + ' to ' + d(r.teachTo) + ' – detailed timetable to follow.'}

DOCUMENTS
• Visa: ${r.visa === 'Đã cấp visa' ? 'your visa has been issued.' : r.visa === 'Không cần' ? 'no visa required.' : 'invitation letter / visa support in progress.'}
• Please bring your passport; we will ask you to sign the visiting lecturer agreement and the personal income tax statement on arrival.

Per diem: €${r.perDiemRate || MOA.perDiemEur}/day for ${r.perDiemDays || MOA.perDiemDays} days (hotel, meals and local transport), as per the MOA.
${(() => { const lec = ctx.items.find((x) => x.module === 'lecturers' && sameName(x.fullName, r.lecturer)); const p = prefsText(lec); return p ? '\nWe have noted your preferences (please tell us if anything has changed): ' + p + '\n' : '' })()}

Should you need anything, please do not hesitate to contact us.

Best regards,
UEH – Rennes Double Degree Programme Office
Faculty of Finance, University of Economics Ho Chi Minh City`
    },
  },
  contractInfo: {
    label: 'Phiếu thông tin Hợp đồng thỉnh giảng (điền sẵn)',
    build: (r, ctx) => {
      const trips = ctx.items.filter((x) => x.module === 'trips' && (x.lecturer || '').toLowerCase() === (r.fullName || '').toLowerCase())
      return `<div class="hdr"><div>BỘ GIÁO DỤC VÀ ĐÀO TẠO<b>ĐẠI HỌC KINH TẾ TP. HỒ CHÍ MINH</b></div><div class="r">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>Độc lập – Tự do – Hạnh phúc</div></div>
<p style="text-align:center;margin-top:14px">Số/No: <b>${esc(r.contractNo || '……/HĐTG-ĐHKT-TC')}</b></p>
<h1>Hợp đồng giảng dạy / Visiting lecturer agreement</h1>
<div class="sub">(Theo chế độ thỉnh giảng) – Phiếu thông tin điền sẵn từ hồ sơ giảng viên</div>
<table class="kv">
<tr><th colspan="2">Bên A / Party A</th></tr>
<tr><td>Đại diện / Representative</td><td>Ông Lê Đạt Chí – Trưởng khoa, Khoa Tài chính</td></tr>
<tr><td>Đơn vị / Unit</td><td>Đại học Kinh tế Thành phố Hồ Chí Minh (UEH)</td></tr>
<tr><th colspan="2">Bên B / Party B</th></tr>
<tr><td>Họ tên / Full name</td><td><b>${esc(r.fullName)}</b></td></tr>
<tr><td>Ngày sinh / Date of birth</td><td>${d(r.dob)}</td></tr>
<tr><td>Chức danh, học vị / Title, degree</td><td>${esc(r.academicTitle || '')}</td></tr>
<tr><td>Chuyên môn / Specialization</td><td>${esc(r.specialization || '')}</td></tr>
<tr><td>E-mail · Điện thoại</td><td>${esc(r.email || '')} · ${esc(r.phone || '')}</td></tr>
<tr><td>Địa chỉ / Address</td><td>${esc(r.address || '')}</td></tr>
<tr><td>Số tài khoản / Bank account</td><td>${esc(r.bankAccount || '')}</td></tr>
<tr><td>Ngân hàng, BIC / Bank</td><td>${esc(r.bankName || '')}</td></tr>
<tr><td>Mã số thuế TNCN / Tax code</td><td>${esc(r.taxCode || 'Chưa có mã số thuế tại Việt Nam')}</td></tr>
<tr><td>Hộ chiếu / Passport No.</td><td>${esc(r.passport || '')} · ${esc(r.passportIssued || '')}</td></tr>
<tr><td>Thời hạn hợp đồng / Term</td><td>Từ ${d(r.contractFrom)} đến ${d(r.contractTo)}</td></tr>
<tr><td>Nội dung / Subject</td><td>Giảng dạy học phần: <b>${esc(r.courses || '')}</b> – chương trình cử nhân song bằng UEH – Đại học Rennes</td></tr>
</table>
<h3 style="font-size:13pt;margin:14px 0 4px">Phụ lục khối lượng công việc / Workload appendix</h3>
<table>
<tr><th>Học phần</th><th>Lớp</th><th>Thời gian giảng</th><th>Số giờ</th><th>Đơn giá (sau thuế)</th><th>Thành tiền</th></tr>
${trips.length ? trips.map((t) => `<tr><td>${esc(t.course)}</td><td>${esc(t.className || '')}</td><td>${d(t.teachFrom)} – ${d(t.teachTo)}</td><td class="n">${t.teachHours || 0}</td><td class="n">${eur(t.rateEur)}</td><td class="n">${eur(tripCalc(t).net)}</td></tr>`).join('') : `<tr><td>${esc(r.courses || '')}</td><td></td><td></td><td class="n">${r.hoursPlanned || ''}</td><td class="n">${eur(r.rateEur || MOA.rateEur)}</td><td></td></tr>`}
</table>
<div class="note">Thanh toán chuyển khoản trong vòng 30 ngày sau khi kết thúc từng phụ lục; UEH khấu trừ thuế TNCN theo Luật Thuế TNCN. Hợp đồng lập 5 bản: Bên A 1, Bên B 1, Ban PTTC-NL, Ban TC-KHĐT và Ban Đào tạo mỗi ban 1 bản.</div>
<div class="sign"><div><b>BÊN B / PARTY B</b><i>(Ký / Signature)</i></div><div></div><div><b>BÊN A / PARTY A</b><i>(Ký / Signature)</i></div></div>`
    },
  },
  lecturerSheet: {
    label: 'Tổng hợp giờ giảng & chi phí của GV',
    build: (r, ctx) => {
      const trips = ctx.items.filter((x) => x.module === 'trips' && (x.lecturer || '').toLowerCase() === (r.fullName || '').toLowerCase())
      const tot = trips.reduce((s, t) => s + tripCalc(t).eurTotal, 0)
      return `${header}<h1>Tổng hợp giờ giảng và chi phí giảng viên</h1><div class="sub">${esc(r.fullName)} – ${esc(r.side || '')}</div>
<table><tr><th>Học phần</th><th>Thời gian</th><th>Giờ</th><th>Thù lao thực nhận</th><th>Tổng EUR</th><th>Quy VND</th><th>Thanh toán</th></tr>
${trips.map((t) => { const c = tripCalc(t); return `<tr><td>${esc(t.course)}</td><td>${d(t.teachFrom)} – ${d(t.teachTo)}</td><td class="n">${t.teachHours || 0}</td><td class="n">${eur(c.net)}</td><td class="n">${eur(c.eurTotal)}</td><td class="n">${vnd(c.vnd)}</td><td>${esc(t.payStatus || '')}</td></tr>` }).join('') || '<tr><td colspan="7">Chưa có đợt giảng.</td></tr>'}
<tr class="tot"><td colspan="4">Tổng</td><td class="n">${eur(tot)}</td><td colspan="2"></td></tr></table>
<p>Hợp đồng: ${esc(r.contractNo || '—')} (${esc(r.contractStatus || '')}) · Bảng điểm: ${esc(r.gradesSent || '')} · Giờ đã dạy / kế hoạch: ${r.hoursDone || 0} / ${r.hoursPlanned || 0}</p>`
    },
  },
}

export function openDoc(key, item, ctx) {
  const t = DOC_TEMPLATES[key]
  const body = t.build(item, ctx)
  const w = window.open('', '_blank')
  if (!w) { alert('Trình duyệt chặn cửa sổ mới – hãy cho phép popup.'); return }
  const page = t.text
    ? `<div class="bar"><span>${esc(t.label)}</span><button onclick="navigator.clipboard.writeText(document.getElementById('t').innerText).then(()=>this.textContent='Đã sao chép ✓')">Sao chép nội dung</button></div><div class="page" style="min-height:0;font-size:14px"><pre id="t">${esc(body)}</pre></div>`
    : `<div class="bar"><span>${esc(t.label)} – kiểm tra rồi In / Lưu PDF</span><button onclick="print()">In / Lưu PDF</button></div><div class="page">${body}</div>`
  w.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${esc(t.label)}</title><style>${CSS}</style></head><body>${page}</body></html>`)
  w.document.close()
}
