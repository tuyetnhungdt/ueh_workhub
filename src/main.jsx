import React from 'react'
import { createRoot } from 'react-dom/client'
import { StoreProvider } from './data/store.jsx'
import { ToastProvider } from './components/ui.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import App from './App.jsx'
import './styles.css'
import './views.css'
import './modules/workspace.css'
import './components/smartform.css'
import './mobile.css'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <StoreProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </StoreProvider>
  </ErrorBoundary>
)
