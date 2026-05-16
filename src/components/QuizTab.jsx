import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  Idea01Icon, 
  Target02Icon, 
  Tick01Icon, 
  Cancel01Icon, 
  SparklesIcon,
  ArrowRight02Icon,
  RefreshIcon,
  Analytics01Icon
} from '@hugeicons/core-free-icons'
import { generateQuizQuestion } from '../gemini'

const DIFF_CONFIG = {
  1: { label: 'Easy',   color: 'var(--teal)',  bg: 'oklch(75% 0.15 170 / 0.1)'  },
  2: { label: 'Medium', color: 'var(--amber)', bg: 'oklch(75% 0.18 80 / 0.1)'  },
  3: { label: 'Hard',   color: 'var(--coral)', bg: 'oklch(65% 0.18 20 / 0.1)' },
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
        <div style={{ position: 'relative', flex: 1 }}>
           <HugeiconsIcon icon={Idea01Icon} size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
           <select
             style={s.topicInput}
             value={topic}
             onChange={e => setTopic(e.target.value)}
           >
             <option value="" disabled>Select a topic from your roadmap</option>
             {roadmap?.nodes?.map(node => (
               <option key={node.id} value={node.label}>
                 {node.label} {learnedTopics.includes(node.label) ? ' \u2014 learned' : ''}
               </option>
             ))}
           </select>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          style={s.startBtn}
          onClick={() => fetchQuestion()}
          disabled={loading}
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }} />
          ) : <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HugeiconsIcon icon={SparklesIcon} size={18} />
                <span>{question ? 'New Question' : 'Start Quiz'}</span>
              </div>}
        </motion.button>
      </div>

      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={s.statsStrip}
          className="glass"
        >
          <StatPill label="Total" value={history.length} icon={Analytics01Icon} />
          <StatPill label="Correct" value={correctCount} color="var(--teal)" icon={Tick01Icon} />
          <StatPill label="Accuracy" value={`${acc}%`} color={acc >= 70 ? 'var(--teal)' : acc >= 40 ? 'var(--amber)' : 'var(--coral)'} icon={Target02Icon} />
          <StatPill label="Streak" value={streak} color="var(--purple)" icon={RefreshIcon} />
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
             <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.1em' }}>Current Difficulty</p>
             <div style={{ ...s.diffBadge, background: DIFF_CONFIG[difficulty].bg, color: DIFF_CONFIG[difficulty].color, borderColor: DIFF_CONFIG[difficulty].color + '30', border: '1px solid' }}>
                {DIFF_CONFIG[difficulty].label.toUpperCase()}
             </div>
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={s.adaptHint}
        >
          <HugeiconsIcon icon={SparklesIcon} size={14} style={{ color: 'var(--purple)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Adaptive Engine Active</span>
          <span style={{ opacity: 0.5 }}> &middot; </span>
          <span style={{ fontSize: 12 }}>{streak >= 2 ? `Mastery streak (${streak}) detected. Scaling up difficulty.` : streak === 0 && history.length > 1 ? 'Recalibrating to build your confidence.' : 'Continuously tuning challenge level to your performance.'}</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="skeleton" style={{ height: 16, width: '15%', borderRadius: 6 }} />
              <div className="skeleton" style={{ height: 32, width: '95%', borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 32, width: '80%', borderRadius: 8 }} />
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 16 }} />)}
              </div>
            </div>
          </motion.div>
        ) : question ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={s.qCard}
            className="card-shine"
          >
            <div style={s.qMeta}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)' }} />
                <span style={s.qNum}>STAGE {qCount}</span>
              </div>
              <span style={{ ...s.diffBadge, background: DIFF_CONFIG[difficulty].bg, color: DIFF_CONFIG[difficulty].color, border: '1px solid', borderColor: DIFF_CONFIG[difficulty].color + '30' }}>
                {DIFF_CONFIG[difficulty].label.toUpperCase()}
              </span>
            </div>

            <p style={s.qText}>{question.question}</p>

            <div style={s.optionsWrap}>
              {question.options.map((opt, i) => {
                let optStyle = { ...s.option }
                const isCorrect = i === question.correctIndex
                const isSelected = i === selected
                
                if (answered) {
                  if (isCorrect) optStyle = { ...optStyle, ...s.optCorrect }
                  else if (isSelected) optStyle = { ...optStyle, ...s.optWrong }
                  else optStyle = { ...optStyle, opacity: 0.3, filter: 'grayscale(0.5)' }
                }
                return (
                  <motion.button
                    key={i}
                    whileHover={!answered ? { x: 8, backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-bright)' } : {}}
                    whileTap={!answered ? { scale: 0.99 } : {}}
                    style={optStyle}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                  >
                    <span style={{
                      ...s.optKey,
                      ...(answered && isCorrect ? { background: 'var(--teal)', color: 'oklch(0% 0 0)', borderColor: 'var(--teal)' } : {}),
                      ...(answered && isSelected && !isCorrect ? { background: 'var(--coral)', color: '#fff', borderColor: 'var(--coral)' } : {}),
                    }}>
                      {answered && isCorrect ? <HugeiconsIcon icon={Tick01Icon} size={14} /> : 
                       answered && isSelected && !isCorrect ? <HugeiconsIcon icon={Cancel01Icon} size={14} /> :
                       ['A','B','C','D'][i]}
                    </span>
                    <span style={{ fontWeight: 600 }}>{opt}</span>
                  </motion.button>
                )
              })}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    ...s.feedback,
                    background: selected === question.correctIndex ? 'oklch(75% 0.15 170 / 0.05)' : 'oklch(65% 0.18 20 / 0.05)',
                    borderColor: selected === question.correctIndex ? 'oklch(75% 0.15 170 / 0.2)' : 'oklch(65% 0.18 20 / 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ padding: 6, borderRadius: 8, background: selected === question.correctIndex ? 'var(--teal-muted)' : 'var(--coral-muted)', color: selected === question.correctIndex ? 'var(--teal)' : 'var(--coral)' }}>
                       <HugeiconsIcon icon={selected === question.correctIndex ? Tick01Icon : Cancel01Icon} size={18} />
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 800, color: selected === question.correctIndex ? 'var(--teal)' : 'var(--coral)' }}>
                      {selected === question.correctIndex ? 'Masterfully Done' : 'Room for Growth'}
                    </p>
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', paddingLeft: 46 }}>{question.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02, y: -2, boxShadow: '0 8px 24px oklch(75% 0.15 170 / 0.2)' }}
              whileTap={{ scale: 0.98 }}
              style={s.nextBtn}
              onClick={handleNext}
            >
              <span>{answered ? 'Advance to Next Stage' : 'Skip this Challenge'}</span>
              <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={s.emptyState}
          >
            <div style={s.emptyIcon}>
               <HugeiconsIcon icon={SparklesIcon} size={32} />
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }} className="text-gradient">Ready to validate your mastery?</h3>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 380, margin: '0 auto', lineHeight: 1.6 }}>
              Our adaptive engine will tailor each question to your specific performance profile.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatPill({ label, value, color, icon: Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color || 'var(--purple)' }}>
         <HugeiconsIcon icon={Icon} size={18} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: color || 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginTop: 4 }}>{label}</span>
      </div>
    </div>
  )
}

const s = {
  wrap: { paddingBottom: '3rem' },
  topBar: { display: 'flex', gap: 16, marginBottom: '2rem' },
  topicInput: {
    width: '100%', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '16px 20px 16px 50px', fontSize: 15,
    color: 'var(--text-primary)', outline: 'none',
    background: 'var(--bg-elevated)', transition: 'all 0.2s',
    fontWeight: 600, appearance: 'none',
  },
  startBtn: {
    background: 'var(--teal)', border: 'none', borderRadius: 'var(--radius-lg)',
    padding: '12px 28px', color: '#fff', fontSize: 15, fontWeight: 800,
    display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px oklch(75% 0.15 170 / 0.2)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  statsStrip: {
    background: 'oklch(20% 0.04 var(--brand-hue) / 0.4)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '1.5rem 2.5rem',
    display: 'flex', gap: 48, alignItems: 'center',
    marginBottom: '1.5rem', flexWrap: 'wrap',
  },
  diffBadge: {
    fontSize: 10, fontWeight: 900, padding: '6px 14px',
    borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-mono)',
    letterSpacing: '0.1em', display: 'inline-block',
  },
  adaptHint: {
    fontSize: 13, color: 'var(--text-secondary)',
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '12px 20px', marginBottom: '2rem',
    display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500,
  },
  errorBox: {
    background: 'var(--coral-muted)', border: '1px solid var(--coral)',
    borderRadius: 'var(--radius-md)', padding: '16px 24px', fontSize: 14, color: 'var(--coral-bright)',
    marginBottom: '1.5rem', fontWeight: 600,
  },
  qCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '3.5rem',
    boxShadow: 'var(--shadow-lg)',
  },
  qMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  qNum: { fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: '0.15em' },
  qText: { fontSize: 24, fontWeight: 800, lineHeight: 1.5, marginBottom: '2.5rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' },
  optionsWrap: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '2.5rem' },
  option: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px 24px',
    fontSize: 16, color: 'var(--text-primary)', textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: 20, transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
    cursor: 'pointer',
  },
  optCorrect: { border: '1px solid var(--teal)', background: 'oklch(75% 0.15 170 / 0.1)', color: 'var(--teal-bright)' },
  optWrong:   { border: '1px solid var(--coral)', background: 'oklch(65% 0.18 20 / 0.1)', color: 'var(--coral-bright)' },
  optKey: {
    width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 13, fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)', flexShrink: 0, fontWeight: 800, transition: 'all 0.2s',
  },
  feedback: {
    border: '1px solid', borderRadius: 'var(--radius-lg)', padding: '24px 32px',
    marginBottom: '2.5rem', overflow: 'hidden',
  },
  nextBtn: {
    width: '100%', padding: '20px', background: 'var(--teal)', border: 'none',
    borderRadius: 'var(--radius-lg)', color: '#fff', fontSize: 16, fontWeight: 800,
    boxShadow: '0 8px 32px oklch(75% 0.15 170 / 0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  emptyState: {
    textAlign: 'center', padding: '6rem 3rem',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
  },
  emptyIcon: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 72, height: 72, borderRadius: 20,
    background: 'var(--teal-muted)', color: 'var(--teal)',
    marginBottom: 28, boxShadow: '0 0 32px oklch(75% 0.15 170 / 0.1)',
  },
}
