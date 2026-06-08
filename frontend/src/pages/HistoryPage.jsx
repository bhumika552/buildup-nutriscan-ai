import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import HistoryCard from '../components/HistoryCard'
import NutritionBar from '../components/NutritionBar'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { formatDate, NUTRITION_MAX } from '../utils/helpers'

const pageVariants = {
  initial: { opacity: 0 },
  in:      { opacity: 1, transition: { duration: 0.4 } },
  out:     { opacity: 0, transition: { duration: 0.3 } },
}

const nutritionConfig = [
  { key: 'calories', label: 'CALORIES', unit: 'kcal' },
  { key: 'protein',  label: 'PROTEIN',  unit: 'g' },
  { key: 'carbs',    label: 'CARBS',    unit: 'g' },
  { key: 'fat',      label: 'FAT',      unit: 'g' },
  { key: 'fiber',    label: 'FIBER',    unit: 'g' },
]

export default function HistoryPage() {
  const { isAuthenticated, token } = useAuth()
  const [localHistory, setLocalHistory] = useLocalStorage('buildup_history', [])
  const [dbHistory, setDbHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [selectedItem, setSelectedItem]         = useState(null)
  
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Fetch scan history from database if authenticated
  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated) return
      setHistoryLoading(true)
      try {
        const response = await axios.get('http://localhost:5001/api/scans')
        setDbHistory(response.data)
      } catch (err) {
        console.error('Error fetching database history:', err.message)
        addToast('Failed to load history from cloud', 'error')
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [isAuthenticated, token])

  const history = isAuthenticated ? dbHistory : localHistory

  const handleClear = async () => {
    if (isAuthenticated) {
      try {
        await axios.delete('http://localhost:5001/api/scans')
        setDbHistory([])
        setShowClearConfirm(false)
        setSelectedItem(null)
        addToast('History cleared from cloud', 'info')
      } catch (err) {
        console.error('Error clearing database history:', err.message)
        addToast('Failed to clear history from cloud', 'error')
      }
    } else {
      setLocalHistory([])
      setShowClearConfirm(false)
      setSelectedItem(null)
      addToast('History cleared from device', 'info')
    }
  }

  return (
    <motion.main
      initial="initial" animate="in" exit="out" variants={pageVariants}
      style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '72px' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-12">
          <div>
            <p className="label-text mb-3">SCAN HISTORY</p>
            <h1 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--white)', lineHeight: 1 }}>
              YOUR <span style={{ color: 'var(--accent)' }}>SCANS</span>
            </h1>
            <p className="mt-2" style={{ fontFamily: 'var(--fm)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'rgba(255,245,235,0.35)' }}>
              {history.length} SCAN{history.length !== 1 ? 'S' : ''} SAVED {isAuthenticated ? 'IN CLOUD' : 'LOCALLY'}
            </p>
          </div>

          {history.length > 0 && !showClearConfirm && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowClearConfirm(true)}
              className="outline-btn"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', borderColor: 'rgba(217,69,48,0.3)', color: 'var(--color-danger)' }}
              aria-label="Clear all scan history"
            >
              CLEAR HISTORY
            </motion.button>
          )}

          {showClearConfirm && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
              style={{ border: '1px solid rgba(217,69,48,0.3)', background: 'rgba(217,69,48,0.08)', padding: '0.75rem 1rem' }}
            >
              <p style={{ fontFamily: 'var(--fm)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--color-danger)' }}>DELETE ALL?</p>
              <button onClick={handleClear} style={{ fontFamily: 'var(--fd)', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', background: 'var(--color-danger)', color: '#fff', border: 'none', padding: '0.3rem 0.9rem', cursor: 'pointer' }} aria-label="Confirm">YES</button>
              <button onClick={() => setShowClearConfirm(false)} style={{ fontFamily: 'var(--fd)', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,245,235,0.5)', border: '1px solid rgba(255,245,235,0.15)', padding: '0.3rem 0.9rem', cursor: 'pointer' }} aria-label="Cancel">NO</button>
            </motion.div>
          )}
        </div>

        {/* Loading */}
        {historyLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid rgba(255,160,80,0.2)',
                borderTopColor: 'var(--accent)'
              }}
            />
            <p className="label-text" style={{ fontSize: '0.7rem' }}>RETRIEVING CLOUD SCANS...</p>
          </div>
        )}

        {/* Empty */}
        {!historyLoading && history.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-32 gap-6">
            <div className="float-animation" style={{ fontSize: '4rem', opacity: 0.4 }} aria-hidden="true">📦</div>
            <div>
              <p style={{ fontFamily: 'var(--fd)', fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--white)' }}>NO SCANS YET</p>
              <p className="mt-1" style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.35)', fontSize: '0.9rem' }}>Start by analyzing a meal to build your history.</p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/scan')} className="accent-btn" aria-label="Go scan">
              ANALYZE YOUR FIRST MEAL →
            </motion.button>
          </motion.div>
        )}

        {/* Grid */}
        {!historyLoading && history.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item, i) => (
              <HistoryCard key={item.id || item._id} item={item} index={i} onViewDetails={setSelectedItem} />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(8,6,4,0.75)', backdropFilter: 'blur(8px)', zIndex: 500 }}
            />
            <motion.div key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 501, padding: '1rem' }}
              role="dialog" aria-modal="true" aria-label={`Details for ${selectedItem.food_name}`}
            >
              <div style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,160,80,0.08)', maxWidth: '440px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                {selectedItem.preview && (
                  <div style={{ height: '220px', overflow: 'hidden' }}>
                    <img src={selectedItem.preview} alt={selectedItem.food_name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div style={{ padding: '1.5rem' }}>
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h2 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--white)', lineHeight: 1 }}>{selectedItem.food_name}</h2>
                    <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,245,235,0.4)', cursor: 'pointer', fontSize: '1.2rem', flexShrink: 0, lineHeight: 1 }} aria-label="Close">✕</button>
                  </div>
                  <p className="mb-5" style={{ fontFamily: 'var(--fm)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,245,235,0.25)' }}>{formatDate(selectedItem.date)}</p>
                  <div className="flex flex-col gap-3">
                    {nutritionConfig.map(({ key, label, unit }, i) => (
                      <NutritionBar key={key} label={label} value={selectedItem.nutrition[key]} unit={unit} max={NUTRITION_MAX[key]} delay={i * 0.07} />
                    ))}
                  </div>
                  <div className="flex gap-3 mt-5" style={{ borderTop: '1px solid rgba(255,160,80,0.07)', paddingTop: '1.25rem' }}>
                    <button onClick={() => setSelectedItem(null)} className="outline-btn flex-1 text-center" style={{ padding: '0.7rem', fontSize: '0.85rem', fontFamily: 'var(--fd)' }}>CLOSE</button>
                    <button onClick={() => { navigate('/scan'); setSelectedItem(null) }} className="accent-btn flex-1 justify-center" style={{ padding: '0.7rem' }}>SCAN NEW</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.main>
  )
}
