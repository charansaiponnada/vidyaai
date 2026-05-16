import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  Activity01Icon, 
  Analytics01Icon, 
  Tick01Icon, 
  Target02Icon, 
  Cancel01Icon,
  BookOpen01Icon,
  SparklesIcon
} from '@hugeicons/core-free-icons'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

function getStrength(correct, total) {
  if (total === 0) return 'unseen'
  const pct = correct / total
  if (pct >= 0.75) return 'strong'
  if (pct >= 0.45) return 'medium'
  return 'weak'
}

function getColor(strength) {
  return { 
    strong: 'var(--teal)', 
    medium: 'var(--amber)', 
    weak: 'var(--coral)', 
    unseen: 'var(--text-muted)' 
  }[strength]
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={s.empty}
      >
        <div style={s.emptyIcon}>
           <HugeiconsIcon icon={Analytics01Icon} size={32} />
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }} className="text-gradient">No analytics data yet</h3>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 350, margin: '0 auto', lineHeight: 1.6 }}>
          Complete lessons and attempt quizzes to generate your mastery profile.
        </p>
      </motion.div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
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
        style={s.summaryRow}
      >
        <SummaryCard label="Mastery Index" value={topicStats.length} color="var(--purple)" icon={Analytics01Icon} />
        <SummaryCard label="Strong" value={strong} color="var(--teal)" icon={Tick01Icon} />
        <SummaryCard label="Review" value={medium} color="var(--amber)" icon={Activity01Icon} />
        <SummaryCard label="Weak" value={weak} color="var(--coral)" icon={Cancel01Icon} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={s.legend}
      >
        {[
          { color: 'var(--teal)',   label: 'Strong (\u226575%)' },
          { color: 'var(--amber)',  label: 'Fair (45\u201374%)' },
          { color: 'var(--coral)', label: 'Needs Practice (<45%)' },
          { color: 'var(--text-muted)', label: 'Unquizzed' },
        ].map(l => (
          <div key={l.label} style={s.legendItem}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block', boxShadow: `0 0 8px ${l.color}40` }} />
            {l.label}
          </div>
        ))}
      </motion.div>

      <div style={s.mainLayout}>
        <div style={{ display: 'grid', gridTemplateColumns: radarData.length >= 3 ? '400px 1fr' : '1fr', gap: 20 }}>
          {radarData.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={s.chartCard}
              className="glass"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
                 <Activity01Icon size={16} style={{ color: 'var(--teal)' }} />
                 <p style={s.chartTitle}>Knowledge Radar</p>
              </div>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="topic" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700 }} />
                    <Radar name="Mastery" dataKey="score" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, fontSize: 12, boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      labelStyle={{ color: 'var(--teal-bright)', fontWeight: 800, marginBottom: 6, fontSize: 13 }}
                      formatter={v => [`${v}%`, 'Mastery']}
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
                whileHover={{ y: -6, borderColor: getColor(t.strength), background: 'var(--bg-card-hover)' }}
                style={s.cell}
                className="card-shine"
              >
                <div style={{ ...s.cellBar, background: getColor(t.strength) }} />
                <p style={s.cellTopic}>{t.topic}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 500 }}>
                  {t.total > 0 ? `${t.correct}/${t.total} validation tests` : 'Exploration completed'}
                </p>
                <div style={s.barBg}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: t.pct !== null ? `${t.pct}%` : '0%' }}
                    transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                      ...s.barFill,
                      background: getColor(t.strength),
                      boxShadow: `0 0 12px ${getColor(t.strength)}30`,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                     <div style={{ width: 6, height: 6, borderRadius: '50%', background: getColor(t.strength) }} />
                     <span style={{ fontSize: 10, color: getColor(t.strength), fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                       {t.strength}
                     </span>
                  </div>
                  {t.pct !== null && <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{t.pct}%</span>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color, icon: Icon }) {
  return (
    <motion.div whileHover={{ y: -6, borderColor: color }} style={s.summaryCard} className="glass">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
           <Icon size={20} />
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
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: '2rem' },
  summaryCard: {
    background: 'oklch(20% 0.04 var(--brand-hue) / 0.4)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem',
    display: 'flex', alignItems: 'center',
  },
  legend: { display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: '2.5rem', justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 },
  mainLayout: { display: 'flex', flexDirection: 'column', gap: 24 },
  chartCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '2.5rem',
  },
  chartTitle: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 },
  cell: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '1.75rem', position: 'relative', overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  cellBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  cellTopic: { fontSize: 17, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', letterSpacing: '-0.01em' },
  barBg: { height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
}
