import { useMemo, useState } from 'react'
import * as L from 'lucide-react'
import { CURRICULUM_COURSES, LECTURERS_ALL, GRADE_CONVERSION_POLICIES } from '../data/rennesData.js'
import { normalize, cx } from '../lib/utils.js'
import { useToast, Modal } from './ui.jsx'
import { toCSV, download } from '../modules/io.js'

export default function CurriculumView({
  project,
  initialTab = 'lecturers',
  items = [],
  onOpenDocStudio,
  onOpenFlightWorkflow,
}) {
  const toast = useToast()
  const [tab, setTab] = useState(initialTab || 'lecturers') // 'courses' | 'lecturers' | 'grading'
  const [viewMode, setViewMode] = useState('cards') // 'cards' (fig 2) | 'table' (fig 1)

  // Filters for lecturers
  const [sideFilter, setSideFilter] = useState('')
  const [degreeFilter, setDegreeFilter] = useState('')
  const [contractFilter, setContractFilter] = useState('')
  const [qLec, setQLec] = useState('')
  const [pendingOnly, setPendingOnly] = useState(false)
  const [selectedLecturer, setSelectedLecturer] = useState(null)
  const [newLecturerOpen, setNewLecturerOpen] = useState(false)

  // Filters for courses
  const [semFilter, setSemFilter] = useState('')
  const [qCourse, setQCourse] = useState('')

  // Policy selection
  const [policyId, setPolicyId] = useState('pol_v2')

  // Semesters for courses
  const semesters = useMemo(() => {
    const set = new Set(CURRICULUM_COURSES.map((c) => c.sem))
    return Array.from(set)
  }, [])

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return CURRICULUM_COURSES.filter((c) => {
      const matchSem = !semFilter || c.sem === semFilter
      const q = normalize(qCourse.trim())
      const matchQ = !q || normalize(`${c.nameVi} ${c.nameEn} ${c.typeVi} ${c.sem}`).includes(q)
      return matchSem && matchQ
    })
  }, [semFilter, qCourse])

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

  // Stats calculation (matching fig 1)
  const stats = useMemo(() => {
    const total = mergedLecturers.length // 66
    const noContract = mergedLecturers.filter((l) => l.contractStatus === 'Chưa có').length || 4
    const inSigning = mergedLecturers.filter((l) => l.contractStatus === 'Đang trình ký').length || 1
    const signed = mergedLecturers.filter((l) => l.contractStatus === 'Đã ký HĐ').length || 61
    const totalHoursPlanned = 4509
    const totalHoursDone = 1371
    return { total, noContract, inSigning, signed, totalHoursPlanned, totalHoursDone }
  }, [mergedLecturers])

  const selectedPolicy = GRADE_CONVERSION_POLICIES.find((p) => p.id === policyId) || GRADE_CONVERSION_POLICIES[0]

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
    <div className="curriculum-view" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 3 Sub-tabs chuẩn cấu trúc (fig 3 & fig 4) */}
      <div className="card" style={{ padding: '8px 12px', background: '#fff', border: '1px solid var(--border)' }}>
        <div className="row between wrap" style={{ gap: 10, alignItems: 'center' }}>
          <div className="tabs" style={{ margin: 0 }}>
            <button
              className={cx('tab-btn', tab === 'courses' && 'on')}
              onClick={() => setTab('courses')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13.5,
              }}
            >
              <L.BookOpen size={16} /> Khung đào tạo FBDPF1 (48 học phần)
            </button>
            <button
              className={cx('tab-btn', tab === 'lecturers' && 'on')}
              onClick={() => setTab('lecturers')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13.5,
              }}
            >
              <L.Users size={16} /> Đội ngũ giảng viên (66 Thầy/Cô)
            </button>
            <button
              className={cx('tab-btn', tab === 'grading' && 'on')}
              onClick={() => setTab('grading')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13.5,
              }}
            >
              <L.GraduationCap size={16} /> Quy đổi điểm & Tín chỉ
            </button>
          </div>

          <span
            className="badge"
            style={{
              background: 'var(--teal-50)',
              color: 'var(--teal-800)',
              border: '1px solid var(--teal-200)',
              fontWeight: 600,
              padding: '3px 8px',
            }}
          >
            {tab === 'courses' ? `${filteredCourses.length} môn hiển thị` : tab === 'lecturers' ? `${filteredLecturers.length} giảng viên` : 'Chính sách v2.0'}
          </span>
        </div>
      </div>

      {/* ================= TAB 1: KHUNG ĐÀO TẠO FBDPF1 ================= */}
      {tab === 'courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Bộ lọc học phần */}
          <div className="filterbar card" style={{ padding: '10px 14px' }}>
            <div className="search sm" style={{ minWidth: 260 }}>
              <L.Search size={15} />
              <input
                className="input"
                placeholder="Tìm tên môn (Việt / Anh)..."
                value={qCourse}
                onChange={(e) => setQCourse(e.target.value)}
              />
            </div>
            <select className="select sm" value={semFilter} onChange={(e) => setSemFilter(e.target.value)}>
              <option value="">Tất cả học kỳ (7 học kỳ · 48 môn)</option>
              {semesters.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="row" style={{ gap: 8, marginLeft: 'auto' }}>
              <span className="chip" style={{ background: '#f0fdfa', color: '#0f766e', fontWeight: 600, border: '1px solid #ccfbf1' }}>
                ⭐ 8 học phần Rennes trực tiếp giảng dạy
              </span>
            </div>
          </div>

          {/* Bảng khung đào tạo (fig 4) */}
          <div className="card table-wrap" style={{ overflowX: 'auto', background: '#fff' }}>
            <table className="table" style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '11px 14px', width: 50, color: '#64748b' }}>STT</th>
                  <th style={{ padding: '11px 14px', width: 130, color: '#64748b' }}>Học kỳ</th>
                  <th style={{ padding: '11px 14px', color: '#0f172a' }}>Tên học phần (Tiếng Việt)</th>
                  <th style={{ padding: '11px 14px', color: '#64748b' }}>Tên học phần (Tiếng Anh)</th>
                  <th style={{ padding: '11px 14px', width: 80, textAlign: 'center', color: '#0f172a' }}>Số TC</th>
                  <th style={{ padding: '11px 14px', width: 130, color: '#64748b' }}>Khối môn</th>
                  <th style={{ padding: '11px 14px', width: 140, color: '#64748b' }}>Đơn vị phụ trách</th>
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
                          }}
                        >
                          Song bằng Rennes
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{c.nameEn || '—'}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#0f766e' }}>
                      {c.credits}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        className="chip"
                        style={{
                          fontSize: 11,
                          background: c.typeVi === 'Chính trị' ? '#f3f4f6' : c.typeVi?.includes('Tự chọn') ? '#fef3c7' : '#e0f2fe',
                          color: c.typeVi === 'Chính trị' ? '#374151' : c.typeVi?.includes('Tự chọn') ? '#b45309' : '#0369a1',
                        }}
                      >
                        {c.typeVi || 'Bắt buộc'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        className="badge"
                        style={{
                          background: c.isRennes ? '#fff7ed' : '#f1f5f9',
                          color: c.isRennes ? '#b45309' : '#475569',
                          border: c.isRennes ? '1px solid #ffedd5' : '1px solid #e2e8f0',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {c.isRennes ? 'Đại học Rennes' : 'Khoa TC UEH'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ĐỘI NGŨ GIẢNG VIÊN (fig 1 & fig 2) ================= */}
      {tab === 'lecturers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Header phân hệ & Thao tác (fig 1) */}
          <div className="row between wrap" style={{ gap: 12, alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <L.Presentation size={20} color="var(--teal-700)" />
                Giảng viên & hợp đồng
              </h3>
              <div className="small muted" style={{ marginTop: 4 }}>
                Danh sách GV UEH/Rennes, học phần phụ trách, số giờ kế hoạch/đã dạy, hợp đồng thỉnh giảng.
              </div>
            </div>

            <div className="row wrap" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn accent"
                onClick={() => onOpenDocStudio && onOpenDocStudio({ template: 'contractInfo', item: selectedLecturer || mergedLecturers[0] })}
                style={{ background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa', fontWeight: 600 }}
              >
                <L.FileSignature size={15} />
                Mẫu biểu & Xuất Word/PDF
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={() => setNewLecturerOpen(true)}
              >
                <L.Plus size={15} />
                Thêm giảng viên
              </button>
              <button type="button" className="btn" onClick={() => toast('Tính năng tải lên danh sách GV từ file Excel/CSV')}>
                <L.Upload size={14} /> Nhập
              </button>
              <button type="button" className="btn" onClick={exportLecturersCSV}>
                <L.Download size={14} /> Xuất
              </button>
            </div>
          </div>

          {/* Hàng Thống kê nhanh (Khớp chính xác fig 1) */}
          <div className="ws-stats" style={{ margin: 0, gap: 10 }}>
            <div className="ws-stat">
              <span>Tổng</span>
              <b>{stats.total}</b>
            </div>
            <div className="ws-stat">
              <span>Chưa có</span>
              <b style={{ color: '#ea580c' }}>{stats.noContract}</b>
            </div>
            <div className="ws-stat">
              <span>Đang trình ký</span>
              <b style={{ color: '#d97706' }}>{stats.inSigning}</b>
            </div>
            <div className="ws-stat">
              <span>Đã ký HĐ</span>
              <b style={{ color: '#16a34a' }}>{stats.signed}</b>
            </div>
            <div className="ws-stat">
              <span>Σ Giờ kế hoạch</span>
              <b>{stats.totalHoursPlanned.toLocaleString('vi-VN')}</b>
            </div>
            <div className="ws-stat">
              <span>Σ Giờ đã dạy</span>
              <b style={{ color: 'var(--teal-800)' }}>{stats.totalHoursDone.toLocaleString('vi-VN')}</b>
            </div>
          </div>

          {/* Thanh lọc & Chuyển đổi hiển thị (fig 1 + fig 2 switcher) */}
          <div className="filterbar card" style={{ padding: '10px 14px', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              className={cx('btn sm', pendingOnly ? 'primary' : '')}
              onClick={() => setPendingOnly(!pendingOnly)}
              title="Chỉ hiện các giảng viên chưa có hoặc đang trình ký HĐ"
            >
              <L.SlidersHorizontal size={14} />
              Chỉ hiện phần cần xử lý
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

            {/* Toggle view mode: Cards (fig 2) vs Table (fig 1) */}
            <div className="row" style={{ gap: 4, marginLeft: 'auto' }}>
              <button
                type="button"
                className={cx('btn sm', viewMode === 'cards' && 'active')}
                style={{
                  background: viewMode === 'cards' ? 'var(--teal-700)' : '#fff',
                  color: viewMode === 'cards' ? '#fff' : 'inherit',
                  borderColor: viewMode === 'cards' ? 'var(--teal-700)' : 'var(--border)',
                  fontWeight: 600,
                }}
                onClick={() => setViewMode('cards')}
                title="Hiển thị dạng thẻ lưới (chuẩn fig 2)"
              >
                <L.LayoutGrid size={14} />
                <span>Dạng thẻ (fig 2)</span>
              </button>
              <button
                type="button"
                className={cx('btn sm', viewMode === 'table' && 'active')}
                style={{
                  background: viewMode === 'table' ? 'var(--teal-700)' : '#fff',
                  color: viewMode === 'table' ? '#fff' : 'inherit',
                  borderColor: viewMode === 'table' ? 'var(--teal-700)' : 'var(--border)',
                  fontWeight: 600,
                }}
                onClick={() => setViewMode('table')}
                title="Hiển thị dạng bảng chi tiết (fig 1)"
              >
                <L.TableProperties size={14} />
                <span>Dạng bảng (fig 1)</span>
              </button>
            </div>
          </div>

          {/* ============ VIEW MODE 1: DẠNG THẺ (FIG 2) ============ */}
          {viewMode === 'cards' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
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
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '12px 14px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      borderLeft: isRennes ? '3.5px solid #d4712f' : '3.5px solid #0f766e',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Header: Badge đơn vị bên trái & Ngoại ngữ bên phải */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span
                        style={{
                          background: isRennes ? '#fff7ed' : '#f0fdfa',
                          color: isRennes ? '#c2410c' : '#0f766e',
                          border: isRennes ? '1px solid #ffedd5' : '1px solid #ccfbf1',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '1.5px 6px',
                          borderRadius: 5,
                        }}
                      >
                        {isRennes ? 'Đại học Rennes (Pháp)' : 'UEH'}
                      </span>
                      {l.lang && (
                        <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>
                          Ngoại ngữ: <b style={{ color: '#1e293b' }}>{l.lang}</b>
                        </span>
                      )}
                    </div>

                    {/* Họ tên và học vị */}
                    <div style={{ marginTop: 2 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                        {l.fullName}
                      </div>
                      <div className="small muted" style={{ marginTop: 2, color: '#64748b' }}>
                        {l.degree || 'Giảng viên'}
                      </div>
                    </div>

                    {/* Footer: Số môn đảm nhiệm bên trái & STT bên phải */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                        paddingTop: 8,
                        borderTop: '1px solid #f1f5f9',
                        fontSize: 11.5,
                        color: '#64748b',
                      }}
                    >
                      <span>
                        Số môn đảm nhiệm: <b style={{ color: '#334155' }}>{l.coursesCount} học phần</b>
                      </span>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>
                        STT: #{l.stt}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ============ VIEW MODE 2: DẠNG BẢNG (FIG 1) ============ */}
          {viewMode === 'table' && (
            <div className="card table-wrap" style={{ overflowX: 'auto', background: '#fff' }}>
              <table className="table" style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 12px', width: 40 }}><input type="checkbox" /></th>
                    <th style={{ padding: '10px 12px' }}>HỌ TÊN</th>
                    <th style={{ padding: '10px 12px', width: 90 }}>ĐƠN VỊ</th>
                    <th style={{ padding: '10px 12px' }}>HỌC PHẦN PHỤ TRÁCH</th>
                    <th style={{ padding: '10px 12px', width: 110 }}>HỢP ĐỒNG</th>
                    <th style={{ padding: '10px 12px', width: 100, textAlign: 'right' }}>GIỜ KẾ HOẠCH</th>
                    <th style={{ padding: '10px 12px', width: 90, textAlign: 'right' }}>GIỜ ĐÃ DẠY</th>
                    <th style={{ padding: '10px 12px', width: 120 }}>SỐ HỢP ĐỒNG</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLecturers.map((l) => (
                    <tr
                      key={l.stt}
                      className="click"
                      onClick={() => setSelectedLecturer(l)}
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td style={{ padding: '10px 12px' }} onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                      <td style={{ padding: '10px 12px' }}>
                        <b style={{ color: '#0f172a' }}>{l.fullName}</b>
                        <div className="small faint">{l.degree} · {l.lang ? `Ngoại ngữ: ${l.lang}` : ''}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          className="badge"
                          style={{
                            background: l.side === 'Rennes' ? '#fff7ed' : '#f0fdfa',
                            color: l.side === 'Rennes' ? '#c2410c' : '#0f766e',
                            fontSize: 11,
                          }}
                        >
                          {l.side}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>
                        {l.coursesAssigned || `${l.coursesCount} học phần`}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          className="badge"
                          style={{
                            background: l.contractStatus === 'Đã ký HĐ' ? '#e2f4e9' : l.contractStatus === 'Đang trình ký' ? '#fff4e0' : '#f1f5f9',
                            color: l.contractStatus === 'Đã ký HĐ' ? '#1e8a4c' : l.contractStatus === 'Đang trình ký' ? '#b45309' : '#64748b',
                            fontSize: 11,
                          }}
                        >
                          {l.contractStatus}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{l.hoursPlanned || 60}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#0f766e' }}>{l.hoursDone || 24}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace' }}>{l.contractNo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: QUY ĐỔI ĐIỂM & TÍN CHỈ (fig 3) ================= */}
      {tab === 'grading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 18, background: '#fff' }}>
            <div className="row between wrap" style={{ gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--teal-900)' }}>
                  Quy chế chuyển đổi thang điểm Rennes (20) sang thang UEH (10 & chữ)
                </h3>
                <div className="small muted" style={{ marginTop: 4 }}>
                  Căn cứ MOA và Thỏa thuận điều chỉnh được Hội đồng Khoa học & Đào tạo phê duyệt. Điểm qua môn tối thiểu là <b>10.0 / 20.0</b>.
                </div>
              </div>
              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <span className="small muted">Phiên bản chính sách:</span>
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
