# VidyaAI 🧠🌐

> **Adaptive AI Tutor — Learn anything, in your language**

Built at **ElevateX Hackathon 2026** | Track: Education & Learning + Social Impact

[![Made with React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Powered by Gemini](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-orange)](https://aistudio.google.com)
[![Vite](https://img.shields.io/badge/Build-Vite%205-purple)](https://vitejs.dev)

---

## What is VidyaAI?

VidyaAI is a browser-based AI tutoring platform that solves two problems at once:

1. **Language barrier** — 60% of Indian students struggle with English-only content
2. **One-size-fits-all teaching** — No personalized, adaptive feedback at scale

VidyaAI gives every student a personal AI tutor that speaks their language and adapts to their level.

---

## Features

| Feature | Description |
|---|---|
| 🧠 **Adaptive Explanation** | Explains any topic in your style (examples/story/steps) and difficulty |
| 🎯 **Adaptive Quiz** | MCQs that auto-scale difficulty based on your performance |
| 📊 **Knowledge Heatmap** | Visual radar chart showing strong/weak topics |
| 🌐 **Translate & Simplify** | Converts any English text to Telugu/Hindi/Tamil, simplified |
| ✨ **Learning Insights** | AI-generated personalized feedback in your language |

---

## Tech Stack

- **React 18** + **Vite 5** — Frontend
- **Google Gemini 2.0 Flash** — AI engine (all 5 features)
- **Recharts** — Radar chart visualization
- **Sora + JetBrains Mono** — Typography

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/charansaiponnada/vidyaai.git
cd vidyaai

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev

# 4. Open http://localhost:5173
# Enter your Gemini API key on the setup screen
```

**Get a free Gemini API key:** https://aistudio.google.com/apikey

---

## Project Structure

```
src/
├── App.jsx              # Root component, shared state
├── gemini.js            # All Gemini API functions
├── index.css            # Global styles + CSS variables
├── main.jsx             # Entry point
└── components/
    ├── SetupScreen.jsx  # Onboarding
    ├── LearnTab.jsx     # Adaptive explanations
    ├── QuizTab.jsx      # Adaptive quiz engine
    ├── HeatmapTab.jsx   # Knowledge gap visualization
    ├── TranslateTab.jsx # Language translation
    └── InsightsTab.jsx  # AI learning insights
```

---

## Supported Languages

- English
- Telugu (తెలుగు)
- Hindi (हिंदी)
- Tamil (தமிழ்)

---

## Deploy

```bash
npm run build
# Deploy the dist/ folder to Vercel or Netlify
```

---

## Problem Statement

> "Students from rural and regional backgrounds face difficulty learning effectively because educational content is only available in English and there is no personalized, adaptive feedback — leading to poor comprehension, low engagement, and unequal access to quality education."

---

## Built by

Team VidyaAI — ElevateX 2026, Codegnan Hub
*Learn • Share • Uplift*
