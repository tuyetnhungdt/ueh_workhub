import * as L from 'lucide-react'
import { useStore } from '../data/store.jsx'
import { USER_STATUS, getRoleConfig } from '../data/rbac.js'
import { Avatar } from './ui.jsx'
import { fmtDate, timeAgo } from '../lib/utils.js'

export default function PendingApprovalView() {
  const { me, state, loginAs, logout, mode } = useStore()

  if (!me) return null

  const isPending = me.status === USER_STATUS.PENDING
  const isRejected = me.status === USER_STATUS.REJECTED
  const roleCfg = getRoleConfig(me.requestedRole || me.role)
  const projects = state?.projects || []
  const requestedProjects = projects.filter((p) => (me.requestedProjectIds || ['p1']).includes(p.id))

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
        padding: 24,
      }}
    >
      <div
        className="card card-pad"
        style={{
          maxWidth: 620,
          width: '100%',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/ueh-logo.png" alt="UEH University" style={{ height: 48, display: 'inline-block' }} />
          <h2 style={{ fontSize: 22, marginTop: 12, marginBottom: 4 }}>Cổng điều phối UEH WorkHub</h2>
          <div className="muted small">Hệ thống phân quyền bảo mật & kiểm soát truy cập</div>
        </div>

        {/* Status Banner */}
        {isPending && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#fef3c7',
                display: 'grid',
                placeItems: 'center',
                color: '#d97706',
                flexShrink: 0,
              }}
            >
              <L.Clock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#92400e', fontSize: 16 }}>
                Tài khoản đang chờ phê duyệt
              </div>
              <div style={{ color: '#b45309', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                Yêu cầu tham gia của bạn đã được ghi nhận vào hệ thống. Quản lý dự án đang xem xét hồ sơ và phân quyền dự án phù hợp trước khi bạn có thể truy cập dữ liệu vận hành.
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'grid',
                placeItems: 'center',
                color: '#dc2626',
                flexShrink: 0,
              }}
            >
              <L.AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#991b1b', fontSize: 16 }}>
                Yêu cầu truy cập chưa được chấp thuận (Access Rejected)
              </div>
              <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                Rất tiếc, yêu cầu tham gia hệ thống của bạn đã bị từ chối bởi Quản trị viên.
                {me.rejectionReason && (
                  <div style={{ marginTop: 6, fontWeight: 600 }}>
                    Lý do: <i>"{me.rejectionReason}"</i>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Registration Details Card */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div className="row" style={{ gap: 14, alignItems: 'center', marginBottom: 14 }}>
            <Avatar user={me} size={48} />
            <div>
              <b style={{ fontSize: 16 }}>{me.name}</b>
              <div className="muted small">{me.title} · {me.email}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
            <div>
              <span className="muted" style={{ display: 'block', fontSize: 12 }}>Vai trò đề xuất:</span>
              <span
                className="badge"
                style={{
                  background: roleCfg.bg,
                  color: roleCfg.color,
                  border: `1px solid ${roleCfg.borderColor}`,
                  marginTop: 2,
                }}
              >
                {roleCfg.name} ({roleCfg.viName})
              </span>
            </div>
            <div>
              <span className="muted" style={{ display: 'block', fontSize: 12 }}>Thời điểm đăng ký:</span>
              <b>{me.registeredAt ? fmtDate(me.registeredAt.slice(0, 10)) : 'Gần đây'}</b>
              {me.registeredAt && <span className="faint small"> ({timeAgo(me.registeredAt)})</span>}
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 13 }}>
            <span className="muted" style={{ display: 'block', fontSize: 12 }}>Chương trình / Dự án đăng ký tham gia:</span>
            <div className="row wrap" style={{ gap: 6, marginTop: 4 }}>
              {requestedProjects.map((p) => (
                <span
                  key={p.id}
                  className="chip"
                  style={{ fontSize: 11.5, background: '#fff', border: '1px solid #cbd5e1' }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block', marginRight: 4 }} />
                  {p.name} ({p.code})
                </span>
              ))}
            </div>
          </div>

          {me.note && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: '#475569' }}>
              <span className="muted" style={{ display: 'block', fontSize: 12 }}>Ghi chú của người đăng ký:</span>
              <i>"{me.note}"</i>
            </div>
          )}
        </div>

        {/* Demo Fast Track Button */}
        {mode === 'demo' && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px dashed #86efac',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div className="small" style={{ color: '#166534' }}>
              <L.Zap size={15} style={{ verticalAlign: 'middle', marginRight: 4, display: 'inline' }} />
              <b>Thao tác nhanh cho người đánh giá:</b> Đăng nhập ngay với tư cách <b>Quản lý dự án</b> để mở màn hình phê duyệt và duyệt thành viên này.
            </div>
            <button
              type="button"
              className="btn sm primary"
              style={{ background: '#059669', borderColor: '#059669', flexShrink: 0 }}
              onClick={() => loginAs('u1')}
            >
              Chuyển sang Quản lý dự án
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="row between" style={{ alignItems: 'center' }}>
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => window.location.reload()}
          >
            <L.RotateCcw size={14} />
            Làm mới trạng thái
          </button>
          <button
            type="button"
            className="btn sm danger"
            onClick={() => logout()}
          >
            <L.LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}
