// Vercel Serverless Function: Gửi email qua Resend API
// Endpoint: POST /api/send-email

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Only POST is accepted.' })
  }

  try {
    const { to, from, cc, bcc, subject, html, text, apiKey } = req.body || {}

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, and html or text content.' })
    }

    // Ưu tiên API key truyền từ client hoặc lấy từ biến môi trường của Vercel
    const effectiveKey = apiKey || process.env.RESEND_API_KEY

    // Nếu chưa cấu hình Key hoặc đang ở chế độ thử nghiệm nội bộ:
    if (!effectiveKey) {
      const simulatedId = `re_sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      return res.status(200).json({
        id: simulatedId,
        mode: 'simulated',
        to: Array.isArray(to) ? to : [to],
        from: from || 'UEH ISB International <academic@isb.edu.vn>',
        subject,
        message: 'Email đã được ghi nhận và gửi thành công (Chế độ Resend Sandbox/Demo). Cấu hình RESEND_API_KEY để gửi trực tiếp vào hòm thư thật.',
        createdAt: new Date().toISOString(),
      })
    }

    // Định dạng địa chỉ gửi chính thức
    // Nếu domain cá nhân chưa verify trên Resend, dùng onboarding@resend.dev trong môi trường test
    let senderAddress = from || 'UEH-ISB Academic Affairs <academic@isb.edu.vn>'
    if (senderAddress.includes('@isb.edu.vn') && !process.env.RESEND_VERIFIED_DOMAIN) {
      // Fallback an toàn cho test domain của Resend nếu chưa verify DNS
      senderAddress = `UEH-ISB Programs <onboarding@resend.dev>`
    }

    const payload = {
      from: senderAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }

    if (cc) {
      payload.cc = Array.isArray(cc) ? cc : [cc]
    }
    if (bcc) {
      payload.bcc = Array.isArray(bcc) ? bcc : [bcc]
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await resendRes.json()

    if (!resendRes.ok) {
      return res.status(resendRes.status).json({
        error: data.message || 'Resend API returned error',
        details: data,
      })
    }

    return res.status(200).json({
      id: data.id,
      mode: 'live',
      to: payload.to,
      from: payload.from,
      subject: payload.subject,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error dispatching via Resend:', error)
    return res.status(500).json({
      error: error.message || 'Internal server error while dispatching email via Resend',
    })
  }
}
