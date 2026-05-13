import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

function getStrength(correct, total) {
  if (total === 0) return 'unseen'
  const pct = correct / total
  if (pct >= 0.75) return 'strong'
  if (pct >= 0.45) return 'medium'
  return 'weak'
}

function getColor(strength) {
  return { strong: 'var(--teal)', medium: 'var(--amber)', weak: 'var(--coral)', unseen: 'var(--text-muted)' }[strength]
}

function getScore(strength) {
  return { strong: 95, medium: 60, weak: 30, unseen: 0 }[strength]
}

export default function HeatmapTab({ learnedTopics, quizHistory }) {
  const topicStats = useMemo(() => {
    const map = {}
    learnedTopics.forEach(t => {
      if (!map[t]) map[t] = { correct: 0, total: 0, learned: true }
    })
    quizHistory.forEach(({ topic, correct }) => {
      if (!map[topic]) map[topic] = { correct: 0, total: 0, learned: false }
      map[topic].total++
      if (correct) map[topic].correct++
    })
    return Object.entries(map).map(([topic, data]) => ({
      topic,
      ...data,
      strength: getStrength(data.correct, data.total),
      pct: data.total > 0 ? Math.round((data.correct / data.total) * 100) : null,
    }))
  }, [learnedTopics, quizHistory])

  const radarData = topicStats.slice(0, 8).map(t => ({
    topic: t.topic.length > 14 ? t.topic.slice(0, 12) + '\u2026' : t.topic,
    score: getScore(t.strength),
  }))

  const strong = topicStats.filter(t => t.strength === 'strong').length
  const medium = topicStats.filter(t => t.strength === 'medium').length
  const weak   = topicStats.filter(t => t.strength === 'weak').length

  if (topicStats.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={s.empty}
      >
        <div style={s.emptyIcon}>H</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }} className="text-gradient">No data yet</h3>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 300, margin: '0 auto' }}>
          Learn topics and take quizzes to build your knowledge map.
        </p>
      </motion.div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  }

  return (
    <div style={s.wrap}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={s.summaryRow}
      >
        <SummaryCard label="Topics Explored" value={topicStats.length} color="var(--teal-bright)" />
        <SummaryCard label="Strong" value={strong} color="var(--teal)" />
        <SummaryCard label="Needs Work" value={medium} color="var(--amber)" />
        <SummaryCard label="Weak" value={weak} color="var(--coral)" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={s.legend}
      >
        {[
          { color: 'var(--teal)',   label: 'Strong (\u226575%)' },
          { color: 'var(--amber)',  label: 'Medium (45\u201374%)' },
          { color: 'var(--coral)', label: 'Weak (<45%)' },
          { color: 'var(--text-muted)', label: 'Not quizzed' },
        ].map(l => (
          <div key={l.label} style={s.legendItem}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
            {l.label}
          </div>
        ))}
      </motion.div>

      <div style={s.mainLayout}>
        {radarData.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={s.chartCard}
          >
            <p style={s.chartTitle}>Knowledge Radar</p>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }} />
                  <Radar name="Score" dataKey="score" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--shadow-md)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    labelStyle={{ color: 'var(--teal-bright)', fontWeight: 700, marginBottom: 4 }}
                    formatter={v => [`${v}%`, 'Strength']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={s.grid}
        >
          {topicStats.map(t => (
            <motion.div
              key={t.topic}
              variants={item}
              whileHover={{ y: -4, borderColor: getColor(t.strength) }}
              style={s.cell}
            >
              <div style={{ ...s.cellBar, background: getColor(t.strength) }} />
              <p style={s.cellTopic}>{t.topic}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                {t.total > 0 ? `${t.correct}/${t.total} correct` : 'Learned, not quizzed'}
              </p>
              <div style={s.barBg}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: t.pct !== null ? `${t.pct}%` : '0%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    ...s.barFill,
                    background: getColor(t.strength),
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: getColor(t.strength), fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t.strength}
                </span>
                {t.pct !== null && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{t.pct}%</span>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <motion.div whileHover={{ y: -4 }} style={s.summaryCard}>
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
    background: 'var(--teal-muted)', color: 'var(--teal-bright)',
    fontSize: 24, fontWeight: 800,
    marginBottom: 20,
  },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.5rem' },
  summaryCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '1.25rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
  },
  legend: { display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 },
  mainLayout: { display: 'flex', flexDirection: 'column', gap: 20 },
  chartCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '2rem',
  },
  chartTitle: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 },
  cell: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '1.25rem', position: 'relative', overflow: 'hidden',
    transition: 'all 0.2s ease',
  },
  cellBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  cellTopic: { fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' },
  barBg: { height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
}
