import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  ZapIcon, 
  AnalyticsUpIcon, 
  RefreshIcon, 
  SparklesIcon, 
  Analytics01Icon,
  Tick01Icon,
  BookOpen01Icon,
  Target02Icon,
  Idea01Icon
} from '@hugeicons/core-free-icons'
import { detectLearningInsight } from '../gemini'

export default function InsightsTab({ config, quizHistory, learnedTopics }) {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const total   = quizHistory.length
  const correct = quizHistory.filter(h => h.correct).length
  const acc     = total > 0 ? Math.round((correct / total) * 100) : 0

  const topicPerf = useMemo(() => {
    const topicMap = {}
    quizHistory.forEach(({ topic, correct: c }) => {
      if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 }
      topicMap[topic].total++
      if (c) topicMap[topic].correct++
    })
    return Object.entries(topicMap).map(([topic, d]) => ({
      topic, ...d, pct: Math.round((d.correct / d.total) * 100),
    })).sort((a, b) => b.pct - a.pct)
  }, [quizHistory])

  const inferredStyle = useMemo(() => {
    if (total < 3) return null
    if (acc >= 75) return { label: 'Quick Learner', icon: ZapIcon, desc: 'You absorb concepts rapidly. Increasing difficulty is recommended to sustain growth.' }
    if (acc >= 50) return { label: 'Steady Progress', icon: AnalyticsUpIcon, desc: 'Consistent mastery. Strategic review of weak topics will unlock the next level.' }
    return { label: 'Active Practice', icon: RefreshIcon, desc: 'Focus on focused learning blocks. Use the Simple mode in Learn tab to solidify foundations.' }
  }, [acc, total])

  async function generateInsight() {
    if (total < 1) return
    setLoading(true)
    setError('')
    try {
      const text = await detectLearningInsight({
        apiKey: config.apiKey,
        language: config.language,
        history: quizHistory,
      })
      setInsight(text)
    } catch (e) {
      setError(e.message || 'Failed to generate insight.')
    }
    setLoading(false)
  }

  if (total === 0 && learnedTopics.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={s.empty}
      >
        <div style={s.emptyIcon}>
           <AiBrain01Icon size={32} />
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }} className="text-gradient">No insights generated yet</h3>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 350, margin: '0 auto', lineHeight: 1.6 }}>
          Learn and validate topics to unlock your personalized learning profile.
        </p>
      </motion.div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div style={s.wrap}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={s.summaryGrid}
      >
        <MetricCard label="Mastered" value={learnedTopics.length} color="var(--purple)" icon={BookOpen01Icon} />
        <MetricCard label="Validated"  value={total}               color="var(--blue)" icon={Target02Icon}    />
        <MetricCard label="Accuracy" value={acc + '%'} color={acc >= 70 ? 'var(--teal)' : acc >= 40 ? 'var(--amber)' : 'var(--coral)'} icon={Analytics01Icon} />
        <MetricCard label="Correct" value={correct} color="var(--teal)" icon={Tick01Icon} />
      </motion.div>

      <AnimatePresence>
        {inferredStyle && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={s.styleCard}
            className="glass"
          >
            <div style={s.styleIcon}>
              <HugeiconsIcon icon={inferredStyle.icon} size={22} color="var(--teal)" />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Profile: {inferredStyle.label}</p>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>{inferredStyle.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={s.mainLayout}>
        <div style={{ display: 'grid', gridTemplateColumns: topicPerf.length > 0 ? '1fr 1fr' : '1fr', gap: 24, alignItems: 'stretch' }}>
          {topicPerf.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={s.section}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
                 <AnalyticsUpIcon size={16} style={{ color: 'var(--purple)' }} />
                 <p style={s.sectionTitle}>Relative Performance</p>
              </div>
              <div style={s.perfList}>
                {topicPerf.map(t => (
                  <div key={t.topic} style={s.perfRow}>
                    <span style={s.perfTopic}>{t.topic}</span>
                    <div style={s.perfBarBg}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: t.pct + '%' }}
                        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                        style={{ ...s.perfBarFill, background: t.pct >= 75 ? 'var(--teal)' : t.pct >= 45 ? 'var(--amber)' : 'var(--coral)' }}
                      />
                    </div>
                    <span style={s.perfPct}>{t.pct}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={s.section}
            className="card-shine"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <SparklesIcon size={16} style={{ color: 'var(--teal)' }} />
                 <p style={s.sectionTitle}>Agentic Insights</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                style={{ ...s.genBtn, opacity: loading || total < 1 ? 0.5 : 1 }}
                onClick={generateInsight}
                disabled={loading || total < 1}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }} />
                ) : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SparklesIcon size={16} />
                      <span>Synthesize Feedback</span>
                    </div>}
              </motion.button>
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={s.insightCard}
                >
                  {[90, 75, 95, 65, 80, 70].map((w,i) => <div key={i} className="skeleton" style={{ height: 18, width: w+'%', borderRadius: 6, marginBottom: 16 }} />)}
                </motion.div>
              ) : insight ? (
                <motion.div
                  key="insight"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={s.insightCard}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                     <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--teal-muted)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Idea01Icon size={18} />
                     </div>
                     <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
                       Model: Gemini 2.0 Flash &middot; {config.language}
                     </p>
                  </div>
                  {insight.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: 14, fontWeight: 500 }}>{line}</p>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={s.insightPlaceholder}
                >
                  <SparklesIcon size={32} style={{ opacity: 0.2, marginBottom: 16 }} />
                  <span style={{ fontWeight: 500 }}>{total < 1
                    ? 'Attempt at least one quiz to unlock personalized agentic insights.'
                    : `Initialize synthesis for specialized feedback in ${config.language}.`}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color, icon: Icon }) {
  return (
    <motion.div whileHover={{ y: -6, borderColor: color }} style={s.metricCard} className="glass">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
           <HugeiconsIcon icon={Icon} size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
        </div>
      </div>
    </motion.div>
  )
}

const s = {
  wrap: { paddingBottom: '3rem' },
  empty: {
    textAlign: 'center', padding: '7rem 3rem',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
  },
  emptyIcon: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 72, height: 72, borderRadius: 20,
    background: 'var(--teal-muted)', color: 'var(--teal)',
    marginBottom: 28, boxShadow: '0 0 32px oklch(75% 0.15 170 / 0.1)',
  },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: '2rem' },
  metricCard: {
    background: 'oklch(20% 0.04 var(--brand-hue) / 0.4)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem',
    display: 'flex', alignItems: 'center',
  },
  styleCard: {
    background: 'oklch(75% 0.15 170 / 0.08)',
    border: '1px solid oklch(75% 0.15 170 / 0.2)',
    borderRadius: 'var(--radius-xl)',
    padding: '2rem 2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    marginBottom: '2rem',
    boxShadow: 'var(--shadow-glow)',
  },
  styleIcon: {
    width: 56, height: 56, borderRadius: 16,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: 'var(--shadow-sm)',
  },
  mainLayout: { display: 'flex', flexDirection: 'column', gap: 24 },
  section: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem' },
  sectionTitle: { fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' },
  perfList: { display: 'flex', flexDirection: 'column', gap: 16 },
  perfRow: { display: 'grid', gridTemplateColumns: '180px 1fr 52px', gap: 20, alignItems: 'center' },
  perfTopic: { fontSize: 16, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 800, letterSpacing: '-0.01em' },
  perfBarBg: { height: 10, background: 'var(--bg-secondary)', borderRadius: 5, overflow: 'hidden' },
  perfBarFill: { height: '100%', borderRadius: 5 },
  perfPct: { fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: 800 },
  genBtn: { background: 'var(--teal)', border: 'none', borderRadius: 'var(--radius-lg)', padding: '10px 24px', color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px oklch(75% 0.15 170 / 0.2)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  insightCard: { background: 'oklch(100% 0 0 / 0.02)', borderRadius: 'var(--radius-lg)', padding: '2rem 2.5rem', border: '1px solid var(--border)' },
  insightPlaceholder: { fontSize: 15, color: 'var(--text-muted)', padding: '4rem 2.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  errorBox: { background: 'var(--coral-muted)', border: '1px solid var(--coral)', borderRadius: 'var(--radius-md)', padding: '16px 24px', fontSize: 14, color: 'var(--coral-bright)', marginBottom: '1.5rem', fontWeight: 600 },
}
