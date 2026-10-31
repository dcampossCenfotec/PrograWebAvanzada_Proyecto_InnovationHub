import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/app.scss'
import { RouterProvider } from 'react-router'
import { router } from './app/router.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
