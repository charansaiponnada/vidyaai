import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { 
  Sun01Icon, 
  Moon01Icon,
  BookOpen01Icon,
  SparklesIcon,
  Analytics01Icon,
  TranslationIcon,
  Idea01Icon,
  ZapIcon,
  Cancel01Icon
} from '@hugeicons/core-free-icons'
import SetupScreen from './components/SetupScreen'
import LearnTab from './components/LearnTab'
import QuizTab from './components/QuizTab'
import HeatmapTab from './components/HeatmapTab'
import TranslateTab from './components/TranslateTab'
import InsightsTab from './components/InsightsTab'
import { generateRoadmap } from './gemini'

const TABS = [
  { id: 'learn',     label: 'Learn',     icon: BookOpen01Icon,  desc: 'Adaptive explanations' },
  { id: 'quiz',      label: 'Quiz',      icon: Idea01Icon,      desc: 'Adaptive difficulty' },
  { id: 'heatmap',   label: 'Heatmap',   icon: Analytics01Icon, desc: 'Knowledge gaps' },
  { id: 'translate', label: 'Translate', icon: TranslationIcon,  desc: 'Your language' },
  { id: 'insights',  label: 'Insights',  icon: SparklesIcon,   desc: 'Learning style' },
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
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

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
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={styles.spinnerLg}
        />
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '2rem', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}
          className="text-gradient"
        >
          Building your journey...
        </motion.h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 16, maxWidth: '40ch' }}>
          VidyaAI is analyzing the syllabus to create an adaptive learning roadmap.
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
          <span className="text-gradient" style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em' }}>VidyaAI</span>
        </div>
        <div style={styles.navInfo}>
          <a href="/pitch_deck.html" target="_blank" style={styles.pitchBtn}>
            <HugeiconsIcon icon={ZapIcon} size={14} /> Pitch Deck
          </a>
          <div style={styles.navChipGroup}>
            <span style={styles.navChip}>
              {config.name}
            </span>
            <span style={styles.navChip}>
              {config.subject.length > 24 ? config.subject.substring(0, 24) + '...' : config.subject}
            </span>
            <span style={{ ...styles.navChip, color: 'var(--teal)', background: 'oklch(75% 0.15 170 / 0.1)', borderColor: 'oklch(75% 0.15 170 / 0.2)' }}>
              {config.language}
            </span>
          </div>
          
          <button
            style={styles.themeToggle}
            onClick={() => {
              setIsDark(d => {
                const next = !d
                document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
                return next
              })
            }}
          >
            <HugeiconsIcon icon={isDark ? Sun01Icon : Moon01Icon} size={18} />
          </button>
          
          <button style={styles.resetBtn} onClick={() => { if(confirm('Exit learning session?')) { setConfig(null); setRoadmap(null); setLearned([]); setQuizHistory([]) } }}>
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
              <HugeiconsIcon icon={tab.icon} size={18} style={activeTab === tab.id ? { color: 'var(--teal)' } : {}} />
              <span style={styles.tabLabel}>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" style={styles.tabUnderline} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
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
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          style={styles.floatingBtn}
          onClick={() => setIsSimp(!isSimplifierOpen)}
        >
          <HugeiconsIcon icon={TranslationIcon} size={20} />
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
              initial={{ scale: 0.94, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={styles.modalContent}
              onClick={e => e.stopPropagation()}
              className="glass-strong"
            >
              <div style={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ padding: 8, background: 'var(--teal-muted)', borderRadius: 8, color: 'var(--teal)' }}>
                     <HugeiconsIcon icon={TranslationIcon} size={20} />
                   </div>
                   <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Quick Simplify</h3>
                </div>
                <button style={styles.closeBtn} onClick={() => setIsSimp(false)}>
                  <HugeiconsIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>
              <div style={{ padding: '2.5rem', maxHeight: '80vh', overflow: 'auto' }}>
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
    width: 64, height: 64, border: '4px solid var(--border)',
    borderTopColor: 'var(--teal)', borderRadius: '50%',
  },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2.5rem',
    position: 'sticky', top: 0, zIndex: 100,
    borderBottom: '1px solid var(--border)',
  },
  navBrand: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  brandDot: {
    width: 10, height: 10, borderRadius: '50%', background: 'var(--teal)',
    boxShadow: '0 0 16px var(--teal)',
  },
  navInfo: { display: 'flex', gap: 16, alignItems: 'center' },
  navChipGroup: { display: 'flex', gap: 8, alignItems: 'center' },
  navChip: {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    padding: '6px 16px', borderRadius: 'var(--radius-full)',
    fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600,
    fontFamily: 'var(--font-mono)',
  },
  pitchBtn: {
    background: 'oklch(65% 0.2 270 / 0.1)', border: '1px solid oklch(65% 0.2 270 / 0.2)',
    padding: '6px 16px', borderRadius: 'var(--radius-full)',
    fontSize: 12, color: 'var(--purple)',
    textDecoration: 'none', fontWeight: 700,
    display: 'flex', alignItems: 'center', gap: 8,
    transition: 'all 0.2s',
  },
  themeToggle: {
    width: 38, height: 38, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', transition: 'all 0.2s',
  },
  resetBtn: {
    background: 'transparent', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '6px 16px', fontSize: 12,
    color: 'var(--text-muted)', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  tabBarWrap: {
    display: 'flex', justifyContent: 'center',
    padding: '1.5rem 2rem 0',
  },
  tabBar: {
    display: 'flex', gap: 4, padding: 6,
    borderRadius: 'var(--radius-full)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
  },
  tabBtn: {
    padding: '10px 22px', border: 'none', background: 'transparent',
    fontSize: 14, color: 'var(--text-secondary)', position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)', whiteSpace: 'nowrap',
    fontWeight: 600, borderRadius: 'var(--radius-full)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  tabBtnActive: {
    color: 'var(--text-primary)',
    background: 'var(--bg-elevated)',
    boxShadow: 'var(--shadow-sm)',
  },
  tabLabel: {},
  tabUnderline: {
    position: 'absolute', bottom: 6, left: '20%', right: '20%',
    height: 2, background: 'var(--teal)',
    borderRadius: 2,
    opacity: 0.8,
  },
  main: { flex: 1, overflow: 'auto' },
  content: { maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2.5rem 6rem' },
  floatingBtn: {
    position: 'fixed', bottom: 40, right: 40,
    background: 'var(--teal)', color: '#fff', border: 'none',
    borderRadius: 'var(--radius-full)', padding: '14px 28px',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 12px 40px oklch(75% 0.15 170 / 0.4)',
    cursor: 'pointer', zIndex: 1000,
  },
  floatingBtnText: { fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'oklch(0% 0 0 / 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: '2rem',
  },
  modalContent: {
    borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 900,
    boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
    border: '1px solid var(--border-bright)',
    background: 'var(--bg-card)',
  },
  modalHeader: {
    padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'oklch(100% 0 0 / 0.03)',
  },
  closeBtn: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    color: 'var(--text-muted)', cursor: 'pointer',
    borderRadius: 'var(--radius-sm)', padding: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  },
}
