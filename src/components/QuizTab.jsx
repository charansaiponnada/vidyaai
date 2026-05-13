import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateQuizQuestion } from '../gemini'

const DIFF_CONFIG = {
  1: { label: 'Easy',   color: 'var(--teal)',  bg: 'var(--teal-muted)'  },
  2: { label: 'Medium', color: 'var(--amber)', bg: 'var(--amber-muted)'  },
  3: { label: 'Hard',   color: 'var(--coral)', bg: 'var(--coral-muted)' },
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
  const [history, setHistory]   = useState([])
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
      <div style={s.topBar}>
        <select
          style={s.topicInput}
          value={topic}
          onChange={e => setTopic(e.target.value)}
        >
          <option value="" disabled>Select a topic from your roadmap</option>
          {roadmap?.nodes.map(node => (
            <option key={node.id} value={node.label}>
              {node.label} {learnedTopics.includes(node.label) ? '\u2713' : ''}
            </option>
          ))}
        </select>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={s.startBtn}
          onClick={() => fetchQuestion()}
          disabled={loading}
        >
          {loading ? (
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
          ) : (question ? 'New Question' : 'Start Quiz')}
        </motion.button>
      </div>

      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={s.statsStrip}
        >
          <StatPill label="Questions" value={history.length} />
          <StatPill label="Correct" value={correctCount} color="var(--teal)" />
          <StatPill label="Accuracy" value={`${acc}%`} color={acc >= 70 ? 'var(--teal)' : acc >= 40 ? 'var(--amber)' : 'var(--coral)'} />
          <StatPill label="Streak" value={streak} color="var(--purple-bright)" />
          <div style={{ ...s.diffBadge, background: DIFF_CONFIG[difficulty].bg, color: DIFF_CONFIG[difficulty].color }}>
            {DIFF_CONFIG[difficulty].label.toUpperCase()}
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={s.adaptHint}
        >
          <span style={{ color: 'var(--purple-bright)', fontWeight: 700 }}>Adaptive mode</span>
          {' \u2014 '}{streak >= 2 ? `Streak ${streak} \u2014 increasing difficulty` : streak === 0 && history.length > 1 ? 'Adjusting to easier questions' : 'Tracking your performance'}
        </motion.div>
      )}

      {error && <div style={s.errorBox}>{error}</div>}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={s.qCard}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="skeleton" style={{ height: 14, width: '20%', borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 24, width: '90%', borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 24, width: '70%', borderRadius: 4 }} />
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }} />)}
              </div>
            </div>
          </motion.div>
        ) : question ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={s.qCard}
            className="card-shine"
          >
            <div style={s.qMeta}>
              <span style={s.qNum}>QUESTION {qCount}</span>
              <span style={{ ...s.diffBadge, background: DIFF_CONFIG[difficulty].bg, color: DIFF_CONFIG[difficulty].color }}>
                {DIFF_CONFIG[difficulty].label.toUpperCase()}
              </span>
            </div>

            <p style={s.qText}>{question.question}</p>

            <div style={s.optionsWrap}>
              {question.options.map((opt, i) => {
                let optStyle = { ...s.option }
                if (answered) {
                  if (i === question.correctIndex) optStyle = { ...optStyle, ...s.optCorrect }
                  else if (i === selected) optStyle = { ...optStyle, ...s.optWrong }
                  else optStyle = { ...optStyle, opacity: 0.35 }
                }
                return (
                  <motion.button
                    key={i}
                    whileHover={!answered ? { x: 4, backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-bright)' } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    style={optStyle}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                  >
                    <span style={{
                      ...s.optKey,
                      ...(answered && i === question.correctIndex ? { background: 'var(--teal)', color: '#000', borderColor: 'var(--teal)' } : {}),
                      ...(answered && i === selected && i !== question.correctIndex ? { background: 'var(--coral)', color: '#fff', borderColor: 'var(--coral)' } : {}),
                    }}>
                      {['A','B','C','D'][i]}
                    </span>
                    {opt}
                  </motion.button>
                )
              })}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    ...s.feedback,
                    background: selected === question.correctIndex ? 'var(--teal-muted)' : 'var(--coral-muted)',
                    borderColor: selected === question.correctIndex ? 'rgba(45,212,160,0.25)' : 'rgba(239,68,68,0.25)',
                  }}
                >
                  <p style={{ fontWeight: 700, marginBottom: 6, color: selected === question.correctIndex ? 'var(--teal)' : 'var(--coral)' }}>
                    {selected === question.correctIndex ? 'Correct!' : 'Incorrect.'}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{question.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={s.nextBtn}
              onClick={handleNext}
            >
              {answered ? 'Next Question' : 'Skip Question'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={s.emptyState}
          >
            <div style={s.emptyIcon}>Q</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }} className="text-gradient">Ready to test your knowledge?</h3>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 300, margin: '0 auto' }}>
              Quiz difficulty auto-adjusts based on your performance.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 20, fontWeight: 800, color: color || 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</span>
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '2rem' },
  topBar: { display: 'flex', gap: 12, marginBottom: '1.25rem' },
  topicInput: {
    flex: 1, border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '12px 18px', fontSize: 14,
    color: 'var(--text-primary)', outline: 'none',
    background: 'var(--bg-elevated)',
  },
  startBtn: {
    background: 'var(--purple)', border: 'none', borderRadius: 'var(--radius-md)',
    padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700,
    display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-sm)',
  },
  statsStrip: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '14px 24px',
    display: 'flex', gap: 28, alignItems: 'center',
    marginBottom: '1rem', flexWrap: 'wrap',
  },
  diffBadge: {
    fontSize: 10, fontWeight: 800, padding: '5px 12px',
    borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-mono)',
    letterSpacing: '0.05em',
  },
  adaptHint: {
    fontSize: 13, color: 'var(--text-secondary)',
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: '1.5rem',
  },
  errorBox: {
    background: 'var(--coral-muted)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 'var(--radius-md)', padding: '14px 20px', fontSize: 14, color: 'var(--coral)',
    marginBottom: '1rem',
  },
  qCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '2.5rem',
    boxShadow: 'var(--shadow-lg)',
  },
  qMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  qNum: { fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em' },
  qText: { fontSize: 19, fontWeight: 700, lineHeight: 1.6, marginBottom: '2rem', color: 'var(--text-primary)' },
  optionsWrap: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '2rem' },
  option: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '16px 20px',
    fontSize: 15, color: 'var(--text-primary)', textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s',
    cursor: 'pointer',
  },
  optCorrect: { border: '1px solid var(--teal)', background: 'var(--teal-muted)', color: 'var(--teal)' },
  optWrong:   { border: '1px solid var(--coral)', background: 'var(--coral-muted)', color: 'var(--coral)' },
  optKey: {
    width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 12, fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)', flexShrink: 0, fontWeight: 700,
  },
  feedback: {
    border: '1px solid', borderRadius: 'var(--radius-md)', padding: '16px 20px',
    marginBottom: '2rem', overflow: 'hidden',
  },
  nextBtn: {
    width: '100%', padding: 15, background: 'var(--purple)', border: 'none',
    borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 15, fontWeight: 700,
    boxShadow: 'var(--shadow-md)',
  },
  emptyState: {
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
}
