import React, { useState } from 'react'
import * as L from 'lucide-react'
import { toISODate, todayStr, isOverdue, fmtDate, STATUS, PRIORITY } from '../lib/utils.js'
import { Avatar } from './ui.jsx'

/**
 * Lịch Deadline theo Tuần (Weekly Timeline View)
 * Tích hợp chuẩn nhận diện xanh UEH (Teal/Emerald), tối ưu cho trang Việc của tôi.
 */
export default function WeeklyTimelineView({ tasks = [], state, me, openWork, openTask, selectedProjectId = 'all', project = null }) {
  const [weekOffset, setWeekOffset] = useState(0)

  // Tính toán 7 ngày trong tuần được chọn (bắt đầu từ Thứ 2 đến Chủ Nhật)
  const baseDate = new Date()
  const currentDayOfWeek = (baseDate.getDay() + 6) % 7 // 0 = Thứ 2, 6 = CN
  const monday = new Date(baseDate)
  monday.setDate(baseDate.getDate() - currentDayOfWeek + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
  const todayISO = todayStr()

  // Group tasks by dueDate
  const tasksByDay = {}
  days.forEach((d) => {
    tasksByDay[toISODate(d)] = []
  })

  tasks.forEach((t) => {
    if (t.dueDate && tasksByDay[t.dueDate]) {
      tasksByDay[t.dueDate].push(t)
    }
  })

  // Thống kê tổng quan trong tuần
  const allWeekTasks = days.flatMap((d) => tasksByDay[toISODate(d)] || [])
  const overdueCount = allWeekTasks.filter((t) => isOverdue(t)).length
  const doneCount = allWeekTasks.filter((t) => t.status === 'done').length
  const pendingCount = allWeekTasks.length - doneCount

  // Nhãn tuần
  const startDateStr = days[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  const endDateStr = days[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const monthYearStr = days[0].toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })

  return (
    <div className="card" style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: '#ffffff', marginBottom: 20 }}>
      {/* Header thanh điều hướng tuần với màu xanh UEH */}
      <div
        className="row between wrap"
        style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
          borderBottom: '1px solid var(--teal-200, #ccfbf1)',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
          <div className="row" style={{ gap: 4 }}>
            <button
              className="iconbtn"
              onClick={() => setWeekOffset((w) => w - 1)}
              title="Tuần trước"
              style={{ background: '#ffffff', border: '1px solid var(--border)' }}
            >
              <L.ChevronLeft size={16} />
            </button>
            <button
              className="btn sm"
              onClick={() => setWeekOffset(0)}
              style={{
                background: weekOffset === 0 ? 'var(--teal-700)' : '#ffffff',
                color: weekOffset === 0 ? '#ffffff' : 'var(--text)',
                borderColor: weekOffset === 0 ? 'var(--teal-700)' : 'var(--border)',
                fontWeight: 600,
              }}
            >
              Tuần này
            </button>
            <button
              className="iconbtn"
              onClick={() => setWeekOffset((w) => w + 1)}
              title="Tuần sau"
              style={{ background: '#ffffff', border: '1px solid var(--border)' }}
            >
              <L.ChevronRight size={16} />
            </button>
          </div>

          <div style={{ marginLeft: 6 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--teal-900, #042f2e)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <L.CalendarDays size={18} color="var(--teal-700)" />
              <span>{startDateStr} – {endDateStr}</span>
              <span className="badge" style={{ background: 'var(--teal-100)', color: 'var(--teal-800)', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                {monthYearStr}
              </span>
              {project && (
                <span
                  className="badge"
                  style={{
                    background: project.color ? `${project.color}15` : '#f1f5f9',
                    color: project.color || 'var(--text)',
                    border: `1px solid ${project.color || '#cbd5e1'}40`,
                    fontSize: 11.5,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <span className="proj-dot" style={{ width: 7, height: 7, borderRadius: 2, background: project.color }} />
                  {project.name}
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Legend & Tóm tắt số liệu tuần */}
        <div className="row wrap" style={{ gap: 10, alignItems: 'center', fontSize: 12 }}>
          <span className="badge" style={{ background: '#f8fafc', color: 'var(--muted)', border: '1px solid var(--border)', fontSize: 11.5, fontWeight: 600 }}>
            {allWeekTasks.length} deadline tuần này{project ? ` (${project.code})` : ''}
          </span>
          {overdueCount > 0 && (
            <span className="badge danger" style={{ fontSize: 11.5, fontWeight: 700 }}>
              <L.AlertCircle size={12} style={{ marginRight: 3 }} /> {overdueCount} quá hạn
            </span>
          )}
          {doneCount > 0 && (
            <span className="badge ok" style={{ fontSize: 11.5, fontWeight: 600 }}>
              <L.CheckCircle2 size={12} style={{ marginRight: 3 }} /> {doneCount} hoàn tất
            </span>
          )}
          <span className="row" style={{ gap: 5, color: 'var(--teal-800)', fontWeight: 600, marginLeft: 6 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--teal-700)' }} />
            Việc của bạn
          </span>
        </div>
      </div>

      {/* Grid 7 ngày trong tuần */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(160px, 1fr))',
          gap: 1,
          background: '#e2e8f0',
          overflowX: 'auto',
          minHeight: 460,
        }}
      >
        {days.map((d, idx) => {
          const iso = toISODate(d)
          const isToday = iso === todayISO
          const dayTasks = tasksByDay[iso] || []
          const dayName = dayNames[idx]
          const isWeekend = idx >= 5

          return (
            <div
              key={iso}
              style={{
                background: isToday ? '#f0fdfa' : isWeekend ? '#fbfcfe' : '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 160,
                borderTop: isToday ? '3px solid var(--teal-700)' : '3px solid transparent',
              }}
            >
              {/* Day Header */}
              <div
                style={{
                  padding: '10px 12px',
                  background: isToday ? 'rgba(3, 97, 106, 0.08)' : '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: isToday ? 'var(--teal-700)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {dayName}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--teal-900)' : 'var(--text)' }}>
                    {d.getDate()}/{d.getMonth() + 1}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isToday && (
                    <span
                      style={{
                        background: 'var(--teal-700)',
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: 4,
                      }}
                    >
                      Hôm nay
                    </span>
                  )}
                  {dayTasks.length > 0 && (
                    <span
                      style={{
                        background: isToday ? 'var(--teal-200)' : '#e2e8f0',
                        color: isToday ? 'var(--teal-900)' : '#475569',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 10,
                      }}
                    >
                      {dayTasks.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Day Task List */}
              <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, flexGrow: 1 }}>
                {dayTasks.length === 0 ? (
                  <div style={{ padding: '24px 8px', textAlign: 'center', color: '#94a3b8', fontSize: 11.5, fontStyle: 'italic' }}>
                    {project ? `Không có hạn chót (${project.code})` : 'Không có hạn chót'}
                  </div>
                ) : (
                  dayTasks.map((t) => {
                    const late = isOverdue(t)
                    const isDone = t.status === 'done'
                    const p = state.projects?.find((x) => x.id === t.projectId)
                    const isMine = t.assigneeIds?.includes(me.id)
                    const prio = PRIORITY[t.priority] || { label: 'Bình thường', color: '#64748b' }
                    const st = STATUS[t.status] || { label: t.status, color: '#64748b' }

                    return (
                      <div
                        key={t.id}
                        onClick={() => openWork(t)}
                        style={{
                          background: isDone ? '#f8fafc' : '#ffffff',
                          border: `1px solid ${late ? '#fca5a5' : isMine ? 'var(--teal-300, #5eead4)' : '#e2e8f0'}`,
                          borderLeft: `3px solid ${late ? 'var(--danger)' : isMine ? 'var(--teal-700)' : '#94a3b8'}`,
                          borderRadius: 8,
                          padding: '9px 10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          opacity: isDone ? 0.75 : 1,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none'
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                      >
                        {/* Top tag: Project + Priority */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 5 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: p?.color || 'var(--teal-700)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 100,
                            }}
                            title={p?.name}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: 2, background: p?.color || 'var(--teal-700)', flexShrink: 0 }} />
                            {p?.code || p?.name}
                          </span>

                          <span
                            style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              color: prio.color,
                              background: prio.color + '15',
                              padding: '1px 5px',
                              borderRadius: 4,
                            }}
                          >
                            {prio.label}
                          </span>
                        </div>

                        {/* Task Title */}
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: isDone ? 'var(--muted)' : 'var(--text)',
                            textDecoration: isDone ? 'line-through' : 'none',
                            lineHeight: 1.35,
                            marginBottom: 8,
                          }}
                        >
                          {t.title}
                        </div>

                        {/* Bottom row: Status & Late warning */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginTop: 'auto' }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: st.color,
                              background: st.color + '15',
                              padding: '1px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {st.label}
                          </span>

                          {late && !isDone && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: 'var(--danger)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <L.AlertCircle size={10} /> Quá hạn
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
