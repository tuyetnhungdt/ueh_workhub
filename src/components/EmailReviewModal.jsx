import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { sendEmailViaResend, getStoredResendKey, setStoredResendKey } from '../modules/resend.js'
import { EMAIL_TEMPLATES } from '../modules/emailTemplates.js'
import { Modal, useToast } from './ui.jsx'
import { fmtDate, timeAgo } from '../lib/utils.js'

export default function EmailReviewModal({ reminder, onClose, onSent }) {
  const { state, me, sendEmailReminder } = useStore()
  const toast = useToast()

  const preDraft = reminder?.preDraft || {}
  const [to, setTo] = useState(preDraft.to || reminder?.lecturerEmail || 'franck.martin@univ-rennes.fr')
  const [cc, setCc] = useState(preDraft.cc || 'academic.rennes@isb.edu.vn, tamnvt@ueh.edu.vn')
  const [bcc, setBcc] = useState(preDraft.bcc || '')
  const [from, setFrom] = useState(preDraft.from || 'UEH-ISB Academic Affairs <academic@isb.edu.vn>')
  const [subject, setSubject] = useState(preDraft.subject || reminder?.title || '[UEH-ISB] Thông báo')
  const [html, setHtml] = useState(
    preDraft.html ||
      EMAIL_TEMPLATES.grade_reminder.build({
        lecturerName: reminder?.targetLecturer || 'Prof. Franck Martin',
        courseName: reminder?.courseName || 'Kinh tế lượng tài chính',
        className: reminder?.className || 'ISB-K51-01',
        deadline: reminder?.deadline || '18/11/2026',
        coordinatorName: me?.name || 'ThS. Nguyễn Văn Thiện Tâm',
      }).html
  )

  const [activeTab, setActiveTab] = useState('preview') // 'preview' | 'edit' | 'audit' | 'settings'
  const [sending, setSending] = useState(false)
  const [resendKey, setResendKey] = useState(getStoredResendKey())
  const [keySaved, setKeySaved] = useState(false)

  const handleSaveKey = () => {
    setStoredResendKey(resendKey)
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
    toast('Đã lưu Resend API Key')
  }

  const handleSend = async () => {
    setSending(true)
    try {
      const result = await sendEmailViaResend({
        to,
        from,
        cc,
        bcc,
        subject,
        html,
        apiKey: resendKey,
      })

      // Cập nhật trạng thái reminder trong Store thành 'sent' kèm Audit log
      if (reminder?.id) {
        sendEmailReminder(reminder.id, {
          to,
          from,
          cc,
          bcc,
          subject,
          html,
          resendId: result.id,
          sentBy: me?.id || 'u1',
        })
      }

      toast(`✓ Đã gửi email thành công qua Resend (ID: ${result.id || 're_ok'})!`)
      if (onSent) onSent(result)
      onClose()
    } catch (error) {
      console.error('Send email error:', error)
      toast(`Lỗi khi gửi email: ${error.message}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal
      title={
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          <L.MailCheck size={20} color="#0284c7" />
          <span>Kiểm duyệt & Duyệt gửi Email 1-Click (Resend API)</span>
          <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: 11 }}>
            Resend Verified
          </span>
        </div>
      }
      onClose={onClose}
      width={860}
      footer={
        <>
          <button className="btn ghost" onClick={onClose} disabled={sending}>
            Hủy
          </button>
          <button
            type="button"
            className="btn primary"
            style={{ background: '#0284c7', borderColor: '#0284c7', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? (
              <>
                <L.Loader2 size={16} className="spin" />
                Đang gửi qua Resend…
              </>
            ) : (
              <>
                <L.Send size={16} />
                Gửi ngay (1-Click Send)
              </>
            )}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Milestone Trigger Context Callout */}
        {reminder && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: 13,
            }}
          >
            <L.AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <b style={{ color: '#92400e' }}>Mốc kích hoạt tự động (Milestone Trigger):</b>
              <div style={{ color: '#b45309', marginTop: 2 }}>
                {reminder.triggerReason || 'Hệ thống phát hiện mốc thời hạn cần thông báo cho Giảng viên.'}
              </div>
            </div>
          </div>
        )}

        {/* Tab switchers */}
        <div className="row between wrap" style={{ gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
          <div className="seg">
            <button
              type="button"
              className={activeTab === 'preview' ? 'on' : ''}
              onClick={() => setActiveTab('preview')}
            >
              <L.Eye size={14} style={{ marginRight: 5 }} />
              Xem trước trực quan (Visual)
            </button>
            <button
              type="button"
              className={activeTab === 'edit' ? 'on' : ''}
              onClick={() => setActiveTab('edit')}
            >
              <L.Edit3 size={14} style={{ marginRight: 5 }} />
              Chỉnh sửa nội dung
            </button>
            <button
              type="button"
              className={activeTab === 'settings' ? 'on' : ''}
              onClick={() => setActiveTab('settings')}
            >
              <L.Settings size={14} style={{ marginRight: 5 }} />
              Cấu hình Resend API
            </button>
          </div>

          <div className="small muted">
            Người kiểm duyệt: <b>{me?.name}</b> ({me?.title})
          </div>
        </div>

        {/* Email Header Fields */}
        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px 12px', alignItems: 'center', fontSize: 13 }}>
            <span className="muted">Người gửi:</span>
            <input
              className="input sm"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="academic@isb.edu.vn"
            />

            <span className="muted">Người nhận (To):</span>
            <input
              className="input sm"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="lecturer@univ-rennes.fr"
            />

            <span className="muted">Đồng gửi (CC):</span>
            <input
              className="input sm"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="academic.rennes@isb.edu.vn, coordinator@ueh.edu.vn"
            />

            <span className="muted">Tiêu đề:</span>
            <input
              className="input sm"
              required
              style={{ fontWeight: 600 }}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>

        {/* TAB 1: VISUAL PREVIEW */}
        {activeTab === 'preview' && (
          <div
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              background: '#f1f5f9',
              padding: 16,
              maxHeight: 'min(420px, 45vh)',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                maxWidth: 640,
                margin: '0 auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#ffffff',
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}

        {/* TAB 2: EDIT CONTENT */}
        {activeTab === 'edit' && (
          <div className="field">
            <label className="small muted">Nội dung mã HTML của email (có thể sửa trực tiếp):</label>
            <textarea
              className="textarea"
              rows={14}
              style={{ fontFamily: 'Consolas, monospace', fontSize: 12.5 }}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
          </div>
        )}

        {/* TAB 3: RESEND API SETTINGS */}
        {activeTab === 'settings' && (
          <div className="card card-pad" style={{ background: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 8px' }}>Cấu hình Kết nối Resend API</h4>
            <p className="muted small" style={{ marginBottom: 14 }}>
              Hệ thống hỗ trợ gửi email trực tiếp qua <b>Resend REST API</b>. Nếu chưa nhập API Key cá nhân, hệ thống sẽ gửi qua chế độ mô phỏng kiểm duyệt (Sandbox).
            </p>

            <div className="field">
              <label>Resend API Key (re_...)</label>
              <div className="row" style={{ gap: 8 }}>
                <input
                  className="input"
                  type="password"
                  placeholder="re_123456789_abcdefgh..."
                  value={resendKey}
                  onChange={(e) => setResendKey(e.target.value)}
                />
                <button type="button" className="btn sm primary" onClick={handleSaveKey}>
                  {keySaved ? '✓ Đã lưu' : 'Lưu Key'}
                </button>
              </div>
            </div>

            <div className="callout info" style={{ marginTop: 12 }}>
              <L.Info size={16} color="var(--teal-700)" style={{ flexShrink: 0 }} />
              <div>
                Để gửi vào hòm thư thật của giảng viên, hãy tạo tài khoản miễn phí tại <b>resend.com</b>, tạo API Key và nhập vào đây (hoặc cấu hình biến môi trường <code>RESEND_API_KEY</code> trên Vercel).
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
