import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore, visibleProjects, projectRole } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { useToast, Avatar, Modal } from './ui.jsx'
import { PRIORITIES, addDays, todayStr, uid } from '../lib/utils.js'
import { CADENCES } from '../data/rennes.js'

export default function TaskForm({ task, defaults = {}, onClose }) {
  const { state, me, createTask, updateTask } = useStore()
  const { openTask } = useUI()
  const toast = useToast()
  const managed = visibleProjects(state, me).filter((p) => projectRole(p, me) === 'manager')
  const init = task || {
    projectId: defaults.projectId || managed[0]?.id || '',
    categoryId: defaults.categoryId || '',
    parentId: defaults.parentId || null,
    title: '', description: '', assigneeIds: defaults.assigneeIds || [], priority: 'medium', status: 'todo',
    startDate: todayStr(), dueDate: addDays(7), tagIds: [], checklistText: '', isStream: !!defaults.isStream, cadence: 'batch', sopText: '',
  }
  const [f, setF] = useState({ ...init })
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const proj = state.projects.find((p) => p.id === f.projectId)
  const members = (proj?.members || []).map((m) => ({ ...m, u: state.users.find((u) => u.id === m.userId) })).filter((m) => m.u)
  const catId = f.categoryId || proj?.categories[0]?.id || ''
  const parents = state.tasks.filter((t) => t.projectId === f.projectId && !t.parentId && t.id !== task?.id)

  if (!managed.length) {
    return <Modal title="Giao việc" onClose={onClose}><div className="callout info"><L.Info size={18} />Chỉ quản lý dự án mới có thể giao việc. Bạn có thể cập nhật trạng thái, checklist và bình luận trong các việc được giao.</div></Modal>
  }

  const save = () => {
    if (!f.title.trim() || !f.projectId) return
    if (f.isStream) {
      const sd = { projectId: f.projectId, categoryId: catId, title: f.title.trim(), description: f.description, cadence: f.cadence, tagIds: f.tagIds || [],
        ownerId: f.assigneeIds[0] || null, assigneeIds: f.assigneeIds.slice(0, 1) }
      if (task) { updateTask(task.id, sd, { logText: `cập nhật đầu việc “${sd.title}”` }); toast('Đã lưu đầu việc') }
      else {
        const id = createTask({ ...sd, isStream: true, status: 'doing', priority: 'medium', startDate: null, dueDate: null, parentId: null,
          sop: (f.sopText || '').split('\n').map((x) => x.trim()).filter(Boolean) })
        toast('Đã tạo đầu việc thường xuyên'); openTask(id)
      }
      onClose(); return
    }
    if (f.dueDate && f.startDate && f.dueDate < f.startDate) { toast('Hạn hoàn thành phải sau ngày bắt đầu'); return }
    const data = {
      projectId: f.projectId, categoryId: catId, parentId: f.parentId || null, title: f.title.trim(), description: f.description,
      assigneeIds: f.assigneeIds, priority: f.priority, startDate: f.startDate, dueDate: f.dueDate, tagIds: f.tagIds || [],
    }
    if (task) { updateTask(task.id, data, { logText: `cập nhật thông tin “${data.title}”` }); toast('Đã lưu thay đổi') }
    else {
      const checklist = (f.checklistText || '').split('\n').map((s) => s.trim()).filter(Boolean).map((text) => ({ id: uid('ck'), text, done: false }))
      const id = createTask({ ...data, checklist })
      toast(data.assigneeIds.length ? 'Đã giao việc & gửi thông báo cho người phụ trách' : 'Đã tạo công việc')
      openTask(id)
    }
    onClose()
  }
  const toggle = (k, id) => set(k, f[k].includes(id) ? f[k].filter((x) => x !== id) : [...f[k], id])

  return (
    <Modal title={task ? (f.isStream ? 'Chỉnh sửa đầu việc' : 'Chỉnh sửa công việc') : (f.isStream ? 'Tạo đầu việc thường xuyên' : 'Giao việc mới')} onClose={onClose} width={680}
      footer={<><button className="btn ghost" onClick={onClose}>Hủy</button><button className="btn primary" onClick={save} disabled={!f.title.trim()}><L.Send size={15} />{task ? 'Lưu' : 'Giao việc'}</button></>}>
      {!task && (
        <div className="seg" style={{ alignSelf: 'flex-start' }}>
          <button type="button" className={!f.isStream ? 'on' : ''} onClick={() => set('isStream', false)}><L.CheckCircle2 size={14} />Công việc / đợt cụ thể</button>
          <button type="button" className={f.isStream ? 'on' : ''} onClick={() => set('isStream', true)}><L.Repeat size={14} />Đầu việc thường xuyên</button>
        </div>
      )}
      {f.isStream && <div className="callout info"><L.Repeat size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} /><div><b>Đầu việc thường xuyên</b> là một nhiệm vụ lặp lại (VD: “Lập đề nghị chuyển tiền cho Rennes”). Có người phụ trách chính và quy trình chuẩn; mỗi lần thực hiện bạn <b>mở một đợt</b> có deadline, checklist tự sinh theo quy trình.</div></div>}
      <div className="field"><label>{f.isStream ? 'Tên đầu việc *' : 'Tên công việc *'}</label><input className="input" autoFocus value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="VD: Lập đề nghị chuyển tiền học phí cho Rennes" /></div>
      <div className="grid2">
        <div className="field"><label>Dự án</label>
          <select className="select" value={f.projectId} disabled={!!task} onChange={(e) => setF({ ...f, projectId: e.target.value, categoryId: '', assigneeIds: [], tagIds: [], parentId: null })}>
            {managed.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Hạng mục</label>
          <select className="select" value={catId} onChange={(e) => { const o = (proj?.categories || []).find((c) => c.id === e.target.value)?.ownerId; setF((x) => ({ ...x, categoryId: e.target.value, assigneeIds: x.assigneeIds.length || !o ? x.assigneeIds : [o] })) }}>
            {(proj?.categories || []).map((c) => <option key={c.id} value={c.id}>{c.no}. {c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="field"><label>{f.isStream ? 'Phụ trách chính (chọn 1)' : `Người phụ trách (${f.assigneeIds.length})`}</label>
        <div className="picker">
          {members.map((m) => (
            <button type="button" key={m.userId} className={f.assigneeIds.includes(m.userId) ? 'on' : ''} onClick={() => (f.isStream ? set('assigneeIds', f.assigneeIds.includes(m.userId) ? [] : [m.userId]) : toggle('assigneeIds', m.userId))}>
              <Avatar user={m.u} size={24} />{m.u.name}
            </button>
          ))}
        </div>
      </div>
      {f.isStream ? (
        <div className="field"><label>Chu kỳ</label><div className="seg" style={{ alignSelf: 'flex-start', flexWrap: 'wrap' }}>{CADENCES.map((c) => <button type="button" key={c.id} className={f.cadence === c.id ? 'on' : ''} onClick={() => set('cadence', c.id)}>{c.label}</button>)}</div></div>
      ) : (<>
      <div className="grid2">
        <div className="field"><label>Ngày bắt đầu</label><input className="input" type="date" value={f.startDate || ''} onChange={(e) => set('startDate', e.target.value)} /></div>
        <div className="field"><label>Hạn hoàn thành (deadline)</label><input className="input" type="date" value={f.dueDate || ''} onChange={(e) => set('dueDate', e.target.value)} /></div>
      </div>
      <div className="grid2">
        <div className="field"><label>Mức ưu tiên</label>
          <div className="seg">{PRIORITIES.map((p) => <button type="button" key={p.id} className={f.priority === p.id ? 'on' : ''} style={f.priority === p.id ? { color: p.color } : null} onClick={() => set('priority', p.id)}>{p.label}</button>)}</div>
        </div>
        <div className="field"><label>Thuộc công việc cha (tùy chọn)</label>
          <select className="select" value={f.parentId || ''} onChange={(e) => set('parentId', e.target.value || null)}>
            <option value="">— Không —</option>
            {parents.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
      </div>
      </>)}
      {proj?.tags?.length > 0 && (
        <div className="field"><label>Nhãn</label>
          <div className="picker">
            {proj.tags.map((t) => (
              <button type="button" key={t.id} className={(f.tagIds || []).includes(t.id) ? 'on' : ''} style={(f.tagIds || []).includes(t.id) ? { background: t.color, borderColor: t.color } : null} onClick={() => toggle('tagIds', t.id)}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: t.color, marginLeft: 6 }} />{t.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="field"><label>Mô tả / yêu cầu</label><textarea className="textarea" value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Kết quả cần đạt, tài liệu liên quan, lưu ý…" /></div>
      {!task && f.isStream && <div className="field"><label>Quy trình chuẩn – SOP (mỗi dòng một bước)</label><textarea className="textarea" rows={4} value={f.sopText} onChange={(e) => set('sopText', e.target.value)} placeholder={'Lập bảng tính\nTrình duyệt\nGửi Phòng KHTC chuyển tiền'} /></div>}
      {!task && !f.isStream && <div className="field"><label>Checklist (mỗi dòng một bước)</label><textarea className="textarea" rows={3} value={f.checklistText} onChange={(e) => set('checklistText', e.target.value)} placeholder={'Chuẩn bị hồ sơ\nTrình ký\nGửi đối tác'} /></div>}
    </Modal>
  )
}
