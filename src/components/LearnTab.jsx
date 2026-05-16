import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  ArrowLeft02Icon, 
  Search01Icon, 
  ZapIcon, 
  BookOpen01Icon,
  SparklesIcon,
  CircleIcon,
  RefreshIcon
} from '@hugeicons/core-free-icons'
import { explainTopic, getSuggestedTopics } from '../gemini'

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
  const [searchTopic, setSearchTopic] = useState('')
  const [chips, setChips] = useState([])
  const [chipsLoading, setChipsLoading] = useState(false)

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

  async function loadChips() {
    if (chips.length > 0) return
    setChipsLoading(true)
    try {
      const topics = await getSuggestedTopics({ apiKey: config.apiKey, subject: config.subject })
      setChips(topics)
    } catch { setChips([]) }
    setChipsLoading(false)
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div style={s.roadmapHeader}>
              <h2 style={s.roadmapTitle} className="text-gradient">Your Learning Roadmap</h2>
              <p style={s.roadmapOverview}>{roadmap?.overview}</p>
            </div>

            <div style={s.searchWrap}>
              <div style={{ position: 'relative' }}>
                <Search01Icon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  style={s.searchInput}
                  placeholder={`Deep dive into any topic...`}
                  value={searchTopic}
                  onChange={e => setSearchTopic(e.target.value)}
                  onFocus={loadChips}
                  onKeyDown={e => { if (e.key === 'Enter' && searchTopic.trim()) handleLearn(searchTopic) }}
                />
              </div>
              {chipsLoading && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, marginLeft: 4 }}>Gathering recommendations...</p>}
              {chips.length > 0 && (
                <div style={s.chipRow}>
                  {chips.map(chip => (
                    <button key={chip} style={s.topicChip} onClick={() => handleLearn(chip)}>
                      {chip}
                    </button>
                  ))}
                </div>
              )}
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
                    whileHover={{ y: -6, borderColor: 'var(--teal)', background: 'var(--bg-card-hover)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{ ...s.nodeCard, borderColor: status ? statusColor : 'var(--border)' }}
                    onClick={() => { setTopic(node.label); handleLearn(node.label) }}
                    className="card-shine"
                  >
                    <div style={{ ...s.nodeNum, color: status ? statusColor : 'var(--teal)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div style={s.controlsRow}>
              <div style={s.controlGroup}>
                <p style={s.ctrlLabel}>Learning Style</p>
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
                <p style={s.ctrlLabel}>Complexity</p>
                <div style={s.chipRow}>
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.val}
                      style={{
                        ...s.chip,
                        ...(difficulty === d.val ? { ...s.chipActive, borderColor: d.color, color: d.color, background: `${d.color}15` } : {}),
                      }}
                      onClick={() => setDiff(d.val)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <button style={s.backBtn} onClick={() => setContent('')}>
                <ArrowLeft02Icon size={16} />
                Back to Roadmap
              </button>
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            {loading ? (
              <div style={s.contentCard}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[90, 95, 70, 92, 80, 85, 60, 88].map((w, i) => (
                    <div key={i} className="skeleton" style={{ height: 20, width: `${w}%`, borderRadius: 6 }} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={s.contentCard}>
                <div style={s.contentHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 10, background: 'var(--teal-muted)', borderRadius: 10, color: 'var(--teal)' }}>
                      <BookOpen01Icon size={20} />
                    </div>
                    <h3 style={s.topicTag}>{currentTopic}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ ...s.badge, background: DIFFICULTIES[difficulty - 1].color + '15', color: DIFFICULTIES[difficulty - 1].color }}>
                      {DIFFICULTIES[difficulty - 1].label}
                    </span>
                    <span style={{ ...s.badge, background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                      {config.language}
                    </span>
                  </div>
                </div>
                <div style={s.contentBody}>
                  {content.split('\n').map((line, i) => {
                    if (line.startsWith('KEY INSIGHT:') || line.startsWith('💡')) {
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={i}
                          style={s.keyInsight}
                        >
                          <SparklesIcon size={20} style={{ flexShrink: 0 }} />
                          <div>{line.replace('💡', '').replace('KEY INSIGHT:', '').trim()}</div>
                        </motion.div>
                      )
                    }
                    return line ? <p key={i} style={{ marginBottom: 20 }}>{line}</p> : <br key={i} />
                  })}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                  <motion.button
                    whileHover={{ scale: 1.04, borderColor: 'var(--teal)' }}
                    whileTap={{ scale: 0.96 }}
                    style={s.reloadBtn}
                    onClick={() => handleLearn(currentTopic)}
                  >
                    <HugeiconsIcon icon={RefreshIcon} size={16} />
                    <span>Regenerate Explanation</span>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '3rem' },
  roadmapHeader: { marginBottom: '3rem' },
  roadmapTitle: { fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' },
  roadmapOverview: { fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 750 },
  roadmapGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: '3rem' },
  nodeCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '2rem',
    display: 'flex', gap: 20, alignItems: 'flex-start',
    textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
    position: 'relative', overflow: 'hidden',
  },
  nodeNum: {
    width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-elevated)',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 13, fontWeight: 800,
    fontFamily: 'var(--font-mono)', flexShrink: 0,
  },
  nodeContent: { flex: 1 },
  nodeLabel: { fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.01em' },
  nodeDesc: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 },
  statusBadge: {
    position: 'absolute', top: 0, right: 0, padding: '4px 12px',
    fontSize: 9, fontWeight: 900, color: 'oklch(0% 0 0)',
    borderBottomLeftRadius: 12, letterSpacing: '0.05em',
  },
  controlsRow: { display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'flex-end' },
  controlGroup: {},
  ctrlLabel: { fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 },
  chipRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)', padding: '8px 18px', fontSize: 14, color: 'var(--text-secondary)',
    transition: 'all 0.2s', fontWeight: 600,
  },
  chipActive: {
    background: 'var(--teal-muted)', borderColor: 'var(--teal)',
    color: 'var(--teal-bright)',
  },
  backBtn: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '10px 20px', fontSize: 13, color: 'var(--text-primary)',
    marginLeft: 'auto', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
    transition: 'all 0.2s',
  },
  errorBox: {
    background: 'var(--coral-muted)', border: '1px solid var(--coral)',
    borderRadius: 'var(--radius-md)', padding: '16px 24px', fontSize: 14, color: 'var(--coral-bright)',
    marginBottom: '2rem', fontWeight: 600,
  },
  contentCard: {
    borderRadius: 'var(--radius-xl)', padding: '3.5rem',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-lg)',
  },
  contentHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '2rem', paddingBottom: '1.75rem', borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap', gap: 16,
  },
  topicTag: {
    fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em',
  },
  badge: {
    fontSize: 12, fontWeight: 700, padding: '6px 16px',
    borderRadius: 'var(--radius-full)', textTransform: 'capitalize',
    fontFamily: 'var(--font-mono)',
  },
  contentBody: {
    fontSize: 17, lineHeight: 1.8, color: 'var(--text-primary)',
  },
  keyInsight: {
    background: 'oklch(75% 0.15 170 / 0.1)', border: '1px solid oklch(75% 0.15 170 / 0.2)',
    borderRadius: 'var(--radius-lg)', padding: '24px 32px', fontSize: 16,
    color: 'var(--teal-bright)', marginTop: 32, fontWeight: 700,
    boxShadow: 'var(--shadow-glow)', display: 'flex', gap: 16, alignItems: 'flex-start',
    lineHeight: 1.6,
  },
  reloadBtn: {
    background: 'transparent', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '12px 24px', fontSize: 14, color: 'var(--text-secondary)',
    transition: 'all 0.2s', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10,
  },
  searchWrap: {
    marginBottom: '2.5rem',
  },
  searchInput: {
    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '16px 20px 16px 50px',
    fontSize: 16, color: 'var(--text-primary)', outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
    fontWeight: 500,
  },
  topicChip: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)', padding: '8px 18px',
    fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600,
    transition: 'all 0.2s',
  },
}
