import React from 'react'
import ReactDOM from 'react-dom/client'
import MainPage from '../Components/MainPage'
import './index.css'

const legacyBotPath = '/chat/message'
const usesLegacyBotApi = () => {
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  return scripts.some((script) => {
    const src = script.getAttribute('src') || ''
    return src.includes('/dist/') || src.includes('index-B53HbAfg.js')
  })
}

if (usesLegacyBotApi()) {
  console.warn(
    `Detected a prebuilt client bundle that may still call ${legacyBotPath}. ` +
      'Run the Vite app from src or rebuild the client bundle.'
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MainPage />
  </React.StrictMode>
)
