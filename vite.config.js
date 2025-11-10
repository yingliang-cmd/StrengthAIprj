import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 這裡一定要改成你的 repo 名稱，GitHub Pages 用：
export default defineConfig({
  plugins: [react()],
  base: '/StrengthAIprj/',
})
