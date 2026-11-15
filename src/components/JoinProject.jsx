import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { useUI } from '../App.jsx'
import { useToast, Modal } from './ui.jsx'

export function JoinProjectModal({ onClose }) {
  const { joinProject } = useStore()
  const { go } = useUI()
  const toast = useToast()
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    if (!code.trim()) return
    setBusy(true); setErr('')
    try {
      const id = await joinProject(code)
      toast('Đã tham gia dự án')
      onClose()
      go('/projects/' + id)
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }
  return (
    <Modal title="Tham gia dự án bằng mã" onClose={onClose} width={460}
      footer={<><button className="btn ghost" onClick={onClose}>Hủy</button><button className="btn primary" disabled={!code.trim() || busy} onClick={submit}><L.LogIn size={15} />{busy ? 'Đang kiểm tra…' : 'Tham gia'}</button></>}>
      <p className="muted" style={{ margin: 0 }}>Nhập mã dự án do quản lý cung cấp. Sau khi tham gia, bạn sẽ thấy toàn bộ công việc và cập nhật của dự án.</p>
      <input className="input code-input" autoFocus placeholder="VD: AB12-CD34" value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      {err && <div className="callout review"><L.CircleAlert size={18} color="var(--orange-600)" />{err}</div>}
    </Modal>
  )
}

export function JoinCodeCard({ project }) {
  const { regenerateCode } = useStore()
  const toast = useToast()
  const code = project.joinCode
  return (
    <div className="joincode">
      <div className="grow">
        <div className="small muted">Mã tham gia dự án</div>
        <div className="row" style={{ gap: 10, marginTop: 4 }}>
          <span className="code">{code || '—'}</span>
          {code && <button className="btn sm" onClick={() => { navigator.clipboard?.writeText(code); toast('Đã sao chép mã') }}><L.Copy size={14} />Sao chép</button>}
          <button className="btn sm ghost" onClick={() => { if (!code || confirm('Tạo mã mới? Mã cũ sẽ không dùng được nữa (người đã tham gia vẫn giữ quyền).')) { regenerateCode(project.id); toast('Đã tạo mã mới') } }}><L.RefreshCw size={14} />{code ? 'Đổi mã' : 'Tạo mã'}</button>
        </div>
      </div>
      <div className="small faint" style={{ maxWidth: 360 }}>Gửi mã này cho người cần tham gia. Họ đăng nhập → <b>Tham gia dự án</b> → nhập mã. Người tham gia bằng mã có vai trò <b>Thành viên</b>; bạn có thể nâng lên Quản lý ở bảng dưới.</div>
    </div>
  )
}
