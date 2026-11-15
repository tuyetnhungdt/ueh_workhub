import { useState, useMemo, useRef, useEffect } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { useToast, Modal, Avatar } from './ui.jsx'
import { TEMPLATES, extractAutoFillData, renderTemplateHtml } from '../modules/templateEngine.js'
import { exportDocx } from '../modules/docxExport.js'
import { cx, todayStr } from '../lib/utils.js'

export default function DocTemplateStudio({ initialTemplate = 'flightReq', initialItem = null, project, onClose }) {
  const { state, me, saveItem } = useStore()
  const toast = useToast()

  const allItems = useMemo(() => {
    return state.items.filter((x) => x.projectId === project?.id)
  }, [state.items, project?.id])

  const trips = useMemo(() => allItems.filter((x) => x.module === 'trips'), [allItems])
  const lecturers = useMemo(() => allItems.filter((x) => x.module === 'lecturers'), [allItems])

  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplate || 'flightReq')
  const [selectedSourceId, setSelectedSourceId] = useState(() => {
    if (initialItem?.id) return initialItem.id
    return trips[0]?.id || lecturers[0]?.id || 'custom'
  })
  const [activeTab, setActiveTab] = useState('autofill') // 'autofill' | 'blank'
  const [zoom, setZoom] = useState(90) // percentage
  const [isExporting, setIsExporting] = useState(false)

  // Dữ liệu nguồn được chọn
  const sourceItem = useMemo(() => {
    if (selectedSourceId === 'custom') return {}
    return allItems.find((x) => x.id === selectedSourceId) || initialItem || trips[0] || {}
  }, [selectedSourceId, allItems, initialItem, trips])

  // Trích xuất dữ liệu tự động từ source record
  const initialData = useMemo(() => {
    const auto = extractAutoFillData(sourceItem, allItems, state.users)
    const tmpl = TEMPLATES[selectedTemplateId] || TEMPLATES.flightReq
    return {
      ...auto,
      ...tmpl.defaultBlankFields,
      docDate: tmpl.defaultBlankFields?.docDate || todayStr().split('-').reverse().join('/'),
      creatorName: me.name || auto.creatorName,
    }
  }, [sourceItem, allItems, state.users, selectedTemplateId, me.name])

  // Form State có thể chỉnh sửa
  const [formData, setFormData] = useState(initialData)

  // Khi đổi template hoặc đổi nguồn dữ liệu, cập nhật formData
  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const currentTmpl = TEMPLATES[selectedTemplateId] || TEMPLATES.flightReq

  // HTML Render cho Preview
  const previewHtml = useMemo(() => {
    return renderTemplateHtml(selectedTemplateId, formData)
  }, [selectedTemplateId, formData])

  // Xử lý Xuất file Word (.docx)
  const handleExportWord = async () => {
    setIsExporting(true)
    try {
      const fileName = await exportDocx(selectedTemplateId, formData)
      toast(`Đã xuất file Word: ${fileName}`)
    } catch (err) {
      console.error(err)
      toast('Lỗi khi xuất file Word: ' + err.message)
    } finally {
      setIsExporting(false)
    }
  }

  // Xử lý Xuất PDF / In ấn
  const handlePrintPdf = () => {
    const printWin = window.open('', '_blank')
    if (!printWin) {
      alert('Vui lòng cho phép mở popup trên trình duyệt để in văn bản.')
      return
    }

    const htmlContent = `
      <!doctype html>
      <html lang="vi">
      <head>
        <meta charset="utf-8">
        <title>${currentTmpl.name} – ${formData.lecturerName || ''}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 13pt;
            color: #111;
            margin: 0;
            background: #fff;
            padding: 0;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 20mm 15mm 20mm 25mm; /* Chuẩn căn lề NĐ 30/2020 */
            background: #fff;
          }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12pt; }
          td, th { border: 1px solid #333; padding: 6px 8px; vertical-align: top; }
          @media print {
            body { margin: 0; padding: 0; }
            .page { width: 100%; min-height: auto; padding: 15mm 15mm 15mm 20mm; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${previewHtml}
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `
    printWin.document.write(htmlContent)
    printWin.document.close()
  }

  // Lưu văn bản trực tiếp vào module 'docs' của dự án
  const handleSaveToDocs = () => {
    const docTitle = `${currentTmpl.name} – ${formData.lecturerName || 'GV'}`
    const docData = {
      title: docTitle,
      docType: selectedTemplateId === 'missionOrder' ? 'Quyết định' : 'Kế hoạch',
      number: formData.docNumber || 'PĐN-2026',
      date: new Date().toISOString().slice(0, 10),
      partner: 'Université de Rennes',
      status: 'Chờ góp ý',
      owner: me.id,
      note: formData.notes || `Văn bản được tạo tự động từ Dynamic Template Studio cho giảng viên ${formData.lecturerName}.`,
      docComments: [
        {
          id: 'cm_auto_' + Date.now(),
          authorId: me.id,
          authorName: me.name,
          authorRole: me.title || 'Người lập biểu',
          text: `Đã tự động khởi tạo biểu mẫu “${currentTmpl.name}”. Kính chuyển các bên rà soát nội dung.`,
          createdAt: new Date().toISOString(),
          resolved: false,
          replies: []
        }
      ]
    }
    saveItem(project.id, 'docs', docData, `tạo biểu mẫu “${docTitle}”`)
    toast('Đã lưu biểu mẫu vào phân hệ Văn bản & Hồ sơ')
  }

  return (
    <div className="doc-studio-backdrop" style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div className="doc-studio-window" style={{
        background: '#f8fafc', borderRadius: 12, width: '96vw', maxWidth: 1360, height: '94vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
      }}>
        {/* Top Header */}
        <div style={{
          padding: '12px 18px', background: '#03616a', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
        }}>
          <div className="row" style={{ gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <L.FileCode2 size={20} color="#fff" />
            </div>
            <div>
              <b style={{ fontSize: 15, display: 'block', lineHeight: 1.2 }}>Dynamic Document Templates & Export Engine</b>
              <span className="small" style={{ opacity: 0.85, fontSize: 12 }}>Tự động điền dữ liệu · Tùy biến ô trống · Xuất file Word (.docx) & PDF chuẩn hành chính</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn sm"
              style={{ background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, gap: 6 }}
              onClick={handleExportWord}
              disabled={isExporting}
            >
              <L.Download size={14} />
              {isExporting ? 'Đang tạo .docx…' : 'Xuất Word (.docx)'}
            </button>

            <button
              type="button"
              className="btn sm"
              style={{ background: '#d4712f', color: '#fff', border: 'none', fontWeight: 600, gap: 6 }}
              onClick={handlePrintPdf}
            >
              <L.Printer size={14} />
              Xuất PDF / In ấn
            </button>

            <button
              type="button"
              className="btn sm"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', gap: 6 }}
              onClick={handleSaveToDocs}
              title="Lưu bản ghi này vào kho Văn bản & Hồ sơ của dự án"
            >
              <L.BookmarkPlus size={14} />
              Lưu vào Hồ sơ
            </button>

            <button
              type="button"
              className="iconbtn"
              style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: 30, height: 30 }}
              onClick={onClose}
              aria-label="Đóng"
            >
              <L.X size={16} />
            </button>
          </div>
        </div>

        {/* Studio Subbar (Template Selector + Auto-fill Source) */}
        <div style={{
          padding: '10px 18px', background: '#ffffff', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
        }}>
          <div className="row wrap" style={{ gap: 12, alignItems: 'center' }}>
            <div className="row" style={{ gap: 6, alignItems: 'center' }}>
              <span className="small faint" style={{ fontWeight: 600 }}>Biểu mẫu:</span>
              <select
                className="select sm"
                style={{ minWidth: 260, fontWeight: 600, color: 'var(--teal-900)' }}
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                {Object.values(TEMPLATES).map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name} ({tmpl.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="row" style={{ gap: 6, alignItems: 'center' }}>
              <span className="small faint" style={{ fontWeight: 600 }}>Nguồn Auto-fill:</span>
              <select
                className="select sm"
                style={{ minWidth: 260 }}
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
              >
                <optgroup label="Chuyến công tác giảng viên (trips)">
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.lecturer} – {t.course} ({t.teachFrom?.slice(5) || 'HK2'})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Hồ sơ Giảng viên (lecturers)">
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.fullName} ({l.side || 'Rennes'})
                    </option>
                  ))}
                </optgroup>
                <option value="custom">✏️ Nhập tự do / Thủ công</option>
              </select>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="row" style={{ gap: 6, alignItems: 'center' }}>
            <span className="small faint">Thu phóng:</span>
            <button type="button" className={cx('btn sm', zoom === 75 && 'primary')} onClick={() => setZoom(75)} style={{ padding: '2px 8px', fontSize: 11 }}>75%</button>
            <button type="button" className={cx('btn sm', zoom === 90 && 'primary')} onClick={() => setZoom(90)} style={{ padding: '2px 8px', fontSize: 11 }}>90%</button>
            <button type="button" className={cx('btn sm', zoom === 100 && 'primary')} onClick={() => setZoom(100)} style={{ padding: '2px 8px', fontSize: 11 }}>100%</button>
          </div>
        </div>

        {/* Main Body: 2 Columns */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '400px 1fr', minHeight: 0, overflow: 'hidden' }}>
          
          {/* CỘT TRÁI: FORM ĐIỀU KHIỂN & CHỈNH SỬA TRƯỜNG DỮ LIỆU */}
          <div style={{
            background: '#ffffff', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minHeight: 0
          }}>
            {/* Tabs chọn loại trường */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
              <button
                type="button"
                className={cx('btn sm ghost', activeTab === 'autofill' && 'primary')}
                style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'autofill' ? '2px solid var(--teal-700)' : 'none', fontWeight: 600, padding: '10px 6px', fontSize: 12.5 }}
                onClick={() => setActiveTab('autofill')}
              >
                <L.Sparkles size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
                Dữ liệu tự động (Auto-fill)
              </button>
              <button
                type="button"
                className={cx('btn sm ghost', activeTab === 'blank' && 'primary')}
                style={{ flex: 1, borderRadius: 0, borderBottom: activeTab === 'blank' ? '2px solid var(--teal-700)' : 'none', fontWeight: 600, padding: '10px 6px', fontSize: 12.5 }}
                onClick={() => setActiveTab('blank')}
              >
                <L.PenLine size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
                Ô trống & Ký duyệt (Blank)
              </button>
            </div>

            {/* Form Fields Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeTab === 'autofill' ? (
                <>
                  <div className="small faint" style={{ background: '#e1f1f2', color: '#03616a', padding: '6px 10px', borderRadius: 6, lineHeight: 1.4 }}>
                    <L.Info size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                    Các trường dưới đây được <b>tự động trích xuất</b> từ chuyến công tác hoặc hồ sơ giảng viên. Bạn có thể sửa trực tiếp để văn bản cập nhật tức thì.
                  </div>

                  <div className="field">
                    <label className="small faint" style={{ fontWeight: 600 }}>Họ và tên giảng viên</label>
                    <input className="input sm" value={formData.lecturerName || ''} onChange={(e) => setField('lecturerName', e.target.value)} />
                  </div>

                  <div className="row" style={{ gap: 8 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="small faint" style={{ fontWeight: 600 }}>Chức danh / Học vị</label>
                      <input className="input sm" value={formData.lecturerTitle || ''} onChange={(e) => setField('lecturerTitle', e.target.value)} />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="small faint" style={{ fontWeight: 600 }}>Số hộ chiếu (Passport)</label>
                      <input className="input sm" value={formData.passport || ''} onChange={(e) => setField('passport', e.target.value)} />
                    </div>
                  </div>

                  <div className="field">
                    <label className="small faint" style={{ fontWeight: 600 }}>Học phần giảng dạy</label>
                    <input className="input sm" value={formData.courseName || ''} onChange={(e) => setField('courseName', e.target.value)} />
                  </div>

                  <div className="row" style={{ gap: 8 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="small faint" style={{ fontWeight: 600 }}>Lớp / Khóa</label>
                      <input className="input sm" value={formData.className || ''} onChange={(e) => setField('className', e.target.value)} />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="small faint" style={{ fontWeight: 600 }}>Số giờ giảng</label>
                      <input className="input sm" type="number" value={formData.teachHours || 0} onChange={(e) => setField('teachHours', +e.target.value)} />
                    </div>
                  </div>

                  <div className="row" style={{ gap: 8 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="small faint" style={{ fontWeight: 600 }}>Thời gian từ ngày</label>
                      <input className="input sm" value={formData.teachFrom || ''} onChange={(e) => setField('teachFrom', e.target.value)} />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="small faint" style={{ fontWeight: 600 }}>Đến ngày</label>
                      <input className="input sm" value={formData.teachTo || ''} onChange={(e) => setField('teachTo', e.target.value)} />
                    </div>
                  </div>

                  {/* Chi tiết theo từng template */}
                  {selectedTemplateId === 'flightReq' && (
                    <>
                      <div className="field">
                        <label className="small faint" style={{ fontWeight: 600 }}>Hành trình bay</label>
                        <input className="input sm" value={formData.flightRoute || ''} onChange={(e) => setField('flightRoute', e.target.value)} />
                      </div>
                      <div className="row" style={{ gap: 8 }}>
                        <div className="field" style={{ flex: 1 }}>
                          <label className="small faint" style={{ fontWeight: 600 }}>Chuyến bay chiều đi</label>
                          <input className="input sm" value={formData.outFlight || ''} onChange={(e) => setField('outFlight', e.target.value)} />
                        </div>
                        <div className="field" style={{ flex: 1 }}>
                          <label className="small faint" style={{ fontWeight: 600 }}>Ngày & giờ đến SGN</label>
                          <input className="input sm" value={formData.arriveAt || ''} onChange={(e) => setField('arriveAt', e.target.value)} />
                        </div>
                      </div>
                      <div className="row" style={{ gap: 8 }}>
                        <div className="field" style={{ flex: 1 }}>
                          <label className="small faint" style={{ fontWeight: 600 }}>Chuyến bay chiều về</label>
                          <input className="input sm" value={formData.returnFlight || ''} onChange={(e) => setField('returnFlight', e.target.value)} />
                        </div>
                        <div className="field" style={{ flex: 1 }}>
                          <label className="small faint" style={{ fontWeight: 600 }}>Dự toán vé máy bay (VNĐ)</label>
                          <input className="input sm" type="number" value={formData.ticketCost || 0} onChange={(e) => setField('ticketCost', +e.target.value)} />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedTemplateId === 'hotelReq' && (
                    <>
                      <div className="field">
                        <label className="small faint" style={{ fontWeight: 600 }}>Tên khách sạn</label>
                        <input className="input sm" value={formData.hotelName || ''} onChange={(e) => setField('hotelName', e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="small faint" style={{ fontWeight: 600 }}>Địa chỉ khách sạn</label>
                        <input className="input sm" value={formData.hotelAddress || ''} onChange={(e) => setField('hotelAddress', e.target.value)} />
                      </div>
                      <div className="row" style={{ gap: 8 }}>
                        <div className="field" style={{ flex: 1 }}>
                          <label className="small faint" style={{ fontWeight: 600 }}>Ngày Check-in</label>
                          <input className="input sm" value={formData.checkIn || ''} onChange={(e) => setField('checkIn', e.target.value)} />
                        </div>
                        <div className="field" style={{ flex: 1 }}>
                          <label className="small faint" style={{ fontWeight: 600 }}>Ngày Check-out</label>
                          <input className="input sm" value={formData.checkOut || ''} onChange={(e) => setField('checkOut', e.target.value)} />
                        </div>
                        <div className="field" style={{ width: 80 }}>
                          <label className="small faint" style={{ fontWeight: 600 }}>Số đêm</label>
                          <input className="input sm" type="number" value={formData.nights || 1} onChange={(e) => setField('nights', +e.target.value)} />
                        </div>
                      </div>
                      <div className="field">
                        <label className="small faint" style={{ fontWeight: 600 }}>Dự toán tiền phòng (VNĐ)</label>
                        <input className="input sm" type="number" value={formData.hotelCost || 0} onChange={(e) => setField('hotelCost', +e.target.value)} />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="small faint" style={{ background: '#fff4e0', color: '#b45309', padding: '6px 10px', borderRadius: 6, lineHeight: 1.4 }}>
                    <L.AlertCircle size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                    Các <b>ô trống tự nhập (Blank fields)</b> cho nhân sự phụ trách điền thêm số văn bản, người ký duyệt và các điều khoản bổ sung trước khi xuất file.
                  </div>

                  <div className="row" style={{ gap: 8 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="small faint" style={{ fontWeight: 600 }}>Số văn bản / Ký hiệu</label>
                      <input className="input sm" placeholder="VD: 1152/PĐN-ISB-2026" value={formData.docNumber || ''} onChange={(e) => setField('docNumber', e.target.value)} />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="small faint" style={{ fontWeight: 600 }}>Ngày lập văn bản</label>
                      <input className="input sm" placeholder="ngày … tháng … năm 2026" value={formData.docDate || ''} onChange={(e) => setField('docDate', e.target.value)} />
                    </div>
                  </div>

                  <div className="field">
                    <label className="small faint" style={{ fontWeight: 600 }}>Người ký duyệt (Lãnh đạo đơn vị)</label>
                    <input className="input sm" placeholder="VD: TS. Lê Đạt Chí" value={formData.signatoryName || ''} onChange={(e) => setField('signatoryName', e.target.value)} />
                  </div>

                  <div className="field">
                    <label className="small faint" style={{ fontWeight: 600 }}>Chức vụ người ký</label>
                    <input className="input sm" placeholder="VD: Trưởng Khoa Tài chính" value={formData.signatoryTitle || ''} onChange={(e) => setField('signatoryTitle', e.target.value)} />
                  </div>

                  <div className="row" style={{ gap: 8 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="small faint" style={{ fontWeight: 600 }}>Người lập phiếu</label>
                      <input className="input sm" value={formData.creatorName || ''} onChange={(e) => setField('creatorName', e.target.value)} />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label className="small faint" style={{ fontWeight: 600 }}>Người kiểm tra (BĐH)</label>
                      <input className="input sm" value={formData.verifierName || ''} onChange={(e) => setField('verifierName', e.target.value)} />
                    </div>
                  </div>

                  {selectedTemplateId === 'flightReq' && (
                    <>
                      <div className="field">
                        <label className="small faint" style={{ fontWeight: 600 }}>Tiêu chuẩn hành lý</label>
                        <input className="input sm" value={formData.baggageAllowance || ''} onChange={(e) => setField('baggageAllowance', e.target.value)} />
                      </div>
                      <div className="row" style={{ gap: 8 }}>
                        <div className="field" style={{ flex: 1 }}>
                          <label className="small faint" style={{ fontWeight: 600 }}>Chỗ ngồi ưu tiên</label>
                          <input className="input sm" value={formData.seatPreference || ''} onChange={(e) => setField('seatPreference', e.target.value)} />
                        </div>
                        <div className="field" style={{ flex: 1 }}>
                          <label className="small faint" style={{ fontWeight: 600 }}>Chế độ ăn</label>
                          <input className="input sm" value={formData.dietPreference || ''} onChange={(e) => setField('dietPreference', e.target.value)} />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedTemplateId === 'hotelReq' && (
                    <>
                      <div className="field">
                        <label className="small faint" style={{ fontWeight: 600 }}>Mã xác nhận đặt phòng (Booking Ref)</label>
                        <input className="input sm" placeholder="VD: NOV-UEH-RN26" value={formData.bookingCode || ''} onChange={(e) => setField('bookingCode', e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="small faint" style={{ fontWeight: 600 }}>Hướng dẫn thanh toán / Hóa đơn</label>
                        <textarea className="textarea sm" rows={2} value={formData.billingInstruction || ''} onChange={(e) => setField('billingInstruction', e.target.value)} />
                      </div>
                    </>
                  )}

                  <div className="field">
                    <label className="small faint" style={{ fontWeight: 600 }}>Ghi chú bổ sung / Yêu cầu đặc biệt</label>
                    <textarea className="textarea sm" rows={3} placeholder="Ghi chú thêm cho đại lý, khách sạn hoặc kế toán..." value={formData.notes || ''} onChange={(e) => setField('notes', e.target.value)} />
                  </div>

                  <div className="field">
                    <label className="small faint" style={{ fontWeight: 600 }}>Nơi nhận văn bản</label>
                    <input className="input sm" value={formData.recipients || ''} onChange={(e) => setField('recipients', e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: KHUNG XEM TRƯỚC BẢN HOÀN THIỆN (A4 REALISTIC PREVIEW) */}
          <div style={{
            background: '#e2e8f0', overflowY: 'auto', overflowX: 'auto', padding: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{
              width: '210mm',
              minHeight: '297mm',
              background: '#ffffff',
              padding: '20mm 15mm 20mm 25mm',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
              fontFamily: "'Times New Roman', Times, serif",
              color: '#111',
              position: 'relative'
            }}>
              {/* Nội dung render thực tế của văn bản */}
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
