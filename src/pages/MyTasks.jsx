import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore, visibleTasks, visibleProjects, projectRole } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { ListView, BoardView } from '../components/TaskViews.jsx'
import WeeklyTimelineView from '../components/WeeklyTimelineView.jsx'
import { FilterBar, applyFilter, emptyFilter } from './ProjectDetail.jsx'
import { Icon, Avatar } from '../components/ui.jsx'
import { workHref } from '../modules/schema.js'
import { cx, isOverdue, isDueSoon, fmtDate, timeAgo } from '../lib/utils.js'
import EmailReviewModal from '../components/EmailReviewModal.jsx'
import UserApprovalModal from '../components/UserApprovalModal.jsx'

export default function MyTasks({ initialView }) {
  const { state, me } = useStore()
  const { newTask, go, openTask } = useUI()
  const openWork = (t) => { const h = workHref(t, state.tasks); h ? go(h) : openTask(t.id) }
  const q = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const managed = visibleProjects(state, me).filter((p) => projectRole(p, me) === 'manager')
  const [scope, setScope] = useState(q.get('f') === 'review' && managed.length ? 'review' : 'mine')
  const [view, setView] = useState(initialView || q.get('view') || 'list')
  const [f, setF] = useState({ ...emptyFilter, show: q.get('f') === 'overdue' ? 'overdue' : 'active' })
  const [reviewSub, setReviewSub] = useState('all')
  const [selectedProjectId, setSelectedProjectId] = useState('all')
  const [selectedReminder, setSelectedReminder] = useState(null)
  const [approvalOpen, setApprovalOpen] = useState(false)

  const isSuper = me.role === 'super_admin'
  const canApprove = isSuper || managed.length > 0
  const pendingReminders = (state.emailReminders || []).filter((r) => !r.sentAt)
  const pendingUsers = canApprove ? (state.users || []).filter((u) => u.status === 'pending') : []

  const all = visibleTasks(state, me)
  const sets = {
    mine: all.filter((t) => t.assigneeIds.includes(me.id)),
    assigned: all.filter((t) => t.createdBy === me.id && !t.assigneeIds.includes(me.id)),
    review: all.filter((t) => t.status === 'review' && managed.some((p) => p.id === t.projectId)),
    week: all.filter((t) => t.assigneeIds.includes(me.id) && (isOverdue(t) || isDueSoon(t, 7))),
  }

  const totalReviewCount = sets.review.length + pendingReminders.length + pendingUsers.length

  const tabs = [
    { id: 'mine', label: 'Được giao cho tôi', icon: 'UserCheck' },
    { id: 'assigned', label: 'Tôi đã giao', icon: 'Send' },
    ...(managed.length || canApprove ? [{ id: 'review', label: 'Chờ tôi duyệt', icon: 'BadgeCheck', count: totalReviewCount }] : []),
  ]
  const base = sets[scope]
  const list = applyFilter(base, scope === 'review' ? { ...f, show: 'all' } : f)
  const people = [...new Set(base.flatMap((t) => t.assigneeIds))].map((id) => state.users.find((u) => u.id === id)).filter(Boolean)
  const byProject = visibleProjects(state, me).filter((p) => list.some((t) => t.projectId === p.id))
  const displayedProjects = selectedProjectId === 'all'
    ? byProject
    : byProject.filter((p) => p.id === selectedProjectId)

  return (
    <>
      <div className="row between wrap" style={{ gap: 10 }}>
        <div className="tabs grow" style={{ marginBottom: 0, borderBottom: 0 }}>
          {tabs.map((t) => {
            const count = t.count !== undefined ? t.count : sets[t.id].filter((x) => x.status !== 'done' || t.id === 'review').length
            return (
              <button key={t.id} className={cx('tab', scope === t.id && 'active')} onClick={() => setScope(t.id)}>
                <Icon name={t.icon} size={16} />{t.label}
                <span className="n">{count}</span>
              </button>
            )
          })}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div className="seg">
            <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><L.ListTree size={14} />Danh sách</button>
            <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}><L.Columns3 size={14} />Kanban</button>
            <button className={view === 'timeline' ? 'on' : ''} onClick={() => setView('timeline')}><L.CalendarRange size={14} />Timeline</button>
          </div>
          {managed.length > 0 && <button className="btn primary" onClick={() => newTask({})}><L.Plus size={16} />Giao việc</button>}
        </div>
      </div>
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 14 }} />

      {scope === 'review' ? (
        <div className="stack" style={{ gap: 14 }}>
          {/* Sub-selector cho Chờ duyệt: Tất cả, Công việc, Email, Thành viên */}
          <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
            <span className="small muted" style={{ marginRight: 4, fontWeight: 600 }}>Phân loại:</span>
            <button
              type="button"
              className={cx('btn sm', reviewSub === 'all' ? 'accent' : 'ghost')}
              onClick={() => setReviewSub('all')}
            >
              Tất cả chờ duyệt ({totalReviewCount})
            </button>
            <button
              type="button"
              className={cx('btn sm', reviewSub === 'tasks' ? 'accent' : 'ghost')}
              onClick={() => setReviewSub('tasks')}
            >
              <L.CheckSquare size={14} /> Công việc ({sets.review.length})
            </button>
            <button
              type="button"
              className={cx('btn sm', reviewSub === 'emails' ? 'accent' : 'ghost')}
              onClick={() => setReviewSub('emails')}
            >
              <L.MailCheck size={14} /> Duyệt gửi email ({pendingReminders.length})
            </button>
            {canApprove && (
              <button
                type="button"
                className={cx('btn sm', reviewSub === 'users' ? 'accent' : 'ghost')}
                onClick={() => setReviewSub('users')}
              >
                <L.ShieldCheck size={14} /> Duyệt thành viên ({pendingUsers.length})
              </button>
            )}
          </div>

          {/* 1. Phần Duyệt gửi email */}
          {(reviewSub === 'all' || reviewSub === 'emails') && pendingReminders.length > 0 && (
            <div className="card" style={{ border: '1px solid #bfdbfe', overflow: 'hidden' }}>
              <div style={{ background: '#eff6ff', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #dbeafe' }}>
                <L.MailCheck size={16} color="#1d4ed8" />
                <b style={{ color: '#1e40af', fontSize: 13.5 }}>Email nhắc việc soạn sẵn chờ duyệt gửi qua Resend ({pendingReminders.length})</b>
              </div>
              <div style={{ divideY: '1px solid #f1f5f9' }}>
                {pendingReminders.map((r) => (
                  <div key={r.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', fontSize: 11, fontWeight: 700 }}>
                          {r.triggerTitle || 'Nhắc việc'}
                        </span>
                        <b style={{ fontSize: 13.5, color: '#0f172a' }}>{r.subject}</b>
                      </div>
                      <div className="small muted" style={{ marginTop: 3 }}>
                        Người nhận: <b>{r.to}</b> ({r.recipientName || 'Giảng viên/Phụ trách'}) · Soạn sẵn qua mẫu tự động
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn sm"
                      style={{ background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, gap: 6 }}
                      onClick={() => setSelectedReminder(r)}
                    >
                      <L.Eye size={14} />
                      Xem lại & Duyệt gửi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Phần Duyệt thành viên */}
          {(reviewSub === 'all' || reviewSub === 'users') && pendingUsers.length > 0 && (
            <div className="card" style={{ border: '1px solid #fed7aa', overflow: 'hidden' }}>
              <div style={{ background: '#fff7ed', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #ffedd5' }}>
                <L.ShieldCheck size={16} color="#c2410c" />
                <b style={{ color: '#9a3412', fontSize: 13.5 }}>Thành viên mới đăng ký chờ duyệt & phân quyền ({pendingUsers.length})</b>
              </div>
              <div>
                {pendingUsers.map((u) => (
                  <div key={u.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f1f5f9' }}>
                    <Avatar user={u} size={32} />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 13.5, color: '#0f172a' }}>{u.name}</b>
                      <div className="small muted">
                        {u.email} · Đăng ký {timeAgo(u.registeredAt || u.createdAt)} · Vai trò đề nghị: <span className="chip sm">{u.requestedRole || u.role}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn sm"
                      style={{ background: '#ea580c', color: '#fff', border: 'none', fontWeight: 600, gap: 6 }}
                      onClick={() => setApprovalOpen(true)}
                    >
                      <L.ShieldCheck size={14} />
                      Duyệt & Phân quyền
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Phần Công việc chờ duyệt */}
          {(reviewSub === 'all' || reviewSub === 'tasks') && (
            <div>
              {displayedProjects.length ? displayedProjects.map((p) => (
                <div key={p.id} className="card" style={{ marginBottom: 18, padding: '16px 18px', borderRadius: 12 }}>
                  <div className="row between wrap" style={{ marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                    <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                      <span className="proj-dot" style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
                      <b style={{ fontSize: 15 }}>{p.name}</b>
                      <span className="chip sm">{p.code}</span>
                      <span className="badge" style={{ background: '#fff4e0', color: '#b45309', fontSize: 11, fontWeight: 600 }}>
                        {list.filter((t) => t.projectId === p.id).length} việc chờ duyệt
                      </span>
                    </div>

                  </div>
                  <ListView project={p} tasks={list.filter((t) => t.projectId === p.id)} group hideEmpty noAdd onOpen={openWork} />
                </div>
              )) : (
                reviewSub === 'tasks' && <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Không có công việc nào đang chờ duyệt.</div>
              )}
            </div>
          )}

          {totalReviewCount === 0 && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
              <L.CheckCircle2 size={36} color="var(--teal-600)" style={{ margin: '0 auto 10px' }} />
              <b>Tất cả đều đã được xử lý!</b>
              <div className="small faint" style={{ marginTop: 4 }}>Không có công việc, email hay thành viên nào đang chờ bạn duyệt.</div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Thanh phân loại theo Dự án riêng biệt (Fig 3) */}
          {byProject.length > 1 && (
            <div
              className="card"
              style={{
                padding: '9px 14px',
                marginBottom: 12,
                background: '#ffffff',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div className="row wrap" style={{ gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
                  <L.FolderGit2 size={15} color="var(--teal-700)" />
                  Dự án:
                </span>

                <button
                  type="button"
                  className={cx('btn sm', selectedProjectId === 'all' ? 'accent' : 'ghost')}
                  style={{ fontWeight: 600, fontSize: 12, borderRadius: 8 }}
                  onClick={() => setSelectedProjectId('all')}
                >
                  Tất cả dự án ({list.length})
                </button>

                {byProject.map((p) => {
                  const count = list.filter((t) => t.projectId === p.id).length
                  const isSel = selectedProjectId === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={cx('btn sm', isSel ? 'accent' : 'ghost')}
                      style={{
                        fontWeight: 600,
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        borderRadius: 8,
                        borderColor: isSel ? undefined : '#e2e8f0',
                      }}
                      onClick={() => setSelectedProjectId(p.id)}
                    >
                      <span className="proj-dot" style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                      <span>{p.name}</span>
                      <span
                        className="chip sm"
                        style={{
                          fontSize: 10.5,
                          padding: '1px 5px',
                          background: isSel ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                          color: isSel ? '#fff' : 'inherit',
                          fontWeight: 700,
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>


            </div>
          )}

          <FilterBar f={f} setF={setF} members={scope === 'assigned' ? people : null} />

          {/* Chế độ hiển thị: Timeline theo tuần hoặc Danh sách/Kanban theo dự án */}
          {view === 'timeline' ? (
            <WeeklyTimelineView
              tasks={list}
              state={state}
              me={me}
              openWork={openWork}
              openTask={openTask}
            />
          ) : displayedProjects.length ? (
            displayedProjects.map((p) => {
              const pTasks = list.filter((t) => t.projectId === p.id)
              if (!pTasks.length) return null
              return (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    marginBottom: 20,
                    padding: '16px 18px',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    background: '#ffffff',
                  }}
                >
                  {/* Header nhận diện riêng từng dự án */}
                  <div
                    className="row between wrap"
                    style={{
                      marginBottom: 14,
                      paddingBottom: 10,
                      borderBottom: '1px solid #f1f5f9',
                      gap: 8,
                    }}
                  >
                    <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                      <span className="proj-dot" style={{ width: 12, height: 12, borderRadius: 3, background: p.color }} />
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                        {p.name}
                      </h3>
                      <span className="chip" style={{ fontSize: 11, fontWeight: 700 }}>
                        {p.code}
                      </span>
                      <span className="badge" style={{ background: '#f0fdfa', color: '#0f766e', fontSize: 11, fontWeight: 600 }}>
                        {pTasks.length} công việc
                      </span>
                    </div>

                    <div className="row" style={{ gap: 6 }}>

                      <button
                        type="button"
                        className="btn sm ghost"
                        style={{ fontSize: 11.5 }}
                        onClick={() => go(`project:${p.id}`)}
                        title="Đi tới trang chi tiết dự án"
                      >
                        <L.ExternalLink size={13} /> Mở dự án
                      </button>
                    </div>
                  </div>

                  {/* Hiển thị Kanban hoặc Danh sách cho riêng dự án này */}
                  {view === 'board' ? (
                    <BoardView project={p} tasks={pTasks} onOpen={openWork} />
                  ) : (
                    <ListView project={p} tasks={pTasks} group hideEmpty noAdd onOpen={openWork} />
                  )}
                </div>
              )
            })
          ) : (
            <div className="card" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--muted)' }}>
              Không có công việc nào phù hợp bộ lọc.
            </div>
          )}
        </>
      )}

      {selectedReminder && <EmailReviewModal reminder={selectedReminder} onClose={() => setSelectedReminder(null)} />}
      {approvalOpen && <UserApprovalModal onClose={() => setApprovalOpen(false)} />}
    </>
  )
}
