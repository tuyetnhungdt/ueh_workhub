import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore, HAS_SUPABASE, enterDemo, exitDemo } from '../data/store.jsx'
import { Avatar } from '../components/ui.jsx'
import { buildSeed } from '../data/seed.js'

export default function Login() {
  const store = useStore()
  const demoUsers = store.state?.users || buildSeed().users
  const [tab, setTab] = useState('in')
  const [f, setF] = useState({ email: '', password: '', name: '', title: '' })
  const [info, setInfo] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setInfo(''); setBusy(true)
    try {
      if (tab === 'in') await store.signIn(f.email.trim(), f.password)
      else {
        const r = await store.signUp(f.email.trim().toLowerCase(), f.password, f.name.trim(), f.title.trim())
        if (r.needsConfirm) { setInfo('Đăng ký thành công! Hãy mở email để xác nhận tài khoản, sau đó quay lại đăng nhập.'); setTab('in') }
      }
    } catch (x) {
      const m = x.message || ''
      setErr(/invalid login/i.test(m) ? 'Email hoặc mật khẩu không đúng.' : /not confirmed/i.test(m) ? 'Email chưa được xác nhận. Kiểm tra hộp thư (cả mục Spam).' : /already registered/i.test(m) ? 'Email này đã được đăng ký. Hãy đăng nhập.' : /signups not allowed/i.test(m) ? 'Hệ thống đang tạm khóa đăng ký mới.' : m)
    } finally { setBusy(false) }
  }

  return (
    <div className="login">
      <div className="login-art">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ background: '#fff', display: 'inline-block', padding: '10px 14px', borderRadius: 14 }}><img src="/ueh-logo.png" alt="UEH University" style={{ height: 44, display: 'block' }} /></div>
        </div>
        <h1 style={{ position: 'relative', zIndex: 1 }}>Điều phối công việc<br /><em>rõ người, rõ việc, rõ hạn.</em></h1>
        <p style={{ position: 'relative', zIndex: 1 }}>UEH WorkHub giúp quản lý giao việc cho từng chuyên viên, theo dõi deadline và tiến độ của mọi hạng mục vận hành chương trình — mọi thành viên trong dự án cùng nhìn thấy một bức tranh chung.</p>
        <div className="login-feats">
          <div><L.Send size={18} color="#ffb27a" />Giao việc & phân công</div>
          <div><L.AlarmClock size={18} color="#ffb27a" />Deadline & cảnh báo</div>
          <div><L.BadgeCheck size={18} color="#ffb27a" />Quy trình gửi duyệt</div>
          <div><L.Activity size={18} color="#ffb27a" />Nhật ký cập nhật chung</div>
        </div>
      </div>
      <div className="login-form">
        {store.mode === 'demo' ? (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Chào mừng trở lại 👋</h2>
            <p className="muted" style={{ marginTop: 6 }}>Bản demo: chọn một nhân sự để đăng nhập và trải nghiệm theo vai trò. Bạn có thể đổi vai trò bất cứ lúc nào ở góc trên bên phải.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
              {demoUsers.map((u) => (
                <button key={u.id} className="login-user" onClick={() => store.loginAs(u.id)}>
                  <Avatar user={u} size={38} />
                  <span className="grow"><b>{u.name}</b><div className="muted small">{u.title}</div></span>
                  {u.role === 'admin' ? <span className="badge" style={{ background: 'var(--orange-100)', color: 'var(--orange-700)' }}>Quản lý</span>
                    : u.id === 'u2' ? <span className="badge" style={{ background: 'var(--teal-100)', color: 'var(--teal-800)' }}>Quản lý dự án</span>
                    : <span className="badge" style={{ background: '#eef2f6', color: '#64748b' }}>Chuyên viên</span>}
                  <L.ChevronRight size={16} className="faint" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>{tab === 'in' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
            <div className="seg" style={{ alignSelf: 'flex-start' }}>
              <button type="button" className={tab === 'in' ? 'on' : ''} onClick={() => { setTab('in'); setErr('') }}>Đăng nhập</button>
              <button type="button" className={tab === 'up' ? 'on' : ''} onClick={() => { setTab('up'); setErr(''); setInfo('') }}>Đăng ký</button>
            </div>
            {tab === 'up' && (
              <>
                <div className="grid2">
                  <div className="field"><label>Họ và tên *</label><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
                  <div className="field"><label>Chức danh</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="VD: Chuyên viên tài chính" /></div>
                </div>
                <div className="callout info"><L.KeyRound size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} /><div>Sau khi đăng nhập, nhập <b>mã dự án</b> do quản lý cung cấp để tham gia dự án. Quyền quản lý do quản trị cấp.</div></div>
              </>
            )}
            <div className="field"><label>Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div className="field"><label>Mật khẩu</label><input className="input" type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
            {info && <div className="callout info"><L.MailCheck size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} />{info}</div>}
            {err && <div className="callout review"><L.CircleAlert size={18} color="var(--orange-600)" style={{ flexShrink: 0 }} />{err}</div>}
            <button className="btn primary" disabled={busy}>{busy ? 'Đang xử lý…' : tab === 'in' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>
          </form>
        )}
        {store.mode === 'supabase' && <div className="demo-link">Muốn xem thử trước? <button type="button" onClick={enterDemo}>Xem bản demo với dữ liệu mẫu</button></div>}
        {store.mode === 'demo' && HAS_SUPABASE && <div className="demo-link"><button type="button" onClick={exitDemo}>← Quay lại đăng nhập tài khoản thật</button></div>}
      </div>
    </div>
  )
}
