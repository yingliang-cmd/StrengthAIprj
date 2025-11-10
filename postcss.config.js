/** @type {import('tailwindcss').Config} */
export default {
  // 告訴 Tailwind 掃描 index.html 和 src/ 下所有 JSX 檔案
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}