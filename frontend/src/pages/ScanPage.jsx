import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import UploadZone from '../components/UploadZone'
import ScanResult from '../components/ScanResult'
import LoadingOverlay from '../components/LoadingOverlay'
import { useNutriScan } from '../hooks/useNutriScan'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const pageVariants = {
  initial: { opacity: 0 },
  in:      { opacity: 1, transition: { duration: 0.4 } },
  out:     { opacity: 0, transition: { duration: 0.3 } },
}

export default function ScanPage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const { result, loading, error, demoMode, analyze, reset } = useNutriScan()
  const [, setHistory] = useLocalStorage('buildup_history', [])
  const { addToast } = useToast()
  const { isAuthenticated } = useAuth()

  const handleFileSelect = useCallback((f) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    reset()
  }, [reset])

  const handleAnalyze = async () => { if (file) await analyze(file) }

  const handleSave = () => {
    if (!result) return
    if (isAuthenticated) {
      addToast(`"${result.food_name}" is saved to your account!`, 'success')
      return
    }
    const entry = { id: Date.now(), food_name: result.food_name, confidence: result.confidence, nutrition: result.nutrition, preview, date: new Date().toISOString() }
    setHistory(prev => [entry, ...prev])
    addToast(`"${result.food_name}" saved to local history!`, 'success')
  }

  const handleReset = () => { setFile(null); setPreview(null); reset() }

  return (
    <motion.main
      initial="initial" animate="in" exit="out" variants={pageVariants}
      style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '72px' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        {/* Header */}
        <div className="mb-12">
          <p className="label-text mb-3">AI FOOD SCANNER</p>
          <h1
            style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--white)', lineHeight: 1 }}
          >
            SCAN YOUR <span style={{ color: 'var(--accent)' }}>MEAL</span>
          </h1>
          <p className="mt-3" style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.45)', fontSize: '0.9rem' }}>
            Upload a food photo and get an instant AI-powered nutritional breakdown.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Upload */}
          <div className="flex flex-col gap-4">
            {loading ? <LoadingOverlay preview={preview} /> : <UploadZone onFileSelect={handleFileSelect} preview={preview} disabled={loading} />}

            <div className="flex gap-3">
              <motion.button
                onClick={handleAnalyze}
                disabled={!file || loading}
                whileHover={file && !loading ? { scale: 1.02 } : {}}
                whileTap={file && !loading ? { scale: 0.98 } : {}}
                className={`flex-1 py-4 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all rounded-sm ${file && !loading ? 'accent-btn' : ''}`}
                style={!file || loading ? { background: 'rgba(255,245,235,0.05)', color: 'rgba(255,245,235,0.25)', cursor: 'not-allowed', fontFamily: 'var(--fd)', fontSize: '1rem', letterSpacing: '0.1em', border: '1px solid rgba(255,245,235,0.07)' } : { fontFamily: 'var(--fd)', fontSize: '1rem' }}
                aria-label="Analyze food image"
                aria-disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 rounded-full"
                      style={{ border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'var(--black)' }} aria-hidden="true" />
                    ANALYZING...
                  </>
                ) : 'ANALYZE WITH AI →'}
              </motion.button>

              {(file || result) && (
                <motion.button
                  onClick={handleReset}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="outline-btn px-5 py-4 text-sm"
                  style={{ fontFamily: 'var(--fd)', fontSize: '0.9rem', padding: '1rem 1.2rem' }}
                  aria-label="Clear and start over"
                >
                  CLEAR
                </motion.button>
              )}
            </div>

            {!file && !loading && (
              <div style={{ border: '1px solid rgba(255,160,80,0.07)', background: 'rgba(255,160,80,0.02)', padding: '1.5rem' }}>
                <h3 className="mb-3" style={{ fontFamily: 'var(--fd)', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--white)', letterSpacing: '0.05em' }}>
                  TIPS FOR BEST RESULTS
                </h3>
                <ul className="space-y-2">
                  {['Good lighting shows food textures clearly', 'Shoot from above or slightly tilted', 'One dish per scan works best', 'Avoid blurry or dark photos'].map(tip => (
                    <li key={tip} className="flex items-start gap-2" style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.45)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>→</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {error && !loading && (
                <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ border: '1px solid rgba(217,69,48,0.3)', background: 'rgba(217,69,48,0.06)', padding: '2.5rem', textAlign: 'center' }}
                  role="alert"
                >
                  <p style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', color: 'var(--color-danger)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem' }}>ANALYSIS FAILED</p>
                  <p style={{ fontFamily: 'var(--fb)', color: 'rgba(255,245,235,0.45)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</p>
                  <button onClick={handleAnalyze} className="accent-btn" style={{ background: 'var(--color-danger)' }} aria-label="Retry">TRY AGAIN</button>
                </motion.div>
              )}
              {result && !loading && !error && (
                <ScanResult key="result" result={result} demoMode={demoMode} onSave={handleSave} />
              )}
              {!result && !error && !loading && (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center py-24 gap-5"
                >
                  <div className="float-animation" style={{ fontSize: '4rem' }} aria-hidden="true">🍽️</div>
                  <div>
                    <p style={{ fontFamily: 'var(--fd)', fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--white)' }}>RESULTS APPEAR HERE</p>
                    <p className="mt-1" style={{ fontFamily: 'var(--fb)', color: 'rgba(255,245,235,0.35)', fontSize: '0.85rem' }}>Upload an image and click Analyze to begin.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.main>
  )
}
