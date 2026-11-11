import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ChatWidget from './components/ChatWidget.jsx'

// ChatWidget sits beside App, not inside it, so it stays mounted (and keeps
// its conversation) while App swaps between the home and detail page trees.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ChatWidget />
  </StrictMode>,
)
