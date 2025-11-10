import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 修正：將專案名稱 'StrengthAIprj' 用單引號包裹，使其成為一個字串。
// 這是部署到 GitHub Pages 的關鍵設定。
const REPO_NAME = 'StrengthAIprj'; 

export default defineConfig({
  plugins: [react()],
  // Vite 將使用這個 base 路徑來處理所有資產 (asset) 引用
  base: `/${REPO_NAME}/`, 
})