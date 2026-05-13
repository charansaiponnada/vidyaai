import { useState, useMemo } from 'react'
import { explainTopic } from '../gemini'

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

export default function LearnTab({ config, roadmap, quizHistory, onTopicLearned }) {
  const [topic, setTopic]         = useState('')
  const [style, setStyle]         = useState('examples')
  const [difficulty, setDiff]     = useState(1)
  const [content, setContent]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [currentTopic, setCurrent]= useState('')

  // Calculate node statuses from quiz history
  const nodeStatuses = useMemo(() => {
    const stats = {}
    quizHistory?.forEach(h => {
      if (!stats[h.topic]) stats[h.topic] = { correct: 0, total: 0 }
      stats[h.topic].total++
      if (h.correct) stats[h.topic].correct++
    })
    
    const statuses = {}
    Object.entries(stats).forEach(([t, s]) => {
      const acc = (s.correct / s.total) * 100
      if (acc >= 75) statuses[t] = 'strong'
      else if (acc >= 45) statuses[t] = 'medium'
      else statuses[t] = 'weak'
    })
    return statuses
  }, [quizHistory])

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
      {/* Roadmap Section */}
      {!content && (
        <div className="fade-up">
          <div style={s.roadmapHeader}>
            <h2 style={s.roadmapTitle}>Your Learning Roadmap</h2>
            <p style={s.roadmapOverview}>{roadmap?.overview}</p>
          </div>
          
          <div style={s.roadmapGrid}>
            {roadmap?.nodes.map((node, i) => {
              const status = nodeStatuses[node.label]
              const statusColor = status === 'strong' ? 'var(--teal)' : status === 'medium' ? 'var(--amber)' : status === 'weak' ? 'var(--coral)' : 'var(--border)'
              return (
                <button 
                  key={node.id} 
                  style={{ ...s.nodeCard, borderColor: status ? statusColor : 'var(--border)' }}
                  onClick={() => { setTopic(node.label); handleLearn(node.label) }}
                >
                  <div style={s.nodeNum}>{i + 1}</div>
                  <div style={s.nodeContent}>
                    <div style={s.nodeLabel}>{node.label}</div>
                    <div style={s.nodeDesc}>{node.description}</div>
                  </div>
                  {status && (
                    <div style={{ ...s.statusBadge, background: statusColor }}>
                      {status.toUpperCase()}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Controls - only show when content is visible or to override */}
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
        {content && (
          <button style={s.backBtn} onClick={() => setContent('')}>
            ← Back to Roadmap
          </button>
        )}
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
  roadmapHeader: { marginBottom: '2rem' },
  roadmapTitle: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  roadmapOverview: { fontSize: 16, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 650 },
  roadmapGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: '2.5rem' },
  nodeCard: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)', padding: '1.25rem',
    display: 'flex', gap: 16, alignItems: 'flex-start',
    textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
    position: 'relative', overflow: 'hidden',
  },
  nodeNum: {
    width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--purple2)',
    flexShrink: 0,
  },
  nodeContent: { flex: 1 },
  nodeLabel: { fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 },
  nodeDesc: { fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 },
  statusBadge: {
    position: 'absolute', top: 0, right: 0, padding: '2px 8px',
    fontSize: 9, fontWeight: 800, color: '#000',
    borderBottomLeftRadius: 8,
  },
  controlsRow: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' },
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
  backBtn: {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--text2)',
    marginLeft: 'auto',
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
