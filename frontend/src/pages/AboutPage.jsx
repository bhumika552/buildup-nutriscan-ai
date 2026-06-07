import { motion } from 'framer-motion'

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
}

const pageVariants = {
  initial: { opacity: 0 },
  in:      { opacity: 1, transition: { duration: 0.4 } },
  out:     { opacity: 0, transition: { duration: 0.3 } },
}

export default function AboutPage() {
  return (
    <motion.main
      initial="initial" animate="in" exit="out" variants={pageVariants}
      style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '72px' }}
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16">

        {/* Hero */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-20">
          <p className="label-text mb-5">ABOUT BUILDUP</p>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--white)', lineHeight: 0.9, marginBottom: '1.5rem' }}>
            AI THAT<br /><span style={{ color: 'var(--accent)', textShadow: '0 0 30px rgba(224,120,64,0.3)' }}>UNDERSTANDS</span><br />YOUR PLATE
          </h1>
          <p style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.5)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '540px' }}>
            BUILDUP combines computer vision and deep learning to analyze food photographs
            and return detailed nutritional data in under 2 seconds — no barcodes, no manual entry.
          </p>
        </motion.div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, var(--accent), transparent)', marginBottom: '4rem' }} />

        {/* Mission */}
        <motion.section custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16" aria-label="Mission">
          <div style={{ border: '1px solid rgba(255,160,80,0.07)', background: 'rgba(255,160,80,0.02)', padding: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '2.5rem', flexShrink: 0 }} aria-hidden="true">🎯</div>
            <div>
              <h2 style={{ fontFamily: 'var(--fd)', fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--white)', marginBottom: '0.75rem' }}>OUR MISSION</h2>
              <p style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.5)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                Nutritional awareness should be effortless. Most people don't track what they eat because it's tedious.
                BUILDUP removes that friction entirely: one photo is all it takes.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Architecture */}
        <motion.section custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16" aria-label="Architecture">
          <p className="label-text mb-5">SYSTEM ARCHITECTURE</p>
          <div style={{ border: '1px solid rgba(255,160,80,0.07)', background: 'rgba(255,160,80,0.02)', padding: '2.5rem' }}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { icon: '⚛️', label: 'REACT FRONTEND', sub: 'Vite + Framer Motion' },
                { arrow: true },
                { icon: '🌐', label: 'EXPRESS API',    sub: 'Node.js gateway' },
                { arrow: true },
                { icon: '🐍', label: 'PYTHON AI',      sub: 'FastAPI + TensorFlow' },
              ].map((item, i) => item.arrow ? (
                <span key={i} style={{ fontFamily: 'var(--fm)', color: 'var(--accent)', fontSize: '1.2rem' }} aria-hidden="true">→</span>
              ) : (
                <div key={i} style={{ textAlign: 'center', padding: '1.25rem 1.5rem', border: '1px solid rgba(255,160,80,0.12)', background: 'rgba(255,160,80,0.03)', minWidth: '130px' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }} aria-hidden="true">{item.icon}</div>
                  <p style={{ fontFamily: 'var(--fd)', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--white)' }}>{item.label}</p>
                  <p className="mt-0.5 label-text">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Tech stack */}
        <motion.section custom={3} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16" aria-label="Tech stack">
          <p className="label-text mb-5">TECHNOLOGY STACK</p>
          <div className="flex flex-wrap gap-2">
            {['React 19', 'Vite 8', 'Framer Motion', 'Spline 3D', 'Python', 'TensorFlow', 'EfficientNet B4', 'FastAPI', 'Tailwind v4', 'Axios', 'Barlow Condensed', 'Space Mono'].map(tech => (
              <span key={tech} style={{ fontFamily: 'var(--fm)', fontSize: '0.6rem', letterSpacing: '0.1em', padding: '0.3rem 0.75rem', border: '1px solid rgba(255,160,80,0.2)', color: 'var(--accent)', background: 'rgba(255,160,80,0.04)' }}>
                {tech.toUpperCase()}
              </span>
            ))}
          </div>
        </motion.section>

        {/* How AI works */}
        <motion.section custom={4} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16" aria-label="How the AI works">
          <p className="label-text mb-5">HOW THE AI WORKS</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '🔬', title: 'EFFICIENTNET B4', desc: 'Fine-tuned CNN trained on 100K+ food images. 98% top-1 accuracy across 200+ categories.' },
              { icon: '📏', title: 'PORTION ESTIMATION', desc: 'Reference-based depth estimation infers serving sizes from standard plate dimensions.' },
              { icon: '🗄️', title: 'NUTRITION DATABASE', desc: 'Detected foods matched against curated database with per-100g nutrient profiles.' },
              { icon: '⚡', title: 'SUB-2S INFERENCE', desc: 'Model quantization + GPU-accelerated inference deliver results in under 2 seconds.' },
            ].map((item, i) => (
              <motion.div key={item.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                style={{ border: '1px solid rgba(255,160,80,0.07)', background: 'rgba(255,160,80,0.02)' }}
                className="group step-card"
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }} aria-hidden="true">{item.icon}</div>
                <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--white)', marginBottom: '0.5rem' }} className="group-hover:text-[var(--accent)] transition-colors">{item.title}</h3>
                <p style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.45)', fontSize: '0.85rem', lineHeight: 1.8 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Credits */}
        <motion.section custom={5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} aria-label="Credits">
          <div style={{ background: 'rgba(255,160,80,0.04)', border: '1px solid rgba(255,160,80,0.15)', borderLeft: '3px solid var(--accent)', padding: '2rem' }}>
            <p className="label-text mb-5" style={{ color: 'var(--accent)' }}>PROJECT CREDITS</p>
            <div className="flex flex-col gap-3">
              {[
                { role: 'FRONTEND',  credit: 'React 19 · Vite · Framer Motion · Spline · Tailwind v4' },
                { role: 'AI / ML',   credit: 'Python · TensorFlow · EfficientNet B4 · FastAPI' },
                { role: 'DATASET',   credit: 'Food-101 + custom augmented dataset (100K+ images)' },
                { role: 'DESIGN',    credit: 'Barlow Condensed · Space Mono · warm amber accent system' },
              ].map(c => (
                <div key={c.role} className="flex items-start gap-4">
                  <span style={{ fontFamily: 'var(--fm)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--accent)', width: '80px', flexShrink: 0, paddingTop: '0.1rem' }}>{c.role}</span>
                  <span style={{ fontFamily: 'var(--fb)', fontWeight: 300, color: 'rgba(255,245,235,0.5)', fontSize: '0.85rem' }}>{c.credit}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

      </div>
    </motion.main>
  )
}
