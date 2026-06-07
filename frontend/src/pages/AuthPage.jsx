import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const pageVariants = {
  initial: { opacity: 0 },
  in:      { opacity: 1, transition: { duration: 0.4 } },
  out:     { opacity: 0, transition: { duration: 0.3 } },
}

const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } }
}

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const { addToast } = useToast()

  // Determine starting mode based on URL or state
  const isRegisterParam = location.pathname.includes('signup')
  const [isLogin, setIsLogin] = useState(!isRegisterParam)
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormError('')
    setUsername('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    navigate(isLogin ? '/signup' : '/login', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    // Validation
    if (!email || !password || (!isLogin && !username)) {
      setFormError('PLEASE FILL IN ALL REQUIRED FIELDS')
      setLoading(false)
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setFormError('PASSWORDS DO NOT MATCH')
      setLoading(false)
      return
    }

    if (!isLogin && password.length < 6) {
      setFormError('PASSWORD MUST BE AT LEAST 6 CHARACTERS')
      setLoading(false)
      return
    }

    if (isLogin) {
      const res = await login(email, password)
      if (res.success) {
        addToast('Welcome back to BUILDUP!', 'success')
        navigate('/scan')
      } else {
        setFormError(res.error.toUpperCase())
      }
    } else {
      const res = await register(username, email, password)
      if (res.success) {
        addToast('Account created! Welcome to BUILDUP.', 'success')
        navigate('/scan')
      } else {
        setFormError(res.error.toUpperCase())
      }
    }
    setLoading(false)
  }

  return (
    <motion.main
      initial="initial" animate="in" exit="out" variants={pageVariants}
      style={{
        minHeight: '100vh',
        background: 'var(--black)',
        paddingTop: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambience Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224,120,64,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-25%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,160,74,0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div className="w-full max-w-md px-6 z-10 py-10">
        <div className="text-center mb-8">
          <p className="label-text mb-2">BUILDUP AUTHENTICATION</p>
          <h1
            style={{
              fontFamily: 'var(--fd)',
              fontSize: '2.5rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: 'var(--white)',
              lineHeight: 1
            }}
          >
            {isLogin ? 'WELCOME ' : 'JOIN '}
            <span style={{ color: 'var(--accent)', textShadow: '0 0 16px rgba(224,120,64,0.3)' }}>
              BUILDUP
            </span>
          </h1>
          <p className="mt-2 text-sm" style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'var(--color-muted)' }}>
            {isLogin ? 'Log in to sync your meal history with the cloud.' : 'Create an account to track metrics across devices.'}
          </p>
        </div>

        {/* Form Card */}
        <div 
          className="glass-surface p-8 card-hover"
          style={{
            border: '1px solid rgba(255,160,80,0.08)',
            background: 'rgba(255,160,80,0.02)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial="hidden" animate="visible" exit="exit" variants={formVariants}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              {/* Username field (Signup only) */}
              {!isLogin && (
                <div>
                  <label className="label-text block mb-1.5" htmlFor="username">USERNAME</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ENTER USERNAME"
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      fontFamily: 'var(--fb)',
                      fontSize: '0.9rem',
                      background: 'rgba(255,160,80,0.02)',
                      border: '1px solid rgba(255,160,80,0.12)',
                      color: 'var(--white)',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                    className="focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="label-text block mb-1.5" htmlFor="email">EMAIL ADDRESS</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER EMAIL ADDRESS"
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    fontFamily: 'var(--fb)',
                    fontSize: '0.9rem',
                    background: 'rgba(255,160,80,0.02)',
                    border: '1px solid rgba(255,160,80,0.12)',
                    color: 'var(--white)',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                  className="focus:border-[var(--accent)] transition-colors"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="label-text block mb-1.5" htmlFor="password">PASSWORD</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER PASSWORD"
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    fontFamily: 'var(--fb)',
                    fontSize: '0.9rem',
                    background: 'rgba(255,160,80,0.02)',
                    border: '1px solid rgba(255,160,80,0.12)',
                    color: 'var(--white)',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                  className="focus:border-[var(--accent)] transition-colors"
                />
              </div>

              {/* Confirm Password field (Signup only) */}
              {!isLogin && (
                <div>
                  <label className="label-text block mb-1.5" htmlFor="confirmPassword">CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="RE-ENTER PASSWORD"
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      fontFamily: 'var(--fb)',
                      fontSize: '0.9rem',
                      background: 'rgba(255,160,80,0.02)',
                      border: '1px solid rgba(255,160,80,0.12)',
                      color: 'var(--white)',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                    className="focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              )}

              {/* Error block */}
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(217,69,48,0.08)',
                    border: '1px solid rgba(217,69,48,0.3)',
                    color: 'var(--color-danger)',
                    fontFamily: 'var(--fm)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    lineHeight: 1.4,
                    textAlign: 'center'
                  }}
                  role="alert"
                >
                  ⚠ {formError}
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="accent-btn w-full justify-center py-3.5 mt-2"
                style={{ fontFamily: 'var(--fd)', fontSize: '1.05rem' }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid rgba(0,0,0,0.2)',
                        borderTopColor: 'var(--black)'
                      }}
                    />
                    PROCESSING...
                  </div>
                ) : isLogin ? (
                  'LOG IN →'
                ) : (
                  'CREATE ACCOUNT →'
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>

        {/* Toggle Mode Option */}
        <div className="text-center mt-6">
          <button
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-muted)',
              fontFamily: 'var(--fm)',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            className="hover:text-[var(--accent)] transition-colors"
          >
            {isLogin ? "DON'T HAVE AN ACCOUNT? SIGN UP" : 'ALREADY HAVE AN ACCOUNT? LOG IN'}
          </button>
        </div>
      </div>
    </motion.main>
  )
}
