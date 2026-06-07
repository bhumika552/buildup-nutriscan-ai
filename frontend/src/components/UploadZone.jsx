import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isValidImageFile } from '../utils/helpers'

export default function UploadZone({ onFileSelect, preview, disabled }) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragError, setDragError] = useState(false)

  const handleFile = useCallback((file) => {
    if (!file) return
    if (!isValidImageFile(file)) {
      setDragError(true)
      setTimeout(() => setDragError(false), 2500)
      return
    }
    onFileSelect(file)
  }, [onFileSelect])

  const handleDrop      = useCallback((e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])
  const handleDragOver  = useCallback((e) => { e.preventDefault(); setIsDragOver(true) }, [])
  const handleDragLeave = useCallback(() => setIsDragOver(false), [])
  const handleChange    = useCallback((e) => { handleFile(e.target.files[0]); e.target.value = '' }, [handleFile])
  const handleClick     = () => { if (!disabled) inputRef.current?.click() }
  const handleKeyDown   = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="sr-only" id="food-image-upload" aria-label="Upload food image" disabled={disabled} />
      <motion.div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Drop food image here or click to browse"
        animate={{ borderColor: dragError ? 'var(--color-danger)' : isDragOver ? 'var(--accent)' : preview ? 'var(--accent)' : 'rgba(255,160,80,0.08)' }}
        transition={{ duration: 0.15 }}
        style={{
          border: '1px dashed rgba(255,160,80,0.08)',
          background: isDragOver ? 'rgba(255,160,80,0.04)' : 'rgba(255,160,80,0.02)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: preview ? 'auto' : '280px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'background 0.2s',
        }}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <img src={preview} alt="Selected food" className="w-full object-cover" style={{ maxHeight: '360px', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,6,4,0.5), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem' }}>
                <span style={{ fontFamily: 'var(--fm)', fontSize: '0.5rem', letterSpacing: '0.12em', background: 'rgba(8,6,4,0.85)', color: 'var(--accent)', padding: '0.3rem 0.7rem', border: '1px solid rgba(255,160,80,0.3)' }}>
                  CLICK TO CHANGE
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-12 px-8 text-center"
            >
              <motion.div animate={isDragOver ? { scale: 1.2, y: -8 } : { scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div style={{ fontSize: '3rem', opacity: isDragOver ? 1 : 0.4 }} aria-hidden="true">📸</div>
              </motion.div>
              <div>
                <p style={{ fontFamily: 'var(--fd)', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', color: isDragOver ? 'var(--accent)' : 'var(--white)', letterSpacing: '0.03em' }}>
                  {isDragOver ? 'RELEASE TO UPLOAD' : 'DROP YOUR FOOD PHOTO'}
                </p>
                <p className="mt-1" style={{ fontFamily: 'var(--fm)', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,245,235,0.35)' }}>
                  OR <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>BROWSE FILES</span>
                </p>
                <p className="mt-2" style={{ fontFamily: 'var(--fm)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,245,235,0.2)' }}>
                  JPG · PNG · WEBP · HEIC
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {dragError && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            role="alert"
            style={{ fontFamily: 'var(--fm)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--color-danger)', marginTop: '0.5rem' }}
          >
            ⚠ PLEASE UPLOAD AN IMAGE FILE (JPG, PNG, WEBP, ETC.)
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
