import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore, visibleTasks, visibleProjects, projectRole } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { ListView, BoardView } from '../components/TaskViews.jsx'
import { FilterBar, applyFilter, emptyFilter } from './ProjectDetail.jsx'
import { Icon } from '../components/ui.jsx'
import { workHref } from '../modules/schema.js'
import { cx, isOverdue, isDueSoon } from '../lib/utils.js'

export default function MyTasks() {
  const { state, me } = useStore()
  const { newTask, go, openTask } = useUI()
  const openWork = (t) => { const h = workHref(t, state.tasks); h ? go(h) : openTask(t.id) }
  const q = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const managed = visibleProjects(state, me).filter((p) => projectRole(p, me) === 'manager')
  const [scope, setScope] = useState(q.get('f') === 'review' && managed.length ? 'review' : 'mine')
  const [view, setView] = useState('list')
  const [f, setF] = useState({ ...emptyFilter, show: q.get('f') === 'overdue' ? 'overdue' : 'active' })
  const all = visibleTasks(state, me)
  const sets = {
    mine: all.filter((t) => t.assigneeIds.includes(me.id)),
    assigned: all.filter((t) => t.createdBy === me.id && !t.assigneeIds.includes(me.id)),
    review: all.filter((t) => t.status === 'review' && managed.some((p) => p.id === t.projectId)),
    week: all.filter((t) => t.assigneeIds.includes(me.id) && (isOverdue(t) || isDueSoon(t, 7))),
  }
  const tabs = [
    { id: 'mine', label: 'Được giao cho tôi', icon: 'UserCheck' },
    { id: 'week', label: 'Cần làm trong 7 ngày', icon: 'CalendarClock' },
    { id: 'assigned', label: 'Tôi đã giao', icon: 'Send' },
    ...(managed.length ? [{ id: 'review', label: 'Chờ tôi duyệt', icon: 'BadgeCheck' }] : []),
  ]
  const base = sets[scope]
  const list = applyFilter(base, scope === 'review' ? { ...f, show: 'all' } : f)
  const people = [...new Set(base.flatMap((t) => t.assigneeIds))].map((id) => state.users.find((u) => u.id === id)).filter(Boolean)
  const byProject = visibleProjects(state, me).filter((p) => list.some((t) => t.projectId === p.id))

  return (
    <>
      <div className="row between wrap" style={{ gap: 10 }}>
        <div className="tabs grow" style={{ marginBottom: 0, borderBottom: 0 }}>
          {tabs.map((t) => {
            return <button key={t.id} className={cx('tab', scope === t.id && 'active')} onClick={() => setScope(t.id)}><Icon name={t.icon} size={16} />{t.label}<span className="n">{sets[t.id].filter((x) => x.status !== 'done' || t.id === 'review').length}</span></button>
          })}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div className="seg">
            <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><L.ListTree size={14} />Danh sách</button>
            <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}><L.Columns3 size={14} />Kanban</button>
          </div>
          {managed.length > 0 && <button className="btn primary" onClick={() => newTask({})}><L.Plus size={16} />Giao việc</button>}
        </div>
      </div>
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 14 }} />
      {scope !== 'review' && <FilterBar f={f} setF={setF} members={scope === 'assigned' ? people : null} />}
      {view === 'board' ? <BoardView tasks={applyFilter(base, f.show === 'active' ? { ...f, show: 'all' } : f)} onOpen={openWork} /> : (
        byProject.length ? byProject.map((p) => (
          <div key={p.id} style={{ marginBottom: 18 }}>
            <div className="row" style={{ marginBottom: 8, gap: 8 }}><span className="proj-dot" style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} /><b>{p.name}</b><span className="faint small">{list.filter((t) => t.projectId === p.id).length} việc</span></div>
            <ListView project={p} tasks={list.filter((t) => t.projectId === p.id)} group hideEmpty noAdd onOpen={openWork} />
          </div>
        )) : <ListView tasks={[]} />
      )}
    </>
  )
}
