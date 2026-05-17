import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LandingPage from './components/landing-page'
import { LoginPage } from './components/ui/animated-characters-login-page'
import './index.css'

function Root() {
  const [page, setPage] = useState('landing')

  switch (page) {
    case 'landing':
      return <LandingPage onGetStarted={() => setPage('login')} />
    case 'login':
      return <LoginPage onLogin={() => setPage('app')} />
    case 'app':
      return <App />
    default:
      return <LandingPage onGetStarted={() => setPage('login')} />
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
