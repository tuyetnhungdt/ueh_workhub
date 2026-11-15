import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { buildSeed, SEED_V } from './seed.js'
import { LEGACY_CHECKLIST } from './rennesData.js'
import { DEFAULT_CATEGORIES, DEFAULT_TAGS, STATUS, uid, genCode, formatProjectCode } from '../lib/utils.js'
import { ROLES, USER_STATUS, normalizeRole, getRoleConfig } from './rbac.js'

const KINDS = ['users', 'projects', 'tasks', 'comments', 'activities', 'notifications', 'items', 'checklist', 'emailReminders']
const LS_KEY = 'ueh_workhub_v1'
const LS_USER = 'ueh_workhub_user'

const SB_URL = import.meta.env.VITE_SUPABASE_URL
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const HAS_SUPABASE = !!(SB_URL && SB_KEY)
const FORCE_DEMO = (() => { try { return localStorage.getItem('ueh_force_demo') === '1' } catch { return false } })()
export const MODE = HAS_SUPABASE && !FORCE_DEMO ? 'supabase' : 'demo'
export const enterDemo = () => { try { localStorage.setItem('ueh_force_demo', '1'); localStorage.removeItem('ueh_workhub_user') } catch {} ; location.hash = '/'; location.reload() }
export const exitDemo = () => { try { localStorage.removeItem('ueh_force_demo'); localStorage.removeItem('ueh_workhub_user') } catch {} ; location.hash = '/'; location.reload() }

const empty = () => Object.fromEntries(KINDS.map((k) => [k, []]))

function applyOps(state, ops) {
  const next = { ...state }
  for (const op of ops) {
    const list = next[op.kind] === state[op.kind] ? [...state[op.kind]] : next[op.kind]
    const idx = list.findIndex((x) => x.id === (op.data?.id ?? op.id))
    if (op.op === 'put') {
      if (idx >= 0) list[idx] = op.data
      else list.push(op.data)
    } else if (op.op === 'del' && idx >= 0) list.splice(idx, 1)
    next[op.kind] = list
  }
  return next
}

/* ---------------- Adapters ---------------- */
const localAdapter = {
  async load() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const st = JSON.parse(raw)
        if (st.projects) {
          st.projects.forEach((p) => {
            p.code = formatProjectCode(p.code)
            if (p.id === 'p3' && p.name && (p.name.includes('Quỹ Đầu tư Mạo hiểm tỉnh Gia Lai') || p.name.includes('Quỹ Đầu tư Mạo hiểm Gia Lai') || p.name.includes('Đề án Quỹ'))) {
              p.name = 'Đầu tư mạo hiểm Gia Lai'
            }
          })
        }
        if (st.users) {
          st.users.forEach((u) => {
            if (u.id === 'u1') {
              u.name = 'TS. Tô Công Nguyên Bảo'
              u.title = 'Quản lý dự án'
              u.email = 'baotcn@ueh.edu.vn'
              u.role = 'super_admin'
            } else if (u.id === 'u2') {
              u.name = 'ThS. Nguyễn Văn Thiện Tâm'
              u.title = 'Nhân sự chính'
              u.email = 'tamnvt@ueh.edu.vn'
            } else if (u.id === 'u3') {
              u.name = 'ThS. Hoàng Thị Phương Anh'
              u.title = 'Nhân sự chính'
              u.email = 'anhhtp@ueh.edu.vn'
            } else if (u.id === 'u4') {
              u.name = 'Đào Thị Tuyết Nhung'
              u.title = 'Trợ lý'
              u.role = 'assistant'
              u.email = 'tuyetnhungdt@ueh.edu.vn'
            } else if (['u8', 'u11'].includes(u.id) || u.role === 'assistant' || u.role === 'member') {
              u.title = 'Trợ lý'
            } else if (u.role === 'super_admin' || u.role === 'manager') {
              u.title = 'Quản lý dự án'
            } else {
              u.title = 'Nhân sự chính'
            }
          })
        }
        if (st.projects) {
          const p1 = st.projects.find((p) => p.id === 'p1')
          if (p1) {
            p1.members = [
              { userId: 'u1', role: 'manager' },
              { userId: 'u2', role: 'academic_admin' },
              { userId: 'u3', role: 'program_officer' },
              { userId: 'u4', role: 'assistant' },
            ]
          }
        }
        if (st.v === SEED_V) {
          const fresh = buildSeed()
          if (!st.items || !Array.isArray(st.items)) {
            st.items = fresh.items
          } else {
            const existingModKeys = new Set(st.items.map((x) => `${x.projectId}_${x.module}`))
            const missingItems = fresh.items.filter((x) => !existingModKeys.has(`${x.projectId}_${x.module}`))
            if (missingItems.length > 0) {
              st.items = [...st.items, ...missingItems]
            }
          }
          if (st.tasks && Array.isArray(st.tasks)) {
            const freshTasksMap = new Map(fresh.tasks.map((t) => [t.id, t]))
            st.tasks.forEach((t) => {
              if (t.externalRef && freshTasksMap.has(t.id)) {
                t.parentId = freshTasksMap.get(t.id).parentId
              }
            })
          }
          return st
        }
      }
    } catch {}
    return buildSeed()
  },
  saveState(state) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)) } catch {}
  },
  subscribe(onState) {
    const h = (e) => {
      if (e.key === LS_KEY && e.newValue) {
        try { onState(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', h)
    return () => window.removeEventListener('storage', h)
  },
}

let sbClient = null
export async function getSupabase() {
  if (!sbClient) {
    const { createClient } = await import('@supabase/supabase-js')
    sbClient = createClient(SB_URL, SB_KEY)
  }
  return sbClient
}

const supabaseAdapter = {
  async load() {
    const sb = await getSupabase()
    const { data, error } = await sb.from('records').select('kind,id,data')
    if (error) throw error
    const st = empty()
    for (const r of data) if (st[r.kind]) st[r.kind].push(r.data)
    return st
  },
  async persistOps(ops) {
    const sb = await getSupabase()
    const puts = ops.filter((o) => o.op === 'put').map((o) => ({ kind: o.kind, id: o.data.id, data: o.data, updated_at: new Date().toISOString() }))
    if (puts.length) await sb.from('records').upsert(puts)
    for (const o of ops.filter((o) => o.op === 'del')) await sb.from('records').delete().match({ kind: o.kind, id: o.id })
  },
  subscribeOps(onOps) {
    let ch
    getSupabase().then((sb) => {
      ch = sb
        .channel('records-rt')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, (p) => {
          if (p.eventType === 'DELETE') onOps([{ op: 'del', kind: p.old.kind, id: p.old.id }])
          else onOps([{ op: 'put', kind: p.new.kind, data: p.new.data }])
        })
        .subscribe()
    })
    return () => ch && sbClient.removeChannel(ch)
  },
}

const adapter = MODE === 'supabase' ? supabaseAdapter : localAdapter

/* ---------------- Store ---------------- */
const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const [meId, setMeId] = useState(() => (MODE === 'demo' ? localStorage.getItem(LS_USER) : null))
  const [authReady, setAuthReady] = useState(MODE === 'demo')
  const stateRef = useRef(state)
  stateRef.current = state

  // auth (supabase)
  useEffect(() => {
    if (MODE !== 'supabase') return
    let sub
    getSupabase().then(async (sb) => {
      const { data } = await sb.auth.getSession()
      setMeId(data.session?.user?.id ?? null)
      setAuthReady(true)
      sub = sb.auth.onAuthStateChange((_e, session) => setMeId(session?.user?.id ?? null)).data.subscription
    })
    return () => sub?.unsubscribe()
  }, [])

  // load data
  useEffect(() => {
    if (!authReady) return
    if (MODE === 'supabase' && !meId) return
    adapter.load().then(setState).catch((e) => setError(e.message || String(e)))
  }, [authReady, meId])

  useEffect(() => {
    if (adapter.subscribe) return adapter.subscribe((s) => setState(s))
    if (adapter.subscribeOps && meId) return adapter.subscribeOps((ops) => {
      // Vừa được thêm vào dự án mới → tải lại để nhận toàn bộ công việc của dự án đó
      const known = stateRef.current?.projects || []
      if (ops.some((o) => o.kind === 'projects' && o.op === 'put' && !known.some((p) => p.id === o.data.id))) adapter.load().then(setState)
      else setState((s) => (s ? applyOps(s, ops) : s))
    })
  }, [meId])

  useEffect(() => {
    if (state && adapter.saveState) adapter.saveState(state)
  }, [state])

  const dispatch = useCallback((ops) => {
    setState((s) => applyOps(s, ops))
    adapter.persistOps?.(ops).catch?.((e) => console.error(e))
  }, [])

  const me = state?.users.find((u) => u.authId === meId || u.id === meId) || null
  const myId = me?.id
  const linking = useRef(false)

  // supabase: liên kết tài khoản đăng nhập với hồ sơ nhân sự (do quản trị khai báo trước theo email)
  useEffect(() => {
    if (MODE !== 'supabase' || !state || !meId || me || linking.current) return
    linking.current = true
    getSupabase().then(async (sb) => {
      const { data } = await sb.auth.getUser()
      const email = (data.user?.email || '').toLowerCase()
      const pre = state.users.find((u) => !u.authId && (u.email || '').toLowerCase() === email)
      if (pre) dispatch([{ op: 'put', kind: 'users', data: { ...pre, authId: meId } }])
      else dispatch([{ op: 'put', kind: 'users', data: { id: uid('u'), authId: meId, name: data.user?.user_metadata?.name || email.split('@')[0], email, role: 'member', title: data.user?.user_metadata?.title || 'Thành viên', color: ['#03616a', '#d4712f', '#2563eb', '#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ca8a04'][state.users.length % 8] } }])
    }).finally(() => { linking.current = false })
  }, [state, meId, me, dispatch])

  const api = useMemo(() => {
    const S = () => stateRef.current
    const now = () => new Date().toISOString()
    const userName = (id) => S().users.find((u) => u.id === id)?.name || 'Ai đó'
    const act = (projectId, taskId, text) => ({ op: 'put', kind: 'activities', data: { id: uid('a'), projectId, taskId, userId: myId, text, createdAt: now() } })
    const notify = (userIds, projectId, taskId, text) =>
      [...new Set(userIds)].filter((u) => u && u !== myId).map((userId) => ({ op: 'put', kind: 'notifications', data: { id: uid('n'), userId, projectId, taskId, text, read: false, createdAt: now() } }))
    const projectManagers = (pid) => (S().projects.find((p) => p.id === pid)?.members || []).filter((m) => m.role === 'manager').map((m) => m.userId)

    return {
      // demo auth
      loginAs(id) { localStorage.setItem(LS_USER, id); setMeId(id) },
      async logout() {
        if (MODE === 'supabase') { const sb = await getSupabase(); await sb.auth.signOut() }
        else localStorage.removeItem(LS_USER)
        setMeId(null)
      },
      async signIn(email, password) { const sb = await getSupabase(); const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error },
      async signUp(email, password, name, title) {
        const sb = await getSupabase()
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name, title }, emailRedirectTo: window.location.origin } })
        if (error) throw error
        return { needsConfirm: !data.session }
      },
      async joinProject(code) {
        const c = code.trim().toUpperCase()
        if (MODE === 'supabase') {
          const sb = await getSupabase()
          const { data, error } = await sb.rpc('join_project', { p_code: c })
          if (error) throw new Error(/không đúng|not found/i.test(error.message) ? 'Mã dự án không đúng.' : error.message)
          const fresh = await adapter.load()
          setState(fresh)
          const p = fresh.projects.find((x) => x.id === data)
          if (p) dispatch([act(p.id, null, 'tham gia dự án bằng mã mời'), ...notify(p.members.filter((m) => m.role === 'manager').map((m) => m.userId), p.id, null, `${userName(myId)} đã tham gia dự án “${p.name}”`)])
          return data
        }
        const p = S().projects.find((x) => (x.joinCode || '').toUpperCase() === c)
        if (!p) throw new Error('Mã dự án không đúng.')
        if (!p.members.some((m) => m.userId === myId)) {
          dispatch([
            { op: 'put', kind: 'projects', data: { ...p, members: [...p.members, { userId: myId, role: 'member' }] } },
            act(p.id, null, 'tham gia dự án bằng mã mời'),
            ...notify(projectManagers(p.id), p.id, null, `${userName(myId)} đã tham gia dự án “${p.name}”`),
          ])
        }
        return p.id
      },
      regenerateCode(projectId) {
        const p = S().projects.find((x) => x.id === projectId)
        dispatch([{ op: 'put', kind: 'projects', data: { ...p, joinCode: genCode() } }, act(projectId, null, 'tạo mã tham gia mới (mã cũ hết hiệu lực)')])
      },
      resetDemo() { localStorage.removeItem(LS_KEY); setState(buildSeed()) },

      addUser({ name, email, title, role = ROLES.PROGRAM_OFFICER, status = USER_STATUS.ACTIVE }) {
        const colors = ['#03616a', '#d4712f', '#2563eb', '#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ca8a04']
        const data = { id: uid('u'), name, email, title, role, status, color: colors[S().users.length % colors.length] }
        dispatch([{ op: 'put', kind: 'users', data }])
        return data
      },
      updateUser(id, patch) {
        const u = S().users.find((x) => x.id === id)
        dispatch([{ op: 'put', kind: 'users', data: { ...u, ...patch } }])
      },

      /* ---------- RBAC: Quản lý đăng ký & Phân quyền dự án ---------- */
      approveUserRegistration(userId, { role, projectIds = [], projectRoles = {} }) {
        const u = S().users.find((x) => x.id === userId)
        if (!u) return
        const normalizedRole = role || u.requestedRole || ROLES.PROGRAM_OFFICER
        const userPatch = {
          ...u,
          role: normalizedRole,
          status: USER_STATUS.ACTIVE,
          approvedAt: now(),
          approvedBy: myId,
          rejectionReason: null,
        }
        const ops = [{ op: 'put', kind: 'users', data: userPatch }]

        // Gán dự án (UserProjectMapping): cập nhật members của các project kèm vai trò riêng cho từng dự án
        const allProjects = S().projects || []
        allProjects.forEach((p) => {
          const shouldBeIn = projectIds.includes(p.id)
          const isCurrentlyIn = p.members.some((m) => m.userId === userId)
          const assignedRole = projectRoles[p.id] || (normalizedRole === ROLES.SUPER_ADMIN ? 'manager' : normalizedRole)

          if (shouldBeIn) {
            const nextMembers = isCurrentlyIn
              ? p.members.map((m) => (m.userId === userId ? { ...m, role: assignedRole } : m))
              : [...p.members, { userId, role: assignedRole }]
            ops.push({
              op: 'put',
              kind: 'projects',
              data: { ...p, members: nextMembers },
            })
            if (!isCurrentlyIn) {
              const roleTitle = getRoleConfig(assignedRole, p)?.viName || assignedRole
              ops.push(act(p.id, null, `thêm thành viên đã duyệt ${u.name} vào dự án (${roleTitle})`))
            }
          } else if (!shouldBeIn && isCurrentlyIn) {
            ops.push({
              op: 'put',
              kind: 'projects',
              data: { ...p, members: p.members.filter((m) => m.userId !== userId) },
            })
          }
        })

        // Gửi thông báo đến user được duyệt
        const firstPid = projectIds[0] || 'p1'
        ops.push({
          op: 'put',
          kind: 'notifications',
          data: {
            id: uid('n'),
            userId,
            projectId: firstPid,
            text: `Tài khoản của bạn đã được Super Admin (${userName(myId)}) phê duyệt với vai trò chính ${getRoleConfig(normalizedRole).viName}.`,
            read: false,
            createdAt: now(),
          },
        })
        dispatch(ops)
      },

      rejectUserRegistration(userId, reason = 'Chưa đủ điều kiện tham gia dự án') {
        const u = S().users.find((x) => x.id === userId)
        if (!u) return
        const userPatch = {
          ...u,
          status: USER_STATUS.REJECTED,
          rejectionReason: reason,
          rejectedAt: now(),
          rejectedBy: myId,
        }
        const ops = [{ op: 'put', kind: 'users', data: userPatch }]
        // Xóa user khỏi các dự án nếu có
        const allProjects = S().projects || []
        allProjects.forEach((p) => {
          if (p.members.some((m) => m.userId === userId)) {
            ops.push({
              op: 'put',
              kind: 'projects',
              data: { ...p, members: p.members.filter((m) => m.userId !== userId) },
            })
          }
        })
        dispatch(ops)
      },

      registerUser({ name, email, title, requestedRole = ROLES.PROGRAM_OFFICER, requestedProjectIds = ['p1'], note = '' }) {
        const colors = ['#03616a', '#d4712f', '#2563eb', '#7c3aed', '#0891b2', '#db2777', '#16a34a', '#ca8a04']
        const id = uid('u')
        const data = {
          id,
          name,
          email,
          title,
          role: requestedRole,
          status: USER_STATUS.PENDING,
          requestedRole,
          requestedProjectIds,
          note,
          registeredAt: now(),
          color: colors[S().users.length % colors.length],
        }
        const adminIds = S().users.filter((u) => normalizeRole(u.role) === ROLES.SUPER_ADMIN).map((u) => u.id)
        dispatch([
          { op: 'put', kind: 'users', data },
          ...notify(adminIds, requestedProjectIds[0] || 'p1', null, `Nhân sự mới "${name}" vừa gửi yêu cầu tham gia dự án (chờ duyệt).`),
        ])
        return data
      },

      setUserProjects(userId, projectIds = [], projectRoles = {}) {
        const ops = []
        const u = S().users.find((x) => x.id === userId)
        if (!u) return
        const allProjects = S().projects || []
        allProjects.forEach((p) => {
          const shouldBeIn = projectIds.includes(p.id)
          const currentMember = p.members.find((m) => m.userId === userId)
          const roleForProject = projectRoles[p.id] || currentMember?.role || (u.role === ROLES.SUPER_ADMIN ? 'manager' : u.role) || 'member'

          if (shouldBeIn) {
            const nextMembers = currentMember
              ? p.members.map((m) => (m.userId === userId ? { ...m, role: roleForProject } : m))
              : [...p.members, { userId, role: roleForProject }]
            ops.push({
              op: 'put',
              kind: 'projects',
              data: { ...p, members: nextMembers },
            })
          } else if (!shouldBeIn && currentMember) {
            ops.push({
              op: 'put',
              kind: 'projects',
              data: { ...p, members: p.members.filter((m) => m.userId !== userId) },
            })
          }
        })
        if (ops.length) dispatch(ops)
      },

      createProject({ name, code, description, color, startDate, endDate, memberIds = [], useDefaultCategories = true, modulesConfig }) {
        const id = uid('p')
        const members = [{ userId: myId, role: 'manager' }, ...memberIds.filter((m) => m !== myId).map((userId) => ({ userId, role: 'member' }))]
        const data = {
          id, name, code, description, color: color || '#03616a', startDate, endDate, createdBy: myId, createdAt: now(), members,
          categories: useDefaultCategories ? DEFAULT_CATEGORIES.map((c) => ({ ...c })) : [{ id: uid('c'), no: '01', name: 'Chung', icon: 'FolderKanban' }],
          tags: DEFAULT_TAGS.map((t) => ({ ...t })),
          joinCode: genCode(),
          modulesConfig: modulesConfig || [],
        }
        dispatch([
          { op: 'put', kind: 'projects', data },
          act(id, null, `tạo dự án “${name}”`),
          ...notify(memberIds, id, null, `${userName(myId)} thêm bạn vào dự án “${name}”`),
        ])
        return id
      },
      updateProject(id, patch) {
        const p = S().projects.find((x) => x.id === id)
        dispatch([{ op: 'put', kind: 'projects', data: { ...p, ...patch } }, act(id, null, `cập nhật thông tin dự án`)])
      },

      /* ---------- Resend Email Dispatch & Milestone Reminders ---------- */
      createEmailReminder(reminderData) {
        const id = uid('er')
        const data = {
          id,
          status: 'pending_review',
          createdAt: now(),
          createdBy: myId,
          ...reminderData,
        }
        const ops = [{ op: 'put', kind: 'emailReminders', data }]
        if (data.assignedTo && data.assignedTo !== myId) {
          ops.push({
            op: 'put',
            kind: 'notifications',
            data: {
              id: uid('n'),
              userId: data.assignedTo,
              projectId: data.projectId || 'p1',
              reminderId: id,
              text: `📧 [Duyệt gửi Email]: ${data.title}`,
              read: false,
              createdAt: now(),
            },
          })
        }
        dispatch(ops)
        return id
      },

      sendEmailReminder(reminderId, { to, from, cc, bcc, subject, html, resendId, sentBy }) {
        const r = (S().emailReminders || []).find((x) => x.id === reminderId)
        if (!r) return
        const updated = {
          ...r,
          status: 'sent',
          sentAt: now(),
          sentBy: sentBy || myId,
          resendId,
          preDraft: {
            to,
            from,
            cc,
            bcc,
            subject,
            html,
          },
        }
        const ops = [
          { op: 'put', kind: 'emailReminders', data: updated },
          act(r.projectId, null, `duyệt gửi email "${subject}" đến ${to} qua Resend (ID: ${resendId})`),
        ]
        // Đánh dấu notification liên quan là đã đọc
        const notifs = (S().notifications || []).filter((n) => n.reminderId === reminderId && !n.read)
        notifs.forEach((n) => {
          ops.push({ op: 'put', kind: 'notifications', data: { ...n, read: true } })
        })
        dispatch(ops)
      },

      dismissEmailReminder(reminderId) {
        const r = (S().emailReminders || []).find((x) => x.id === reminderId)
        if (!r) return
        dispatch([{ op: 'put', kind: 'emailReminders', data: { ...r, status: 'dismissed' } }])
      },

      scanMilestonesAndCreateReminders(projectId = 'p1') {
        const st = S()
        const items = st.items || []
        const currentReminders = st.emailReminders || []
        const ops = []
        let count = 0

        // 1. Quét giảng viên chưa gửi điểm
        const lecturers = items.filter((x) => x.projectId === projectId && x.module === 'lecturers')
        lecturers.forEach((lec) => {
          if (lec.gradesSent === 'Chưa gửi điểm' && !currentReminders.some((r) => r.targetLecturer === lec.fullName && r.type === 'grade_reminder' && r.status === 'pending_review')) {
            const rid = uid('er')
            count++
            ops.push({
              op: 'put',
              kind: 'emailReminders',
              data: {
                id: rid,
                projectId,
                type: 'grade_reminder',
                title: `Nhắc hạn nộp bảng điểm học phần ${lec.courses || 'chuyên ngành'} - GV ${lec.fullName}`,
                triggerReason: `Học phần do GV ${lec.fullName} phụ trách hiện ở trạng thái "Chưa gửi điểm". Cần gửi email nhắc nộp điểm chính thức.`,
                targetLecturer: lec.fullName,
                lecturerEmail: lec.email || 'lecturer@univ-rennes.fr',
                courseName: lec.courses || 'Học phần Rennes',
                className: lec.cohorts || 'ISB-K51-01',
                deadline: '18/11/2026',
                assignedTo: 'u2',
                status: 'pending_review',
                createdAt: now(),
                preDraft: {
                  from: 'UEH-ISB Academic Affairs <academic@isb.edu.vn>',
                  to: lec.email || 'lecturer@univ-rennes.fr',
                  cc: 'academic.rennes@isb.edu.vn, thuha@ueh.demo',
                  bcc: '',
                  subject: `[UEH-ISB] Nhắc hạn nộp bảng điểm học phần ${lec.courses || ''}`,
                },
              },
            })
          }
        })

        // 2. Quét đoàn công tác sắp đến
        const trips = items.filter((x) => x.projectId === projectId && x.module === 'trips' && x.status !== 'Hủy')
        trips.forEach((trip) => {
          if (trip.arriveAt && !currentReminders.some((r) => r.type === 'flight_pickup_reminder' && r.targetLecturer === trip.lecturer && r.status === 'pending_review')) {
            const rid = uid('er')
            count++
            ops.push({
              op: 'put',
              kind: 'emailReminders',
              data: {
                id: rid,
                projectId,
                type: 'flight_pickup_reminder',
                title: `Xác nhận chuyến bay & xe đón tiễn GV ${trip.lecturer}`,
                triggerReason: `Chuyến bay ${trip.outFlight || 'đến TP.HCM'} của GV ${trip.lecturer} sắp diễn ra. Cần gửi email xác nhận xe đón tiễn tại sân bay và khách sạn.`,
                targetLecturer: trip.lecturer,
                lecturerEmail: 'franck.martin@univ-rennes.fr',
                courseName: trip.course || 'Học phần giảng dạy',
                className: trip.className || 'ISB-K51-01',
                deadline: trip.teachFrom || '05/12/2026',
                assignedTo: 'u5',
                status: 'pending_review',
                createdAt: now(),
                preDraft: {
                  from: 'UEH-ISB Logistics <academic@isb.edu.vn>',
                  to: 'franck.martin@univ-rennes.fr',
                  cc: 'thanhtung@ueh.demo',
                  bcc: '',
                  subject: `[UEH-ISB] Thông tin Đón tiễn Sân bay Tân Sơn Nhất & Khách sạn - GV ${trip.lecturer}`,
                },
              },
            })
          }
        })

        if (ops.length) dispatch(ops)
        return count
      },
      deleteProject(id) {
        const st = S()
        dispatch([
          { op: 'del', kind: 'projects', id },
          ...st.tasks.filter((t) => t.projectId === id).map((t) => ({ op: 'del', kind: 'tasks', id: t.id })),
        ])
      },
      setMember(projectId, userId, role) {
        const p = S().projects.find((x) => x.id === projectId)
        if (!p) return
        const exists = p.members.some((m) => m.userId === userId)
        const members = exists ? p.members.map((m) => (m.userId === userId ? { ...m, role } : m)) : [...p.members, { userId, role }]
        const roleName = getRoleConfig(role, p)?.viName || role
        dispatch([
          { op: 'put', kind: 'projects', data: { ...p, members } },
          act(projectId, null, exists ? `đổi vai trò của ${userName(userId)} thành “${roleName}”` : `thêm ${userName(userId)} vào dự án với vai trò “${roleName}”`),
          ...(exists ? [] : notify([userId], projectId, null, `${userName(myId)} thêm bạn vào dự án “${p.name}”`)),
        ])
      },
      removeMember(projectId, userId) {
        const p = S().projects.find((x) => x.id === projectId)
        dispatch([{ op: 'put', kind: 'projects', data: { ...p, members: p.members.filter((m) => m.userId !== userId) } }, act(projectId, null, `xóa ${userName(userId)} khỏi dự án`)])
      },
      saveCategories(projectId, categories) {
        const p = S().projects.find((x) => x.id === projectId)
        dispatch([{ op: 'put', kind: 'projects', data: { ...p, categories } }, act(projectId, null, 'cập nhật danh sách hạng mục')])
      },

      createTask(input) {
        const data = {
          id: uid('t'), description: '', checklist: [], priority: 'medium', status: 'todo', assigneeIds: [], tagIds: [], parentId: null,
          ...input, createdBy: myId, createdAt: now(), updatedAt: now(), completedAt: null,
        }
        const names = data.assigneeIds.map(userName).join(', ')
        dispatch([
          { op: 'put', kind: 'tasks', data },
          act(data.projectId, data.id, `giao “${data.title}”${names ? ' cho ' + names : ''}`),
          ...notify(data.assigneeIds, data.projectId, data.id, `${userName(myId)} giao cho bạn “${data.title}”`),
        ])
        return data.id
      },
      updateTask(id, patch, opts = {}) {
        const t = S().tasks.find((x) => x.id === id)
        if (!t) return
        const next = { ...t, ...patch, updatedAt: now() }
        const ops = [{ op: 'put', kind: 'tasks', data: next }]
        const me_ = userName(myId)
        if (patch.status && patch.status !== t.status) {
          next.completedAt = patch.status === 'done' ? now() : null
          let text = `chuyển “${t.title}” sang ${STATUS[patch.status].label}`
          let ntext = `${me_} chuyển “${t.title}” sang ${STATUS[patch.status].label}`
          let targets = [...t.assigneeIds, t.createdBy]
          if (patch.status === 'review') { text = `gửi duyệt “${t.title}”`; ntext = `${me_} gửi duyệt “${t.title}”`; targets = [t.createdBy, ...projectManagers(t.projectId)] }
          if (patch.status === 'done' && t.status === 'review') { text = `duyệt hoàn thành “${t.title}”`; ntext = `${me_} đã duyệt hoàn thành “${t.title}”` }
          if (opts.returnNote) { text = `yêu cầu chỉnh sửa “${t.title}”`; ntext = `${me_} yêu cầu chỉnh sửa “${t.title}”: ${opts.returnNote}` }
          ops.push(act(t.projectId, id, text), ...notify(targets, t.projectId, id, ntext))
          if (opts.returnNote) ops.push({ op: 'put', kind: 'comments', data: { id: uid('cm'), taskId: id, projectId: t.projectId, userId: myId, text: '↩ Yêu cầu chỉnh sửa: ' + opts.returnNote, createdAt: now() } })
        }
        if (patch.assigneeIds) {
          const added = patch.assigneeIds.filter((a) => !t.assigneeIds.includes(a))
          if (added.length) ops.push(act(t.projectId, id, `giao “${t.title}” cho ${added.map(userName).join(', ')}`), ...notify(added, t.projectId, id, `${me_} giao cho bạn “${t.title}”`))
        }
        if (patch.dueDate && patch.dueDate !== t.dueDate) {
          ops.push(act(t.projectId, id, `đổi hạn “${t.title}” thành ${patch.dueDate.split('-').reverse().join('/')}`), ...notify(t.assigneeIds, t.projectId, id, `${me_} đổi hạn “${t.title}”`))
        }
        if (opts.logText) ops.push(act(t.projectId, id, opts.logText))
        next.completedAt = next.status === 'done' ? next.completedAt || now() : null
        dispatch(ops)
      },
      startRun(streamId, { title, dueDate, startDate, assigneeIds, priority }) {
        const st = S().tasks.find((x) => x.id === streamId)
        const rid = uid('t')
        const data = {
          id: rid, projectId: st.projectId, categoryId: st.categoryId, parentId: st.id, title, description: '',
          assigneeIds: assigneeIds?.length ? assigneeIds : st.ownerId ? [st.ownerId] : (() => { const o = S().projects.find((p) => p.id === st.projectId)?.categories.find((c) => c.id === st.categoryId)?.ownerId; return o ? [o] : [] })(), priority: priority || 'medium', status: 'todo',
          startDate: startDate || null, dueDate: dueDate || null, tagIds: st.tagIds || [],
          checklist: (st.sop || []).map((text, k) => ({ id: rid + 'c' + k, text, done: false })),
          createdBy: myId, createdAt: now(), updatedAt: now(), completedAt: null,
        }
        dispatch([
          { op: 'put', kind: 'tasks', data },
          act(st.projectId, rid, `mở đợt “${title}” của đầu việc “${st.title}”`),
          ...notify(data.assigneeIds, st.projectId, rid, `${userName(myId)} giao cho bạn “${title}” (${st.title})`),
        ])
        return rid
      },
      deleteTask(id) {
        const st = S()
        const t = st.tasks.find((x) => x.id === id)
        const ids = [id]
        for (let i = 0; i < ids.length; i++) st.tasks.filter((x) => x.parentId === ids[i]).forEach((x) => ids.push(x.id))
        dispatch([
          ...ids.map((x) => ({ op: 'del', kind: 'tasks', id: x })),
          ...st.comments.filter((c) => ids.includes(c.taskId)).map((c) => ({ op: 'del', kind: 'comments', id: c.id })),
          act(t.projectId, null, `xóa công việc “${t.title}”`),
        ])
      },
      addComment(taskId, text) {
        const t = S().tasks.find((x) => x.id === taskId)
        const mentions = S().users.filter((u) => text.includes('@' + u.name)).map((u) => u.id)
        dispatch([
          { op: 'put', kind: 'comments', data: { id: uid('cm'), taskId, projectId: t.projectId, userId: myId, text, createdAt: now() } },
          { op: 'put', kind: 'tasks', data: { ...t, updatedAt: now() } },
          act(t.projectId, taskId, `bình luận trong “${t.title}”`),
          ...notify([...t.assigneeIds, t.createdBy, ...mentions], t.projectId, taskId, `${userName(myId)} bình luận trong “${t.title}”`),
        ])
      },
      /* ---------- Bàn làm việc: bản ghi nghiệp vụ ---------- */
      saveItem(projectId, module, data, label) {
        const old = data.id && S().items.find((x) => x.id === data.id)
        const rec = { ...(old || {}), ...data, id: data.id || uid('i'), projectId, module, updatedAt: now(), updatedBy: myId, createdAt: old?.createdAt || now(), createdBy: old?.createdBy || myId }
        dispatch([{ op: 'put', kind: 'items', data: rec }, act(projectId, null, `${old ? 'cập nhật' : 'thêm'} ${label || 'bản ghi'}`)])
        return rec.id
      },
      saveItems(projectId, module, list, summary) {
        const ops = list.map((d) => {
          const old = d.id && S().items.find((x) => x.id === d.id)
          return { op: 'put', kind: 'items', data: { ...(old || {}), ...d, id: d.id || uid('i'), projectId, module, updatedAt: now(), updatedBy: myId, createdAt: old?.createdAt || now(), createdBy: old?.createdBy || myId } }
        })
        dispatch([...ops, act(projectId, null, summary)])
      },
      deleteItems(projectId, ids, summary) {
        dispatch([...ids.map((id) => ({ op: 'del', kind: 'items', id })), act(projectId, null, summary)])
      },
      /* ---------- Đối soát checklist nguồn (WF07 & FR-13) ---------- */
      updateChecklistItem(item) {
        dispatch([{ op: 'put', kind: 'checklist', data: item }])
      },
      reconcileChecklistItem(id, verificationStatus, notes) {
        const item = (S().checklist || []).find((c) => c.id === id)
        if (!item) return
        const data = {
          ...item,
          verificationStatus,
          notes: notes !== undefined ? notes : (item.notes || ''),
          reconciledAt: now(),
          reconciledBy: myId,
        }
        dispatch([
          { op: 'put', kind: 'checklist', data },
          act(item.projectId, null, `đối soát đầu việc [${item.sourceCode}]: ${verificationStatus}`),
        ])
      },
      resetChecklist(projectId = 'p1') {
        const defaultItems = LEGACY_CHECKLIST.map((c) => ({
          id: c.source_task_code,
          projectId,
          sourceCode: c.source_task_code,
          legacyGroup: c.legacy_group,
          title: c.task_title,
          detail: c.detail,
          legacyRole: c.legacy_owner_role,
          timelineOriginal: c.timeline_original,
          sourceStatus: c.source_status,
          priority: c.priority_source,
          semester: c.semester_source,
          sourceProgressPct: c.progress_source_pct,
          categoryCode: c.category_code,
          categoryId: 'c' + String(c.category_code).padStart(2, '0'),
          verificationStatus: c.verification_status,
          progressConflict: c.progress_conflict,
          conflictReason: c.progress_conflict ? 'Tiến độ nguồn ghi 100% nhưng cần xác minh tài liệu & chứng từ thực tế theo tiêu chí nghiệm thu' : '',
          sourceType: c.source_type,
          relatedLiveTask: c.related_live_task,
          notes: '',
        }))
        const currentList = S().checklist || []
        const toDelete = currentList.filter((c) => c.projectId === projectId).map((c) => ({ op: 'del', kind: 'checklist', id: c.id }))
        const toPut = defaultItems.map((c) => ({ op: 'put', kind: 'checklist', data: c }))
        dispatch([...toDelete, ...toPut, act(projectId, null, 'nhập lại 56 đầu việc đối soát nguồn (idempotent import)')])
      },
      confirmScheduleSession(itemId, side, confirmed, version = 'v1.0') {
        const item = (S().items || []).find((x) => x.id === itemId && x.module === 'sessions')
        if (!item) return
        const patch = side === 'ueh' ? { uehConfirmed: confirmed } : { rennesConfirmed: confirmed }
        if (version) patch.scheduleVersion = version
        const data = { ...item, ...patch, updatedAt: now(), updatedBy: myId }
        dispatch([
          { op: 'put', kind: 'items', data },
          act(item.projectId, null, `${side === 'ueh' ? 'UEH' : 'Rennes'} ${confirmed ? 'xác nhận' : 'hủy xác nhận'} lịch giảng học phần “${item.course}”`),
        ])
      },
      notifyUser(userId, projectId, text) { dispatch(notify([userId], projectId, null, text)) },
      markRead(ids) {
        const st = S()
        dispatch(st.notifications.filter((n) => ids.includes(n.id) && !n.read).map((n) => ({ op: 'put', kind: 'notifications', data: { ...n, read: true } })))
      },
    }
  }, [myId, dispatch])

  const value = { state, me, meId, error, authReady, mode: MODE, ...api }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/* ---------------- Selectors ---------------- */
export const projectRole = (project, user) => {
  if (!project || !user) return null
  if (user.status === USER_STATUS.PENDING || user.status === USER_STATUS.REJECTED) return null
  const role = normalizeRole(user.role)
  if (role === ROLES.SUPER_ADMIN) return 'manager'
  return project.members?.find((m) => m.userId === user.id)?.role || null
}

export const isProjectManager = (project, user) => {
  if (!project || !user) return false
  if (user.status === USER_STATUS.PENDING || user.status === USER_STATUS.REJECTED) return false
  if (normalizeRole(user.role) === ROLES.SUPER_ADMIN) return true
  const role = project.members?.find((m) => m.userId === user.id)?.role
  if (role === 'manager') return true
  if (project.rolePermissions?.[role]?.isManager) return true
  return false
}

export const visibleProjects = (state, user) => {
  if (!state || !user) return []
  if (user.status === USER_STATUS.PENDING || user.status === USER_STATUS.REJECTED) return []
  const role = normalizeRole(user.role)
  if (role === ROLES.SUPER_ADMIN) return state.projects || []
  return (state.projects || []).filter((p) => p.members?.some((m) => m.userId === user.id))
}

export const isStream = (t) => !!t.isStream

// Việc thực tế (loại trừ "đầu việc" – vốn chỉ là khung quản lý, không có deadline riêng)
export const visibleTasks = (state, user) => {
  if (!state || !user) return []
  if (user.status === USER_STATUS.PENDING || user.status === USER_STATUS.REJECTED) return []
  const ids = new Set(visibleProjects(state, user).map((p) => p.id))
  return (state.tasks || []).filter((t) => ids.has(t.projectId) && !t.isStream)
}
