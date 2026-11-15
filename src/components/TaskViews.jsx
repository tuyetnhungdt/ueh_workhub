import { useMemo, useState } from 'react'
import * as L from 'lucide-react'
import { useStore, projectRole } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { useToast, Avatar, AvatarStack, Deadline, Icon, PriorityIcon, StatusCircle, Tags, Empty, Modal } from './ui.jsx'
import { CADENCE } from '../data/rennes.js'
import { byUrgency, urgencyCmp, STATUSES, STATUS, PRIORITIES, addDays, cx, daysUntil, isOverdue, progressOf, toISODate, todayStr, fmtShort } from '../lib/utils.js'

/* ---------- Quyền ---------- */
export function usePerms() {
  const { state, me } = useStore()
  return useMemo(() => {
    const proj = (t) => state.projects.find((p) => p.id === t.projectId)
    const isMgr = (t) => projectRole(proj(t), me) === 'manager'
    const isAssignee = (t) => (t?.assigneeIds || []).includes(me.id)
    const isCreator = (t) => t?.createdBy === me.id || isMgr(t) || me.role === 'admin' || me.role === 'super_admin'
    return {
      isMgr,
      isAssignee,
      isCreator,
      canEdit: isMgr,
      canStatus: (t) => isAssignee(t) || isCreator(t),
      // việc "của mình" để hiển thị: người phụ trách, hoặc người giao việc, hoặc quản lý
      mine: (t) => isMgr(t) || isAssignee(t) || isCreator(t),
      // Luồng trạng thái: Chưa bắt đầu → Đang thực hiện → Chờ duyệt → Hoàn thành
      allowedStatuses: (t) => {
        const a = isAssignee(t)
        const c = isCreator(t)
        if (!a && !c) return []
        const res = []
        if (a) {
          if (t.status === 'todo') res.push('todo', 'doing', 'done')
          else if (t.status === 'doing') res.push('todo', 'doing', 'review', 'done')
          else if (t.status === 'review') res.push('doing', 'review', 'done')
          else if (t.status === 'done') res.push('done', 'doing')
        }
        if (c) {
          res.push('todo', 'doing', 'review', 'done')
        }
        return Array.from(new Set(res))
      },
      next: (t) => {
        if (t.status === 'todo') return (isAssignee(t) || isCreator(t)) ? 'doing' : null
        if (t.status === 'doing') return (isAssignee(t) || isCreator(t)) ? 'review' : null
        if (t.status === 'review') return (isCreator(t) || isAssignee(t)) ? 'done' : null
        return null
      },
    }
  }, [state.projects, me])
}

const LAST_CLICK = {}
export function useCycle() {
  const { updateTask } = useStore()
  const perms = usePerms()
  const toast = useToast()
  return (t, e) => {
    e?.stopPropagation()
    // chống bấm liên tiếp: mỗi việc chỉ nhận 1 lần bấm trong 1,2 giây
    const now = Date.now()
    if (now - (LAST_CLICK[t.id] || 0) < 1200) return
    LAST_CLICK[t.id] = now

    if (t.status === 'todo') {
      if (!perms.isAssignee(t) && !perms.isCreator(t)) {
        toast('Chỉ người phụ trách hoặc quản lý mới được chuyển sang Đang thực hiện')
        return
      }
      updateTask(t.id, { status: 'doing' })
      toast('Đã chuyển sang “Đang thực hiện”')
      return
    }

    if (t.status === 'doing') {
      if (!perms.isAssignee(t) && !perms.isCreator(t)) {
        toast('Chỉ người phụ trách hoặc quản lý mới được gửi duyệt')
        return
      }
      updateTask(t.id, { status: 'review' })
      toast('Đã gửi duyệt cho người giao task')
      return
    }

    if (t.status === 'review') {
      if (!perms.isCreator(t) && !perms.isAssignee(t)) {
        toast('Chỉ người giao task hoặc người phụ trách mới được hoàn thành')
        return
      }
      const confirmMsg = perms.isCreator(t) ? `Duyệt hoàn thành “${t.title}”?` : `Xác nhận hoàn thành “${t.title}”?`
      if (!confirm(confirmMsg)) return
      updateTask(t.id, { status: 'done' })
      toast(perms.isCreator(t) ? 'Đã duyệt hoàn thành công việc' : 'Đã hoàn thành công việc')
      return
    }

    if (t.status === 'done') {
      if (perms.isCreator(t) || perms.isAssignee(t)) {
        if (confirm(`Mở lại công việc “${t.title}”?`)) {
          updateTask(t.id, { status: 'doing' })
          toast('Đã mở lại công việc (Đang thực hiện)')
        }
      } else {
        toast('Công việc đã hoàn thành. Chỉ người giao task hoặc người phụ trách mới được mở lại')
      }
      return
    }
  }
}

const users = (state, ids) => ids.map((id) => state.users.find((u) => u.id === id)).filter(Boolean)

/* ---------- LIST (dạng cây kiểu Quire) ---------- */
export function ListView({ project, tasks, streams = [], group = true, showProject = false, onOpen, hideEmpty = false, noAdd = false, allTasks = tasks }) {
  const { state, me } = useStore()
  const perms = usePerms()
  const [collapsed, setCollapsed] = useState({})
  const [runFor, setRunFor] = useState(null)
  const ids = new Set(tasks.map((t) => t.id))
  const streamIds = new Set(streams.map((s) => s.id))
  const childrenOf = (id) => tasks.filter((t) => t.parentId === id)
  const roots = [...streams, ...tasks.filter((t) => !t.parentId || (!ids.has(t.parentId) && !streamIds.has(t.parentId)))]
  const isMgr = project ? projectRole(project, me) === 'manager' : false

  // đầu việc: lấy deadline gần nhất của các đợt đang mở
  const dueOf = (t) => (t.isStream ? state.tasks.filter((x) => x.parentId === t.id && x.status !== 'done' && x.dueDate).map((x) => x.dueDate).sort()[0] : t.dueDate)
  const cmp = urgencyCmp(dueOf)
  const renderRows = (list, depth) =>
    [...list].sort(cmp).map((t) => {
      const kids = childrenOf(t.id)
      const open = !collapsed[t.id]
      const toggle = () => setCollapsed({ ...collapsed, [t.id]: open })
      return (
        <div key={t.id}>
          {t.isStream
            ? <StreamRow s={t} kids={kids} open={open} toggle={toggle} state={state} canRun={isMgr || t.ownerId === me.id} onRun={() => setRunFor(t)} />
            : <TaskRow t={t} depth={depth} kids={kids} open={open} toggle={toggle} showProject={showProject} perms={perms} state={state} onOpen={onOpen} />}
          {kids.length > 0 && open && renderRows(kids, depth + 1)}
        </div>
      )
    })

  if (!roots.length) return <div className="card"><Empty icon="ClipboardList" text="Không có công việc phù hợp bộ lọc." /></div>

  const modal = runFor && <RunModal stream={runFor} onClose={() => setRunFor(null)} />
  if (!group || !project) return <><div className="card qlist">{renderRows(roots, 0)}</div>{modal}</>

  return (
    <div>
      {project.categories.map((c) => {
        const ct = roots.filter((t) => t.categoryId === c.id)
        const all = tasks.filter((t) => t.categoryId === c.id)
        if (!ct.length && (!isMgr || hideEmpty)) return null
        const key = 'cat' + c.id
        const open = !collapsed[key]
        const pct = progressOf(all)
        const late = all.filter(isOverdue).length
        return (
          <div key={c.id} className="card group" id={'cat-' + c.id}>
            <div className="group-head" onClick={() => setCollapsed({ ...collapsed, [key]: open })}>
              <L.ChevronRight size={16} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '.15s' }} className="faint" />
              <span className="no">{c.no}</span>
              <span className="nm grow ellipsis">{c.name}</span>
              {late > 0 && <span className="badge pill-danger">{late} trễ hạn</span>}
              <span className="small muted hide-sm">{all.filter((t) => t.status === 'done').length}/{all.length} việc</span>
              <div className="progress hide-sm" style={{ width: 90 }}><i style={{ width: pct + '%' }} /></div>
            </div>
            {open && (
              <CategoryTwoColView
                category={c}
                roots={ct}
                tasks={tasks}
                allTasks={allTasks}
                project={project}
                state={state}
                me={me}
                perms={perms}
                onOpen={onOpen}
                onRun={(s) => setRunFor(s)}
                isMgr={isMgr}
                noAdd={noAdd}
              />
            )}
          </div>
        )
      })}
      {(() => {
        const orphan = roots.filter((t) => !project.categories.some((c) => c.id === t.categoryId))
        return orphan.length ? <div className="card group"><div className="group-head"><span className="nm">Chưa phân hạng mục</span></div><div className="qlist">{renderRows(orphan, 0)}</div></div> : null
      })()}
      {modal}
    </div>
  )
}

/* Bố cục 2 cột cho danh sách hạng mục: Cột trái = Nhóm việc / Quy trình, Cột phải = Việc chi tiết & Đợt thực hiện */
export function CategoryTwoColView({ category, roots, tasks, allTasks = tasks, project, state, me, perms, onOpen, onRun, isMgr, noAdd }) {
  const { openTask } = useUI()
  const cycle = useCycle()

  const dueOf = (t) => (t.isStream ? allTasks.filter((x) => x.parentId === t.id && x.status !== 'done' && x.dueDate).map((x) => x.dueDate).sort()[0] : t.dueDate)
  const cmp = urgencyCmp(dueOf)

  const catStreams = roots.filter((t) => t.isStream).sort(cmp)
  const nonStreamParents = roots.filter((t) => !t.isStream && tasks.some((x) => x.parentId === t.id)).sort(cmp)
  const standalones = roots.filter((t) => !t.isStream && !tasks.some((x) => x.parentId === t.id)).sort(cmp)

  const renderKidList = (kids) => {
    if (!kids.length) {
      return (
        <div className="kid-empty">
          <span>Chưa có đợt thực hiện nào</span>
        </div>
      )
    }
    return (
      <div className="kids-list">
        {kids.map((kid) => {
          const isDone = kid.status === 'done'
          const late = isOverdue(kid)
          const ck = kid.checklist || []
          const ckDone = ck.filter((x) => x.done).length

          return (
            <div
              key={kid.id}
              className={cx('kid-item', isDone && 'done', late && 'late')}
              onClick={() => (onOpen ? onOpen(kid) : openTask(kid.id))}
            >
              <StatusCircle
                status={kid.status}
                onClick={(e) => cycle(kid, e)}
                title={perms.canStatus(kid) ? 'Bấm để chuyển trạng thái tiếp theo' : STATUS[kid.status]?.label}
              />
              <div className="kid-info grow">
                {kid.externalRef && (
                  <span className="badge ref">{kid.externalRef}</span>
                )}
                <span className="kid-name" title={kid.title}>{kid.title}</span>
                {kid.teachingGroup && kid.teachingGroup !== 'Chung' && kid.teachingGroup !== 'All' && (
                  <span className="chip sm">{kid.teachingGroup}</span>
                )}
                {kid.sourceStatus === 'Chờ dữ liệu' && (
                  <span className="badge warn sm">Chờ dữ liệu</span>
                )}
                {kid.status === 'review' && (
                  <span className="badge review sm">Chờ duyệt</span>
                )}
                {ck.length > 0 && (
                  <span className="qmeta" title="Tiến độ checklist">
                    <L.CheckSquare size={12} /> {ckDone}/{ck.length}
                  </span>
                )}
              </div>
              <div className="kid-tags hide-sm">
                <Tags project={project} ids={kid.tagIds} compact={(kid.tagIds || []).length > 2} />
              </div>
              <div className="kid-deadline">
                <Deadline task={kid} icon={false} />
              </div>
              <div className="kid-who">
                <AvatarStack users={users(state, kid.assigneeIds)} size={22} max={2} />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const hasAny = catStreams.length > 0 || nonStreamParents.length > 0 || standalones.length > 0

  return (
    <div className="cat-2col-wrap">

      {!hasAny && (
        <div style={{ padding: '16px 20px', color: 'var(--muted)', textAlign: 'center', fontSize: 13, fontStyle: 'italic' }}>
          Chưa có công việc trong hạng mục này
        </div>
      )}

      {/* 1. Nhóm stream / đầu việc thường xuyên */}
      {catStreams.map((s) => {
        const allRuns = allTasks.filter((x) => x.parentId === s.id)
        const openRuns = allRuns.filter((r) => r.status !== 'done')
        const kids = tasks.filter((x) => x.parentId === s.id).sort(cmp)
        const owner = state.users.find((u) => u.id === (s.ownerId || category.ownerId))
        const canRun = isMgr || s.ownerId === me.id

        return (
          <div key={s.id} className="cat-2col-row">
            <div className="cat-col-left" onClick={() => openTask(s.id)} title="Bấm để xem quy trình & thiết lập">
              <div className="group-title">{s.title}</div>
              <div className="group-meta">
                <span className="cad">{CADENCE[s.cadence]?.label || 'Thường xuyên'}</span>
                <span className="qmeta">
                  <L.Layers size={12} /> {allRuns.length ? `${openRuns.length} mở · ${allRuns.length} đợt` : 'Chưa có đợt'}
                </span>
                {owner && <Avatar user={owner} size={20} title={'Phụ trách chính: ' + owner.name} />}
                {canRun && (
                  <button
                    className="iconbtn runbtn"
                    style={{ marginLeft: 'auto', padding: '2px 6px', fontSize: 11 }}
                    title="Mở đợt thực hiện mới"
                    onClick={(e) => { e.stopPropagation(); onRun(s); }}
                  >
                    <L.CalendarPlus size={14} />
                    <span style={{ marginLeft: 3 }}>Mở đợt</span>
                  </button>
                )}
              </div>
            </div>
            <div className="cat-col-right">
              {renderKidList(kids)}
            </div>
          </div>
        )
      })}

      {/* 2. Parent tasks có subtasks */}
      {nonStreamParents.map((pt) => {
        const kids = tasks.filter((x) => x.parentId === pt.id).sort(cmp)
        return (
          <div key={pt.id} className="cat-2col-row">
            <div className="cat-col-left" onClick={() => openTask(pt.id)} title="Bấm để xem chi tiết">
              <div className="group-title">{pt.title}</div>
              <div className="group-meta">
                <span className="cad" style={{ background: '#e0f2fe', color: '#0369a1' }}>Đầu việc</span>
                <span className="qmeta"><L.Layers size={12} /> {kids.length} việc con</span>
              </div>
            </div>
            <div className="cat-col-right">
              {renderKidList(kids)}
            </div>
          </div>
        )
      })}

      {/* 3. Các công việc trực tiếp trong hạng mục (không cần cột "Việc phát sinh") */}
      {standalones.length > 0 && renderKidList(standalones)}

      {isMgr && !noAdd && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid #f1f5f5', background: '#fafbfc' }}>
          <QuickAdd project={project} categoryId={category.id} />
        </div>
      )}
    </div>
  )
}

/* Dòng "đầu việc thường xuyên" */
function StreamRow({ s, kids, open, toggle, state, canRun, onRun }) {
  const { openTask } = useUI()
  const p = state.projects.find((x) => x.id === s.projectId)
  const runs = state.tasks.filter((x) => x.parentId === s.id)
  const openRuns = runs.filter((r) => r.status !== 'done')
  const next = openRuns.filter((r) => r.dueDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
  const late = openRuns.some(isOverdue)
  const owner = state.users.find((u) => u.id === (s.ownerId || p?.categories.find((c) => c.id === s.categoryId)?.ownerId))
  return (
    <div className={cx('qrow', 'stream', late && 'late')} onClick={() => openTask(s.id)}>
      <span className="qcaret" onClick={(e) => { e.stopPropagation(); kids.length && toggle() }}>
        {kids.length > 0 && <L.ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '.15s' }} />}
      </span>
      <span className="qtitle grow">
        <span className="ellipsis">{s.title}</span>
        <span className="cad">{CADENCE[s.cadence]?.label || 'Thường xuyên'}</span>
        <span className="qmeta hide-sm"><L.Layers size={12} />{runs.length ? `${openRuns.length} mở · ${runs.length} đợt` : 'chưa có đợt'}</span>
      </span>
      <span className="qtags hide-sm"><Tags project={p} ids={s.tagIds} /></span>
      <span className="qdate">{next ? <Deadline task={next} icon={false} /> : <span className="small faint">—</span>}</span>
      <span className="qwho">{owner ? <Avatar user={owner} size={24} title={'Phụ trách chính: ' + owner.name} /> : <span className="small faint">—</span>}</span>
      <span className="qact">{canRun && <button className="iconbtn runbtn" title="Mở đợt thực hiện mới" onClick={(e) => { e.stopPropagation(); onRun() }}><L.CalendarPlus size={16} /></button>}</span>
    </div>
  )
}

/* Mở một đợt thực hiện mới từ đầu việc (checklist sinh từ quy trình chuẩn) */
export function RunModal({ stream, onClose }) {
  const { state, startRun } = useStore()
  const { openTask } = useUI()
  const toast = useToast()
  const p = state.projects.find((x) => x.id === stream.projectId)
  const members = (p?.members || []).map((m) => state.users.find((u) => u.id === m.userId)).filter(Boolean)
  const n = state.tasks.filter((x) => x.parentId === stream.id).length + 1
  const month = new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
  const [f, setF] = useState({ title: `${stream.title} – đợt ${n} (${month})`, assigneeIds: (() => { const o = stream.ownerId || p?.categories.find((c) => c.id === stream.categoryId)?.ownerId; return o ? [o] : [] })(), startDate: todayStr(), dueDate: addDays(14), priority: 'medium' })
  const save = () => {
    if (!f.title.trim()) return
    const id = startRun(stream.id, { ...f, title: f.title.trim() })
    toast('Đã mở đợt mới & giao việc')
    onClose(); openTask(id)
  }
  return (
    <Modal title="Mở đợt thực hiện mới" onClose={onClose} width={620}
      footer={<><button className="btn ghost" onClick={onClose}>Hủy</button><button className="btn primary" onClick={save} disabled={!f.title.trim()}><L.CalendarPlus size={15} />Mở đợt & giao việc</button></>}>
      <div className="callout info"><L.Layers size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} /><div>Đầu việc: <b>{stream.title}</b> · {CADENCE[stream.cadence]?.label}</div></div>
      <div className="field"><label>Tên đợt</label><input className="input" autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div className="field"><label>Người thực hiện</label>
        <div className="picker">
          {members.map((u) => (
            <button type="button" key={u.id} className={f.assigneeIds.includes(u.id) ? 'on' : ''} onClick={() => setF({ ...f, assigneeIds: f.assigneeIds.includes(u.id) ? f.assigneeIds.filter((x) => x !== u.id) : [...f.assigneeIds, u.id] })}>
              <Avatar user={u} size={24} />{u.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid2">
        <div className="field"><label>Bắt đầu</label><input className="input" type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></div>
        <div className="field"><label>Deadline</label><input className="input" type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></div>
      </div>
      <div className="field"><label>Mức ưu tiên</label>
        <div className="seg" style={{ alignSelf: 'flex-start' }}>{PRIORITIES.map((x) => <button type="button" key={x.id} className={f.priority === x.id ? 'on' : ''} style={f.priority === x.id ? { color: x.color } : null} onClick={() => setF({ ...f, priority: x.id })}>{x.label}</button>)}</div>
      </div>
      <div className="field"><label>Checklist tự sinh từ quy trình chuẩn ({(stream.sop || []).length} bước)</label>
        <ol className="sop-preview">{(stream.sop || []).map((x, i) => <li key={i}>{x}</li>)}</ol>
        {!(stream.sop || []).length && <span className="faint small">Đầu việc chưa có quy trình chuẩn — có thể thêm trong chi tiết đầu việc.</span>}
      </div>
    </Modal>
  )
}

function TaskRow({ t, depth, kids, open, toggle, showProject, perms, state, onOpen }) {
  const { openTask } = useUI()
  const cycle = useCycle()
  const p = state.projects.find((x) => x.id === t.projectId)
  const sub = state.tasks.filter((x) => x.parentId === t.id)
  const ck = t.checklist || []
  const parent = depth === 0 && t.parentId ? state.tasks.find((x) => x.id === t.parentId) : null
  return (
    <div className={cx('qrow', t.status === 'done' && 'done', isOverdue(t) && 'late', !perms.mine(t) && 'not-mine')} title={!perms.mine(t) ? 'Không phải việc bạn phụ trách' : undefined} onClick={() => (onOpen ? onOpen(t) : openTask(t.id))}>
      <span style={{ width: depth * 22, flexShrink: 0 }} />
      <span className="qcaret" onClick={(e) => { e.stopPropagation(); kids.length && toggle() }}>
        {kids.length > 0 && <L.ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '.15s' }} />}
      </span>
      <StatusCircle status={t.status} onClick={(e) => cycle(t, e)} title={perms.canStatus(t) ? 'Bấm để chuyển trạng thái tiếp theo' : STATUS[t.status].label} />
      <span className="qtitle grow">
        {t.externalRef && (
          <span className="badge" style={{ background: 'var(--teal-50)', color: 'var(--teal-800)', border: '1px solid var(--teal-200)', marginRight: 6, fontSize: 11, fontWeight: 700 }}>
            {t.externalRef}
          </span>
        )}
        <span className="ellipsis">{t.title}{parent && <span className="parent-ctx"> · {parent.title}</span>}</span>
        {t.teachingGroup && t.teachingGroup !== 'Chung' && t.teachingGroup !== 'All' && (
          <span className="chip" style={{ fontSize: 10, padding: '1px 5px', marginLeft: 4 }}>
            {t.teachingGroup}
          </span>
        )}
        {t.sourceStatus === 'Chờ dữ liệu' && (
          <span className="badge" style={{ background: '#fff4e0', color: '#b45309', fontSize: 10, padding: '1px 6px', marginLeft: 4 }}>
            Chờ dữ liệu
          </span>
        )}
        {t.status === 'review' && <span className="badge" style={{ background: 'var(--orange-100)', color: 'var(--orange-700)', padding: '1px 7px', fontSize: 11 }}>Chờ duyệt</span>}
        {sub.length > 0 && <span className="qmeta"><L.ListTree size={12} />{sub.filter((x) => x.status === 'done').length}/{sub.length}</span>}
        {ck.length > 0 && <span className="qmeta"><L.CheckSquare size={12} />{ck.filter((x) => x.done).length}/{ck.length}</span>}
      </span>
      {showProject && <span className="chip hide-sm">{p?.code}</span>}
      <span className="qtags hide-sm"><Tags project={p} ids={t.tagIds} compact={(t.tagIds || []).length > 2} /></span>
      <span className="qdate"><Deadline task={t} icon={false} /></span>
      <span className="qwho"><AvatarStack users={users(state, t.assigneeIds)} size={24} max={2} /></span>
      <span className="qact" />
    </div>
  )
}

function QuickAdd({ project, categoryId, status, parentId, compact }) {
  const { createTask } = useStore()
  const [v, setV] = useState('')
  const [on, setOn] = useState(false)
  const submit = () => {
    if (!v.trim()) return
    createTask({ projectId: project.id, categoryId: categoryId || project.categories[0]?.id, title: v.trim(), status: status || 'todo', parentId: parentId || null, startDate: todayStr(), dueDate: addDays(7) })
    setV('')
  }
  if (!on) return <button className={cx('qadd', compact && 'compact')} onClick={() => setOn(true)}><L.Plus size={15} />Thêm công việc</button>
  return (
    <div className={cx('qadd', 'on', compact && 'compact')}>
      <L.Plus size={15} />
      <input autoFocus placeholder="Nhập tên công việc rồi Enter… (Esc để đóng)" value={v} onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setOn(false); setV('') } }} onBlur={() => { submit(); setOn(false) }} />
    </div>
  )
}

/* ---------- BOARD ---------- */
export function BoardView({ project, tasks, onOpen }) {
  const { state, me, updateTask } = useStore()
  const { openTask } = useUI()
  const perms = usePerms()
  const toast = useToast()
  const cycle = useCycle()
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const isMgr = project && projectRole(project, me) === 'manager'

  const categories = project?.categories || []
  const hasCategories = categories.length > 0

  const toggleCollapse = (catId) => {
    setCollapsed((prev) => ({ ...prev, [catId]: !prev[catId] }))
  }

  const drop = (status, categoryId) => {
    const t = tasks.find((x) => x.id === drag)
    setOver(null)
    setDrag(null)
    if (!t) return
    const statusChanged = t.status !== status
    const catChanged = categoryId && categoryId !== 'orphan' && t.categoryId !== categoryId

    if (!statusChanged && !catChanged) return

    if (statusChanged && !perms.allowedStatuses(t).includes(status)) {
      toast(!perms.canStatus(t) ? 'Bạn không phụ trách việc này' : status === 'done' ? 'Không thể chuyển sang hoàn thành' : 'Không chuyển được trạng thái này')
      return
    }
    if (status === 'done' && t.status !== 'done') {
      const confirmMsg = perms.isCreator(t) ? `Duyệt hoàn thành “${t.title}”?` : `Xác nhận hoàn thành “${t.title}”?`
      if (!confirm(confirmMsg)) return
    }

    const updates = {}
    if (statusChanged) updates.status = status
    if (catChanged) updates.categoryId = categoryId

    updateTask(t.id, updates)
    toast(status === 'review' ? 'Đã gửi duyệt cho quản lý' : status === 'done' ? (perms.isCreator(t) ? 'Đã duyệt hoàn thành công việc' : 'Đã hoàn thành công việc') : `Đã chuyển sang “${STATUS[status].label}”`)
  }

  const renderTaskCard = (t) => {
    const p = state.projects.find((x) => x.id === t.projectId)
    const sub = state.tasks.filter((x) => x.parentId === t.id)
    return (
      <div
        key={t.id}
        className={cx('tcard', t.status === 'done' && 'done', isOverdue(t) && 'late', drag === t.id && 'dragging', !perms.mine(t) && 'not-mine')}
        title={!perms.mine(t) ? 'Không phải việc bạn phụ trách' : undefined}
        draggable={perms.canStatus(t)}
        onDragStart={() => setDrag(t.id)}
        onDragEnd={() => { setDrag(null); setOver(null) }}
        onClick={() => (onOpen ? onOpen(t) : openTask(t.id))}
      >
        <div className="row" style={{ alignItems: 'flex-start', gap: 8 }}>
          <StatusCircle status={t.status} size={17} onClick={(e) => cycle(t, e)} />
          <div className="t grow" style={{ margin: 0 }}>
            {t.externalRef && (
              <span className="badge" style={{ background: 'var(--teal-50)', color: 'var(--teal-800)', border: '1px solid var(--teal-200)', marginRight: 5, fontSize: 10, fontWeight: 700 }}>
                {t.externalRef}
              </span>
            )}
            {t.title}
            {t.teachingGroup && t.teachingGroup !== 'Chung' && t.teachingGroup !== 'All' && (
              <span className="chip" style={{ fontSize: 9.5, padding: '0 4px', marginLeft: 4 }}>
                {t.teachingGroup}
              </span>
            )}
            {t.sourceStatus === 'Chờ dữ liệu' && (
              <span className="badge" style={{ background: '#fff4e0', color: '#b45309', fontSize: 9.5, padding: '0 5px', marginLeft: 4 }}>
                Chờ DL
              </span>
            )}
          </div>
        </div>
        {t.parentId && <div className="small faint" style={{ margin: '4px 0 0 25px' }}>↳ {state.tasks.find((x) => x.id === t.parentId)?.title}</div>}
        <div className="foot" style={{ marginTop: 10 }}>
          <PriorityIcon priority={t.priority} size={14} />
          <AvatarStack users={users(state, t.assigneeIds)} size={22} max={3} />
          <Deadline task={t} />
          {sub.length > 0 && <span className="qmeta"><L.ListTree size={12} />{sub.filter((x) => x.status === 'done').length}/{sub.length}</span>}
        </div>
        {(t.tagIds || []).length > 0 && <div style={{ marginTop: 8 }}><Tags project={p} ids={t.tagIds} /></div>}
        {!project && <div className="small faint" style={{ marginTop: 6 }}>{p?.code}</div>}
      </div>
    )
  }

  // Nếu không chia theo đầu mục (flat 4 cột thông thường)
  if (!hasCategories) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {categories.length > 0 && (
          <div className="row between wrap" style={{ gap: 8, alignItems: 'center' }}>
            <div className="seg sm">
              <button type="button" onClick={() => { setGroupByCat(true); try { localStorage.setItem('ueh_kanban_group', 'cat') } catch {} }}>
                <L.FolderTree size={13} style={{ marginRight: 4 }} />
                Chia theo {categories.length} đầu mục
              </button>
              <button type="button" className="on">
                <L.Columns3 size={13} style={{ marginRight: 4 }} />
                Gộp 4 cột chung
              </button>
            </div>
          </div>
        )}
        <div className="board">
          {STATUSES.map((s) => {
            const list = tasks.filter((t) => t.status === s.id).sort(byUrgency)
            return (
              <div
                key={s.id}
                className={cx('col', over === s.id && 'over')}
                onDragOver={(e) => { e.preventDefault(); setOver(s.id) }}
                onDragLeave={() => setOver(null)}
                onDrop={() => drop(s.id)}
              >
                <div className="col-head">
                  <StatusCircle status={s.id} size={17} />
                  {s.label}
                  <span className="n">{list.length}</span>
                </div>
                {list.map((t) => renderTaskCard(t))}
                {isMgr && s.id !== 'done' && <QuickAdd project={project} status={s.id} compact />}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Chia theo từng đầu mục công việc (Swimlanes theo category)
  const orphanTasks = tasks.filter((t) => !categories.some((c) => c.id === t.categoryId))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Thanh điều khiển chế độ xem Kanban */}
      <div className="row between wrap" style={{ gap: 8, alignItems: 'center' }}>
        <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
          <div className="seg sm">
            <button type="button" className="on">
              <L.FolderTree size={13} style={{ marginRight: 4 }} />
              Chia theo {categories.length} đầu mục
            </button>
            <button type="button" onClick={() => { setGroupByCat(false); try { localStorage.setItem('ueh_kanban_group', 'flat') } catch {} }}>
              <L.Columns3 size={13} style={{ marginRight: 4 }} />
              Gộp 4 cột chung
            </button>
          </div>
          <span className="small faint hide-sm">
            Mỗi đầu mục là một hàng ngang; các thẻ Chưa bắt đầu, Đang làm, Chờ duyệt, Hoàn thành đầu tiên đều ngang hàng
          </span>
        </div>

        <div className="row wrap" style={{ gap: 6 }}>
          <button type="button" className="btn sm ghost" onClick={expandAll} style={{ fontSize: 12, padding: '3px 8px' }}>
            Mở rộng tất cả
          </button>
          <button type="button" className="btn sm ghost" onClick={collapseAll} style={{ fontSize: 12, padding: '3px 8px' }}>
            Thu gọn tất cả
          </button>
        </div>
      </div>

      <div className="board-wrap">
        <div className="board-inner">
          {/* Hàng tiêu đề 4 cột trạng thái cố định ở trên cùng */}
          <div className="board-top-headers">
            {STATUSES.map((s) => {
              const total = tasks.filter((t) => t.status === s.id).length
              return (
                <div key={s.id} className="board-top-col-header">
                  <StatusCircle status={s.id} size={17} />
                  <span>{s.label}</span>
                  <span className="n">{total}</span>
                </div>
              )
            })}
          </div>

          {/* Danh sách từng đầu mục (Swimlane row) */}
          {categories.map((c) => {
            const catTasks = tasks.filter((t) => t.categoryId === c.id)
            const isOpen = !collapsed[c.id]
            const catDone = catTasks.filter((t) => t.status === 'done').length
            const pct = catTasks.length ? Math.round((catDone / catTasks.length) * 100) : 0
            const lateCount = catTasks.filter(isOverdue).length
            const owner = state.users.find((u) => u.id === c.ownerId)

            return (
              <div key={c.id} className="board-swimlane-card">
                <div className="board-swimlane-header" onClick={() => toggleCollapse(c.id)}>
                  <L.ChevronRight
                    size={16}
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}
                    className="faint"
                  />
                  <span className="no">
                    {c.no}
                  </span>
                  <span className="nm grow ellipsis" style={{ fontWeight: 800, fontSize: 14 }}>
                    {c.name}
                  </span>
                  {lateCount > 0 && <span className="badge pill-danger">{lateCount} trễ hạn</span>}
                  {owner && (
                    <div className="row hide-sm" style={{ gap: 6, alignItems: 'center' }} title={`Phụ trách chính: ${owner.name}`}>
                      <Avatar user={owner} size={22} />
                      <span className="small faint">{owner.name}</span>
                    </div>
                  )}
                  <span className="small muted hide-sm">{catDone}/{catTasks.length} việc ({pct}%)</span>
                  <div className="progress hide-sm" style={{ width: 80 }}><i style={{ width: `${pct}%` }} /></div>
                </div>

                {isOpen && (
                  <div className="board-swimlane-body">
                    <div className="board-swimlane-row">
                      {STATUSES.map((s) => {
                        const colTasks = catTasks.filter((t) => t.status === s.id).sort(byUrgency)
                        const cellKey = `${c.id}-${s.id}`
                        const isOver = over === cellKey

                        return (
                          <div
                            key={s.id}
                            className={cx('board-cell', isOver && 'over')}
                            onDragOver={(e) => { e.preventDefault(); setOver(cellKey) }}
                            onDragLeave={() => setOver(null)}
                            onDrop={() => drop(s.id, c.id)}
                          >
                            {colTasks.map((t) => renderTaskCard(t))}
                            {colTasks.length === 0 && (
                              <div className="board-cell-empty">
                                <span>Chưa có việc</span>
                              </div>
                            )}
                            {isMgr && s.id !== 'done' && (
                              <QuickAdd project={project} categoryId={c.id} status={s.id} compact />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Nhóm các công việc chưa phân đầu mục (nếu có) */}
          {orphanTasks.length > 0 && (
            <div className="board-swimlane-card">
              <div className="board-swimlane-header" onClick={() => toggleCollapse('orphan')}>
                <L.ChevronRight
                  size={16}
                  style={{ transform: !collapsed['orphan'] ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}
                  className="faint"
                />
                <span className="no" style={{ background: '#64748b' }}>
                  ··
                </span>
                <span className="nm grow ellipsis" style={{ fontWeight: 800, fontSize: 14 }}>
                  Chưa phân đầu mục
                </span>
                <span className="small muted">{orphanTasks.length} việc</span>
              </div>

              {!collapsed['orphan'] && (
                <div className="board-swimlane-body">
                  <div className="board-swimlane-row">
                    {STATUSES.map((s) => {
                      const colTasks = orphanTasks.filter((t) => t.status === s.id).sort(byUrgency)
                      const cellKey = `orphan-${s.id}`
                      const isOver = over === cellKey

                      return (
                        <div
                          key={s.id}
                          className={cx('board-cell', isOver && 'over')}
                          onDragOver={(e) => { e.preventDefault(); setOver(cellKey) }}
                          onDragLeave={() => setOver(null)}
                          onDrop={() => drop(s.id, 'orphan')}
                        >
                          {colTasks.map((t) => renderTaskCard(t))}
                          {colTasks.length === 0 && (
                            <div className="board-cell-empty">
                              <span>Chưa có việc</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- TIMELINE / GANTT ---------- */
export function TimelineView({ project, tasks }) {
  const { state } = useStore()
  const { openTask } = useUI()
  const [scale, setScale] = useState('week') // week | month
  const DW = scale === 'week' ? 36 : 14
  const span = scale === 'week' ? 42 : 120
  const [start, setStart] = useState(() => addDays(-10))
  const days = Array.from({ length: span }, (_, i) => addDays(i, new Date(start + 'T00:00:00')))
  const idx = (iso) => daysUntil(iso) - daysUntil(start)
  const shift = (n) => setStart(addDays(n, new Date(start + 'T00:00:00')))
  const dueCount = {}
  tasks.forEach((t) => { if (t.dueDate) dueCount[t.dueDate] = (dueCount[t.dueDate] || 0) + 1 })

  const rows = []
  const cats = project ? project.categories : [{ id: '*', name: 'Công việc' }]
  cats.forEach((c) => {
    const list = tasks.filter((t) => c.id === '*' || t.categoryId === c.id).sort((a, b) => (a.startDate || a.dueDate || '').localeCompare(b.startDate || b.dueDate || ''))
    if (!list.length) return
    const s = list.map((t) => t.startDate || t.dueDate).filter(Boolean).sort()[0]
    const e = list.map((t) => t.dueDate).filter(Boolean).sort().slice(-1)[0]
    if (project) rows.push({ type: 'cat', c, s, e })
    list.forEach((t) => rows.push({ type: 'task', t }))
  })
  const todayI = idx(todayStr())

  const bar = (s, e) => {
    if (!s && !e) return null
    const a = idx(s || e), b = idx(e || s)
    const l = Math.max(0, Math.min(a, b)), r = Math.min(span - 1, Math.max(a, b))
    if (r < 0 || l > span - 1) return null
    return { left: l * DW + 2, width: (r - l + 1) * DW - 4, clippedL: Math.min(a, b) < 0, clippedR: Math.max(a, b) > span - 1 }
  }

  return (
    <div className="card gantt-card">
      <div className="row between wrap" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', gap: 10 }}>
        <div className="row" style={{ gap: 6 }}>
          <button className="iconbtn" onClick={() => shift(-(scale === 'week' ? 7 : 30))} aria-label="Lùi"><L.ChevronLeft size={17} /></button>
          <button className="btn sm" onClick={() => setStart(addDays(-10))}>Hôm nay</button>
          <button className="iconbtn" onClick={() => shift(scale === 'week' ? 7 : 30)} aria-label="Tiến"><L.ChevronRight size={17} /></button>
          <b style={{ marginLeft: 6, textTransform: 'capitalize' }}>{new Date(start).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</b>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <span className="row small muted" style={{ gap: 10 }}>{STATUSES.map((s) => <span key={s.id} className="row" style={{ gap: 4 }}><i className="lg" style={{ background: s.chart }} />{s.short}</span>)}</span>
          <div className="seg"><button className={scale === 'week' ? 'on' : ''} onClick={() => setScale('week')}>Tuần</button><button className={scale === 'month' ? 'on' : ''} onClick={() => setScale('month')}>Tháng</button></div>
        </div>
      </div>
      <div className="gantt">
        <div className="g-left">
          <div className="g-head" />
          {rows.map((r, i) => r.type === 'cat'
            ? <div key={i} className="g-name cat"><span className="no">{r.c.no}</span><span className="ellipsis">{r.c.name}</span></div>
            : <div key={i} className="g-name" onClick={() => openTask(r.t.id)}><StatusCircle status={r.t.status} size={15} /><span className="ellipsis" style={{ paddingLeft: r.t.parentId ? 14 : 0 }}>{r.t.title}</span></div>)}
        </div>
        <div className="g-right">
          <div style={{ width: span * DW, position: 'relative' }}>
            <div className="g-head" style={{ display: 'flex' }}>
              {days.map((d) => {
                const dt = new Date(d + 'T00:00:00')
                const we = dt.getDay() === 0 || dt.getDay() === 6
                return (
                  <div key={d} className={cx('g-day', we && 'we', d === todayStr() && 'today')} style={{ width: DW }} title={`${fmtShort(d)} · ${dueCount[d] || 0} việc đến hạn`}>
                    {scale === 'week' ? <><span>{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dt.getDay()]}</span><b>{dt.getDate()}</b></> : (dt.getDate() === 1 || dt.getDay() === 1) && <b style={{ fontSize: 10 }}>{dt.getDate()}</b>}
                    {dueCount[d] ? <i className="g-dot" /> : null}
                  </div>
                )
              })}
            </div>
            <div className="g-body" style={{ backgroundSize: `${DW}px 100%` }}>
              {days.map((d, i) => { const w = new Date(d + 'T00:00:00').getDay(); return (w === 0 || w === 6) ? <div key={d} className="g-we" style={{ left: i * DW, width: DW }} /> : null })}
              {todayI >= 0 && todayI < span && <div className="g-today" style={{ left: todayI * DW + DW / 2 }} />}
              {rows.map((r, i) => {
                if (r.type === 'cat') {
                  const b = bar(r.s, r.e)
                  return <div key={i} className="g-row">{b && <div className="g-bar cat" style={{ left: b.left, width: b.width }} />}</div>
                }
                const t = r.t
                const b = bar(t.startDate || t.dueDate, t.dueDate)
                const st = STATUS[t.status]
                const late = isOverdue(t)
                return (
                  <div key={i} className="g-row">
                    {b && (
                      <div className={cx('g-bar', t.status === 'todo' && 'hatch', late && 'late')} style={{ left: b.left, width: b.width, '--c': late ? '#e57373' : st.chart }} onClick={() => openTask(t.id)} title={`${t.title} · ${fmtShort(t.startDate)} → ${fmtShort(t.dueDate)}`}>
                        <span className="g-label" style={{ left: b.width + 6 }}>{t.title}<AvatarStack users={users(state, t.assigneeIds)} size={18} max={2} /></span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
