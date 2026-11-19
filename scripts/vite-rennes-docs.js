/* Plugin chỉ dùng khi chạy LOCAL (vite dev): phục vụ văn bản thật trong thư mục hồ sơ "Rennes"
   để web hiển thị đúng file chính thức (hóa đơn, vé, hộ chiếu, hợp đồng…) thay cho văn bản mẫu.
   - apply: 'serve' → KHÔNG có trong bản build/deploy Vercel, file cá nhân không bị công khai.
   - Thư mục: biến môi trường RENNES_DIR, hoặc tự dò thư mục "Rennes" nằm cạnh/ở trên dự án. */
import fs from 'node:fs'
import path from 'node:path'

const TYPES = {
  '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip', '.md': 'text/markdown; charset=utf-8', '.json': 'application/json',
}

function findRoot(start) {
  if (process.env.RENNES_DIR && fs.existsSync(process.env.RENNES_DIR)) return process.env.RENNES_DIR
  let dir = start
  for (let i = 0; i < 6; i++) {
    const cand = path.join(dir, 'Rennes')
    if (fs.existsSync(cand) && fs.statSync(cand).isDirectory()) return cand
    const up = path.dirname(dir)
    if (up === dir) break
    dir = up
  }
  return null
}

function walk(root) {
  const out = []
  const rec = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) { if (!e.name.startsWith('.')) rec(full) }
      else {
        const rel = path.relative(root, full).split(path.sep).join('/').normalize('NFC')
        out.push({ name: e.name.normalize('NFC'), rel, size: fs.statSync(full).size })
      }
    }
  }
  rec(root)
  return out
}

export default function rennesDocs() {
  let root = null
  return {
    name: 'rennes-docs-local',
    apply: 'serve',
    configureServer(server) {
      root = findRoot(server.config.root)
      if (root) server.config.logger.info(`  ➜  Văn bản thật (local): ${root}`)
      server.middlewares.use('/__rennes', (req, res) => {
        if (!root) { res.statusCode = 404; return res.end('[]') }
        const url = decodeURIComponent((req.url || '').split('?')[0])
        if (url === '/index.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store')
          return res.end(JSON.stringify(walk(root)))
        }
        if (url.startsWith('/f/')) {
          const rel = url.slice(3)
          const full = path.resolve(root, rel)
          if (!full.startsWith(path.resolve(root)) || !fs.existsSync(full)) { res.statusCode = 404; return res.end('Not found') }
          res.setHeader('Content-Type', TYPES[path.extname(full).toLowerCase()] || 'application/octet-stream')
          res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(path.basename(full))}`)
          return fs.createReadStream(full).pipe(res)
        }
        res.statusCode = 404
        res.end('Not found')
      })
    },
  }
}
