import { useState, useMemo, useEffect, useRef } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { useToast } from './ui.jsx'
import { TEMPLATES, extractAutoFillData, renderTemplateHtml, templateDefaults } from '../modules/templateEngine.js'
import { exportDocx } from '../modules/docxExport.js'
import { FormSection, FieldCell, SmartInput, RowsInput, packRows, validate, validateRows, hintOf } from './SmartForm.jsx'
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
const AUTOSAVE_MS = 1200
const MISSING = 'Bắt buộc nhập'
const hhmm = (iso) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
// bỏ dữ liệu tham chiếu nội bộ trước khi lưu (bản ghi chuyến/GV gốc)
const cleanData = (d) => Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('raw')))
const DOC_TYPE = { missionOrder: 'Quyết định', contractInfo: 'Khác', ticketContract: 'Khác', ticketHandover: 'Biên bản họp', ticketAccept: 'Biên bản họp' }

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
  const [showAll, setShowAll] = useState(false) // hiện cả lỗi "chưa điền" cho mọi ô
  const [saveInfo, setSaveInfo] = useState(null) // { at, restored } | { pending: true }
  const previewRef = useRef(null)
  const fromPreview = useRef(false)

  const currentTmpl = TEMPLATES[selectedTemplateId] || TEMPLATES.flightReq

  const sourceItem = useMemo(() => {
    if (selectedSourceId === 'custom') return {}
    return allItems.find((x) => x.id === selectedSourceId) || initialItem || trips[0] || {}
  }, [selectedSourceId, allItems, initialItem, trips])

  const buildDefaults = () => templateDefaults(selectedTemplateId, extractAutoFillData(sourceItem, state.items.filter((x) => x.projectId === project?.id), state.users), { today: todayStr(), meName: me.name })
  const findDraft = (tid, src) => state.items.find((x) => x.projectId === project?.id && x.module === 'docs' && x.templateId === tid && (x.templateSource || 'custom') === src)

  const [formData, setFormData] = useState(() => {
    const d = findDraft(selectedTemplateId, selectedSourceId)
    const base = buildDefaults()
    return d?.templateData ? { ...base, ...d.templateData } : base
  })

  /* ---------- Bản nháp: tự nạp khi đổi mẫu / nguồn, tự lưu khi có thay đổi ---------- */
  const draftIdRef = useRef(null)
  const dirtyRef = useRef(false)
  const lastCtx = useRef(null)
  useEffect(() => {
    const prev = lastCtx.current
    const draft = findDraft(selectedTemplateId, selectedSourceId)
    // chuyển giữa các mẫu cùng bộ (HĐ vé → bàn giao → nghiệm thu) thì giữ dữ liệu đang nhập
    const keep = prev && currentTmpl.family && prev.family === currentTmpl.family && prev.source === selectedSourceId
    lastCtx.current = { family: currentTmpl.family, source: selectedSourceId }
    draftIdRef.current = draft?.id || null
    dirtyRef.current = false
    if (prev) {
      const base = buildDefaults()
      setFormData((cur) => (keep ? { ...base, ...cur } : draft?.templateData ? { ...base, ...draft.templateData } : base))
    }
    if (!keep) { setTouched({}); setShowAll(false) }
    setSaveInfo(draft ? { at: draft.updatedAt, restored: true } : null)
  }, [selectedTemplateId, selectedSourceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (key, value) => { dirtyRef.current = true; setFormData((prev) => ({ ...prev, [key]: value })) }

  const sections = currentTmpl.form || []
  const allFields = sections.flatMap((s) => s.fields)
  const labelOf = (k) => allFields.find((x) => x.k === k)?.label || k

  /* ---------- Kiểm tra toàn bộ biểu mẫu ---------- */
  const { errs, issues } = useMemo(() => {
    const errs = {}
    const issues = []
    for (const fd of allFields) {
      if (fd.type === 'rows') {
        for (const x of validateRows(fd, formData[fd.k])) {
          issues.push({ k: fd.k, label: fd.label, msg: x.row >= 0 ? `Dòng ${x.row + 1} – ${x.msg}` : x.msg, missing: !!x.missing })
          if (!x.missing) errs[fd.k] ||= x.msg
        }
        continue
      }
      const e = validate(fd, formData[fd.k], formData, labelOf)
      if (e) { errs[fd.k] = e; issues.push({ k: fd.k, label: fd.label, msg: e, missing: e === MISSING }) }
    }
    return { errs, issues }
  }, [formData, selectedTemplateId]) // eslint-disable-line react-hooks/exhaustive-deps
  const invalid = issues.filter((x) => !x.missing)
  const missing = issues.filter((x) => x.missing)
  const complete = issues.length === 0
  const reqFields = allFields.filter((f) => f.req)
  const reqDone = reqFields.filter((f) => !missing.some((x) => x.k === f.k)).length

  const persist = () => {
    if (!project?.id) return
    const data = cleanData(formData)
    const existing = draftIdRef.current && state.items.find((x) => x.id === draftIdRef.current)
    const title = currentTmpl.titleOf ? currentTmpl.titleOf(formData) : `${currentTmpl.name} – ${formData.lecturerName || 'GV'}`
    const autoStatus = !existing?.status || ['Dự thảo', 'Chờ góp ý'].includes(existing.status)
    const rec = {
      ...(draftIdRef.current ? { id: draftIdRef.current } : {}),
      title,
      docType: existing?.docType || DOC_TYPE[selectedTemplateId] || 'Kế hoạch',
      number: formData.docNumber || formData.contractNo || existing?.number || '',
      date: existing?.date || todayStr(),
      partner: existing?.partner || 'Université de Rennes',
      // chưa đủ → Dự thảo; đủ → Chờ góp ý (không hạ trạng thái người dùng đã chuyển tiếp, vd: Đã ký)
      ...(autoStatus ? { status: complete ? 'Chờ góp ý' : 'Dự thảo' } : {}),
      owner: existing?.owner || me.id,
      templateId: selectedTemplateId,
      templateSource: selectedSourceId,
      templateData: data,
      templateComplete: complete,
      templateProgress: `${reqDone}/${reqFields.length}`,
      ...(existing ? {} : { note: `Văn bản soạn từ mẫu “${currentTmpl.name}”, tự lưu nháp.` }),
    }
    const id = saveItem(project.id, 'docs', rec, `văn bản “${title}” (từ mẫu)`, { silent: !!existing })
    draftIdRef.current = id
    dirtyRef.current = false
    setSaveInfo({ at: new Date().toISOString() })
  }
  const persistRef = useRef(persist)
  persistRef.current = persist
  const flush = () => { if (dirtyRef.current) persistRef.current() }

  useEffect(() => {
    if (!dirtyRef.current) return
    setSaveInfo({ pending: true })
    const t = setTimeout(() => persistRef.current(), AUTOSAVE_MS)
    return () => clearTimeout(t)
  }, [formData])
  // rời trang khi còn thay đổi chưa lưu → lưu ngay
  useEffect(() => () => { if (dirtyRef.current) persistRef.current() }, [])

  const handleClose = () => { flush(); onClose() }
  const changeTemplate = (id) => { flush(); setSelectedTemplateId(id) }
  const changeSource = (id) => { flush(); setSelectedSourceId(id) }

  const previewHtml = useMemo(() => renderTemplateHtml(selectedTemplateId, formData), [selectedTemplateId, formData])
  const pages = useMemo(() => splitPages(previewHtml), [previewHtml])

  // Ô đang nhập → tô sáng & cuộn tới vị trí tương ứng trong văn bản
  useEffect(() => {
    if (!focusKey || !previewRef.current) return
    if (fromPreview.current) { fromPreview.current = false; return }
    const el = previewRef.current.querySelector(`[data-f="${focusKey}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusKey, selectedTemplateId])

  const jumpTo = (k, fromDoc) => {
    const cell = document.querySelector(`.ds-form [data-field="${k}"]`)
    if (!cell) return
    cell.scrollIntoView({ behavior: 'smooth', block: 'center' })
    cell.classList.remove('flash'); void cell.offsetWidth; cell.classList.add('flash')
    if (fromDoc) fromPreview.current = true
    cell.querySelector('input,select,textarea')?.focus({ preventScroll: true })
    setFocusKey(k)
  }
  const onPreviewClick = (e) => {
    const k = e.target.closest?.('[data-f]')?.getAttribute('data-f')
    if (k) jumpTo(k, true)
  }

  const docBaseName = () => (currentTmpl.fileName ? currentTmpl.fileName(formData) : `${selectedTemplateId}_${(formData.lecturerName || 'GV').replace(/\s+/g, '_')}`)

  const handleExportWord = async () => {
    if (!complete) return
    flush()
    setIsExporting(true)
    try {
      if (currentTmpl.render) {
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
    if (!complete) return
    flush()
    const printWin = window.open('', '_blank')
    if (!printWin) { alert('Vui lòng cho phép mở popup trên trình duyệt để in văn bản.'); return }
    printWin.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${docBaseName()}</title><style>${PRINT_CSS}</style></head>
      <body><div class="page">${printable(previewHtml)}</div><script>window.onload=function(){window.print()}<\/script></body></html>`)
    printWin.document.close()
  }

  const resetForm = () => {
    if (!confirm('Khôi phục dữ liệu mặc định của mẫu? Nội dung đang nhập sẽ được thay thế.')) return
    dirtyRef.current = true
    setFormData(buildDefaults()); setTouched({})
  }

  const showIssues = () => {
    setShowAll(true)
    const first = invalid[0] || missing[0]
    if (first) jumpTo(first.k)
  }

  const categories = useMemo(() => {
    const g = {}
    for (const t of Object.values(TEMPLATES)) (g[t.category] ||= []).push(t)
    return Object.entries(g)
  }, [])

  const saveLabel = saveInfo?.pending
    ? <><span className="spin" style={{ width: 11, height: 11 }} />Đang lưu…</>
    : saveInfo?.at
      ? <><L.Check size={13} />{saveInfo.restored ? 'Đã mở bản nháp lưu lúc ' : 'Đã tự lưu vào Văn bản & hồ sơ · '}{hhmm(saveInfo.at)}</>
      : <><L.Cloud size={13} />Tự lưu khi bạn bắt đầu nhập</>

  return (
    <div className="doc-studio-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="doc-studio-window" style={{ background: '#f8fafc', borderRadius: 12, width: '97vw', maxWidth: 1600, height: '95vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}>
        {/* Header: tên văn bản (chọn mẫu ngay tại tiêu đề) */}
        <div className="ds-head">
          <div className="ds-head-icon"><L.FileText size={20} color="#fff" /></div>
          <div className="ds-head-title">
            <select className="ds-title-select" value={selectedTemplateId} onChange={(e) => changeTemplate(e.target.value)} aria-label="Chọn mẫu văn bản" title="Đổi mẫu văn bản">
              {categories.map(([cat, list]) => (
                <optgroup key={cat} label={cat}>
                  {list.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </optgroup>
              ))}
            </select>
            <div className="ds-head-sub">
              <span>{currentTmpl.category}</span>
              {currentTmpl.source && <span className="ds-head-src"><L.Stamp size={12} />Mẫu gốc: {currentTmpl.source}</span>}
              <span className="ds-head-save">{saveLabel}</span>
            </div>
          </div>
          <div className="ds-head-actions">
            {complete ? (
              <>
                <span className="ds-pill ok"><L.CheckCircle2 size={14} />Đã điền đủ {reqFields.length}/{reqFields.length}</span>
                <button type="button" className="btn sm" style={{ background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, gap: 6 }} onClick={handleExportWord} disabled={isExporting}>
                  <L.Download size={14} />{isExporting ? 'Đang tạo file…' : 'Xuất Word'}
                </button>
                <button type="button" className="btn sm" style={{ background: '#d4712f', color: '#fff', border: 'none', fontWeight: 600, gap: 6 }} onClick={handlePrintPdf}>
                  <L.Printer size={14} />Xuất PDF / In
                </button>
              </>
            ) : (
              <button type="button" className="ds-pill todo" onClick={showIssues} title="Xuất Word/PDF sẽ hiện khi biểu mẫu đầy đủ và hợp lệ">
                <L.ListChecks size={14} />
                Đã điền {reqDone}/{reqFields.length}
                {invalid.length > 0 && <b> · {invalid.length} lỗi</b>}
                <span className="ds-pill-hint">· xem cần sửa gì</span>
              </button>
            )}
            <button type="button" className="iconbtn" style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: 30, height: 30 }} onClick={handleClose} aria-label="Đóng">
              <L.X size={16} />
            </button>
          </div>
        </div>

        {/* Subbar: nguồn dữ liệu + thu phóng */}
        <div style={{ padding: '10px 18px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div className="row" style={{ gap: 6, alignItems: 'center' }}>
            <span className="small faint" style={{ fontWeight: 600 }}>Lấy dữ liệu từ:</span>
            <select className="select sm" style={{ minWidth: 260 }} value={selectedSourceId} onChange={(e) => changeSource(e.target.value)}>
              <optgroup label="Chuyến công tác giảng viên">
                {trips.map((t) => <option key={t.id} value={t.id}>{t.lecturer} – {t.course} ({t.teachFrom?.slice(5) || 'HK2'})</option>)}
              </optgroup>
              <optgroup label="Hồ sơ giảng viên">
                {lecturers.map((l) => <option key={l.id} value={l.id}>{l.fullName} ({l.side || 'Rennes'})</option>)}
              </optgroup>
              <option value="custom">✏️ Nhập tự do</option>
            </select>
          </div>
          <div className="row" style={{ gap: 6, alignItems: 'center' }}>
            <span className="small faint">Thu phóng:</span>
            {[60, 75, 90, 100].map((z) => (
              <button key={z} type="button" className={cx('btn sm', zoom === z && 'primary')} onClick={() => setZoom(z)} style={{ padding: '2px 8px', fontSize: 11 }}>{z}%</button>
            ))}
          </div>
        </div>

        <div className="ds-body">
          <div className="ds-form">
            <div className="ds-source">
              <L.Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--muted)' }}>{currentTmpl.desc} Mọi thay đổi được tự lưu; khi điền đủ các ô bắt buộc (<span className="sf-req">*</span>) và hết lỗi thì nút Xuất Word / PDF sẽ hiện. Bấm vào nội dung trong văn bản để nhảy tới ô tương ứng.</div>
                {currentTmpl.family && (
                  <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                    <span className="small" style={{ fontWeight: 600 }}>Cùng bộ hồ sơ (dùng chung dữ liệu):</span>
                    {Object.values(TEMPLATES).filter((t) => t.family === currentTmpl.family).map((t) => (
                      <button key={t.id} type="button" className={cx('btn sm', t.id === selectedTemplateId ? 'primary' : '')} onClick={() => changeTemplate(t.id)}>{t.name}</button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className="btn sm ghost" onClick={resetForm} title="Khôi phục dữ liệu mặc định"><L.RotateCcw size={13} /></button>
            </div>

            {/* Báo cáo kiểm tra biểu mẫu */}
            {complete ? (
              <div className="ds-check ok"><L.ShieldCheck size={16} /><b>Biểu mẫu đầy đủ và hợp lệ</b> – có thể xuất Word / PDF.</div>
            ) : (invalid.length > 0 || showAll) && (
              <div className={cx('ds-check', invalid.length ? 'bad' : 'warn')}>
                <div className="ds-check-head">
                  <L.AlertTriangle size={16} />
                  <b>{invalid.length ? `${invalid.length} lỗi cần sửa` : 'Biểu mẫu chưa đầy đủ'}</b>
                  {missing.length > 0 && <span>· {missing.length} ô chưa điền</span>}
                </div>
                <ul>
                  {[...invalid, ...(showAll ? missing : [])].slice(0, 12).map((x, i) => (
                    <li key={i}><button type="button" onClick={() => jumpTo(x.k)}><span className={x.missing ? 'tag-miss' : 'tag-err'}>{x.missing ? 'Chưa điền' : 'Lỗi'}</span><b>{x.label}</b>{x.missing ? '' : `: ${x.msg}`}{x.missing && x.msg !== MISSING ? `: ${x.msg}` : ''}</button></li>
                  ))}
                </ul>
                {!showAll && missing.length > 0 && <button type="button" className="btn sm ghost" onClick={() => setShowAll(true)}>Xem cả {missing.length} ô chưa điền</button>}
                {[...invalid, ...(showAll ? missing : [])].length > 12 && <div className="small faint">… và {[...invalid, ...(showAll ? missing : [])].length - 12} mục khác</div>}
              </div>
            )}

            {sections.map((sec, si) => (
              <FormSection key={sec.title} no={si + 1} title={sec.title} desc={sec.desc}>
                {packRows(sec.fields).map(({ fd, span }) => {
                  const id = `tf-${fd.k}`
                  const e = errs[fd.k]
                  const isMissing = fd.type === 'rows' ? false : e === MISSING
                  const show = e && (!isMissing || touched[fd.k] || showAll) ? e : (fd.type === 'rows' && showAll && missing.find((x) => x.k === fd.k)?.msg) || ''
                  const onFocus = () => setFocusKey(fd.k)
                  return (
                    <FieldCell key={fd.k} fd={fd} span={fd.type === 'rows' ? 12 : span} id={id} error={show}
                      hint={fd.hintFn ? fd.hintFn(formData) : hintOf(fd, formData[fd.k])}
                      onBlur={() => { setFocusKey((k) => (k === fd.k ? null : k)); if (!touched[fd.k]) setTouched((t) => ({ ...t, [fd.k]: true })) }}>
                      {fd.type === 'rows'
                        ? <RowsInput fd={fd} value={formData[fd.k]} onChange={(v) => setField(fd.k, v)} onFocus={onFocus} showMissing={showAll} />
                        : <SmartInput fd={fd} id={id} value={formData[fd.k]} onChange={(v) => setField(fd.k, v)} onFocus={onFocus} />}
                    </FieldCell>
                  )
                })}
              </FormSection>
            ))}
          </div>

          <div className="ds-preview" ref={previewRef} onClick={onPreviewClick}>
            {focusKey && <style>{`.ds-page [data-f="${focusKey}"]{background:#fff1c2 !important;box-shadow:0 0 0 2px #f6c453;}`}</style>}
            {!complete && <div className="ds-draft-badge"><L.PencilLine size={13} />Bản nháp – chưa đủ điều kiện xuất</div>}
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
