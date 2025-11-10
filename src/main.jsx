import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// 由於 Tailwind 在 App.jsx 中是以 CDN 方式引入，這裡不需要引入 CSS
// 如果使用標準 Tailwind 設置，則會在這裡引入 `./index.css`

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);