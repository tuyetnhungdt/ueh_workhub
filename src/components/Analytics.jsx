import { useState } from 'react'
import * as L from 'lucide-react'
import { Avatar, Sparkline } from './ui.jsx'
import { STATUSES, isOverdue, toISODate, todayStr, fmtShort, cx } from '../lib/utils.js'
import { useUI } from '../App.jsx'

const HEAT = ['#edf2f3', '#d9eef0', '#b3dde1', '#86c5cb', '#5aa9b0']
const heat = (v, max) => (v <= 0 ? HEAT[0] : HEAT[Math.min(4, Math.ceil((v / Math.max(1, max)) * 4))])
const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function health(active, overdue) {
  if (!active && !overdue) return { label: 'Ổn định', color: '#1e8a4c', bg: '#e2f4e9' }
  const r = overdue / Math.max(1, active)
  if (overdue === 0) return { label: 'Ổn định', color: '#1e8a4c', bg: '#e2f4e9' }
  if (r < 0.25) return { label: 'Cần chú ý', color: '#b45309', bg: '#fff4e0' }
  return { label: 'Rủi ro', color: '#c62828', bg: '#fdecec' }
}

const weekKeys = (n) => {
  const out = []
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // thứ 2 tuần này
  for (let i = n - 1; i >= 0; i--) { const x = new Date(d); x.setDate(x.getDate() - i * 7); out.push(toISODate(x)) }
  return out
}
const weekIndex = (keys, iso) => {
  if (!iso) return -1
  const s = iso.slice(0, 10)
  for (let i = keys.length - 1; i >= 0; i--) if (s >= keys[i]) return i
  return -1
}

export function StatusDonut({ tasks }) {
  const total = tasks.length || 1
  let acc = 0
  const segs = STATUSES.map((s) => {
    const n = tasks.filter((t) => t.status === s.id).length
    const from = (acc / total) * 360
    acc += n
    return { ...s, n, from, to: (acc / total) * 360 }
  })
  const grad = segs.map((s) => `${s.chart} ${s.from}deg ${s.to}deg`).join(',')
  const pct = Math.round((segs[3].n / total) * 100)
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: tasks.length ? `conic-gradient(${grad})` : '#edf2f3' }}>
        <div><div><b>{tasks.length ? pct : 0}%</b><span>hoàn thành</span></div></div>
      </div>
      <div className="legend">
        {segs.map((s) => <div key={s.id}><i style={{ background: s.chart }} />{s.label}<b>{s.n}</b></div>)}
        <div className="faint small" style={{ marginTop: 2 }}><i style={{ background: '#ef9a9a' }} />Quá hạn<b style={{ color: 'var(--danger)' }}>{tasks.filter(isOverdue).length}</b></div>
      </div>
    </div>
  )
}

/* Lịch deadline dạng heatmap (theo tháng) */
export function DeadlineHeatmap({ tasks }) {
  const { openTask } = useUI()
  const [off, setOff] = useState(0)
  const [sel, setSel] = useState(null)
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + off)
  const y = base.getFullYear(), m = base.getMonth()
  const first = (new Date(y, m, 1).getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  const byDay = {}
  tasks.forEach((t) => { if (t.dueDate && t.status !== 'done') (byDay[t.dueDate] ||= []).push(t) })
  const max = Math.max(1, ...Object.values(byDay).map((a) => a.length))
  const cells = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(toISODate(new Date(y, m, d)))
  const selTasks = sel ? byDay[sel] || [] : []
  return (
    <div>
      <div className="row between" style={{ marginBottom: 10 }}>
        <b style={{ textTransform: 'capitalize' }}>{base.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</b>
        <div className="row" style={{ gap: 4 }}>
          <button className="iconbtn" onClick={() => setOff(off - 1)} aria-label="Tháng trước"><L.ChevronLeft size={16} /></button>
          <button className="btn sm" onClick={() => setOff(0)}>Hôm nay</button>
          <button className="iconbtn" onClick={() => setOff(off + 1)} aria-label="Tháng sau"><L.ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="heat-cal">
        {DOW.map((d) => <div key={d} className="dow">{d}</div>)}
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />
          const list = byDay[iso] || []
          const late = list.some(isOverdue)
          return (
            <button key={iso} className={cx('hc', iso === todayStr() && 'today', sel === iso && 'sel')} style={{ background: late ? '#f3b4b4' : heat(list.length, max) }}
              title={`${fmtShort(iso)} · ${list.length} việc đến hạn`} onClick={() => setSel(sel === iso ? null : iso)}>
              <span style={{ color: list.length >= max * 0.6 && !late ? '#fff' : undefined }}>{+iso.slice(8)}</span>
            </button>
          )
        })}
      </div>
      <div className="row between small faint" style={{ marginTop: 8 }}>
        <span className="row" style={{ gap: 5 }}><i className="lg" style={{ background: '#f3b4b4' }} />Có việc quá hạn</span>
        <span className="row" style={{ gap: 4 }}>Ít {HEAT.map((c) => <i key={c} className="lg" style={{ background: c }} />)} Nhiều</span>
      </div>
      {sel && (
        <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          <div className="small muted" style={{ marginBottom: 4 }}>Đến hạn {fmtShort(sel)}: {selTasks.length} việc</div>
          {selTasks.map((t) => <div key={t.id} className="sr" style={{ padding: '6px 4px' }} onClick={() => openTask(t.id)}><span className="small">{t.title}</span></div>)}
        </div>
      )}
    </div>
  )
}

/* Biểu đồ cột: việc tạo mới vs hoàn thành theo tuần */
export function CreatedCompleted({ tasks, weeks = 8 }) {
  const keys = weekKeys(weeks)
  const created = keys.map(() => 0), done = keys.map(() => 0)
  tasks.forEach((t) => {
    const a = weekIndex(keys, t.createdAt); if (a >= 0) created[a]++
    const b = weekIndex(keys, t.completedAt); if (b >= 0) done[b]++
  })
  const max = Math.max(4, ...created, ...done)
  const nice = Math.ceil(max / 4) * 4
  return (
    <div>
      <div className="bars">
        <div className="bars-y">{[4, 3, 2, 1, 0].map((i) => <span key={i}>{(nice / 4) * i}</span>)}</div>
        <div className="bars-plot">
          {[1, 2, 3, 4].map((i) => <div key={i} className="gl" style={{ bottom: `${i * 25}%` }} />)}
          {keys.map((k, i) => (
            <div key={k} className="bar-g" title={`Tuần ${fmtShort(k)}: tạo ${created[i]}, hoàn thành ${done[i]}`}>
              <div className="bar-pair">
                <i style={{ height: `${(created[i] / nice) * 100}%`, background: '#f2b07e' }} />
                <i style={{ height: `${(done[i] / nice) * 100}%`, background: '#6fb3b9' }} />
              </div>
              <span>{fmtShort(k)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="row small muted" style={{ gap: 16, marginTop: 8 }}>
        <span className="row" style={{ gap: 6 }}><i className="lg" style={{ background: '#f2b07e' }} />Tạo mới</span>
        <span className="row" style={{ gap: 6 }}><i className="lg" style={{ background: '#6fb3b9' }} />Hoàn thành</span>
      </div>
    </div>
  )
}

/* Bảng khối lượng theo thành viên */
export function WorkloadTable({ tasks, users }) {
  const keys = weekKeys(8)
  const rows = users.map((u) => {
    const mine = tasks.filter((t) => t.assigneeIds.includes(u.id))
    const active = mine.filter((t) => t.status !== 'done').length
    const completed = mine.filter((t) => t.status === 'done').length
    const overdue = mine.filter(isOverdue).length
    const review = mine.filter((t) => t.status === 'review').length
    const trend = keys.map(() => 0)
    mine.forEach((t) => { const i = weekIndex(keys, t.completedAt); if (i >= 0) trend[i]++ })
    return { u, active, completed, overdue, review, trend, h: health(active, overdue) }
  }).sort((a, b) => b.active - a.active)
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr><th>Thành viên</th><th>Đang mở</th><th>Chờ duyệt</th><th>Hoàn thành</th><th>Quá hạn</th><th className="hide-sm">Xu hướng (8 tuần)</th><th>Tình trạng</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.u.id}>
              <td><div className="row"><Avatar user={r.u} size={30} /><div><div style={{ fontWeight: 600 }}>{r.u.name}</div><div className="faint small">{r.u.title}</div></div></div></td>
              <td><b>{r.active}</b></td>
              <td>{r.review || '–'}</td>
              <td>{r.completed}</td>
              <td style={{ color: r.overdue ? 'var(--danger)' : undefined, fontWeight: r.overdue ? 700 : 400 }}>{r.overdue || '–'}</td>
              <td className="hide-sm"><Sparkline data={r.trend} color={r.overdue ? '#d4712f' : '#0b7480'} /></td>
              <td><span className="badge" style={{ background: r.h.bg, color: r.h.color }}><span className="dot" />{r.h.label}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* Portfolio: heatmap hoạt động theo dự án */
export function PortfolioActivity({ projects, activities, days = 35 }) {
  const { go } = useUI()
  const dates = []
  for (let i = days - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dates.push(toISODate(d)) }
  const counts = {}
  activities.forEach((a) => { const k = a.projectId + (a.createdAt || '').slice(0, 10); counts[k] = (counts[k] || 0) + 1 })
  const max = Math.max(1, ...Object.values(counts))
  return (
    <div className="tbl-wrap">
      <div className="pa">
        <div />
        <div className="pa-dates">{dates.map((d, i) => <span key={d}>{i % 7 === 0 ? fmtShort(d) : ''}</span>)}</div>
        {projects.map((p) => (
          <div key={p.id} style={{ display: 'contents' }}>
            <div className="pa-name" onClick={() => go('/projects/' + p.id)}><span className="pcode" style={{ background: p.color }}>{(p.code || '').slice(0, 2)}</span><span className="ellipsis">{p.name}</span></div>
            <div className="pa-row">{dates.map((d) => { const v = counts[p.id + d] || 0; return <i key={d} title={`${fmtShort(d)}: ${v} cập nhật`} style={{ background: heat(v, max) }} /> })}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PortfolioHealth({ projects, tasks }) {
  const { go } = useUI()
  const keys = weekKeys(8)
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr><th>Dự án</th><th>Đang mở</th><th>Hoàn thành</th><th>Quá hạn</th><th className="hide-sm">Xu hướng</th><th>Tiến độ</th><th>Tình trạng</th></tr></thead>
        <tbody>
          {projects.map((p) => {
            const pt = tasks.filter((t) => t.projectId === p.id)
            const active = pt.filter((t) => t.status !== 'done').length
            const done = pt.length - active
            const overdue = pt.filter(isOverdue).length
            const trend = keys.map(() => 0)
            pt.forEach((t) => { const i = weekIndex(keys, t.completedAt); if (i >= 0) trend[i]++ })
            const h = health(active, overdue)
            const pct = pt.length ? Math.round((done / pt.length) * 100) : 0
            return (
              <tr key={p.id} className="click" onClick={() => go('/projects/' + p.id)}>
                <td><div className="row"><span className="pcode" style={{ background: p.color }}>{p.code.slice(0, 2)}</span><b className="ellipsis" style={{ maxWidth: 260 }}>{p.name}</b></div></td>
                <td>{active}</td><td>{done}</td>
                <td style={{ color: overdue ? 'var(--danger)' : undefined, fontWeight: overdue ? 700 : 400 }}>{overdue || '–'}</td>
                <td className="hide-sm"><Sparkline data={trend} /></td>
                <td style={{ minWidth: 110 }}><div className="row small"><div className="progress grow"><i style={{ width: pct + '%' }} /></div>{pct}%</div></td>
                <td><span className="badge" style={{ background: h.bg, color: h.color }}><span className="dot" />{h.label}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
