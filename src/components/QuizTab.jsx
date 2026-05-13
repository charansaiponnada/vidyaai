import { useState } from 'react'
import { generateQuizQuestion } from '../gemini'

const DIFF_CONFIG = {
  1: { label: 'Easy',   color: 'var(--teal)',  bg: 'rgba(45,212,160,0.12)'  },
  2: { label: 'Medium', color: 'var(--amber)', bg: 'rgba(245,166,35,0.12)'  },
  3: { label: 'Hard',   color: 'var(--coral)', bg: 'rgba(255,107,107,0.12)' },
}

export default function QuizTab({ config, roadmap, learnedTopics, onAnswer }) {
  const [topic, setTopic]       = useState(learnedTopics[learnedTopics.length - 1] || roadmap?.nodes[0]?.label || '')
  const [question, setQuestion] = useState(null)
  const [difficulty, setDiff]   = useState(1)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [streak, setStreak]     = useState(0)
  const [history, setHistory]   = useState([]) // {correct, topic}
  const [qCount, setQCount]     = useState(0)

  const effectiveTopic = topic.trim() || config.subject

  async function fetchQuestion(diff = difficulty) {
    if (!effectiveTopic) return setError('Please select a topic first.')
    setLoading(true)
    setError('')
    setQuestion(null)
    setSelected(null)
    setAnswered(false)
    try {
      const q = await generateQuizQuestion({
        apiKey: config.apiKey,
        topic: effectiveTopic,
        language: config.language,
        difficulty: diff,
      })
      setQuestion(q)
      setQCount(c => c + 1)
    } catch (e) {
      setError(e.message || 'Failed to generate question.')
    }
    setLoading(false)
  }

  function handleSelect(idx) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    const correct = idx === question.correctIndex
    const newHistory = [...history, { correct, topic: effectiveTopic }]
    setHistory(newHistory)
    onAnswer({ correct, topic: effectiveTopic, history: newHistory })

    // Adaptive difficulty
    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak >= 2 && difficulty < 3) setDiff(d => Math.min(3, d + 1))
    } else {
      setStreak(0)
      if (difficulty > 1) setDiff(d => Math.max(1, d - 1))
    }
  }

  function handleNext() {
    const nextDiff = answered
      ? (selected === question?.correctIndex && streak >= 2 ? Math.min(3, difficulty + 1) : difficulty)
      : difficulty
    fetchQuestion(nextDiff)
  }

  const correctCount = history.filter(h => h.correct).length
  const acc = history.length > 0 ? Math.round((correctCount / history.length) * 100) : 0

  return (
    <div style={s.wrap}>
      {/* Topic selector */}
      <div style={s.topBar}>
        <select
          style={s.topicInput}
          value={topic}
          onChange={e => setTopic(e.target.value)}
        >
          <option value="" disabled>Select a topic from your roadmap</option>
          {roadmap?.nodes.map(node => (
            <option key={node.id} value={node.label}>
              {node.label} {learnedTopics.includes(node.label) ? '✓' : ''}
            </option>
          ))}
        </select>
        <button
          style={{ ...s.startBtn, opacity: loading ? 0.6 : 1 }}
          onClick={() => fetchQuestion()}
          disabled={loading}
        >
          {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : question ? 'New Question' : 'Start Quiz'}
        </button>
      </div>

      {/* Stats strip */}
      {history.length > 0 && (
        <div style={s.statsStrip}>
          <StatPill label="Questions" value={history.length} />
          <StatPill label="Correct" value={correctCount} color="var(--teal)" />
          <StatPill label="Accuracy" value={`${acc}%`} color={acc >= 70 ? 'var(--teal)' : acc >= 40 ? 'var(--amber)' : 'var(--coral)'} />
          <StatPill label="Streak" value={streak} color="var(--purple2)" />
          <div style={{ ...s.diffBadge, background: DIFF_CONFIG[difficulty].bg, color: DIFF_CONFIG[difficulty].color }}>
            {DIFF_CONFIG[difficulty].label} difficulty
          </div>
        </div>
      )}

      {/* Adaptive difficulty hint */}
      {history.length > 0 && (
        <div style={s.adaptHint}>
          <span style={{ color: 'var(--purple2)', fontWeight: 600 }}>Adaptive mode on</span>
          {' — '}{streak >= 2 ? `🔥 ${streak} streak! Increasing difficulty.` : streak === 0 && history.length > 1 ? '📉 Adjusting to easier questions.' : '⚡ Tracking your performance...'}
        </div>
      )}

      {error && <div style={s.errorBox}>{error}</div>}

      {/* Loading skeleton */}
      {loading && (
        <div style={s.qCard}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="skeleton" style={{ height: 14, width: '30%', borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 20, width: '90%', borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 20, width: '70%', borderRadius: 4 }} />
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />)}
            </div>
          </div>
        </div>
      )}

      {/* Question */}
      {question && !loading && (
        <div style={s.qCard} className="fade-in">
          <div style={s.qMeta}>
            <span style={s.qNum}>Q{qCount}</span>
            <span style={{ ...s.diffBadge, background: DIFF_CONFIG[difficulty].bg, color: DIFF_CONFIG[difficulty].color }}>
              {DIFF_CONFIG[difficulty].label}
            </span>
          </div>

          <p style={s.qText}>{question.question}</p>

          <div style={s.optionsWrap}>
            {question.options.map((opt, i) => {
              let optStyle = { ...s.option }
              if (answered) {
                if (i === question.correctIndex) optStyle = { ...optStyle, ...s.optCorrect }
                else if (i === selected) optStyle = { ...optStyle, ...s.optWrong }
                else optStyle = { ...optStyle, opacity: 0.5 }
              }
              return (
                <button key={i} style={optStyle} onClick={() => handleSelect(i)} disabled={answered}>
                  <span style={{
                    ...s.optKey,
                    ...(answered && i === question.correctIndex ? { background: 'var(--teal)', color: '#000', borderColor: 'var(--teal)' } : {}),
                    ...(answered && i === selected && i !== question.correctIndex ? { background: 'var(--coral)', color: '#fff', borderColor: 'var(--coral)' } : {}),
                  }}>
                    {['A','B','C','D'][i]}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div style={{
              ...s.feedback,
              background: selected === question.correctIndex ? 'rgba(45,212,160,0.07)' : 'rgba(255,107,107,0.07)',
              borderColor: selected === question.correctIndex ? 'rgba(45,212,160,0.3)' : 'rgba(255,107,107,0.25)',
            }} className="fade-in">
              <span style={{ fontWeight: 600, color: selected === question.correctIndex ? 'var(--teal)' : 'var(--coral)' }}>
                {selected === question.correctIndex ? '✓ Correct! ' : '✗ Incorrect. '}
              </span>
              {question.explanation}
            </div>
          )}

          <button style={s.nextBtn} onClick={handleNext}>
            Next Question →
          </button>
        </div>
      )}

      {/* Empty state */}
      {!question && !loading && !error && (
        <div style={s.emptyState}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🎯</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Ready to test your knowledge?</p>
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>Quiz difficulty auto-adjusts based on your performance.</p>
        </div>
      )}
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--text)', fontFamily: 'var(--mono)' }}>{value}</span>
      <span style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '2rem' },
  topBar: { display: 'flex', gap: 10, marginBottom: '1rem' },
  topicInput: {
    flex: 1, background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r)', padding: '11px 16px', fontSize: 14,
    color: 'var(--text)', outline: 'none',
  },
  startBtn: {
    background: 'var(--purple)', border: 'none', borderRadius: 'var(--r)',
    padding: '11px 22px', color: '#fff', fontSize: 14, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  statsStrip: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r)', padding: '12px 20px',
    display: 'flex', gap: 24, alignItems: 'center',
    marginBottom: '0.75rem', flexWrap: 'wrap',
  },
  diffBadge: {
    fontSize: 11, fontWeight: 600, padding: '4px 12px',
    borderRadius: 20, fontFamily: 'var(--mono)',
  },
  adaptHint: {
    fontSize: 13, color: 'var(--text2)',
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 14px', marginBottom: '1.25rem',
  },
  errorBox: {
    background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)',
    borderRadius: 'var(--r)', padding: '12px 16px', fontSize: 14, color: 'var(--coral)',
    marginBottom: '1rem',
  },
  qCard: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)', padding: '2rem',
  },
  qMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  qNum: { fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' },
  qText: { fontSize: 17, fontWeight: 600, lineHeight: 1.65, marginBottom: '1.5rem' },
  optionsWrap: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1rem' },
  option: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--r)', padding: '13px 16px',
    fontSize: 14, color: 'var(--text)', textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
  },
  optCorrect: { border: '1px solid var(--teal)', background: 'rgba(45,212,160,0.09)' },
  optWrong:   { border: '1px solid var(--coral)', background: 'rgba(255,107,107,0.07)' },
  optKey: {
    width: 28, height: 28, borderRadius: 7, background: 'var(--bg3)',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 11, fontFamily: 'var(--mono)',
    color: 'var(--text2)', flexShrink: 0, transition: 'all 0.2s',
  },
  feedback: {
    border: '1px solid', borderRadius: 'var(--r)', padding: '12px 16px',
    fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: '1rem',
  },
  nextBtn: {
    width: '100%', padding: 12, background: 'var(--purple)', border: 'none',
    borderRadius: 'var(--r)', color: '#fff', fontSize: 14, fontWeight: 600,
  },
  emptyState: {
    textAlign: 'center', padding: '4rem 2rem',
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
  },
}
