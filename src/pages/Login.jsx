import { useState } from 'react'
import * as L from 'lucide-react'
import { useStore, HAS_SUPABASE, enterDemo, exitDemo } from '../data/store.jsx'
import { getRoleConfig, normalizeRole, USER_STATUS, ROLES } from '../data/rbac.js'
import { Avatar, Modal } from '../components/ui.jsx'
import { buildSeed } from '../data/seed.js'

export default function Login() {
  const store = useStore()
  const demoUsers = store.state?.users || buildSeed().users
  const [tab, setTab] = useState('in')
  const [f, setF] = useState({ email: '', password: '', name: '', title: '' })
  const [info, setInfo] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [regModal, setRegModal] = useState(false)
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    title: '',
    requestedRole: ROLES.PROGRAM_OFFICER,
    requestedProjectIds: ['p1'],
    note: '',
  })

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

  const handleDemoRegister = (e) => {
    e.preventDefault()
    if (!regForm.name.trim() || !regForm.email.trim()) return
    const newUser = store.registerUser(regForm)
    setRegModal(false)
    store.loginAs(newUser.id)
  }

  return (
    <div className="login">
      <div className="login-art">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ background: '#fff', display: 'inline-block', padding: '10px 14px', borderRadius: 14 }}><img src="/ueh-logo.png" alt="UEH University" style={{ height: 44, display: 'block' }} /></div>
        </div>
        <h1 style={{ position: 'relative', zIndex: 1 }}>Điều phối công việc<br /><em>phân quyền rõ vai trò.</em></h1>
        <p style={{ position: 'relative', zIndex: 1 }}>UEH WorkHub tích hợp hệ thống phân quyền 4 vai trò: Quản lý dự án, Quản trị đào tạo, Điều phối viên và Giảng viên — kiểm soát truy cập và phê duyệt thành viên trước khi gán vào dự án.</p>
        <div className="login-feats">
          <div><L.ShieldCheck size={18} color="#ffb27a" />Phân quyền hệ thống 4 vai trò</div>
          <div><L.UserCheck size={18} color="#ffb27a" />Quy trình duyệt thành viên chờ phê duyệt</div>
          <div><L.FolderKanban size={18} color="#ffb27a" />Phân lập dữ liệu theo dự án</div>
          <div><L.BadgeCheck size={18} color="#ffb27a" />Quy trình gửi & phê duyệt công việc</div>
        </div>
      </div>
      <div className="login-form">
        {store.mode === 'demo' ? (
          <>
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Chào mừng trở lại 👋</h2>
                <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                  Bản demo: chọn tài khoản để trải nghiệm theo từng vai trò phân quyền.
                </p>
              </div>
              <button
                type="button"
                className="btn sm"
                style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 600 }}
                onClick={() => setRegModal(true)}
              >
                <L.UserPlus size={14} />
                Đăng ký mới
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14, maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
              {demoUsers.map((u) => {
                const roleCfg = getRoleConfig(u.role)
                const isPending = u.status === USER_STATUS.PENDING
                const isRejected = u.status === USER_STATUS.REJECTED

                return (
                  <button key={u.id} className="login-user" onClick={() => store.loginAs(u.id)}>
                    <Avatar user={u} size={38} />
                    <span className="grow" style={{ textAlign: 'left' }}>
                      <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                        <b>{u.name}</b>
                        {isPending && (
                          <span className="badge" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontSize: 10 }}>
                            ⏳ Chờ duyệt
                          </span>
                        )}
                        {isRejected && (
                          <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', fontSize: 10 }}>
                            Từ chối
                          </span>
                        )}
                      </div>
                      <div className="muted small">{u.title}</div>
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: isPending ? '#fef3c7' : roleCfg.bg,
                        color: isPending ? '#92400e' : roleCfg.color,
                        border: `1px solid ${isPending ? '#fde68a' : roleCfg.borderColor}`,
                        fontSize: 10.5,
                        fontWeight: 600,
                      }}
                    >
                      {roleCfg.shortName}
                    </span>
                    <L.ChevronRight size={16} className="faint" />
                  </button>
                )
              })}
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
                  <div className="field"><label>Chức danh</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="VD: Giảng viên Rennes / Chuyên viên" /></div>
                </div>
                <div className="callout info"><L.ShieldCheck size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} /><div>Tài khoản đăng ký mới sẽ ở trạng thái <b>Chờ duyệt</b>. Quản lý dự án sẽ xem xét và phân quyền dự án cho bạn.</div></div>
              </>
            )}
            <div className="field"><label>Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div className="field"><label>Mật khẩu</label><input className="input" type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
            {info && <div className="callout info"><L.MailCheck size={18} color="var(--teal-700)" style={{ flexShrink: 0 }} />{info}</div>}
            {err && <div className="callout review"><L.CircleAlert size={18} color="var(--orange-600)" style={{ flexShrink: 0 }} />{err}</div>}
            <button className="btn primary" disabled={busy}>{busy ? 'Đang xử lý…' : tab === 'in' ? 'Đăng nhập' : 'Tạo tài khoản & gửi duyệt'}</button>
          </form>
        )}
        {store.mode === 'supabase' && <div className="demo-link">Muốn xem thử trước? <button type="button" onClick={enterDemo}>Xem bản demo với dữ liệu mẫu</button></div>}
        {store.mode === 'demo' && HAS_SUPABASE && <div className="demo-link"><button type="button" onClick={exitDemo}>← Quay lại đăng nhập tài khoản thật</button></div>}
      </div>

      {/* Modal đăng ký thành viên mới trong Demo */}
      {regModal && (
        <Modal
          title="Đăng ký tài khoản mới (Kiểm tra quy trình Chờ duyệt)"
          onClose={() => setRegModal(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setRegModal(false)}>Hủy</button>
              <button className="btn primary" onClick={handleDemoRegister}>Gửi yêu cầu đăng ký</button>
            </>
          }
        >
          <form onSubmit={handleDemoRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="muted small">
              Tài khoản sau khi gửi sẽ ở trạng thái <b>Chờ duyệt</b>. Hệ thống sẽ tự động đăng nhập vào tài khoản này để bạn trải nghiệm màn hình Chờ duyệt, sau đó bạn có thể chuyển sang Quản lý dự án để duyệt.
            </p>
            <div className="grid2">
              <div className="field">
                <label>Họ và tên *</label>
                <input
                  className="input"
                  required
                  placeholder="VD: TS. Eric Dupont"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Email liên hệ *</label>
                <input
                  className="input"
                  type="email"
                  required
                  placeholder="VD: eric.dupont@univ-rennes.fr"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid2">
              <div className="field">
                <label>Chức danh</label>
                <input
                  className="input"
                  placeholder="VD: Giảng viên Thỉnh giảng"
                  value={regForm.title}
                  onChange={(e) => setRegForm({ ...regForm, title: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Vai trò đề xuất</label>
                <select
                  className="select"
                  value={regForm.requestedRole}
                  onChange={(e) => setRegForm({ ...regForm, requestedRole: e.target.value })}
                >
                  <option value={ROLES.PROGRAM_OFFICER}>Program Officer (Điều phối viên)</option>
                  <option value={ROLES.ACADEMIC_ADMIN}>Academic Admin (Trợ lý / Quản trị đào tạo)</option>
                  <option value={ROLES.ASSISTANT}>Project Assistant (Trợ lý dự án)</option>
                  <option value={ROLES.MEMBER}>Member (Thành viên)</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Lý do đăng ký / Ghi chú</label>
              <input
                className="input"
                placeholder="VD: Tham gia giảng dạy đợt công tác học kỳ mới"
                value={regForm.note}
                onChange={(e) => setRegForm({ ...regForm, note: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
