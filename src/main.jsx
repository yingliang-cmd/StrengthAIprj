import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// 必須引入 Tailwind 基礎 CSS 檔案，Vite 才能處理樣式
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);