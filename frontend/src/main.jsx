import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        containerStyle={{ top: 72 }}
        toastOptions={{
          style: {
            background: '#fff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
          success: {
            iconTheme: { primary: '#009966', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
          duration: 3000,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)