import { useState } from 'react'
import * as L from 'lucide-react'
import { WORKFLOWS_DEF } from '../data/rennesData.js'
import { useUI } from '../App.jsx'
import { Icon } from './ui.jsx'
import { cx } from '../lib/utils.js'

export default function WorkflowsView({ project, onOpenFlightWorkflow }) {
  const { go } = useUI()
  const [activeWf, setActiveWf] = useState(null)
  const [checks, setChecks] = useState({})

  const toggleCheck = (wfCode, stepIdx) => {
    const key = `${wfCode}_${stepIdx}`
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const navMap = {
    WF01: 'sessions',
    WF02: 'trips',
    WF03: 'transfers',
    WF04: 'expenses',
    WF05: 'exams',
    WF06: 'students',
    WF07: 'docs',
  }

  return (
    <div className="workflows-view" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Banner giới thiệu */}
      <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(3, 97, 106, 0.06), rgba(212, 113, 47, 0.06))', borderLeft: '4px solid var(--teal-700)' }}>
        <div className="row between wrap" style={{ gap: 12 }}>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <span className="badge" style={{ background: 'var(--teal-100)', color: 'var(--teal-800)', fontWeight: 600 }}>Kiến trúc nghiệp vụ</span>
              <span className="faint small">Tài liệu Đặc tả nghiệp vụ UEH–Rennes 14/11/2026</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 18, color: 'var(--teal-900)' }}>7 Quy trình trọng tâm điều hành chương trình (WF01 – WF07)</h2>
            <div className="muted small" style={{ marginTop: 4, maxWidth: 800, lineHeight: 1.5 }}>
              Mỗi quy trình chuẩn hóa điều kiện đầu vào, các điểm kiểm soát chất lượng (checkpoints), bằng chứng nghiệm thu và quy tắc kế toán – học thuật. Người dùng có thể kiểm tra tiến độ và truy cập nhanh vào phân hệ tác nghiệp tương ứng.
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="badge" style={{ background: '#fff', border: '1px solid var(--border)', padding: '6px 12px', fontSize: 13, color: 'var(--teal-800)' }}>
              <b>7/7</b> quy trình đã số hóa
            </span>
          </div>
        </div>
      </div>

      {/* Grid 7 quy trình */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16 }}>
        {WORKFLOWS_DEF.map((wf) => {
          const targetModule = navMap[wf.code]
          const isSelected = activeWf === wf.code
          const completedCount = wf.checkSteps.filter((_, idx) => checks[`${wf.code}_${idx}`]).length

          return (
            <div
              key={wf.code}
              className={cx('card', isSelected && 'selected-wf')}
              style={{
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                border: isSelected ? '1.5px solid var(--teal-600)' : '1px solid var(--border)',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Header của thẻ quy trình */}
              <div className="row between" style={{ alignItems: 'flex-start' }}>
                <div className="row" style={{ gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'var(--teal-50)',
                      color: 'var(--teal-700)',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {wf.code}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{wf.name}</h3>
                    <div className="small faint" style={{ marginTop: 2 }}>Phụ trách: {wf.owner}</div>
                  </div>
                </div>
                <span className="badge" style={{ background: 'var(--teal-100)', color: 'var(--teal-800)', fontSize: 11 }}>
                  Hạng mục {wf.categoryCode}
                </span>
              </div>

              {/* Đầu vào & Đầu ra */}
              <div style={{ background: 'var(--gray-50, #f8fafc)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>
                  <b style={{ color: 'var(--gray-600, #475569)' }}>Đầu vào: </b>
                  <span>{wf.input}</span>
                </div>
                <div>
                  <b style={{ color: 'var(--teal-800)' }}>Đầu ra nghiệm thu: </b>
                  <span style={{ color: 'var(--teal-900)' }}>{wf.output}</span>
                </div>
              </div>

              {/* Các điểm kiểm tra (Checkpoints) */}
              <div>
                <div className="row between small" style={{ marginBottom: 6 }}>
                  <b className="muted">Các bước kiểm soát ({completedCount}/{wf.checkSteps.length})</b>
                  <span className="faint">{completedCount === wf.checkSteps.length ? '✓ Đạt kiểm soát' : 'Đang thực hiện'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {wf.checkSteps.map((step, idx) => {
                    const isDone = !!checks[`${wf.code}_${idx}`]
                    return (
                      <label
                        key={idx}
                        className="row small"
                        style={{
                          gap: 8,
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: 4,
                          background: isDone ? 'rgba(30, 138, 76, 0.06)' : 'transparent',
                          color: isDone ? '#1e8a4c' : 'inherit',
                          userSelect: 'none',
                        }}
                        onClick={() => toggleCheck(wf.code, idx)}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {}}
                          style={{ accentColor: 'var(--teal-700)', cursor: 'pointer' }}
                        />
                        <span style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.85 : 1 }}>{step}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Quy tắc nghiệp vụ bắt buộc */}
              <div
                style={{
                  background: 'rgba(212, 113, 47, 0.08)',
                  borderLeft: '3px solid var(--orange-500, #d4712f)',
                  padding: '8px 10px',
                  borderRadius: 4,
                  fontSize: 11.5,
                  lineHeight: 1.45,
                  color: '#9a3412',
                }}
              >
                <b>Quy tắc kiểm soát:</b> {wf.businessRule}
              </div>

              {/* Nút hành động mở phân hệ tương ứng */}
              <div className="row between wrap" style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)', gap: 6 }}>
                <div className="row wrap" style={{ gap: 6 }}>
                  {targetModule && (
                    <button
                      className="btn sm"
                      style={{ color: 'var(--teal-800)', borderColor: 'var(--teal-200)', background: 'var(--teal-50)' }}
                      onClick={() => go(`/projects/${project.id}/work/${targetModule}`)}
                    >
                      <Icon name={wf.icon} size={14} /> Mở phân hệ {targetModule}
                    </button>
                  )}
                  {wf.code === 'WF02' && onOpenFlightWorkflow && (
                    <button
                      type="button"
                      className="btn sm accent"
                      onClick={() => onOpenFlightWorkflow()}
                      title="Quy trình điều phối đợt giảng & tra cứu vé máy bay"
                    >
                      <L.PlaneTakeoff size={14} /> Điều phối vé máy bay
                    </button>
                  )}
                </div>
                <button
                  className="btn sm"
                  onClick={() => setActiveWf(isSelected ? null : wf.code)}
                >
                  {isSelected ? 'Đóng chi tiết' : 'Chi tiết SOP'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
