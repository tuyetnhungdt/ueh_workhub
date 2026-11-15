import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { Avatar, useToast } from './ui.jsx'
import { cx, timeAgo, uid } from '../lib/utils.js'

export default function DocComments({ item, onUpdate, readOnly = false }) {
  const { state, me, notifyUser } = useStore()
  const toast = useToast()

  const [filter, setFilter] = useState('all') // 'all' | 'open' | 'resolved'
  const [newText, setNewText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  const comments = item.docComments || []
  const openCount = comments.filter((c) => !c.resolved).length
  const resolvedCount = comments.filter((c) => c.resolved).length

  const filteredComments = comments.filter((c) => {
    if (filter === 'open') return !c.resolved
    if (filter === 'resolved') return c.resolved
    return true
  })

  // Tìm người nhận thông báo: người khởi tạo văn bản hoặc người phụ trách (owner)
  const targetRecipientId = (() => {
    if (item.owner && item.owner !== me.id) return item.owner
    if (item.createdBy && item.createdBy !== me.id) return item.createdBy
    // Nếu chính mình là người tạo, gửi thông báo cho quản lý dự án u1 hoặc u2
    return me.id === 'u1' ? 'u2' : 'u1'
  })()

  const handleAddComment = (e) => {
    e?.preventDefault()
    if (!newText.trim()) return

    const newComment = {
      id: uid('cm_doc'),
      authorId: me.id,
      authorName: me.name,
      authorRole: me.title || (me.role === 'admin' ? 'Quản trị viên' : 'Thành viên'),
      text: newText.trim(),
      createdAt: new Date().toISOString(),
      resolved: false,
      replies: [],
    }

    const updatedComments = [...comments, newComment]
    onUpdate({ ...item, docComments: updatedComments })
    setNewText('')

    // Hệ thống thông báo tự động (Notification Loop)
    if (targetRecipientId) {
      notifyUser(
        targetRecipientId,
        item.projectId,
        `${me.name} (${me.title || 'Chuyên viên'}) đã bình luận trên văn bản “${item.title}”: "${newComment.text.slice(0, 45)}..."`
      )
    }

    toast('Đã gửi bình luận & thông báo tới người phụ trách văn bản')
  }

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return

    const targetComment = comments.find((c) => c.id === commentId)
    const replyItem = {
      id: uid('dcr'),
      authorId: me.id,
      authorName: me.name,
      authorRole: me.title || 'Thành viên',
      text: replyText.trim(),
      createdAt: new Date().toISOString(),
    }

    const updatedComments = comments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), replyItem],
        }
      }
      return c
    })

    onUpdate({ ...item, docComments: updatedComments })
    setReplyingTo(null)
    setReplyText('')

    // Thông báo cho người đặt comment ban đầu nếu khác người trả lời
    const notifyId = targetComment?.authorId !== me.id ? targetComment?.authorId : targetRecipientId
    if (notifyId) {
      notifyUser(
        notifyId,
        item.projectId,
        `${me.name} đã phản hồi bình luận của bạn trên văn bản “${item.title}”: "${replyItem.text.slice(0, 45)}..."`
      )
    }

    toast('Đã gửi phản hồi trong luồng')
  }

  const handleToggleResolve = (commentId) => {
    const updatedComments = comments.map((c) => {
      if (c.id === commentId) {
        const nextResolved = !c.resolved
        return {
          ...c,
          resolved: nextResolved,
          resolvedAt: nextResolved ? new Date().toISOString() : null,
          resolvedBy: nextResolved ? me.id : null,
        }
      }
      return c
    })

    onUpdate({ ...item, docComments: updatedComments })
    const target = comments.find((c) => c.id === commentId)
    const statusMsg = target?.resolved ? 'Đã mở lại góp ý' : 'Đã đánh dấu xử lý xong góp ý'
    toast(statusMsg)

    if (!target?.resolved && targetRecipientId) {
      notifyUser(
        targetRecipientId,
        item.projectId,
        `${me.name} đã xử lý xong góp ý trên văn bản “${item.title}”`
      )
    }
  }

  return (
    <div className="doc-comments-section" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header khu vực bình luận */}
      <div className="row between wrap" style={{ gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
        <div className="row" style={{ gap: 8 }}>
          <L.MessageSquareCode size={18} color="var(--teal-700)" />
          <b style={{ fontSize: 14, color: 'var(--teal-900)' }}>Bình luận & Phản hồi cộng tác</b>
          {openCount > 0 && (
            <span
              className="badge"
              style={{
                background: 'rgba(212, 113, 47, 0.12)',
                color: '#b45309',
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#f59e0b',
                  display: 'inline-block',
                }}
              />
              {openCount} cần xử lý
            </span>
          )}
        </div>

        {/* Bộ lọc tab */}
        <div className="row" style={{ gap: 4 }}>
          <button
            type="button"
            className={cx('btn sm', filter === 'all' ? 'primary' : 'ghost')}
            style={{ fontSize: 11.5, padding: '3px 8px' }}
            onClick={() => setFilter('all')}
          >
            Tất cả ({comments.length})
          </button>
          <button
            type="button"
            className={cx('btn sm', filter === 'open' ? 'primary' : 'ghost')}
            style={{ fontSize: 11.5, padding: '3px 8px' }}
            onClick={() => setFilter('open')}
          >
            Đang mở ({openCount})
          </button>
          <button
            type="button"
            className={cx('btn sm', filter === 'resolved' ? 'primary' : 'ghost')}
            style={{ fontSize: 11.5, padding: '3px 8px' }}
            onClick={() => setFilter('resolved')}
          >
            Đã xử lý ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Danh sách bình luận dạng luồng (Threaded Comments) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
        {!filteredComments.length ? (
          <div className="small faint" style={{ textAlign: 'center', padding: '18px 0', fontStyle: 'italic' }}>
            {filter === 'open' ? 'Không có góp ý nào đang mở.' : filter === 'resolved' ? 'Chưa có góp ý nào được giải quyết.' : 'Chưa có bình luận nào trên văn bản này. Hãy để lại góp ý bên dưới!'}
          </div>
        ) : (
          filteredComments.map((c) => {
            const author = state.users.find((u) => u.id === c.authorId)
            const isReplying = replyingTo === c.id

            return (
              <div
                key={c.id}
                style={{
                  background: c.resolved ? 'var(--gray-50, #f8fafc)' : '#ffffff',
                  border: c.resolved ? '1px dashed var(--border)' : '1px solid var(--teal-200, #bbf7d0)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: c.resolved ? 'none' : '0 1px 3px rgba(3, 97, 106, 0.05)',
                }}
              >
                {/* Header của comment */}
                <div className="row between" style={{ alignItems: 'flex-start' }}>
                  <div className="row" style={{ gap: 8 }}>
                    <Avatar user={author || { name: c.authorName, color: 'var(--teal-700)' }} size={28} />
                    <div>
                      <div className="row" style={{ gap: 6 }}>
                        <b style={{ fontSize: 13, color: 'var(--gray-900)' }}>{c.authorName}</b>
                        <span className="chip" style={{ fontSize: 10.5, padding: '1px 6px', background: 'var(--gray-100)' }}>
                          {c.authorRole}
                        </span>
                      </div>
                      <div className="faint small" style={{ fontSize: 11 }}>{timeAgo(c.createdAt)}</div>
                    </div>
                  </div>

                  <div className="row" style={{ gap: 6 }}>
                    <span
                      className="badge"
                      style={{
                        background: c.resolved ? '#e2f4e9' : 'rgba(212, 113, 47, 0.1)',
                        color: c.resolved ? '#1e8a4c' : '#b45309',
                        fontSize: 10.5,
                        fontWeight: 600,
                      }}
                    >
                      {c.resolved ? '✓ Đã xử lý' : 'Đang mở'}
                    </span>
                    {!readOnly && (
                      <button
                        type="button"
                        className="btn sm ghost"
                        style={{ fontSize: 11, padding: '2px 6px', color: c.resolved ? '#64748b' : '#1e8a4c' }}
                        onClick={() => handleToggleResolve(c.id)}
                        title={c.resolved ? 'Mở lại góp ý này' : 'Đánh dấu đã hoàn thành xử lý'}
                      >
                        {c.resolved ? <L.RotateCcw size={12} /> : <L.CheckCheck size={13} />}
                        {c.resolved ? 'Mở lại' : 'Xong'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Nội dung comment */}
                <div style={{ fontSize: 13, lineHeight: 1.5, color: c.resolved ? '#64748b' : '#1e293b', whiteSpace: 'pre-wrap', paddingLeft: 36 }}>
                  {c.text}
                </div>

                {/* Danh sách phản hồi trong luồng (Replies) */}
                {(c.replies || []).length > 0 && (
                  <div style={{ marginLeft: 36, paddingLeft: 12, borderLeft: '2px solid var(--teal-200, #99f6e4)', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    {c.replies.map((r) => {
                      const repAuthor = state.users.find((u) => u.id === r.authorId)
                      return (
                        <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div className="row" style={{ gap: 6 }}>
                            <Avatar user={repAuthor || { name: r.authorName, color: 'var(--teal-600)' }} size={20} />
                            <b style={{ fontSize: 12 }}>{r.authorName}</b>
                            <span className="faint small" style={{ fontSize: 10.5 }}>{r.authorRole}</span>
                            <span className="faint small" style={{ fontSize: 10.5, marginLeft: 'auto' }}>{timeAgo(r.createdAt)}</span>
                          </div>
                          <div style={{ fontSize: 12.5, lineHeight: 1.45, paddingLeft: 26, color: '#334155' }}>
                            {r.text}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Nút & ô nhập trả lời (Reply form) */}
                {!readOnly && (
                  <div style={{ paddingLeft: 36, marginTop: 2 }}>
                    {isReplying ? (
                      <div className="row wrap" style={{ gap: 6 }}>
                        <input
                          className="input sm"
                          style={{ flex: 1, minWidth: 200, fontSize: 12 }}
                          placeholder={`Trả lời ${c.authorName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddReply(c.id)
                          }}
                          autoFocus
                        />
                        <button type="button" className="btn sm primary" onClick={() => handleAddReply(c.id)} disabled={!replyText.trim()}>
                          Gửi
                        </button>
                        <button type="button" className="btn sm ghost" onClick={() => setReplyingTo(null)}>
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn sm ghost"
                        style={{ fontSize: 11.5, padding: '2px 8px', color: 'var(--teal-700)' }}
                        onClick={() => {
                          setReplyingTo(c.id)
                          setReplyText('')
                        }}
                      >
                        <L.Reply size={12} /> Trả lời phản hồi
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Khung thêm bình luận mới (thay thế ô ghi chú tĩnh) */}
      {!readOnly && (
        <div style={{ background: 'var(--gray-50, #f8fafc)', borderRadius: 8, padding: 10, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="row" style={{ gap: 6, fontSize: 12, color: 'var(--muted)' }}>
            <Avatar user={me} size={20} />
            <span>Viết bình luận với vai trò: <b>{me.name}</b> ({me.title || 'Chuyên viên'})</span>
          </div>
          <div className="row" style={{ gap: 8, alignItems: 'flex-end' }}>
            <textarea
              className="textarea"
              style={{ minHeight: 60, fontSize: 12.5, padding: '8px 10px', flex: 1 }}
              placeholder="Nhập góp ý, yêu cầu chỉnh sửa hoặc câu hỏi trên văn bản này... Hệ thống sẽ tự động gửi thông báo đến người tạo."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(e)
              }}
            />
            <button
              type="button"
              className="btn primary sm"
              style={{ height: 38, padding: '0 14px' }}
              onClick={handleAddComment}
              disabled={!newText.trim()}
            >
              <L.Send size={14} /> Gửi
            </button>
          </div>
          <div className="faint small" style={{ fontSize: 11 }}>
            Mẹo: Nhấn <b>Ctrl + Enter</b> để gửi nhanh. Bình luận sẽ kích hoạt chu trình thông báo (Notification Loop) tức thì.
          </div>
        </div>
      )}
    </div>
  )
}
