import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { explainTopic } from '../gemini'

const STYLES = [
  { code: 'examples', label: 'Examples',   desc: 'Real-world analogies' },
  { code: 'story',    label: 'Story',      desc: 'Narrative format' },
  { code: 'steps',    label: 'Steps',      desc: 'Structured breakdown' },
  { code: 'simple',   label: 'Simple',     desc: 'Beginner friendly' },
  { code: 'visual',   label: 'Visual',     desc: 'Descriptive imagery' },
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div style={s.wrap}>
      <AnimatePresence mode="wait">
        {!content ? (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25 }}
          >
            <div style={s.roadmapHeader}>
              <h2 style={s.roadmapTitle} className="text-gradient">Your Learning Roadmap</h2>
              <p style={s.roadmapOverview}>{roadmap?.overview}</p>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              style={s.roadmapGrid}
            >
              {roadmap?.nodes.map((node, i) => {
                const status = nodeStatuses[node.label]
                const statusColor = status === 'strong' ? 'var(--teal)' : status === 'medium' ? 'var(--amber)' : status === 'weak' ? 'var(--coral)' : 'var(--border)'
                return (
                  <motion.button
                    key={node.id}
                    variants={item}
                    whileHover={{ y: -4, borderColor: 'var(--teal)', backgroundColor: 'var(--bg-card-hover)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{ ...s.nodeCard, borderColor: status ? statusColor : 'var(--border)' }}
                    onClick={() => { setTopic(node.label); handleLearn(node.label) }}
                    className="card-shine"
                  >
                    <div style={s.nodeNum}>{i + 1}</div>
                    <div style={s.nodeContent}>
                      <div style={s.nodeLabel}>{node.label}</div>
                      <div style={s.nodeDesc}>{node.description}</div>
                    </div>
                    {status && (
                      <div style={{ ...s.statusBadge, background: statusColor }}>
                        {status === 'strong' ? 'READY' : status === 'medium' ? 'FAIR' : 'WEAK'}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div style={s.controlsRow}>
              <div style={s.controlGroup}>
                <p style={s.ctrlLabel}>Style</p>
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
                <p style={s.ctrlLabel}>Level</p>
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
              <button style={s.backBtn} onClick={() => setContent('')}>
                Back to Roadmap
              </button>
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            {loading ? (
              <div style={s.contentCard}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[90, 95, 70, 92, 80, 85, 60].map((w, i) => (
                    <div key={i} className="skeleton" style={{ height: 18, width: `${w}%`, borderRadius: 4 }} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={s.contentCard}>
                <div style={s.contentHeader}>
                  <h3 style={s.topicTag}>{currentTopic}</h3>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ ...s.badge, background: DIFFICULTIES[difficulty - 1].color + '18', color: DIFFICULTIES[difficulty - 1].color }}>
                      {DIFFICULTIES[difficulty - 1].label}
                    </span>
                    <span style={{ ...s.badge, background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                      {config.language}
                    </span>
                  </div>
                </div>
                <div style={s.contentBody}>
                  {content.split('\n').map((line, i) => {
                    if (line.startsWith('💡')) {
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={i}
                          style={s.keyInsight}
                        >
                          {line}
                        </motion.div>
                      )
                    }
                    return line ? <p key={i} style={{ marginBottom: 16 }}>{line}</p> : <br key={i} />
                  })}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, borderColor: 'var(--teal)' }}
                  whileTap={{ scale: 0.98 }}
                  style={s.reloadBtn}
                  onClick={() => handleLearn(currentTopic)}
                >
                  Regenerate
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '2rem' },
  roadmapHeader: { marginBottom: '2.5rem' },
  roadmapTitle: { fontSize: 28, fontWeight: 800, marginBottom: 12 },
  roadmapOverview: { fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 700 },
  roadmapGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: '2.5rem' },
  nodeCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '1.5rem',
    display: 'flex', gap: 16, alignItems: 'flex-start',
    textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease',
    position: 'relative', overflow: 'hidden',
  },
  nodeNum: {
    width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-elevated)',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--teal-bright)',
    flexShrink: 0,
  },
  nodeContent: { flex: 1 },
  nodeLabel: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 },
  nodeDesc: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 },
  statusBadge: {
    position: 'absolute', top: 0, right: 0, padding: '3px 10px',
    fontSize: 9, fontWeight: 900, color: '#000',
    borderBottomLeftRadius: 10,
  },
  controlsRow: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' },
  controlGroup: {},
  ctrlLabel: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 },
  chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  chip: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)', padding: '6px 16px', fontSize: 13, color: 'var(--text-secondary)',
    transition: 'all 0.2s', fontWeight: 500,
  },
  chipActive: {
    background: 'var(--teal-muted)', borderColor: 'var(--teal)',
    color: 'var(--teal-bright)', fontWeight: 600,
  },
  backBtn: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '8px 16px', fontSize: 13, color: 'var(--text-secondary)',
    marginLeft: 'auto', fontWeight: 600,
  },
  errorBox: {
    background: 'var(--coral-muted)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 'var(--radius-md)', padding: '14px 20px', fontSize: 14, color: 'var(--coral)',
    marginBottom: '1.5rem',
  },
  contentCard: {
    borderRadius: 'var(--radius-xl)', padding: '2.5rem',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
  },
  contentHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap', gap: 12,
  },
  topicTag: {
    fontSize: 20, fontWeight: 800, color: 'var(--text-primary)',
  },
  badge: {
    fontSize: 11, fontWeight: 700, padding: '4px 12px',
    borderRadius: 'var(--radius-full)', textTransform: 'capitalize',
  },
  contentBody: {
    fontSize: 16, lineHeight: 1.85, color: 'var(--text-primary)',
  },
  keyInsight: {
    background: 'var(--teal-muted)', border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-md)', padding: '16px 24px', fontSize: 15,
    color: 'var(--teal-bright)', marginTop: 20, fontWeight: 600,
    boxShadow: 'var(--shadow-glow)',
  },
  reloadBtn: {
    marginTop: '2rem', background: 'transparent', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '10px 20px', fontSize: 13, color: 'var(--text-secondary)',
    transition: 'all 0.2s', fontWeight: 600,
  },
}
