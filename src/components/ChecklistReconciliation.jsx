import { useMemo, useState } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { useToast } from './ui.jsx'
import { normalize, cx } from '../lib/utils.js'

export default function ChecklistReconciliation({ project }) {
  const { state, reconcileChecklistItem, resetChecklist } = useStore()
  const toast = useToast()

  const [q, setQ] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [conflictOnly, setConflictOnly] = useState(false)
  const [recStatusFilter, setRecStatusFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [noteInput, setNoteInput] = useState('')

  const items = useMemo(() => {
    return (state.checklist || []).filter((c) => c.projectId === project.id)
  }, [state.checklist, project.id])

  const conflictCount = useMemo(() => {
    return items.filter((c) => c.progressConflict).length
  }, [items])

  const confirmedCount = useMemo(() => {
    return items.filter((c) => c.verificationStatus !== 'Chờ đối chiếu').length
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((c) => {
      const matchCat = !catFilter || c.categoryCode === catFilter || c.categoryId === catFilter
      const matchConflict = !conflictOnly || c.progressConflict
      const matchRec = !recStatusFilter || c.verificationStatus === recStatusFilter
      const query = normalize(q.trim())
      const matchQ = !query || normalize(`${c.sourceCode} ${c.title} ${c.detail} ${c.legacyRole}`).includes(query)
      return matchCat && matchConflict && matchRec && matchQ
    })
  }, [items, catFilter, conflictOnly, recStatusFilter, q])

  const handleStatusChange = (id, newStatus) => {
    reconcileChecklistItem(id, newStatus)
    toast(`Đã cập nhật trạng thái đối soát: ${newStatus}`)
  }

  const handleSaveNote = (id) => {
    reconcileChecklistItem(id, undefined, noteInput)
    setEditingId(null)
    toast('Đã lưu ghi chú đối soát')
  }

  const handleReset = () => {
    if (window.confirm('Khôi phục danh sách 56 đầu việc về trạng thái bàn giao ban đầu? (Không tạo bản ghi trùng)')) {
      resetChecklist(project.id)
      toast('Đã nhập lại 56 đầu việc đối soát nguồn thành công')
    }
  }

  return (
    <div className="checklist-reconciliation" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Banner thông tin & nguyên tắc đối soát */}
      <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--orange-500, #d4712f)' }}>
        <div className="row between wrap" style={{ gap: 12 }}>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <span className="badge" style={{ background: 'rgba(212, 113, 47, 0.12)', color: '#b45309', fontWeight: 600 }}>Đối soát dữ liệu nguồn</span>
              <span className="faint small">Checklist K50–K51 · 56 dòng bàn giao ngày 14/11/2026</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 18, color: 'var(--teal-900)' }}>Bảng đối soát 56 đầu việc nguồn & Kiểm soát mâu thuẫn tiến độ</h2>
            <div className="muted small" style={{ marginTop: 4, maxWidth: 840, lineHeight: 1.5 }}>
              <b>Nguyên tắc kiểm soát:</b> 100% của checklist nguồn không đồng nghĩa với hoàn tất; các đầu việc lịch sử cần được đối chiếu chứng từ thực tế trước khi xác nhận. Giữ nguyên chuỗi hạn nguồn nguyên văn để không biến deadline lịch sử thành deadline mới.
            </div>
          </div>
          <div className="row wrap" style={{ gap: 10 }}>
            <span className="badge" style={{ background: '#fff', border: '1px solid var(--border)', padding: '6px 12px', fontSize: 13, color: '#c62828' }}>
              <L.AlertTriangle size={14} style={{ marginRight: 6 }} />
              <b>{conflictCount}</b> cờ mâu thuẫn (100% nguồn)
            </span>
            <span className="badge" style={{ background: '#fff', border: '1px solid var(--border)', padding: '6px 12px', fontSize: 13, color: 'var(--teal-800)' }}>
              <b>{confirmedCount}/{items.length}</b> đã đối soát
            </span>
            <button className="btn sm" onClick={handleReset} title="Chạy lại import không phát sinh trùng lặp (FR-13)">
              <L.RotateCcw size={14} /> Khôi phục nguồn
            </button>
          </div>
        </div>
      </div>

      {/* Thanh bộ lọc */}
      <div className="filterbar card" style={{ padding: '10px 14px' }}>
        <div className="search sm" style={{ minWidth: 240 }}>
          <L.Search size={15} />
          <input
            className="input"
            placeholder="Tìm theo mã Txxx, tên việc, mô tả..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select className="select sm" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">Tất cả hạng mục (10 hạng mục)</option>
          {Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0')).map((c) => (
            <option key={c} value={c}>Hạng mục {c}</option>
          ))}
        </select>

        <select className="select sm" value={recStatusFilter} onChange={(e) => setRecStatusFilter(e.target.value)}>
          <option value="">Mọi trạng thái đối soát</option>
          <option value="Chờ đối chiếu">Chờ đối chiếu</option>
          <option value="Đã xác nhận">Đã xác nhận</option>
          <option value="Đã hoàn tất có chứng từ">Đã hoàn tất có chứng từ</option>
          <option value="Cần điều chỉnh">Cần điều chỉnh</option>
        </select>

        <label className="row small" style={{ gap: 6, cursor: 'pointer', userSelect: 'none', marginLeft: 8 }}>
          <input
            type="checkbox"
            checked={conflictOnly}
            onChange={(e) => setConflictOnly(e.target.checked)}
            style={{ accentColor: '#c62828' }}
          />
          <span style={{ fontWeight: conflictOnly ? 700 : 400, color: conflictOnly ? '#c62828' : 'inherit' }}>
            Chỉ xem 18 dòng cờ mâu thuẫn
          </span>
        </label>
      </div>

      {/* Bảng checklist 56 dòng */}
      <div className="card table-wrap" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50, #f8fafc)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '10px 12px', width: 85 }}>Mã nguồn</th>
              <th style={{ padding: '10px 12px', minWidth: 260 }}>Đầu việc & Chi tiết nguồn</th>
              <th style={{ padding: '10px 12px', width: 90 }}>Hạng mục</th>
              <th style={{ padding: '10px 12px', width: 110 }}>Vai trò</th>
              <th style={{ padding: '10px 12px', width: 130 }}>Hạn gốc</th>
              <th style={{ padding: '10px 12px', width: 120 }}>Tiến độ gốc</th>
              <th style={{ padding: '10px 12px', width: 160 }}>Cờ mâu thuẫn</th>
              <th style={{ padding: '10px 12px', width: 170 }}>Đối soát thực tế</th>
              <th style={{ padding: '10px 12px', width: 180 }}>Ghi chú xác minh</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isEditing = editingId === item.id
              const hasConflict = item.progressConflict

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: hasConflict ? 'rgba(254, 242, 242, 0.4)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--teal-800)' }}>
                    {item.sourceCode}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <b style={{ color: 'var(--gray-900, #0f172a)' }}>{item.title}</b>
                    {item.detail && (
                      <div className="small muted" style={{ marginTop: 3, lineHeight: 1.45 }}>
                        {item.detail}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge" style={{ background: 'var(--teal-100)', color: 'var(--teal-800)', fontSize: 11 }}>
                      HM {item.categoryCode}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--muted)' }}>
                    {item.legacyRole || '—'}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>
                    <span className="chip" style={{ background: 'var(--gray-100, #f1f5f9)', fontSize: 11 }}>
                      {item.timelineOriginal || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div className="row" style={{ gap: 6 }}>
                      <span className="badge" style={{ background: item.sourceProgressPct === 100 ? '#e2f4e9' : 'var(--gray-100)', color: item.sourceProgressPct === 100 ? '#1e8a4c' : 'inherit', fontSize: 11 }}>
                        {item.sourceProgressPct}%
                      </span>
                      <span className="faint small">{item.sourceStatus}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {hasConflict ? (
                      <span
                        className="badge"
                        style={{
                          background: '#fdecec',
                          color: '#c62828',
                          fontSize: 11,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 600,
                        }}
                        title={item.conflictReason}
                      >
                        <L.AlertTriangle size={13} /> Cần xác minh (100%)
                      </span>
                    ) : (
                      <span className="badge" style={{ background: '#e2f4e9', color: '#1e8a4c', fontSize: 11 }}>
                        Bình thường
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <select
                      className="select sm"
                      style={{
                        fontSize: 12,
                        borderColor: item.verificationStatus === 'Đã hoàn tất có chứng từ' ? '#1e8a4c' : item.verificationStatus === 'Đã xác nhận' ? 'var(--teal-600)' : 'var(--border)',
                        fontWeight: item.verificationStatus !== 'Chờ đối chiếu' ? 600 : 400,
                      }}
                      value={item.verificationStatus || 'Chờ đối chiếu'}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    >
                      <option value="Chờ đối chiếu">Chờ đối chiếu</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Đã hoàn tất có chứng từ">Đã hoàn tất có chứng từ</option>
                      <option value="Cần điều chỉnh">Cần điều chỉnh</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {isEditing ? (
                      <div className="row" style={{ gap: 6 }}>
                        <input
                          className="input sm"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Nhập ghi chú..."
                          autoFocus
                        />
                        <button className="btn sm primary" onClick={() => handleSaveNote(item.id)}>Lưu</button>
                        <button className="btn sm" onClick={() => setEditingId(null)}>Hủy</button>
                      </div>
                    ) : (
                      <div
                        className="row between small"
                        style={{ cursor: 'pointer', padding: '4px 6px', borderRadius: 4, background: item.notes ? 'var(--teal-50)' : 'transparent' }}
                        onClick={() => {
                          setEditingId(item.id)
                          setNoteInput(item.notes || '')
                        }}
                        title="Click để sửa ghi chú"
                      >
                        <span className={item.notes ? 'ellipsis' : 'faint'} style={{ maxWidth: 140 }}>
                          {item.notes || 'Thêm ghi chú...'}
                        </span>
                        <L.Pencil size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
