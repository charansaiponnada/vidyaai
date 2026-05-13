import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SetupScreen from './components/SetupScreen'
import LearnTab from './components/LearnTab'
import QuizTab from './components/QuizTab'
import HeatmapTab from './components/HeatmapTab'
import TranslateTab from './components/TranslateTab'
import InsightsTab from './components/InsightsTab'
import { generateRoadmap } from './gemini'

const TABS = [
  { id: 'learn',     label: 'Learn',     icon: 'N',     desc: 'Adaptive explanations' },
  { id: 'quiz',      label: 'Quiz',      icon: 'Q',     desc: 'Adaptive difficulty' },
  { id: 'heatmap',   label: 'Heatmap',   icon: 'H',     desc: 'Knowledge gaps' },
  { id: 'translate', label: 'Translate', icon: 'T',     desc: 'Your language' },
  { id: 'insights',  label: 'Insights',  icon: 'I',     desc: 'Learning style' },
]

export default function App() {
  const [config, setConfig]           = useState(null)
  const [roadmap, setRoadmap]         = useState(null)
  const [isGenerating, setIsGen]      = useState(false)
  const [activeTab, setActiveTab]     = useState('learn')
  const [learnedTopics, setLearned]   = useState([])
  const [quizHistory, setQuizHistory] = useState([])
  const [genError, setGenError]       = useState('')
  const [isSimplifierOpen, setIsSimp] = useState(false)

  async function handleStart(cfg) {
    setIsGen(true)
    setGenError('')
    try {
      const rm = await generateRoadmap({
        apiKey: cfg.apiKey,
        context: cfg.subject,
        language: cfg.language
      })
      setRoadmap(rm)
      setConfig(cfg)
    } catch (e) {
      setGenError(e.message || 'Failed to generate roadmap. Please check your API key and try again.')
    }
    setIsGen(false)
  }

  function handleTopicLearned(topic) {
    setLearned(prev => prev.includes(topic) ? prev : [...prev, topic])
  }

  function handleQuizAnswer({ correct, topic, history }) {
    setQuizHistory(history)
    setLearned(prev => prev.includes(topic) ? prev : [...prev, topic])
  }

  if (isGenerating) {
    return (
      <div style={styles.loadingWrap}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={styles.spinnerLg}
        />
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '1.5rem', fontSize: 24, fontWeight: 700 }}
          className="text-gradient"
        >
          Creating your personalized roadmap
        </motion.h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>
          VidyaAI is analyzing your syllabus
        </p>
      </div>
    )
  }

  if (!config) return <SetupScreen onStart={handleStart} errorOverride={genError} />

  return (
    <div style={styles.app}>
      <nav style={styles.nav} className="glass-strong">
        <div style={styles.navBrand}>
          <span style={styles.brandDot} />
          <span className="text-gradient" style={{ fontWeight: 800, fontSize: 20 }}>VidyaAI</span>
        </div>
        <div style={styles.navInfo}>
          <a href="/pitch_deck.html" target="_blank" style={styles.pitchBtn}>
            Pitch Deck
          </a>
          <span style={styles.navChip}>
            {config.name}
          </span>
          <span style={styles.navChip}>
            {config.subject.length > 20 ? config.subject.substring(0, 20) + '...' : config.subject}
          </span>
          <span style={{ ...styles.navChip, color: 'var(--teal)', borderColor: 'rgba(45,212,160,0.2)' }}>
            {config.language}
          </span>
          <button style={styles.resetBtn} onClick={() => { setConfig(null); setRoadmap(null); setLearned([]); setQuizHistory([]) }}>
            Exit
          </button>
        </div>
      </nav>

      <div style={styles.tabBarWrap}>
        <div style={styles.tabBar} className="glass">
          {TABS.map(tab => (
            <button
              key={tab.id}
              style={{ ...styles.tabBtn, ...(activeTab === tab.id ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              <span style={styles.tabLabel}>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" style={styles.tabUnderline} />
              )}
            </button>
          ))}
        </div>
      </div>

      <main style={styles.main}>
        <div style={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'learn' && (
                <LearnTab
                  config={config}
                  roadmap={roadmap}
                  quizHistory={quizHistory}
                  onTopicLearned={handleTopicLearned}
                />
              )}
              {activeTab === 'quiz' && (
                <QuizTab
                  config={config}
                  roadmap={roadmap}
                  learnedTopics={learnedTopics}
                  onAnswer={handleQuizAnswer}
                />
              )}
              {activeTab === 'heatmap' && (
                <HeatmapTab
                  learnedTopics={learnedTopics}
                  quizHistory={quizHistory}
                />
              )}
              {activeTab === 'translate' && (
                <TranslateTab config={config} />
              )}
              {activeTab === 'insights' && (
                <InsightsTab
                  config={config}
                  quizHistory={quizHistory}
                  learnedTopics={learnedTopics}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {config && (
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(124,110,247,0.35)' }}
          whileTap={{ scale: 0.95 }}
          style={styles.floatingBtn}
          onClick={() => setIsSimp(!isSimplifierOpen)}
          title="Quick Translation & Simplification"
        >
          <span style={styles.floatingBtnIcon}>T</span>
          <span style={styles.floatingBtnText}>Simplify</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isSimplifierOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setIsSimp(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={styles.modalContent}
              onClick={e => e.stopPropagation()}
              className="glass-strong"
            >
              <div style={styles.modalHeader}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Quick Simplify</h3>
                <button style={styles.closeBtn} onClick={() => setIsSimp(false)} aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div style={{ padding: '2rem', maxHeight: '80vh', overflow: 'auto' }}>
                <TranslateTab config={config} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const styles = {
  app: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' },
  loadingWrap: {
    height: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: 'var(--bg)',
    textAlign: 'center', padding: '2rem',
  },
  spinnerLg: {
    width: 56, height: 56, border: '3px solid var(--border)',
    borderTopColor: 'var(--purple)', borderRadius: '50%',
  },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.75rem 2rem',
    position: 'sticky', top: 0, zIndex: 100,
  },
  navBrand: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  brandDot: {
    width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)',
    display: 'inline-block',
    boxShadow: '0 0 12px var(--teal)',
  },
  navInfo: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  navChip: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    padding: '5px 14px', borderRadius: 'var(--radius-full)',
    fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500,
  },
  pitchBtn: {
    background: 'var(--purple-muted)', border: '1px solid var(--border-accent)',
    padding: '5px 14px', borderRadius: 'var(--radius-full)',
    fontSize: 12, color: 'var(--purple-bright)',
    textDecoration: 'none', fontWeight: 600,
  },
  resetBtn: {
    background: 'transparent', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '5px 14px', fontSize: 12,
    color: 'var(--text-muted)', fontWeight: 500,
  },
  tabBarWrap: {
    display: 'flex', justifyContent: 'center',
    padding: '1rem 2rem 0',
  },
  tabBar: {
    display: 'flex', gap: 2, padding: 4,
    borderRadius: 'var(--radius-full)',
  },
  tabBtn: {
    padding: '8px 18px', border: 'none', background: 'transparent',
    fontSize: 13, color: 'var(--text-secondary)', position: 'relative',
    transition: 'color 0.2s, background 0.2s', whiteSpace: 'nowrap',
    fontWeight: 500, borderRadius: 'var(--radius-full)',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  tabBtnActive: {
    color: 'var(--purple-bright)', background: 'var(--purple-muted)',
    fontWeight: 600,
  },
  tabIcon: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 22, height: 22, borderRadius: 6,
    fontSize: 11, fontWeight: 800,
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  },
  tabLabel: {},
  tabUnderline: {
    position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
    width: 16, height: 2, background: 'var(--purple)',
    borderRadius: 2,
  },
  main: { flex: 1, overflow: 'auto' },
  content: { maxWidth: 1040, margin: '0 auto', padding: '2rem 2rem 4rem' },
  floatingBtn: {
    position: 'fixed', bottom: 36, right: 36,
    background: 'var(--purple)', color: '#fff', border: 'none',
    borderRadius: 'var(--radius-full)', padding: '12px 24px',
    display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: '0 8px 32px rgba(124,110,247,0.3)',
    cursor: 'pointer', zIndex: 1000,
  },
  floatingBtnIcon: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 24, height: 24, borderRadius: 6,
    background: 'rgba(255,255,255,0.15)',
    fontSize: 12, fontWeight: 800,
  },
  floatingBtnText: { fontSize: 14, fontWeight: 700 },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: '1.5rem',
  },
  modalContent: {
    borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 850,
    boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
    border: '1px solid var(--border-bright)',
  },
  modalHeader: {
    padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(255,255,255,0.02)',
  },
  closeBtn: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer',
    borderRadius: 'var(--radius-sm)', padding: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.2s, background 0.2s',
  },
}
