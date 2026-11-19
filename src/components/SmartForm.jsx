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
    const grow = row.filter((c) => c.grow)
    while (left > 0 && grow.length) {
      for (const c of grow) { if (left <= 0) break; c.span++; left-- }
    }
    out.push(...row)
    row = []
    used = 0
  }
  for (const fd of fields) {
    const s = Math.min(12, baseSpan(fd))
    if (used + s > 12) flush()
    row.push({ fd, span: s, grow: !NARROW_TYPES.includes(fd.type) && !fd.span })
    used += s
    if (used >= 12) flush()
  }
  flush()
  return out
}

/* Fields whose value must not be earlier than another field */
const AFTER = { teachTo: 'teachFrom', checkOut: 'checkIn', contractTo: 'contractFrom', end: 'start', validTo: 'validFrom', returnAt: 'arriveAt' }
const INT_KEY = /(count|copies|hours|days|credits|guests|rooms|years|qty|nights|paperCopies|scriptsCount)/i

const digitsOf = (s) => String(s ?? '').replace(/\D/g, '')

/* Returns an error message ('' when valid). `all` is the whole record (for cross-field rules). */
export function validate(fd, v, all = {}, labelOf = (k) => k) {
  if (['checklist', 'file', 'rows'].includes(fd.type)) return ''
  const s = v == null ? '' : String(v).trim()
  if (!s) return fd.req ? 'Bắt buộc nhập' : ''
  const after = fd.after ?? AFTER[fd.k]
  if (after && all[after] && ['date', 'time', 'datetime'].includes(fd.type) && s < String(all[after])) {
    return `Không được trước “${labelOf(after)}”`
  }
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
  return ''
}

/* Small counter / helper text shown at the right of the label */
export function hintOf(fd, v) {
  const s = v == null ? '' : String(v)
  if (fd.type === 'phone' && s) return `${digitsOf(s).length} chữ số`
  if (fd.k === 'studentId' && s) return `${s.trim().length}/12`
  if (/passport$/i.test(fd.k) && s) return `${s.trim().length} ký tự`
  if (fd.maxLen) return `${s.length}/${fd.maxLen}`
  if ((fd.type === 'number' || fd.type === 'money') && s !== '' && Math.abs(+v) >= 10000) return (+v).toLocaleString('vi-VN')
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
export function RowsInput({ fd, value, onChange, onFocus }) {
  const rows = Array.isArray(value) ? value : []
  const cols = fd.columns || []
  const set = (i, k, x) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: x } : r)))
  const blank = () => Object.fromEntries(cols.map((c) => [c.k, c.def ?? '']))
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
                const err = c.type === 'number' ? validate({ ...c, type: 'number' }, r[c.k]) : ''
                return (
                  <td key={c.k} className={cx(err && 'has-err')} title={err}>
                    {c.type === 'number'
                      ? <input className="input" type="number" min={0} step="any" value={r[c.k] ?? ''} onChange={(e) => set(i, c.k, e.target.value === '' ? '' : +e.target.value)} />
                      : <input className="input" value={r[c.k] ?? ''} placeholder={c.ph || ''} onChange={(e) => set(i, c.k, e.target.value)} />}
                  </td>
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
