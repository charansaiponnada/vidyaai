import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import App from './App.jsx'
import LandingPage from './components/landing-page'
import { LoginPage } from './components/ui/animated-characters-login-page'
import './index.css'

function LandingWrapper() {
  const navigate = useNavigate()
  return <LandingPage onGetStarted={() => navigate('/login')} />
}

function LoginWrapper() {
  const navigate = useNavigate()
  return <LoginPage onLogin={() => navigate('/app')} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingWrapper />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
