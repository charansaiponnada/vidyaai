import { useState, useMemo } from 'react'
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
    if (acc >= 75) return { label: 'Quick Learner', emoji: 'lightning', desc: 'You absorb concepts fast. Try harder difficulty to keep growing.' }
    if (acc >= 50) return { label: 'Steady Learner', emoji: 'chart', desc: 'Consistent progress. Review weak topics and you will level up.' }
    return { label: 'Needs Practice', emoji: 'repeat', desc: 'Focus on one topic at a time and use the Learn tab with Simple mode.' }
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
      <div style={s.empty}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No data yet</p>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>Learn topics and take quizzes to unlock your insights.</p>
      </div>
    )
  }

  return (
    <div style={s.wrap}>
      <div style={s.summaryGrid}>
        <MetricCard label="Topics Learned" value={learnedTopics.length} color="var(--purple2)" />
        <MetricCard label="Quizzes Taken"  value={total}               color="var(--blue)"    />
        <MetricCard label="Accuracy" value={acc + '%'} color={acc >= 70 ? 'var(--teal)' : acc >= 40 ? 'var(--amber)' : 'var(--coral)'} />
        <MetricCard label="Correct" value={correct} color="var(--teal)" />
      </div>

      {inferredStyle && (
        <div style={s.styleCard}>
          <span style={{ fontSize: 28 }}>{inferredStyle.emoji === 'lightning' ? '⚡' : inferredStyle.emoji === 'chart' ? '📈' : '🔁'}</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Learning profile: {inferredStyle.label}</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{inferredStyle.desc}</p>
          </div>
        </div>
      )}

      {topicPerf.length > 0 && (
        <div style={s.section}>
          <p style={s.sectionTitle}>Topic-wise performance</p>
          <div style={s.perfList}>
            {topicPerf.map(t => (
              <div key={t.topic} style={s.perfRow}>
                <span style={s.perfTopic}>{t.topic}</span>
                <div style={s.perfBarBg}>
                  <div style={{ ...s.perfBarFill, width: t.pct + '%', background: t.pct >= 75 ? 'var(--teal)' : t.pct >= 45 ? 'var(--amber)' : 'var(--coral)' }} />
                </div>
                <span style={s.perfPct}>{t.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={s.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={s.sectionTitle}>AI-generated personalised insight</p>
          <button style={{ ...s.genBtn, opacity: loading || total < 1 ? 0.5 : 1 }} onClick={generateInsight} disabled={loading || total < 1}>
            {loading ? 'Analyzing...' : '✨ Generate insight'}
          </button>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        {loading && (
          <div style={s.insightCard}>
            {[85,70,90,60,75].map((w,i) => <div key={i} className="skeleton" style={{ height:15, width: w+'%', borderRadius:4, marginBottom:10 }} />)}
          </div>
        )}
        {insight && !loading && (
          <div style={s.insightCard} className="fade-in">
            <p style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Powered by Gemini · Language: {config.language}
            </p>
            {insight.split('\n').filter(Boolean).map((line,i) => (
              <p key={i} style={{ fontSize:14, color:'var(--text)', lineHeight:1.8, marginBottom:8 }}>{line}</p>
            ))}
          </div>
        )}
        {!insight && !loading && (
          <div style={s.insightPlaceholder}>
            {total < 1 ? 'Take at least 1 quiz to unlock AI insights.' : 'Click "Generate insight" for personalized AI feedback in ' + config.language + '.'}
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <div style={s.metricCard}>
      <span style={{ fontSize:26, fontWeight:700, color, fontFamily:'var(--mono)' }}>{value}</span>
      <span style={{ fontSize:11, color:'var(--text2)', marginTop:3 }}>{label}</span>
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '2rem' },
  empty: { textAlign:'center', padding:'4rem 2rem', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)' },
  summaryGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1.25rem' },
  metricCard: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1rem', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' },
  styleCard: { background:'rgba(124,110,247,0.08)', border:'1px solid rgba(124,110,247,0.22)', borderRadius:'var(--r-lg)', padding:'1.25rem 1.5rem', display:'flex', alignItems:'flex-start', gap:16, marginBottom:'1.25rem' },
  section: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'1.5rem', marginBottom:'1.25rem' },
  sectionTitle: { fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:0 },
  perfList: { display:'flex', flexDirection:'column', gap:10 },
  perfRow: { display:'grid', gridTemplateColumns:'140px 1fr 42px', gap:12, alignItems:'center' },
  perfTopic: { fontSize:13, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  perfBarBg: { height:6, background:'var(--bg3)', borderRadius:3, overflow:'hidden' },
  perfBarFill: { height:'100%', borderRadius:3, transition:'width 0.6s ease' },
  perfPct: { fontSize:12, color:'var(--text2)', fontFamily:'var(--mono)', textAlign:'right' },
  genBtn: { background:'var(--purple)', border:'none', borderRadius:8, padding:'8px 16px', color:'#fff', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 },
  insightCard: { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem' },
  insightPlaceholder: { fontSize:13, color:'var(--text3)', fontStyle:'italic', padding:'1.5rem', textAlign:'center', background:'var(--bg2)', borderRadius:'var(--r)' },
  errorBox: { background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.25)', borderRadius:'var(--r)', padding:'12px 16px', fontSize:14, color:'var(--coral)', marginBottom:'1rem' },
}
