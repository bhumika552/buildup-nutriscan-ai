import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import LandingPage from './pages/LandingPage'
import ScanPage from './pages/ScanPage'
import HistoryPage from './pages/HistoryPage'
import AboutPage from './pages/AboutPage'
import AuthPage from './pages/AuthPage'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Toast />
          <AnimatedRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App

