import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { translateAndSimplify } from '../gemini'

const LANGUAGES = [
  { code: 'telugu',  label: 'Telugu',  native: 'తెలుగు' },
  { code: 'hindi',   label: 'Hindi',   native: 'हिंदी' },
  { code: 'tamil',   label: 'Tamil',   native: 'தமிழ்' },
  { code: 'english', label: 'English', native: 'English' },
]

const SAMPLE_TEXTS = [
  "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.",
  "Newton's second law of motion states that the acceleration of an object is directly proportional to the net force acting on it.",
  "The mitochondria is the powerhouse of the cell, responsible for generating ATP through cellular respiration.",
]

export default function TranslateTab({ config }) {
  const [input, setInput]     = useState('')
  const [output, setOutput]   = useState('')
  const [targetLang, setLang] = useState(config.language === 'english' ? 'telugu' : config.language)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [copiedDone, setCopied] = useState(false)

  async function handleTranslate() {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setOutput('')
    try {
      const result = await translateAndSimplify({
        apiKey: config.apiKey,
        text: input,
        targetLanguage: targetLang,
      })
      setOutput(result)
    } catch (e) {
      setError(e.message || 'Translation failed.')
    }
    setLoading(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div style={s.wrap}>
      <div style={s.headerRow}>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h2 style={s.heading} className="text-gradient">Translate & Simplify</h2>
          <p style={s.subtext}>Paste any educational text — get it in your language, simplified.</p>
        </motion.div>
      </div>

      <div style={s.langRow}>
        <span style={s.langFromLabel}>English / Any</span>
        <span style={s.arrow}>→</span>
        <div style={s.langBtnGroup}>
          {LANGUAGES.map(l => (
            <motion.button
              key={l.code}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{ ...s.langBtn, ...(targetLang === l.code ? s.langBtnActive : {}) }}
              onClick={() => setLang(l.code)}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>{l.native}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div style={s.samplesRow}>
        <span style={s.sampleLabel}>SAMPLES:</span>
        {SAMPLE_TEXTS.map((t, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05, borderColor: 'var(--purple)' }}
            style={s.sampleBtn}
            onClick={() => setInput(t)}
          >
            Sample {i + 1}
          </motion.button>
        ))}
      </div>

      <div style={s.ioLayout}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={s.panel}>
          <div style={s.panelHeader}>
            <span>Input</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{input.length} CHARS</span>
          </div>
          <textarea
            style={s.textarea}
            placeholder="Paste educational content here \u2014 a textbook paragraph, lecture notes, definition..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </motion.div>

        <div style={s.middleCol}>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: 'var(--shadow-glow)' }}
            whileTap={{ scale: 0.95 }}
            style={{ ...s.translateBtn, opacity: loading || !input.trim() ? 0.55 : 1 }}
            onClick={handleTranslate}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
            ) : (
              <span style={{ lineHeight: 1.5, textAlign: 'center' }}>Translate<br />& Simplify</span>
            )}
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={s.panel} className="card-shine">
          <div style={s.panelHeader}>
            <span style={{ color: 'var(--teal)', fontWeight: 800 }}>
              {LANGUAGES.find(l => l.code === targetLang)?.native}
            </span>
            <AnimatePresence>
              {output && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={s.copyBtn}
                  onClick={handleCopy}
                >
                  {copiedDone ? 'Copied' : 'Copy'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  {[90, 75, 85, 60, 80].map((w, i) => (
                    <div key={i} className="skeleton" style={{ height: 18, width: `${w}%`, borderRadius: 4 }} />
                  ))}
                </motion.div>
              ) : output ? (
                <motion.div
                  key="output"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={s.outputText}
                >
                  {output}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={s.outputPlaceholder}
                >
                  Simplified translation will appear here
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={s.infoCard}
      >
        <p style={s.infoTitle}>Why this matters</p>
        <p style={s.infoText}>
          Over 60% of Indian students learn in a language different from their mother tongue.
          VidyaAI bridges this gap by making any educational content accessible in Telugu, Hindi, and Tamil —
          not just translated, but simplified for rural and first-generation learners.
        </p>
      </motion.div>
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '2rem' },
  headerRow: { marginBottom: '2rem' },
  heading: { fontSize: 24, fontWeight: 800, marginBottom: 6 },
  subtext: { fontSize: 15, color: 'var(--text-secondary)' },
  langRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem', flexWrap: 'wrap' },
  langFromLabel: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '10px 18px', fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600,
  },
  arrow: { fontSize: 20, color: 'var(--text-muted)' },
  langBtnGroup: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  langBtn: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '10px 18px', cursor: 'pointer', transition: 'all 0.2s',
    fontSize: 14, color: 'var(--text-secondary)',
  },
  langBtnActive: {
    borderColor: 'var(--teal)', background: 'var(--teal-muted)',
    color: 'var(--teal)', fontWeight: 700,
  },
  samplesRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' },
  sampleLabel: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em' },
  sampleBtn: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '6px 14px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600,
  },
  ioLayout: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, marginBottom: '2rem', alignItems: 'stretch' },
  panel: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', minHeight: 280,
    boxShadow: 'var(--shadow-md)',
  },
  panelHeader: {
    padding: '12px 20px', borderBottom: '1px solid var(--border)',
    fontSize: 11, fontWeight: 800, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(255,255,255,0.02)',
  },
  textarea: {
    flex: 1, background: 'transparent', border: 'none',
    padding: '1.25rem', fontSize: 15, color: 'var(--text-primary)',
    resize: 'none', outline: 'none', lineHeight: 1.7, minHeight: 200,
  },
  middleCol: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  translateBtn: {
    background: 'var(--purple)', border: 'none', borderRadius: 'var(--radius-md)',
    padding: '16px', color: '#fff', fontSize: 14, fontWeight: 700,
    lineHeight: 1.5, textAlign: 'center', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 100, minHeight: 100, boxShadow: 'var(--shadow-md)',
  },
  outputText: {
    flex: 1, padding: '1.25rem', fontSize: 16, color: 'var(--text-primary)',
    lineHeight: 1.8, whiteSpace: 'pre-wrap',
  },
  outputPlaceholder: {
    flex: 1, padding: '1.25rem', fontSize: 14, color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontStyle: 'italic',
  },
  copyBtn: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '4px 12px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600,
  },
  errorBox: {
    background: 'var(--coral-muted)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 'var(--radius-md)', padding: '14px 20px', fontSize: 14, color: 'var(--coral)',
    marginBottom: '1rem',
  },
  infoCard: {
    background: 'var(--purple-muted)', border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-md)', padding: '1.5rem 2rem',
  },
  infoTitle: { fontSize: 15, fontWeight: 800, color: 'var(--purple-bright)', marginBottom: 8 },
  infoText: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75 },
}
