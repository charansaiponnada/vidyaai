import { useMemo } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

function getStrength(correct, total) {
  if (total === 0) return 'unseen'
  const pct = correct / total
  if (pct >= 0.75) return 'strong'
  if (pct >= 0.45) return 'medium'
  return 'weak'
}

function getColor(strength) {
  return { strong: 'var(--teal)', medium: 'var(--amber)', weak: 'var(--coral)', unseen: 'var(--text3)' }[strength]
}
function getScore(strength) {
  return { strong: 90, medium: 55, weak: 25, unseen: 0 }[strength]
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
    topic: t.topic.length > 14 ? t.topic.slice(0, 12) + '…' : t.topic,
    score: getScore(t.strength),
  }))

  const strong = topicStats.filter(t => t.strength === 'strong').length
  const medium = topicStats.filter(t => t.strength === 'medium').length
  const weak   = topicStats.filter(t => t.strength === 'weak').length

  if (topicStats.length === 0) {
    return (
      <div style={s.empty}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>📊</p>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No data yet</p>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>Learn topics and take quizzes to build your knowledge map.</p>
      </div>
    )
  }

  return (
    <div style={s.wrap}>
      {/* Summary row */}
      <div style={s.summaryRow}>
        <SummaryCard label="Topics Explored" value={topicStats.length} color="var(--purple2)" />
        <SummaryCard label="Strong" value={strong} color="var(--teal)" />
        <SummaryCard label="Needs Work" value={medium} color="var(--amber)" />
        <SummaryCard label="Weak" value={weak} color="var(--coral)" />
      </div>

      {/* Legend */}
      <div style={s.legend}>
        {[
          { color: 'var(--teal)',   label: 'Strong (≥75%)' },
          { color: 'var(--amber)',  label: 'Medium (45–74%)' },
          { color: 'var(--coral)', label: 'Weak (<45%)' },
          { color: 'var(--text3)', label: 'Not quizzed' },
        ].map(l => (
          <div key={l.label} style={s.legendItem}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Radar chart */}
      {radarData.length >= 3 && (
        <div style={s.chartCard}>
          <p style={s.chartTitle}>Knowledge radar</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#252538" />
              <PolarAngleAxis dataKey="topic" tick={{ fill: '#8888a8', fontSize: 11, fontFamily: 'Sora, sans-serif' }} />
              <Radar name="Score" dataKey="score" stroke="#7c6ef7" fill="#7c6ef7" fillOpacity={0.22} strokeWidth={2} />
              <Tooltip
                contentStyle={{ background: '#111120', border: '1px solid #252538', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e4e4f0' }}
                formatter={v => [`${v}%`, 'Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Topic grid */}
      <div style={s.grid}>
        {topicStats.map(t => (
          <div key={t.topic} style={s.cell}>
            <div style={{ ...s.cellBar, background: getColor(t.strength) }} />
            <p style={s.cellTopic}>{t.topic}</p>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
              {t.total > 0 ? `${t.correct}/${t.total} correct` : 'Learned · not quizzed yet'}
            </p>
            <div style={s.barBg}>
              <div style={{
                ...s.barFill,
                width: t.pct !== null ? `${t.pct}%` : '0%',
                background: getColor(t.strength),
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: getColor(t.strength), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t.strength}
              </span>
              {t.pct !== null && <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{t.pct}%</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={s.summaryCard}>
      <span style={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{label}</span>
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '2rem' },
  empty: {
    textAlign: 'center', padding: '4rem 2rem',
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
  },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1rem' },
  summaryCard: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r)', padding: '1rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
  },
  legend: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: '1.25rem' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' },
  chartCard: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)', padding: '1.5rem', marginBottom: '1.25rem',
  },
  chartTitle: { fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 },
  cell: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r)', padding: '1rem', position: 'relative', overflow: 'hidden',
  },
  cellBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  cellTopic: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  barBg: { height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2, transition: 'width 0.6s ease' },
}
