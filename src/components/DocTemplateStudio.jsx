import { useState, useMemo, useEffect, useRef } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { useToast } from './ui.jsx'
import { TEMPLATES, extractAutoFillData, renderTemplateHtml, templateDefaults } from '../modules/templateEngine.js'
import { exportDocx } from '../modules/docxExport.js'
import { FormSection, FieldCell, SmartInput, RowsInput, packRows, validate, hintOf } from './SmartForm.jsx'
import { cx, todayStr } from '../lib/utils.js'

const PAGE_SOFT = '<!--PAGE-->'
const PAGE_HARD = '<!--NEWPAGE-->'
const splitPages = (html) => html.split(/<!--(?:NEW)?PAGE-->/).map((x) => x.trim()).filter(Boolean)
const printable = (html) => html.split(PAGE_HARD).join('<div style="page-break-before:always"></div>').split(PAGE_SOFT).join('')

const PRINT_CSS = `
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; color: #111; margin: 0; background: #fff; }
  .page { width: 210mm; margin: 0 auto; padding: 20mm 15mm 20mm 25mm; }
  .tf-empty { color: #111; }
  @page { size: A4; margin: 0; }
  @media print { .page { width: auto; padding: 18mm 15mm 18mm 25mm; } }
`

export default function DocTemplateStudio({ initialTemplate = 'flightReq', initialItem = null, project, onClose }) {
  const { state, me, saveItem } = useStore()
  const toast = useToast()

  const allItems = useMemo(() => state.items.filter((x) => x.projectId === project?.id), [state.items, project?.id])
  const trips = useMemo(() => allItems.filter((x) => x.module === 'trips'), [allItems])
  const lecturers = useMemo(() => allItems.filter((x) => x.module === 'lecturers'), [allItems])

  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[initialTemplate] ? initialTemplate : 'flightReq')
  const [selectedSourceId, setSelectedSourceId] = useState(() => initialItem?.id || trips[0]?.id || lecturers[0]?.id || 'custom')
  const [zoom, setZoom] = useState(90)
  const [isExporting, setIsExporting] = useState(false)
  const [focusKey, setFocusKey] = useState(null)
  const [touched, setTouched] = useState({})
  const previewRef = useRef(null)

  const currentTmpl = TEMPLATES[selectedTemplateId] || TEMPLATES.flightReq

  const sourceItem = useMemo(() => {
    if (selectedSourceId === 'custom') return {}
    return allItems.find((x) => x.id === selectedSourceId) || initialItem || trips[0] || {}
  }, [selectedSourceId, allItems, initialItem, trips])

  const initialData = useMemo(() => {
    const auto = extractAutoFillData(sourceItem, allItems, state.users)
    return templateDefaults(selectedTemplateId, auto, { today: todayStr(), meName: me.name })
  }, [sourceItem, allItems, state.users, selectedTemplateId, me.name])

  const [formData, setFormData] = useState(initialData)
  useEffect(() => { setFormData(initialData); setTouched({}) }, [initialData])
  const setField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }))

  const sections = currentTmpl.form || []
  const allFields = sections.flatMap((s) => s.fields)
  const labelOf = (k) => allFields.find((x) => x.k === k)?.label || k
  const errs = {}
  for (const fd of allFields) { const e = validate(fd, formData[fd.k], formData, labelOf); if (e) errs[fd.k] = e }
  const errCount = Object.keys(errs).length

  const previewHtml = useMemo(() => renderTemplateHtml(selectedTemplateId, formData), [selectedTemplateId, formData])
  const pages = useMemo(() => splitPages(previewHtml), [previewHtml])

  // Ô đang nhập → tô sáng & cuộn tới vị trí tương ứng trong văn bản
  useEffect(() => {
    if (!focusKey || !previewRef.current) return
    const el = previewRef.current.querySelector(`[data-f="${focusKey}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusKey, selectedTemplateId])

  // Bấm vào giá trị trong văn bản → nhảy tới ô nhập liệu
  const onPreviewClick = (e) => {
    const k = e.target.closest?.('[data-f]')?.getAttribute('data-f')
    if (!k) return
    const cell = document.querySelector(`.ds-form [data-field="${k}"]`)
    if (!cell) return
    cell.scrollIntoView({ behavior: 'smooth', block: 'center' })
    cell.classList.remove('flash'); void cell.offsetWidth; cell.classList.add('flash')
    cell.querySelector('input,select,textarea')?.focus({ preventScroll: true })
    setFocusKey(k)
  }

  const docBaseName = () => (currentTmpl.fileName ? currentTmpl.fileName(formData) : `${selectedTemplateId}_${(formData.lecturerName || 'GV').replace(/\s+/g, '_')}`)

  const handleExportWord = async () => {
    if (errCount) toast(`Lưu ý: còn ${errCount} ô chưa hợp lệ`)
    setIsExporting(true)
    try {
      if (currentTmpl.render) {
        // Mẫu dựng từ file gốc: xuất Word giữ nguyên bố cục (HTML → .doc)
        const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${currentTmpl.name}</title>
          <style>@page WordSection1{size:21cm 29.7cm;margin:2cm 1.5cm 2cm 2.5cm} div.WordSection1{page:WordSection1} body{font-family:'Times New Roman';font-size:13pt} .tf-empty{color:#111}</style></head>
          <body><div class="WordSection1">${printable(previewHtml).replace(/<div style="page-break-before:always"><\/div>/g, '<br clear=all style="page-break-before:always">')}</div></body></html>`
        const blob = new Blob(['﻿', html], { type: 'application/msword' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = docBaseName() + '.doc'
        a.click()
        setTimeout(() => URL.revokeObjectURL(a.href), 2000)
        toast(`Đã xuất file Word: ${a.download}`)
      } else {
        const fileName = await exportDocx(selectedTemplateId, formData)
        toast(`Đã xuất file Word: ${fileName}`)
      }
    } catch (err) {
      console.error(err)
      toast('Lỗi khi xuất file Word: ' + err.message)
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrintPdf = () => {
    const printWin = window.open('', '_blank')
    if (!printWin) { alert('Vui lòng cho phép mở popup trên trình duyệt để in văn bản.'); return }
    printWin.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${docBaseName()}</title><style>${PRINT_CSS}</style></head>
      <body><div class="page">${printable(previewHtml)}</div><script>window.onload=function(){window.print()}<\/script></body></html>`)
    printWin.document.close()
  }

  const handleSaveToDocs = () => {
    const docTitle = currentTmpl.titleOf ? currentTmpl.titleOf(formData) : `${currentTmpl.name} – ${formData.lecturerName || 'GV'}`
    saveItem(project.id, 'docs', {
      title: docTitle,
      docType: selectedTemplateId === 'missionOrder' ? 'Quyết định' : selectedTemplateId === 'contractInfo' ? 'Khác' : 'Kế hoạch',
      number: formData.docNumber || formData.contractNo || '',
      date: new Date().toISOString().slice(0, 10),
      partner: 'Université de Rennes',
      status: 'Chờ góp ý',
      owner: me.id,
      note: formData.notes || `Văn bản tạo từ mẫu “${currentTmpl.name}”.`,
      docComments: [{
        id: 'cm_auto_' + Date.now(), authorId: me.id, authorName: me.name, authorRole: me.title || 'Người lập biểu',
        text: `Đã khởi tạo biểu mẫu “${currentTmpl.name}”. Kính chuyển các bên rà soát nội dung.`,
        createdAt: new Date().toISOString(), resolved: false, replies: [],
      }],
    }, `tạo biểu mẫu “${docTitle}”`)
    toast('Đã lưu biểu mẫu vào phân hệ Văn bản & Hồ sơ')
  }

  const resetForm = () => { setFormData(initialData); setTouched({}); toast('Đã khôi phục dữ liệu mặc định của mẫu') }

  const categories = useMemo(() => {
    const g = {}
    for (const t of Object.values(TEMPLATES)) (g[t.category] ||= []).push(t)
    return Object.entries(g)
  }, [])

  return (
    <div className="doc-studio-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="doc-studio-window" style={{ background: '#f8fafc', borderRadius: 12, width: '97vw', maxWidth: 1600, height: '95vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}>
        {/* Header */}
        <div style={{ padding: '12px 18px', background: '#03616a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div className="row" style={{ gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <L.FileCode2 size={20} color="#fff" />
            </div>
            <div>
              <b style={{ fontSize: 15, display: 'block', lineHeight: 1.2 }}>Mẫu văn bản & Xuất file</b>
              <span className="small" style={{ opacity: 0.85, fontSize: 12 }}>Điền biểu mẫu bên trái · văn bản bên phải cập nhật ngay · xuất Word / PDF</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn sm" style={{ background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, gap: 6 }} onClick={handleExportWord} disabled={isExporting}>
              <L.Download size={14} />{isExporting ? 'Đang tạo file…' : 'Xuất Word'}
            </button>
            <button type="button" className="btn sm" style={{ background: '#d4712f', color: '#fff', border: 'none', fontWeight: 600, gap: 6 }} onClick={handlePrintPdf}>
              <L.Printer size={14} />Xuất PDF / In
            </button>
            <button type="button" className="btn sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', gap: 6 }} onClick={handleSaveToDocs} title="Lưu vào kho Văn bản & Hồ sơ của dự án">
              <L.BookmarkPlus size={14} />Lưu vào Hồ sơ
            </button>
            <button type="button" className="iconbtn" style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: 30, height: 30 }} onClick={onClose} aria-label="Đóng">
              <L.X size={16} />
            </button>
          </div>
        </div>

        {/* Subbar */}
        <div style={{ padding: '10px 18px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div className="row wrap" style={{ gap: 12, alignItems: 'center' }}>
            <div className="row" style={{ gap: 6, alignItems: 'center' }}>
              <span className="small faint" style={{ fontWeight: 600 }}>Biểu mẫu:</span>
              <select className="select sm" style={{ minWidth: 300, fontWeight: 600, color: 'var(--teal-900)' }} value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
                {categories.map(([cat, list]) => (
                  <optgroup key={cat} label={cat}>
                    {list.map((t) => <option key={t.id} value={t.id}>{t.source ? '★ ' : ''}{t.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="row" style={{ gap: 6, alignItems: 'center' }}>
              <span className="small faint" style={{ fontWeight: 600 }}>Lấy dữ liệu từ:</span>
              <select className="select sm" style={{ minWidth: 260 }} value={selectedSourceId} onChange={(e) => setSelectedSourceId(e.target.value)}>
                <optgroup label="Chuyến công tác giảng viên">
                  {trips.map((t) => <option key={t.id} value={t.id}>{t.lecturer} – {t.course} ({t.teachFrom?.slice(5) || 'HK2'})</option>)}
                </optgroup>
                <optgroup label="Hồ sơ giảng viên">
                  {lecturers.map((l) => <option key={l.id} value={l.id}>{l.fullName} ({l.side || 'Rennes'})</option>)}
                </optgroup>
                <option value="custom">✏️ Nhập tự do</option>
              </select>
            </div>
          </div>
          <div className="row" style={{ gap: 6, alignItems: 'center' }}>
            <span className="small faint">Thu phóng:</span>
            {[60, 75, 90, 100].map((z) => (
              <button key={z} type="button" className={cx('btn sm', zoom === z && 'primary')} onClick={() => setZoom(z)} style={{ padding: '2px 8px', fontSize: 11 }}>{z}%</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="ds-body">
          <div className="ds-form">
            <div className="ds-source">
              {currentTmpl.source ? <L.FileCheck2 size={18} style={{ flexShrink: 0, marginTop: 1 }} /> : <L.Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />}
              <div style={{ flex: 1 }}>
                <b>{currentTmpl.name}</b>
                {currentTmpl.source && <> · <span className="ds-tag"><L.Stamp size={11} />Mẫu gốc: {currentTmpl.source}</span></>}
                <div style={{ color: 'var(--muted)' }}>{currentTmpl.desc} Bấm vào nội dung trong văn bản để nhảy tới ô tương ứng.</div>
              </div>
              <button type="button" className="btn sm ghost" onClick={resetForm} title="Khôi phục dữ liệu mặc định"><L.RotateCcw size={13} /></button>
            </div>

            {sections.map((sec, si) => (
              <FormSection key={sec.title} no={si + 1} title={sec.title} desc={sec.desc}>
                {packRows(sec.fields).map(({ fd, span }) => {
                  const id = `tf-${fd.k}`
                  const show = errs[fd.k] && (touched[fd.k] || String(formData[fd.k] ?? '').trim() !== '') ? errs[fd.k] : ''
                  const onFocus = () => setFocusKey(fd.k)
                  return (
                    <FieldCell key={fd.k} fd={fd} span={fd.type === 'rows' ? 12 : span} id={id} error={show}
                      hint={fd.hintFn ? fd.hintFn(formData) : hintOf(fd, formData[fd.k])}
                      onBlur={() => !touched[fd.k] && setTouched((t) => ({ ...t, [fd.k]: true }))}>
                      {fd.type === 'rows'
                        ? <RowsInput fd={fd} value={formData[fd.k]} onChange={(v) => setField(fd.k, v)} onFocus={onFocus} />
                        : <SmartInput fd={fd} id={id} value={formData[fd.k]} onChange={(v) => setField(fd.k, v)} onFocus={onFocus} />}
                    </FieldCell>
                  )
                })}
              </FormSection>
            ))}
            {errCount > 0 && (
              <div className="sf-errbadge" style={{ alignSelf: 'flex-start' }}><L.AlertTriangle size={13} />{errCount} ô cần kiểm tra trước khi xuất</div>
            )}
          </div>

          <div className="ds-preview" ref={previewRef} onClick={onPreviewClick}>
            {focusKey && <style>{`.ds-page [data-f="${focusKey}"]{background:#fff1c2 !important;box-shadow:0 0 0 2px #f6c453;}`}</style>}
            <div className="ds-pages" style={{ zoom: zoom / 100 }}>
              {pages.map((html, i) => (
                <div key={i} className="ds-page">
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                  {pages.length > 1 && <span className="ds-page-no">{i + 1}/{pages.length}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
