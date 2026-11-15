import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { useToast, Avatar, Modal } from './ui.jsx'
import { TAG_COLORS, addDays, todayStr, uid } from '../lib/utils.js'
import ProjectModuleSettings from './ProjectModuleSettings.jsx'
import { PROJECT_TEMPLATES } from '../modules/moduleCatalog.js'

const COLORS = ['#03616a', '#d4712f', '#2563eb', '#7c3aed', '#16a34a', '#db2777', '#0891b2', '#ca8a04']

export default function ProjectForm({ project, onClose }) {
  const { state, me, createProject, updateProject, deleteProject, saveCategories } = useStore()
  const { go } = useUI()
  const toast = useToast()
  const [tab, setTab] = useState('info')
  const [f, setF] = useState(
    project
      ? { ...project }
      : {
          name: '',
          code: '',
          description: '',
          color: COLORS[0],
          startDate: todayStr(),
          endDate: addDays(90),
          memberIds: [],
          useDefaultCategories: true,
          templateKey: 'academic_partnership',
        }
  )
  const [cats, setCats] = useState(project?.categories || [])
  const [tags, setTags] = useState(project?.tags || [])
  const [modulesConfig, setModulesConfig] = useState(
    project?.modulesConfig ||
      (project?.id === 'p2' ? PROJECT_TEMPLATES.admissions_campaign.modules : PROJECT_TEMPLATES.academic_partnership.modules)
  )

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  const save = () => {
    if (!f.name.trim()) return
    if (project) {
      const clean = cats.filter((c) => c.name.trim()).map((c, i) => ({ ...c, no: String(i + 1).padStart(2, '0') }))
      updateProject(project.id, {
        name: f.name,
        code: f.code,
        description: f.description,
        color: f.color,
        startDate: f.startDate,
        endDate: f.endDate,
        categories: clean,
        tags: tags.filter((t) => t.name.trim()),
        modulesConfig,
      })
      toast('Đã lưu cấu hình dự án')
    } else {
      const id = createProject({
        ...f,
        code: (f.code || f.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 6)).toUpperCase(),
        modulesConfig,
      })
      toast('Đã tạo dự án')
      go('/projects/' + id)
    }
    onClose()
  }

  return (
    <Modal
      title={project ? 'Cài đặt dự án & Phân hệ Bàn làm việc' : 'Tạo dự án mới'}
      onClose={onClose}
      width={780}
      footer={
        <>
          {project && (
            <button
              className="btn danger"
              style={{ marginRight: 'auto' }}
              onClick={() => {
                if (confirm(`Xóa dự án “${project.name}” và toàn bộ công việc? Không thể hoàn tác.`)) {
                  deleteProject(project.id)
                  go('/projects')
                  onClose()
                }
              }}
            >
              <L.Trash2 size={15} />
              Xóa dự án
            </button>
          )}
          <button className="btn ghost" onClick={onClose}>
            Hủy
          </button>
          <button className="btn primary" onClick={save} disabled={!f.name.trim()}>
            {project ? 'Lưu thay đổi' : 'Tạo dự án'}
          </button>
        </>
      }
    >
      <div className="seg" style={{ alignSelf: 'flex-start', marginBottom: 14 }}>
        <button className={tab === 'info' ? 'on' : ''} onClick={() => setTab('info')}>
          Thông tin chung
        </button>
        <button className={tab === 'modules' ? 'on' : ''} onClick={() => setTab('modules')}>
          Phân hệ Bàn làm việc ({modulesConfig.filter((m) => m.isEnabled !== false).length})
        </button>
        {project && (
          <>
            <button className={tab === 'cats' ? 'on' : ''} onClick={() => setTab('cats')}>
              Hạng mục ({cats.length})
            </button>
            <button className={tab === 'tags' ? 'on' : ''} onClick={() => setTab('tags')}>
              Nhãn ({tags.length})
            </button>
          </>
        )}
      </div>

      {tab === 'info' && (
        <>
          <div className="grid2">
            <div className="field">
              <label>Tên dự án *</label>
              <input
                className="input"
                autoFocus
                value={f.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="VD: Song bằng UEH – Rennes hoặc Tuyển sinh K53"
              />
            </div>
            <div className="field">
              <label>Mã dự án</label>
              <input
                className="input"
                value={f.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                placeholder="VD: UEH-RENNES"
              />
            </div>
          </div>
          <div className="field">
            <label>Mô tả mục tiêu dự án</label>
            <textarea
              className="textarea"
              value={f.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="VD: Điều phối các hoạt động của chương trình song bằng..."
            />
          </div>
          <div className="grid2">
            <div className="field">
              <label>Ngày bắt đầu</label>
              <input
                className="input"
                type="date"
                value={f.startDate}
                onChange={(e) => set('startDate', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Ngày kết thúc</label>
              <input
                className="input"
                type="date"
                value={f.endDate}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Màu nhận diện</label>
            <div className="row">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => set('color', c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: c,
                    border: f.color === c ? '3px solid #fff' : 0,
                    boxShadow: f.color === c ? `0 0 0 2px ${c}` : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
          {!project && (
            <>
              <div className="field">
                <label>Thành viên ban đầu ({f.memberIds.length}) — bạn là Quản lý</label>
                <div className="picker">
                  {state.users
                    .filter((u) => u.id !== me.id)
                    .map((u) => (
                      <button
                        type="button"
                        key={u.id}
                        className={f.memberIds.includes(u.id) ? 'on' : ''}
                        onClick={() =>
                          set(
                            'memberIds',
                            f.memberIds.includes(u.id)
                              ? f.memberIds.filter((x) => x !== u.id)
                              : [...f.memberIds, u.id]
                          )
                        }
                      >
                        <Avatar user={u} size={24} />
                        {u.name}
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* TAB CẤU HÌNH PHÂN HỆ ĐỘNG */}
      {tab === 'modules' && (
        <ProjectModuleSettings
          project={project}
          value={modulesConfig}
          onChange={setModulesConfig}
        />
      )}

      {tab === 'cats' && (
        <div className="stack" style={{ gap: 8 }}>
          {cats.map((c, i) => (
            <div key={c.id} className="row">
              <span
                className="chip"
                style={{
                  width: 38,
                  justifyContent: 'center',
                  background: 'var(--orange-600)',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <input
                className="input"
                value={c.name}
                onChange={(e) =>
                  setCats(cats.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))
                }
              />
              <select
                className="select"
                style={{ width: 190, flexShrink: 0 }}
                title="Người phụ trách hạng mục – tự gợi ý khi giao việc / mở đợt"
                value={c.ownerId || ''}
                onChange={(e) =>
                  setCats(cats.map((x) => (x.id === c.id ? { ...x, ownerId: e.target.value } : x)))
                }
              >
                <option value="">Phụ trách: —</option>
                {(project?.members || []).map((mm) => {
                  const u = state.users.find((x) => x.id === mm.userId)
                  return (
                    u && (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    )
                  )
                })}
              </select>
              <button
                className="iconbtn"
                disabled={i === 0}
                onClick={() => {
                  const a = [...cats]
                  ;[a[i - 1], a[i]] = [a[i], a[i - 1]]
                  setCats(a)
                }}
                aria-label="Lên"
              >
                <L.ArrowUp size={15} />
              </button>
              <button
                className="iconbtn"
                onClick={() => {
                  if (state.tasks.some((t) => t.projectId === project.id && t.categoryId === c.id)) {
                    toast('Hạng mục đang có công việc, hãy chuyển việc trước khi xóa')
                    return
                  }
                  setCats(cats.filter((x) => x.id !== c.id))
                }}
                aria-label="Xóa"
              >
                <L.Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            className="btn"
            style={{ alignSelf: 'flex-start' }}
            onClick={() =>
              setCats([...cats, { id: uid('c'), no: '', name: '', icon: 'FolderKanban' }])
            }
          >
            <L.Plus size={15} />
            Thêm hạng mục
          </button>
        </div>
      )}

      {tab === 'tags' && (
        <div className="stack" style={{ gap: 8 }}>
          {tags.map((t) => (
            <div key={t.id} className="row">
              <select
                className="select"
                style={{ width: 70, background: t.color, color: '#fff' }}
                value={t.color}
                onChange={(e) =>
                  setTags(tags.map((x) => (x.id === t.id ? { ...x, color: e.target.value } : x)))
                }
              >
                {TAG_COLORS.map((c) => (
                  <option key={c} value={c} style={{ background: c }}>
                    ■
                  </option>
                ))}
              </select>
              <input
                className="input"
                value={t.name}
                onChange={(e) =>
                  setTags(tags.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)))
                }
              />
              <button
                className="iconbtn"
                onClick={() => setTags(tags.filter((x) => x.id !== t.id))}
                aria-label="Xóa"
              >
                <L.Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            className="btn"
            style={{ alignSelf: 'flex-start' }}
            onClick={() =>
              setTags([
                ...tags,
                { id: uid('tg'), name: '', color: TAG_COLORS[tags.length % TAG_COLORS.length] },
              ])
            }
          >
            <L.Plus size={15} />
            Thêm nhãn
          </button>
        </div>
      )}
    </Modal>
  )
}
