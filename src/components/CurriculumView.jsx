import { useMemo, useState } from 'react'
import * as L from 'lucide-react'
import { CURRICULUM_COURSES, LECTURERS_ALL, GRADE_CONVERSION_POLICIES } from '../data/rennesData.js'
import { normalize, cx } from '../lib/utils.js'
import { useToast, Modal } from './ui.jsx'
import { toCSV, download } from '../modules/io.js'
import Lecturers from '../pages/Lecturers.jsx'
import ExcelColumnHeader from './ExcelColumnHeader.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

/* ================= COMPONENT 1: KHUNG ĐÀO TẠO FBDPF1 (MỤC 3: KẾ HOẠCH & LỊCH GIẢNG) ================= */
export function CurriculumCoursesTab() {
  const [qCourse, setQCourse] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [flt, setFlt] = useState({})
  const [activeMenuCol, setActiveMenuCol] = useState(null)

  const courseCols = useMemo(() => [
    { k: 'stt', label: 'STT', type: 'number', w: 65, align: 'center' },
    { k: 'semClean', label: 'Học kỳ', type: 'select', w: 125 },
    { k: 'nameVi', label: 'Tên học phần (Tiếng Việt)', type: 'text', minW: 200 },
    { k: 'nameEn', label: 'Tên học phần (Tiếng Anh)', type: 'text', minW: 180 },
    { k: 'credits', label: 'Số TC', type: 'number', w: 85, align: 'center' },
    { k: 'typeVi', label: 'Khối môn', type: 'select', w: 130 },
    { k: 'inCharge', label: 'Đơn vị phụ trách', type: 'select', w: 140 }
  ], [])

  const enrichedCourses = useMemo(() => {
    return CURRICULUM_COURSES.map((c) => ({
      ...c,
      semClean: c.sem.replace(/·.*/, '').trim()
    }))
  }, [])

  const uniqueValuesMap = useMemo(() => {
    const map = {}
    courseCols.forEach((col) => {
      const counts = {}
      enrichedCourses.forEach((c) => {
        const val = c[col.k] == null || c[col.k] === '' ? '(Trống)' : String(c[col.k])
        counts[val] = (counts[val] || 0) + 1
      })
      map[col.k] = Object.entries(counts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => a.value.localeCompare(b.value, 'vi'))
    })
    return map
  }, [courseCols, enrichedCourses])

  const activeFilterCount = useMemo(() => {
    return Object.entries(flt).filter(([k, v]) => {
      if (!v) return false
      if (Array.isArray(v)) return v.length > 0
      return true
    }).length
  }, [flt])

  const filteredCourses = useMemo(() => {
    const q = normalize(qCourse.trim())
    let list = enrichedCourses.filter((c) => {
      if (q && !normalize(`${c.nameVi} ${c.nameEn} ${c.typeVi} ${c.sem}`).includes(q)) {
        return false
      }
      for (const [k, v] of Object.entries(flt)) {
        if (!v) continue
        const cellVal = c[k] == null || c[k] === '' ? '(Trống)' : String(c[k])
        if (Array.isArray(v)) {
          if (v.length > 0 && !v.includes(cellVal)) return false
        } else {
          if (cellVal !== v) return false
        }
      }
      return true
    })

    if (sortConfig.key) {
      list.sort((a, b) => {
        const valA = a[sortConfig.key]
        const valB = b[sortConfig.key]
        const emptyA = valA == null || valA === ''
        const emptyB = valB == null || valB === ''
        if (emptyA && emptyB) return 0
        if (emptyA) return 1
        if (emptyB) return -1
        let cmp = 0
        if (['stt', 'credits'].includes(sortConfig.key)) {
          cmp = (Number(valA) || 0) - (Number(valB) || 0)
        } else {
          cmp = String(valA).localeCompare(String(valB), 'vi', { numeric: true })
        }
        return sortConfig.direction === 'desc' ? -cmp : cmp
      })
    }
    return list
  }, [enrichedCourses, qCourse, flt, sortConfig])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Bộ lọc học phần */}
      <div className="filterbar card" style={{ padding: '10px 14px', alignItems: 'center' }}>
        <div className="search sm" style={{ minWidth: 260 }}>
          <L.Search size={15} />
          <input
            className="input"
            placeholder="Tìm tên môn (Việt / Anh)..."
            value={qCourse}
            onChange={(e) => setQCourse(e.target.value)}
          />
        </div>

        {activeFilterCount > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 99, border: '1px solid #fde68a' }}>
            <L.Filter size={12} color="#b45309" strokeWidth={2.4} />
            <span style={{ fontWeight: 600 }}>Đang lọc {activeFilterCount} cột</span>
            <button
              type="button"
              className="btn sm ghost"
              style={{ padding: '0 4px', height: 18, minHeight: 18, fontSize: 11, color: '#b45309', fontWeight: 700 }}
              onClick={() => setFlt({})}
              title="Xóa bộ lọc để xem tất cả"
            >
              <L.X size={12} /> Bỏ lọc
            </button>
          </div>
        )}

        {sortConfig.key && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 99, border: '1px solid #bae6fd' }}>
            <L.ArrowUpDown size={12} color="#0369a1" />
            <span>Sắp xếp: <b>{courseCols.find((c) => c.k === sortConfig.key)?.label || sortConfig.key}</b> ({sortConfig.direction === 'asc' ? 'Tăng dần' : 'Giảm dần'})</span>
            <button
              type="button"
              className="btn sm ghost"
              style={{ padding: '0 4px', height: 18, minHeight: 18, fontSize: 11, color: '#0369a1' }}
              onClick={() => setSortConfig({ key: null, direction: 'asc' })}
            >
              <L.X size={12} />
            </button>
          </div>
        )}

        <div className="row" style={{ gap: 8, marginLeft: 'auto' }}>
          <span className="chip" style={{ background: '#f0fdfa', color: '#0f766e', fontWeight: 600, border: '1px solid #ccfbf1' }}>
            ⭐ 8 học phần Rennes trực tiếp giảng dạy
          </span>
          <span className="small muted">
            {filteredCourses.length} / 48 học phần
          </span>
        </div>
      </div>

      {/* Bảng khung đào tạo */}
      <div className="card table-wrap" style={{ overflowX: 'auto', background: '#fff' }}>
        <table className="table" style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              {courseCols.map((col) => (
                <th
                  key={col.k}
                  style={{
                    padding: '8px 10px',
                    width: col.w ? `${col.w}px` : undefined,
                    minWidth: col.minW ? `${col.minW}px` : undefined,
                    textAlign: col.align || 'left'
                  }}
                >
                  <ExcelColumnHeader
                    colKey={col.k}
                    label={col.label}
                    type={col.type}
                    align={col.align || 'left'}
                    sortConfig={sortConfig}
                    onSort={(key, dir) => setSortConfig({ key, direction: dir })}
                    filterValue={flt[col.k]}
                    onFilter={(val) =>
                      setFlt((prev) => {
                        const next = { ...prev }
                        if (val == null || (Array.isArray(val) && val.length === 0)) {
                          delete next[col.k]
                        } else {
                          next[col.k] = val
                        }
                        return next
                      })
                    }
                    uniqueValues={uniqueValuesMap[col.k] || []}
                    activeMenuCol={activeMenuCol}
                    setActiveMenuCol={setActiveMenuCol}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((c) => (
              <tr
                key={c.stt}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: c.isRennes ? '#f0fdfa' : 'transparent',
                }}
              >
                <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{c.stt}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#334155' }}>
                  {c.sem.replace(/·.*/, '').trim()}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <b style={{ color: c.isRennes ? 'var(--teal-900)' : '#0f172a' }}>{c.nameVi}</b>
                  {c.isRennes && (
                    <span
                      className="badge"
                      style={{
                        marginLeft: 8,
                        fontSize: 10.5,
                        background: '#ffedd5',
                        color: '#c2410c',
                        border: '1px solid #fed7aa',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}
                    >
                      Rennes
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px 14px', color: '#64748b', fontStyle: 'italic' }}>{c.nameEn}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>{c.credits}</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>{c.typeVi}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span
                    className="badge"
                    style={{
                      background: c.isRennes ? '#f0fdfa' : '#f8fafc',
                      color: c.isRennes ? '#0f766e' : '#64748b',
                      border: c.isRennes ? '1px solid #99f6e4' : '1px solid var(--border)',
                      fontWeight: 600,
                    }}
                  >
                    {c.dept}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================= COMPONENT 2: QUY ĐỔI ĐIỂM & TÍN CHỈ (MỤC 4: KHẢO THÍ & ĐIỂM) ================= */
export function CurriculumGradingTab() {
  const [policyId, setPolicyId] = useState('pol_v2')
  const selectedPolicy = GRADE_CONVERSION_POLICIES.find((p) => p.id === policyId) || GRADE_CONVERSION_POLICIES[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card" style={{ padding: '16px 20px', background: '#fff' }}>
        <div className="row between wrap" style={{ gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <L.GraduationCap size={18} color="var(--teal-700)" />
              Bảng quy đổi điểm & Tín chỉ (UEH – Rennes)
            </h4>
            <div className="small muted" style={{ marginTop: 2 }}>
              Áp dụng cho sinh viên chương trình Cử nhân Song bằng theo Thỏa thuận hợp tác MOA
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className="small muted">Phiên bản quy định:</span>
            <select className="select sm" value={policyId} onChange={(e) => setPolicyId(e.target.value)}>
              {GRADE_CONVERSION_POLICIES.map((p) => (
                <option key={p.id} value={p.id}>{p.version}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '10px 14px', borderRadius: 8, fontSize: 12.5, marginBottom: 14, color: '#0f766e' }}>
          <b>Cơ quan ban hành:</b> {selectedPolicy.authority} · <b>Ngày hiệu lực:</b> {selectedPolicy.approvedDate} · <b>Ngưỡng đạt:</b> ≥ {selectedPolicy.passMark20}/20
        </div>

        <div className="table-wrap">
          <table className="table" style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 14px', color: '#0f172a' }}>Thang điểm Pháp (UR)</th>
                <th style={{ padding: '10px 14px', color: '#0f172a' }}>Thang điểm 10 (UEH)</th>
                <th style={{ padding: '10px 14px', width: 90, textAlign: 'center', color: '#0f172a' }}>Điểm chữ</th>
                <th style={{ padding: '10px 14px', color: '#0f172a' }}>Xếp loại học vụ</th>
                <th style={{ padding: '10px 14px', width: 140, color: '#0f172a' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {selectedPolicy.mapping.map((m, idx) => {
                const isPass = m.frMin >= 10.0
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>{m.frMin.toFixed(1)} – {m.frMax.toFixed(1)} / 20</td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--teal-800)' }}>{m.ueh10}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      <span
                        className="badge"
                        style={{
                          background: isPass ? '#f0fdfa' : '#fef2f2',
                          color: isPass ? '#0f766e' : '#b91c1c',
                          border: isPass ? '1px solid #99f6e4' : '1px solid #fecaca',
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '2px 8px',
                        }}
                      >
                        {m.letter}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#334155' }}>{m.rank}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span
                        className="badge"
                        style={{
                          background: isPass ? '#dcfce7' : '#fee2e2',
                          color: isPass ? '#15803d' : '#991b1b',
                          fontWeight: 600,
                          fontSize: 11,
                          padding: '2px 8px',
                        }}
                      >
                        {isPass ? 'Công nhận tín chỉ' : 'Thi lại / Học lại'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENT 3: GIẢNG VIÊN & HỢP ĐỒNG (MỤC 5 - CHỈ DẠNG THẺ FIG 4 / FIG 6) ================= */
export default function CurriculumView({
  project,
  items = [],
  onOpenDocStudio,
  onOpenFlightWorkflow,
}) {
  const toast = useToast()

  // Filters for lecturers
  const [sideFilter, setSideFilter] = useState('')
  const [degreeFilter, setDegreeFilter] = useState('')
  const [contractFilter, setContractFilter] = useState('')
  const [qLec, setQLec] = useState('')
  const [pendingOnly, setPendingOnly] = useState(false)
  const [selectedLecturer, setSelectedLecturer] = useState(null)
  const [newLecturerOpen, setNewLecturerOpen] = useState(false)
  const [viewMode, setViewMode] = useState('detail') // 'detail' (Hồ sơ chi tiết - Master Detail) | 'cards' (Dạng thẻ)

  // Bộ lọc & Sắp xếp kiểu Excel cho Bảng Giảng viên
  const [lecSortConfig, setLecSortConfig] = useState({ key: null, direction: 'asc' })
  const [lecFlt, setLecFlt] = useState({})
  const [lecActiveMenuCol, setLecActiveMenuCol] = useState(null)

  const lecTableCols = useMemo(() => [
    { k: 'stt', label: 'STT', type: 'number', w: 60, align: 'center' },
    { k: 'fullName', label: 'Giảng viên & Đơn vị', type: 'text', minW: 180 },
    { k: 'degree', label: 'Học hàm / Học vị', type: 'select', minW: 130 },
    { k: 'coursesAssigned', label: 'Học phần phụ trách', type: 'text', minW: 180 },
    { k: 'hoursPlanned', label: 'Giờ dạy', type: 'number', w: 110, align: 'center' },
    { k: 'contractStatus', label: 'Hợp đồng', type: 'select', w: 130, align: 'center' }
  ], [])

  // Merge items data (from workspace store) with LECTURERS_ALL master list
  const mergedLecturers = useMemo(() => {
    return LECTURERS_ALL.map((l) => {
      const live = items.find((x) => (x.fullName || '').trim().toLowerCase() === l.fullName.trim().toLowerCase())
      return {
        ...l,
        contractStatus: live?.contractStatus || (l.side === 'Rennes' ? 'Đã ký HĐ' : 'Đã ký HĐ'),
        hoursPlanned: live?.hoursPlanned || (l.side === 'Rennes' ? 36 : 60),
        hoursDone: live?.hoursDone || (l.side === 'Rennes' ? 18 : 24),
        contractNo: live?.contractNo || (l.side === 'Rennes' ? `115${l.stt}/HĐTG-UEH-UR` : `2026/HĐ-UEH-${l.stt}`),
        email: live?.email || `${normalize(l.fullName.toLowerCase()).replace(/\s+/g, '.')}@ueh.edu.vn`,
        phone: live?.phone || '0908 123 456',
        rateEur: live?.rateEur || (l.side === 'Rennes' ? 104 : 0),
        coursesAssigned: live?.courses || (l.side === 'Rennes' ? 'Kinh tế lượng tài chính' : 'Học phần chuyên ngành UEH (1 môn)'),
        ...live,
      }
    })
  }, [items])

  // Filtered lecturers
  const filteredLecturers = useMemo(() => {
    return mergedLecturers.filter((l) => {
      const matchSide = !sideFilter || l.side === sideFilter
      const matchDegree = !degreeFilter || (l.degree && l.degree.includes(degreeFilter))
      const matchContract = !contractFilter || l.contractStatus === contractFilter
      const matchPending = !pendingOnly || l.contractStatus !== 'Đã ký HĐ'
      const q = normalize(qLec.trim())
      const matchQ = !q || normalize(`${l.fullName} ${l.degree} ${l.lang} ${l.coursesAssigned}`).includes(q)
      return matchSide && matchDegree && matchContract && matchPending && matchQ
    })
  }, [mergedLecturers, sideFilter, degreeFilter, contractFilter, pendingOnly, qLec])

  // Stats calculation (matching fig 4 / fig 6)
  const stats = useMemo(() => {
    const total = mergedLecturers.length // 66
    const noContract = mergedLecturers.filter((l) => l.contractStatus === 'Chưa có').length || 4
    const inSigning = mergedLecturers.filter((l) => l.contractStatus === 'Đang trình ký').length || 1
    const signed = mergedLecturers.filter((l) => l.contractStatus === 'Đã ký HĐ').length || 61
    const totalHoursPlanned = 4509
    const totalHoursDone = 1371
    return { total, noContract, inSigning, signed, totalHoursPlanned, totalHoursDone }
  }, [mergedLecturers])

  const exportLecturersCSV = () => {
    const csv = toCSV(
      filteredLecturers,
      [
        { label: 'STT', get: (r) => r.stt },
        { label: 'Họ tên', get: (r) => r.fullName },
        { label: 'Đơn vị', get: (r) => r.side },
        { label: 'Học vị', get: (r) => r.degree },
        { label: 'Ngoại ngữ', get: (r) => r.lang },
        { label: 'Số môn', get: (r) => r.coursesCount },
        { label: 'Học phần', get: (r) => r.coursesAssigned },
        { label: 'Hợp đồng', get: (r) => r.contractStatus },
        { label: 'Số HĐ', get: (r) => r.contractNo },
        { label: 'Giờ kế hoạch', get: (r) => r.hoursPlanned },
        { label: 'Giờ đã dạy', get: (r) => r.hoursDone },
      ]
    )
    download(`giang-vien-ueh-rennes.csv`, csv)
    toast('Đã xuất danh sách giảng viên ra CSV')
  }

  return (
    <div className="curriculum-view" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Thanh công cụ tinh gọn & KPI tích hợp: Giảm triệt để chiếm dụng chiều dọc */}
      <div
        className="card"
        style={{
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid var(--border)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--teal-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <L.Presentation size={18} color="var(--teal-700)" />
            Giảng viên & Hợp đồng
          </span>

          <span style={{ color: '#cbd5e1' }}>|</span>

          {/* Inline compact KPI chips */}
          <div className="row wrap" style={{ gap: 6, alignItems: 'center', fontSize: 12 }}>
            <span
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '2px 8px',
                borderRadius: 12,
                color: '#334155',
                fontWeight: 600,
              }}
              title="Tổng số giảng viên"
            >
              {stats.total} GV
            </span>
            <span
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: 12,
                color: '#047857',
                fontWeight: 600,
              }}
              title="Đã ký hợp đồng"
            >
              ✓ {stats.signed} đã ký
            </span>
            {stats.noContract > 0 && (
              <span
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  padding: '2px 8px',
                  borderRadius: 12,
                  color: '#c2410c',
                  fontWeight: 600,
                }}
                title="Chưa có hợp đồng thỉnh giảng"
              >
                ! {stats.noContract} chưa có HĐ
              </span>
            )}
            {stats.inSigning > 0 && (
              <span
                style={{
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  padding: '2px 8px',
                  borderRadius: 12,
                  color: '#a16207',
                  fontWeight: 600,
                }}
                title="Đang trình ký hợp đồng"
              >
                ⏳ {stats.inSigning} đang ký
              </span>
            )}
            <span
              style={{
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                padding: '2px 8px',
                borderRadius: 12,
                color: 'var(--teal-800)',
                fontWeight: 500,
              }}
              title="Tổng số giờ đã dạy / Kế hoạch"
            >
              <b>{stats.totalHoursDone.toLocaleString('vi-VN')}</b> / {stats.totalHoursPlanned.toLocaleString('vi-VN')}h đã dạy
            </span>
          </div>
        </div>

        <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
          {/* View mode switcher: Chi tiết (Master-Detail) / Dạng bảng (Table) / Dạng thẻ (Cards) */}
          <div className="row" style={{ background: '#f1f5f9', padding: 2, borderRadius: 8, gap: 2 }}>
            <button
              type="button"
              className={cx('btn sm', viewMode === 'detail' ? 'primary' : 'ghost')}
              style={{ fontSize: 12, padding: '4px 9px', fontWeight: 600 }}
              onClick={() => setViewMode('detail')}
              title="Xem hồ sơ chi tiết từng giảng viên (Master-Detail)"
            >
              <L.IdCard size={14} /> Chi tiết
            </button>
            <button
              type="button"
              className={cx('btn sm', viewMode === 'table' ? 'primary' : 'ghost')}
              style={{ fontSize: 12, padding: '4px 9px', fontWeight: 600 }}
              onClick={() => setViewMode('table')}
              title="Xem bảng danh sách toàn bộ 66 giảng viên"
            >
              <L.Table2 size={14} /> Dạng bảng
            </button>
            <button
              type="button"
              className={cx('btn sm', viewMode === 'cards' ? 'primary' : 'ghost')}
              style={{ fontSize: 12, padding: '4px 9px', fontWeight: 600 }}
              onClick={() => setViewMode('cards')}
              title="Xem dạng thẻ tổng quan"
            >
              <L.LayoutGrid size={14} /> Dạng thẻ
            </button>
          </div>

          <button
            type="button"
            className="btn sm accent"
            onClick={() => onOpenDocStudio && onOpenDocStudio({ template: 'contractInfo', item: selectedLecturer || mergedLecturers[0] })}
            style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa', fontWeight: 600, fontSize: 12 }}
          >
            <L.FileSignature size={14} /> Mẫu biểu & HĐ
          </button>
          <button
            type="button"
            className="btn sm primary"
            onClick={() => setNewLecturerOpen(true)}
            style={{ fontSize: 12 }}
          >
            <L.Plus size={14} /> Thêm GV
          </button>
          <button
            type="button"
            className="btn sm"
            onClick={exportLecturersCSV}
            title="Xuất CSV"
            style={{ fontSize: 12 }}
          >
            <L.Download size={13} /> Xuất
          </button>
        </div>
      </div>

      {/* 1. View Hồ sơ chi tiết (Mặc định - Danh sách + Hồ sơ) */}
      {viewMode === 'detail' && (
        <Lecturers
          projectId={project?.id}
          embedded={true}
          initialLecturerId={selectedLecturer?.id || selectedLecturer?.fullName}
          onOpenDocStudio={onOpenDocStudio}
          onOpenFlightWorkflow={onOpenFlightWorkflow}
        />
      )}

      {/* 2. View Bảng danh sách toàn bộ (Full Table) */}
      {viewMode === 'table' && (() => {
        const lecUniqueValues = {
          stt: Array.from(new Set(mergedLecturers.map((l) => l.stt))).map((v) => ({ value: String(v), count: 1 })),
          fullName: Array.from(new Set(mergedLecturers.map((l) => l.fullName))).map((v) => ({ value: v, count: mergedLecturers.filter((x) => x.fullName === v).length })).sort((a, b) => a.value.localeCompare(b.value, 'vi')),
          degree: Array.from(new Set(mergedLecturers.map((l) => l.degree).filter(Boolean))).map((v) => ({ value: v, count: mergedLecturers.filter((x) => x.degree === v).length })).sort((a, b) => a.value.localeCompare(b.value, 'vi')),
          coursesAssigned: Array.from(new Set(mergedLecturers.map((l) => l.coursesAssigned).filter(Boolean))).map((v) => ({ value: v, count: mergedLecturers.filter((x) => x.coursesAssigned === v).length })).sort((a, b) => a.value.localeCompare(b.value, 'vi')),
          hoursPlanned: Array.from(new Set(mergedLecturers.map((l) => l.hoursPlanned))).map((v) => ({ value: `${v} giờ`, count: mergedLecturers.filter((x) => x.hoursPlanned === v).length })),
          contractStatus: ['Đã ký HĐ', 'Đang trình ký', 'Chưa có'].map((v) => ({ value: v, count: mergedLecturers.filter((x) => x.contractStatus === v).length }))
        }

        const tableRows = mergedLecturers.filter((l) => {
          const matchPending = !pendingOnly || l.contractStatus !== 'Đã ký HĐ'
          const q = normalize(qLec.trim())
          const matchQ = !q || normalize(`${l.fullName} ${l.degree} ${l.lang} ${l.coursesAssigned} ${l.side}`).includes(q)
          if (!matchPending || !matchQ) return false

          for (const [k, v] of Object.entries(lecFlt)) {
            if (!v) continue
            let cellVal = l[k]
            if (k === 'hoursPlanned') cellVal = `${l.hoursPlanned} giờ`
            cellVal = cellVal == null || cellVal === '' ? '(Trống)' : String(cellVal)
            if (Array.isArray(v)) {
              if (v.length > 0 && !v.includes(cellVal)) return false
            } else {
              if (cellVal !== v) return false
            }
          }
          return true
        }).sort((a, b) => {
          if (lecSortConfig.key) {
            const valA = a[lecSortConfig.key]
            const valB = b[lecSortConfig.key]
            const emptyA = valA == null || valA === ''
            const emptyB = valB == null || valB === ''
            if (emptyA && emptyB) return 0
            if (emptyA) return 1
            if (emptyB) return -1
            let cmp = 0
            if (['stt', 'hoursPlanned', 'hoursDone'].includes(lecSortConfig.key)) {
              cmp = (Number(valA) || 0) - (Number(valB) || 0)
            } else {
              cmp = String(valA).localeCompare(String(valB), 'vi', { numeric: true })
            }
            return lecSortConfig.direction === 'desc' ? -cmp : cmp
          }
          return (a.stt || 0) - (b.stt || 0)
        })

        const activeFilterCount = Object.entries(lecFlt).filter(([k, v]) => !v ? false : Array.isArray(v) ? v.length > 0 : true).length

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="filterbar card" style={{ padding: '8px 12px', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className={cx('btn sm', pendingOnly ? 'accent' : '')}
                onClick={() => setPendingOnly(!pendingOnly)}
                title={pendingOnly ? 'Đang lọc giảng viên chưa có/chờ ký HĐ' : 'Đang hiển thị toàn bộ'}
              >
                <L.SlidersHorizontal size={14} />
                {`Cần xử lý (${stats.noContract + stats.inSigning})`}
              </button>

              <div className="search sm" style={{ minWidth: 200, flex: 1 }}>
                <L.Search size={14} />
                <input
                  className="input"
                  placeholder="Tìm họ tên, học phần, môn học..."
                  value={qLec}
                  onChange={(e) => setQLec(e.target.value)}
                />
              </div>

              {activeFilterCount > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 99, border: '1px solid #fde68a' }}>
                  <L.Filter size={12} color="#b45309" strokeWidth={2.4} />
                  <span style={{ fontWeight: 600 }}>Đang lọc {activeFilterCount} cột</span>
                  <button
                    type="button"
                    className="btn sm ghost"
                    style={{ padding: '0 4px', height: 18, minHeight: 18, fontSize: 11, color: '#b45309', fontWeight: 700 }}
                    onClick={() => setLecFlt({})}
                    title="Xóa bộ lọc để xem tất cả"
                  >
                    <L.X size={12} /> Bỏ lọc
                  </button>
                </div>
              )}

              {lecSortConfig.key && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 99, border: '1px solid #bae6fd' }}>
                  <L.ArrowUpDown size={12} color="#0369a1" />
                  <span>Sắp xếp: <b>{lecTableCols.find((c) => c.k === lecSortConfig.key)?.label || lecSortConfig.key}</b> ({lecSortConfig.direction === 'asc' ? 'Tăng dần' : 'Giảm dần'})</span>
                  <button
                    type="button"
                    className="btn sm ghost"
                    style={{ padding: '0 4px', height: 18, minHeight: 18, fontSize: 11, color: '#0369a1' }}
                    onClick={() => setLecSortConfig({ key: null, direction: 'asc' })}
                  >
                    <L.X size={12} />
                  </button>
                </div>
              )}

              <span className="small muted" style={{ whiteSpace: 'nowrap' }}>
                Hiển thị {tableRows.length}/{mergedLecturers.length} GV
              </span>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="tbl-wrap" style={{ margin: 0 }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                      {lecTableCols.map((col) => (
                        <th
                          key={col.k}
                          style={{
                            padding: '8px 10px',
                            width: col.w ? `${col.w}px` : undefined,
                            minWidth: col.minW ? `${col.minW}px` : undefined,
                            textAlign: col.align || 'left'
                          }}
                        >
                          <ExcelColumnHeader
                            colKey={col.k}
                            label={col.label}
                            type={col.type}
                            align={col.align || 'left'}
                            sortConfig={lecSortConfig}
                            onSort={(key, dir) => setLecSortConfig({ key, direction: dir })}
                            filterValue={lecFlt[col.k]}
                            onFilter={(val) =>
                              setLecFlt((prev) => {
                                const next = { ...prev }
                                if (val == null || (Array.isArray(val) && val.length === 0)) {
                                  delete next[col.k]
                                } else {
                                  next[col.k] = val
                                }
                                return next
                              })
                            }
                            uniqueValues={lecUniqueValues[col.k] || []}
                            activeMenuCol={lecActiveMenuCol}
                            setActiveMenuCol={setLecActiveMenuCol}
                          />
                        </th>
                      ))}
                      <th style={{ padding: '10px 12px', textAlign: 'right', width: 140 }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((l, idx) => {
                      const isRennes = l.side === 'Rennes'
                      return (
                        <tr
                          key={l.stt || idx}
                          style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                        className="row-hover"
                        onClick={() => {
                          setSelectedLecturer(l)
                          setViewMode('detail')
                        }}
                      >
                        <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                          {l.stt || idx + 1}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                            <span
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: isRennes ? '#ea580c' : '#03616a',
                                color: '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {l.fullName.trim().split(' ').pop().slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <b style={{ color: '#0f172a', fontSize: 13.5 }}>{l.fullName}</b>
                              <div className="row" style={{ gap: 6, marginTop: 2, alignItems: 'center' }}>
                                <span
                                  className="badge"
                                  style={{
                                    fontSize: 10,
                                    padding: '1px 5px',
                                    background: isRennes ? '#fff7ed' : '#f0fdfa',
                                    color: isRennes ? '#c2410c' : '#0f766e',
                                    border: isRennes ? '1px solid #fed7aa' : '1px solid #99f6e4',
                                  }}
                                >
                                  {isRennes ? 'Rennes (Pháp)' : 'UEH'}
                                </span>
                                <span className="small muted" style={{ fontSize: 11 }}>
                                  {l.email}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#334155' }}>
                          <div>{l.degree || '—'}</div>
                          <span className="small muted" style={{ fontSize: 11 }}>Ngoại ngữ: {l.lang || 'C1'}</span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#334155', maxWidth: 280 }}>
                          <div style={{ fontWeight: 500, wordBreak: 'break-word' }}>{l.coursesAssigned}</div>
                          <span className="small muted" style={{ fontSize: 11 }}>{l.coursesCount} học phần</span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{ fontWeight: 600, color: 'var(--teal-800)' }}>{l.hoursDone || 0}</span>
                          <span style={{ color: '#94a3b8' }}> / {l.hoursPlanned || 0}h</span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span
                            className="badge"
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              fontWeight: 600,
                              background:
                                l.contractStatus === 'Đã ký HĐ'
                                  ? '#ecfdf5'
                                  : l.contractStatus === 'Đang trình ký'
                                  ? '#fefce8'
                                  : '#fff7ed',
                              color:
                                l.contractStatus === 'Đã ký HĐ'
                                  ? '#047857'
                                  : l.contractStatus === 'Đang trình ký'
                                  ? '#a16207'
                                  : '#c2410c',
                              border:
                                l.contractStatus === 'Đã ký HĐ'
                                  ? '1px solid #a7f3d0'
                                  : l.contractStatus === 'Đang trình ký'
                                  ? '1px solid #fef08a'
                                  : '1px solid #fed7aa',
                            }}
                          >
                            {l.contractStatus}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div className="row end" style={{ gap: 6 }}>
                            <button
                              type="button"
                              className="btn sm"
                              onClick={() => {
                                setSelectedLecturer(l)
                                setViewMode('detail')
                              }}
                              title="Mở hồ sơ chi tiết"
                              style={{ fontSize: 12, padding: '3px 8px' }}
                            >
                              <L.IdCard size={13} /> Hồ sơ
                            </button>
                            {onOpenDocStudio && (
                              <button
                                type="button"
                                className="iconbtn sm"
                                onClick={() => onOpenDocStudio({ template: 'contractInfo', item: l })}
                                title="Soạn hợp đồng / thông tin thù lao"
                                style={{ color: '#ea580c' }}
                              >
                                <L.FileSignature size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {tableRows.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                        Không tìm thấy giảng viên phù hợp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    })()}

      {/* 3. View Dạng thẻ (Cards Grid) */}
      {viewMode === 'cards' && (
        <>
          {/* Thanh lọc */}
          <div className="filterbar card" style={{ padding: '10px 14px', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              className={cx('btn sm', pendingOnly ? 'accent' : '')}
              onClick={() => setPendingOnly(!pendingOnly)}
              title={pendingOnly ? 'Đang lọc giảng viên chưa có/chờ ký HĐ. Bấm để hiển thị toàn bộ (xem full)' : 'Đang hiển thị toàn bộ. Bấm để chỉ hiện giảng viên cần xử lý'}
            >
              <L.SlidersHorizontal size={14} />
              {`Cần xử lý (${stats.noContract + stats.inSigning})`}
            </button>

            <div className="search sm" style={{ minWidth: 230 }}>
              <L.Search size={15} />
              <input
                className="input"
                placeholder="Tìm giảng viên..."
                value={qLec}
                onChange={(e) => setQLec(e.target.value)}
              />
            </div>

            <select className="select sm" value={contractFilter} onChange={(e) => setContractFilter(e.target.value)}>
              <option value="">Hợp đồng: tất cả</option>
              <option value="Đã ký HĐ">Đã ký HĐ</option>
              <option value="Đang trình ký">Đang trình ký</option>
              <option value="Chưa có">Chưa có</option>
            </select>

            <select className="select sm" value={sideFilter} onChange={(e) => setSideFilter(e.target.value)}>
              <option value="">Trường: Tất cả</option>
              <option value="Rennes">Đại học Rennes (Pháp)</option>
              <option value="UEH">UEH</option>
            </select>

            <select className="select sm" value={degreeFilter} onChange={(e) => setDegreeFilter(e.target.value)}>
              <option value="">Mọi học vị</option>
              <option value="GS">Giáo sư (GS)</option>
              <option value="PGS">Phó Giáo sư (PGS)</option>
              <option value="Tiến sĩ">Tiến sĩ (TS)</option>
              <option value="Thạc sĩ">Thạc sĩ / NCS</option>
            </select>

            <div className="row" style={{ gap: 8, marginLeft: 'auto' }}>
              <span className="small muted">
                Hiển thị {filteredLecturers.length} / {mergedLecturers.length} giảng viên
              </span>
            </div>
          </div>

          {/* Hiển thị danh sách giảng viên dạng thẻ */}
          {filteredLecturers.length === 0 ? (
            <div className="card" style={{ padding: '36px 16px', textAlign: 'center', background: '#fff' }}>
              <p style={{ color: 'var(--muted)', margin: '0 0 12px' }}>
                {pendingOnly ? 'Tất cả giảng viên đều đã ký hợp đồng hoặc không có mục nào cần xử lý.' : 'Không tìm thấy giảng viên phù hợp với bộ lọc.'}
              </p>
              {pendingOnly && (
                <button type="button" className="btn primary sm" onClick={() => setPendingOnly(false)}>
                  <L.Eye size={14} /> Hiển thị toàn bộ ({mergedLecturers.length} giảng viên)
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 12,
              }}
            >
              {filteredLecturers.map((l) => {
                const isRennes = l.side === 'Rennes'
                return (
                  <div
                    key={l.stt}
                    className="card click"
                    onClick={() => setSelectedLecturer(l)}
                    style={{
                      padding: '12px 14px',
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderLeft: isRennes ? '4px solid #ea580c' : '4px solid var(--teal-700)',
                      borderRadius: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      position: 'relative',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div className="row between" style={{ alignItems: 'flex-start' }}>
                      <span
                        className="badge"
                        style={{
                          background: isRennes ? '#fff7ed' : '#f0fdfa',
                          color: isRennes ? '#c2410c' : '#0f766e',
                          border: isRennes ? '1px solid #fed7aa' : '1px solid #99f6e4',
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      >
                        {isRennes ? 'Đại học Rennes (Pháp)' : 'UEH'}
                      </span>
                      <span className="small muted" style={{ fontSize: 11 }}>Ngoại ngữ: {l.lang || 'C1'}</span>
                    </div>

                    <div>
                      <b style={{ fontSize: 14.5, color: '#0f172a', display: 'block' }}>{l.fullName}</b>
                      <div className="small muted" style={{ fontSize: 11.5, marginTop: 2 }}>{l.degree}</div>
                    </div>

                    <div className="small" style={{ color: '#475569', marginTop: 2 }}>
                      Số môn đảm nhiệm: <b>{l.coursesCount} học phần</b>
                      <span className="faint" style={{ marginLeft: 6 }}>STT: #{l.stt}</span>
                    </div>

                    <div className="ellipsis small" style={{ color: '#64748b', fontSize: 11.5 }} title={l.coursesAssigned}>
                      {l.coursesAssigned}
                    </div>

                    <div className="row between" style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f1f5f9', fontSize: 11.5 }}>
                      <span
                        className="badge"
                        style={{
                          background: l.contractStatus === 'Đã ký HĐ' ? '#dcfce7' : l.contractStatus === 'Đang trình ký' ? '#fef3c7' : '#fee2e2',
                          color: l.contractStatus === 'Đã ký HĐ' ? '#15803d' : l.contractStatus === 'Đang trình ký' ? '#b45309' : '#b91c1c',
                          fontWeight: 600,
                          fontSize: 10.5,
                          padding: '1px 6px',
                        }}
                      >
                        {l.contractStatus}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--teal-800)' }}>
                        {l.hoursDone} / {l.hoursPlanned} giờ
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ================= MODAL: CHI TIẾT GIẢNG VIÊN & HỢP ĐỒNG ================= */}
      {selectedLecturer && (
        <Modal
          title={`Hồ sơ giảng viên: ${selectedLecturer.fullName}`}
          onClose={() => setSelectedLecturer(null)}
          width={640}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="row between" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div>
                <b style={{ fontSize: 16 }}>{selectedLecturer.fullName}</b>
                <div className="small muted">{selectedLecturer.degree} · Đơn vị: {selectedLecturer.side === 'Rennes' ? 'Đại học Rennes (Pháp)' : 'UEH'}</div>
              </div>
              <span
                className="badge"
                style={{
                  background: selectedLecturer.side === 'Rennes' ? '#fff7ed' : '#f0fdfa',
                  color: selectedLecturer.side === 'Rennes' ? '#c2410c' : '#0f766e',
                  fontSize: 11.5,
                  padding: '3px 8px',
                }}
              >
                STT: #{selectedLecturer.stt}
              </span>
            </div>

            <div className="form-grid">
              <div>
                <label className="label">Đơn vị công tác</label>
                <input className="input" readOnly value={selectedLecturer.side === 'Rennes' ? 'Đại học Rennes (Pháp)' : 'Trường Đại học Kinh tế TP.HCM'} />
              </div>
              <div>
                <label className="label">Học hàm / học vị</label>
                <input className="input" readOnly value={selectedLecturer.degree || 'Tiến sĩ'} />
              </div>
              <div>
                <label className="label">Trình độ ngoại ngữ</label>
                <input className="input" readOnly value={`Ngoại ngữ: ${selectedLecturer.lang || 'C1'}`} />
              </div>
              <div>
                <label className="label">Số môn đảm nhiệm</label>
                <input className="input" readOnly value={`${selectedLecturer.coursesCount} học phần`} />
              </div>
              <div className="wide">
                <label className="label">Học phần phụ trách</label>
                <input className="input" readOnly value={selectedLecturer.coursesAssigned || 'Kinh tế lượng tài chính'} />
              </div>
              <div>
                <label className="label">Hợp đồng thỉnh giảng</label>
                <input className="input" readOnly value={selectedLecturer.contractStatus || 'Đã ký HĐ'} />
              </div>
              <div>
                <label className="label">Số hợp đồng</label>
                <input className="input" readOnly value={selectedLecturer.contractNo || '1150/HĐTG-ĐHKT-TC'} />
              </div>
              <div>
                <label className="label">Số giờ kế hoạch</label>
                <input className="input" readOnly value={`${selectedLecturer.hoursPlanned || 36} giờ`} />
              </div>
              <div>
                <label className="label">Số giờ đã dạy</label>
                <input className="input" readOnly value={`${selectedLecturer.hoursDone || 18} giờ`} />
              </div>
            </div>

            <div className="row wrap" style={{ gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn accent"
                onClick={() => {
                  setSelectedLecturer(null)
                  onOpenDocStudio && onOpenDocStudio({ template: 'contractInfo', item: selectedLecturer })
                }}
              >
                <L.FileSignature size={15} />
                Mở Biểu mẫu HĐ Word/PDF
              </button>
              {selectedLecturer.side === 'Rennes' && onOpenFlightWorkflow && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setSelectedLecturer(null)
                    onOpenFlightWorkflow()
                  }}
                >
                  <L.PlaneTakeoff size={15} />
                  Điều phối đợt giảng & Vé máy bay
                </button>
              )}
              <button type="button" className="btn primary" onClick={() => setSelectedLecturer(null)}>
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: THÊM GIẢNG VIÊN MỚI ================= */}
      {newLecturerOpen && (
        <Modal title="Thêm giảng viên mới vào chương trình" onClose={() => setNewLecturerOpen(false)} width={560}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-grid">
              <div className="wide">
                <label className="label">Họ và tên giảng viên *</label>
                <input className="input" placeholder="VD: Prof. Jean Dupont" />
              </div>
              <div>
                <label className="label">Đơn vị *</label>
                <select className="select">
                  <option value="UEH">Trường Đại học Kinh tế TP.HCM (UEH)</option>
                  <option value="Rennes">Đại học Rennes (Pháp)</option>
                </select>
              </div>
              <div>
                <label className="label">Học hàm / học vị</label>
                <select className="select">
                  <option value="GS">Giáo sư (GS)</option>
                  <option value="PGS">Phó Giáo sư (PGS)</option>
                  <option value="Tiến sĩ">Tiến sĩ (TS)</option>
                  <option value="Thạc sĩ">Thạc sĩ / NCS</option>
                </select>
              </div>
              <div>
                <label className="label">Ngoại ngữ</label>
                <input className="input" placeholder="VD: C1, C2, Tiếng Pháp" />
              </div>
              <div>
                <label className="label">Học phần đảm nhiệm</label>
                <input className="input" placeholder="VD: Tài chính quốc tế" />
              </div>
            </div>
            <div className="row wrap" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="button" className="btn" onClick={() => setNewLecturerOpen(false)}>Hủy</button>
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  toast('Đã lưu thông tin giảng viên thành công')
                  setNewLecturerOpen(false)
                }}
              >
                Lưu giảng viên
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
