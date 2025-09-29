import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {LandingPage} from './LandingPage.tsx'
import "./styles/globals.css";

const sessionExample = false // Simulating a session check

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {sessionExample ? <App /> : <LandingPage onLogin={() => { /* Handle login */ }} />}
  </StrictMode>,
)
