import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

/* ─── Video URL (Google Flow shared video) ────────────────────── */
const BG_VIDEO = 'https://labs.google/fx/api/og-video/shared/4472de6a-fe89-4f3d-9907-c43bacca8e28'

/* ─── Page Transition ─────────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0 },
  in:      { opacity: 1, transition: { duration: 0.7 } },
  out:     { opacity: 0, transition: { duration: 0.3 } },
}

/* ─── Stagger fadeUp ──────────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ─── Noise Layer ─────────────────────────────────────────────── */
function NoiseLayer() {
  return <div className="noise-overlay" aria-hidden="true" />
}

/* ─── Custom Cursor ───────────────────────────────────────────── */
function CustomCursor() {
  const cursorRef = useRef(null)
  useEffect(() => {
    const el = cursorRef.current
    if (!el) return
    let raf, mx = 0, my = 0, cx = 0, cy = 0
    const move = (e) => { mx = e.clientX; my = e.clientY }
    const lerp = (a, b, t) => a + (b - a) * t
    const loop = () => {
      cx = lerp(cx, mx, 0.14); cy = lerp(cy, my, 0.14)
      el.style.left = cx + 'px'; el.style.top = cy + 'px'
      raf = requestAnimationFrame(loop)
    }
    const onEnter = () => el.classList.add('big')
    const onLeave = () => el.classList.remove('big')
    window.addEventListener('mousemove', move)
    document.querySelectorAll('a,button,[role=button]').forEach(b => {
      b.addEventListener('mouseenter', onEnter)
      b.addEventListener('mouseleave', onLeave)
    })
    raf = requestAnimationFrame(loop)
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])
  return <div id="ns-cursor" ref={cursorRef} aria-hidden="true" />
}

/* ─── Marquee Strip ───────────────────────────────────────────── */
function MarqueeStrip({ items, accent = false, speed = 18 }) {
  const doubled = [...items, ...items]
  return (
    <div
      className="overflow-hidden border-y"
      style={{
        background: accent ? 'var(--accent)' : 'rgba(8,6,4,0.85)',
        borderColor: accent ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
        backdropFilter: accent ? 'none' : 'blur(8px)',
        padding: '12px 0',
      }}
      aria-hidden="true"
    >
      <div style={{ display: 'flex', width: 'max-content', animation: `marquee ${speed}s linear infinite` }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--fd)',
              fontWeight: 900,
              fontSize: '0.75rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: accent ? '#080604' : 'rgba(255,245,235,0.22)',
              padding: '0 2.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            {item}
            <span style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: accent ? 'rgba(8,6,4,0.4)' : 'rgba(255,160,80,0.3)',
              display: 'inline-block'
            }} />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Stat Card ───────────────────────────────────────────────── */
function StatCard({ value, label, index }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="stat-card"
    >
      <div className="stat-value">{value}</div>
      <div className="label-text">{label}</div>
    </motion.div>
  )
}

/* ─── Step Card ───────────────────────────────────────────────── */
function StepCard({ num, icon, title, desc, index }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="step-card group"
    >
      <span className="step-num-bg">{num}</span>
      <div className="mb-5 flex items-center gap-4">
        <div
          className="text-3xl w-12 h-12 flex items-center justify-center rounded border transition-colors"
          style={{
            border: '1px solid rgba(255,160,80,0.2)',
            background: 'rgba(255,160,80,0.04)',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <span className="label-text" style={{ color: 'var(--accent)' }}>Step {num}</span>
      </div>
      <h3
        className="font-black uppercase leading-none mb-3 transition-colors"
        style={{ fontFamily: 'var(--fd)', fontSize: '1.8rem', color: 'var(--white)' }}
      >
        {title}
      </h3>
      <p style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.45)', fontSize: '0.875rem', lineHeight: 1.8 }}>
        {desc}
      </p>
    </motion.div>
  )
}

/* ─── App Mockup ──────────────────────────────────────────────── */
function AppMockup() {
  const bars = [
    { label: 'Protein', pct: 56, color: '#E07840' },
    { label: 'Carbs',   pct: 24, color: '#7BBFCF' },
    { label: 'Fat',     pct: 38, color: '#C8B84A' },
    { label: 'Fiber',   pct: 16, color: '#6BAA5A' },
  ]
  return (
    <div
      className="relative overflow-hidden w-full max-w-sm mx-auto"
      style={{
        background: 'linear-gradient(160deg, #120d08 0%, #0c0806 100%)',
        border: '1px solid rgba(255,160,80,0.15)',
        borderRadius: '16px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 80px rgba(200,120,50,0.1)',
      }}
      aria-label="BUILDUP app preview"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,160,80,0.08)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full dot-pulse" style={{ background: 'var(--accent)' }} />
          <span className="label-text" style={{ color: 'var(--accent)' }}>BUILDUP AI</span>
        </div>
        <span className="label-text">ANALYZING</span>
      </div>

      {/* Image with scan */}
      <div className="relative h-40 overflow-hidden flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a0e06 0%, #100804 100%)' }}>
        <div className="text-6xl" aria-hidden="true">🥗</div>
        <div className="scan-line" aria-hidden="true" />
        <div className="absolute top-3 right-3">
          <span className="label-text px-2 py-1 rounded"
            style={{ border: '1px solid rgba(255,160,80,0.4)', color: 'var(--accent)' }}>
            94% MATCH
          </span>
        </div>
      </div>

      {/* Result */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="label-text mb-1">DETECTED FOOD</p>
            <h4 className="font-black uppercase text-xl leading-tight"
              style={{ fontFamily: 'var(--fd)', color: 'var(--white)' }}>
              Grilled Chicken Salad
            </h4>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black leading-none accent-glow"
              style={{ fontFamily: 'var(--fd)' }}>320</div>
            <div className="label-text">KCAL</div>
          </div>
        </div>

        <div className="space-y-3">
          {bars.map(b => (
            <div key={b.label}>
              <div className="flex justify-between mb-1">
                <span className="label-text" style={{ color: b.color }}>{b.label}</span>
                <span className="label-text" style={{ color: 'var(--white)' }}>{Math.round(b.pct * 0.28)}g</span>
              </div>
              <div className="nutrition-bar-track">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${b.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: '100%', background: b.color, borderRadius: '999px', boxShadow: `0 0 8px ${b.color}55` }}
                />
              </div>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="accent-btn w-full mt-4 justify-center text-sm"
          style={{ padding: '0.75rem 1rem' }}
          aria-label="Save scan to history"
        >
          SAVE TO HISTORY →
        </motion.button>
      </div>
    </div>
  )
}

/* ─── Main Landing Page ───────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const heroY      = useTransform(scrollYProgress, [0, 1], [0, 100])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12])

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants}>
      <NoiseLayer />
      <CustomCursor />

      {/* ══════════════════════════════════════════════════════════
          HERO — Cinematic video background
      ══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-end overflow-hidden"
        style={{ padding: '0 2.5rem 5rem' }}
        aria-label="Hero section"
      >
        {/* Video layer */}
        <motion.div className="absolute inset-0 z-0" style={{ scale: videoScale }} aria-hidden="true">
          <video
            src={BG_VIDEO}
            autoPlay muted loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Layered cinematic overlays */}
          <div className="absolute inset-0" style={{
            background: [
              'linear-gradient(to top, rgba(5,3,1,0.97) 0%, rgba(5,3,1,0.75) 30%, rgba(5,3,1,0.25) 60%, rgba(5,3,1,0.05) 100%)',
              'linear-gradient(to right, rgba(5,3,1,0.8) 0%, rgba(5,3,1,0.3) 50%, transparent 100%)',
            ].join(', ')
          }} />
          {/* Warm amber glow — pulled from video food tones */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 55% 45% at 20% 75%, rgba(200,120,50,0.12) 0%, transparent 65%)',
          }} />
        </motion.div>

        {/* Top-right meta tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute top-24 right-10 text-right z-10"
          aria-hidden="true"
        >
          <p className="label-text">AI MODEL v2.4</p>
          <p className="label-text mt-1">FOOD DETECTION</p>
          <p className="label-text mt-1" style={{ color: 'var(--accent)' }}>● LIVE</p>
        </motion.div>

        {/* Hero text */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="w-2 h-2 rounded-full dot-pulse" style={{ background: 'var(--accent)' }} aria-hidden="true" />
            <span className="label-text" style={{ color: 'var(--accent)', letterSpacing: '0.28em' }}>
              AI-POWERED NUTRITION ANALYSIS
            </span>
          </motion.div>

          {/* Giant headline */}
          <div className="hero-title overflow-hidden" style={{ minHeight: '2.8em' }}>
            {['KNOW', 'WHAT YOU', 'EAT.'].map((line, i) => (
              <div key={i} style={{ overflow: 'hidden' }}>
                <motion.div
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.35 + i * 0.13, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  {line === 'EAT.' ? (
                    <span className="accent-glow">{line}</span>
                  ) : (
                    <span style={{ color: 'var(--white)' }}>{line}</span>
                  )}
                </motion.div>
              </div>
            ))}
          </div>

          {/* Sub + CTA row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 mt-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.6 }}
              className="max-w-sm leading-[1.8]"
              style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.5)', fontSize: '0.9rem' }}
            >
              Upload any food photo. Get instant nutritional insights powered by machine learning.
              No guessing — just accurate data in under 2 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              <motion.button
                onClick={() => navigate('/scan')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="accent-btn glow-pulse"
                aria-label="Start scanning food with BUILDUP"
              >
                START SCANNING
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
              <motion.button
                onClick={() => navigate('/about')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="outline-btn"
                aria-label="Learn more about BUILDUP"
              >
                VIEW DEMO
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          aria-hidden="true"
        >
          <span className="label-text tracking-[0.32em]">SCROLL</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--accent), transparent)' }}
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MARQUEE 1
      ══════════════════════════════════════════════════════════ */}
      <MarqueeStrip
        items={['NUTRITION AI', 'FOOD SCANNER', 'INSTANT RESULTS', 'MACHINE LEARNING', '98% ACCURACY', 'ZERO GUESSWORK']}
        accent={false}
      />

      {/* ══════════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative py-24"
        style={{ background: 'var(--black)', borderTop: '1px solid rgba(255,160,80,0.06)' }}
        aria-label="Statistics"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px"
            style={{ background: 'rgba(255,160,80,0.05)' }}>
            {[
              { value: '50K+', label: 'MEALS ANALYZED' },
              { value: '98%',  label: 'DETECTION ACCURACY' },
              { value: '200+', label: 'FOOD CATEGORIES' },
              { value: '< 2S', label: 'ANALYSIS TIME' },
            ].map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative py-28"
        style={{ background: '#0c0804', borderTop: '1px solid rgba(255,160,80,0.06)' }}
        aria-label="How BUILDUP works"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="label-text" style={{ color: 'var(--accent)' }}>01 — HOW IT WORKS</span>
              </div>
              <h2 className="sec-title" style={{ color: 'var(--white)', maxWidth: '600px' }}>
                THREE<br />
                <span className="accent-glow">STEPS</span><br />
                TO CLARITY
              </h2>
            </div>
            <p className="max-w-xs leading-relaxed"
              style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.38)', fontSize: '0.875rem' }}>
              No barcode scanning. No manual entry. Point your camera and let the AI handle the rest.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Steps */}
            <div className="flex flex-col gap-4">
              {[
                { num: '01', icon: '📸', title: 'PHOTOGRAPH YOUR MEAL', desc: 'Snap or upload any food photo — plate, bowl, snack, or drink. JPG, PNG, WebP all supported.' },
                { num: '02', icon: '🤖', title: 'AI IDENTIFIES THE FOOD', desc: 'EfficientNet B4 deep learning model recognizes the dish and estimates portion in milliseconds.' },
                { num: '03', icon: '📊', title: 'GET FULL NUTRITION DATA', desc: 'Calories, protein, carbs, fat, and fiber — clean breakdown. Save to history. Track trends.' },
              ].map((step, i) => <StepCard key={step.num} {...step} index={i} />)}
            </div>

            {/* App mockup */}
            <div className="lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <AppMockup />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-center"
              >
                <span className="label-text">↑ LIVE PREVIEW — TRY IT YOURSELF</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MARQUEE 2 — amber accent
      ══════════════════════════════════════════════════════════ */}
      <MarqueeStrip
        items={['START SCANNING', 'FREE TO USE', 'NO SIGNUP', 'INSTANT AI', 'KNOW WHAT YOU EAT', 'TRACK NUTRITION']}
        accent={true}
        speed={13}
      />

      {/* ══════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-28"
        style={{ background: 'var(--black)', borderTop: '1px solid rgba(255,160,80,0.06)' }}
        aria-label="Key features"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
            <div>
              <span className="label-text block mb-5" style={{ color: 'var(--accent)' }}>02 — FEATURES</span>
              <h2 className="sec-title" style={{ color: 'var(--white)' }}>
                BUILT FOR<br />
                <span className="accent-glow">REAL LIFE</span>
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px"
            style={{ background: 'rgba(255,160,80,0.05)' }}>
            {[
              { icon: '🎯', title: 'HIGH ACCURACY', desc: '98% top-1 accuracy across 200+ food categories using fine-tuned deep learning.' },
              { icon: '⚡', title: 'UNDER 2 SECONDS', desc: 'GPU-accelerated inference with model quantization. Results before you can blink.' },
              { icon: '🔒', title: 'FULLY PRIVATE', desc: 'Images processed server-side and never stored. Your meals are your business.' },
              { icon: '📈', title: 'TRACK HISTORY', desc: 'Every scan saved locally. View full breakdowns, spot patterns, stay on track.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="step-card group"
                style={{ borderRadius: 0 }}
              >
                <div
                  className="text-3xl mb-5 w-12 h-12 flex items-center justify-center transition-colors"
                  style={{ border: '1px solid rgba(255,160,80,0.12)', background: 'rgba(255,160,80,0.03)' }}
                  aria-hidden="true"
                >
                  {f.icon}
                </div>
                <h3
                  className="font-black uppercase mb-3 transition-colors"
                  style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', color: 'var(--white)' }}
                >
                  {f.title}
                </h3>
                <p style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.4)', fontSize: '0.85rem', lineHeight: 1.85 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-28"
        style={{ background: '#0c0804', borderTop: '1px solid rgba(255,160,80,0.06)' }}
        aria-label="Testimonials"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <span className="label-text block mb-5" style={{ color: 'var(--accent)' }}>03 — TESTIMONIALS</span>
          <h2 className="sec-title mb-16" style={{ color: 'var(--white)' }}>
            WHAT USERS<br />
            <span className="accent-glow">ARE SAYING</span>
          </h2>

          <div className="grid sm:grid-cols-3 gap-px"
            style={{ background: 'rgba(255,160,80,0.05)' }}>
            {[
              { quote: 'I used to guess my calories every day. BUILDUP gave me actual numbers in seconds. Complete game changer.', name: 'PRIYA M.', role: 'Fitness Enthusiast', stars: 5 },
              { quote: 'Tested it on 20 different dishes — nailed 19 on the first try. The accuracy is honestly impressive for a free tool.', name: 'JAKE T.', role: 'Personal Trainer', stars: 5 },
              { quote: "As a dietitian I'm impressed by the macro detail. Fast, clean, and reliable enough to recommend to clients.", name: 'DR. ANIKA R.', role: 'Registered Dietitian', stars: 5 },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="testi-card"
                style={{ borderRadius: 0 }}
              >
                <div className="flex gap-1 mb-5" aria-label={`${t.stars} stars`}>
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <span key={si} style={{ color: 'var(--accent)', fontSize: '1rem' }} aria-hidden="true">★</span>
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.55)', lineHeight: 1.85, fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
                  "{t.quote}"
                </p>
                <div style={{ borderTop: '1px solid rgba(255,160,80,0.07)', paddingTop: '1rem' }}>
                  <p className="font-black uppercase" style={{ fontFamily: 'var(--fd)', fontSize: '1rem', color: 'var(--white)' }}>{t.name}</p>
                  <p className="label-text mt-1">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA — second video section
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-start justify-center overflow-hidden"
        style={{ padding: '0 3.5rem' }}
        aria-label="Call to action"
      >
        {/* Video BG */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <video
            src={BG_VIDEO}
            autoPlay muted loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25) saturate(1.6) hue-rotate(5deg)' }}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(5,3,1,0.9) 0%, rgba(20,12,4,0.7) 60%, rgba(5,3,1,0.85) 100%)'
          }} />
        </div>

        {/* Warm glow orb */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 pointer-events-none rounded-full"
          style={{
            width: '35vw', height: '35vw',
            background: 'radial-gradient(circle, rgba(200,100,40,0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-8"
              style={{ fontFamily: 'var(--fm)', fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,160,80,0.45)' }}>
              READY TO START?
            </p>

            <div
              className="leading-[0.88] font-black uppercase tracking-tight mb-8"
              style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(5rem, 13vw, 13rem)', color: 'rgba(255,245,235,0.06)' }}
            >
              {['EAT', 'SMARTER.'].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.14, duration: 0.8 }}
                  style={{ display: 'block' }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <p className="mb-10 max-w-sm"
              style={{ fontFamily: 'var(--fm)', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,160,80,0.4)' }}>
              Join 50,000+ users tracking nutrition with a single photo. Free forever. No account required.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={() => navigate('/scan')}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="accent-btn"
                aria-label="Start scanning food for free"
              >
                START SCANNING FREE →
              </motion.button>
              <motion.button
                onClick={() => navigate('/about')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="outline-btn"
                aria-label="Learn more about BUILDUP"
              >
                LEARN MORE
              </motion.button>
            </div>

            <p className="mt-6"
              style={{ fontFamily: 'var(--fm)', fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(255,160,80,0.25)' }}>
              NO CREDIT CARD · NO SIGNUP · INSTANT RESULTS
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer
        style={{ background: 'var(--black)', borderTop: '1px solid rgba(255,160,80,0.06)', padding: '2rem 2.5rem' }}
        aria-label="Site footer"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div style={{ fontFamily: 'var(--fd)', fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--white)' }}>
            BUILD<span className="accent-glow">UP</span>
          </div>
          <nav className="flex gap-8" aria-label="Footer navigation">
            {[['/', 'Home'], ['/scan', 'Scan'], ['/history', 'History'], ['/about', 'About']].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="label-text transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {label.toUpperCase()}
              </a>
            ))}
          </nav>
          <p style={{ fontFamily: 'var(--fm)', fontSize: '0.55rem', color: 'rgba(255,245,235,0.2)', letterSpacing: '0.08em' }}>
            © {new Date().getFullYear()} BUILDUP AI
          </p>
        </div>
      </footer>
    </motion.div>
  )
}
