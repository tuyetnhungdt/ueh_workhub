import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import rennesDocs from './scripts/vite-rennes-docs.js'
// rennesDocs chỉ chạy khi `vite dev` (local) – không đưa file hồ sơ cá nhân lên bản deploy
export default defineConfig({ plugins: [react(), rennesDocs()] })
