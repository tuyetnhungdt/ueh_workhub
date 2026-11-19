// Bộ hồ sơ mua vé máy bay cho GV Rennes, dựng từ file gốc
// (Tài chính và Quyết toán/…/Tavera - 23-30_08_2026/HĐ - Máy bay Rennes đợt 1.pdf & BBNT - Máy bay Rennes đợt 1.pdf):
//  - ticketContract : Hợp đồng dịch vụ (V/v: Cung cấp vé máy bay)
//  - ticketHandover : Biên bản bàn giao vé máy bay
//  - ticketAccept   : Biên bản nghiệm thu và thanh lý hợp đồng dịch vụ
// Ba mẫu dùng chung một bộ dữ liệu (family: 'ticket') – điền một lần, chuyển qua lại không mất dữ liệu.
import { vnWords } from './docs.js'
import { esc, cleanName } from './officialTemplates.js'

const pad = (n) => String(n).padStart(2, '0')
const parseISO = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? { y: +m[1], m: +m[2], d: +m[3] } : null }
const dayMonth = (s) => { const p = parseISO(s); return p ? `ngày ${pad(p.d)} tháng ${p.m} năm ${p.y}` : 'ngày …… tháng …… năm ……' }
const num = (n) => (+n || 0).toLocaleString('vi-VN')
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1)
const words = (n) => cap(vnWords(Math.round(+n || 0))) + ' đồng chẵn'
const NB = 'border:none;padding:0;vertical-align:top'
const td = 'border:1px solid #222;padding:6px 8px;vertical-align:middle'
const th = td + ';text-align:center;font-weight:bold'

const tf = (d, k, fmt) => {
  const s = fmt ? fmt(d[k]) : d[k]
  const empty = s == null || String(s).trim() === ''
  return `<span data-f="${k}"${empty ? ' class="tf-empty"' : ''}>${empty ? '……………………' : esc(s)}</span>`
}

/* Hãng bay & mã đặt chỗ đoán từ chuỗi chuyến bay của chuyến công tác (vd: "VN 10 · CDG → SGN (Booking ENXB8B)") */
const AIRLINES = { VN: 'Vietnam Airlines (VN)', AF: 'Air France (AF)', QR: 'Qatar Airways (QR)', EK: 'Emirates (EK)', TK: 'Turkish Airlines (TK)', SQ: 'Singapore Airlines (SQ)', CX: 'Cathay Pacific (CX)', LH: 'Lufthansa (LH)', KL: 'KLM (KL)' }
const airlineOf = (s) => { const m = /^\s*([A-Z0-9]{2})\s?\d/.exec(s || ''); return m ? AIRLINES[m[1]] || m[1] : '' }
const pnrOf = (s) => (/booking\s*:?\s*([A-Z0-9]{5,8})/i.exec(s || '') || [])[1] || ''
const flightTime = (s) => (s && s.length >= 16 ? `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)}/${s.slice(11, 13)}h${s.slice(14, 16)}` : '')
const routeOf = (s) => { const m = /([A-Z]{3})\s*(?:→|->|-|–)\s*([A-Z]{3})/.exec(s || ''); return m ? `${m[1]} ${m[2]} ${m[1]}` : 'CDG SGN CDG' }

export const ticketLine = (r) => Math.round((+r.qty || 0) * (+r.price || 0))
const total = (d) => (Array.isArray(d.items) ? d.items : []).reduce((a, r) => a + ticketLine(r), 0)

function ticketDefaults(auto, ctx) {
  const trip = auto.rawTrip || {}
  const name = cleanName(trip.lecturer || auto.rawLecturer?.fullName || auto.lecturerName)
  const route = routeOf(trip.outFlight)
  return {
    contractNo: '05/HĐDV - UEH',
    contractDate: ctx.today,
    handoverDate: ctx.today,
    acceptDate: ctx.today,
    // Bên A – UEH (theo mẫu gốc)
    aOrg: 'ĐẠI HỌC KINH TẾ THÀNH PHỐ HỒ CHÍ MINH',
    aRepSal: 'Ông', aRepName: 'Bùi Quang Hùng', aRepTitle: 'Giám đốc',
    aAddress: '59C Nguyễn Đình Chiểu, phường Xuân Hòa, TP. HCM',
    aTax: '0302378687',
    aAccount: '0036100000120007 tại Ngân hàng TMCP Phương Đông - TP.HCM',
    aPhone: '(028) 38295299',
    aRecvName: 'Nguyễn Văn Thiện Tâm', aRecvTitle: 'Giảng viên khoa Tài chính',
    // Bên B – đại lý vé (theo mẫu gốc)
    bOrg: 'CÔNG TY TNHH DU LỊCH KHANH',
    bShortName: 'Công ty TNHH Du lịch Khanh',
    bRepSal: 'Bà', bRepName: 'Nguyễn Thị Thúy Vân', bRepTitle: 'Tổng Giám Đốc',
    bAddress: '635 Nguyễn Kiệm, Phường Đức Nhuận, TP. HCM',
    bTax: '0312244033',
    bAccount: '072100006077 – Ngân hàng TMCP Ngoại thương Việt Nam, chi nhánh Kỳ Đồng.',
    bPhone: '(84.28) 38 456 425',
    bDelivName: 'Nguyễn Hiền Hậu', bDelivTitle: 'Trưởng Phòng Kinh Doanh',
    // Nội dung
    routeText: 'Charles de Gaulle (Paris, Pháp) - Tân Sơn Nhất (TP.HCM) - Charles de Gaulle (Paris, Pháp)',
    items: [{ desc: `Vé máy bay quốc tế ${route}`, qty: 1, unit: 'Vé', price: +trip.ticketCost || 0 }],
    passengers: [{
      name: name ? `Mr. ${name}` : '',
      airline: airlineOf(trip.outFlight) || 'Air France (AF)',
      pnr: pnrOf(trip.outFlight),
      outAt: flightTime(trip.departAt),
      backAt: flightTime(trip.returnAt),
    }],
    deliveryMode: 'Vé điện tử qua Email',
    ticketCountText: '01 vé khứ hồi',
    payMethod: 'Chuyển khoản',
    copiesContract: 3,
  }
}

/* ---------- Biểu mẫu nhập liệu (dùng chung, mỗi mẫu chọn mục cần thiết) ---------- */
const SAL = ['Ông', 'Bà']
const S_CONTRACT = { title: 'Hợp đồng', fields: [
  { k: 'contractNo', label: 'Số hợp đồng', req: true, span: 5, ph: 'VD: 05/HĐDV - UEH' },
  { k: 'contractDate', label: 'Ngày ký hợp đồng', type: 'date', req: true, span: 4 },
  { k: 'payMethod', label: 'Hình thức thanh toán', type: 'select', noEmpty: true, options: ['Chuyển khoản', 'Tiền mặt'], span: 3 },
  { k: 'routeText', label: 'Hành trình', span: 12 },
] }
const S_ITEMS = { title: 'Danh mục vé & giá trị', desc: 'Thành tiền và số tiền bằng chữ tự tính', fields: [
  { k: 'items', label: 'Danh mục', type: 'rows', cards: true, addLabel: 'Thêm dòng', columns: [
    { k: 'desc', label: 'Danh mục', ph: 'Vé máy bay quốc tế CDG SGN CDG', def: 'Vé máy bay quốc tế', span: 12 },
    { k: 'qty', label: 'Số lượng', type: 'number', def: 1, span: 3 },
    { k: 'unit', label: 'ĐVT', def: 'Vé', span: 2 },
    { k: 'price', label: 'Đơn giá (VNĐ)', type: 'number', def: 0, span: 4 },
  ], total: { label: 'Thành tiền', span: 3, fn: (r) => num(ticketLine(r)) } },
] }
const S_A = { title: 'Bên A – Đại học Kinh tế TP.HCM', desc: 'Điền sẵn theo mẫu gốc', fields: [
  { k: 'aOrg', label: 'Tên đơn vị', span: 12 },
  { k: 'aRepSal', label: 'Ông/Bà', type: 'select', noEmpty: true, options: SAL, span: 2 },
  { k: 'aRepName', label: 'Người đại diện', span: 5 },
  { k: 'aRepTitle', label: 'Chức vụ', span: 5 },
  { k: 'aAddress', label: 'Địa chỉ', span: 12 },
  { k: 'aTax', label: 'Mã số thuế', span: 4, pattern: '^\\d{10}(-\\d{3})?$', patternMsg: 'MST gồm 10 chữ số (hoặc 10-3)' },
  { k: 'aAccount', label: 'Tài khoản số / Ngân hàng', span: 8 },
] }
const S_B = { title: 'Bên B – Đại lý vé máy bay', desc: 'Điền sẵn theo mẫu gốc', fields: [
  { k: 'bOrg', label: 'Tên công ty (in hoa)', span: 7 },
  { k: 'bShortName', label: 'Tên viết thường (dùng trong câu)', span: 5 },
  { k: 'bRepSal', label: 'Ông/Bà', type: 'select', noEmpty: true, options: SAL, span: 2 },
  { k: 'bRepName', label: 'Người đại diện', span: 5 },
  { k: 'bRepTitle', label: 'Chức vụ', span: 5 },
  { k: 'bAddress', label: 'Địa chỉ', span: 12 },
  { k: 'bTax', label: 'Mã số thuế', span: 4, pattern: '^\\d{10}(-\\d{3})?$', patternMsg: 'MST gồm 10 chữ số (hoặc 10-3)' },
  { k: 'bAccount', label: 'Tài khoản số / Ngân hàng', span: 8 },
] }
const S_HANDOVER = { title: 'Bàn giao', fields: [
  { k: 'handoverDate', label: 'Ngày bàn giao', type: 'date', req: true, span: 4, after: 'contractDate' },
  { k: 'deliveryMode', label: 'Hình thức bàn giao', type: 'select', noEmpty: true, options: ['Vé điện tử qua Email', 'Vé giấy bàn giao trực tiếp', 'Vé điện tử qua Zalo / tin nhắn'], span: 4 },
  { k: 'ticketCountText', label: 'Tổng số lượng vé', span: 4, ph: 'VD: 01 vé khứ hồi' },
  { k: 'aRecvName', label: 'Bên A – người nhận', span: 4 },
  { k: 'aRecvTitle', label: 'Chức vụ', span: 4 },
  { k: 'aPhone', label: 'Điện thoại Bên A', type: 'phone', span: 4 },
  { k: 'bDelivName', label: 'Bên B – người giao', span: 4 },
  { k: 'bDelivTitle', label: 'Chức vụ', span: 4 },
  { k: 'bPhone', label: 'Điện thoại Bên B', type: 'phone', span: 4 },
] }
const S_PAX = { title: 'Hành khách & chuyến bay', desc: 'Tự điền từ chuyến công tác', fields: [
  { k: 'passengers', label: 'Hành khách', type: 'rows', cards: true, addLabel: 'Thêm hành khách', columns: [
    { k: 'name', label: 'Tên hành khách', ph: 'Mr. Christophe Andre Tavera', def: 'Mr. ', span: 7 },
    { k: 'airline', label: 'Hãng bay', ph: 'Air France (AF)', def: '', span: 5 },
    { k: 'pnr', label: 'Mã đặt chỗ', ph: 'H9Q9DX', def: '', span: 4 },
    { k: 'outAt', label: 'Chiều đi (dd.mm.yyyy/hhhmm)', ph: '22.08.2026/14h05', def: '', span: 4 },
    { k: 'backAt', label: 'Chiều về', ph: '30.08.2026/09h25', def: '', span: 4 },
  ] },
] }

/* ---------- Khối hiển thị dùng chung ---------- */
const motto = `<div style="text-align:center;font-weight:bold;font-size:13pt;line-height:1.35">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>Độc lập – Tự do – Hạnh phúc<div style="width:34%;margin:4px auto 0;border-top:1px solid #111"></div></div>`
const partyRow = (label, val) => `<tr><td style="${NB};width:4cm;white-space:nowrap;padding:1px 0 1px 1cm">${label}</td><td style="${NB};padding:1px 0">: ${val}</td></tr>`
const partyFull = (d, side) => {
  const a = side === 'a'
  return `<p style="margin:8px 0 2px"><b><u>Bên ${a ? 'A' : 'B'}:</u> ${tf(d, side + 'Org')}</b></p>
<table style="border-collapse:collapse;width:100%">
${partyRow('Đại diện', `<span data-f="${side}RepSal">${esc(d[side + 'RepSal'] || '')}</span> <b>${tf(d, side + 'RepName')}</b> - Chức vụ: ${tf(d, side + 'RepTitle')}`)}
${partyRow('Địa chỉ', tf(d, side + 'Address'))}
${partyRow('Mã số thuế', tf(d, side + 'Tax'))}
${partyRow('Tài khoản số', tf(d, side + 'Account'))}
</table>`
}
const itemsTable = (d) => {
  const items = Array.isArray(d.items) ? d.items : []
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0;font-size:12.5pt" data-f="items">
<tr><th style="${th};width:8%">STT</th><th style="${th}">Danh mục</th><th style="${th};width:11%">Số lượng</th><th style="${th};width:9%">ĐVT</th><th style="${th};width:17%">Đơn giá (VNĐ)</th><th style="${th};width:19%">Thành tiền (VNĐ)</th></tr>
${items.map((r, i) => `<tr><td style="${td};text-align:center">${i + 1}</td><td style="${td}">${esc(r.desc)}</td><td style="${td};text-align:center">${num(r.qty)}</td><td style="${td};text-align:center">${esc(r.unit)}</td><td style="${td};text-align:right">${num(r.price)}</td><td style="${td};text-align:right">${num(ticketLine(r))}</td></tr>`).join('')}
<tr><td colspan="5" style="${td};text-align:center;font-weight:bold">Tổng cộng (đã bao gồm VAT):</td><td style="${td};text-align:right;font-weight:bold">${num(total(d))}</td></tr>
</table>`
}
const signs = (left, right) => `<table style="width:100%;border-collapse:collapse;margin-top:22px;text-align:center;page-break-inside:avoid"><tr>
  <td style="${NB};width:50%"><b>ĐẠI DIỆN BÊN A</b><div style="height:95px"></div><b>${left}</b></td>
  <td style="${NB};width:50%"><b>ĐẠI DIỆN BÊN B</b><div style="height:95px"></div><b>${right}</b></td></tr></table>`
const repSigns = (d) => `<table style="width:100%;border-collapse:collapse;margin-top:22px;text-align:center;page-break-inside:avoid"><tr>
  <td style="${NB};width:50%"><b>ĐẠI DIỆN BÊN A</b><br>${tf(d, 'aRepTitle')}<div style="height:85px"></div><b>${tf(d, 'aRepName')}</b></td>
  <td style="${NB};width:50%"><b>ĐẠI DIỆN BÊN B</b><br>${tf(d, 'bRepTitle')}<div style="height:85px"></div><b>${tf(d, 'bRepName')}</b></td></tr></table>`
const li = (t) => `<div style="margin:2px 0 2px 0.6cm;text-indent:-0.35cm">- ${t}</div>`
const basisLine = (d) => `Căn cứ theo hợp đồng số ${tf(d, 'contractNo')} <span data-f="contractDate">${dayMonth(d.contractDate)}</span> giữa Đại học Kinh tế Thành phố Hồ Chí Minh và ${tf(d, 'bShortName')}.`

/* ---------- 1. Hợp đồng dịch vụ ---------- */
function renderContract(d) {
  const t = total(d)
  const copies = +d.copiesContract || 3
  return `<div style="font-size:13pt;line-height:1.45">
${motto}
<div style="text-align:center;margin:18px 0 10px"><b style="font-size:15pt">HỢP ĐỒNG DỊCH VỤ</b><br><b><i>(V/v: Cung cấp vé máy bay)</i></b><br>Số: ${tf(d, 'contractNo')}</div>
<div style="font-style:italic;text-align:justify">
${li('Căn cứ Bộ Luật Dân Sự số 91/2015/QH13 do Quốc Hội Nước Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam ban hành ngày 24/11/2015, có hiệu lực từ ngày 01/01/2017;')}
${li('Căn cứ bộ luật Thương mại số 36/2005/QH11 ngày 14/6/2005 của nước Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam;')}
${li('Căn cứ vào nhu cầu và khả năng của hai bên.')}
<div style="margin:4px 0 0 0.6cm">Hôm nay, <span data-f="contractDate">${dayMonth(d.contractDate)}</span> chúng tôi gồm:</div>
</div>
${partyFull(d, 'a')}
${partyFull(d, 'b')}
<p style="margin:8px 0;font-style:italic">Hai bên cùng nhau thảo luận và đi đến ký kết hợp đồng cung cấp vé máy bay để thực hiện công tác cụ thể như sau:</p>
<p style="margin:6px 0 2px"><b>Điều 1. Hình thức và nội dung hợp đồng</b></p>
${li('Hình thức: Trọn gói')}
${li(`Nội dung: Bên B nhận đặt, giữ chỗ và bán vé máy bay theo hành trình ${tf(d, 'routeText')}, cụ thể như sau:`)}
${itemsTable(d)}
<!--PAGE-->
<p style="margin:6px 0 2px"><b>Điều 2. Giá trị hợp đồng và phương thức thanh toán:</b></p>
<div style="margin-left:1cm"><b>1. Giá trị hợp đồng</b></div>
${li(`Giá trị Hợp đồng trọn gói: <b data-f="items">${num(t)} đồng</b> (giá đã bao gồm VAT)`)}
<div style="margin-left:0.6cm;font-style:italic" data-f="items">(Bằng chữ: ${esc(words(t))} ./.)</div>
<div style="margin-left:1cm"><b>2. Hình thức thanh toán:</b></div>
${li(`Hình thức thanh toán: ${tf(d, 'payMethod')}`)}
${li('Bên A thanh toán cho bên B toàn bộ số tiền sau khi hai bên ký Biên bản nghiệm thu và thanh lý hợp đồng dịch vụ có xác nhận của hai bên')}
${li('Bên A nhận được hóa đơn tài chính hợp lệ và các chứng từ khác (nếu có) của bên B cung cấp')}
<p style="margin:6px 0 2px"><b>Điều 3. Trách nhiệm của các bên</b></p>
<div style="margin-left:1cm"><b>1. Trách nhiệm của bên A</b></div>
${li('Bên A có nghĩa cung cấp đầy đủ thông tin đặt chỗ và mua vé máy bay bằng các hình thức như điện thoại, email hoặc trực tiếp tại phòng vé với nhân viên bán vé của bên B')}
${li('Trong quá trình làm nếu có sự thay đổi về nhân viên giao dịch cần thông báo ngay cho bên B được biết;')}
${li('Thanh toán cho bên B theo đúng nội dung đã thỏa thuận tại Điều 2 của hợp đồng này.')}
<div style="margin-left:1cm"><b>2. Trách nhiệm của bên B</b></div>
${li('Đặt chỗ theo yêu cầu của bên A với mọi hành trình và giá cả hợp lý nhất;')}
${li('Thông báo cho bên A những thay đổi về giá, lịch bay, chương trình khuyến mại (nếu có) của hãng hàng không tại thời điểm có hiệu lực;')}
${li('Cung cấp số điện thoại, địa chỉ Email của nhân viên bán vé giao dịch với bên B ngay sau khi hợp đồng được ký.')}
<p style="margin:6px 0 2px"><b>Điều 4. Điều khoản chung</b></p>
${li('Hai bên phải tuân thủ những qui định của các hãng Hàng không về việc: Đặt chỗ, giữ chỗ, bán vé, đổi vé, hoàn vé, hủy vé và cung cấp dịch vụ hàng không khác;')}
${li('Nếu bên nào cung cấp các thông tin bị sai (tên, giờ bay, hành trình) thì bên đó chịu phí toàn bộ phí phát sinh;')}
${li('Kế toán Bên A phải chủ động theo dõi cập nhật công nợ phát sinh để đối chiếu thanh toán tránh trường hợp sai sót;')}
${li('Hai bên cam kết thực hiện đúng các điều khoản hợp đồng này;')}
${li('Trong khi thực hiện nếu có vấn đề gì vướng mắc sẽ gặp gỡ trao đổi thương lượng trên tinh thần thiện chí, tính đến quyền lợi chính đáng của mỗi bên để giải quyết vướng mắc trên.')}
<p style="margin:4px 0;text-indent:1cm;text-align:justify">Hợp đồng này được lập thành <span data-f="copiesContract">${pad(copies)}</span> bản bằng tiếng Việt, bên A giữ ${pad(copies - 1)} bản, bên B giữ 01 bản có giá trị pháp lý như nhau.</p>
${repSigns(d)}
</div>`
}

/* ---------- 2. Biên bản bàn giao vé ---------- */
function renderHandover(d) {
  const t = total(d)
  const pax = (Array.isArray(d.passengers) ? d.passengers : []).filter((p) => (p.name || '').trim())
  const row = (k, v) => `<div style="margin:1px 0">- ${k}: ${v}</div>`
  return `<div style="font-size:13pt;line-height:1.45">
${motto}
<div style="text-align:center;margin:18px 0 10px"><b style="font-size:14.5pt">BIÊN BẢN BÀN GIAO VÉ MÁY BAY</b></div>
<p style="margin:0;text-indent:1cm;font-style:italic;text-align:justify">${basisLine(d)}</p>
<p style="margin:2px 0 6px;text-indent:1cm;font-style:italic">Hôm nay, <span data-f="handoverDate">${dayMonth(d.handoverDate)}</span>, tại ${tf(d, 'bShortName')}, chúng tôi gồm:</p>
<p style="margin:4px 0 0"><b>BÊN A (Bên nhận bàn giao): ${tf(d, 'aOrg')}</b></p>
${row('Địa chỉ', tf(d, 'aAddress'))}${row('Điện thoại', tf(d, 'aPhone'))}
<div>- Đại diện bởi: ${tf(d, 'aRecvName')}&emsp;&emsp;&emsp;Chức vụ: ${tf(d, 'aRecvTitle')}</div>
<p style="margin:6px 0 0"><b>BÊN B (Bên bàn giao): ${tf(d, 'bOrg')}</b></p>
${row('Địa chỉ', tf(d, 'bAddress'))}${row('Điện thoại', tf(d, 'bPhone'))}
<div>- Đại diện bởi: ${tf(d, 'bDelivName')}&emsp;&emsp;&emsp;Chức vụ: ${tf(d, 'bDelivTitle')}</div>
<p style="margin:8px 0 4px;text-indent:1cm">Hai bên cùng thống nhất thực hiện việc bàn giao thông tin vé máy bay phục vụ chuyến công tác với các chi tiết sau:</p>
<table style="width:100%;border-collapse:collapse;font-size:12.5pt" data-f="passengers">
<tr><th style="${th};width:8%">STT</th><th style="${th}">Tên hành khách</th><th style="${th};width:20%">Hãng bay</th><th style="${th};width:14%">Mã đặt chỗ</th><th style="${th};width:22%">Ngày/giờ bay</th></tr>
${(pax.length ? pax : [{}]).map((p, i) => `<tr><td style="${td};text-align:center">${pad(i + 1)}</td><td style="${td}">${esc(p.name || '')}</td><td style="${td}">${esc(p.airline || '')}</td><td style="${td};text-align:center">${esc(p.pnr || '')}</td><td style="${td};text-align:center">${esc(p.outAt || '')}${p.backAt ? '<br>' + esc(p.backAt) : ''}</td></tr>`).join('')}
</table>
${row('Hình thức bàn giao', tf(d, 'deliveryMode') + '.')}
${row('Tổng số lượng vé', tf(d, 'ticketCountText') + '.')}
${row('Tổng giá trị', `<b data-f="items">${num(t)} đồng</b> <i data-f="items">(Viết bằng chữ: ${esc(words(t))}.)</i>`)}
<p style="margin:8px 0 2px 1cm"><b>Xác nhận chung:</b></p>
<ul style="margin:0;padding-left:1.6cm">
<li>Bên B đã bàn giao đầy đủ, chính xác thông tin vé máy bay điện tử và mã đặt chỗ cho Bên A.</li>
<li>Bên A đã kiểm tra, đối chiếu thông tin cá nhân (Họ tên, ngày sinh, chặng bay, thời gian bay) trên vé và xác nhận thông tin hoàn toàn chính xác.</li>
<li>Bên A có trách nhiệm tự bảo quản mã đặt chỗ và thực hiện thủ tục chuyến bay đúng quy định của hãng hàng không.</li>
<li>Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</li>
</ul>
${signs(tf(d, 'aRecvName'), tf(d, 'bDelivName'))}
</div>`
}

/* ---------- 3. Biên bản nghiệm thu & thanh lý ---------- */
function renderAccept(d) {
  const t = total(d)
  return `<div style="font-size:13pt;line-height:1.45">
${motto}
<div style="text-align:center;margin:18px 0 10px"><b style="font-size:14.5pt">BIÊN BẢN NGHIỆM THU VÀ THANH LÝ HỢP ĐỒNG DỊCH VỤ</b><br><b><i>(V/v: Cung cấp vé máy bay)</i></b></div>
<div style="font-style:italic;text-align:justify;text-indent:1cm">
<p style="margin:0">${basisLine(d)}</p>
<p style="margin:0">Căn cứ nội dung đã thực hiện của hai bên.</p>
<p style="margin:0">Hôm nay, <span data-f="acceptDate">${dayMonth(d.acceptDate)}</span> chúng tôi gồm:</p>
</div>
${partyFull(d, 'a')}
${partyFull(d, 'b')}
<p style="margin:8px 0;font-style:italic">Hai bên thống nhất ký thanh lý hợp đồng với các điều khoản sau:</p>
<p style="margin:6px 0 2px"><b>ĐIỀU 1: NỘI DUNG NGHIỆM THU VÀ THANH LÝ HỢP ĐỒNG.</b></p>
<p style="margin:0;text-align:justify">Bên B hoàn thành việc cung cấp vé máy bay cho bên A ${tf(d, 'routeText')}, lịch trình cụ thể như sau:</p>
${itemsTable(d)}
<!--PAGE-->
<p style="margin:6px 0 2px"><b>ĐIỀU 2: GIÁ TRỊ THANH LÝ HỢP ĐỒNG</b></p>
<p style="margin:0;text-indent:1cm">Giá trị hợp đồng đã ký kết: <b data-f="items">${num(t)} đồng</b>.</p>
<p style="margin:0;text-indent:1cm;font-style:italic" data-f="items">Bằng chữ: ${esc(words(t))}./.</p>
<p style="margin:6px 0 2px"><b>ĐIỀU 3: ĐIỀU KHOẢN THANH TOÁN</b></p>
<p style="margin:0;text-indent:1cm">Bên B cung cấp hóa đơn GTGT và các giấy tờ theo quy định khác cho bên A.</p>
<p style="margin:0;text-indent:1cm;text-align:justify">Bên A sẽ thanh toán cho bên B toàn bộ số giá trị hợp đồng còn lại sau khi hai bên ký biên bản Thanh lý hợp đồng.</p>
<p style="margin:6px 0 2px"><b>ĐIỀU 4: ĐIỀU KHOẢN THI HÀNH</b></p>
<p style="margin:0;text-indent:1cm;text-align:justify">Sau khi bên A hoàn thành nghĩa vụ thanh toán cho bên B, hợp đồng ${tf(d, 'contractNo')} giữa Đại học Kinh tế Thành phố Hồ Chí Minh và ${tf(d, 'bShortName')} sẽ hết hiệu lực.</p>
<p style="margin:0;text-indent:1cm;text-align:justify">Biên bản thanh lý được lập thành 03 bản, bên A giữ 02 bản, bên B giữ 01 bản và có giá trị pháp lý như nhau./.</p>
${repSigns(d)}
</div>`
}

const base = {
  category: 'Hậu cần & Di chuyển',
  icon: 'Plane',
  family: 'ticket',
  defaults: ticketDefaults,
  fileTag: (d) => String(d.contractNo || 'HDDV').replace(/[^\w]+/g, '_'),
}
export const TICKET_TEMPLATES = {
  ticketContract: {
    ...base, id: 'ticketContract',
    name: 'Hợp đồng dịch vụ cung cấp vé máy bay',
    source: 'HĐ - Máy bay Rennes đợt 1.pdf',
    desc: 'Hợp đồng trọn gói với đại lý vé; giá trị và số tiền bằng chữ tự tính.',
    fileName: (d) => `Hop_dong_dich_vu_ve_may_bay_${base.fileTag(d)}`,
    titleOf: (d) => `Hợp đồng dịch vụ vé máy bay ${d.contractNo || ''}`,
    form: [S_CONTRACT, S_ITEMS, S_A, S_B],
    render: renderContract,
  },
  ticketHandover: {
    ...base, id: 'ticketHandover',
    name: 'Biên bản bàn giao vé máy bay',
    source: 'BBNT - Máy bay Rennes đợt 1.pdf (trang 1–2)',
    desc: 'Bàn giao vé điện tử & mã đặt chỗ; hành khách và giờ bay lấy từ chuyến công tác.',
    fileName: (d) => `Bien_ban_ban_giao_ve_${base.fileTag(d)}`,
    titleOf: (d) => `Biên bản bàn giao vé máy bay – HĐ ${d.contractNo || ''}`,
    form: [{ ...S_CONTRACT, title: 'Căn cứ hợp đồng', fields: S_CONTRACT.fields.filter((f) => ['contractNo', 'contractDate'].includes(f.k)) }, S_HANDOVER, S_PAX, S_ITEMS, { ...S_A, fields: S_A.fields.filter((f) => ['aOrg', 'aAddress'].includes(f.k)) }, { ...S_B, fields: S_B.fields.filter((f) => ['bOrg', 'bShortName', 'bAddress'].includes(f.k)) }],
    render: renderHandover,
  },
  ticketAccept: {
    ...base, id: 'ticketAccept',
    name: 'Biên bản nghiệm thu & thanh lý HĐ vé máy bay',
    source: 'BBNT - Máy bay Rennes đợt 1.pdf (trang 3–4)',
    desc: 'Nghiệm thu và thanh lý hợp đồng dịch vụ vé máy bay.',
    fileName: (d) => `Bien_ban_nghiem_thu_thanh_ly_${base.fileTag(d)}`,
    titleOf: (d) => `Biên bản nghiệm thu & thanh lý – HĐ ${d.contractNo || ''}`,
    form: [{ ...S_CONTRACT, title: 'Căn cứ hợp đồng', fields: [...S_CONTRACT.fields.filter((f) => f.k !== 'payMethod'), { k: 'acceptDate', label: 'Ngày nghiệm thu & thanh lý', type: 'date', req: true, span: 4, after: 'contractDate' }] }, S_ITEMS, S_A, S_B],
    render: renderAccept,
  },
}
