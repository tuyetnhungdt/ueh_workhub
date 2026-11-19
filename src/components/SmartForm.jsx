// Smart form layer: 12-column layout sized by content type, numbered sections,
// inline validation (digit counts, ranges, formats) and autocomplete suggestions.
// Shared by the record forms (ItemForm) and the document template studio.
import * as L from 'lucide-react'
import { cx } from '../lib/utils.js'

const NARROW_TYPES = ['date', 'time', 'number', 'phone', 'money', 'datetime']
const SHORT_KEY = /(code|^no$|No$|Id$|number|ref|room|term|cohort|count|copies|hours|days|rate|^fx$|gender|version)/i
const FULL_KEY = /(address|specializ|purpose|basis|courses|recipients|route)/i

/* Base width (out of 12 columns) a field needs for its content */
export function baseSpan(fd) {
  if (fd.span) return fd.span
  switch (fd.type) {
    case 'checklist': case 'file': case 'long': case 'rows': return 12
    case 'date': case 'time': case 'phone': return 3
    case 'number': return fd.cur ? 4 : 3
    case 'datetime': case 'money': case 'user': return 4
    case 'radio': return 6
    case 'email': return 5
    case 'select': {
      const n = Math.max(0, ...(fd.options || []).map((o) => String(o.label ?? o).length))
      return n <= 14 ? 3 : n <= 26 ? 4 : 6
    }
    default: {
      if (FULL_KEY.test(fd.k)) return 12
      if (fd.w >= 240) return 8
      if (fd.w >= 180) return 6
      if (SHORT_KEY.test(fd.k)) return 3
      if ((fd.ph || '').length > 32) return 6
      return 4
    }
  }
}

/* Pack fields into full 12-column rows in their original order: leftover space in a row
   goes to text-like fields (dates & numbers keep their compact width). */
export function packRows(fields) {
  const out = []
  let row = []
  let used = 0
  const flush = () => {
    if (!row.length) return
    let left = 12 - used
    // mỗi ô chỉ nới tối đa gấp đôi độ rộng gốc để ô ngắn không bị kéo dài quá mức
    let grow = row.filter((c) => c.grow && c.span < c.max)
    while (left > 0 && grow.length) {
      for (const c of grow) { if (left <= 0) break; c.span++; left-- }
      grow = grow.filter((c) => c.span < c.max)
    }
    out.push(...row)
    row = []
    used = 0
  }
  for (const fd of fields) {
    const s = Math.min(12, baseSpan(fd))
    if (used + s > 12) flush()
    row.push({ fd, span: s, max: Math.min(12, s * 2), grow: !NARROW_TYPES.includes(fd.type) && !fd.span })
    used += s
    if (used >= 12) flush()
  }
  flush()
  return out
}

/* Fields whose value must not be earlier than another field */
const AFTER = { teachTo: 'teachFrom', checkOut: 'checkIn', contractTo: 'contractFrom', end: 'start', validTo: 'validFrom', returnAt: 'arriveAt', arriveAt: 'departAt', acceptanceDate: 'contractFrom', councilDate: 'date', publishedAt: 'date', gradesReceivedAt: 'scriptsSentAt' }
const INT_KEY = /(count|copies|hours|days|credits|guests|rooms|years|qty|nights|paperCopies|scriptsCount)/i
const PAST_ONLY = /(dob|birth|PassportDate|issueDate|issued)$/i // ngày sinh, ngày cấp: không thể ở tương lai

const digitsOf = (s) => String(s ?? '').replace(/\D/g, '')
const p2 = (n) => String(n).padStart(2, '0')
export const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

/* Đọc ngày từ ISO (2026-12-22, 2026-12-22T08:00) hoặc dd/mm/yyyy, dd.mm.yyyy, dd-mm-yyyy (kèm giờ 14h05 / 14:05).
   Trả về { y, m, d, hh, mm, key, valid } hoặc null nếu không phải chuỗi ngày. */
export function parseDate(v) {
  const s = String(v ?? '').trim()
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/.exec(s)
  let y, mo, d, hh = 0, mi = 0
  if (m) { [, y, mo, d] = m.map(Number); if (m[4]) { hh = +m[4]; mi = +m[5] } } else {
    m = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})(?:\s*[/ ,]\s*(\d{1,2})\s*[h:]\s*(\d{2}))?/.exec(s)
    if (!m) return null
    d = +m[1]; mo = +m[2]; y = +m[3]; if (m[4]) { hh = +m[4]; mi = +m[5] }
  }
  const dt = new Date(Date.UTC(y, mo - 1, d))
  const valid = dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d && hh < 24 && mi < 60
  return { y, m: mo, d, hh, mm: mi, valid, dow: dt.getUTCDay(), key: `${y}-${p2(mo)}-${p2(d)}T${p2(hh)}:${p2(mi)}` }
}
const todayKey = () => { const t = new Date(); return `${t.getFullYear()}-${p2(t.getMonth() + 1)}-${p2(t.getDate())}` }

/* Tìm “thứ” viết kèm ngày trong văn bản tự do và kiểm tra có khớp lịch không (vd: “Thứ Hai, 22/12/2026”). */
const DOW_WORDS = [
  [0, /chủ\s*nhật|\bcn\b|sunday|dimanche/i],
  [1, /thứ\s*(hai|2)\b|\bt2\b|monday|lundi/i],
  [2, /thứ\s*(ba|3)\b|\bt3\b|tuesday|mardi/i],
  [3, /thứ\s*(tư|bốn|4)\b|\bt4\b|wednesday|mercredi/i],
  [4, /thứ\s*(năm|5)\b|\bt5\b|thursday|jeudi/i],
  [5, /thứ\s*(sáu|6)\b|\bt6\b|friday|vendredi/i],
  [6, /thứ\s*(bảy|7)\b|\bt7\b|saturday|samedi/i],
]
export function weekdayMismatch(text) {
  const s = String(text ?? '')
  const re = /(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})/g
  let m
  while ((m = re.exec(s))) {
    const p = parseDate(m[0])
    if (!p) continue
    if (!p.valid) return `Ngày ${m[0]} không tồn tại`
    // chỉ xét cụm chữ sát ngày (trước hoặc sau, cùng mệnh đề)
    const near = s.slice(Math.max(0, m.index - 16), m.index) + ' | ' + s.slice(m.index + m[0].length, m.index + m[0].length + 16)
    const found = DOW_WORDS.find(([, rx]) => rx.test(near))
    if (found && found[0] !== p.dow) return `${m[0]} là ${WEEKDAYS[p.dow]}, không phải ${WEEKDAYS[found[0]]}`
  }
  return ''
}

/* Returns an error message ('' when valid). `all` is the whole record (for cross-field rules). */
export function validate(fd, v, all = {}, labelOf = (k) => k) {
  if (['checklist', 'file', 'rows'].includes(fd.type)) return ''
  const s = v == null ? '' : String(v).trim()
  if (!s) return fd.req ? 'Bắt buộc nhập' : ''

  // ---- ngày tháng: tồn tại, năm hợp lý, không ở tương lai (ngày sinh/ngày cấp), không trước ngày bắt đầu
  const isDateField = ['date', 'datetime'].includes(fd.type) || fd.pattern?.includes('\\d{4}$')
  const pd = isDateField ? parseDate(s) : null
  if (isDateField && pd) {
    if (!pd.valid) return `Ngày ${s} không tồn tại`
    if (pd.y < 1900 || pd.y > 2100) return 'Năm không hợp lệ'
    if (PAST_ONLY.test(fd.k) && pd.key.slice(0, 10) > todayKey()) return 'Không thể là ngày trong tương lai'
    if (/(^|[a-z])dob$|birth/i.test(fd.k)) {
      const age = +todayKey().slice(0, 4) - pd.y
      if (age < 18 || age > 100) return `Tuổi ${age} không hợp lý (cần 18–100)`
    }
  }
  const after = fd.after ?? AFTER[fd.k]
  if (after && all[after]) {
    const a = parseDate(all[after]), b = parseDate(s)
    const cmp = a && b ? b.key < a.key : fd.type === 'time' ? s < String(all[after]) : false
    if (cmp) return `Không được sớm hơn “${labelOf(after)}”${a ? ` (${p2(a.d)}/${p2(a.m)}/${a.y})` : ''}`
  }
  if (fd.check) { const e = fd.check(v, all); if (e) return e }

  switch (fd.type) {
    case 'number': case 'money': {
      const n = +v
      if (Number.isNaN(n)) return 'Phải là số'
      if (n < 0 && !fd.neg) return 'Không được nhập số âm'
      if ((fd.int ?? INT_KEY.test(fd.k)) && !Number.isInteger(n)) return 'Phải là số nguyên'
      const maxDigits = fd.digits ?? (fd.type === 'money' ? 13 : 9)
      if (digitsOf(Math.trunc(Math.abs(n))).length > maxDigits) return `Tối đa ${maxDigits} chữ số`
      if (fd.min != null && n < fd.min) return `Tối thiểu ${fd.min}`
      if (fd.max != null && n > fd.max) return `Tối đa ${fd.max}`
      if (fd.maxOf && all[fd.maxOf] !== '' && all[fd.maxOf] != null && n > +all[fd.maxOf]) return `Không vượt quá “${labelOf(fd.maxOf)}” (${(+all[fd.maxOf]).toLocaleString('vi-VN')})`
      return ''
    }
    case 'phone': {
      if (/[^\d\s+().\-]/.test(s)) return 'Chỉ gồm chữ số, dấu + . - và khoảng trắng'
      const n = digitsOf(s).length
      if (!s.startsWith('+') && s.startsWith('0') && n !== 10) return `SĐT Việt Nam cần đúng 10 chữ số (đang có ${n})`
      if (n < 8 || n > 15) return `Cần 8–15 chữ số (đang có ${n})`
      return ''
    }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? '' : 'Email chưa đúng định dạng (vd: ten@ueh.edu.vn)'
    case 'date': case 'datetime': case 'time': case 'select': case 'radio':
      return ''
    default:
      break
  }
  if (fd.k === 'studentId' && !/^[A-Za-z0-9]{6,12}$/.test(s)) return 'MSSV gồm 6–12 ký tự chữ/số, không dấu cách'
  if (/passport$/i.test(fd.k) && !/^[A-Za-z0-9]{6,12}$/.test(s)) return 'Số hộ chiếu gồm 6–12 ký tự chữ/số'
  if (/bankAccount$/i.test(fd.k)) {
    const c = s.replace(/\s/g, '')
    if (!/^[A-Za-z]{2}\d{2}[A-Za-z0-9]{8,30}$/.test(c) && !/^\d{6,20}$/.test(c)) return 'IBAN (vd: FR76 1007…) hoặc số TK 6–20 chữ số'
  }
  if (/taxCode$/i.test(fd.k) && /^\d+$/.test(s.replace(/[\s-]/g, ''))) {
    const n = digitsOf(s).length
    if (n !== 10 && n !== 12 && n !== 13) return `Mã số thuế cần 10, 12 hoặc 13 chữ số (đang có ${n})`
  }
  if (fd.pattern && !new RegExp(fd.pattern).test(s)) return fd.patternMsg || 'Sai định dạng'
  if (fd.maxLen && s.length > fd.maxLen) return `Tối đa ${fd.maxLen} ký tự`
  // văn bản tự do có ghi kèm thứ + ngày: kiểm tra thứ có đúng lịch không
  const wd = weekdayMismatch(s)
  if (wd) return wd
  return ''
}

/* Kiểm tra bảng nhiều dòng: trả về [{ row, k, msg }] (thiếu cột bắt buộc, sai định dạng, quy tắc theo dòng) */
export function validateRows(fd, rows) {
  const out = []
  const list = Array.isArray(rows) ? rows : []
  if (fd.req && !list.length) out.push({ row: -1, k: '', msg: 'Cần ít nhất 1 dòng', missing: true })
  list.forEach((r, i) => {
    for (const c of fd.columns || []) {
      const e = validate({ ...c, type: c.type || 'text' }, r[c.k], r)
      if (e) out.push({ row: i, k: c.k, msg: `${c.label}: ${e}`, missing: e === 'Bắt buộc nhập' })
    }
    if (fd.rowCheck) { const e = fd.rowCheck(r); if (e) out.push({ row: i, k: '', msg: e }) }
  })
  return out
}

/* Small counter / helper text shown at the right of the label */
export function hintOf(fd, v) {
  const s = v == null ? '' : String(v)
  if (fd.type === 'phone' && s) return `${digitsOf(s).length} chữ số`
  if (fd.k === 'studentId' && s) return `${s.trim().length}/12`
  if (/passport$/i.test(fd.k) && s) return `${s.trim().length} ký tự`
  if (fd.maxLen) return `${s.length}/${fd.maxLen}`
  if ((fd.type === 'number' || fd.type === 'money') && s !== '' && Math.abs(+v) >= 10000) return (+v).toLocaleString('vi-VN')
  if ((fd.type === 'date' || fd.type === 'datetime' || fd.pattern?.includes('\\d{4}$')) && s) {
    const p = parseDate(s)
    if (p?.valid) return WEEKDAYS[p.dow] // hiện thứ để người nhập tự đối chiếu
  }
  return fd.unit || ''
}

/* ---------- Building blocks ---------- */
export function FormSection({ no, title, desc, children, aside }) {
  return (
    <section className="sf-sec">
      <header className="sf-sec-head">
        {no != null && <span className="sf-sec-no">{no}</span>}
        <b>{title}</b>
        {desc && <span className="sf-sec-desc">{desc}</span>}
        {aside && <span className="sf-sec-aside">{aside}</span>}
      </header>
      <div className="sf-grid">{children}</div>
    </section>
  )
}

export function FieldCell({ fd, span, error, hint, children, onBlur, id }) {
  return (
    <div className={cx('sf-cell', error && 'has-err')} style={{ '--sp': span, '--sp-md': span <= 4 ? 6 : 12 }} onBlur={onBlur} data-field={fd.k}>
      <label className="sf-label" htmlFor={id}>
        <span>{fd.label}{fd.req && <span className="sf-req">*</span>}</span>
        {hint && <span className="sf-hint">{hint}</span>}
      </label>
      {children}
      {error ? <div className="sf-err"><L.AlertCircle size={12} />{error}</div> : fd.help ? <div className="sf-help">{fd.help}</div> : null}
    </div>
  )
}

/* Generic input for plain field types (text, email, phone, number, money, date, time, datetime, select, radio, long) */
export function SmartInput({ fd, value, onChange, id, listId, onFocus }) {
  const v = value ?? ''
  const common = { id, className: 'input', onFocus }
  switch (fd.type) {
    case 'long':
      return <textarea id={id} className="textarea" rows={fd.rows || 3} placeholder={fd.ph || ''} value={v} onFocus={onFocus} onChange={(e) => onChange(e.target.value)} />
    case 'select':
      return (
        <select id={id} className="select" value={v} onFocus={onFocus} onChange={(e) => onChange(e.target.value)}>
          {!fd.noEmpty && <option value="">— Chọn —</option>}
          {(fd.options || []).map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      )
    case 'radio':
      return (
        <div className="sf-radio" role="radiogroup" id={id}>
          {(fd.options || []).map((o) => {
            const val = o.value ?? o
            return (
              <label key={val} className={cx('sf-radio-opt', v === val && 'on')}>
                <input type="radio" name={id} checked={v === val} onFocus={onFocus} onChange={() => onChange(val)} />
                <span>{o.label ?? o}</span>
              </label>
            )
          })}
        </div>
      )
    case 'date': return <input {...common} type="date" value={v} onChange={(e) => onChange(e.target.value)} />
    case 'time': return <input {...common} type="time" value={v} onChange={(e) => onChange(e.target.value)} />
    case 'datetime': return <input {...common} type="datetime-local" value={v} onChange={(e) => onChange(e.target.value)} />
    case 'number': case 'money':
      return (
        <div className="sf-num">
          <input {...common} type="number" inputMode="decimal" step={fd.step || 'any'} min={fd.neg ? undefined : 0} placeholder={fd.ph || '0'} value={v}
            onChange={(e) => onChange(e.target.value === '' ? '' : +e.target.value)} />
          {fd.suffix && <span className="sf-suffix">{fd.suffix}</span>}
        </div>
      )
    case 'phone':
      return <input {...common} type="tel" inputMode="tel" maxLength={20} placeholder={fd.ph || 'VD: 0909 123 456 / +33 6 …'} value={v} onChange={(e) => onChange(e.target.value)} />
    case 'email':
      return <input {...common} type="email" inputMode="email" placeholder={fd.ph || 'ten@domain.com'} value={v} onChange={(e) => onChange(e.target.value)} />
    default:
      return <input {...common} type="text" list={listId} maxLength={fd.maxLen ? fd.maxLen + 20 : undefined} placeholder={fd.ph || ''} value={v} onChange={(e) => onChange(e.target.value)} />
  }
}

/* Editable table for repeated rows (line items, guest list…) */
export function RowsInput({ fd, value, onChange, onFocus, showMissing }) {
  const rows = Array.isArray(value) ? value : []
  const cols = fd.columns || []
  const set = (i, k, x) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: x } : r)))
  const blank = () => Object.fromEntries(cols.map((c) => [c.k, c.def ?? '']))
  // lỗi định dạng hiện ngay; lỗi thiếu chỉ hiện khi đã yêu cầu kiểm tra
  const cellErr = (r, c) => { const e = validate({ ...c, type: c.type || 'text' }, r[c.k], r); return e && (e !== 'Bắt buộc nhập' || showMissing) ? e : '' }
  const cellInput = (r, i, c) => (c.type === 'number'
    ? <input className="input" type="number" min={0} step="any" value={r[c.k] ?? ''} onChange={(e) => set(i, c.k, e.target.value === '' ? '' : +e.target.value)} />
    : <input className="input" value={r[c.k] ?? ''} placeholder={c.ph || ''} onChange={(e) => set(i, c.k, e.target.value)} />)
  if (fd.cards) {
    // Mỗi dòng là một thẻ nhỏ: nhiều cột vẫn đủ rộng để nhập
    return (
      <div className="sf-rows" onFocus={onFocus}>
        {rows.map((r, i) => (
          <div key={i} className="sf-rowcard">
            <span className="sf-rowcard-no">{i + 1}</span>
            <div className="sf-rowcard-grid">
              {cols.map((c) => {
                const err = cellErr(r, c)
                return (
                  <label key={c.k} className={cx('sf-rowcard-f', err && 'has-err')} style={{ gridColumn: `span ${c.span || 6}` }} title={err}>
                    <span>{c.label}</span>{cellInput(r, i, c)}
                  </label>
                )
              })}
              {fd.total && <div className="sf-rowcard-f sf-rowcard-total" style={{ gridColumn: `span ${fd.total.span || 3}` }}><span>{fd.total.label}</span><b>{fd.total.fn(r)}</b></div>}
              {(() => {
                const msgs = [...cols.map((c) => cellErr(r, c) && `${c.label}: ${cellErr(r, c)}`), fd.rowCheck && fd.rowCheck(r)].filter(Boolean)
                return msgs.length ? <div className="sf-err" style={{ gridColumn: '1 / -1', flexWrap: 'wrap' }}><L.AlertCircle size={12} />{msgs.join(' · ')}</div> : null
              })()}
            </div>
            <button type="button" className="iconbtn" aria-label="Xóa dòng" onClick={() => onChange(rows.filter((_, j) => j !== i))}><L.Trash2 size={14} /></button>
          </div>
        ))}
        <button type="button" className="btn sm" onClick={() => onChange([...rows, blank()])}><L.Plus size={14} />{fd.addLabel || 'Thêm dòng'}</button>
      </div>
    )
  }
  return (
    <div className="sf-rows" onFocus={onFocus}>
      <table>
        <thead>
          <tr>
            <th style={{ width: 34 }}>#</th>
            {cols.map((c) => <th key={c.k} style={{ width: c.w }}>{c.label}</th>)}
            {fd.total && <th style={{ width: 110 }}>{fd.total.label}</th>}
            <th style={{ width: 34 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="sf-rows-no">{i + 1}</td>
              {cols.map((c) => {
                const err = cellErr(r, c)
                return (
                  <td key={c.k} className={cx(err && 'has-err')} title={err}>{cellInput(r, i, c)}</td>
                )
              })}
              {fd.total && <td className="sf-rows-total">{fd.total.fn(r)}</td>}
              <td><button type="button" className="iconbtn" aria-label="Xóa dòng" onClick={() => onChange(rows.filter((_, j) => j !== i))}><L.X size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn sm" onClick={() => onChange([...rows, blank()])}><L.Plus size={14} />{fd.addLabel || 'Thêm dòng'}</button>
    </div>
  )
}
