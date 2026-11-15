import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import * as L from 'lucide-react'

/**
 * ExcelColumnHeader
 * Component tiêu đề cột theo chuẩn bảng tính Excel / Google Sheets:
 * - Hiển thị tên cột, chỉ báo sắp xếp (▲ / ▼), chỉ báo lọc (icon phễu khi đang lọc).
 * - Nút mở menu tiện ích cạnh tên cột.
 * - Popover nổi cố định (không bị che bởi overflow bảng):
 *   + Sắp xếp tăng dần (A → Z hoặc Nhỏ đến lớn)
 *   + Sắp xếp giảm dần (Z → A hoặc Lớn đến nhỏ)
 *   + Bỏ sắp xếp
 *   + Lọc theo danh sách giá trị độc nhất kèm đếm số lượng bản ghi
 *   + Hộp tìm kiếm nhanh giá trị khi danh sách dài
 *   + Nút Bỏ lọc cột / Chọn tất cả
 */
export function ExcelColumnHeader({
  colKey,
  label,
  type = 'text',
  align = 'left',
  isTitle = false,
  sortConfig,
  onSort,
  filterValue,
  onFilter,
  uniqueValues = [],
  activeMenuCol,
  setActiveMenuCol
}) {
  const btnRef = useRef(null)
  const popoverRef = useRef(null)
  const searchInputRef = useRef(null)
  const [valSearch, setValSearch] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const isOpen = activeMenuCol === colKey
  const isSorted = sortConfig?.key === colKey
  const sortDir = isSorted ? sortConfig.direction : null

  // Trạng thái lọc của cột này
  const isFiltered = useMemo(() => {
    if (!filterValue) return false
    if (Array.isArray(filterValue)) {
      return filterValue.length > 0 && filterValue.length < uniqueValues.length
    }
    return Boolean(filterValue)
  }, [filterValue, uniqueValues.length])

  // Tập hợp các giá trị đang được chọn (nếu đang lọc)
  const selectedSet = useMemo(() => {
    if (!isFiltered) return null // null nghĩa là chọn tất cả
    if (Array.isArray(filterValue)) return new Set(filterValue)
    return new Set([filterValue])
  }, [isFiltered, filterValue])

  // Cập nhật vị trí của popover khi mở ra
  useEffect(() => {
    if (isOpen && btnRef.current) {
      const updatePos = () => {
        if (!btnRef.current) return
        const rect = btnRef.current.getBoundingClientRect()
        const popW = 270
        let left = rect.left
        if (left + popW > window.innerWidth - 12) {
          left = window.innerWidth - popW - 12
        }
        if (left < 12) left = 12

        let top = rect.bottom + 5
        const estHeight = 360
        if (top + estHeight > window.innerHeight - 12 && rect.top > estHeight + 12) {
          top = rect.top - estHeight - 5
        }

        setPos({ top, left })
      }

      updatePos()
      window.addEventListener('resize', updatePos)
      window.addEventListener('scroll', updatePos, true)
      return () => {
        window.removeEventListener('resize', updatePos)
        window.removeEventListener('scroll', updatePos, true)
      }
    }
  }, [isOpen])

  // Focus ô tìm kiếm khi mở popover
  useEffect(() => {
    if (isOpen) {
      setValSearch('')
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus()
      }, 50)
    }
  }, [isOpen])

  // Đóng khi click ngoài hoặc ấn ESC
  useEffect(() => {
    if (!isOpen) return
    const handleDown = (e) => {
      if (popoverRef.current && popoverRef.current.contains(e.target)) return
      if (btnRef.current && btnRef.current.contains(e.target)) return
      setActiveMenuCol(null)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setActiveMenuCol(null)
    }
    document.addEventListener('mousedown', handleDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, setActiveMenuCol])

  // Danh sách giá trị sau khi tìm kiếm
  const filteredUniqueValues = useMemo(() => {
    if (!valSearch.trim()) return uniqueValues
    const q = valSearch.toLowerCase().trim()
    return uniqueValues.filter((v) => String(v.value).toLowerCase().includes(q))
  }, [uniqueValues, valSearch])

  const totalCount = useMemo(() => {
    return uniqueValues.reduce((s, x) => s + (x.count || 0), 0)
  }, [uniqueValues])

  const isNumeric = ['number', 'money'].includes(type)
  const isDate = type === 'date'

  // Xử lý chọn 1 giá trị duy nhất (khi click vào text)
  const handleSelectSingleValue = (val) => {
    if (isFiltered && selectedSet && selectedSet.size === 1 && selectedSet.has(val)) {
      // Đang chọn đúng giá trị này -> bỏ lọc (trở về chọn tất cả)
      onFilter(null)
    } else {
      onFilter(val)
    }
  }

  // Xử lý toggle checkbox của từng giá trị
  const handleToggleCheckbox = (val) => {
    if (!isFiltered || !selectedSet) {
      // Đang ở trạng thái Tất cả -> bỏ giá trị này ra
      const newSelected = uniqueValues.map((x) => x.value).filter((v) => v !== val)
      onFilter(newSelected)
    } else {
      const newSet = new Set(selectedSet)
      if (newSet.has(val)) {
        newSet.delete(val)
      } else {
        newSet.add(val)
      }
      if (newSet.size === 0 || newSet.size === uniqueValues.length) {
        onFilter(null)
      } else {
        onFilter(Array.from(newSet))
      }
    }
  }

  return (
    <div className={`excel-th-content ${align === 'right' ? 'align-right' : ''}`}>
      <span
        className="excel-th-label"
        title={label}
        onClick={(e) => {
          // Bấm trực tiếp vào tiêu đề cũng có thể mở popover menu
          e.stopPropagation()
          setActiveMenuCol(isOpen ? null : colKey)
        }}
        style={{ cursor: 'pointer' }}
      >
        {label}
      </span>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        {/* Chỉ báo thứ tự sắp xếp */}
        {isSorted && (
          <span
            className="excel-sort-badge"
            title={`Đang sắp xếp ${sortDir === 'asc' ? 'tăng dần' : 'giảm dần'}`}
            style={{
              color: 'var(--teal-700)',
              fontSize: 10.5,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {sortDir === 'asc' ? '▲' : '▼'}
          </span>
        )}

        {/* Nút bấm kiểu Excel */}
        <button
          ref={btnRef}
          type="button"
          className={`excel-col-btn ${isOpen ? 'active' : ''} ${isFiltered ? 'filtered' : ''} ${isSorted ? 'sorted' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            setActiveMenuCol(isOpen ? null : colKey)
          }}
          title={isFiltered ? `Đang lọc cột “${label}”. Bấm để tùy chỉnh bộ lọc/thứ tự` : `Tùy chọn sắp xếp & lọc cột “${label}” (kiểu Excel)`}
          aria-label={`Menu cột ${label}`}
        >
          {isFiltered ? (
            <L.Filter size={11.5} strokeWidth={2.4} />
          ) : (
            <L.ChevronDown size={12} strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Popover kiểu Excel hiển thị qua Portal cố định */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="excel-popover"
            style={{
              top: `${pos.top}px`,
              left: `${pos.left}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header của popover */}
            <div className="excel-pop-head">
              <span className="ellipsis" style={{ maxWidth: 210 }}>
                {label}
              </span>
              <button
                type="button"
                className="btn sm ghost"
                style={{ width: 22, height: 22, padding: 0, minHeight: 'unset', color: '#64748b' }}
                onClick={() => setActiveMenuCol(null)}
                title="Đóng menu"
              >
                <L.X size={13} />
              </button>
            </div>

            <div className="excel-pop-body">
              {/* Mục 1: Sắp xếp */}
              <div className="excel-pop-section-title">
                <span>Sắp xếp dữ liệu</span>
                {isSorted && (
                  <button
                    type="button"
                    className="btn sm ghost"
                    style={{ fontSize: 10.5, padding: '1px 5px', height: 18, minHeight: 18, color: 'var(--teal-700)', fontWeight: 600 }}
                    onClick={() => {
                      onSort(null, 'asc')
                      setActiveMenuCol(null)
                    }}
                  >
                    Mặc định
                  </button>
                )}
              </div>

              {/* Sắp xếp tăng dần */}
              <button
                type="button"
                className={`excel-pop-item ${isSorted && sortDir === 'asc' ? 'active' : ''}`}
                onClick={() => {
                  onSort(colKey, 'asc')
                  setActiveMenuCol(null)
                }}
              >
                {isNumeric ? (
                  <L.ArrowUp10 size={15} color="var(--teal-700)" />
                ) : isDate ? (
                  <L.ArrowUp size={15} color="var(--teal-700)" />
                ) : (
                  <L.ArrowUpAZ size={15} color="var(--teal-700)" />
                )}
                <span className="grow">
                  {isNumeric
                    ? 'Sắp xếp từ nhỏ đến lớn'
                    : isDate
                    ? 'Sắp xếp ngày cũ → mới'
                    : 'Sắp xếp A → Z (Nhỏ đến lớn)'}
                </span>
                {isSorted && sortDir === 'asc' && <L.Check size={14} color="var(--teal-700)" strokeWidth={2.5} />}
              </button>

              {/* Sắp xếp giảm dần */}
              <button
                type="button"
                className={`excel-pop-item ${isSorted && sortDir === 'desc' ? 'active' : ''}`}
                onClick={() => {
                  onSort(colKey, 'desc')
                  setActiveMenuCol(null)
                }}
              >
                {isNumeric ? (
                  <L.ArrowDown10 size={15} color="var(--teal-700)" />
                ) : isDate ? (
                  <L.ArrowDown size={15} color="var(--teal-700)" />
                ) : (
                  <L.ArrowDownZA size={15} color="var(--teal-700)" />
                )}
                <span className="grow">
                  {isNumeric
                    ? 'Sắp xếp từ lớn đến nhỏ'
                    : isDate
                    ? 'Sắp xếp ngày mới → cũ'
                    : 'Sắp xếp Z → A (Lớn đến nhỏ)'}
                </span>
                {isSorted && sortDir === 'desc' && <L.Check size={14} color="var(--teal-700)" strokeWidth={2.5} />}
              </button>

              <div className="excel-pop-divider" />

              {/* Mục 2: Lọc dữ liệu */}
              <div className="excel-pop-section-title">
                <span>Lọc theo giá trị</span>
                {isFiltered && (
                  <button
                    type="button"
                    className="btn sm ghost"
                    style={{ fontSize: 10.5, padding: '1px 5px', height: 18, minHeight: 18, color: '#c2410c', fontWeight: 600 }}
                    onClick={() => onFilter(null)}
                    title="Xóa bộ lọc cột này"
                  >
                    Bỏ lọc
                  </button>
                )}
              </div>

              {/* Ô tìm kiếm giá trị */}
              {uniqueValues.length > 5 && (
                <div className="excel-pop-search">
                  <L.Search size={12} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm giá trị cần lọc…"
                    value={valSearch}
                    onChange={(e) => setValSearch(e.target.value)}
                  />
                  {valSearch && (
                    <button
                      type="button"
                      style={{ position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, padding: 2, cursor: 'pointer', color: '#94a3b8' }}
                      onClick={() => setValSearch('')}
                    >
                      <L.X size={11} />
                    </button>
                  )}
                </div>
              )}

              {/* Danh sách các giá trị để tick lọc */}
              <div className="excel-pop-val-list">
                {/* Lựa chọn Chọn tất cả */}
                {!valSearch && (
                  <div
                    className={`excel-pop-val-row ${!isFiltered ? 'selected' : ''}`}
                    onClick={() => onFilter(null)}
                  >
                    <input
                      type="checkbox"
                      checked={!isFiltered}
                      onChange={() => onFilter(null)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span style={{ fontWeight: 600 }}>(Chọn tất cả)</span>
                    <span className="excel-count-badge">({totalCount})</span>
                  </div>
                )}

                {filteredUniqueValues.length === 0 ? (
                  <div style={{ padding: '8px 10px', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                    Không khớp giá trị nào
                  </div>
                ) : (
                  filteredUniqueValues.map((v) => {
                    const isChecked = !isFiltered || (selectedSet && selectedSet.has(v.value))
                    return (
                      <div
                        key={v.value}
                        className={`excel-pop-val-row ${isChecked ? 'selected' : ''}`}
                        onClick={() => handleSelectSingleValue(v.value)}
                        title={`Bấm để chỉ lọc "${v.value}"`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCheckbox(v.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="ellipsis" style={{ maxWidth: 175 }}>
                          {v.value}
                        </span>
                        <span className="excel-count-badge">({v.count})</span>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer tiện ích */}
              {isFiltered && (
                <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    Đã chọn {selectedSet ? selectedSet.size : uniqueValues.length}/{uniqueValues.length}
                  </span>
                  <button
                    type="button"
                    className="btn sm"
                    style={{ fontSize: 11, padding: '2px 8px', height: 22, minHeight: 22, background: 'var(--teal-700)', color: '#fff' }}
                    onClick={() => setActiveMenuCol(null)}
                  >
                    Áp dụng
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
export default ExcelColumnHeader
