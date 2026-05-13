import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    if (acc >= 75) return { label: 'Quick Learner', emoji: '\u26A1', desc: 'You absorb concepts fast. Try harder difficulty to keep growing.' }
    if (acc >= 50) return { label: 'Steady Learner', emoji: '\uD83D\uDCC8', desc: 'Consistent progress. Review weak topics and you\'ll level up.' }
    return { label: 'Needs Practice', emoji: '\uD83D\uDD01', desc: 'Focus on one topic at a time and use the Learn tab with Simple mode.' }
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={s.empty}
      >
        <div style={s.emptyIcon}>I</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }} className="text-gradient">No data yet</h3>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 300, margin: '0 auto' }}>
          Learn topics and take quizzes to unlock your insights.
        </p>
      </motion.div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
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
        <MetricCard label="Topics Learned" value={learnedTopics.length} color="var(--purple-bright)" />
        <MetricCard label="Quizzes Taken"  value={total}               color="var(--blue)"    />
        <MetricCard label="Accuracy" value={acc + '%'} color={acc >= 70 ? 'var(--teal)' : acc >= 40 ? 'var(--amber)' : 'var(--coral)'} />
        <MetricCard label="Correct" value={correct} color="var(--teal)" />
      </motion.div>

      <AnimatePresence>
        {inferredStyle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={s.styleCard}
          >
            <div style={s.styleEmoji}>{inferredStyle.emoji}</div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>Profile: {inferredStyle.label}</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{inferredStyle.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={s.mainLayout}>
        {topicPerf.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={s.section}
          >
            <p style={s.sectionTitle}>Topic Performance</p>
            <div style={s.perfList}>
              {topicPerf.map(t => (
                <div key={t.topic} style={s.perfRow}>
                  <span style={s.perfTopic}>{t.topic}</span>
                  <div style={s.perfBarBg}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: t.pct + '%' }}
                      transition={{ duration: 1, ease: "easeOut" }}
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          style={s.section}
          className="card-shine"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
            <p style={s.sectionTitle}>AI Personalized Insight</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ ...s.genBtn, opacity: loading || total < 1 ? 0.55 : 1 }}
              onClick={generateInsight}
              disabled={loading || total < 1}
            >
              {loading ? (
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
              ) : 'Generate Insight'}
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
                {[90, 75, 95, 65, 80].map((w,i) => <div key={i} className="skeleton" style={{ height: 16, width: w+'%', borderRadius: 4, marginBottom: 12 }} />)}
              </motion.div>
            ) : insight ? (
              <motion.div
                key="insight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={s.insightCard}
              >
                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                  VidyaAI Engine &middot; Language: {config.language}
                </p>
                {insight.split('\n').filter(Boolean).map((line, i) => (
                  <p key={i} style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: 10 }}>{line}</p>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={s.insightPlaceholder}
              >
                {total < 1
                  ? 'Take at least 1 quiz to unlock AI insights.'
                  : `Click "Generate Insight" for personalized feedback in ${config.language}.`}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <motion.div whileHover={{ y: -4 }} style={s.metricCard}>
      <span style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </motion.div>
  )
}

const s = {
  wrap: { paddingBottom: '2rem' },
  empty: {
    textAlign: 'center', padding: '5rem 2rem',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
  },
  emptyIcon: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 56, height: 56, borderRadius: 16,
    background: 'var(--purple-muted)', color: 'var(--purple-bright)',
    fontSize: 24, fontWeight: 800,
    marginBottom: 20,
  },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' },
  metricCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '1.25rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
  },
  styleCard: {
    background: 'var(--purple-muted)',
    border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: '1.5rem',
    boxShadow: 'var(--shadow-glow)',
  },
  styleEmoji: {
    width: 48, height: 48, borderRadius: 14,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  },
  mainLayout: { display: 'flex', flexDirection: 'column', gap: 20 },
  section: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' },
  sectionTitle: { fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' },
  perfList: { display: 'flex', flexDirection: 'column', gap: 14 },
  perfRow: { display: 'grid', gridTemplateColumns: '160px 1fr 48px', gap: 16, alignItems: 'center' },
  perfTopic: { fontSize: 14, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 },
  perfBarBg: { height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' },
  perfBarFill: { height: '100%', borderRadius: 4 },
  perfPct: { fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: 700 },
  genBtn: { background: 'var(--purple)', border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 20px', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-sm)' },
  insightCard: { background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '1.5rem 2rem' },
  insightPlaceholder: { fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic', padding: '2.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' },
  errorBox: { background: 'var(--coral-muted)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', padding: '14px 20px', fontSize: 14, color: 'var(--coral)', marginBottom: '1rem' },
}
