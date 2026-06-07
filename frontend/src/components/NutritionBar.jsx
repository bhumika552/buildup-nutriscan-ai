import { motion } from 'framer-motion'

const COLORS = {
  calories: '#E07840',
  protein:  '#38bdf8',
  carbs:    '#f97316',
  fat:      '#f59e0b',
  fiber:    '#D4A04A',
}

export default function NutritionBar({ label, value, unit, max, delay = 0 }) {
  const pct = Math.min((value / max) * 100, 100)
  const key = label.toLowerCase()
  const color = COLORS[key] || 'var(--accent)'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ fontFamily: 'var(--fm)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'rgba(255,245,235,0.45)' }}>{label}</span>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: 'var(--fd)', fontSize: '1rem', fontWeight: 900, color: 'var(--white)' }}>{value}</span>
          <span style={{ fontFamily: 'var(--fm)', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,245,235,0.25)' }}>{unit.toUpperCase()}</span>

          <span style={{ fontFamily: 'var(--fm)', fontSize: '0.5rem', letterSpacing: '0.08em', color, minWidth: '3ch', textAlign: 'right' }}>{Math.round(pct)}%</span>
        </div>
      </div>
      <div className="nutrition-bar-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: color, borderRadius: '999px', boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  )
}
