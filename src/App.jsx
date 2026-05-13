import { useState } from 'react'
import SetupScreen from './components/SetupScreen'
import LearnTab from './components/LearnTab'
import QuizTab from './components/QuizTab'
import HeatmapTab from './components/HeatmapTab'
import TranslateTab from './components/TranslateTab'
import InsightsTab from './components/InsightsTab'

const TABS = [
  { id: 'learn',     label: '🧠 Learn',     desc: 'Adaptive explanations' },
  { id: 'quiz',      label: '🎯 Quiz',      desc: 'Adaptive difficulty' },
  { id: 'heatmap',   label: '📊 Heatmap',   desc: 'Knowledge gaps' },
  { id: 'translate', label: '🌐 Translate', desc: 'Your language' },
  { id: 'insights',  label: '✨ Insights',  desc: 'Learning style' },
]

export default function App() {
  const [config, setConfig]           = useState(null)
  const [activeTab, setActiveTab]     = useState('learn')
  const [learnedTopics, setLearned]   = useState([])
  const [quizHistory, setQuizHistory] = useState([])

  function handleStart(cfg) {
    setConfig(cfg)
  }

  function handleTopicLearned(topic) {
    setLearned(prev => prev.includes(topic) ? prev : [...prev, topic])
  }

  function handleQuizAnswer({ correct, topic, history }) {
    setQuizHistory(history)
    // Also mark topic as learned
    setLearned(prev => prev.includes(topic) ? prev : [...prev, topic])
  }

  if (!config) return <SetupScreen onStart={handleStart} />

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
            📚 {config.subject}
          </span>
          <span style={{ ...styles.navChip, color: 'var(--teal)', borderColor: 'rgba(45,212,160,0.3)' }}>
            🌐 {config.language}
          </span>
          <button style={styles.resetBtn} onClick={() => { setConfig(null); setLearned([]); setQuizHistory([]) }}>
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
              onTopicLearned={handleTopicLearned}
            />
          )}
          {activeTab === 'quiz' && (
            <QuizTab
              config={config}
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
    </div>
  )
}

const styles = {
  app: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
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
}
