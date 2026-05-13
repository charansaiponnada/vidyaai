import { useState } from 'react'

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

  return (
    <div style={styles.wrap}>
      <div style={styles.glow} />

      <div style={styles.badge} className="fade-up">
        <span style={styles.dot} />
        VidyaAI — Adaptive Learning Platform
      </div>

      <h1 style={styles.title} className="fade-up">
        Learn anything,<br />
        <span style={{ color: 'var(--purple2)' }}>in your language.</span>
      </h1>
      <p style={styles.sub} className="fade-up">
        An AI tutor that adapts to how you learn and speaks your native language.
        Powered by Google Gemini.
      </p>

      <div style={styles.card} className="fade-up">
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
            Get free key at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--purple2)' }}>
              aistudio.google.com/apikey
            </a>
          </p>
        </Field>

        <Field label="Preferred Language">
          <div style={styles.langGrid}>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                style={{
                  ...styles.langBtn,
                  ...(language === l.code ? styles.langBtnActive : {}),
                }}
              >
                <span style={{ fontSize: 16 }}>{l.native}</span>
                <span style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{l.label}</span>
              </button>
            ))}
          </div>
        </Field>

        {activeError && <p style={styles.error}>{activeError}</p>}

        <button style={styles.startBtn} onClick={handleStart}>
          Start Learning →
        </button>
      </div>

      <div style={styles.features}>
        {[
          { icon: '🧠', text: 'Adaptive difficulty quiz engine' },
          { icon: '🌐', text: 'Explains in Telugu, Hindi, Tamil' },
          { icon: '📊', text: 'Knowledge gap heatmap' },
          { icon: '🎯', text: 'Learning style detection' },
        ].map((f, i) => (
          <div key={i} style={styles.featItem}>
            <span>{f.icon}</span>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
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
    padding: '2rem 1rem',
    position: 'relative',
  },
  glow: {
    position: 'fixed', top: -300, left: '50%', transform: 'translateX(-50%)',
    width: 800, height: 800,
    background: 'radial-gradient(ellipse, rgba(124,110,247,0.10) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--bg3)', border: '1px solid var(--border)',
    padding: '6px 16px', borderRadius: 40,
    fontSize: 12, color: 'var(--text2)', marginBottom: '2rem',
  },
  dot: {
    width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)',
    animation: 'pulse 2s infinite',
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700,
    textAlign: 'center', lineHeight: 1.2, marginBottom: '1rem',
  },
  sub: {
    fontSize: 15, color: 'var(--text2)', textAlign: 'center',
    maxWidth: 480, lineHeight: 1.75, marginBottom: '2.5rem',
  },
  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-xl)', padding: '2rem',
    width: '100%', maxWidth: 480,
  },
  input: {
    width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--r)', padding: '11px 14px',
    fontSize: 14, color: 'var(--text)', outline: 'none',
    transition: 'border-color 0.2s',
  },
  hint: { fontSize: 11, color: 'var(--text3)', marginTop: 5 },
  langGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 },
  langBtn: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--r)', padding: '10px 6px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  langBtnActive: {
    border: '1px solid var(--purple)', background: 'rgba(124,110,247,0.12)',
    color: 'var(--purple2)',
  },
  startBtn: {
    width: '100%', padding: '13px', background: 'var(--purple)',
    border: 'none', borderRadius: 'var(--r)',
    fontSize: 15, fontWeight: 600, color: '#fff',
    transition: 'all 0.2s', marginTop: 4,
  },
  error: {
    fontSize: 13, color: 'var(--coral)',
    background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)',
    borderRadius: 8, padding: '8px 12px', marginBottom: 12,
  },
  features: {
    display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center',
    marginTop: '2rem', maxWidth: 480,
  },
  featItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, color: 'var(--text2)',
  },
}
