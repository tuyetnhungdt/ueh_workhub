import { createContext, useContext, useEffect, useState } from 'react'
import * as L from 'lucide-react'
import { STATUS, PRIORITY, deadlineLabel, initials, cx } from '../lib/utils.js'

const ICONS = { FileText: L.FileText, Users: L.Users, UsersRound: L.UsersRound || L.Users, CalendarDays: L.CalendarDays, GraduationCap: L.GraduationCap, Presentation: L.Presentation, Plane: L.Plane, PlaneTakeoff: L.PlaneTakeoff || L.Plane, Coins: L.Coins, Calculator: L.Calculator, MessagesSquare: L.MessagesSquare, BarChart3: L.BarChart3, Megaphone: L.Megaphone, FolderKanban: L.FolderKanban, LayoutDashboard: L.LayoutDashboard, ListTodo: L.ListTodo, ListTree: L.ListTree, Columns3: L.Columns3, GanttChart: L.GanttChart, ChartColumn: L.ChartColumn, Activity: L.Activity, AlarmClock: L.AlarmClock, CalendarClock: L.CalendarClock, BadgeCheck: L.BadgeCheck, Trophy: L.Trophy, UserCheck: L.UserCheck, Send: L.Send, Inbox: L.Inbox, PartyPopper: L.PartyPopper, ClipboardList: L.ClipboardList, FolderX: L.FolderX, Lock: L.Lock, ShieldCheck: L.ShieldCheck, ArrowDown: L.ArrowDown, ArrowRight: L.ArrowRight, ArrowUp: L.ArrowUp, ChevronsUp: L.ChevronsUp, Folder: L.Folder, ClipboardCheck: L.ClipboardCheck, Mail: L.Mail, ListChecks: L.ListChecks, Briefcase: L.Briefcase, Award: L.Award, Database: L.Database, BookOpenCheck: L.BookOpenCheck, Library: L.Library }
export const Icon = ({ name, size = 18, ...p }) => {
  const C = ICONS[name] || L.Folder
  return <C size={size} {...p} />
}

export function Avatar({ user, size = 30, title }) {
  if (!user) return <span className="avatar" style={{ width: size, height: size, background: '#cbd5d6', fontSize: size * 0.38 }}>?</span>
  return (
    <span className="avatar" title={title ?? user.name} style={{ width: size, height: size, background: user.color || '#03616a', fontSize: size * 0.36 }}>
      {initials(user.name)}
    </span>
  )
}

export function AvatarStack({ users, size = 26, max = 4 }) {
  const shown = users.slice(0, max)
  return (
    <span className="avatars">
      {shown.map((u) => <Avatar key={u.id} user={u} size={size} />)}
      {users.length > max && <span className="avatar" style={{ width: size, height: size, background: '#94a3b8', fontSize: size * 0.36 }}>+{users.length - max}</span>}
    </span>
  )
}

export function StatusBadge({ status }) {
  const s = STATUS[status]
  return <span className="badge" style={{ background: s.bg, color: s.color }}><span className="dot" />{s.label}</span>
}

/* Vòng tròn trạng thái kiểu Quire: rỗng → 1/3 → 2/3 → đầy (✓) */
export function StatusCircle({ status, size = 18, onClick, title }) {
  const s = STATUS[status]
  const frac = { todo: 0, doing: 0.4, review: 0.75, done: 1 }[status]
  const r = size / 2 - 1.5
  const c = 2 * Math.PI * r
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag type={onClick ? 'button' : undefined} className="scircle" onClick={onClick} title={title || s.label} style={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {status === 'done' ? (
          <>
            <circle cx={size / 2} cy={size / 2} r={r + 1} fill={s.color} />
            <path d={`M${size * 0.3} ${size * 0.52} L${size * 0.45} ${size * 0.66} L${size * 0.72} ${size * 0.37}`} stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={frac ? s.color : '#9fb0b2'} strokeWidth="1.8" />
            {frac > 0 && (
              <circle cx={size / 2} cy={size / 2} r={r / 2} fill="none" stroke={s.color} strokeWidth={r}
                strokeDasharray={`${(c / 2) * frac} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
            )}
          </>
        )}
      </svg>
    </Tag>
  )
}

export function PriorityIcon({ priority, size = 15 }) {
  const p = PRIORITY[priority]
  if (!p) return null
  const name = { low: 'ArrowDown', medium: 'ArrowRight', high: 'ArrowUp', urgent: 'ChevronsUp' }[priority]
  return <span title={'Ưu tiên: ' + p.label} style={{ color: p.color, display: 'inline-flex' }}><Icon name={name} size={size} strokeWidth={2.4} /></span>
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY[priority]
  return <span className="badge" style={{ color: p.color, background: p.color + '14' }}><PriorityIcon priority={priority} size={13} />{p.label}</span>
}

export function Deadline({ task, icon = true }) {
  const d = deadlineLabel(task)
  return (
    <span className={cx('small', 'tone-' + d.tone)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: d.tone === 'danger' || d.tone === 'warn' ? 600 : 500, whiteSpace: 'nowrap' }}>
      {icon && <L.CalendarClock size={13} />}{d.text}
    </span>
  )
}

export function Tags({ project, ids = [], compact }) {
  if (!project?.tags || !ids.length) return null
  const tags = ids.map((id) => project.tags.find((t) => t.id === id)).filter(Boolean)
  return (
    <span className="tags">
      {tags.map((t) => (
        <span key={t.id} className={cx('tag', compact && 'compact')} style={{ background: t.color }} title={t.name}>{compact ? t.name.slice(0, 1) : t.name}</span>
      ))}
    </span>
  )
}

export const Progress = ({ value, orange }) => <div className={cx('progress', orange && 'orange')}><i style={{ width: value + '%' }} /></div>

export function Modal({ title, onClose, children, footer, width }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <>
      <div className="overlay top" onClick={onClose} />
      <div className="modal" style={width ? { width: `min(${width}px, calc(100vw - 32px))` } : null} role="dialog" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="iconbtn" onClick={onClose} aria-label="Đóng"><L.X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </>
  )
}

export const Empty = ({ icon = 'Inbox', text, children }) => (
  <div className="empty"><Icon name={icon} size={40} /><div>{text}</div>{children}</div>
)

/* Sparkline nhỏ cho cột Trend */
export function Sparkline({ data, color = '#0b7480', w = 110, h = 26 }) {
  const max = Math.max(1, ...data)
  const pts = data.map((v, i) => `${(i / Math.max(1, data.length - 1)) * w},${h - 2 - (v / max) * (h - 4)}`).join(' ')
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" /></svg>
}

/* Toast */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2600)
    return () => clearTimeout(t)
  }, [msg])
  return (
    <ToastCtx.Provider value={setMsg}>
      {children}
      {msg && <div className="toast"><L.CheckCircle2 size={17} color="#ffb27a" />{msg}</div>}
    </ToastCtx.Provider>
  )
}
