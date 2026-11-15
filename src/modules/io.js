// Tiện ích nhập/xuất: đọc email .eml, CSV, file đính kèm
import { MODE } from '../data/store.jsx'

/* ---------------- EMAIL (.eml) ---------------- */
const dec = (bytes, charset = 'utf-8') => {
  try { return new TextDecoder(charset.toLowerCase().replace(/^(us-ascii|ascii)$/, 'utf-8')).decode(bytes) } catch { return new TextDecoder('utf-8').decode(bytes) }
}
const b64bytes = (s) => { try { const bin = atob(s.replace(/\s+/g, '')); return Uint8Array.from(bin, (c) => c.charCodeAt(0)) } catch { return new Uint8Array() } }
const qpbytes = (s) => {
  const t = s.replace(/=\r?\n/g, '')
  const out = []
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(t.substr(i + 1, 2))) { out.push(parseInt(t.substr(i + 1, 2), 16)); i += 2 }
    else { const c = t.charCodeAt(i); if (c < 128) out.push(c); else out.push(...new TextEncoder().encode(t[i])) }
  }
  return new Uint8Array(out)
}
const words = (s = '') => s.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=\s*(?==\?)?/g, (_, cs, enc, txt) =>
  dec(enc.toUpperCase() === 'B' ? b64bytes(txt) : qpbytes(txt.replace(/_/g, ' ')), cs))

function splitPart(raw) {
  const i = raw.search(/\r?\n\r?\n/)
  const head = i < 0 ? raw : raw.slice(0, i)
  const body = i < 0 ? '' : raw.slice(i).replace(/^\r?\n\r?\n/, '')
  const headers = {}
  head.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/).forEach((l) => {
    const m = l.match(/^([\w-]+):\s*(.*)$/)
    if (m) headers[m[1].toLowerCase()] = m[2]
  })
  return { headers, body }
}
const param = (h = '', name) => (h.match(new RegExp(name + '\\*?=\\s*"?([^";]+)"?', 'i')) || [])[1]
function decodeBody(part) {
  const enc = (part.headers['content-transfer-encoding'] || '').toLowerCase()
  const cs = param(part.headers['content-type'], 'charset') || 'utf-8'
  if (enc === 'base64') return dec(b64bytes(part.body), cs)
  if (enc === 'quoted-printable') return dec(qpbytes(part.body), cs)
  return part.body
}
const htmlToText = (h) => {
  const d = new DOMParser().parseFromString(h.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n'), 'text/html')
  return (d.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}
function walk(part, acc) {
  const ct = (part.headers['content-type'] || 'text/plain').toLowerCase()
  const disp = part.headers['content-disposition'] || ''
  const fname = words(param(disp, 'filename') || param(part.headers['content-type'], 'name') || '')
  if (ct.startsWith('multipart/')) {
    const b = param(part.headers['content-type'], 'boundary')
    if (!b) return
    part.body.split('--' + b).slice(1).forEach((chunk) => { if (!chunk.startsWith('--')) walk(splitPart(chunk.replace(/^\r?\n/, '')), acc) })
  } else if (fname || /attachment/i.test(disp)) acc.attachments.push(fname || 'tệp đính kèm')
  else if (ct.startsWith('text/plain') && !acc.text) acc.text = decodeBody(part)
  else if (ct.startsWith('text/html') && !acc.html) acc.html = decodeBody(part)
}
export function parseEml(raw) {
  const root = splitPart(raw)
  const acc = { text: '', html: '', attachments: [] }
  walk(root, acc)
  const from = words(root.headers.from || '')
  const m = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>/)
  let receivedAt = ''
  const d = new Date(root.headers.date || '')
  if (!isNaN(d)) receivedAt = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  return {
    subject: words(root.headers.subject || '(Không có tiêu đề)').trim(),
    fromName: (m ? m[1] : from).trim() || (m ? m[2] : ''),
    fromEmail: m ? m[2].trim() : (from.match(/[\w.+-]+@[\w.-]+/) || [''])[0],
    receivedAt,
    body: (acc.text || (acc.html ? htmlToText(acc.html) : '')).trim(),
    attachments: acc.attachments,
  }
}
/* Dán nội dung email dạng text (Từ:/From:, Tiêu đề:/Subject:) */
export function parsePasted(txt) {
  const get = (re) => (txt.match(re) || [])[1]?.trim() || ''
  const from = get(/^(?:From|Từ|Người gửi)\s*:\s*(.+)$/im)
  const m = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>/)
  return {
    subject: get(/^(?:Subject|Tiêu đề|Chủ đề)\s*:\s*(.+)$/im) || txt.split('\n').find((l) => l.trim())?.slice(0, 120) || 'Email sinh viên',
    fromName: m ? m[1].trim() : from.replace(/[\w.+-]+@[\w.-]+/, '').trim(),
    fromEmail: m ? m[2] : (from.match(/[\w.+-]+@[\w.-]+/) || txt.match(/[\w.+-]+@[\w.-]+/) || [''])[0],
    receivedAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    body: txt.replace(/^(?:From|Từ|Người gửi|To|Đến|Subject|Tiêu đề|Chủ đề|Date|Ngày|Sent|Đã gửi)\s*:.*$/gim, '').trim(),
    attachments: [],
  }
}

/* ---------------- CSV ---------------- */
export function toCSV(rows, cols) {
  const esc = (v) => { const s = v == null ? '' : String(v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
  return '﻿' + [cols.map((c) => esc(c.label)).join(','), ...rows.map((r) => cols.map((c) => esc(c.get(r))).join(','))].join('\r\n')
}
export function parseCSV(text) {
  text = text.replace(/^﻿/, '')
  const sep = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : (text.split('\n')[0].includes('\t') ? '\t' : ',')
  const rows = []; let row = []; let cur = ''; let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++ } else if (c === '"') q = false; else cur += c }
    else if (c === '"') q = true
    else if (c === sep) { row.push(cur); cur = '' }
    else if (c === '\n') { row.push(cur.replace(/\r$/, '')); rows.push(row); row = []; cur = '' }
    else cur += c
  }
  if (cur || row.length) { row.push(cur.replace(/\r$/, '')); rows.push(row) }
  return rows.filter((r) => r.some((x) => x.trim()))
}
export function download(name, content, type = 'text/csv;charset=utf-8') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
/* chuẩn hóa ngày từ CSV: dd/mm/yyyy | yyyy-mm-dd */
export const normDate = (s) => {
  if (!s) return ''
  const m = String(s).trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return String(s).trim().slice(0, 10)
}

/* ---------------- FILE đính kèm ---------------- */
// Demo: lưu base64 trong trình duyệt (giới hạn 1,5MB/file). Supabase: Storage bucket "files", đường dẫn projectId/...
const DEMO_LIMIT = 1.5 * 1024 * 1024
export async function uploadFile(projectId, file) {
  const meta = { name: file.name, size: file.size, type: file.type, at: new Date().toISOString() }
  if (MODE === 'supabase') {
    const { getSupabase } = await import('../data/store.jsx')
    const sb = await getSupabase()
    const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${file.name.replace(/[^\w.\-]+/g, '_')}`
    const { error } = await sb.storage.from('files').upload(path, file, { contentType: file.type || undefined })
    if (error) throw new Error('Tải file lỗi: ' + error.message)
    return { ...meta, path }
  }
  if (file.size > DEMO_LIMIT) throw new Error(`“${file.name}” lớn hơn 1,5MB – bản demo chỉ lưu file nhỏ. Bản chính thức (Supabase) cho phép file lớn.`)
  const dataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file) })
  return { ...meta, dataUrl }
}
export const isPdf = (f) => /pdf/i.test(f.type || '') || /\.pdf$/i.test(f.name || '')
export const isImage = (f) => /^image\//i.test(f.type || '') || /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name || '')

/* Trả về URL xem được của file: { url, revoke } */
export async function fileUrl(f) {
  if (f.path) {
    const { getSupabase } = await import('../data/store.jsx')
    const sb = await getSupabase()
    const { data, error } = await sb.storage.from('files').createSignedUrl(f.path, 3600)
    if (error) throw new Error('Không mở được file: ' + error.message)
    return { url: data.signedUrl }
  }
  let blob
  if (f.dataUrl) blob = await (await fetch(f.dataUrl)).blob()
  else if (isPdf(f)) blob = samplePdf(f.name) // file mẫu của bản demo
  else throw new Error('File mẫu trong bản demo (chưa có nội dung thật).')
  const url = URL.createObjectURL(blob)
  return { url, revoke: () => URL.revokeObjectURL(url) }
}

export async function openFile(f) {
  const w = window.open('', '_blank')
  try {
    const { url } = await fileUrl(f)
    if (w) w.location.href = url
  } catch (e) { w?.close(); throw e }
}

/* PDF mẫu nhiều trang (chỉ dùng cho bản demo, để thử xem trước & lướt trang) */
function samplePdf(name, pages = 4) {
  const ascii = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[–—]/g, '-').replace(/[^\x20-\x7E]/g, '').replace(/[\\()]/g, '\\$&')
  const title = ascii(name.replace(/\.pdf$/i, '').replace(/_/g, ' '))
  const body = [
    'Tai lieu mau trong ban demo UEH WorkHub.',
    'Trong ban chinh thuc, day se la noi dung file PDF ban tai len',
    '(MOA, phu luc, cong van, bien ban, hop dong, ve may bay...).',
    '',
    'Dieu 1. Pham vi hop tac',
    'Hai ben thong nhat trien khai chuong trinh cu nhan song bang.',
    'Dieu 2. Trach nhiem cac ben',
    'Moi ben cu dau moi dieu phoi, phoi hop to chuc giang day va khao thi.',
    'Dieu 3. Tai chinh',
    'Hoc phi va chi phi van hanh duoc doi soat theo tung hoc ky.',
  ]
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>']
  const kids = []
  for (let i = 0; i < pages; i++) {
    const pageNo = objs.length + 1
    kids.push(`${pageNo} 0 R`)
    const lines = body.map((l, k) => `BT /F1 12 Tf 60 ${690 - k * 22} Td (${l}) Tj ET`).join('\n')
    const stream = `0.01 0.38 0.42 rg 0 772 595 70 re f\n0.83 0.44 0.18 rg 0 766 595 6 re f\n1 1 1 rg BT /F2 18 Tf 50 800 Td (${title.slice(0, 52)}) Tj ET\n0.06 0.16 0.17 rg\nBT /F2 14 Tf 60 725 Td (Trang ${i + 1} / ${pages}) Tj ET\n${lines}\n0.55 0.6 0.6 rg BT /F1 10 Tf 60 40 Td (UEH WorkHub - ban demo - ${title.slice(0, 40)}) Tj ET`
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${pageNo + 1} 0 R >>`)
    objs.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
  }
  objs[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages} >>`
  let out = '%PDF-1.4\n'
  const offs = objs.map((o, i) => { const at = out.length; out += `${i + 1} 0 obj\n${o}\nendobj\n`; return at })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([out], { type: 'application/pdf' })
}
export async function removeFile(f) {
  if (!f.path) return
  const { getSupabase } = await import('../data/store.jsx')
  const sb = await getSupabase()
  await sb.storage.from('files').remove([f.path])
}
export const fmtSize = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB')
