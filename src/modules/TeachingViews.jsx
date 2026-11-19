import { useMemo, useState } from 'react'
import * as L from 'lucide-react'
import { useUI } from '../App.jsx'
import { MODULE, sameName, prefsText } from './schema.js'
import {
  relatedOf, itemLabel, lecturerDocs, tripWindow, tripCohortCoverage, termWeek, sessionCohorts, addDays, dayDiff, surname,
  COHORTS, COHORT_TERMS, TEACHING_PLAN, K52_RENNES_PLAN, K52_HK1, courseKey,
} from './links.js'
import './teaching.css'

const fmtD = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '')
const fmtDY = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '')
const monday = (iso) => { const d = new Date(iso.slice(0, 10) + 'T00:00:00Z'); const k = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - k); return d.toISOString().slice(0, 10) }
const LEC_COLORS = ['#0b7480', '#d4712f', '#7c4dbd', '#2f7d32', '#c2185b', '#1565c0', '#8d6e63', '#00897b']
const MONTHS = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']
const SHORT = [
  [/phai sinh|derivative/, 'Phái sinh'], [/tai chinh quoc te|international finance/, 'TC quốc tế'], [/chuoi thoi gian|time series/, 'Chuỗi thời gian'],
  [/vi mo 2|macroeconomic 2/, 'Macro 2'], [/vi mo|macroeconom/, 'Vĩ mô'], [/tien te|money banking/, 'Tiền tệ–NH'], [/du lieu bang|panel/, 'Dữ liệu bảng'],
  [/kinh te luong tai chinh|financial econometrics/, 'KTL tài chính'], [/introduction to r/, 'Intro R'], [/forecast/, 'Dự báo NC'],
  [/applied micro/, 'Vi mô UD'], [/microeconomic 2/, 'Micro 2'], [/financial market/, 'Thị trường TC'], [/python/, 'Python'],
]
const shortCourse = (c = '') => { const k = courseKey(c); return SHORT.find(([re]) => re.test(k))?.[1] || c.slice(0, 14) }

/* ===================== KHUNG LIÊN KẾT DỮ LIỆU (trong form bản ghi) ===================== */
export function RelatedPanel({ item, items, projectId }) {
  const { go } = useUI()
  const [open, setOpen] = useState(true)
  const [more, setMore] = useState({})
  const groups = useMemo(() => relatedOf(item, items), [item, items])
  const lec = item.module === 'trips' ? items.find((x) => x.module === 'lecturers' && sameName(x.fullName, item.lecturer)) : null
  const passports = lec ? lecturerDocs(lec, items).filter((f) => f.kind === 'passport') : []
  if (!item.id || (!groups.length && !lec)) return null
  const total = groups.reduce((s, g) => s + g.items.length, 0)
  const goItem = (r) => {
    if (r.module === 'lecturers') go(`/projects/${projectId}/lecturers?lec=${r.id}`)
    else go(`/projects/${projectId}/work/${r.module}?item=${r.id}`)
  }
  return (
    <div className="rel-panel">
      <button type="button" className="rel-head" onClick={() => setOpen(!open)}>
        <L.Link2 size={15} />
        <b>Liên kết dữ liệu</b>
        <span className="rel-count">{total} bản ghi · {groups.length} phân hệ</span>
        <span className="grow" />
        {open ? <L.ChevronUp size={15} /> : <L.ChevronDown size={15} />}
      </button>
      {open && (
        <div className="rel-body">
          {lec && (
            <div className="rel-shared">
              <div className="rel-g-title"><L.IdCard size={14} />Dùng chung với hồ sơ giảng viên (mục 05) – sửa một nơi, mọi nơi cùng thấy</div>
              <div className="rel-kv">
                <span>Hộ chiếu</span><b>{[lec.passport, lec.passportIssued].filter(Boolean).join(' · ') || (passports.length ? 'Có bản scan' : '—')}</b>
                <span>Số HĐ thỉnh giảng</span><b>{lec.contractNo || item.contractNo || '—'}{lec.contractStatus ? ` · ${lec.contractStatus}` : ''}</b>
                <span>Email</span><b>{lec.email || '—'}</b>
                {prefsText(lec) && <><span>Yêu cầu riêng</span><b>{prefsText(lec)}</b></>}
              </div>
              {passports.length > 0 && <div className="rel-files">{passports.map((f) => <span key={f.name} className="chip"><L.BookUser size={12} />{f.name}</span>)}</div>}
              <button type="button" className="btn sm ghost" onClick={() => goItem(lec)}><L.UserRound size={13} />Mở hồ sơ {lec.fullName}</button>
            </div>
          )}
          {groups.map((g) => {
            const shown = more[g.module] ? g.items : g.items.slice(0, 8)
            const sum = g.module === 'expenses' ? g.items.reduce((s, r) => s + (+r.amount || 0), 0) : 0
            return (
              <div key={g.module} className="rel-group">
                <div className="rel-g-title">
                  <span className="rel-mod">{MODULE[g.module]?.name || g.module}</span>
                  <span className="muted">· {g.items.length} {MODULE[g.module]?.item || 'bản ghi'}{sum ? ` · ${sum.toLocaleString('vi-VN')} ₫` : ''}</span>
                  <span className="faint small rel-why">{g.why}</span>
                </div>
                <div className="rel-chips">
                  {shown.map((r) => {
                    const t = itemLabel(r)
                    return (
                      <button key={r.id} type="button" className="rel-chip" title={`Mở ${t.title}`} onClick={() => goItem(r)}>
                        {t.date && <span className="rel-date">{fmtD(t.date)}</span>}
                        <span className="ellipsis">{t.title}</span>
                        {t.sub && <span className="faint">{t.sub}</span>}
                        <L.ArrowUpRight size={12} />
                      </button>
                    )
                  })}
                  {g.items.length > 8 && <button type="button" className="btn sm ghost" onClick={() => setMore({ ...more, [g.module]: !more[g.module] })}>{more[g.module] ? 'Thu gọn' : `+${g.items.length - 8} nữa`}</button>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ===================== LỊCH ĐOÀN CÔNG TÁC THEO KHÓA ===================== */
export function CohortTripBoard({ rows, items, onOpen, onCreateTrip }) {
  const [compact, setCompact] = useState(true)
  const [hover, setHover] = useState(null)
  const data = useMemo(() => buildBoard(rows, items), [rows, items])
  const { weeks, blocks, tripWeeks, examWeeks, lecColor, coverage, unplanned } = data
  const cols = useMemo(() => {
    if (!compact) return weeks.map((w) => ({ w }))
    const keep = weeks.filter((w) => tripWeeks[w]?.length || COHORTS.some((c) => blocks[c.id]?.[w]?.length))
    const out = []
    keep.forEach((w, i) => {
      if (i > 0) { const gap = dayDiff(keep[i - 1], w) / 7 - 1; if (gap >= 1) out.push({ gap }) }
      out.push({ w })
    })
    return out
  }, [compact, weeks, tripWeeks, blocks])
  // gộp tiêu đề tháng
  const monthHead = []
  cols.forEach((c) => {
    const lbl = c.w ? `${MONTHS[+c.w.slice(5, 7) - 1]}/${c.w.slice(2, 4)}` : ''
    const last = monthHead[monthHead.length - 1]
    if (last && last.lbl === lbl) last.span++
    else monthHead.push({ lbl, span: 1 })
  })
  const lecs = Object.keys(lecColor)
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="card card-pad">
        <div className="row between wrap" style={{ gap: 10, marginBottom: 10 }}>
          <div>
            <h4 style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center' }}><L.CalendarRange size={17} color="var(--teal-700)" />Lịch đoàn công tác theo khóa – năm học 2026–2027</h4>
            <div className="small muted" style={{ marginTop: 3 }}>Mỗi cột là 1 tuần. Cột tô nền = tuần có đoàn GV Rennes ở UEH. Số nhỏ <b>T12</b> = tuần thứ 12 của học kỳ khóa đó. Mục tiêu: mỗi đoàn dạy được ≥ 2 khóa.</div>
          </div>
          <label className="row small" style={{ gap: 6, cursor: 'pointer' }}><input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />Chỉ hiện tuần có giảng</label>
        </div>
        <div className="ctb-legend">
          {lecs.map((n) => <span key={n}><i style={{ background: lecColor[n] }} />{n}</span>)}
          <span><i className="lg-plan" />Theo kế hoạch Rennes (chưa có buổi học)</span>
          <span><i className="lg-sug" />Đề xuất ghép thêm khóa</span>
          <span><i className="lg-exam" />Tuần thi của khóa</span>
        </div>
        <div className="ctb-scroll">
          <table className="ctb">
            <thead>
              <tr><th className="lbl" />{monthHead.map((m, i) => <th key={i} colSpan={m.span} className="ctb-month">{m.lbl}</th>)}</tr>
              <tr>
                <th className="lbl">Tuần bắt đầu</th>
                {cols.map((c, i) => c.gap ? <th key={'g' + i} className="ctb-gap" title={`${c.gap} tuần không có đợt giảng`}>…</th> : <th key={c.w} className={tripWeeks[c.w]?.length ? 'on' : ''}>{fmtD(c.w)}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className="ctb-trips">
                <td className="lbl"><b>Đoàn công tác</b><small>GV Rennes tại UEH</small></td>
                {cols.map((c, i) => c.gap ? <td key={'g' + i} className="ctb-gap" /> : (
                  <td key={c.w} className={tripWeeks[c.w]?.length ? 'band' : ''}>
                    {(tripWeeks[c.w] || []).map((t) => (
                      <button key={t.id} type="button" className={'ctb-trip' + (hover === t.id ? ' hl' : '')} style={{ background: lecColor[surnameLabel(t.lecturer)] || '#64748b' }}
                        onMouseEnter={() => setHover(t.id)} onMouseLeave={() => setHover(null)} onClick={() => onOpen(t)}
                        title={`${t.lecturer} · ${t.course}\n${fmtDY(tripWindow(t).from)} → ${fmtDY(tripWindow(t).to)}`}>
                        {surnameLabel(t.lecturer)}
                      </button>
                    ))}
                  </td>
                ))}
              </tr>
              {COHORTS.map((co) => (
                <tr key={co.id}>
                  <td className="lbl"><b>{co.label}</b><small>{co.program}</small></td>
                  {cols.map((c, i) => {
                    if (c.gap) return <td key={'g' + i} className="ctb-gap" />
                    const tw = termWeek(co.id, c.w) || termWeek(co.id, addDays(c.w, 6))
                    const bl = blocks[co.id]?.[c.w] || []
                    const exam = examWeeks[co.id]?.[c.w]
                    return (
                      <td key={c.w} className={(tripWeeks[c.w]?.length ? 'band' : '') + (exam ? ' exam' : '')} title={tw ? `${co.label} · ${tw.term} · tuần ${tw.week}${exam ? ' · có lịch thi' : ''}` : `${co.label}: ngoài học kỳ`}>
                        <span className="ctb-tw">{tw ? `T${tw.week}` : ''}</span>
                        {bl.map((b, k) => (
                          <span key={k} className={'ctb-blk ' + b.src + (b.tripId && hover === b.tripId ? ' hl' : '')}
                            style={b.src === 'suggest' ? null : { '--c': lecColor[surnameLabel(b.lecturer)] || '#64748b' }}
                            title={`${b.src === 'suggest' ? 'ĐỀ XUẤT – ' : ''}${b.course}\nGV: ${b.lecturer || 'chưa phân công'}${b.note ? '\n' + b.note : ''}`}>
                            {shortCourse(b.course)}
                          </span>
                        ))}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="faint small" style={{ marginTop: 8 }}>
          Học kỳ dùng để đếm tuần: K50/K51 HKC2026 từ {fmtDY(COHORT_TERMS.K50[0].start)}, HKĐ2027 từ {fmtDY(COHORT_TERMS.K50[1].start)}; K52 HK1 từ {fmtDY(COHORT_TERMS.K52[0].start)}; Applied Finance theo Phase của kế hoạch Rennes. Sửa ngày bắt đầu HK trong <code>src/modules/links.js</code> khi có lịch chính thức.
        </div>
      </div>

      <div className="ctb-cards">
        {coverage.map(({ trip: t, cov }) => {
          const n = cov.cohorts.length
          const tone = n >= 2 ? 'ok' : n === 1 ? 'warn' : 'danger'
          return (
            <div key={t.id} className={'card ctb-card ' + tone} onMouseEnter={() => setHover(t.id)} onMouseLeave={() => setHover(null)}>
              <div className="row between" style={{ gap: 8, alignItems: 'flex-start' }}>
                <div>
                  <b style={{ color: lecColor[surnameLabel(t.lecturer)] }}>{t.lecturer}</b>
                  <div className="small muted">{fmtDY(cov.window.from)} → {fmtDY(cov.window.to)} · {t.course}</div>
                </div>
                <span className={'ctb-n ' + tone}>{n >= 2 ? <L.CheckCircle2 size={13} /> : <L.AlertTriangle size={13} />}{n} khóa</span>
              </div>
              <div className="ctb-cov">
                {cov.cohorts.map((c) => (
                  <div key={c.cohort} className="ctb-cov-row">
                    <span className="ctb-co">{c.cohort}</span>
                    <span className="ctb-week">{c.tw ? `${c.tw.term} · tuần ${c.tw.week}` : 'ngoài học kỳ'}</span>
                    <span className="grow ellipsis small">{c.courses.join(', ')}</span>
                    <span className={'ctb-src ' + c.src}>{c.src === 'session' ? 'đã xếp buổi' : 'kế hoạch'}</span>
                  </div>
                ))}
                {!n && <div className="small" style={{ color: 'var(--danger)' }}>Không khớp buổi học hay đợt giảng nào trong kế hoạch Rennes – kiểm tra lại GV/ngày.</div>}
              </div>
              {cov.near.map(({ plan: p, gap }) => (
                <div key={p.id} className="ctb-tip"><L.Lightbulb size={14} /><span>Cùng GV dạy <b>{p.cohorts.join(' + ')}</b> “{p.course}” {fmtD(p.from)}–{fmtD(p.to)}, chỉ cách chuyến {gap} ngày → nên gộp 1 chuyến để dạy thêm khóa, tiết kiệm 1 vé khứ hồi.</span></div>
              ))}
              {n === 1 && !cov.near.length && <div className="ctb-tip"><L.Lightbulb size={14} /><span>Chỉ dạy 1 khóa – cân nhắc mời GV dạy thêm học phần của khóa khác cùng học kỳ (xem bảng K52 bên dưới).</span></div>}
              <button type="button" className="btn sm ghost" style={{ marginTop: 8 }} onClick={() => onOpen(t)}><L.ArrowRight size={13} />Mở chuyến</button>
            </div>
          )
        })}
      </div>

      {unplanned.length > 0 && (
        <div className="card card-pad">
          <h4 style={{ margin: '0 0 8px', display: 'flex', gap: 8, alignItems: 'center' }}><L.CalendarPlus size={16} color="var(--orange-600)" />Đợt giảng trong kế hoạch Rennes chưa có đoàn công tác ({unplanned.length})</h4>
          <table className="tbl ctb-plan">
            <thead><tr><th>Thời gian</th><th>Học phần</th><th>Khóa</th><th>GV</th><th>Ghép được với</th><th /></tr></thead>
            <tbody>
              {unplanned.map((p) => (
                <tr key={p.id}>
                  <td className="nowrap">{p.from ? `${fmtD(p.from)} – ${fmtDY(p.to)}` : <span className="muted">{p.when}</span>}</td>
                  <td>{p.course}</td>
                  <td>{p.cohorts.join(', ')}</td>
                  <td>{p.lecturer || <span className="muted">chưa phân công</span>}</td>
                  <td className="small">{p.pair || <span className="faint">—</span>}</td>
                  <td>{onCreateTrip && p.lecturer && <button type="button" className="btn sm" onClick={() => onCreateTrip(p)}><L.Plus size={13} />Tạo đoàn</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card card-pad">
        <h4 style={{ margin: '0 0 4px', display: 'flex', gap: 8, alignItems: 'center' }}><L.GraduationCap size={16} color="var(--teal-700)" />Khóa K52 – lịch học phần theo CTĐT DHCQK52FBDPS</h4>
        <div className="small muted" style={{ marginBottom: 10 }}>Nguồn: <i>K52_UIS-ChuongTrinhDaoTao_FBDPS.xls</i>. Thư mục hồ sơ chưa có lịch giảng chi tiết (ngày/phòng) cho K52, nên bảng dưới xếp theo học kỳ và gợi ý ghép vào các đoàn đã có của K50–K51 / Applied Finance.</div>
        <div className="small" style={{ marginBottom: 10 }}><b>HK1 – HKC2026 (UEH giảng, {K52_HK1.reduce((s, x) => s + x[2], 0)} TC):</b> {K52_HK1.map((x) => `${x[1]} (${x[0]})`).join(' · ')}</div>
        <table className="tbl ctb-plan">
          <thead><tr><th>Học kỳ</th><th>Mã HP</th><th>Học phần do GV Rennes giảng</th><th>TC</th><th>Ghép đoàn đề xuất</th></tr></thead>
          <tbody>
            {data.k52.map((r) => (
              <tr key={r.code}>
                <td className="nowrap">{r.hk} · {r.term}</td>
                <td className="nowrap">{r.code}</td>
                <td>{r.course}</td>
                <td>{r.credits}</td>
                <td className="small">{r.pair ? <span className="ctb-pair"><L.Link2 size={12} />{r.pair}</span> : <span className="faint">Ngoài kế hoạch 2026–2027 của Rennes – chờ kế hoạch năm sau</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const surnameLabel = (name = '') => { const s = surname(name); return s ? s[0].toUpperCase() + s.slice(1) : name }

function buildBoard(trips, items) {
  const sessions = items.filter((x) => x.module === 'sessions' && (x.side === 'Rennes' || /rennes|gs\.|prof/i.test(x.lecturer || '')))
  const exams = items.filter((x) => x.module === 'exams')
  // màu theo GV
  const names = [...new Set([...trips.map((t) => surnameLabel(t.lecturer)), ...TEACHING_PLAN.filter((p) => p.lecturer).map((p) => surnameLabel(p.lecturer))])].sort()
  const lecColor = Object.fromEntries(names.map((n, i) => [n, LEC_COLORS[i % LEC_COLORS.length]]))
  // phạm vi tuần: năm học 2026–2027
  const dates = [
    ...trips.flatMap((t) => { const w = tripWindow(t); return [w.from, w.to] }),
    ...TEACHING_PLAN.flatMap((p) => [p.from, p.to]),
  ].filter((d) => d && d >= '2026-06-01' && d <= '2027-08-31').sort()
  const start = monday(dates[0] || '2026-07-06'), end = monday(dates[dates.length - 1] || '2027-07-01')
  const weeks = []
  for (let w = start; w <= end; w = addDays(w, 7)) weeks.push(w)
  const blocks = {}, tripWeeks = {}, examWeeks = {}
  const put = (co, w, b) => { const arr = ((blocks[co] ||= {})[w] ||= []); if (!arr.some((x) => courseKey(x.course) === courseKey(b.course) && x.src === b.src)) arr.push(b) }
  const tripOf = (lecturer, date) => trips.find((t) => sameName(t.lecturer, lecturer) && date >= addDays(tripWindow(t).from, -1) && date <= addDays(tripWindow(t).to, 1))
  // đoàn công tác
  trips.forEach((t) => {
    const w = tripWindow(t)
    if (!w.from) return
    for (let d = monday(w.from); d <= w.to; d = addDays(d, 7)) (tripWeeks[d] ||= []).push(t)
  })
  // buổi học thực tế
  sessions.forEach((s) => sessionCohorts(s).forEach((co) => put(co, monday(s.date), { course: s.course, lecturer: s.lecturer, src: 'session', tripId: tripOf(s.lecturer, s.date)?.id })))
  // kế hoạch Rennes (chưa có buổi học tương ứng)
  TEACHING_PLAN.filter((p) => p.from).forEach((p) => {
    for (let d = monday(p.from); d <= p.to; d = addDays(d, 7)) {
      p.cohorts.forEach((co) => {
        const has = (blocks[co]?.[d] || []).some((b) => b.src === 'session' && sameName(b.lecturer, p.lecturer))
        if (!has) put(co, d, { course: p.course, lecturer: p.lecturer, src: 'plan', note: `${p.phase} · kế hoạch Rennes ${fmtD(p.from)}–${fmtD(p.to)}`, tripId: tripOf(p.lecturer, d)?.id })
      })
    }
  })
  // tuần thi
  exams.forEach((x) => {
    if (!x.date) return
    const t = `${x.className || ''} ${x.teachingGroup || ''}`
    COHORTS.forEach((co) => { if (t.includes(co.id) || (/K50.?K51|FBDPF1/.test(t) && (co.id === 'K50' || co.id === 'K51'))) (examWeeks[co.id] ||= {})[monday(x.date)] = true })
  })
  // K52: gợi ý ghép học phần Rennes vào đoàn sẵn có trong cùng học kỳ
  const datedPlan = TEACHING_PLAN.filter((p) => p.from && p.cohorts.some((c) => c === 'K50' || c === 'K51'))
  const k52 = K52_RENNES_PLAN.map((r) => {
    const cand = datedPlan.filter((p) => p.from >= r.from && p.from <= r.to)
    if (!cand.length) return { ...r }
    const p = cand[0]
    const wk = monday(p.from)
    if (weeks.includes(wk)) put('K52', wk, { course: r.course, lecturer: '', src: 'suggest', note: `Đề xuất: dạy K52 cùng đợt ${surnameLabel(p.lecturer)} ${fmtD(p.from)}–${fmtD(p.to)} (${r.hk})` })
    return { ...r, pair: `Cùng đợt ${p.lecturer} ${fmtD(p.from)}–${fmtDY(p.to)} (${p.cohorts.join('+')} · ${p.course}) – cần Rennes cử GV phụ trách “${r.course}” đi cùng hoặc dạy liền kề` }
  })
  // độ phủ khóa của từng đoàn
  const coverage = [...trips].sort((a, b) => (tripWindow(a).from || '').localeCompare(tripWindow(b).from || '')).map((t) => ({ trip: t, cov: tripCohortCoverage(t, items) }))
  // đợt trong kế hoạch chưa có đoàn
  const unplanned = [...TEACHING_PLAN].sort((a, b) => (a.from || '9').localeCompare(b.from || '9')).filter((p) => !(p.from && trips.some((t) => { const w = tripWindow(t); return sameName(t.lecturer, p.lecturer) && p.from <= w.to && p.to >= w.from })))
    .filter((p) => p.status !== 'Đã dạy')
    .map((p) => {
      const near = p.from && trips.find((t) => { const w = tripWindow(t); return w.from && Math.min(Math.abs(dayDiff(p.to, w.from)), Math.abs(dayDiff(w.to, p.from))) <= 10 && sameName(t.lecturer, p.lecturer) })
      const same = p.from && trips.find((t) => { const w = tripWindow(t); return w.from && p.from <= w.to && p.to >= w.from })
      return { ...p, pair: near ? `Liền kề đoàn ${near.lecturer} (${fmtD(tripWindow(near).from)}–${fmtD(tripWindow(near).to)}) → gộp 1 chuyến` : same ? `Trùng tuần đoàn ${same.lecturer} (${shortCourse(same.course)}) – dùng chung xe đón, khách sạn` : '' }
    })
  return { weeks, blocks, tripWeeks, examWeeks, lecColor, coverage, unplanned, k52 }
}
