import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'
import { PreviewProvider } from './preview/PreviewContext'

// Build közbeni előrenderelés (scripts/prerender.mjs): a kezdő HTML már tartalmazza a teljes oldalt.
export function render() {
  return renderToString(
    <StrictMode>
      <PreviewProvider>
        <App />
      </PreviewProvider>
    </StrictMode>,
  )
}
