import { useState } from 'react'
import { motion } from 'framer-motion'

const LANGUAGES = [
  { code: 'english', label: 'English', native: 'English' },
  { code: 'telugu',  label: 'Telugu',  native: 'తెలుగు' },
  { code: 'hindi',   label: 'Hindi',   native: 'हिंदी' },
  { code: 'tamil',   label: 'Tamil',   native: 'தமிழ்' },
]

export default function SetupScreen({ onStart, errorOverride }) {
  const [apiKey, setApiKey] = useState('')
  const [name, setName]     = useState('')
  const [subject, setSubject] = useState('')
  const [language, setLanguage] = useState('english')
  const [error, setError] = useState('')

  const activeError = errorOverride || error

  function handleStart() {
    if (!apiKey.trim()) return setError('Please enter your Gemini API key.')
    if (!name.trim())   return setError('Please enter your name.')
    if (!subject.trim()) return setError('Please enter a subject to learn.')
    setError('')
    onStart({ apiKey: apiKey.trim(), name: name.trim(), subject: subject.trim(), language })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.glow} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.badge}
      >
        <span style={styles.dot} />
        Adaptive Learning Platform
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.title}
      >
        Learn anything,<br />
        <span className="text-gradient">in your language.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={styles.sub}
      >
        An AI tutor that adapts to how you learn and speaks your native language.
        Powered by Google Gemini.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        style={styles.card}
        className="glass"
      >
        <Field label="Your Name">
          <input
            style={styles.input}
            placeholder="e.g. Ravi Kumar"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </Field>

        <Field label="Learning Context">
          <textarea
            style={{ ...styles.input, height: 100, resize: 'none' }}
            placeholder="Paste your syllabus, a textbook chapter, or just a subject name (e.g. 10th Class Physics)..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <p style={styles.hint}>VidyaAI will build a custom roadmap from this.</p>
        </Field>

        <Field label="Gemini API Key">
          <input
            style={styles.input}
            type="password"
            placeholder="AIza..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <p style={styles.hint}>
            Get a free key at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--teal-bright)' }}>
              aistudio.google.com
            </a>
          </p>
        </Field>

        <Field label="Preferred Language">
          <div style={styles.langGrid}>
            {LANGUAGES.map(l => (
              <motion.button
                key={l.code}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLanguage(l.code)}
                style={{
                  ...styles.langBtn,
                  ...(language === l.code ? styles.langBtnActive : {}),
                }}
              >
                <span style={{ fontSize: 17, fontWeight: 700 }}>{l.native}</span>
                <span style={{ fontSize: 11, color: language === l.code ? 'var(--teal-bright)' : 'var(--text-muted)', marginTop: 2 }}>{l.label}</span>
              </motion.button>
            ))}
          </div>
        </Field>

        {activeError && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={styles.error}
          >
            {activeError}
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={styles.startBtn}
          onClick={handleStart}
        >
          Start Learning
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 6 }}>
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={styles.features}
      >
        {[
          { icon: 'A', text: 'Adaptive difficulty quiz engine' },
          { icon: 'T', text: 'Explains in Telugu, Hindi, Tamil' },
          { icon: 'M', text: 'Knowledge gap heatmap' },
          { icon: 'P', text: 'Learning style detection' },
        ].map((f, i) => (
          <motion.div key={i} variants={item} style={styles.featItem}>
            <span style={styles.featIcon}>{f.icon}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 1rem',
    position: 'relative',
    background: 'var(--bg)',
  },
  glow: {
    position: 'fixed', top: -300, left: '50%', transform: 'translateX(-50%)',
    width: 1000, height: 1000,
    background: 'radial-gradient(ellipse, rgba(13,148,136,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    padding: '8px 20px', borderRadius: 'var(--radius-full)',
    fontSize: 12, color: 'var(--text-secondary)', marginBottom: '2.5rem',
    fontWeight: 600,
  },
  dot: {
    width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)',
    display: 'inline-block',
    boxShadow: '0 0 10px var(--teal)',
  },
  title: {
    fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800,
    textAlign: 'center', lineHeight: 1.1, marginBottom: '1.25rem',
    letterSpacing: '-0.02em',
  },
  sub: {
    fontSize: 16, color: 'var(--text-secondary)', textAlign: 'center',
    maxWidth: 520, lineHeight: 1.75, marginBottom: '3rem',
  },
  card: {
    borderRadius: 'var(--radius-xl)', padding: '2.5rem',
    width: '100%', maxWidth: 520,
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-bright)',
  },
  input: {
    width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '12px 16px',
    fontSize: 14, color: 'var(--text-primary)', outline: 'none',
    transition: 'all 0.2s',
  },
  hint: { fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 },
  langGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  langBtn: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '12px 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  langBtnActive: {
    borderColor: 'var(--teal)', background: 'var(--teal-muted)',
    color: 'var(--teal-bright)',
  },
  startBtn: {
    width: '100%', padding: '15px', background: 'var(--teal)',
    border: 'none', borderRadius: 'var(--radius-md)',
    fontSize: 16, fontWeight: 700, color: '#fff',
    boxShadow: '0 4px 20px rgba(13,148,136,0.3)',
    marginTop: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  error: {
    fontSize: 13, color: 'var(--coral)',
    background: 'var(--coral-muted)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 15,
    fontWeight: 500,
  },
  features: {
    display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center',
    marginTop: '3rem', maxWidth: 600,
  },
  featItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 13, fontWeight: 500,
  },
  featIcon: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26, borderRadius: 7,
    background: 'var(--teal-muted)', color: 'var(--teal-bright)',
    fontSize: 11, fontWeight: 800,
    flexShrink: 0,
  },
}
