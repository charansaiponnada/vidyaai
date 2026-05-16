import { useState } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  TranslationIcon, 
  Idea01Icon, 
  Analytics01Icon, 
  SparklesIcon,
  ArrowRight02Icon,
  BookOpen01Icon,
  AiMagicIcon,
  UserIcon
} from '@hugeicons/core-free-icons'

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
      transition: { staggerChildren: 0.1, delayChildren: 0.4 }
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
        A personalized AI tutor that bridges the comprehension gap for regional students. 
        Powered by Google Gemini.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", damping: 25, stiffness: 120 }}
        style={styles.card}
        className="glass-strong"
      >
        <Field label="Your Name" icon={UserIcon}>
          <input
            style={styles.input}
            placeholder="e.g. Ravi Kumar"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </Field>

        <Field label="Learning Context" icon={BookOpen01Icon}>
          <textarea
            style={{ ...styles.input, height: 100, resize: 'none' }}
            placeholder="Paste your syllabus, a chapter text, or just a subject (e.g. 10th Physics)..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <p style={styles.hint}>VidyaAI will build a custom roadmap from this.</p>
        </Field>

        <Field label="Gemini API Key" icon={AiMagicIcon}>
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

        <Field label="Preferred Language" icon={TranslationIcon}>
          <div style={styles.langGrid}>
            {LANGUAGES.map(l => (
              <motion.button
                key={l.code}
                whileHover={{ y: -2, background: 'var(--bg-card-hover)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLanguage(l.code)}
                style={{
                  ...styles.langBtn,
                  ...(language === l.code ? styles.langBtnActive : {}),
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800 }}>{l.native}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: language === l.code ? 'var(--teal-bright)' : 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l.label}</span>
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
          whileHover={{ scale: 1.02, y: -2, boxShadow: '0 12px 32px oklch(75% 0.15 170 / 0.3)' }}
          whileTap={{ scale: 0.98 }}
          style={styles.startBtn}
          onClick={handleStart}
        >
          <span>Start Learning</span>
          <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
        </motion.button>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={styles.features}
      >
        {[
          { icon: Idea01Icon, text: 'Adaptive quiz engine' },
          { icon: TranslationIcon, text: 'Regional language AI' },
          { icon: Analytics01Icon, text: 'Knowledge heatmap' },
          { icon: SparklesIcon, text: 'Learning style detection' },
        ].map((f, i) => (
          <motion.div key={i} variants={item} style={styles.featItem}>
            <div style={styles.featIcon}>
               <HugeiconsIcon icon={f.icon} size={16} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{f.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function Field({ label, icon, children }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
        {icon && <HugeiconsIcon icon={icon} size={14} style={{ color: 'var(--purple)' }} />}
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
    padding: '6rem 1rem',
    position: 'relative',
    background: 'var(--bg)',
  },
  glow: {
    position: 'fixed', top: -300, left: '50%', transform: 'translateX(-50%)',
    width: 1200, height: 1000,
    background: 'radial-gradient(ellipse, oklch(65% 0.2 270 / 0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    padding: '10px 24px', borderRadius: 'var(--radius-full)',
    fontSize: 12, color: 'var(--text-secondary)', marginBottom: '3rem',
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  dot: {
    width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)',
    boxShadow: '0 0 12px var(--teal)',
  },
  title: {
    fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 800,
    textAlign: 'center', lineHeight: 1.05, marginBottom: '1.5rem',
    letterSpacing: '-0.04em',
  },
  sub: {
    fontSize: 18, color: 'var(--text-secondary)', textAlign: 'center',
    maxWidth: 580, lineHeight: 1.6, marginBottom: '4rem',
    fontWeight: 500,
  },
  card: {
    borderRadius: 'var(--radius-xl)', padding: '3rem',
    width: '100%', maxWidth: 580,
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-bright)',
  },
  input: {
    width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '14px 18px',
    fontSize: 15, color: 'var(--text-primary)', outline: 'none',
    transition: 'all 0.2s',
  },
  hint: { fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontWeight: 500 },
  langGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 },
  langBtn: {
    background: 'var(--bg-secondary)',
    borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)',
    borderRadius: 'var(--radius-md)', padding: '16px 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  langBtnActive: {
    borderColor: 'var(--teal)', background: 'oklch(75% 0.15 170 / 0.1)',
    color: 'var(--teal-bright)',
    boxShadow: '0 0 0 1px var(--teal)',
  },
  startBtn: {
    width: '100%', padding: '18px', background: 'var(--teal)',
    border: 'none', borderRadius: 'var(--radius-md)',
    fontSize: 16, fontWeight: 800, color: '#fff',
    boxShadow: '0 8px 32px oklch(75% 0.15 170 / 0.2)',
    marginTop: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  error: {
    fontSize: 14, color: 'var(--coral-bright)',
    background: 'var(--coral-muted)', border: '1px solid var(--coral)',
    borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 20,
    fontWeight: 600,
  },
  features: {
    display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center',
    marginTop: '4rem', maxWidth: 800,
  },
  featItem: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  featIcon: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 10,
    background: 'var(--teal-muted)', color: 'var(--teal)',
  },
}
