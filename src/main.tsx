import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import { App } from './App'
import { PreviewProvider } from './preview/PreviewContext'

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <PreviewProvider>
      <App />
    </PreviewProvider>
  </StrictMode>,
)
