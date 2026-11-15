import React from 'react'
import * as L from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
    this.setState({ errorInfo })
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.resetError)
          : this.props.fallback
      }

      return (
        <div
          className="card"
          style={{
            margin: '20px auto',
            maxWidth: 640,
            padding: '32px 24px',
            textAlign: 'center',
            background: '#ffffff',
            border: '1px solid #fed7aa',
            borderRadius: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <L.AlertTriangle size={28} />
          </div>

          <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#9a3412', fontWeight: 700 }}>
            {this.props.title || 'Đã xảy ra sự cố khi tải nội dung này'}
          </h3>

          <p style={{ margin: '0 0 20px', fontSize: 13.5, color: '#64748b', lineHeight: 1.5 }}>
            {this.props.message || 'Hệ thống đã tự động bảo vệ để tránh lỗi màn hình trắng. Bạn có thể bấm thử lại hoặc quay lại trang làm việc.'}
          </p>

          <div className="row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn primary sm"
              onClick={this.resetError}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <L.RotateCcw size={14} /> Thử lại
            </button>

            <button
              type="button"
              className="btn sm"
              onClick={() => {
                window.location.hash = '#/'
                this.resetError()
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <L.LayoutDashboard size={14} /> Về Tổng quan
            </button>

            <button
              type="button"
              className="btn sm ghost"
              onClick={() => window.location.reload()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <L.RefreshCw size={14} /> Tải lại trang
            </button>
          </div>

          {this.state.error && (
            <details style={{ marginTop: 24, textAlign: 'left', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}>
              <summary style={{ cursor: 'pointer', color: '#64748b', fontWeight: 600 }}>
                Chi tiết kỹ thuật
              </summary>
              <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#dc2626', fontFamily: 'monospace', fontSize: 11.5 }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
