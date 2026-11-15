import { useState, useMemo } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { useToast, Avatar } from './ui.jsx'
import { CURRICULUM_COURSES } from '../data/rennesData.js'
import { cx, fmtDate, uid } from '../lib/utils.js'

export default function FlightLogisticsWorkflow({ project, onClose, onOpenDocStudio }) {
  const { state, me, saveItem, notifyUser } = useStore()
  const toast = useToast()

  // Step hiện tại: 1 (Khóa học/HP) -> 2 (GV & Đợt công tác) -> 3 (Lịch dạy & Khung TG) -> 4 (Tra cứu vé)
  const [step, setStep] = useState(1)

  // Danh sách các học phần Rennes từ khung đào tạo
  const rennesCourses = useMemo(() => {
    return CURRICULUM_COURSES.filter((c) => c.isRennes || c.typeEn === 'Rennes')
  }, [])

  // Danh sách giảng viên Rennes trong hệ thống
  const rennesLecturers = useMemo(() => {
    return state.items.filter((x) => x.module === 'lecturers' && x.side === 'Rennes')
  }, [state.items])

  /* ---------- FORM STATE DỌC THEO WORKFLOW ---------- */
  // Bước 1: Khóa học & Học phần
  const [cohort, setCohort] = useState('K51')
  const [teachingGroup, setTeachingGroup] = useState('K50–K51')
  const [selectedCourse, setSelectedCourse] = useState(rennesCourses[0] || {
    nameVi: 'Tiền tệ, NH & Thị trường Tài chính',
    nameEn: 'Money, Banking and Financial Markets',
    credits: '5',
    stt: 15
  })
  const [customCourseCode, setCustomCourseCode] = useState('RN-S3-01')

  // Bước 2: Giảng viên & Đợt công tác
  const [selectedLecturerId, setSelectedLecturerId] = useState(rennesLecturers[2]?.id || rennesLecturers[0]?.id || '')
  const lecturerData = useMemo(() => {
    return rennesLecturers.find((l) => l.id === selectedLecturerId) || rennesLecturers[0] || {
      fullName: 'Jean-Christophe Poutineau',
      academicTitle: 'Professeur des Universités, Classe exceptionnelle',
      email: 'jean-christophe.poutineau@univ-rennes.fr',
      phone: '+33 2 23 23 35 45',
      passport: '21AF89104',
      passportIssued: 'Préfecture d’Ille-et-Vilaine, France',
    }
  }, [selectedLecturerId, rennesLecturers])

  const [tripTitle, setTripTitle] = useState('')

  // Bước 3: Lịch giảng & Khung thời gian
  const [teachFrom, setTeachFrom] = useState('2026-10-20')
  const [teachTo, setTeachTo] = useState('2026-10-29')
  const [teachHours, setTeachHours] = useState(30)
  const [teachingShift, setTeachingShift] = useState('Sáng (08:00 – 11:30)')
  const [teachingRoom, setTeachingRoom] = useState('Phòng B1.205 (Cơ sở B UEH – 279 Nguyễn Tri Phương, Q.10)')

  // Tính khung thời gian di chuyển khuyến nghị (Buffer để nghỉ ngơi & hồi phục Jet lag)
  const departureDate = useMemo(() => {
    if (!teachFrom) return '2026-10-18'
    const d = new Date(teachFrom)
    d.setDate(d.getDate() - 2) // Đến trước 2 ngày
    return d.toISOString().slice(0, 10)
  }, [teachFrom])

  const returnDate = useMemo(() => {
    if (!teachTo) return '2026-10-30'
    const d = new Date(teachTo)
    d.setDate(d.getDate() + 1) // Về sau 1 ngày
    return d.toISOString().slice(0, 10)
  }, [teachTo])

  // Bước 4: Tra cứu & Đề xuất vé máy bay
  const [flightSort, setFlightSort] = useState('preferred') // 'preferred' | 'price' | 'duration' | 'timing'
  const [filterDirectOnly, setFilterDirectOnly] = useState(false)
  const [filterAirline, setFilterAirline] = useState('all')
  const [selectedFlightId, setSelectedFlightId] = useState('vn_direct')
  const [backupFlightId, setBackupFlightId] = useState('af_direct')

  // Dữ liệu các phương án chuyến bay thực tế (Paris CDG ⇄ TP. Hồ Chí Minh SGN)
  const flightOffers = useMemo(() => {
    const baseOffers = [
      {
        id: 'vn_direct',
        airline: 'Vietnam Airlines',
        airlineCode: 'VN',
        logoText: 'VNA',
        color: '#00558f',
        badge: 'Khuyến nghị số 1 · Đối tác chiến lược UEH',
        isPreferred: true,
        isDirect: true,
        aircraft: 'Boeing 787-9 Dreamliner',
        cabinClass: 'Phổ thông linh hoạt (Economy Flex)',
        baggage: '02 kiện 23kg ký gửi + 12kg xách tay',
        priceVnd: 29850000,
        priceEur: 1085,
        outbound: {
          flightNo: 'VN 10',
          route: 'Paris (CDG) → TP. Hồ Chí Minh (SGN)',
          depTime: '13:10',
          arrTime: '06:45 (+1 ngày)',
          depDate: departureDate,
          arrDate: teachFrom ? new Date(new Date(departureDate).getTime() + 864e5).toISOString().slice(0, 10) : '2026-10-19',
          duration: '11h 35m',
          stops: 'Bay thẳng (Non-stop)'
        },
        inbound: {
          flightNo: 'VN 11',
          route: 'TP. Hồ Chí Minh (SGN) → Paris (CDG)',
          depTime: '23:25',
          arrTime: '06:55 (+1 ngày)',
          depDate: returnDate,
          arrDate: returnDate ? new Date(new Date(returnDate).getTime() + 864e5).toISOString().slice(0, 10) : '2026-10-31',
          duration: '12h 30m',
          stops: 'Bay thẳng (Non-stop)'
        },
        compatibility: 'Hoàn hảo: Đến trước buổi dạy 25 giờ (Nghỉ ngơi hồi phục Jet lag tốt)',
        isCompatible: true
      },
      {
        id: 'af_direct',
        airline: 'Air France',
        airlineCode: 'AF',
        logoText: 'AFR',
        color: '#002157',
        badge: 'Hãng hàng không Pháp · Ưu tiên MOA',
        isPreferred: true,
        isDirect: true,
        aircraft: 'Airbus A350-900',
        cabinClass: 'Standard Economy (Đổi vé miễn phí)',
        baggage: '02 kiện 23kg ký gửi + 12kg xách tay',
        priceVnd: 31200000,
        priceEur: 1135,
        outbound: {
          flightNo: 'AF 258',
          route: 'Paris (CDG) → TP. Hồ Chí Minh (SGN)',
          depTime: '14:20',
          arrTime: '08:35 (+1 ngày)',
          depDate: departureDate,
          arrDate: teachFrom ? new Date(new Date(departureDate).getTime() + 864e5).toISOString().slice(0, 10) : '2026-10-19',
          duration: '11h 15m',
          stops: 'Bay thẳng (Non-stop)'
        },
        inbound: {
          flightNo: 'AF 257',
          route: 'TP. Hồ Chí Minh (SGN) → Paris (CDG)',
          depTime: '10:45',
          arrTime: '18:25',
          depDate: returnDate,
          arrDate: returnDate,
          duration: '12h 40m',
          stops: 'Bay thẳng (Non-stop)'
        },
        compatibility: 'Tối ưu cho GV Pháp (Tích lũy dặm bay Flying Blue)',
        isCompatible: true
      },
      {
        id: 'qr_transit',
        airline: 'Qatar Airways',
        airlineCode: 'QR',
        logoText: 'QTR',
        color: '#5c0632',
        badge: 'Giá tiết kiệm nhất (-12% ngân sách)',
        isPreferred: false,
        isDirect: false,
        aircraft: 'Airbus A380-800 / Boeing 787',
        cabinClass: 'Economy Classic',
        baggage: '02 kiện 23kg ký gửi',
        priceVnd: 26400000,
        priceEur: 960,
        outbound: {
          flightNo: 'QR 040 / QR 970',
          route: 'Paris (CDG) → Doha (DOH) → SGN',
          depTime: '16:05',
          arrTime: '14:10 (+1 ngày)',
          depDate: departureDate,
          arrDate: teachFrom ? new Date(new Date(departureDate).getTime() + 864e5).toISOString().slice(0, 10) : '2026-10-19',
          duration: '15h 05m',
          stops: '1 điểm dừng tại Doha (DOH, nghỉ 2h 15m)'
        },
        inbound: {
          flightNo: 'QR 971 / QR 039',
          route: 'TP. Hồ Chí Minh (SGN) → Doha (DOH) → CDG',
          depTime: '19:30',
          arrTime: '06:55 (+1 ngày)',
          depDate: returnDate,
          arrDate: returnDate ? new Date(new Date(returnDate).getTime() + 864e5).toISOString().slice(0, 10) : '2026-10-31',
          duration: '16h 25m',
          stops: '1 điểm dừng tại Doha (DOH, nghỉ 2h 45m)'
        },
        compatibility: 'Hợp lý về chi phí ngân sách, thời gian transit ngắn',
        isCompatible: true
      },
      {
        id: 'sq_transit',
        airline: 'Singapore Airlines',
        airlineCode: 'SQ',
        logoText: 'SIA',
        color: '#d4712f',
        badge: 'Dịch vụ 5 sao quốc tế',
        isPreferred: false,
        isDirect: false,
        aircraft: 'Airbus A380 / Boeing 737 MAX',
        cabinClass: 'Economy Flexi',
        baggage: '30kg ký gửi + 7kg xách tay',
        priceVnd: 33600000,
        priceEur: 1220,
        outbound: {
          flightNo: 'SQ 335 / SQ 178',
          route: 'Paris (CDG) → Singapore (SIN) → SGN',
          depTime: '12:00',
          arrTime: '09:15 (+1 ngày)',
          depDate: departureDate,
          arrDate: teachFrom ? new Date(new Date(departureDate).getTime() + 864e5).toISOString().slice(0, 10) : '2026-10-19',
          duration: '14h 15m',
          stops: '1 điểm dừng tại Singapore (SIN, nghỉ 1h 50m)'
        },
        inbound: {
          flightNo: 'SQ 183 / SQ 336',
          route: 'TP. Hồ Chí Minh (SGN) → Singapore (SIN) → CDG',
          depTime: '16:05',
          arrTime: '07:15 (+1 ngày)',
          depDate: returnDate,
          arrDate: returnDate ? new Date(new Date(returnDate).getTime() + 864e5).toISOString().slice(0, 10) : '2026-10-31',
          duration: '16h 10m',
          stops: '1 điểm dừng tại Singapore (SIN, nghỉ 2h 10m)'
        },
        compatibility: 'Dịch vụ cao cấp, giờ bay đẹp',
        isCompatible: true
      },
      {
        id: 'ek_transit',
        airline: 'Emirates',
        airlineCode: 'EK',
        logoText: 'UAE',
        color: '#c62828',
        badge: 'Hành lý rộng rãi',
        isPreferred: false,
        isDirect: false,
        aircraft: 'Boeing 777-300ER',
        cabinClass: 'Economy Saver',
        baggage: '02 kiện 23kg ký gửi',
        priceVnd: 27800000,
        priceEur: 1010,
        outbound: {
          flightNo: 'EK 074 / EK 392',
          route: 'Paris (CDG) → Dubai (DXB) → SGN',
          depTime: '15:35',
          arrTime: '19:35 (+1 ngày)',
          depDate: departureDate,
          arrDate: teachFrom ? new Date(new Date(departureDate).getTime() + 864e5).toISOString().slice(0, 10) : '2026-10-19',
          duration: '17h 00m',
          stops: '1 điểm dừng tại Dubai (DXB, nghỉ 3h 10m)'
        },
        inbound: {
          flightNo: 'EK 393 / EK 073',
          route: 'TP. Hồ Chí Minh (SGN) → Dubai (DXB) → CDG',
          depTime: '23:55',
          arrTime: '13:30 (+1 ngày)',
          depDate: returnDate,
          arrDate: returnDate ? new Date(new Date(returnDate).getTime() + 864e5).toISOString().slice(0, 10) : '2026-10-31',
          duration: '18h 35m',
          stops: '1 điểm dừng tại Dubai (DXB, nghỉ 3h 45m)'
        },
        compatibility: 'Đến TP.HCM buổi tối, cần nhận phòng nghỉ ngay',
        isCompatible: true
      }
    ]

    // Áp dụng bộ lọc
    let filtered = baseOffers.filter((o) => {
      if (filterDirectOnly && !o.isDirect) return false
      if (filterAirline !== 'all' && o.airlineCode !== filterAirline) return false
      return true
    })

    // Áp dụng sắp xếp
    if (flightSort === 'price') {
      filtered.sort((a, b) => a.priceVnd - b.priceVnd)
    } else if (flightSort === 'preferred') {
      filtered.sort((a, b) => (b.isPreferred ? 1 : 0) - (a.isPreferred ? 1 : 0) || a.priceVnd - b.priceVnd)
    } else if (flightSort === 'duration') {
      filtered.sort((a, b) => (a.isDirect ? 0 : 1) - (b.isDirect ? 0 : 1))
    }

    return filtered
  }, [departureDate, returnDate, teachFrom, filterDirectOnly, filterAirline, flightSort])

  // Phương án vé đang chọn chính
  const chosenPrimaryFlight = useMemo(() => {
    return flightOffers.find((f) => f.id === selectedFlightId) || flightOffers[0]
  }, [flightOffers, selectedFlightId])

  /* ---------- HOÀN TẤT & CHUYỂN ĐỔI SANG PHIẾU ĐỀ NGHỊ ---------- */
  const handleCompleteAndConvertToDoc = () => {
    const flight = chosenPrimaryFlight

    // 1. Tạo hoặc cập nhật bản ghi Đợt công tác (trips)
    const tripRecord = {
      id: uid('tr'),
      lecturer: lecturerData.fullName,
      course: selectedCourse.nameVi,
      className: cohort === 'K52' ? 'ISB-K52-01' : 'ISB-K51-01',
      cohort,
      teachingGroup,
      teachFrom,
      teachTo,
      teachHours,
      contractNo: lecturerData.contractNo || '1150/HĐTG-ĐHKT-TC',
      outFlight: `${flight.outbound.flightNo} (${flight.airlineCode}) · ${flight.outbound.depTime} → ${flight.outbound.arrTime}`,
      departAt: `${flight.outbound.depDate}T${flight.outbound.depTime}:00`,
      arriveAt: `${flight.outbound.arrDate}T${flight.outbound.arrTime.slice(0, 5)}:00`,
      returnFlight: `${flight.inbound.flightNo} (${flight.airlineCode}) · ${flight.inbound.depTime} → ${flight.inbound.arrTime.slice(0, 5)}`,
      returnAt: `${flight.inbound.depDate}T${flight.inbound.depTime}:00`,
      ticketCost: flight.priceVnd,
      hotel: 'Khách sạn Novotel Saigon Centre',
      hotelStatus: 'Đã gửi phiếu',
      checkIn: departureDate,
      checkOut: returnDate,
      hotelCost: 22000000,
      visa: 'Đã cấp visa',
      pickup: 'Xe trường đón tại ga đến quốc tế Tân Sơn Nhất',
      status: 'Đã xác nhận',
      payStatus: 'Chưa thanh toán',
      steps: [
        { text: 'HĐ thỉnh giảng đã ký', done: true, by: me.name },
        { text: 'Thư mời / hồ sơ visa', done: true, by: me.name },
        { text: `Đặt vé máy bay: ${flight.airline} (${flight.outbound.flightNo})`, done: true, by: me.name },
        { text: 'Phiếu đặt phòng được duyệt', done: false },
        { text: 'Gửi thông tin chuyến cho GV', done: false },
        { text: 'Đặt xe đón tiễn sân bay', done: false },
        { text: 'GV ký bảng trừ thuế 20%', done: false },
        { text: 'Lập đề nghị thanh toán', done: false },
      ],
      note: `Đợt công tác được lập từ Quy trình điều phối giảng dạy & vé máy bay. Phương án vé chọn: ${flight.airline} (${flight.outbound.flightNo} / ${flight.inbound.flightNo}), giá ${flight.priceVnd.toLocaleString('vi-VN')} đ.`
    }

    // Lưu vào store
    saveItem(project.id, 'trips', tripRecord, `khởi tạo đợt công tác giảng viên ${lecturerData.fullName} (${selectedCourse.nameVi})`)

    // Thông báo cho quản lý dự án (Notification Loop)
    notifyUser('u1', project.id, `${me.name} đã hoàn tất điều phối vé máy bay cho GV ${lecturerData.fullName} (${flight.airline} - ${flight.priceVnd.toLocaleString('vi-VN')} đ)`)

    toast(`Đã lưu đợt công tác và chuyển dữ liệu sang Phiếu đề nghị đặt vé máy bay!`)

    // Đóng workflow và mở trực tiếp DocTemplateStudio với dữ liệu đã trích xuất 100%
    if (onOpenDocStudio) {
      onOpenDocStudio({
        template: 'flightReq',
        item: tripRecord
      })
    }
    onClose()
  }

  return (
    <div className="flight-workflow-backdrop" style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)', zIndex: 1250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div className="flight-workflow-window" style={{
        background: '#ffffff', borderRadius: 12, width: '96vw', maxWidth: 1240, height: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', background: '#03616a', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14
        }}>
          <div className="row" style={{ gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <L.PlaneTakeoff size={20} color="#fff" />
            </div>
            <div>
              <b style={{ fontSize: 16, display: 'block', lineHeight: 1.2 }}>Quy trình Điều phối Giảng dạy & Hậu cần Vé máy bay</b>
              <span className="small" style={{ opacity: 0.85, fontSize: 12 }}>Workflow: Khóa học → Đợt công tác → Tra cứu & Đề xuất vé máy bay → Phiếu đề nghị</span>
            </div>
          </div>
          <button
            type="button"
            className="iconbtn"
            style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: 30, height: 30 }}
            onClick={onClose}
          >
            <L.X size={16} />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div style={{ background: '#f8fafc', padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {[
            { num: 1, title: 'Khóa học & Học phần', icon: 'GraduationCap' },
            { num: 2, title: 'Giảng viên & Đợt công tác', icon: 'UserCheck' },
            { num: 3, title: 'Lịch dạy & Khung thời gian', icon: 'CalendarClock' },
            { num: 4, title: 'Tra cứu & Đề xuất vé', icon: 'Plane' },
          ].map((s) => {
            const isDone = step > s.num
            const isCurrent = step === s.num
            return (
              <div
                key={s.num}
                className="row"
                style={{
                  gap: 8,
                  cursor: isDone ? 'pointer' : 'default',
                  opacity: isCurrent || isDone ? 1 : 0.55
                }}
                onClick={() => isDone && setStep(s.num)}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: isDone ? '#1e8a4c' : isCurrent ? '#03616a' : '#cbd5e1',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13
                }}>
                  {isDone ? '✓' : s.num}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12.5, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--teal-900)' : 'var(--gray-700)' }}>
                    {s.title}
                  </span>
                  <span className="faint small" style={{ fontSize: 10.5 }}>
                    {isDone ? 'Đã hoàn tất' : isCurrent ? 'Đang thực hiện' : 'Chưa đến'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Workflow Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* ================= BƯỚC 1: KHÓA HỌC & HỌC PHẦN ================= */}
          {step === 1 && (
            <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--teal-700)', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--teal-900)' }}>Bước 1: Lựa chọn Khóa đào tạo và Học phần thỉnh giảng</h3>
                <div className="small muted" style={{ marginTop: 4 }}>
                  Chọn khóa sinh viên thụ hưởng và học phần thuộc 8 môn giảng dạy chuyên môn của Đại học Rennes (Giai đoạn 2 song bằng).
                </div>
              </div>

              {/* Chọn Khóa học */}
              <div className="field">
                <label style={{ fontWeight: 600, fontSize: 13.5 }}>1. Khóa đào tạo (Cohort):</label>
                <div className="row wrap" style={{ gap: 10, marginTop: 6 }}>
                  {[
                    { id: 'K51', label: 'Khóa K51 (Năm 2)', badge: 'Nhóm ghép K50–K51', desc: 'Đang học giai đoạn 2 chuyên ngành' },
                    { id: 'K50', label: 'Khóa K50 (Năm 3)', badge: 'Nhóm ghép K50–K51', desc: 'Giai đoạn tốt nghiệp song bằng Rennes' },
                    { id: 'K52', label: 'Khóa K52 (Năm 1)', badge: 'Khóa riêng K52', desc: 'Đang chuẩn bị tiếng Pháp & học phần nền tảng' },
                  ].map((c) => (
                    <div
                      key={c.id}
                      className={cx('card click', cohort === c.id && 'selected-wf')}
                      style={{
                        flex: 1, minWidth: 220, padding: 14,
                        border: cohort === c.id ? '2px solid var(--teal-700)' : '1px solid var(--border)',
                        background: cohort === c.id ? 'var(--teal-50)' : '#fff'
                      }}
                      onClick={() => {
                        setCohort(c.id)
                        setTeachingGroup(c.id === 'K52' ? 'K52' : 'K50–K51')
                      }}
                    >
                      <div className="row between">
                        <b>{c.label}</b>
                        <span className="chip" style={{ fontSize: 10.5 }}>{c.badge}</span>
                      </div>
                      <div className="small muted" style={{ marginTop: 4 }}>{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danh sách 8 học phần Rennes */}
              <div className="field">
                <label style={{ fontWeight: 600, fontSize: 13.5 }}>2. Chọn Học phần giảng dạy của Đại học Rennes:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 10, marginTop: 8 }}>
                  {rennesCourses.map((crs, idx) => {
                    const isSelected = selectedCourse.nameVi === crs.nameVi
                    return (
                      <div
                        key={idx}
                        className={cx('card click', isSelected && 'selected-wf')}
                        style={{
                          padding: 12,
                          border: isSelected ? '2px solid var(--teal-700)' : '1px solid var(--border)',
                          background: isSelected ? '#f0fdf4' : '#fff'
                        }}
                        onClick={() => {
                          setSelectedCourse(crs)
                          setCustomCourseCode(`RN-S${crs.stt > 20 ? 4 : 3}-0${(idx % 4) + 1}`)
                        }}
                      >
                        <div className="row between">
                          <b style={{ fontSize: 13.5, color: isSelected ? 'var(--teal-900)' : 'inherit' }}>{crs.nameVi}</b>
                          <span className="badge" style={{ background: 'var(--teal-100)', color: 'var(--teal-800)', fontSize: 11 }}>{crs.credits} tín chỉ</span>
                        </div>
                        <div className="small faint" style={{ fontStyle: 'italic', marginTop: 2 }}>{crs.nameEn}</div>
                        <div className="row between small faint" style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed var(--border)' }}>
                          <span>Học kỳ: {crs.sem.slice(0, 10)}</span>
                          <span>Định mức: 30 giờ thỉnh giảng</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= BƯỚC 2: GIẢNG VIÊN & ĐỢT CÔNG TÁC ================= */}
          {step === 2 && (
            <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--teal-700)', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--teal-900)' }}>Bước 2: Phân công Giảng viên Đại học Rennes & Thiết lập Đợt công tác</h3>
                <div className="small muted" style={{ marginTop: 4 }}>
                  Học phần: <b>{selectedCourse.nameVi}</b> ({selectedCourse.credits} tín chỉ) · Khóa: <b>{cohort}</b> ({teachingGroup})
                </div>
              </div>

              {/* Danh sách giảng viên Rennes */}
              <div className="field">
                <label style={{ fontWeight: 600, fontSize: 13.5 }}>1. Chọn Giảng viên phụ trách đợt giảng:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginTop: 8 }}>
                  {rennesLecturers.map((lec) => {
                    const isSelected = selectedLecturerId === lec.id
                    return (
                      <div
                        key={lec.id}
                        className={cx('card click', isSelected && 'selected-wf')}
                        style={{
                          padding: 12,
                          border: isSelected ? '2px solid var(--teal-700)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--teal-50)' : '#fff'
                        }}
                        onClick={() => setSelectedLecturerId(lec.id)}
                      >
                        <div className="row" style={{ gap: 10 }}>
                          <Avatar user={{ name: lec.fullName, color: 'var(--teal-700)' }} size={34} />
                          <div>
                            <b style={{ fontSize: 13.5 }}>{lec.fullName}</b>
                            <div className="small faint" style={{ fontSize: 11 }}>{lec.academicTitle || 'Giảng viên Rennes'}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Hồ sơ tự động điền của giảng viên đã chọn */}
              <div className="card" style={{ padding: 16, background: '#fafbfc' }}>
                <div className="row between" style={{ marginBottom: 10 }}>
                  <b style={{ fontSize: 13.5, color: 'var(--teal-800)' }}>Thông tin pháp lý & Hồ sơ nhân thân giảng viên:</b>
                  <span className="badge" style={{ background: '#e2f4e9', color: '#1e8a4c' }}>✓ Đã đồng bộ hồ sơ</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5 }}>
                  <div><b>Chức danh: </b>{lecturerData.academicTitle || 'Giáo sư'}</div>
                  <div><b>Hộ chiếu: </b>{lecturerData.passport || '21AF89104'} (Pháp)</div>
                  <div><b>Email: </b>{lecturerData.email || 'rennes@univ-rennes.fr'}</div>
                  <div><b>Điện thoại: </b>{lecturerData.phone || '+33 2 23 23 00 00'}</div>
                  <div><b>Hợp đồng giảng dạy: </b>{lecturerData.contractNo || '1150/HĐTG-ĐHKT-TC'}</div>
                  <div><b>Thù lao theo MOA: </b>€104 / giờ (thực nhận)</div>
                </div>
              </div>

              {/* Tên đợt công tác */}
              <div className="field">
                <label style={{ fontWeight: 600, fontSize: 13.5 }}>2. Tên đợt công tác (Trip Title):</label>
                <input
                  className="input"
                  style={{ fontWeight: 600 }}
                  value={tripTitle || `Đợt giảng ${selectedCourse.nameVi} – ${lecturerData.fullName} (${cohort})`}
                  onChange={(e) => setTripTitle(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ================= BƯỚC 3: LỊCH DẠY & KHUNG THỜI GIAN ================= */}
          {step === 3 && (
            <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ padding: 18, borderLeft: '4px solid var(--teal-700)', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--teal-900)' }}>Bước 3: Thiết lập Lịch giảng dạy & Khung thời gian cần có mặt</h3>
                <div className="small muted" style={{ marginTop: 4 }}>
                  Xác định thời gian giảng dạy trực tiếp tại UEH để hệ thống tính toán thời điểm bay và đặt phòng khách sạn tối ưu.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label style={{ fontWeight: 600, fontSize: 13 }}>Ngày bắt đầu giảng dạy:</label>
                  <input className="input" type="date" value={teachFrom} onChange={(e) => setTeachFrom(e.target.value)} />
                </div>
                <div className="field">
                  <label style={{ fontWeight: 600, fontSize: 13 }}>Ngày kết thúc giảng dạy:</label>
                  <input className="input" type="date" value={teachTo} onChange={(e) => setTeachTo(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label style={{ fontWeight: 600, fontSize: 13 }}>Ca học phụ trách:</label>
                  <select className="select" value={teachingShift} onChange={(e) => setTeachingShift(e.target.value)}>
                    <option>Sáng (08:00 – 11:30)</option>
                    <option>Chiều (13:30 – 17:00)</option>
                    <option>Cả ngày (08:00 – 11:30 & 13:30 – 17:00)</option>
                  </select>
                </div>
                <div className="field">
                  <label style={{ fontWeight: 600, fontSize: 13 }}>Tổng số giờ giảng:</label>
                  <input className="input" type="number" value={teachHours} onChange={(e) => setTeachHours(+e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label style={{ fontWeight: 600, fontSize: 13 }}>Địa điểm giảng dạy:</label>
                <input className="input" value={teachingRoom} onChange={(e) => setTeachingRoom(e.target.value)} />
              </div>

              {/* Khung thời gian di chuyển tự động (Jet lag buffer) */}
              <div className="card" style={{ padding: 16, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div className="row" style={{ gap: 8, color: '#b45309', fontWeight: 600, marginBottom: 6 }}>
                  <L.Clock size={16} />
                  <span>Quy chuẩn thời gian di chuyển quốc tế (Arrival & Jet lag Buffer):</span>
                </div>
                <div className="small" style={{ lineHeight: 1.5, color: '#78350f' }}>
                  Giảng viên bay từ Pháp (chênh lệch 5-6 múi giờ). Theo quy chuẩn chương trình UEH–Rennes, giảng viên cần có mặt tại TP.HCM trước buổi dạy đầu tiên <b>ít nhất 24 đến 48 giờ</b> để nhận phòng và làm quen múi giờ.
                </div>
                <div className="row wrap" style={{ gap: 12, marginTop: 10 }}>
                  <div className="badge" style={{ background: '#fff', border: '1px solid #fcd34d', color: '#92400e', fontSize: 12 }}>
                    🛫 Ngày bay đi khuyến nghị: <b>{fmtDate(departureDate)}</b>
                  </div>
                  <div className="badge" style={{ background: '#fff', border: '1px solid #fcd34d', color: '#92400e', fontSize: 12 }}>
                    🛬 Ngày bay về khuyến nghị: <b>{fmtDate(returnDate)}</b>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= BƯỚC 4: TRA CỨU & ĐỀ XUẤT VÉ MÁY BAY ================= */}
          {step === 4 && (
            <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Summary Bar */}
              <div className="card" style={{ padding: '12px 18px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div className="row" style={{ gap: 12 }}>
                  <span className="badge" style={{ background: 'var(--teal-100)', color: 'var(--teal-800)', fontWeight: 600 }}>Chặng bay</span>
                  <b>Paris (CDG) ⇄ TP. Hồ Chí Minh (SGN)</b>
                  <span className="faint">· Khởi hành: {fmtDate(departureDate)} · Về: {fmtDate(returnDate)}</span>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="badge" style={{ background: '#e2f4e9', color: '#1e8a4c', fontWeight: 600 }}>
                    Hành khách: {lecturerData.fullName}
                  </span>
                </div>
              </div>

              {/* Bộ lọc và Sắp xếp vé */}
              <div className="row between wrap" style={{ gap: 10, background: '#fff', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
                  <span className="small faint" style={{ fontWeight: 600 }}>Sắp xếp:</span>
                  <select className="select sm" value={flightSort} onChange={(e) => setFlightSort(e.target.value)}>
                    <option value="preferred">⚡ Hãng ưu tiên (VNA & Air France)</option>
                    <option value="price">💰 Giá vé thấp nhất</option>
                    <option value="duration">⏱️ Bay thẳng / Thời gian ngắn nhất</option>
                  </select>

                  <label className="row small click" style={{ gap: 6, marginLeft: 8 }}>
                    <input type="checkbox" checked={filterDirectOnly} onChange={(e) => setFilterDirectOnly(e.target.checked)} />
                    <span>Chỉ bay thẳng (Non-stop)</span>
                  </label>
                </div>

                <div className="row" style={{ gap: 6 }}>
                  <span className="small faint">Hãng bay:</span>
                  <select className="select sm" value={filterAirline} onChange={(e) => setFilterAirline(e.target.value)}>
                    <option value="all">Tất cả hãng</option>
                    <option value="VN">Vietnam Airlines (VN)</option>
                    <option value="AF">Air France (AF)</option>
                    <option value="QR">Qatar Airways (QR)</option>
                    <option value="SQ">Singapore Airlines (SQ)</option>
                    <option value="EK">Emirates (EK)</option>
                  </select>
                </div>
              </div>

              {/* Danh sách các chuyến bay */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {flightOffers.map((flight) => {
                  const isPrimary = selectedFlightId === flight.id
                  const isBackup = backupFlightId === flight.id

                  return (
                    <div
                      key={flight.id}
                      className={cx('card', isPrimary && 'selected-wf')}
                      style={{
                        padding: 16,
                        border: isPrimary ? '2px solid var(--teal-700)' : '1px solid var(--border)',
                        background: isPrimary ? '#f0fdfa' : '#fff',
                        boxShadow: isPrimary ? '0 4px 12px rgba(3, 97, 106, 0.12)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Flight Header */}
                      <div className="row between wrap" style={{ gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                        <div className="row" style={{ gap: 10 }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 6,
                              background: flight.color,
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: 12.5,
                              letterSpacing: 0.5
                            }}
                          >
                            {flight.logoText}
                          </span>
                          <div>
                            <b style={{ fontSize: 15 }}>{flight.airline}</b>
                            <span className="faint small" style={{ marginLeft: 8 }}>· {flight.aircraft}</span>
                          </div>
                          {flight.badge && (
                            <span className="badge" style={{ background: 'rgba(3, 97, 106, 0.1)', color: 'var(--teal-800)', fontSize: 11, fontWeight: 600 }}>
                              {flight.badge}
                            </span>
                          )}
                        </div>

                        <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--teal-900)' }}>
                              {flight.priceVnd.toLocaleString('vi-VN')} ₫
                            </div>
                            <div className="small faint">≈ €{flight.priceEur} (Đã gồm thuế, phí)</div>
                          </div>

                          <div className="row" style={{ gap: 6 }}>
                            <button
                              type="button"
                              className={cx('btn sm', isPrimary ? 'primary' : 'ghost')}
                              onClick={() => setSelectedFlightId(flight.id)}
                            >
                              {isPrimary ? '✓ Phương án chính' : 'Chọn PA chính'}
                            </button>
                            <button
                              type="button"
                              className={cx('btn sm', isBackup ? 'accent' : 'ghost')}
                              style={{ fontSize: 11 }}
                              onClick={() => setBackupFlightId(isBackup ? null : flight.id)}
                              title="Chọn làm phương án dự phòng khi trình phê duyệt"
                            >
                              {isBackup ? '✓ PA Dự phòng' : '+ PA Dự phòng'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Flight Details (Chiều đi & Chiều về) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12, fontSize: 13 }}>
                        {/* Chiều đi */}
                        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid var(--border)' }}>
                          <div className="row between small" style={{ marginBottom: 4, fontWeight: 600, color: 'var(--teal-800)' }}>
                            <span>🛫 CHIỀU ĐI ({flight.outbound.depDate})</span>
                            <span className="chip" style={{ fontSize: 10.5 }}>{flight.outbound.stops}</span>
                          </div>
                          <div className="row between" style={{ margin: '6px 0' }}>
                            <div>
                              <b style={{ fontSize: 15 }}>{flight.outbound.depTime}</b>
                              <div className="small faint">CDG (Paris)</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <span className="small faint">{flight.outbound.duration}</span>
                              <div style={{ width: 80, height: 2, background: 'var(--teal-400)', margin: '2px auto' }} />
                              <span className="small faint" style={{ fontWeight: 600 }}>{flight.outbound.flightNo}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <b style={{ fontSize: 15 }}>{flight.outbound.arrTime}</b>
                              <div className="small faint">SGN (Tân Sơn Nhất)</div>
                            </div>
                          </div>
                        </div>

                        {/* Chiều về */}
                        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid var(--border)' }}>
                          <div className="row between small" style={{ marginBottom: 4, fontWeight: 600, color: 'var(--teal-800)' }}>
                            <span>🛬 CHIỀU VỀ ({flight.inbound.depDate})</span>
                            <span className="chip" style={{ fontSize: 10.5 }}>{flight.inbound.stops}</span>
                          </div>
                          <div className="row between" style={{ margin: '6px 0' }}>
                            <div>
                              <b style={{ fontSize: 15 }}>{flight.inbound.depTime}</b>
                              <div className="small faint">SGN (Tân Sơn Nhất)</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <span className="small faint">{flight.inbound.duration}</span>
                              <div style={{ width: 80, height: 2, background: 'var(--teal-400)', margin: '2px auto' }} />
                              <span className="small faint" style={{ fontWeight: 600 }}>{flight.inbound.flightNo}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <b style={{ fontSize: 15 }}>{flight.inbound.arrTime}</b>
                              <div className="small faint">CDG (Paris)</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flight Notes & Safety Check */}
                      <div className="row between wrap small" style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                        <div className="row" style={{ gap: 6, color: '#166534' }}>
                          <L.CheckCircle2 size={14} color="#16a34a" />
                          <span>{flight.compatibility}</span>
                        </div>
                        <div className="faint">
                          Hạng vé: <b>{flight.cabinClass}</b> · Hành lý: <b>{flight.baggage}</b>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Workflow Footer Navigation */}
        <div style={{
          padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {step > 1 ? (
            <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>
              <L.ArrowLeft size={15} /> Quay lại
            </button>
          ) : (
            <button type="button" className="btn ghost" onClick={onClose}>
              Đóng
            </button>
          )}

          <div className="row" style={{ gap: 10 }}>
            {step < 4 ? (
              <button type="button" className="btn primary" onClick={() => setStep(step + 1)}>
                Tiếp tục sang Bước {step + 1} <L.ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                className="btn primary"
                style={{ background: '#d4712f', fontWeight: 700, padding: '8px 20px', gap: 8 }}
                onClick={handleCompleteAndConvertToDoc}
              >
                <L.FileCheck2 size={16} />
                Chuyển đổi dữ liệu vé sang Phiếu đề nghị đặt vé máy bay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
