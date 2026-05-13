import { useState } from 'react'
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
        <div>
          <h2 style={s.heading}>Translate & Simplify</h2>
          <p style={s.subtext}>Paste any educational text — get it in your language, simplified.</p>
        </div>
      </div>

      {/* Language selector */}
      <div style={s.langRow}>
        <span style={s.langFromLabel}>English / Any language</span>
        <span style={s.arrow}>→</span>
        <div style={s.langBtnGroup}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              style={{ ...s.langBtn, ...(targetLang === l.code ? s.langBtnActive : {}) }}
              onClick={() => setLang(l.code)}
            >
              <span style={{ fontSize: 14 }}>{l.native}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sample texts */}
      <div style={s.samplesRow}>
        <span style={s.sampleLabel}>Try a sample:</span>
        {SAMPLE_TEXTS.map((t, i) => (
          <button key={i} style={s.sampleBtn} onClick={() => setInput(t)}>
            Sample {i + 1}
          </button>
        ))}
      </div>

      {/* Input / Output layout */}
      <div style={s.ioLayout}>
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <span>Input text</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{input.length} chars</span>
          </div>
          <textarea
            style={s.textarea}
            placeholder="Paste educational content here — a textbook paragraph, lecture notes, definition..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>

        <div style={s.middleCol}>
          <button
            style={{ ...s.translateBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}
            onClick={handleTranslate}
            disabled={loading || !input.trim()}
          >
            {loading
              ? <span className="spinner" style={{ width: 18, height: 18 }} />
              : <>Translate<br />& Simplify<br />→</>
            }
          </button>
        </div>

        <div style={s.panel}>
          <div style={s.panelHeader}>
            <span style={{ color: 'var(--teal)', fontWeight: 600 }}>
              {LANGUAGES.find(l => l.code === targetLang)?.native}
            </span>
            {output && (
              <button style={s.copyBtn} onClick={handleCopy}>
                {copiedDone ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>
          {loading
            ? (
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[90, 75, 85, 60, 80].map((w, i) => (
                  <div key={i} className="skeleton" style={{ height: 16, width: `${w}%`, borderRadius: 4 }} />
                ))}
              </div>
            )
            : output
              ? <div style={s.outputText} className="fade-in">{output}</div>
              : <div style={s.outputPlaceholder}>Translation will appear here</div>
          }
        </div>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {/* Info card */}
      <div style={s.infoCard}>
        <p style={s.infoTitle}>Why this matters</p>
        <p style={s.infoText}>
          Over 60% of Indian students learn in a language different from their mother tongue.
          VidyaAI bridges this gap by making any educational content accessible in Telugu, Hindi, and Tamil —
          not just translated, but simplified for rural and first-generation learners.
        </p>
      </div>
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '2rem' },
  headerRow: { marginBottom: '1.5rem' },
  heading: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  subtext: { fontSize: 14, color: 'var(--text2)' },
  langRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1rem', flexWrap: 'wrap' },
  langFromLabel: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 14px', fontSize: 13, color: 'var(--text2)',
  },
  arrow: { fontSize: 18, color: 'var(--text3)' },
  langBtnGroup: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  langBtn: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '7px 14px', cursor: 'pointer', transition: 'all 0.15s',
    fontSize: 13, color: 'var(--text2)',
  },
  langBtnActive: {
    border: '1px solid var(--teal)', background: 'rgba(45,212,160,0.1)',
    color: 'var(--teal)', fontWeight: 600,
  },
  samplesRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' },
  sampleLabel: { fontSize: 12, color: 'var(--text3)' },
  sampleBtn: {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, padding: '4px 12px', fontSize: 12, color: 'var(--text2)',
  },
  ioLayout: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, marginBottom: '1.25rem', alignItems: 'stretch' },
  panel: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', minHeight: 240,
  },
  panelHeader: {
    padding: '10px 16px', borderBottom: '1px solid var(--border)',
    fontSize: 12, fontWeight: 600, color: 'var(--text2)',
    textTransform: 'uppercase', letterSpacing: '0.07em',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  textarea: {
    flex: 1, background: 'transparent', border: 'none',
    padding: '1rem', fontSize: 14, color: 'var(--text)',
    resize: 'none', outline: 'none', lineHeight: 1.7, minHeight: 180,
  },
  middleCol: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  translateBtn: {
    background: 'var(--purple)', border: 'none', borderRadius: 'var(--r)',
    padding: '14px 16px', color: '#fff', fontSize: 13, fontWeight: 600,
    lineHeight: 1.6, textAlign: 'center', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 80, minHeight: 90,
  },
  outputText: {
    flex: 1, padding: '1rem', fontSize: 15, color: 'var(--text)',
    lineHeight: 1.8, whiteSpace: 'pre-wrap',
  },
  outputPlaceholder: {
    flex: 1, padding: '1rem', fontSize: 14, color: 'var(--text3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontStyle: 'italic',
  },
  copyBtn: {
    background: 'transparent', border: '1px solid var(--border)',
    borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'var(--text2)', cursor: 'pointer',
  },
  errorBox: {
    background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)',
    borderRadius: 'var(--r)', padding: '12px 16px', fontSize: 14, color: 'var(--coral)',
    marginBottom: '1rem',
  },
  infoCard: {
    background: 'rgba(124,110,247,0.07)', border: '1px solid rgba(124,110,247,0.2)',
    borderRadius: 'var(--r)', padding: '1.25rem',
  },
  infoTitle: { fontSize: 13, fontWeight: 600, color: 'var(--purple2)', marginBottom: 6 },
  infoText: { fontSize: 13, color: 'var(--text2)', lineHeight: 1.75 },
}
