import { motion } from 'framer-motion'
import NutritionBar from './NutritionBar'
import { getConfidenceColor, getConfidenceLabel, NUTRITION_MAX } from '../utils/helpers'

const nutritionConfig = [
  { key: 'calories', label: 'CALORIES', unit: 'kcal' },
  { key: 'protein',  label: 'PROTEIN',  unit: 'g' },
  { key: 'carbs',    label: 'CARBS',    unit: 'g' },
  { key: 'fat',      label: 'FAT',      unit: 'g' },
  { key: 'fiber',    label: 'FIBER',    unit: 'g' },
]

export default function ScanResult({ result, demoMode, onSave }) {
  const { food_name, confidence, nutrition } = result
  const confColor = getConfidenceColor(confidence)
  const confLabel = getConfidenceLabel(confidence)

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="flex flex-col gap-4"
    >
      {demoMode && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', padding: '0.75rem 1rem' }}
          role="note"
        >
          <p style={{ fontFamily: 'var(--fm)', fontSize: '0.65rem', letterSpacing: '0.12em', color: '#f59e0b' }}>
            ⚠ DEMO MODE — Backend offline. Showing sample data.
          </p>
        </motion.div>
      )}

      {/* Header */}
      <div style={{ border: '1px solid rgba(255,160,80,0.07)', background: 'rgba(255,160,80,0.02)', padding: '1.5rem' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label-text mb-1">DETECTED FOOD</p>
            <h2 style={{ fontFamily: 'var(--fd)', fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--white)', lineHeight: 1.05 }}>
              {food_name}
            </h2>
          </div>
          <div style={{ padding: '0.3rem 0.8rem', border: `1px solid ${confColor}50`, background: `${confColor}12`, color: confColor, fontFamily: 'var(--fm)', fontSize: '0.6rem', letterSpacing: '0.12em', flexShrink: 0 }} aria-label={`Confidence: ${Math.round(confidence * 100)}%`}>
            {Math.round(confidence * 100)}% {confLabel.toUpperCase()}
          </div>
        </div>

        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,160,80,0.07)' }}>
          <div className="flex items-baseline gap-2">
            <span style={{ fontFamily: 'var(--fd)', fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1, textShadow: '0 0 30px rgba(224,120,64,0.35)' }}>{nutrition.calories}</span>
            <span className="label-text">KCAL PER SERVING</span>
          </div>
        </div>
      </div>

      {/* Nutrition bars */}
      <div style={{ border: '1px solid rgba(255,160,80,0.07)', background: 'rgba(255,160,80,0.02)', padding: '1.5rem' }}>
        <p className="label-text mb-5">NUTRITION BREAKDOWN</p>
        <div className="flex flex-col gap-4">
          {nutritionConfig.map(({ key, label, unit }, i) => (
            <NutritionBar key={key} label={label} value={nutrition[key]} unit={unit} max={NUTRITION_MAX[key]} delay={i * 0.08} />
          ))}
        </div>
        <p className="mt-5 text-center" style={{ fontFamily: 'var(--fm)', fontSize: '0.5rem', letterSpacing: '0.12em', color: 'rgba(255,245,235,0.2)' }}>
          % OF RECOMMENDED DAILY INTAKE
        </p>
      </div>

      {/* Save */}
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(224,120,64,0.4)' }}
        whileTap={{ scale: 0.97 }}
        onClick={onSave}
        className="accent-btn w-full justify-center"
        aria-label="Save to history"
      >
        SAVE TO HISTORY →
      </motion.button>
    </motion.div>
  )
}
