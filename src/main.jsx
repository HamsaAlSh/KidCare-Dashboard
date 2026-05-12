import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext' // مغلف الصلاحيات
// import { ThemeProvider } from './context/ThemeContext' // سنفعله لاحقاً للألوان
import './styles/variables.css' // ملف الألوان المستوحى من الصورة

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      {/* <ThemeProvider> سنضيفه هنا لاحقاً للـ Dark Mode */}
        <App />
      {/* </ThemeProvider> */}
    </AuthProvider>
  </React.StrictMode>,
)