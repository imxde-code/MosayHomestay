import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const redirectParamKey = 'p'
const pathToHashMap = {
  '/about': '#tentang',
  '/admin': '#/admin',
  '/amenities': '#kemudahan',
  '/booking': '#tempahan',
  '/contact': '#hubungi',
  '/gallery': '#galeri',
  '/hubungi': '#hubungi',
  '/kemudahan': '#kemudahan',
  '/lokasi': '#lokasi',
  '/location': '#lokasi',
  '/tempahan': '#tempahan',
  '/tentang': '#tentang',
}

function normalizePathname(pathname = '/') {
  const trimmedPath = pathname.replace(/\/+$/, '')

  if (!trimmedPath) {
    return '/'
  }

  return trimmedPath.toLowerCase()
}

function restoreRedirectedPath() {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)
  const redirectedTarget = url.searchParams.get(redirectParamKey)

  if (!redirectedTarget) {
    return
  }

  const targetUrl = new URL(redirectedTarget, window.location.origin)
  window.history.replaceState(
    null,
    '',
    `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`,
  )
}

function normalizeEntryPath() {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)
  const targetHash = pathToHashMap[normalizePathname(url.pathname)]

  if (!targetHash) {
    return
  }

  window.history.replaceState(null, '', `/${url.search}${targetHash}`)
}

restoreRedirectedPath()
normalizeEntryPath()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
