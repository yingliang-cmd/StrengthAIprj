import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 移除 REPO_NAME 變數。
// 將 base 設置為 './'，強制使用相對路徑。
// 這是解決 GitHub Pages 子路徑部署資產載入失敗最穩定的方法。
export default defineConfig({
  plugins: [react()],
  // Vite 將使用 './' 作為基礎路徑，確保資產（如 JS/CSS）能從相對位置正確載入。
  base: './', 
})