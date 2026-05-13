import { useState } from 'react'
import { explainTopic, getSuggestedTopics } from '../gemini'

const STYLES = [
  { code: 'examples', label: '📌 Examples', desc: 'Real-world analogies' },
  { code: 'story',    label: '📖 Story',    desc: 'Narrative format' },
  { code: 'steps',    label: '🔢 Steps',    desc: 'Structured breakdown' },
  { code: 'simple',   label: '🧒 Simple',   desc: 'Beginner friendly' },
  { code: 'visual',   label: '🎨 Visual',   desc: 'Descriptive imagery' },
]

const DIFFICULTIES = [
  { val: 1, label: 'Beginner',     color: 'var(--teal)' },
  { val: 2, label: 'Intermediate', color: 'var(--amber)' },
  { val: 3, label: 'Advanced',     color: 'var(--coral)' },
]

export default function LearnTab({ config, onTopicLearned }) {
  const [topic, setTopic]         = useState('')
  const [style, setStyle]         = useState('examples')
  const [difficulty, setDiff]     = useState(1)
  const [content, setContent]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [suggestions, setSugg]    = useState([])
  const [suggLoading, setSuggLoad]= useState(false)
  const [currentTopic, setCurrent]= useState('')

  async function loadSuggestions() {
    if (suggestions.length) return
    setSuggLoad(true)
    try {
      const s = await getSuggestedTopics({ apiKey: config.apiKey, subject: config.subject })
      setSugg(s)
    } catch { setSugg([]) }
    setSuggLoad(false)
  }

  async function handleLearn(topicOverride) {
    const t = topicOverride || topic
    if (!t.trim()) return
    setLoading(true)
    setError('')
    setContent('')
    setCurrent(t)
    try {
      const text = await explainTopic({
        apiKey: config.apiKey,
        topic: t,
        language: config.language,
        style,
        difficulty,
      })
      setContent(text)
      onTopicLearned(t)
    } catch (e) {
      setError(e.message || 'Failed to fetch explanation. Check your API key.')
    }
    setLoading(false)
  }

  return (
    <div style={s.wrap}>
      {/* Search row */}
      <div style={s.searchRow}>
        <input
          style={s.input}
          placeholder={`Enter a topic in ${config.subject}...`}
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLearn()}
          onFocus={loadSuggestions}
        />
        <button
          style={{ ...s.goBtn, opacity: loading ? 0.6 : 1 }}
          onClick={() => handleLearn()}
          disabled={loading}
        >
          {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Explain →'}
        </button>
      </div>

      {/* Suggested topics */}
      {(suggestions.length > 0 || suggLoading) && !content && (
        <div style={s.suggWrap}>
          <p style={s.suggLabel}>Suggested topics for <strong style={{ color: 'var(--purple2)' }}>{config.subject}</strong></p>
          <div style={s.suggGrid}>
            {suggLoading
              ? Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 34, borderRadius: 8 }} />)
              : suggestions.map(s_ => (
                  <button key={s_} style={s.suggChip} onClick={() => { setTopic(s_); handleLearn(s_) }}>
                    {s_}
                  </button>
                ))
            }
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={s.controlsRow}>
        <div style={s.controlGroup}>
          <p style={s.ctrlLabel}>Learning style</p>
          <div style={s.chipRow}>
            {STYLES.map(st => (
              <button
                key={st.code}
                style={{ ...s.chip, ...(style === st.code ? s.chipActive : {}) }}
                onClick={() => setStyle(st.code)}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
        <div style={s.controlGroup}>
          <p style={s.ctrlLabel}>Difficulty</p>
          <div style={s.chipRow}>
            {DIFFICULTIES.map(d => (
              <button
                key={d.val}
                style={{
                  ...s.chip,
                  ...(difficulty === d.val ? { ...s.chipActive, borderColor: d.color, color: d.color, background: `${d.color}18` } : {}),
                }}
                onClick={() => setDiff(d.val)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <div style={s.errorBox}>{error}</div>}

      {/* Content */}
      {loading && (
        <div style={s.contentCard}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[80, 95, 60, 90, 70].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 16, width: `${w}%`, borderRadius: 4 }} />
            ))}
          </div>
        </div>
      )}

      {content && !loading && (
        <div style={s.contentCard} className="fade-in">
          <div style={s.contentHeader}>
            <div>
              <span style={s.topicTag}>{currentTopic}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ ...s.diffBadge, background: DIFFICULTIES[difficulty - 1].color + '20', color: DIFFICULTIES[difficulty - 1].color }}>
                {DIFFICULTIES[difficulty - 1].label}
              </span>
              <span style={s.langBadge}>{config.language}</span>
            </div>
          </div>
          <div style={s.contentBody}>
            {content.split('\n').map((line, i) => {
              if (line.startsWith('💡')) {
                return (
                  <div key={i} style={s.keyInsight}>
                    {line}
                  </div>
                )
              }
              return line ? <p key={i} style={{ marginBottom: 12 }}>{line}</p> : <br key={i} />
            })}
          </div>
          <button
            style={s.reloadBtn}
            onClick={() => handleLearn(currentTopic)}
          >
            ↻ Regenerate with same settings
          </button>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '2rem' },
  searchRow: { display: 'flex', gap: 10, marginBottom: '1.25rem' },
  input: {
    flex: 1, background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r)', padding: '12px 16px', fontSize: 15,
    color: 'var(--text)', outline: 'none',
  },
  goBtn: {
    background: 'var(--purple)', border: 'none', borderRadius: 'var(--r)',
    padding: '12px 22px', color: '#fff', fontSize: 14, fontWeight: 600,
    transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: 6,
  },
  suggWrap: { marginBottom: '1.5rem' },
  suggLabel: { fontSize: 13, color: 'var(--text2)', marginBottom: 10 },
  suggGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 },
  suggChip: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text2)',
    textAlign: 'left', transition: 'all 0.15s',
  },
  controlsRow: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  controlGroup: {},
  ctrlLabel: { fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 },
  chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  chip: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 20, padding: '5px 13px', fontSize: 12, color: 'var(--text2)',
    transition: 'all 0.15s',
  },
  chipActive: {
    background: 'rgba(124,110,247,0.14)', borderColor: 'var(--purple)',
    color: 'var(--purple2)', fontWeight: 600,
  },
  errorBox: {
    background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)',
    borderRadius: 'var(--r)', padding: '12px 16px', fontSize: 14, color: 'var(--coral)',
    marginBottom: '1rem',
  },
  contentCard: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)', padding: '1.75rem',
  },
  contentHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap', gap: 8,
  },
  topicTag: {
    fontSize: 14, fontWeight: 700, color: 'var(--text)',
  },
  diffBadge: {
    fontSize: 11, fontWeight: 600, padding: '3px 10px',
    borderRadius: 20, textTransform: 'capitalize',
  },
  langBadge: {
    fontSize: 11, fontWeight: 600, padding: '3px 10px',
    borderRadius: 20, background: 'var(--bg3)', color: 'var(--text2)',
    textTransform: 'capitalize',
  },
  contentBody: {
    fontSize: 15, lineHeight: 1.85, color: 'var(--text)',
  },
  keyInsight: {
    background: 'rgba(124,110,247,0.1)', border: '1px solid rgba(124,110,247,0.25)',
    borderRadius: 8, padding: '12px 16px', fontSize: 14,
    color: 'var(--purple2)', marginTop: 12, fontWeight: 500,
  },
  reloadBtn: {
    marginTop: '1.25rem', background: 'transparent', border: '1px solid var(--border)',
    borderRadius: 8, padding: '7px 14px', fontSize: 12, color: 'var(--text2)',
    transition: 'all 0.15s',
  },
}
