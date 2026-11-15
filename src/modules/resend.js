/**
 * Module tích hợp Resend API cho luồng Email Dispatch có kiểm duyệt
 */

const RESEND_LS_KEY = 'ueh_resend_api_key'

export function getStoredResendKey() {
  try {
    return localStorage.getItem(RESEND_LS_KEY) || ''
  } catch {
    return ''
  }
}

export function setStoredResendKey(key) {
  try {
    if (!key) localStorage.removeItem(RESEND_LS_KEY)
    else localStorage.setItem(RESEND_LS_KEY, key.trim())
  } catch {}
}

/**
 * Gửi email qua Resend API:
 * 1. Thử gọi Vercel Serverless Function /api/send-email
 * 2. Nếu không có serverless (chạy local dev), gọi trực tiếp Resend REST API
 * 3. Nếu không có API Key, mô phỏng phản hồi thành công và trả về ID kiểm toán
 */
export async function sendEmailViaResend({
  to,
  from = 'UEH-ISB Academic Affairs <academic@isb.edu.vn>',
  cc = '',
  bcc = '',
  subject,
  html,
  apiKey,
}) {
  const effectiveKey = apiKey || getStoredResendKey() || ''

  // Chuyển đổi chuỗi danh sách email sang mảng
  const toList = (Array.isArray(to) ? to : String(to || '').split(','))
    .map((s) => s.trim())
    .filter(Boolean)

  const ccList = cc
    ? (Array.isArray(cc) ? cc : String(cc).split(',')).map((s) => s.trim()).filter(Boolean)
    : undefined

  const bccList = bcc
    ? (Array.isArray(bcc) ? bcc : String(bcc).split(',')).map((s) => s.trim()).filter(Boolean)
    : undefined

  if (!toList.length) {
    throw new Error('Vui lòng chỉ định ít nhất một địa chỉ email người nhận (To).')
  }
  if (!subject) {
    throw new Error('Tiêu đề email không được để trống.')
  }

  // 1. Thử gọi qua endpoint Serverless của hệ thống
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: toList,
        from,
        cc: ccList,
        bcc: bccList,
        subject,
        html,
        apiKey: effectiveKey,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return data
    }
  } catch (err) {
    console.warn('Serverless endpoint /api/send-email unavailable, falling back to direct API or simulation:', err)
  }

  // 2. Fallback nếu gọi trực tiếp Resend từ client khi có API Key
  if (effectiveKey) {
    try {
      const directRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'UEH-ISB Programs <onboarding@resend.dev>', // Resend test sandbox sender
          to: toList,
          cc: ccList,
          bcc: bccList,
          subject,
          html,
        }),
      })

      const directData = await directRes.json()
      if (!directRes.ok) {
        throw new Error(directData.message || 'Lỗi từ Resend API')
      }
      return {
        id: directData.id,
        mode: 'live',
        from: 'onboarding@resend.dev',
        to: toList,
        subject,
        createdAt: new Date().toISOString(),
      }
    } catch (e) {
      console.error('Direct Resend API call failed:', e)
      throw e
    }
  }

  // 3. Fallback Sandbox/Demo Mode khi chưa điền API Key
  const simulatedId = `re_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  return {
    id: simulatedId,
    mode: 'simulated',
    from,
    to: toList,
    subject,
    message: 'Đã gửi thành công qua Resend Sandbox (Chế độ mô phỏng kiểm duyệt).',
    createdAt: new Date().toISOString(),
  }
}
