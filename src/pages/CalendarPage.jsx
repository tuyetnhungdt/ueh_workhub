import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore, visibleProjects, visibleTasks } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { STATUS, cx, isOverdue, toISODate, todayStr } from '../lib/utils.js'
import { workHref } from '../modules/schema.js'

export default function CalendarPage() {
  const { state, me } = useStore()
  const { openTask, go } = useUI()
  const [off, setOff] = useState(0)
  const [pid, setPid] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)
  const projects = visibleProjects(state, me)
  const tasks = visibleTasks(state, me).filter((t) => (!pid || t.projectId === pid) && (!onlyMine || t.assigneeIds.includes(me.id)))
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + off)
  const y = base.getFullYear(), m = base.getMonth()
  const start = new Date(y, m, 1 - ((new Date(y, m, 1).getDay() + 6) % 7))
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
  const byDay = {}
  tasks.forEach((t) => t.dueDate && (byDay[t.dueDate] ||= []).push(t))
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="card">
      <div className="row between wrap" style={{ padding: '14px 18px', gap: 10 }}>
        <div className="row" style={{ gap: 6 }}>
          <button className="iconbtn" onClick={() => setOff(off - 1)} aria-label="Tháng trước"><L.ChevronLeft size={18} /></button>
          <button className="btn sm" onClick={() => setOff(0)}>Hôm nay</button>
          <button className="iconbtn" onClick={() => setOff(off + 1)} aria-label="Tháng sau"><L.ChevronRight size={18} /></button>
          <h3 style={{ fontSize: 17, marginLeft: 8, textTransform: 'capitalize' }}>{base.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</h3>
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          <span className="row small" style={{ gap: 12, marginRight: 6 }}>
            <span className="row" style={{ gap: 5 }}><i className="lg" style={{ background: 'var(--teal-700)' }} />Việc của tôi</span>
            <span className="row" style={{ gap: 5 }}><i className="lg" style={{ background: '#b8c2c6' }} />Người khác</span>
            <span className="row" style={{ gap: 5, color: 'var(--danger)' }}><L.AlertCircle size={12} />Quá hạn</span>
          </span>
          <select className="select sm" style={{ width: 240 }} value={pid} onChange={(e) => setPid(e.target.value)}>
            <option value="">Tất cả dự án</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="seg"><button className={!onlyMine ? 'on' : ''} onClick={() => setOnlyMine(false)}>Tất cả</button><button className={onlyMine ? 'on' : ''} onClick={() => setOnlyMine(true)}>Của tôi</button></div>
        </div>
      </div>
      <div className="cal">
        {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((d) => <div key={d} className="dow">{d}</div>)}
        {cells.map((d, ci) => {
          const wkEmpty = cells.slice(ci - (ci % 7), ci - (ci % 7) + 7).every((x) => !(byDay[toISODate(x)] || []).length)
          const iso = toISODate(d)
          const list = (byDay[iso] || []).sort((a, b) => (a.status === 'done') - (b.status === 'done'))
          const show = expanded === iso ? list : list.slice(0, 3)
          return (
            <div key={iso} className={cx('cell', d.getMonth() !== m && 'out', iso === todayStr() && 'today', wkEmpty && 'wk-empty')}>
              <span className="dn">{d.getDate()}</span>
              {show.map((t) => {
                const late = isOverdue(t)
                const mine = t.assigneeIds.includes(me.id)
                const who = t.assigneeIds.map((id) => state.users.find((u) => u.id === id)?.name).filter(Boolean).join(', ')
                return (
                  <div key={t.id} className={cx('ev', mine ? 'ev-mine' : 'ev-other', t.status === 'done' && 'ev-done', late && 'ev-late')}
                    title={`${t.title}\n${mine ? 'Việc của bạn' : 'Phụ trách: ' + (who || '—')} · ${STATUS[t.status].label}${late ? ' · QUÁ HẠN' : ''}`} onClick={() => { const h = mine && workHref(t, state.tasks); h ? go(h) : openTask(t.id) }}>
                    {late && <L.AlertCircle size={11} style={{ verticalAlign: -1, marginRight: 3 }} />}{t.title}
                  </div>
                )
              })}
              {list.length > 3 && expanded !== iso && <span className="more" onClick={() => setExpanded(iso)}>+{list.length - 3} việc khác</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
