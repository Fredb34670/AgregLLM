import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider'

// Déterminer le basename en fonction de l'environnement
// En production (GitHub Pages), utiliser /AgregLLM, sinon utiliser racine
const isLocalhost = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
const basename = !isLocalhost && window.location.pathname.startsWith('/AgregLLM') ? '/AgregLLM' : '';

console.log('AgregLLM: Running with basename:', basename);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="agregllm-theme">
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
