import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 請將 'YOUR_REPO_NAME' 替換為您的 GitHub 儲存庫名稱
// 例如：如果您的 repo URL 是 https://github.com/username/my-ikigai-app
// 則 base 應設為 '/my-ikigai-app/'
const REPO_NAME = 'StrengthAIprj'; 

export default defineConfig({
  plugins: [react()],
  base: `/${StrengthAIprj}/`, // 這是部署到 GitHub Pages 的關鍵設定
})