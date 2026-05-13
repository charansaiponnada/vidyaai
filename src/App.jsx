import { useState } from 'react'
import SetupScreen from './components/SetupScreen'
import LearnTab from './components/LearnTab'
import QuizTab from './components/QuizTab'
import HeatmapTab from './components/HeatmapTab'
import TranslateTab from './components/TranslateTab'
import InsightsTab from './components/InsightsTab'
import { generateRoadmap } from './gemini'

const TABS = [
  { id: 'learn',     label: '🧠 Learn',     desc: 'Adaptive explanations' },
  { id: 'quiz',      label: '🎯 Quiz',      desc: 'Adaptive difficulty' },
  { id: 'heatmap',   label: '📊 Heatmap',   desc: 'Knowledge gaps' },
  { id: 'translate', label: '🌐 Translate', desc: 'Your language' },
  { id: 'insights',  label: '✨ Insights',  desc: 'Learning style' },
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
    // Also mark topic as learned
    setLearned(prev => prev.includes(topic) ? prev : [...prev, topic])
  }

  if (isGenerating) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinnerLg} />
        <h2 style={{ marginTop: '1.5rem', fontSize: 20 }}>Creating your personalized roadmap...</h2>
        <p style={{ color: 'var(--text2)', marginTop: 8 }}>VidyaAI is analyzing your syllabus</p>
      </div>
    )
  }

  if (!config) return <SetupScreen onStart={handleStart} errorOverride={genError} />

  return (
    <div style={styles.app}>
      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <span style={styles.brandDot} />
          Vidya<span style={{ color: 'var(--purple2)' }}>AI</span>
        </div>
        <div style={styles.navInfo}>
          <a href="/pitch_deck.html" target="_blank" style={styles.pitchBtn}>
            📽️ Pitch Deck
          </a>
          <span style={styles.navChip}>
            👤 {config.name}
          </span>
          <span style={styles.navChip}>
            📚 {config.subject.length > 20 ? config.subject.substring(0, 20) + '...' : config.subject}
          </span>
          <span style={{ ...styles.navChip, color: 'var(--teal)', borderColor: 'rgba(45,212,160,0.3)' }}>
            🌐 {config.language}
          </span>
          <button style={styles.resetBtn} onClick={() => { setConfig(null); setRoadmap(null); setLearned([]); setQuizHistory([]) }}>
            ← Exit
          </button>
        </div>
      </nav>

      {/* Tab bar */}
      <div style={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            style={{ ...styles.tabBtn, ...(activeTab === tab.id ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && <span style={styles.tabUnderline} />}
          </button>
        ))}
      </div>

      {/* Content area */}
      <main style={styles.main}>
        <div style={styles.content}>
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
        </div>
      </main>

      {/* Floating Simplifier Button */}
      {config && (
        <button 
          style={styles.floatingBtn} 
          onClick={() => setIsSimp(!isSimplifierOpen)}
          title="Quick Translation & Simplification"
        >
          <span style={{ fontSize: 20 }}>🌐</span>
          <span style={styles.floatingBtnText}>Simplify</span>
        </button>
      )}

      {/* Simplifier Modal */}
      {isSimplifierOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsSimp(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: 16 }}>Quick Simplify</h3>
              <button style={styles.closeBtn} onClick={() => setIsSimp(false)}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '80vh', overflow: 'auto' }}>
              <TranslateTab config={config} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  app: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  loadingWrap: {
    height: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: 'var(--bg)',
    textAlign: 'center', padding: '2rem',
  },
  spinnerLg: {
    width: 48, height: 48, border: '4px solid var(--border)',
    borderTopColor: 'var(--purple)', borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.875rem 2rem', background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  navBrand: {
    fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
  },
  brandDot: {
    width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)',
    animation: 'pulse 2s infinite', display: 'inline-block',
  },
  navInfo: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  navChip: {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    padding: '4px 12px', borderRadius: 20,
    fontSize: 12, color: 'var(--text2)',
  },
  pitchBtn: {
    background: 'var(--bg3)', border: '1px solid var(--purple)',
    padding: '4px 12px', borderRadius: 20,
    fontSize: 12, color: 'var(--purple2)',
    textDecoration: 'none', marginRight: 8,
    display: 'flex', alignItems: 'center', gap: 4,
  },
  resetBtn: {
    background: 'transparent', border: '1px solid var(--border)',
    borderRadius: 8, padding: '4px 12px', fontSize: 12, color: 'var(--text3)',
  },
  tabBar: {
    display: 'flex', gap: 2, padding: '0 2rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)', overflowX: 'auto',
  },
  tabBtn: {
    padding: '12px 18px', border: 'none', background: 'transparent',
    fontSize: 13, color: 'var(--text2)', position: 'relative',
    borderBottom: '2px solid transparent', marginBottom: -1,
    transition: 'color 0.15s', whiteSpace: 'nowrap',
  },
  tabBtnActive: { color: 'var(--purple2)', borderBottomColor: 'var(--purple)', fontWeight: 600 },
  tabUnderline: {},
  main: { flex: 1, overflow: 'auto' },
  content: { maxWidth: 900, margin: '0 auto', padding: '2rem' },
  floatingBtn: {
    position: 'fixed', bottom: 32, right: 32,
    background: 'var(--purple)', color: '#fff', border: 'none',
    borderRadius: 50, padding: '12px 24px',
    display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: '0 8px 32px rgba(124,110,247,0.3)',
    cursor: 'pointer', zIndex: 1000,
    transition: 'transform 0.2s',
  },
  floatingBtnText: { fontSize: 14, fontWeight: 600 },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: '1rem',
  },
  modalContent: {
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 800,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
  },
  modalHeader: {
    padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--bg2)',
  },
  closeBtn: {
    background: 'transparent', border: 'none', color: 'var(--text3)',
    fontSize: 18, cursor: 'pointer',
  },
}
