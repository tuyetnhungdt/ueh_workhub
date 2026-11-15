// Đọc vé máy bay (e-ticket / itinerary PDF) → trích chuyến bay, giờ bay, mã đặt chỗ, giá vé
let pdfjsP = null
async function pdfjs() {
  if (!pdfjsP) {
    pdfjsP = Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(([lib, w]) => {
      lib.GlobalWorkerOptions.workerSrc = w.default
      return lib
    })
  }
  return pdfjsP
}

/* Lấy toàn bộ chữ trong PDF (giữ xuống dòng theo vị trí) */
export async function pdfText(file) {
  const lib = await pdfjs()
  const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  let out = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const c = await page.getTextContent()
    let lastY = null
    for (const it of c.items) {
      const y = Math.round(it.transform[5])
      if (lastY != null && Math.abs(y - lastY) > 3) out += '\n'
      else if (out && !out.endsWith(' ') && !out.endsWith('\n')) out += ' '
      out += it.str
      lastY = y
    }
    out += '\n\n'
  }
  return out.replace(/[ \t]+/g, ' ').trim()
}

const AIRPORTS = 'CDG ORY RNS NTE SGN HAN DAD CXR PQC BKK SIN DOH DXB AUH IST FRA MUC AMS HKG ICN NRT CAN PEK PVG KUL TPE LHR'.split(' ')
const CITY = { CDG: 'Paris CDG', ORY: 'Paris Orly', RNS: 'Rennes', SGN: 'TP.HCM', HAN: 'Hà Nội' }
const MONTHS = { JAN: 1, JANV: 1, FEB: 2, FEV: 2, 'FÉV': 2, FÉVR: 2, MAR: 3, MARS: 3, APR: 4, AVR: 4, MAY: 5, MAI: 5, JUN: 6, JUIN: 6, JUL: 7, JUIL: 7, AUG: 8, AOU: 8, 'AOÛ': 8, AOUT: 8, 'AOÛT': 8, SEP: 9, SEPT: 9, OCT: 10, NOV: 11, DEC: 12, 'DÉC': 12 }
const pad = (n) => String(n).padStart(2, '0')
const fixYear = (y, m) => {
  if (!y) { const now = new Date(); let yy = now.getFullYear(); if (m < now.getMonth() - 3) yy++; return yy }
  y = +y
  return y < 100 ? 2000 + y : y
}
function findDates(s) {
  const out = []
  const re = /(\d{4})-(\d{2})-(\d{2})|(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})|(\d{1,2})\s?([A-Za-zÀ-ÿ]{3,5})\.?,?\s?(\d{4}|\d{2}(?!:|\d|h))?/g
  let m
  while ((m = re.exec(s))) {
    if (m[1]) out.push({ at: m.index, v: `${m[1]}-${m[2]}-${m[3]}` })
    else if (m[4]) { const mo = +m[5]; if (mo >= 1 && mo <= 12 && +m[4] <= 31) out.push({ at: m.index, v: `${fixYear(m[6], mo)}-${pad(mo)}-${pad(m[4])}` }) }
    else { const mo = MONTHS[m[8].toUpperCase()]; if (mo && +m[7] <= 31) out.push({ at: m.index, v: `${fixYear(m[9], mo)}-${pad(mo)}-${pad(m[7])}` }) }
  }
  return out
}
const findTimes = (s) => [...s.matchAll(/(?<![\d.,])([01]?\d|2[0-3])[:hH]([0-5]\d)(?![\d])/g)].map((m) => ({ at: m.index, v: `${pad(m[1])}:${m[2]}` }))

export function parseTicket(text) {
  const t = text.replace(/ /g, ' ')
  const flights = []
  const reF = /\b(AF|VN|KL|QR|EK|TK|SQ|CX|LH|EY|BA|VJ|QH|TG|MH|CI|KE)\s?(\d{1,4})\b/g
  let m
  while ((m = reF.exec(t))) {
    const code = `${m[1]} ${m[2]}`
    if (flights.some((f) => f.code === code)) continue
    const win = t.slice(Math.max(0, m.index - 40), m.index + 320)
    const aps = [...win.matchAll(/\b([A-Z]{3})\b/g)].map((x) => x[1]).filter((x) => AIRPORTS.includes(x))
    const uniq = aps.filter((x, i) => aps.indexOf(x) === i)
    const after = t.slice(m.index, m.index + 320)
    const ds = findDates(after), ts = findTimes(after)
    if (!ds.length && !ts.length && uniq.length < 2) continue
    const d1 = ds[0]?.v, d2 = ds[1]?.v || d1
    flights.push({ code, from: uniq[0] || '', to: uniq[1] || '', depart: d1 && ts[0] ? `${d1}T${ts[0].v}` : d1 ? `${d1}T00:00` : '', arrive: d2 && ts[1] ? `${d2}T${ts[1].v}` : '' })
  }
  flights.sort((a, b) => (a.depart || '9').localeCompare(b.depart || '9'))
  // Chiều đi: các chặng tới SGN; chiều về: các chặng rời SGN
  const iIn = flights.findIndex((f) => f.to === 'SGN')
  const outLegs = iIn >= 0 ? flights.slice(0, iIn + 1) : flights.slice(0, 1)
  const backLegs = flights.slice(outLegs.length)
  const leg = (legs) => (legs.length ? `${legs.map((f) => f.code).join(' + ')} · ${legs[0].from || '?'} → ${legs[legs.length - 1].to || '?'}` : '')
  const get = (re) => (t.match(re) || [])[1]?.trim() || ''
  const pnr = get(/(?:booking ref(?:erence)?|reservation (?:code|number)|référence de (?:réservation|dossier)|PNR|m[ãa] đặt chỗ|confirmation(?: number| code)?|code de réservation)\s*[:#]?\s*([A-Z0-9]{6})\b/i)
  const ticketNo = get(/(?:ticket (?:number|no)|e-?ticket|n° de billet|số vé)\s*[:#]?\s*(\d{3}[-\s]?\d{10})/i) || (t.match(/\b(057|738)[-\s]?\d{10}\b/) || [])[0] || ''
  const pax = get(/\b([A-Z][A-Z'-]+\/[A-Z][A-Z'-]+(?: [A-Z][A-Z'-]+)*)/).replace(/\s+(MR|MRS|MS|MISS|PROF|DR|MSTR)$/, '') || get(/(?:passenger|passager|hành khách|traveller|name)\s*[:]\s*([^\n]{3,40})/i)
  let price = null, currency = ''
  const pm = t.match(/(?:total(?: amount| price| fare)?|grand total|montant total|prix total|tổng cộng|tổng tiền|thành tiền)[^\n\d€]{0,25}(EUR|VND|€|USD)?\s*([\d][\d\s.,]*\d)\s*(EUR|VND|€|USD|đ|₫)?/i)
  if (pm) {
    currency = (pm[1] || pm[3] || '').replace('€', 'EUR').replace(/đ|₫/, 'VND').toUpperCase()
    let raw = pm[2].replace(/\s/g, '')
    if (/,\d{2}$/.test(raw)) raw = raw.replace(/\./g, '').replace(',', '.')
    else if (/\.\d{2}$/.test(raw)) raw = raw.replace(/,/g, '')
    else raw = raw.replace(/[.,]/g, '')
    price = +raw || null
    if (!currency) currency = price > 100000 ? 'VND' : 'EUR'
  }
  const name = pax ? pax.split('/').reverse().map((x) => x.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())).join(' ') : ''
  return {
    flights,
    lecturer: name,
    outFlight: leg(outLegs),
    departAt: outLegs[0]?.depart || '',
    arriveAt: outLegs[outLegs.length - 1]?.arrive || '',
    returnFlight: leg(backLegs),
    returnAt: backLegs[0]?.depart || '',
    pnr, ticketNo, price, currency,
    cities: CITY,
  }
}
