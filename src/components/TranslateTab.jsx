import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  TranslationIcon, 
  ArrowRight02Icon, 
  ZapIcon, 
  Copy01Icon, 
  Tick01Icon,
  HelpCircleIcon,
  RefreshIcon
} from '@hugeicons/core-free-icons'
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
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
          <h2 style={s.heading} className="text-gradient">Translate & Simplify</h2>
          <p style={s.subtext}>Paste any educational text to receive a simplified explanation in your preferred language.</p>
        </motion.div>
      </div>

      <div style={s.langRow}>
        <div style={s.langFromBadge}>
           <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SOURCE</span>
           <span style={{ fontWeight: 700 }}>Any Language</span>
        </div>
        <div style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
           <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
        </div>
        <div style={s.langBtnGroup}>
          {LANGUAGES.map(l => (
            <motion.button
              key={l.code}
              whileHover={{ y: -2, background: 'var(--bg-card-hover)' }}
              whileTap={{ scale: 0.97 }}
              style={{ ...s.langBtn, ...(targetLang === l.code ? s.langBtnActive : {}) }}
              onClick={() => setLang(l.code)}
            >
              <span style={{ fontSize: 14, fontWeight: 700 }}>{l.native}</span>
              <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.6, textTransform: 'uppercase' }}>{l.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div style={s.samplesRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
           <HugeiconsIcon icon={ZapIcon} size={14} />
           <span style={s.sampleLabel}>QUICK SAMPLES:</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SAMPLE_TEXTS.map((t, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05, borderColor: 'var(--teal)', background: 'var(--teal-muted)' }}
              style={s.sampleBtn}
              onClick={() => setInput(t)}
            >
              Sample {i + 1}
            </motion.button>
          ))}
        </div>
      </div>

      <div style={s.ioLayout}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={s.panel}>
          <div style={s.panelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <HugeiconsIcon icon={TranslationIcon} size={14} style={{ color: 'var(--purple)' }} />
               <span>Input Stream</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{input.length} CHARS</span>
          </div>
          <textarea
            style={s.textarea}
            placeholder="Paste educational content here: textbook paragraphs, lecture notes, or complex definitions..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </motion.div>

        <div style={s.middleCol}>
          <motion.button
            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 8px 32px oklch(75% 0.15 170 / 0.25)' }}
            whileTap={{ scale: 0.95 }}
            style={{ ...s.translateBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}
            onClick={handleTranslate}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <HugeiconsIcon icon={RefreshIcon} size={24} />
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Process</span>
              </div>
            )}
          </motion.button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={s.panel} className="card-shine">
          <div style={s.panelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)' }} />
               <span style={{ color: 'var(--teal)', fontWeight: 800 }}>
                 {LANGUAGES.find(l => l.code === targetLang)?.native} Output
               </span>
            </div>
            <AnimatePresence>
              {output && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={s.copyBtn}
                  onClick={handleCopy}
                >
                  <HugeiconsIcon icon={copiedDone ? Tick01Icon : Copy01Icon} size={14} />
                  <span>{copiedDone ? 'Copied' : 'Copy Result'}</span>
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
                  style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  {[90, 75, 85, 60, 80, 70, 95].map((w, i) => (
                    <div key={i} className="skeleton" style={{ height: 20, width: `${w}%`, borderRadius: 6 }} />
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
                  <HugeiconsIcon icon={TranslationIcon} size={32} style={{ opacity: 0.2, marginBottom: 16 }} />
                  <span>Simplified intelligence will appear here</span>
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
        transition={{ delay: 0.4 }}
        style={s.infoCard}
        className="glass"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
           <HugeiconsIcon icon={HelpCircleIcon} size={20} style={{ color: 'var(--teal)' }} />
           <p style={s.infoTitle}>Strategic Objective</p>
        </div>
        <p style={s.infoText}>
          Over 60% of regional Indian students struggle with English-medium curricula. 
          VidyaAI democratizes access by providing instant, high-fidelity simplification in native languages, 
          ensuring first-generation learners are never blocked by language barriers.
        </p>
      </motion.div>
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '3rem' },
  headerRow: { marginBottom: '2.5rem' },
  heading: { fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' },
  subtext: { fontSize: 17, color: 'var(--text-secondary)', fontWeight: 500 },
  langRow: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: '2rem', flexWrap: 'wrap' },
  langFromBadge: {
    display: 'flex', flexDirection: 'column', gap: 4,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '10px 20px', fontSize: 15, color: 'var(--text-primary)',
  },
  langBtnGroup: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  langBtn: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '8px 16px', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    color: 'var(--text-secondary)',
  },
  langBtnActive: {
    borderColor: 'var(--teal)', background: 'oklch(75% 0.15 170 / 0.1)',
    color: 'var(--teal-bright)', boxShadow: '0 0 0 1px var(--teal)',
  },
  samplesRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2rem', flexWrap: 'wrap' },
  sampleLabel: { fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' },
  sampleBtn: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '8px 16px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600,
    transition: 'all 0.2s',
  },
  ioLayout: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, marginBottom: '3rem', alignItems: 'stretch' },
  panel: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', minHeight: 320,
    boxShadow: 'var(--shadow-md)',
  },
  panelHeader: {
    padding: '16px 24px', borderBottom: '1px solid var(--border)',
    fontSize: 11, fontWeight: 800, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.12em',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'oklch(100% 0 0 / 0.02)',
  },
  textarea: {
    flex: 1, background: 'transparent', border: 'none',
    padding: '1.5rem', fontSize: 16, color: 'var(--text-primary)',
    resize: 'none', outline: 'none', lineHeight: 1.7, minHeight: 240,
    fontFamily: 'inherit',
  },
  middleCol: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  translateBtn: {
    background: 'var(--teal)', border: 'none', borderRadius: 'var(--radius-lg)',
    padding: '20px', color: '#fff', fontSize: 14, fontWeight: 800,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 100, height: 100, boxShadow: '0 12px 32px oklch(75% 0.15 170 / 0.2)',
  },
  outputText: {
    flex: 1, padding: '1.75rem', fontSize: 17, color: 'var(--text-primary)',
    lineHeight: 1.8, whiteSpace: 'pre-wrap',
  },
  outputPlaceholder: {
    flex: 1, padding: '1.75rem', fontSize: 15, color: 'var(--text-muted)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontWeight: 500, opacity: 0.8,
  },
  copyBtn: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '6px 14px', fontSize: 12, color: 'var(--text-primary)', fontWeight: 700,
    display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
  },
  errorBox: {
    background: 'var(--coral-muted)', border: '1px solid var(--coral)',
    borderRadius: 'var(--radius-md)', padding: '16px 24px', fontSize: 14, color: 'var(--coral-bright)',
    marginBottom: '1.5rem', fontWeight: 600,
  },
  infoCard: {
    background: 'oklch(20% 0.04 var(--brand-hue) / 0.4)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '2rem 2.5rem',
  },
  infoTitle: { fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' },
  infoText: { fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 4, fontWeight: 500 },
}
