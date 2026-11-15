import React from 'react'
import * as L from 'lucide-react'
import { Icon } from './ui.jsx'
import { STATUS_TONE, getLegalRank } from '../modules/schema.js'

/**
 * Giao diện Bàn làm việc (Workspace Dashboard) chuyên biệt cho:
 * "Xây dựng Đề án Thành lập Quỹ Đầu tư Mạo hiểm tỉnh Gia Lai / Khánh Hòa"
 * Thay thế hoàn toàn cấu trúc Rennes, hiển thị chuẩn xác 8 Phân hệ chuyên biệt.
 */
export default function GiaLaiDashboard({
  project,
  items = [],
  nav,
  onOpenFlightWorkflow,
  onOpenDocStudio,
}) {
  // Lọc items theo từng phân hệ
  const docs = items.filter((x) => x.module === 'gl_docs')
  const surveys = items.filter((x) => x.module === 'gl_surveys')
  const drafts = items.filter((x) => x.module === 'gl_drafts')
  const meetings = items.filter((x) => x.module === 'gl_meetings')
  const trips = items.filter((x) => x.module === 'gl_trips')
  const experts = items.filter((x) => x.module === 'gl_experts')
  const legalLib = items.filter((x) => x.module === 'gl_legal_lib')
  const finance = items.filter((x) => x.module === 'gl_finance')

  // Helper đếm trạng thái
  const countStatus = (list, key, val) => list.filter((r) => r[key] === val).length

  // Thống kê nhanh từng Card theo đúng yêu cầu
  const stats01 = [
    { label: 'Đã ký', count: countStatus(docs, 'status', 'Đã ký'), tone: 'ok' },
    { label: 'Đang phúc đáp', count: countStatus(docs, 'status', 'Đang phúc đáp'), tone: 'warn' },
    { label: 'Chờ ý kiến Sở ngành', count: countStatus(docs, 'status', 'Chờ ý kiến Sở ngành'), tone: 'danger' },
  ]
  const pendingDocsCount = countStatus(docs, 'status', 'Chờ ý kiến Sở ngành')

  const stats02 = [
    { label: 'Đã gửi phiếu', count: countStatus(surveys, 'status', 'Đã gửi phiếu'), tone: 'info' },
    { label: 'Đã nhận số liệu', count: countStatus(surveys, 'status', 'Đã nhận số liệu'), tone: 'ok' },
    { label: 'Cần thu thập thêm', count: countStatus(surveys, 'status', 'Cần thu thập thêm'), tone: 'warn' },
  ]
  const pendingSurveysCount = countStatus(surveys, 'status', 'Cần thu thập thêm')

  const stats03 = [
    { label: 'Bản thảo', count: countStatus(drafts, 'status', 'Bản thảo'), tone: 'muted' },
    { label: 'Đang phản biện', count: countStatus(drafts, 'status', 'Đang phản biện'), tone: 'warn' },
    { label: 'Bản hoàn thiện', count: countStatus(drafts, 'status', 'Bản hoàn thiện'), tone: 'ok' },
  ]
  const pendingDraftsCount = countStatus(drafts, 'status', 'Đang phản biện')

  const stats04 = [
    { label: 'Sắp diễn ra', count: countStatus(meetings, 'status', 'Sắp diễn ra'), tone: 'warn' },
    { label: 'Đã hoàn thành', count: countStatus(meetings, 'status', 'Đã hoàn thành'), tone: 'ok' },
    { label: 'Có biên bản họp', count: countStatus(meetings, 'status', 'Có biên bản họp'), tone: 'ok' },
  ]
  const upcomingMeetingsCount = countStatus(meetings, 'status', 'Sắp diễn ra')

  const stats05 = [
    { label: 'Chờ duyệt vé', count: countStatus(trips, 'status', 'Chờ duyệt vé'), tone: 'warn' },
    { label: 'Đã đặt', count: countStatus(trips, 'status', 'Đã đặt'), tone: 'info' },
    { label: 'Quyết toán xong', count: countStatus(trips, 'status', 'Quyết toán xong'), tone: 'ok' },
  ]
  const pendingTripsCount = countStatus(trips, 'status', 'Chờ duyệt vé')

  const stats06 = [
    { label: 'Đúng hạn', count: countStatus(experts, 'status', 'Đúng hạn'), tone: 'ok' },
    { label: 'Cần đôn đốc', count: countStatus(experts, 'status', 'Cần đôn đốc'), tone: 'danger' },
  ]
  const pendingExpertsCount = countStatus(experts, 'status', 'Cần đôn đốc')

  const legalDocsCount = legalLib.filter((x) => x.docGroup === 'Văn bản pháp lý các cấp' || getLegalRank(x) < 100).length
  const refDocsCount = legalLib.length - legalDocsCount

  const stats07 = [
    { label: 'Văn bản pháp lý', count: legalDocsCount, tone: 'ok' },
    { label: 'Tài liệu tham khảo', count: refDocsCount, tone: 'info' },
  ]

  const stats08 = [
    { label: 'Đã chi', count: countStatus(finance, 'status', 'Đã chi'), tone: 'ok' },
    { label: 'Đang giải ngân', count: countStatus(finance, 'status', 'Đang giải ngân'), tone: 'info' },
    { label: 'Chứng từ chờ duyệt', count: countStatus(finance, 'status', 'Chứng từ chờ duyệt'), tone: 'warn' },
  ]
  const pendingFinanceCount = countStatus(finance, 'status', 'Chứng từ chờ duyệt')

  // Cấu hình 6 Cards tinh gọn sau khi gộp các hạng mục trùng
  const cards = [
    {
      id: 'gl_docs',
      no: 'Card 01',
      title: 'Văn bản & Thư viện Pháp lý',
      icon: 'FileText',
      iconBg: '#e0f2fe',
      iconColor: '#0284c7',
      totalCount: docs.length + legalLib.length,
      unit: 'văn bản',
      content: 'Công văn đi/đến (Sở KH&CN, Sở Tài chính), Tờ trình, Quyết định và Thư viện quy phạm pháp lý (Luật, Nghị định, Nghị quyết, tài liệu tham khảo).',
      attentionBadge: pendingDocsCount > 0 ? { text: `${pendingDocsCount} Chờ ý kiến Sở ngành`, type: 'danger' } : null,
      stats: [
        { label: 'VB sở ngành', count: docs.length, tone: 'info' },
        { label: 'VB pháp lý', count: legalDocsCount, tone: 'ok' },
        { label: 'Tài liệu tham khảo', count: refDocsCount, tone: 'muted' },
      ],
      highlights: [
        { label: '0440/QĐ-TTKPKH', sub: 'Quyết định giao nhiệm vụ Đề án', status: 'Đã ký' },
        { label: 'Luật DN 59 & NĐ 365, 366', sub: 'Khung pháp lý Quỹ ĐTMH (Luật → NĐ)', status: 'Văn bản pháp lý' },
        { label: '11578/STC-DNKTTT', sub: 'Sở Tài chính góp ý vốn mồi', status: 'Chờ ý kiến' },
      ],
      customAction: {
        label: 'Mẫu biểu Word/PDF',
        icon: 'FileSignature',
        onClick: (e) => {
          e.stopPropagation()
          onOpenDocStudio && onOpenDocStudio({ template: 'missionOrder' })
        },
      },
    },
    {
      id: 'gl_surveys',
      no: 'Card 02',
      title: 'Khảo sát & Dữ liệu Đầu vào',
      icon: 'Database',
      iconBg: '#f3e8ff',
      iconColor: '#7c3aed',
      totalCount: surveys.length,
      unit: 'bộ số liệu',
      content: 'Báo cáo số liệu các sở ngành gửi lại Sở KH&CN, chỉ số PII, báo cáo KTXH Gia Lai, số liệu DN & HTX.',
      attentionBadge: pendingSurveysCount > 0 ? { text: `${pendingSurveysCount} Cần thu thập thêm`, type: 'warn' } : null,
      stats: stats02,
      highlights: [
        { label: 'PII-GL-2026', sub: '52 chỉ số ĐMST địa phương PII', status: 'Đã nhận số liệu' },
        { label: 'KS-DN-01', sub: '120 DN & HTX (thu 48 phiếu)', status: 'Đã gửi phiếu' },
        { label: 'CD-TN-A13', sub: 'Cổ đông tư nhân A1-A3', status: 'Cần thu thập thêm' },
      ],
    },
    {
      id: 'gl_drafts',
      no: 'Card 03',
      title: 'Soạn thảo & Biên tập Đề án',
      icon: 'BookOpenCheck',
      iconBg: '#ccfbf1',
      iconColor: '#0f766e',
      totalCount: drafts.length,
      unit: 'bản thảo',
      content: 'Phiên bản đề cương, Dự thảo Đề án v1.0, v6.3, Bản tóm tắt rút gọn, Bản chuẩn format UEH và liên kết Google Docs.',
      attentionBadge: pendingDraftsCount > 0 ? { text: `${pendingDraftsCount} Đang phản biện`, type: 'warn' } : null,
      stats: stats03,
      highlights: [
        { label: 'DA-GL-v1.0', sub: 'Dự thảo Đề án v1.0 tích hợp (Docs)', status: 'Bản thảo' },
        { label: 'REF-HCM-v6.3', sub: 'Đề án Quỹ TP.HCM v6.3 tham khảo (Docs)', status: 'Bản hoàn thiện' },
        { label: 'PUB-UEH-STD', sub: 'Thuyết minh định dạng chuẩn UEH (Docs)', status: 'Bản hoàn thiện' },
      ],
    },
    {
      id: 'gl_meetings',
      no: 'Card 04',
      title: 'Lịch làm việc & Đoàn công tác',
      icon: 'CalendarClock',
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
      totalCount: meetings.length + trips.length,
      unit: 'sự kiện / đợt',
      content: 'Lịch làm việc trực tiếp tại Tỉnh, Hội thảo tham vấn chuyên gia và Hậu cần công tác Pleiku (vé máy bay, khách sạn, xe đưa đón).',
      attentionBadge: (upcomingMeetingsCount + pendingTripsCount) > 0 ? { text: `${upcomingMeetingsCount + pendingTripsCount} Cần xử lý`, type: 'info' } : null,
      stats: [
        { label: 'Họp & Hội thảo', count: meetings.length, tone: 'ok' },
        { label: 'Đoàn công tác', count: trips.length, tone: 'info' },
        { label: 'Chờ duyệt vé / Sắp tới', count: upcomingMeetingsCount + pendingTripsCount, tone: 'warn' },
      ],
      highlights: [
        { label: 'UBND Tỉnh (21/11)', sub: 'Làm việc trực tiếp tại TP. Pleiku', status: 'Sắp diễn ra' },
        { label: 'Đoàn Đ2 Pleiku', sub: 'Làm việc UBND Tỉnh 20–22/11', status: 'Đã đặt' },
        { label: 'Đoàn Đ3 Pleiku', sub: 'Tham dự Hội thảo tham vấn', status: 'Chờ duyệt vé' },
      ],
      customAction: {
        label: 'Vé máy bay Pleiku',
        icon: 'Plane',
        onClick: (e) => {
          e.stopPropagation()
          onOpenFlightWorkflow && onOpenFlightWorkflow()
        },
      },
    },
    {
      id: 'gl_experts',
      no: 'Card 05',
      title: 'Nhóm Chuyên gia & Phân công Biên soạn',
      icon: 'UsersRound',
      iconBg: '#fae8ff',
      iconColor: '#c026d3',
      totalCount: experts.length,
      unit: 'chuyên gia',
      content: 'Danh sách chuyên gia tư vấn UEH, phân công phụ trách phần đề án: Cơ sở pháp lý, Mô hình vận hành quỹ, Cơ chế thoái vốn...',
      attentionBadge: pendingExpertsCount > 0 ? { text: `${pendingExpertsCount} Cần đôn đốc`, type: 'danger' } : null,
      stats: stats06,
      highlights: [
        { label: 'TS. Tô Công Nguyên Bảo', sub: 'Chủ trì chung & Tờ trình (85%)', status: 'Đúng hạn' },
        { label: 'ThS. Nguyễn Hồng Nhung', sub: 'Nguồn vốn & Phân bổ (90%)', status: 'Đúng hạn' },
        { label: 'ThS. Đỗ Thị Quyên', sub: 'KTXH & Chỉ số PII (65%)', status: 'Cần đôn đốc' },
      ],
    },
    {
      id: 'gl_finance',
      no: 'Card 06',
      title: 'Chi phí & Quyết toán Hợp đồng Tư vấn',
      icon: 'Calculator',
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
      totalCount: finance.length,
      unit: 'khoản chi',
      content: 'Tạm ứng, thù lao viết chuyên đề, công tác phí khảo sát, hồ sơ thanh quyết toán với Sở KH&CN.',
      attentionBadge: pendingFinanceCount > 0 ? { text: `${pendingFinanceCount} Chứng từ chờ duyệt`, type: 'warn' } : null,
      stats: stats08,
      highlights: [
        { label: 'Tạm ứng Đ1 (30%)', sub: '135.000.000 đ qua Kho bạc Gia Lai', status: 'Đã chi' },
        { label: 'Thù lao 05 chuyên đề', sub: '180.000.000 đ theo tiến độ nộp', status: 'Đang giải ngân' },
        { label: 'Công tác phí Pleiku Đ2', sub: '26.500.000 đ vé máy bay & KS', status: 'Chứng từ chờ duyệt' },
      ],
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Tiêu đề Phân hệ */}
      <div className="row between" style={{ alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text)' }}>
          6 Phân hệ Bàn làm việc Dự án Đầu tư mạo hiểm Gia Lai
        </h2>
      </div>

      {/* Grid 8 Cards Bàn làm việc */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 16,
        }}
      >
        {cards.map((c, index) => {
          return (
            <div
              key={c.id}
              className="card"
              onClick={() => nav(c.id)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px 22px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                position: 'relative',
                background: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 118, 110, 0.12)'
                e.currentTarget.style.borderColor = 'var(--teal-300)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <div>
                {/* Header Card: Card No, Title, Icon, Count */}
                <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
                  <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: c.iconBg,
                        color: c.iconColor,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        fontSize: 16,
                        fontWeight: 800,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text)', lineHeight: 1.3 }}>
                        {c.title}
                      </h3>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--teal-800)', lineHeight: 1 }}>
                      {c.totalCount}
                    </div>
                    <div className="small faint" style={{ fontSize: 11 }}>
                      {c.unit}
                    </div>
                  </div>
                </div>

                {/* Highlights Preview */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '8px 12px',
                    border: '1px solid #f1f5f9',
                    marginBottom: 14,
                  }}
                >
                  <div className="small faint" style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>
                    Hồ sơ tiêu biểu
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {c.highlights.map((h, idx) => (
                      <div key={idx} className="row between" style={{ fontSize: 12, alignItems: 'center' }}>
                        <span className="grow ellipsis" style={{ color: 'var(--text)', fontWeight: 400 }} title={h.sub}>
                          • {h.label}: <span className="muted">{h.sub}</span>
                        </span>
                        <span
                          className={`pill pill-${STATUS_TONE[h.status] || 'muted'}`}
                          style={{ fontSize: 10, padding: '1px 6px', flexShrink: 0, marginLeft: 8 }}
                        >
                          {h.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Card: Thống kê nhanh theo yêu cầu & CTA */}
              <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <div className="row wrap between" style={{ alignItems: 'center', gap: 6 }}>
                  <div className="row wrap" style={{ gap: 6 }}>
                    {c.stats.map((st, i) => (
                      <span
                        key={i}
                        className={`pill pill-${st.tone}`}
                        style={{
                          fontSize: 11,
                          padding: '3px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 500,
                        }}
                      >
                        <span>{st.label}:</span>
                        <b>{st.count}</b>
                      </span>
                    ))}
                  </div>

                  <div className="row" style={{ gap: 6 }}>
                    {c.customAction && (
                      <button
                        type="button"
                        className="btn sm"
                        style={{
                          fontSize: 11,
                          padding: '3px 9px',
                          background: '#fff7ed',
                          color: '#c2410c',
                          borderColor: '#fed7aa',
                          fontWeight: 700,
                        }}
                        onClick={c.customAction.onClick}
                        title="Mở công cụ đặt vé máy bay SGN-PXU"
                      >
                        <L.Plane size={13} />
                        {c.customAction.label}
                      </button>
                    )}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--teal-700)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      Mở <L.ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
