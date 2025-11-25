import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1b2540',
              color: '#fff',
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '14px 18px',
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
