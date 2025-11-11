/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#166B6C",
      },
      boxShadow: {
        soft: "0 4px 10px rgba(22, 107, 108, 0.2)",
        card: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
      },
      fontFamily: {
        // 讓 Tailwind 的 font-sans 指到 Noto Sans TC/Inter
        sans: ["Noto Sans TC", "Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
