import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/scan',    label: 'SCAN' },
  { to: '/history', label: 'HISTORY' },
  { to: '/about',   label: 'ABOUT' },
]

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-300 ${scrolled ? 'glass-nav' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '1.3rem 2.5rem',
          mixBlendMode: scrolled ? 'normal' : 'difference',
        }}
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <NavLink
          to="/"
          className="justify-self-start"
          aria-label="BUILDUP — Home"
          style={{ textDecoration: 'none' }}
        >
          <motion.div
            whileHover={{ scale: 1.06 }}
            style={{
              fontFamily: 'var(--fd)',
              fontSize: '1.8rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: 'var(--white)',
            }}
          >
            BUILD
            <span style={{ color: 'var(--accent)', textShadow: '0 0 12px rgba(224,120,64,0.45)' }}>
              UP
            </span>
          </motion.div>
        </NavLink>

        {/* ── Desktop links (centered) ── */}
        <div className="hidden md:flex items-center gap-10 justify-self-center">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative transition-colors duration-200 ${isActive ? 'text-[#E07840]' : 'text-[var(--white)] hover:text-[#E07840]'}`
              }
              style={{ fontFamily: 'var(--fd)', fontSize: '1.05rem', letterSpacing: '0.05em', textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-[#E07840]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* ── CTA / User Profile ── */}
        <div className="hidden md:flex justify-self-end items-center gap-5">
          {isAuthenticated ? (
            <>
              <span style={{ fontFamily: 'var(--fm)', fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--accent)', fontWeight: 700 }}>
                {user.username.toUpperCase()}
              </span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className="outline-btn"
                style={{ padding: '0.55rem 1.4rem', fontSize: '0.8rem', borderColor: 'rgba(255,160,80,0.2)' }}
                aria-label="Logout"
              >
                LOGOUT
              </motion.button>
            </>
          ) : (
            <NavLink to="/login" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(224,120,64,0.45)' }}
                whileTap={{ scale: 0.96 }}
                className="accent-btn"
                style={{ padding: '0.6rem 1.6rem', fontSize: '0.9rem' }}
                aria-label="Try BUILDUP"
              >
                LOGIN
              </motion.button>
            </NavLink>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden justify-self-end p-2"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div className="flex flex-col gap-1.5 w-6">
            {[
              mobileOpen ? { rotate: 45, y: 8 } : {},
              mobileOpen ? { opacity: 0, scaleX: 0 } : {},
              mobileOpen ? { rotate: -45, y: -8 } : {},
            ].map((anim, i) => (
              <motion.span
                key={i}
                animate={anim}
                transition={{ duration: 0.2 }}
                className="block h-px bg-[var(--white)] rounded-full"
                style={{ width: i === 1 ? '75%' : '100%' }}
              />
            ))}
          </div>
        </button>
      </motion.nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-[72px] left-0 right-0 z-[199] overflow-hidden"
            style={{ background: 'rgba(8,6,4,0.97)', borderBottom: '1px solid rgba(255,160,80,0.07)' }}
          >
            <div className="flex flex-col p-6 gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  style={{ fontFamily: 'var(--fd)', fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '-0.01em' }}
                  className={({ isActive }) => `block py-2 transition-colors ${isActive ? 'text-[#E07840]' : 'text-[var(--white)] hover:text-[#E07840]'}`}
                >
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <div style={{ marginTop: '1rem' }} className="flex flex-col gap-2">
                  <span className="block text-center label-text mb-2" style={{ color: 'var(--accent)', fontSize: '0.65rem' }}>
                    LOGGED IN AS {user.username.toUpperCase()}
                  </span>
                  <button
                    onClick={logout}
                    className="outline-btn w-full justify-center"
                    style={{ padding: '0.8rem', fontSize: '0.9rem' }}
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <NavLink to="/login" style={{ textDecoration: 'none', marginTop: '1rem' }} className="block">
                  <button
                    className="accent-btn w-full justify-center"
                    aria-label="Login"
                  >
                    LOGIN TO BUILDUP →
                  </button>
                </NavLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
