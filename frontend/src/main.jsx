import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{ style: { background: '#0d1f3c', color: '#e2e8f0', border: '1px solid rgba(0,212,255,.2)' } }} />
  </React.StrictMode>
)
