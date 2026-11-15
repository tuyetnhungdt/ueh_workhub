import { useEffect, useState } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { usePerms, useCycle } from './TaskViews.jsx'
import { useToast, Avatar, Deadline, Icon, PriorityBadge, StatusCircle, Tags, Modal } from './ui.jsx'
import { STATUSES, STATUS, PRIORITIES, isOverdue, cx, fmtDate, timeAgo, uid, addDays, todayStr } from '../lib/utils.js'
import TaskForm from './TaskForm.jsx'
import { RunModal } from './TaskViews.jsx'
import { CADENCE, CADENCES } from '../data/rennes.js'
import { CATEGORY_MODULES, MODULE } from '../modules/schema.js'

export default function TaskDrawer({ id, onClose }) {
  const store = useStore()
  const { state, me, updateTask, addComment, deleteTask, createTask } = store
  const { openTask, go } = useUI()
  const perms = usePerms()
  const cycle = useCycle()
  const toast = useToast()
  const t = state.tasks.find((x) => x.id === id)
  const p = state.projects.find((x) => x.id === t.projectId)
  const cat = p?.categories.find((c) => c.id === t.categoryId)
  const parent = t.parentId && state.tasks.find((x) => x.id === t.parentId)
  const subs = state.tasks.filter((x) => x.parentId === t.id)
  const comments = state.comments.filter((c) => c.taskId === t.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const acts = state.activities.filter((a) => a.taskId === t.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const isMgr = perms.isMgr(t)
  const canStatus = perms.canStatus(t)
  const creator = state.users.find((u) => u.id === t.createdBy)
  const [comment, setComment] = useState('')
  const [edit, setEdit] = useState(false)
  const [desc, setDesc] = useState(null)
  const [newCk, setNewCk] = useState('')
  const [newSub, setNewSub] = useState('')
  const [ret, setRet] = useState(null)
  const [tab, setTab] = useState('comments')
  const [run, setRun] = useState(false)
  const stream = !!t.isStream

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && !edit && ret === null && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, edit, ret])

  const isAssignee = (t.assigneeIds || []).includes(me.id)
  const isCreator = t.createdBy === me.id

  const setStatus = (s) => {
    if (s === 'doing' || s === 'review') {
      if (!isAssignee) {
        toast('Chỉ người phụ trách task mới được chuyển trạng thái này')
        return
      }
    }
    if (s === 'done') {
      if (!isCreator) {
        toast('Chỉ người giao task mới được duyệt hoàn thành')
        return
      }
    }
    updateTask(t.id, { status: s })
    toast(s === 'review' ? 'Đã gửi duyệt cho người giao task' : `Đã chuyển sang “${STATUS[s].label}”`)
  }
  const ck = t.checklist || []
  const toggleCk = (cid) => canStatus && updateTask(t.id, { checklist: ck.map((c) => (c.id === cid ? { ...c, done: !c.done } : c)) })
  const addCk = () => { if (newCk.trim()) { updateTask(t.id, { checklist: [...ck, { id: uid('ck'), text: newCk.trim(), done: false }] }); setNewCk('') } }
  const delCk = (cid) => updateTask(t.id, { checklist: ck.filter((c) => c.id !== cid) })
  const addSub = () => {
    if (!newSub.trim()) return
    createTask({ projectId: t.projectId, categoryId: t.categoryId, parentId: t.id, title: newSub.trim(), assigneeIds: t.assigneeIds, startDate: todayStr(), dueDate: t.dueDate || addDays(7), priority: t.priority })
    setNewSub('')
  }
  const send = () => { if (comment.trim()) { addComment(t.id, comment.trim()); setComment('') } }

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={t.title}>
        <div className="drawer-head">
          <button className="iconbtn" onClick={onClose} aria-label="Đóng"><L.ChevronsRight size={19} /></button>
          <span className="faint small" style={{ fontWeight: 600 }}>{p?.code} · #{t.id.replace(/^t_?/, '').slice(0, 6)}</span>
          <span className="grow" />
          <span className="row small muted" title="Mọi thành viên dự án đều xem được việc này" style={{ gap: 4 }}><L.Eye size={15} />{p?.members.length}</span>
          {isMgr && <button className="btn sm" onClick={() => setEdit(true)}><L.Pencil size={14} />Sửa</button>}
          {isMgr && <button className="iconbtn" title="Xóa công việc" onClick={() => { if (confirm(`Xóa “${t.title}”${subs.length ? ' cùng ' + subs.length + ' việc con' : ''}?`)) { deleteTask(t.id); onClose(); toast('Đã xóa công việc') } }}><L.Trash2 size={17} /></button>}
        </div>

        <div className="drawer-body">
          {parent && <button className="btn ghost sm" style={{ marginBottom: 8, paddingLeft: 0 }} onClick={() => openTask(parent.id)}><L.CornerLeftUp size={14} />{parent.title}</button>}
          <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
            <div style={{ marginTop: 3 }}>{stream ? <span className="stream-ic"><L.Repeat size={18} /></span> : <StatusCircle status={t.status} size={26} onClick={(e) => cycle(t, e)} />}</div>
            <h2 className="grow">{t.title}</h2>
          </div>

          <div className="row wrap" style={{ gap: 8, margin: '14px 0 0 38px' }}>
            {t.assigneeIds.map((aid) => { const u = state.users.find((x) => x.id === aid); return u && <span key={aid} className="row chip" style={{ gap: 6, padding: '3px 10px 3px 3px', borderRadius: 99 }}><Avatar user={u} size={22} />{u.name}</span> })}
            {stream ? <span className="cad">{CADENCE[t.cadence]?.label || 'Thường xuyên'}</span> : <span className="chip" style={{ background: 'transparent', paddingLeft: 0 }}><Deadline task={t} /></span>}
          </div>
          {(t.tagIds || []).length > 0 && <div style={{ margin: '10px 0 0 38px' }}><Tags project={p} ids={t.tagIds} /></div>}

          {t.externalRef && (
            <div style={{ margin: '12px 0 0 38px', background: 'var(--teal-50)', border: '1px solid var(--teal-200)', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, lineHeight: 1.5 }}>
              <div className="row between" style={{ marginBottom: 4 }}>
                <b style={{ color: 'var(--teal-900)' }}>Mã đầu việc gói bàn giao: {t.externalRef}</b>
                <span className="badge" style={{ background: '#fff', color: 'var(--teal-800)', border: '1px solid var(--teal-200)' }}>
                  {t.sourceTable || 'Công việc vận hành'}
                </span>
              </div>
              {t.teachingGroup && (
                <div style={{ color: 'var(--teal-800)', marginTop: 2 }}>
                  Nhóm lớp: <b>{t.teachingGroup}</b> {t.cohortScope ? `(Phạm vi khóa: ${t.cohortScope})` : ''}
                </div>
              )}
              {t.sourceStatus && (
                <div style={{ marginTop: 2 }}>
                  Trạng thái nguồn: <span className="chip" style={{ fontSize: 11, background: '#fff' }}>{t.sourceStatus}</span>
                </div>
              )}
              {t.verification && (
                <div style={{ marginTop: 6, color: '#9a3412', background: 'rgba(212, 113, 47, 0.08)', padding: '6px 8px', borderRadius: 4 }}>
                  <b>Xác minh tiến độ thực tế:</b> {t.verification}
                </div>
              )}
              {t.followUp && (
                <div style={{ marginTop: 4, color: 'var(--muted)' }}>
                  <b>Follow-up:</b> {t.followUp}
                </div>
              )}
            </div>
          )}

          {!stream && (<>
          <div style={{ margin: '18px 0 6px' }} className="section-title">Trạng thái</div>
          <div className="flow">
            {STATUSES.map((s) => {
              const ok = perms.allowedStatuses(t).includes(s.id)
              return (
                <button key={s.id} disabled={!ok} className={cx(t.status === s.id && 'on')} style={t.status === s.id ? { background: s.color, borderColor: s.color } : null} onClick={() => setStatus(s.id)}
                  title={!ok ? (!canStatus ? 'Chỉ người phụ trách hoặc quản lý' : s.id === 'done' ? (t.status === 'review' ? 'Chỉ quản lý mới được duyệt' : 'Phải gửi duyệt trước') : 'Đi theo luồng: Chưa bắt đầu → Đang thực hiện → Chờ duyệt → Hoàn thành') : ''}>
                  <StatusCircle status={s.id} size={14} />{s.label}
                </button>
              )
            })}
          </div>

          {t.status === 'review' && (
            <div className="callout review" style={{ marginTop: 12 }}>
              <L.BadgeCheck size={20} color="var(--orange-600)" style={{ flexShrink: 0 }} />
              <div className="grow">
                <b>Đang chờ duyệt.</b> {isCreator ? 'Bạn là người giao task: kiểm tra kết quả và duyệt hoàn thành hoặc yêu cầu chỉnh sửa.' : `Đang chờ người giao task (${creator?.name || 'người tạo task'}) phê duyệt.`}
                {isCreator && (
                  <div className="row" style={{ marginTop: 10, gap: 8 }}>
                    <button className="btn sm success" onClick={() => setStatus('done')}><L.Check size={14} />Duyệt hoàn thành</button>
                    <button className="btn sm" onClick={() => setRet('')}><L.Undo2 size={14} />Yêu cầu chỉnh sửa</button>
                  </div>
                )}
              </div>
            </div>
          )}
          {isAssignee && t.status === 'doing' && (
            <div className="callout info" style={{ marginTop: 12 }}>
              <L.Info size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} />
              <div className="grow">Khi làm xong, hãy <b>gửi duyệt</b> để người giao task xác nhận hoàn thành.
                <div style={{ marginTop: 8 }}><button className="btn sm accent" onClick={() => setStatus('review')}><L.Send size={14} />Gửi duyệt</button></div>
              </div>
            </div>
          )}
          </>)}

          <div className="meta-grid">
            <span className="k"><L.FolderKanban size={15} />Dự án</span><span><a href={'#/projects/' + p?.id} onClick={(e) => { e.preventDefault(); onClose(); go('/projects/' + p.id) }}>{p?.name}</a></span>
            <span className="k"><L.Shapes size={15} />Hạng mục</span><span>{cat ? <><span className="chip"><Icon name={cat.icon} size={13} />{cat.no}</span> {cat.name}</> : '—'}</span>
            {!stream && <>
            <span className="k"><L.Flag size={15} />Ưu tiên</span><span><PriorityBadge priority={t.priority} /></span>
            <span className="k"><L.CalendarRange size={15} />Thời gian</span><span>{fmtDate(t.startDate)} → <b>{fmtDate(t.dueDate)}</b></span>
            </>}
            {stream && <>
              <span className="k"><L.Repeat size={15} />Chu kỳ</span>
              <span>{isMgr ? <select className="select sm" value={t.cadence || 'batch'} onChange={(e) => updateTask(t.id, { cadence: e.target.value }, { logText: `đổi chu kỳ “${t.title}”` })}>{CADENCES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select> : CADENCE[t.cadence]?.label}</span>
              <span className="k"><L.UserCog size={15} />Phụ trách chính</span>
              <span>{isMgr ? <select className="select sm" value={t.ownerId || ''} onChange={(e) => updateTask(t.id, { ownerId: e.target.value || null, assigneeIds: e.target.value ? [e.target.value] : [] }, { logText: `đổi người phụ trách chính “${t.title}”` })}>
                <option value="">— Chưa giao —</option>{p.members.map((m) => { const u = state.users.find((x) => x.id === m.userId); return u && <option key={u.id} value={u.id}>{u.name}</option> })}
              </select> : (state.users.find((x) => x.id === t.ownerId)?.name || '—')}</span>
              <span className="k"><L.BarChart3 size={15} />Hiệu quả</span>
              <span className="small">{(() => { const d = subs.filter((x) => x.status === 'done'); const onTime = d.filter((x) => !x.dueDate || !x.completedAt || x.completedAt.slice(0, 10) <= x.dueDate).length; return subs.length ? <>{d.length}/{subs.length} đợt xong · <b style={{ color: 'var(--success)' }}>{d.length ? Math.round((onTime / d.length) * 100) : 0}% đúng hạn</b>{subs.some(isOverdue) && <span className="tone-danger"> · {subs.filter(isOverdue).length} đợt trễ</span>}</> : 'Chưa có đợt nào' })()}</span>
            </>}
            <span className="k"><L.Users size={15} />Người thực hiện</span>
            <span>
              {(t.assigneeIds || []).length > 0 ? (
                <span className="row wrap" style={{ gap: 6 }}>
                  {t.assigneeIds.map((aid) => {
                    const u = state.users.find((x) => x.id === aid)
                    return u ? (
                      <span key={aid} className="row chip" style={{ gap: 6, padding: '2px 8px 2px 2px', borderRadius: 99, background: 'var(--teal-50)', color: 'var(--teal-900)', border: '1px solid var(--teal-200)', fontWeight: 600 }}>
                        <Avatar user={u} size={20} />{u.name}
                      </span>
                    ) : null
                  })}
                </span>
              ) : (
                <span className="muted faint">— Chưa phân công —</span>
              )}
            </span>
            <span className="k"><L.UserCheck size={15} />Người giao</span><span className="row" style={{ gap: 6 }}><Avatar user={creator} size={22} />{creator?.name || '—'}</span>
            <span className="k"><L.History size={15} />Cập nhật</span><span className="muted">{timeAgo(t.updatedAt)}</span>
          </div>

          {(CATEGORY_MODULES[t.categoryId] || []).length > 0 && (
            <div className="ws-jump">
              <L.Briefcase size={16} color="var(--teal-700)" />
              <span className="small grow">Làm việc trực tiếp với dữ liệu:</span>
              {CATEGORY_MODULES[t.categoryId].map((mid) => <button key={mid} className="btn sm" onClick={() => { onClose(); go(`/projects/${p.id}/work/${mid}?task=${t.id}`) }}>{MODULE[mid].name}<L.ArrowRight size={13} /></button>)}
            </div>
          )}
          {t.categoryId === 'c10' && <div className="ws-jump"><L.FileBarChart size={16} color="var(--teal-700)" /><span className="small grow">Số liệu tổng hợp từ bàn làm việc:</span><button className="btn sm" onClick={() => { onClose(); go(`/projects/${p.id}/work/report?task=${t.id}`) }}>Báo cáo tổng hợp<L.ArrowRight size={13} /></button></div>}
          <div className="section-title">Mô tả / Ghi chú</div>
          {desc === null ? (
            <div className={cx('desc', !t.description && 'faint')} onClick={() => (isMgr || canStatus) && setDesc(t.description || '')}>
              {t.description || ((isMgr || canStatus) ? 'Bấm để thêm mô tả, yêu cầu, link tài liệu…' : 'Chưa có mô tả')}
            </div>
          ) : (
            <div>
              <textarea className="textarea" autoFocus value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} />
              <div className="row" style={{ marginTop: 8, gap: 8 }}>
                <button className="btn sm primary" onClick={() => { updateTask(t.id, { description: desc }, { logText: `cập nhật mô tả “${t.title}”` }); setDesc(null) }}>Lưu</button>
                <button className="btn sm ghost" onClick={() => setDesc(null)}>Hủy</button>
              </div>
            </div>
          )}

          {stream ? (
            <>
              <div className="row between" style={{ margin: '22px 0 8px' }}>
                <div className="section-title" style={{ margin: 0 }}>Các đợt thực hiện ({subs.filter((s) => s.status !== 'done').length} đang mở / {subs.length})</div>
                {(isMgr || t.ownerId === me.id) && <button className="btn sm primary" onClick={() => setRun(true)}><L.CalendarPlus size={14} />Mở đợt mới</button>}
              </div>
              <div className="qlist sublist">
                {[...subs].sort((a, b) => (a.status === 'done') - (b.status === 'done') || (a.dueDate || '').localeCompare(b.dueDate || '')).map((s) => {
                  const u = state.users.find((x) => x.id === s.assigneeIds[0])
                  const c = s.checklist || []
                  return (
                    <div key={s.id} className={cx('qrow', s.status === 'done' && 'done', isOverdue(s) && 'late')} onClick={() => openTask(s.id)}>
                      <StatusCircle status={s.status} size={16} onClick={(e) => cycle(s, e)} />
                      <span className="qtitle grow"><span className="ellipsis">{s.title}</span>{c.length > 0 && <span className="qmeta"><L.CheckSquare size={12} />{c.filter((x) => x.done).length}/{c.length}</span>}</span>
                      <Deadline task={s} icon={false} />
                      <Avatar user={u} size={22} />
                    </div>
                  )
                })}
                {!subs.length && <div className="faint small" style={{ padding: 10 }}>Chưa có đợt nào. Bấm “Mở đợt mới” để giao việc kèm checklist theo quy trình chuẩn.</div>}
              </div>

              <div className="row between" style={{ margin: '22px 0 6px' }}>
                <div className="section-title" style={{ margin: 0 }}>Quy trình chuẩn (SOP) · {(t.sop || []).length} bước</div>
              </div>
              <div className="faint small" style={{ marginBottom: 6 }}>Mỗi đợt mới sẽ tự có checklist theo các bước này.</div>
              <ol className="sop-edit">
                {(t.sop || []).map((x, i) => (
                  <li key={i}>
                    <span className="grow">{x}</span>
                    {isMgr && <>
                      <button className="iconbtn" disabled={i === 0} onClick={() => { const a = [...t.sop]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; updateTask(t.id, { sop: a }) }} aria-label="Lên"><L.ArrowUp size={13} /></button>
                      <button className="iconbtn" onClick={() => updateTask(t.id, { sop: t.sop.filter((_, k) => k !== i) }, { logText: `cập nhật quy trình “${t.title}”` })} aria-label="Xóa bước"><L.X size={13} /></button>
                    </>}
                  </li>
                ))}
              </ol>
              {isMgr && (
                <div className="row" style={{ marginTop: 6 }}>
                  <input className="input" placeholder="Thêm bước vào quy trình…" value={newCk} onChange={(e) => setNewCk(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && newCk.trim()) { updateTask(t.id, { sop: [...(t.sop || []), newCk.trim()] }, { logText: `cập nhật quy trình “${t.title}”` }); setNewCk('') } }} />
                  <button className="btn" onClick={() => { if (newCk.trim()) { updateTask(t.id, { sop: [...(t.sop || []), newCk.trim()] }, { logText: `cập nhật quy trình “${t.title}”` }); setNewCk('') } }}><L.Plus size={15} /></button>
                </div>
              )}
            </>
          ) : (<>
          <div className="row between" style={{ margin: '22px 0 8px' }}>
            <div className="section-title" style={{ margin: 0 }}>Công việc con ({subs.filter((s) => s.status === 'done').length}/{subs.length})</div>
          </div>
          <div className="qlist sublist">
            {subs.map((s) => {
              const u = state.users.find((x) => x.id === s.assigneeIds[0])
              return (
                <div key={s.id} className={cx('qrow', s.status === 'done' && 'done')} onClick={() => openTask(s.id)}>
                  <StatusCircle status={s.status} size={16} onClick={(e) => cycle(s, e)} />
                  <span className="qtitle grow"><span className="ellipsis">{s.title}</span></span>
                  <Deadline task={s} icon={false} />
                  <Avatar user={u} size={22} />
                </div>
              )
            })}
            {isMgr && (
              <div className="qadd on">
                <L.Plus size={15} />
                <input placeholder="Thêm công việc con rồi Enter…" value={newSub} onChange={(e) => setNewSub(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSub()} />
              </div>
            )}
            {!subs.length && !isMgr && <div className="faint small" style={{ padding: 8 }}>Không có công việc con</div>}
          </div>

          <div className="section-title" style={{ margin: '22px 0 6px' }}>Checklist {ck.length > 0 && `(${ck.filter((c) => c.done).length}/${ck.length})`}</div>
          {ck.map((c) => (
            <label key={c.id} className={cx('check', c.done && 'done')}>
              <input type="checkbox" checked={c.done} disabled={!canStatus} onChange={() => toggleCk(c.id)} />
              <span className="grow">{c.text}</span>
              {isMgr && <button className="iconbtn" onClick={(e) => { e.preventDefault(); delCk(c.id) }} aria-label="Xóa mục"><L.X size={14} /></button>}
            </label>
          ))}
          {canStatus && (
            <div className="row" style={{ marginTop: 6 }}>
              <input className="input" placeholder="Thêm bước cần làm…" value={newCk} onChange={(e) => setNewCk(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCk()} />
              <button className="btn" onClick={addCk}><L.Plus size={15} /></button>
            </div>
          )}
          </>)}

          <div className="tabs" style={{ marginTop: 26, marginBottom: 14 }}>
            <button className={cx('tab', tab === 'comments' && 'active')} onClick={() => setTab('comments')}>Thảo luận <span className="n">{comments.length}</span></button>
            <button className={cx('tab', tab === 'log' && 'active')} onClick={() => setTab('log')}>Lịch sử <span className="n">{acts.length}</span></button>
          </div>
          {tab === 'comments' ? (
            <>
              {comments.map((c) => {
                const u = state.users.find((x) => x.id === c.userId)
                return (
                  <div key={c.id} className="comment">
                    <Avatar user={u} size={32} />
                    <div className="grow"><div className="who"><b>{u?.name}</b> <span className="faint">· {timeAgo(c.createdAt)}</span></div><div className="bubble">{c.text}</div></div>
                  </div>
                )
              })}
              {!comments.length && <div className="faint small">Chưa có thảo luận. Mọi thành viên dự án đều có thể bình luận.</div>}
            </>
          ) : (
            <ul className="feed">
              {acts.map((a) => { const u = state.users.find((x) => x.id === a.userId); return <li key={a.id}><Avatar user={u} size={26} /><div><div className="txt"><b>{u?.name}</b> {a.text}</div><div className="when">{timeAgo(a.createdAt)}</div></div></li> })}
              <li><Avatar user={creator} size={26} /><div><div className="txt">Tạo bởi <b>{creator?.name}</b></div><div className="when">{fmtDate(t.createdAt?.slice(0, 10))}</div></div></li>
            </ul>
          )}
        </div>

        <div className="drawer-foot">
          <Avatar user={me} size={32} />
          <input className="input" placeholder="Viết bình luận… (gõ @Tên để nhắc ai đó)" value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()} />
          <button className="btn primary" onClick={send} disabled={!comment.trim()} aria-label="Gửi"><L.SendHorizontal size={16} /></button>
        </div>
      </aside>

      {edit && <TaskForm task={t} onClose={() => setEdit(false)} />}
      {run && <RunModal stream={t} onClose={() => setRun(false)} />}
      {ret !== null && (
        <Modal title="Yêu cầu chỉnh sửa" onClose={() => setRet(null)} footer={<>
          <button className="btn ghost" onClick={() => setRet(null)}>Hủy</button>
          <button className="btn accent" disabled={!ret.trim()} onClick={() => { updateTask(t.id, { status: 'doing' }, { returnNote: ret.trim() }); setRet(null); toast('Đã trả lại cho người phụ trách') }}>Gửi yêu cầu</button>
        </>}>
          <div className="field"><label>Nội dung cần chỉnh sửa</label><textarea className="textarea" autoFocus value={ret} onChange={(e) => setRet(e.target.value)} placeholder="VD: Bổ sung chứng từ khách sạn, sửa lại số tiền…" /></div>
        </Modal>
      )}
    </>
  )
}
