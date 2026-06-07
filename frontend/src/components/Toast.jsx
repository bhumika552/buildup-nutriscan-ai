import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../context/ToastContext'

const config = {
  success: { icon: '✓', color: '#7AAF5A' },
  error:   { icon: '✕', color: '#D94530' },
  warning: { icon: '⚠', color: '#D4A04A' },
  info:    { icon: 'ℹ', color: '#E07840' },
}

export default function Toast() {
  const { toasts, removeToast } = useToast()
  return (
    <div className="fixed top-24 right-4 z-[300] flex flex-col gap-2 pointer-events-none" aria-live="polite" aria-label="Notifications">
      <AnimatePresence>
        {toasts.map(toast => {
          const { icon, color } = config[toast.type] || config.info
          return (
            <motion.div
              key={toast.id}
              initial={{ x: 360, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 360, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="pointer-events-auto flex items-center gap-3"
              style={{
                background: 'rgba(8,6,4,0.95)',
                border: `1px solid ${color}30`,
                borderLeft: `3px solid ${color}`,
                backdropFilter: 'blur(20px)',
                padding: '0.85rem 1rem',
                minWidth: '260px',
                maxWidth: '360px',
              }}
              role="alert"
            >
              <span style={{ color, fontWeight: 700, flexShrink: 0 }} aria-hidden="true">{icon}</span>
              <p style={{ flex: 1, fontFamily: 'var(--fb)', fontSize: '0.85rem', color: 'rgba(255,245,235,0.8)', fontWeight: 400 }}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,245,235,0.3)', padding: '0.2rem', lineHeight: 1 }}
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

