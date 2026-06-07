import { motion } from 'framer-motion'

export default function LoadingOverlay({ preview }) {
  return (
    <div className="relative overflow-hidden" style={{ border: '1px solid rgba(255,160,80,0.2)', background: 'var(--black)' }}>
      {preview && (
        <img src={preview} alt="Food being analyzed" className="w-full object-cover opacity-30" style={{ maxHeight: '360px', display: 'block' }} />
      )}
      {!preview && <div style={{ height: '280px' }} />}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,6,4,0.6)', backdropFilter: 'blur(2px)' }} />
      {/* Scan line */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div className="scan-line" aria-hidden="true" />
      </div>
      {/* Center content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid rgba(255,160,80,0.2)', borderTopColor: 'var(--accent)' }}
          aria-hidden="true"
        />
        <div className="text-center">
          <p style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--white)', textShadow: '0 0 20px rgba(224,120,64,0.3)' }}>ANALYZING MEAL...</p>
          <p className="mt-1" style={{ fontFamily: 'var(--fm)', fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(255,245,235,0.4)' }}>AI MODEL PROCESSING</p>
        </div>
      </div>
    </div>
  )
}
