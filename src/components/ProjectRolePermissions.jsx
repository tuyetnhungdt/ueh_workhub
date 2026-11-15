import { useState } from 'react'
import * as L from 'lucide-react'
import { PROJECT_TABS_METADATA, DEFAULT_PROJECT_ROLES, getDefaultRolePermissions, getRoleConfig } from '../data/rbac.js'
import { MODULE_CATALOG } from '../modules/moduleCatalog.js'
import { Icon } from './ui.jsx'

export default function ProjectRolePermissions({ project, modulesConfig = [], value = {}, onChange }) {
  // Đảm bảo value đã được khởi tạo từ defaults
  const permissions = Object.keys(value).length > 0 ? value : getDefaultRolePermissions(project)
  const [selectedRoleId, setSelectedRoleId] = useState('program_officer')
  const [newRoleModal, setNewRoleModal] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')

  // Lấy danh sách các module đang được BẬT trong dự án
  const activeModules = modulesConfig.length > 0
    ? modulesConfig.filter((m) => m.isEnabled !== false)
    : MODULE_CATALOG.filter((m) => m.category === 'core' || m.category === 'academic').map((m, i) => ({
        moduleKey: m.key,
        isEnabled: true,
        customTitle: m.defaultTitle,
        customDesc: m.defaultDesc,
        customIcon: m.defaultIcon,
        sortOrder: i + 1,
      }))

  const roleKeys = Object.keys(permissions)
  const currentRole = permissions[selectedRoleId] || permissions[roleKeys[0]] || {}
  const isManagerRole = selectedRoleId === 'manager' || currentRole.isManager

  // Đếm số thành viên trong dự án có vai trò này
  const countMembersWithRole = (rId) => {
    return (project?.members || []).filter((m) => m.role === rId).length
  }

  const handleUpdateCurrentRole = (field, val) => {
    const updated = {
      ...permissions,
      [selectedRoleId]: {
        ...currentRole,
        [field]: val,
      },
    }
    onChange(updated)
  }

  const handleToggleTab = (tabId) => {
    if (isManagerRole) return
    const tabs = currentRole.tabs || []
    const nextTabs = tabs.includes(tabId) ? tabs.filter((t) => t !== tabId) : [...tabs, tabId]
    handleUpdateCurrentRole('tabs', nextTabs)
  }

  const handleToggleModule = (modKey) => {
    if (isManagerRole) return
    let currentMods = currentRole.modules || []
    if (currentMods.includes('*')) {
      currentMods = activeModules.map((m) => m.moduleKey)
    }
    const nextMods = currentMods.includes(modKey)
      ? currentMods.filter((k) => k !== modKey)
      : [...currentMods, modKey]
    handleUpdateCurrentRole('modules', nextMods)
  }

  const handleSelectAll = () => {
    if (isManagerRole) return
    handleUpdateCurrentRole('tabs', PROJECT_TABS_METADATA.map((t) => t.id))
    handleUpdateCurrentRole('modules', activeModules.map((m) => m.moduleKey))
  }

  const handleDeselectAll = () => {
    if (isManagerRole) return
    handleUpdateCurrentRole('tabs', ['work']) // Giữ lại tab Bàn làm việc tối thiểu
    handleUpdateCurrentRole('modules', [])
  }

  const handleResetToDefault = () => {
    const defaults = getDefaultRolePermissions(project)
    if (defaults[selectedRoleId]) {
      const updated = {
        ...permissions,
        [selectedRoleId]: { ...defaults[selectedRoleId] },
      }
      onChange(updated)
    }
  }

  const handleAddCustomRole = () => {
    const name = newRoleName.trim()
    if (!name) return
    const roleId = 'cr_' + Date.now().toString(36)
    const newRole = {
      roleId,
      name,
      shortName: name,
      desc: newRoleDesc.trim() || `Vai trò chuyên trách ${name} thuộc dự án`,
      tabs: ['work', 'list', 'progress'],
      modules: ['docs', 'report'],
      isCustom: true,
      isManager: false,
    }
    const updated = {
      ...permissions,
      [roleId]: newRole,
    }
    onChange(updated)
    setSelectedRoleId(roleId)
    setNewRoleName('')
    setNewRoleDesc('')
    setNewRoleModal(false)
  }

  const handleDeleteRole = (rId) => {
    if (['manager', 'academic_admin', 'program_officer', 'assistant', 'member'].includes(rId)) {
      alert('Không thể xóa vai trò mặc định của hệ thống. Bạn có thể thu hồi quyền truy cập đề mục của vai trò này.')
      return
    }
    if (confirm(`Bạn có chắc muốn xóa vai trò "${permissions[rId]?.name}" khỏi dự án này?`)) {
      const updated = { ...permissions }
      delete updated[rId]
      onChange(updated)
      setSelectedRoleId(Object.keys(updated)[0] || 'manager')
    }
  }

  const roleTabs = currentRole.tabs || []
  const roleMods = currentRole.modules || []
  const hasAllMods = roleMods.includes('*')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Banner hướng dẫn */}
      <div
        className="card card-pad"
        style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
          border: '1px solid #99f6e4',
          padding: '12px 16px',
        }}
      >
        <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <L.ShieldCheck size={22} color="var(--teal-700)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <b style={{ color: '#0f766e', fontSize: 13.5 }}>
              Ma trận Phân quyền Đề mục theo Vai trò Dự án (Project-level RBAC)
            </b>
            <p className="small muted" style={{ margin: '4px 0 0', lineHeight: 1.45 }}>
              Mỗi dự án có vai trò và phạm vi nghiệp vụ riêng biệt. Tại đây, bạn có thể thiết lập chính xác các{' '}
              <b>Tab dự án</b> và <b>Phân hệ Bàn làm việc</b> mà từng vai trò được phép truy cập trong phạm vi dự án này.
            </p>
          </div>
        </div>
      </div>

      {/* Roster / Role Pills Selector */}
      <div>
        <div className="row between wrap" style={{ gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <label className="small muted" style={{ fontWeight: 600 }}>
            Chọn vai trò cần cấu hình quyền hạn ({roleKeys.length} vai trò trong dự án):
          </label>
          <button
            type="button"
            className="btn sm"
            style={{ fontSize: 11.5, background: '#fff', borderColor: '#cbd5e1' }}
            onClick={() => setNewRoleModal(true)}
          >
            <L.Plus size={13} />
            + Thêm vai trò đặc thù cho dự án
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {roleKeys.map((rId) => {
            const rInfo = permissions[rId] || {}
            const cfg = getRoleConfig(rId, project)
            const isSelected = selectedRoleId === rId
            const memberCount = countMembersWithRole(rId)

            return (
              <button
                key={rId}
                type="button"
                className="card card-pad"
                onClick={() => setSelectedRoleId(rId)}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--teal-600)' : '1px solid #e2e8f0',
                  background: isSelected ? '#f0fdfa' : '#ffffff',
                  boxShadow: isSelected ? '0 2px 4px rgba(15,118,110,0.1)' : 'none',
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: cfg.color || '#0284c7',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: 13, color: '#1e293b' }}>
                  {rInfo.name || cfg.viName || rId}
                </span>
                {memberCount > 0 && (
                  <span
                    className="chip"
                    style={{ fontSize: 10, padding: '1px 5px', background: '#e2e8f0', color: '#475569' }}
                    title={`${memberCount} nhân sự đang giữ vai trò này trong dự án`}
                  >
                    {memberCount} TV
                  </span>
                )}
                {rInfo.isCustom && (
                  <span className="chip" style={{ fontSize: 9.5, background: '#fef3c7', color: '#b45309' }}>
                    Tùy chỉnh
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chi tiết phân quyền cho vai trò đang chọn */}
      <div
        className="card card-pad"
        style={{
          border: '1px solid #cbd5e1',
          background: '#ffffff',
          padding: '16px',
        }}
      >
        {/* Header vai trò đang chọn */}
        <div
          className="row between wrap"
          style={{
            alignItems: 'center',
            paddingBottom: 12,
            borderBottom: '1px solid #f1f5f9',
            marginBottom: 14,
            gap: 10,
          }}
        >
          <div>
            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
              <span
                className="badge"
                style={{
                  background: getRoleConfig(selectedRoleId, project).bg,
                  color: getRoleConfig(selectedRoleId, project).color,
                  border: `1px solid ${getRoleConfig(selectedRoleId, project).borderColor || '#e2e8f0'}`,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '3px 10px',
                }}
              >
                {currentRole.name || getRoleConfig(selectedRoleId, project).viName}
              </span>
              {isManagerRole && (
                <span className="chip" style={{ background: '#ffedd5', color: '#c2410c', fontWeight: 600 }}>
                  ⭐ Toàn quyền quản trị dự án
                </span>
              )}
            </div>
            <p className="small muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
              {currentRole.desc || getRoleConfig(selectedRoleId, project).desc}
            </p>
          </div>

          <div className="row wrap" style={{ gap: 6 }}>
            {!isManagerRole && (
              <>
                <button type="button" className="btn sm ghost" onClick={handleSelectAll}>
                  <L.CheckSquare size={13} />
                  Chọn tất cả
                </button>
                <button type="button" className="btn sm ghost" onClick={handleDeselectAll}>
                  <L.Square size={13} />
                  Bỏ chọn tất cả
                </button>
                <button type="button" className="btn sm ghost" onClick={handleResetToDefault}>
                  <L.RotateCcw size={13} />
                  Khôi phục chuẩn
                </button>
              </>
            )}
            {currentRole.isCustom && (
              <button
                type="button"
                className="btn sm danger"
                onClick={() => handleDeleteRole(selectedRoleId)}
              >
                <L.Trash2 size={13} />
                Xóa vai trò này
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: CÁC TAB DỰ ÁN */}
        <div style={{ marginBottom: 20 }}>
          <div className="row between" style={{ alignItems: 'center', marginBottom: 8 }}>
            <b style={{ fontSize: 13, color: '#334155' }}>
              1. Quyền truy cập các Tab dự án ({roleTabs.length}/{PROJECT_TABS_METADATA.length} tab):
            </b>
            <span className="small muted" style={{ fontSize: 11 }}>
              Tab 'Bàn làm việc' là phân hệ nghiệp vụ chính
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 8,
            }}
          >
            {PROJECT_TABS_METADATA.map((tab) => {
              const isChecked = isManagerRole || roleTabs.includes(tab.id)
              return (
                <label
                  key={tab.id}
                  className="card card-pad row"
                  style={{
                    gap: 10,
                    alignItems: 'center',
                    cursor: isManagerRole ? 'default' : 'pointer',
                    padding: '8px 12px',
                    background: isChecked ? '#f8fafc' : '#ffffff',
                    border: isChecked ? '1px solid #94a3b8' : '1px dashed #cbd5e1',
                    opacity: isChecked ? 1 : 0.6,
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isManagerRole || tab.id === 'work'}
                    onChange={() => handleToggleTab(tab.id)}
                  />
                  <Icon name={tab.icon} size={16} color="var(--teal-700)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isChecked ? 600 : 400, fontSize: 12.5 }}>{tab.label}</div>
                    <div className="faint" style={{ fontSize: 10.5 }}>{tab.desc}</div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* SECTION 2: CÁC PHÂN HỆ BÀN LÀM VIỆC */}
        <div>
          <div className="row between" style={{ alignItems: 'center', marginBottom: 8 }}>
            <b style={{ fontSize: 13, color: '#334155' }}>
              2. Quyền truy cập Phân hệ Bàn làm việc ({hasAllMods ? activeModules.length : roleMods.length}/{activeModules.length} phân hệ đang bật):
            </b>
            <span className="small muted" style={{ fontSize: 11 }}>
              Tùy biến cho từng nghiệp vụ: Học vụ, Tài chính, Vé máy bay, Giảng viên...
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 8,
            }}
          >
            {activeModules.map((mod) => {
              const baseInfo = MODULE_CATALOG.find((x) => x.key === mod.moduleKey) || {}
              const isChecked = isManagerRole || hasAllMods || roleMods.includes(mod.moduleKey)

              return (
                <label
                  key={mod.moduleKey}
                  className="card card-pad"
                  style={{
                    padding: '8px 12px',
                    cursor: isManagerRole ? 'default' : 'pointer',
                    background: isChecked ? '#f0fdfa' : '#ffffff',
                    border: isChecked ? '1px solid #99f6e4' : '1px dashed #cbd5e1',
                    opacity: isChecked ? 1 : 0.6,
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isManagerRole}
                    onChange={() => handleToggleModule(mod.moduleKey)}
                  />
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: isChecked ? '#ccfbf1' : '#f1f5f9',
                      color: isChecked ? '#0f766e' : '#94a3b8',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={mod.customIcon || baseInfo.defaultIcon || 'Folder'} size={15} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ellipsis" style={{ fontWeight: isChecked ? 600 : 400, fontSize: 12.5 }}>
                      {mod.customTitle || baseInfo.defaultTitle || mod.moduleKey}
                    </div>
                    <div className="faint ellipsis" style={{ fontSize: 10.5 }}>
                      {mod.customDesc || baseInfo.defaultDesc || ''}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {isManagerRole && (
          <div
            style={{
              marginTop: 14,
              padding: '8px 12px',
              borderRadius: 6,
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#9a3412',
              fontSize: 12,
            }}
          >
            💡 <b>Ghi chú:</b> Vai trò Quản lý dự án (Project Manager) luôn có toàn quyền truy cập tất cả đề mục của dự án này để điều phối và quản trị.
          </div>
        )}
      </div>

      {/* Modal Thêm vai trò mới cho dự án */}
      {newRoleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="card card-pad"
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#fff',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div className="row between" style={{ alignItems: 'center', marginBottom: 12 }}>
              <b style={{ fontSize: 15 }}>Thêm vai trò đặc thù cho dự án này</b>
              <button
                type="button"
                className="iconbtn"
                onClick={() => setNewRoleModal(false)}
              >
                <L.X size={16} />
              </button>
            </div>

            <div className="field" style={{ marginBottom: 12 }}>
              <label>Tên vai trò *</label>
              <input
                className="input"
                autoFocus
                placeholder="VD: Chuyên gia tư vấn đề án, Điều phối viên tuyển sinh..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label>Mô tả nhiệm vụ & quyền hạn</label>
              <textarea
                className="textarea"
                rows={2}
                placeholder="VD: Phụ trách khảo sát thực địa, biên tập chuyên đề..."
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
              />
            </div>

            <div className="row end" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setNewRoleModal(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={!newRoleName.trim()}
                onClick={handleAddCustomRole}
              >
                Thêm vai trò
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
