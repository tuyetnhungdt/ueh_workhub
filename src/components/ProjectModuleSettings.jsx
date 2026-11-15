import { useState } from 'react'
import * as L from 'lucide-react'
import { MODULE_CATALOG, PROJECT_TEMPLATES } from '../modules/moduleCatalog.js'
import { Icon } from './ui.jsx'

export default function ProjectModuleSettings({ project, value = [], onChange }) {
  const [template, setTemplate] = useState('custom')

  // Khởi tạo danh sách modules nếu chưa có
  const currentList = value.length > 0 ? value : MODULE_CATALOG.map((m, i) => ({
    moduleKey: m.key,
    isEnabled: true,
    customTitle: m.defaultTitle,
    customDesc: m.defaultDesc,
    customIcon: m.defaultIcon,
    sortOrder: i + 1,
  }))

  const handleApplyTemplate = (tplKey) => {
    setTemplate(tplKey)
    const tpl = PROJECT_TEMPLATES[tplKey]
    if (!tpl) return

    // Tạo config mới từ template
    const newConfigs = MODULE_CATALOG.map((baseMod) => {
      const matched = tpl.modules.find((m) => m.moduleKey === baseMod.key)
      if (matched) {
        return {
          moduleKey: baseMod.key,
          isEnabled: matched.isEnabled,
          customTitle: matched.customTitle || baseMod.defaultTitle,
          customDesc: matched.customDesc || baseMod.defaultDesc,
          customIcon: matched.customIcon || baseMod.defaultIcon,
          sortOrder: matched.sortOrder || 99,
        }
      }
      return {
        moduleKey: baseMod.key,
        isEnabled: false,
        customTitle: baseMod.defaultTitle,
        customDesc: baseMod.defaultDesc,
        customIcon: baseMod.defaultIcon,
        sortOrder: 99,
      }
    }).sort((a, b) => a.sortOrder - b.sortOrder)

    onChange(newConfigs)
  }

  const handleToggle = (key) => {
    const next = currentList.map((m) => (m.moduleKey === key ? { ...m, isEnabled: !m.isEnabled } : m))
    onChange(next)
  }

  const handleUpdate = (key, field, val) => {
    const next = currentList.map((m) => (m.moduleKey === key ? { ...m, [field]: val } : m))
    onChange(next)
  }

  const handleMove = (index, direction) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= currentList.length) return
    const next = [...currentList]
    const temp = next[index]
    next[index] = next[targetIdx]
    next[targetIdx] = temp
    // Cập nhật lại sortOrder
    next.forEach((item, idx) => {
      item.sortOrder = idx + 1
    })
    onChange(next)
  }

  const enabledCount = currentList.filter((m) => m.isEnabled !== false).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1-Click Preset Templates */}
      <div>
        <label className="small muted" style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
          Mẫu phân hệ có sẵn (1-Click Project Templates):
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
          {Object.values(PROJECT_TEMPLATES).map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              className="card card-pad"
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                border: template === tpl.id ? '2px solid var(--teal-600)' : '1px solid #e2e8f0',
                background: template === tpl.id ? '#f0fdfa' : '#ffffff',
                transition: 'all 0.15s ease',
              }}
              onClick={() => handleApplyTemplate(tpl.id)}
            >
              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <Icon name={tpl.icon} size={18} />
                <b style={{ fontSize: 13 }}>{tpl.name}</b>
              </div>
              <p className="faint small" style={{ margin: '6px 0 0', lineHeight: 1.4, fontSize: 11.5 }}>
                {tpl.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Module Configuration List */}
      <div>
        <div className="row between" style={{ alignItems: 'center', marginBottom: 10 }}>
          <b style={{ fontSize: 14 }}>
            Tùy biến & Bật/Tắt Phân hệ Bàn làm việc ({enabledCount}/{currentList.length} đang bật):
          </b>
          <span className="small muted">Dùng nút ▲ ▼ để sắp xếp thứ tự hiển thị</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {currentList.map((m, idx) => {
            const baseInfo = MODULE_CATALOG.find((x) => x.key === m.moduleKey) || {}
            const isEnabled = m.isEnabled !== false

            return (
              <div
                key={m.moduleKey}
                className="card card-pad"
                style={{
                  padding: '10px 14px',
                  background: isEnabled ? '#ffffff' : '#f8fafc',
                  border: isEnabled ? '1px solid #cbd5e1' : '1px dashed #cbd5e1',
                  opacity: isEnabled ? 1 : 0.65,
                }}
              >
                <div className="row between wrap" style={{ gap: 10, alignItems: 'center' }}>
                  {/* Left: Reorder controls + Icon + Title edit */}
                  <div className="row" style={{ gap: 10, alignItems: 'center', flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button
                        type="button"
                        className="iconbtn"
                        style={{ width: 20, height: 20, padding: 0 }}
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, -1)}
                        title="Di chuyển lên trên"
                      >
                        <L.ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="iconbtn"
                        style={{ width: 20, height: 20, padding: 0 }}
                        disabled={idx === currentList.length - 1}
                        onClick={() => handleMove(idx, 1)}
                        title="Di chuyển xuống dưới"
                      >
                        <L.ChevronDown size={14} />
                      </button>
                    </div>

                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isEnabled ? 'var(--teal-50)' : '#e2e8f0',
                        color: isEnabled ? 'var(--teal-700)' : '#94a3b8',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={m.customIcon || baseInfo.defaultIcon || 'Folder'} size={17} />
                    </span>

                    <div style={{ flex: 1 }}>
                      <input
                        className="input sm"
                        style={{ fontWeight: 600, fontSize: 13, width: '100%', maxWidth: 300 }}
                        value={m.customTitle || baseInfo.defaultTitle || ''}
                        disabled={!isEnabled}
                        onChange={(e) => handleUpdate(m.moduleKey, 'customTitle', e.target.value)}
                        placeholder="Tên hiển thị phân hệ"
                      />
                    </div>
                  </div>

                  {/* Right: Category chip + Enable/Disable Toggle */}
                  <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                    <span
                      className="chip"
                      style={{
                        fontSize: 10.5,
                        background: baseInfo.category === 'core' ? '#e0f2fe' : '#fef3c7',
                        color: baseInfo.category === 'core' ? '#0369a1' : '#92400e',
                      }}
                    >
                      {baseInfo.category === 'core' ? 'Module Lõi' : 'Đặc thù'}
                    </span>

                    <label className="row" style={{ gap: 6, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggle(m.moduleKey)}
                      />
                      <span style={{ fontWeight: isEnabled ? 600 : 400 }}>
                        {isEnabled ? 'Đang bật' : 'Đã tắt'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Subtitle / Description edit */}
                {isEnabled && (
                  <div style={{ marginTop: 8, paddingLeft: 42 }}>
                    <input
                      className="input sm"
                      style={{ fontSize: 11.5, color: '#475569', width: '100%' }}
                      value={m.customDesc || baseInfo.defaultDesc || ''}
                      onChange={(e) => handleUpdate(m.moduleKey, 'customDesc', e.target.value)}
                      placeholder="Mô tả tóm tắt phân hệ này dùng làm gì..."
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
