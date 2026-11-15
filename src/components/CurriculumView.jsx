import { useMemo, useState } from 'react'
import * as L from 'lucide-react'
import { CURRICULUM_COURSES, LECTURERS_ALL, GRADE_CONVERSION_POLICIES } from '../data/rennesData.js'
import { normalize, cx } from '../lib/utils.js'

export default function CurriculumView({ project }) {
  const [tab, setTab] = useState('courses') // 'courses' | 'lecturers' | 'grading'
  const [semFilter, setSemFilter] = useState('')
  const [qCourse, setQCourse] = useState('')
  const [sideFilter, setSideFilter] = useState('')
  const [degreeFilter, setDegreeFilter] = useState('')
  const [qLec, setQLec] = useState('')
  const [policyId, setPolicyId] = useState('pol_v2')

  const semesters = useMemo(() => {
    const set = new Set(CURRICULUM_COURSES.map((c) => c.sem))
    return Array.from(set)
  }, [])

  const filteredCourses = useMemo(() => {
    return CURRICULUM_COURSES.filter((c) => {
      const matchSem = !semFilter || c.sem === semFilter
      const q = normalize(qCourse.trim())
      const matchQ = !q || normalize(`${c.nameVi} ${c.nameEn} ${c.typeVi}`).includes(q)
      return matchSem && matchQ
    })
  }, [semFilter, qCourse])

  const filteredLecturers = useMemo(() => {
    return LECTURERS_ALL.filter((l) => {
      const matchSide = !sideFilter || l.side === sideFilter
      const matchDegree = !degreeFilter || (l.degree && l.degree.includes(degreeFilter))
      const q = normalize(qLec.trim())
      const matchQ = !q || normalize(`${l.fullName} ${l.degree} ${l.lang}`).includes(q)
      return matchSide && matchDegree && matchQ
    })
  }, [sideFilter, degreeFilter, qLec])

  const selectedPolicy = GRADE_CONVERSION_POLICIES.find((p) => p.id === policyId) || GRADE_CONVERSION_POLICIES[0]

  return (
    <div className="curriculum-view" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tab bar cấp con */}
      <div className="card" style={{ padding: '8px 12px' }}>
        <div className="row between wrap" style={{ gap: 10 }}>
          <div className="tabs" style={{ margin: 0 }}>
            <button className={cx('tab-btn', tab === 'courses' && 'on')} onClick={() => setTab('courses')}>
              <L.BookOpen size={16} /> Khung đào tạo FBDPF1 (48 học phần)
            </button>
            <button className={cx('tab-btn', tab === 'lecturers' && 'on')} onClick={() => setTab('lecturers')}>
              <L.Users size={16} /> Đội ngũ giảng viên (66 Thầy/Cô)
            </button>
            <button className={cx('tab-btn', tab === 'grading' && 'on')} onClick={() => setTab('grading')}>
              <L.GraduationCap size={16} /> Quy đổi điểm & Tín chỉ
            </button>
          </div>

          <span className="badge" style={{ background: 'var(--teal-100)', color: 'var(--teal-800)', alignSelf: 'center' }}>
            {tab === 'courses' ? `${filteredCourses.length} môn hiển thị` : tab === 'lecturers' ? `${filteredLecturers.length} giảng viên` : 'Chính sách v2.0'}
          </span>
        </div>
      </div>

      {/* Tab 1: Khung đào tạo */}
      {tab === 'courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Bộ lọc học phần */}
          <div className="filterbar card" style={{ padding: '10px 14px' }}>
            <div className="search sm" style={{ minWidth: 240 }}>
              <L.Search size={15} />
              <input
                className="input"
                placeholder="Tìm tên môn (Việt / Anh)..."
                value={qCourse}
                onChange={(e) => setQCourse(e.target.value)}
              />
            </div>
            <select className="select sm" value={semFilter} onChange={(e) => setSemFilter(e.target.value)}>
              <option value="">Tất cả học kỳ (7 học kỳ)</option>
              {semesters.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="row" style={{ gap: 8, marginLeft: 'auto' }}>
              <span className="chip" style={{ background: 'rgba(3, 97, 106, 0.1)', color: 'var(--teal-800)', fontWeight: 600 }}>
                8 học phần Rennes trực tiếp giảng dạy
              </span>
            </div>
          </div>

          {/* Bảng học phần */}
          <div className="card table-wrap" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50, #f8fafc)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', width: 50 }}>STT</th>
                  <th style={{ padding: '10px 12px', width: 140 }}>Học kỳ</th>
                  <th style={{ padding: '10px 12px' }}>Tên học phần (Tiếng Việt)</th>
                  <th style={{ padding: '10px 12px' }}>Tên học phần (Tiếng Anh)</th>
                  <th style={{ padding: '10px 12px', width: 80, textAlign: 'center' }}>Số TC</th>
                  <th style={{ padding: '10px 12px', width: 130 }}>Khối môn</th>
                  <th style={{ padding: '10px 12px', width: 130 }}>Đơn vị phụ trách</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: c.isRennes ? 'rgba(3, 97, 106, 0.03)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{c.stt}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{c.sem.replace(/·.*/, '').trim()}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <b style={{ color: c.isRennes ? 'var(--teal-900)' : 'inherit' }}>{c.nameVi}</b>
                      {c.isRennes && (
                        <span className="badge" style={{ marginLeft: 8, fontSize: 10, background: 'var(--teal-100)', color: 'var(--teal-800)' }}>
                          Song bằng UR
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{c.nameEn || '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>{c.credits}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="chip" style={{ fontSize: 11 }}>{c.typeVi || 'Bắt buộc'}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        className="badge"
                        style={{
                          background: c.isRennes ? 'rgba(212, 113, 47, 0.12)' : 'var(--gray-100, #f1f5f9)',
                          color: c.isRennes ? '#b45309' : 'inherit',
                          fontSize: 11,
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

      {/* Tab 2: Đội ngũ giảng viên */}
      {tab === 'lecturers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Bộ lọc giảng viên */}
          <div className="filterbar card" style={{ padding: '10px 14px' }}>
            <div className="search sm" style={{ minWidth: 240 }}>
              <L.Search size={15} />
              <input
                className="input"
                placeholder="Tìm tên giảng viên, học vị..."
                value={qLec}
                onChange={(e) => setQLec(e.target.value)}
              />
            </div>
            <select className="select sm" value={sideFilter} onChange={(e) => setSideFilter(e.target.value)}>
              <option value="">Tất cả trường (66 Thầy/Cô)</option>
              <option value="Rennes">Đại học Rennes (6 Thầy/Cô)</option>
              <option value="UEH">Đại học Kinh tế TP.HCM (59 Thầy/Cô)</option>
            </select>
            <select className="select sm" value={degreeFilter} onChange={(e) => setDegreeFilter(e.target.value)}>
              <option value="">Mọi học hàm / học vị</option>
              <option value="GS">Giáo sư (GS)</option>
              <option value="PGS">Phó Giáo sư (PGS)</option>
              <option value="Tiến sĩ">Tiến sĩ (TS)</option>
              <option value="Thạc sĩ">Thạc sĩ / NCS</option>
            </select>
          </div>

          {/* Grid danh sách giảng viên */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 12 }}>
            {filteredLecturers.map((l) => (
              <div
                key={l.stt}
                className="card"
                style={{
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  borderLeft: l.side === 'Rennes' ? '3.5px solid var(--orange-500, #d4712f)' : '3.5px solid var(--teal-600)',
                }}
              >
                <div className="row between">
                  <span
                    className="badge"
                    style={{
                      background: l.side === 'Rennes' ? 'rgba(212, 113, 47, 0.12)' : 'var(--teal-100)',
                      color: l.side === 'Rennes' ? '#b45309' : 'var(--teal-800)',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {l.side === 'Rennes' ? 'Đại học Rennes (Pháp)' : 'UEH'}
                  </span>
                  {l.lang && (
                    <span className="chip" style={{ fontSize: 11 }}>
                      Ngoại ngữ: <b>{l.lang}</b>
                    </span>
                  )}
                </div>

                <div style={{ marginTop: 2 }}>
                  <h4 style={{ margin: 0, fontSize: 14.5 }}>{l.fullName}</h4>
                  <div className="small muted" style={{ marginTop: 2 }}>{l.degree || 'Giảng viên'}</div>
                </div>

                <div className="row between small faint" style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <span>Số môn đảm nhiệm: <b>{l.coursesCount} học phần</b></span>
                  <span>STT: #{l.stt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Chính sách quy đổi điểm */}
      {tab === 'grading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="row between wrap" style={{ gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--teal-900)' }}>Quy chế chuyển đổi thang điểm Rennes (20) sang thang UEH (10 & chữ)</h3>
                <div className="small muted" style={{ marginTop: 4 }}>
                  Căn cứ MOA và Thỏa thuận điều chỉnh được Hội đồng Khoa học & Đào tạo phê duyệt. Điểm qua môn tối thiểu là <b>10.0 / 20.0</b>.
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span className="small muted">Phiên bản chính sách:</span>
                <select className="select sm" value={policyId} onChange={(e) => setPolicyId(e.target.value)}>
                  {GRADE_CONVERSION_POLICIES.map((p) => (
                    <option key={p.id} value={p.id}>{p.version}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ background: 'var(--teal-50)', padding: '10px 14px', borderRadius: 8, fontSize: 12.5, marginBottom: 14, color: 'var(--teal-900)' }}>
              <b>Cơ quan ban hành:</b> {selectedPolicy.authority} · <b>Ngày hiệu lực:</b> {selectedPolicy.approvedDate} · <b>Ngưỡng đạt:</b> ≥ {selectedPolicy.passMark20}/20
            </div>

            <div className="table-wrap">
              <table className="table" style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50, #f8fafc)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 12px' }}>Thang điểm Pháp (UR)</th>
                    <th style={{ padding: '10px 12px' }}>Thang điểm 10 (UEH)</th>
                    <th style={{ padding: '10px 12px', width: 90, textAlign: 'center' }}>Điểm chữ</th>
                    <th style={{ padding: '10px 12px' }}>Xếp loại học vụ</th>
                    <th style={{ padding: '10px 12px', width: 120 }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPolicy.mapping.map((m, idx) => {
                    const isPass = m.frMin >= 10.0
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{m.frMin.toFixed(1)} – {m.frMax.toFixed(1)} / 20</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--teal-800)' }}>{m.ueh10}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span className="badge" style={{ background: isPass ? 'var(--teal-100)' : 'var(--red-100, #fee2e2)', color: isPass ? 'var(--teal-800)' : '#b91c1c', fontWeight: 700 }}>
                            {m.letter}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{m.rank}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className="badge" style={{ background: isPass ? '#e2f4e9' : '#fdecec', color: isPass ? '#1e8a4c' : '#c62828' }}>
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
    </div>
  )
}
