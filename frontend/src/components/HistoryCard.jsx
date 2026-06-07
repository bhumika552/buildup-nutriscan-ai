import { motion } from 'framer-motion'
import { formatDate, getConfidenceColor, NUTRITION_MAX } from '../utils/helpers'

const NUTRITION_COLORS = {
  calories: '#E07840',
  protein:  '#38bdf8',
  carbs:    '#f97316',
  fat:      '#f59e0b',
  fiber:    '#D4A04A',
}

export default function HistoryCard({ item, index, onViewDetails }) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card-hover group"
      style={{ border: '1px solid rgba(255,160,80,0.07)', background: 'rgba(255,160,80,0.02)' }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ height: '180px', background: '#0c0804' }}>
        {item.preview ? (
          <img src={item.preview} alt={`Scan of ${item.food_name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ fontSize: '3rem', opacity: 0.3 }} aria-hidden="true">🍽️</div>
        )}
        {/* Calorie badge */}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--fd)', fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent)', textShadow: '0 0 12px rgba(224,120,64,0.6)', background: 'rgba(8,6,4,0.85)', padding: '0.2rem 0.6rem', border: '1px solid rgba(255,160,80,0.3)' }}>
            {item.nutrition?.calories} KCAL
          </span>
        </div>
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,6,4,0.7) 0%, transparent 50%)' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--white)', lineHeight: 1.1 }}>
            {item.food_name}
          </h3>
          <p className="mt-1" style={{ fontFamily: 'var(--fm)', fontSize: '0.5rem', letterSpacing: '0.12em', color: 'rgba(255,245,235,0.3)' }}>
            {formatDate(item.date)}
          </p>
        </div>

        {/* Macro chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'P', value: item.nutrition?.protein, color: '#38bdf8' },
            { label: 'C', value: item.nutrition?.carbs,   color: '#f97316' },
            { label: 'F', value: item.nutrition?.fat,     color: '#f59e0b' },
          ].map(m => (
            <span key={m.label} style={{ fontFamily: 'var(--fm)', fontSize: '0.55rem', letterSpacing: '0.1em', color: m.color, border: `1px solid ${m.color}40`, background: `${m.color}0f`, padding: '0.2rem 0.5rem' }}>
              {m.label}: {m.value}g
            </span>
          ))}
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-2">
          <div className="flex-1 nutrition-bar-track">
            <div style={{ width: `${Math.round(item.confidence * 100)}%`, height: '100%', background: getConfidenceColor(item.confidence), borderRadius: '999px' }} />
          </div>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '0.55rem', letterSpacing: '0.1em', color: getConfidenceColor(item.confidence), flexShrink: 0 }}>
            {Math.round(item.confidence * 100)}%
          </span>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => onViewDetails(item)}
          className="outline-btn w-full text-center"
          style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', fontFamily: 'var(--fd)' }}
          aria-label={`View details for ${item.food_name}`}
        >
          VIEW DETAILS →
        </motion.button>
      </div>
    </motion.div>
  )
}
